/**
 * Typed bridge for Berry Desktop native shell communication.
 * Connects renderer components to Rust Tauri commands.
 *
 * @module @berry-ai/harness-desktop/bridge
 */

export interface DesktopSystemInfo {
  os: string
  arch: string
  version: string
}

export interface BerryDesktopBridge {
  getDesktopInfo: () => Promise<DesktopSystemInfo>
  notifyBackendReady: (port: number) => Promise<void>
  pickDirectory: () => Promise<string | null>
  pickFile: () => Promise<string | null>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>
  leaseChildWebview: (id: string, url: string) => Promise<string>
  releaseChildWebview: (id: string) => Promise<boolean>
  getChildWebviewUrl: (id: string) => Promise<string | null>
  navigateChildWebview: (id: string, url: string) => Promise<void>
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
    __TAURI__?: {
      core?: {
        invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>
      }
    }
    berryDesktop?: BerryDesktopBridge
  }
}

/**
 * Invoke a native Berry Desktop Tauri command with graceful fallback for web mode.
 *
 * @param command - Tauri command name.
 * @param args - Arguments object.
 * @returns Command result promise.
 */
export async function invokeBerryCommand<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  if (typeof window !== 'undefined' && window.__TAURI__?.core?.invoke) {
    return window.__TAURI__.core.invoke<T>(command, args)
  }
  throw new Error(`Berry Desktop bridge unavailable: cannot invoke ${command} outside native shell`)
}

export async function getDesktopInfo(): Promise<DesktopSystemInfo> {
  return invokeBerryCommand<DesktopSystemInfo>('get_desktop_info')
}

export async function notifyBackendReady(port: number): Promise<void> {
  return invokeBerryCommand<void>('notify_backend_ready', { port })
}

export async function pickDirectory(): Promise<string | null> {
  return invokeBerryCommand<string | null>('pick_directory')
}

export async function pickFile(): Promise<string | null> {
  return invokeBerryCommand<string | null>('pick_file')
}

export async function minimizeWindow(): Promise<void> {
  return invokeBerryCommand<void>('minimize_window')
}

export async function maximizeWindow(): Promise<void> {
  return invokeBerryCommand<void>('maximize_window')
}

export async function closeWindow(): Promise<void> {
  return invokeBerryCommand<void>('close_window')
}

export async function isWindowMaximized(): Promise<boolean> {
  return invokeBerryCommand<boolean>('is_window_maximized')
}

export async function leaseChildWebview(id: string, url: string): Promise<string> {
  return invokeBerryCommand<string>('lease_child_webview', { id, url })
}

export async function releaseChildWebview(id: string): Promise<boolean> {
  return invokeBerryCommand<boolean>('release_child_webview', { id })
}

export async function getChildWebviewUrl(id: string): Promise<string | null> {
  return invokeBerryCommand<string | null>('get_child_webview_url', { id })
}

export async function navigateChildWebview(id: string, url: string): Promise<void> {
  return invokeBerryCommand<void>('navigate_child_webview', { id, url })
}

/**
 * Install the berryDesktop object on window when running inside Tauri.
 */
export function installBerryDesktopBridge(): void {
  if (typeof window === 'undefined' || !window.__TAURI__?.core?.invoke) return

  window.berryDesktop = {
    getDesktopInfo,
    notifyBackendReady,
    pickDirectory,
    pickFile,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isWindowMaximized,
    leaseChildWebview,
    releaseChildWebview,
    getChildWebviewUrl,
    navigateChildWebview,
  }
}
