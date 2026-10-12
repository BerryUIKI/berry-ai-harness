use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopSystemInfo {
  pub os: String,
  pub arch: String,
  pub version: String,
}

#[command]
pub fn get_desktop_info() -> DesktopSystemInfo {
  DesktopSystemInfo {
    os: std::env::consts::OS.to_string(),
    arch: std::env::consts::ARCH.to_string(),
    version: env!("CARGO_PKG_VERSION").to_string(),
  }
}

#[command]
pub fn notify_backend_ready(port: u16) -> Result<(), String> {
  log::info!("Sidecar backend reported ready on port: {}", port);
  Ok(())
}
