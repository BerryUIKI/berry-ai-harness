// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;
mod protocol;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      bridge::get_desktop_info,
      bridge::notify_backend_ready
    ])
    .run(tauri::generate_context!())
    .expect("error while running Berry AI Harness Tauri application");
}
