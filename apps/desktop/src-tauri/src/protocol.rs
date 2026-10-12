use serde::{Deserialize, Serialize};

pub const HOST_PROTOCOL_VERSION: u32 = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum HostMessage {
  #[serde(rename = "ready")]
  Ready {
    version: String,
    port: u16,
  },
  #[serde(rename = "shutdown")]
  Shutdown {
    reason: String,
  },
  #[serde(rename = "error")]
  FatalError {
    message: String,
  },
  #[serde(rename = "ping")]
  Ping,
  #[serde(rename = "pong")]
  Pong,
}

#[derive(Debug, Clone)]
pub struct LoopbackAuthConfig {
  pub token: String,
  pub port: u16,
}
