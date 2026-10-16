// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;
mod protocol;
mod sidecar;
mod webview_manager;

fn main() {
  tauri::Builder::default()
    .manage(webview_manager::ChildWebviewState::new())
    .invoke_handler(tauri::generate_handler![
      bridge::get_desktop_info,
      bridge::notify_backend_ready,
      webview_manager::lease_child_webview,
      webview_manager::release_child_webview
    ])
    .run(tauri::generate_context!())
    .expect("error while running Berry AI Harness Tauri application");
}
