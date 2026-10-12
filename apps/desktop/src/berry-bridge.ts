/**
 * Typed bridge for Berry Desktop native shell communication.
 * Connects renderer components to Rust Tauri commands.
 *
 * @module @deepseek-ai/dsh-desktop/bridge
 */

export interface DesktopSystemInfo {
  os: string
  arch: string
  version: string
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
    berryDesktop?: {
      getDesktopInfo: () => Promise<DesktopSystemInfo>
      notifyBackendReady: (port: number) => Promise<void>
    }
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
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke<T>(command, args)
  }
  throw new Error(`Berry Desktop bridge unavailable: cannot invoke ${command} outside native shell`)
}
