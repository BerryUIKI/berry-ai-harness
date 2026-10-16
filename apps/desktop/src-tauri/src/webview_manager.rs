use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Default)]
pub struct ChildWebviewState {
  leases: Mutex<HashMap<String, String>>,
}

impl ChildWebviewState {
  pub fn new() -> Self {
    Self {
      leases: Mutex::new(HashMap::new()),
    }
  }

  pub fn lease_webview(&self, id: String, url: String) {
    if let Ok(mut map) = self.leases.lock() {
      map.insert(id, url);
    }
  }

  pub fn release_webview(&self, id: &str) -> Option<String> {
    if let Ok(mut map) = self.leases.lock() {
      map.remove(id)
    } else {
      None
    }
  }

  pub fn get_url(&self, id: &str) -> Option<String> {
    if let Ok(map) = self.leases.lock() {
      map.get(id).cloned()
    } else {
      None
    }
  }

  pub fn set_url(&self, id: &str, url: String) -> bool {
    if let Ok(mut map) = self.leases.lock() {
      if map.contains_key(id) {
        map.insert(id.to_string(), url);
        true
      } else {
        false
      }
    } else {
      false
    }
  }

  pub fn count(&self) -> usize {
    if let Ok(map) = self.leases.lock() {
      map.len()
    } else {
      0
    }
  }
}

#[tauri::command]
pub fn lease_child_webview(
  id: String,
  url: String,
  state: tauri::State<'_, ChildWebviewState>,
) -> Result<String, String> {
  state.lease_webview(id.clone(), url);
  log::info!("Child webview leased: {}", id);
  Ok(id)
}

#[tauri::command]
pub fn release_child_webview(
  id: String,
  state: tauri::State<'_, ChildWebviewState>,
) -> Result<bool, String> {
  let released = state.release_webview(&id).is_some();
  log::info!("Child webview released: {} (success: {})", id, released);
  Ok(released)
}

#[tauri::command]
pub fn get_child_webview_url(
  id: String,
  state: tauri::State<'_, ChildWebviewState>,
) -> Result<Option<String>, String> {
  Ok(state.get_url(&id))
}

#[tauri::command]
pub fn navigate_child_webview(
  id: String,
  url: String,
  state: tauri::State<'_, ChildWebviewState>,
) -> Result<(), String> {
  if state.set_url(&id, url) {
    Ok(())
  } else {
    Err(format!("Child webview not found: {}", id))
  }
}
