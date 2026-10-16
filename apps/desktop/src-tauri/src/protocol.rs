use serde::{Deserialize, Serialize};

/// Release metadata for the Desktop Host lifecycle protocol.
pub const HOST_PROTOCOL_VERSION: u32 = 5;

/// Messages emitted from the Node sidecar to the Tauri desktop shell.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum HostToShellMessage {
  #[serde(rename = "ready")]
  Ready {
    url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    injections: Option<Vec<serde_json::Value>>,
  },
  #[serde(rename = "fatal")]
  Fatal {
    message: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    diagnostic: Option<String>,
  },
  #[serde(rename = "platform-session")]
  PlatformSession {
    session: Option<serde_json::Value>,
  },
  #[serde(rename = "shutdown-complete")]
  ShutdownComplete,
  #[serde(rename = "quit-inspection")]
  QuitInspection {
    #[serde(rename = "requestId")]
    request_id: u64,
    #[serde(rename = "activeTasks", default)]
    active_tasks: bool,
    #[serde(rename = "scheduledTasks", default)]
    scheduled_tasks: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    error: Option<String>,
  },
  #[serde(rename = "update-tasks")]
  UpdateTasks {
    #[serde(rename = "requestId")]
    request_id: u64,
    #[serde(default)]
    active: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    error: Option<String>,
  },
  #[serde(rename = "pong")]
  Pong,
}

/// Commands emitted from the Tauri desktop shell to the Node sidecar.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ShellToHostCommand {
  #[serde(rename = "shutdown")]
  Shutdown {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    reason: Option<String>,
  },
  #[serde(rename = "quit-inspection")]
  QuitInspection {
    #[serde(rename = "requestId")]
    request_id: u64,
  },
  #[serde(rename = "update-tasks")]
  UpdateTasks {
    #[serde(rename = "requestId")]
    request_id: u64,
    action: String,
  },
  #[serde(rename = "ping")]
  Ping,
}

/// Authentication and configuration details for loopback WebSocket control.
#[derive(Debug, Clone)]
pub struct LoopbackAuthConfig {
  pub token: String,
  pub port: u16,
}
