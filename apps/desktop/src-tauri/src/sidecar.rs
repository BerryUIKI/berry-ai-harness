use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpListener;
use tokio::sync::{oneshot, Mutex};
use tokio_tungstenite::tungstenite::handshake::server::{Request, Response};
use tokio_tungstenite::tungstenite::Message;

use crate::protocol::{HostToShellMessage, LoopbackAuthConfig, ShellToHostCommand};

type ResponseSender = oneshot::Sender<HostToShellMessage>;

pub struct SidecarControlServer {
  auth_config: LoopbackAuthConfig,
  active_tx: Arc<Mutex<Option<tokio::sync::mpsc::Sender<Message>>>>,
  pending_requests: Arc<Mutex<HashMap<u64, ResponseSender>>>,
  request_counter: AtomicU64,
  ready_url: Arc<Mutex<Option<String>>>,
}

impl SidecarControlServer {
  /// Start the loopback WebSocket control server on an OS-assigned port.
  pub async fn bind() -> Result<(Arc<Self>, LoopbackAuthConfig), Box<dyn std::error::Error + Send + Sync>> {
    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let local_addr: SocketAddr = listener.local_addr()?;
    let token = format!("{:016x}{:016x}", rand_u64(), rand_u64());

    let auth_config = LoopbackAuthConfig {
      token: token.clone(),
      port: local_addr.port(),
    };

    let active_tx: Arc<Mutex<Option<tokio::sync::mpsc::Sender<Message>>>> = Arc::new(Mutex::new(None));
    let pending_requests: Arc<Mutex<HashMap<u64, ResponseSender>>> = Arc::new(Mutex::new(HashMap::new()));
    let ready_url = Arc::new(Mutex::new(None));

    let server = Arc::new(Self {
      auth_config: auth_config.clone(),
      active_tx: active_tx.clone(),
      pending_requests: pending_requests.clone(),
      request_counter: AtomicU64::new(1),
      ready_url: ready_url.clone(),
    });

    let server_token = token;
    let active_tx_clone = active_tx.clone();
    let pending_requests_clone = pending_requests.clone();
    let ready_url_clone = ready_url.clone();

    tokio::spawn(async move {
      while let Ok((stream, _)) = listener.accept().await {
        let token_expected = server_token.clone();
        let pending = pending_requests_clone.clone();
        let ready = ready_url_clone.clone();
        let active = active_tx_clone.clone();

        let token_authenticated = Arc::new(Mutex::new(false));
        let token_auth_check = token_authenticated.clone();

        let callback = move |req: &Request, resp: Response| -> Result<Response, tokio_tungstenite::tungstenite::http::Response<Option<String>>> {
          let uri = req.uri().to_string();
          let has_token = uri.contains(&format!("token={}", token_expected))
            || req.headers().get("x-berry-control-token").and_then(|v| v.to_str().ok()) == Some(&token_expected);

          if has_token {
            if let Ok(mut auth) = token_auth_check.try_lock() {
              *auth = true;
            }
            Ok(resp)
          } else {
            let err = tokio_tungstenite::tungstenite::http::Response::builder()
              .status(401)
              .body(Some("Unauthorized loopback connection".to_string()))
              .unwrap();
            Err(err)
          }
        };

        if let Ok(ws_stream) = tokio_tungstenite::accept_hdr_async(stream, callback).await {
          let (mut ws_tx, mut ws_rx) = ws_stream.split();
          let (conn_tx, mut conn_rx) = tokio::sync::mpsc::channel::<Message>(32);

          {
            let mut active_lock = active.lock().await;
            *active_lock = Some(conn_tx);
          }

          // Outgoing forwarding task
          tokio::spawn(async move {
            while let Some(msg) = conn_rx.recv().await {
              if ws_tx.send(msg).await.is_err() {
                break;
              }
            }
          });

          // Incoming message handling task
          let active_ref = active.clone();
          tokio::spawn(async move {
            while let Some(msg_result) = ws_rx.next().await {
              if let Ok(Message::Text(text)) = msg_result {
                if let Ok(host_msg) = serde_json::from_str::<HostToShellMessage>(&text) {
                  match &host_msg {
                    HostToShellMessage::Ready { url, .. } => {
                      let mut lock = ready.lock().await;
                      *lock = Some(url.clone());
                    }
                    HostToShellMessage::QuitInspection { request_id, .. } => {
                      let mut map = pending.lock().await;
                      if let Some(sender) = map.remove(request_id) {
                        let _ = sender.send(host_msg);
                      }
                    }
                    HostToShellMessage::UpdateTasks { request_id, .. } => {
                      let mut map = pending.lock().await;
                      if let Some(sender) = map.remove(request_id) {
                        let _ = sender.send(host_msg);
                      }
                    }
                    _ => {}
                  }
                }
              }
            }
            let mut active_lock = active_ref.lock().await;
            *active_lock = None;
          });
        }
      }
    });

    Ok((server, auth_config))
  }

  pub fn next_request_id(&self) -> u64 {
    self.request_counter.fetch_add(1, Ordering::SeqCst)
  }

  pub async fn send_command(&self, command: ShellToHostCommand) -> Result<(), String> {
    let active_lock = self.active_tx.lock().await;
    if let Some(ref tx) = *active_lock {
      let json = serde_json::to_string(&command).map_err(|e| e.to_string())?;
      tx.send(Message::Text(json.into())).await.map_err(|e| e.to_string())?;
      Ok(())
    } else {
      Err("No active sidecar control connection".to_string())
    }
  }

  pub async fn ready_url(&self) -> Option<String> {
    let lock = self.ready_url.lock().await;
    lock.clone()
  }

  pub fn auth_config(&self) -> &LoopbackAuthConfig {
    &self.auth_config
  }
}

fn rand_u64() -> u64 {
  use std::time::{SystemTime, UNIX_EPOCH};
  let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
  (nanos ^ 0x5bf03635467c41d9) as u64
}
