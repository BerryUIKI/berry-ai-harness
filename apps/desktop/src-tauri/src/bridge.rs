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

#[command]
pub async fn pick_directory() -> Result<Option<String>, String> {
  let folder = rfd::AsyncFileDialog::new().pick_folder().await;
  Ok(folder.map(|f| f.path().to_string_lossy().to_string()))
}

#[command]
pub async fn pick_file() -> Result<Option<String>, String> {
  let file = rfd::AsyncFileDialog::new().pick_file().await;
  Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}

#[command]
pub fn minimize_window(window: tauri::Window) -> Result<(), String> {
  window.minimize().map_err(|e| e.to_string())
}

#[command]
pub fn maximize_window(window: tauri::Window) -> Result<(), String> {
  if window.is_maximized().map_err(|e| e.to_string())? {
    window.unmaximize().map_err(|e| e.to_string())
  } else {
    window.maximize().map_err(|e| e.to_string())
  }
}

#[command]
pub fn close_window(window: tauri::Window) -> Result<(), String> {
  window.close().map_err(|e| e.to_string())
}

#[command]
pub fn is_window_maximized(window: tauri::Window) -> Result<bool, String> {
  window.is_maximized().map_err(|e| e.to_string())
}
