import { describe, expect, it } from 'vitest'
import { invokeBerryCommand } from '../src/berry-bridge.ts'

describe('berryDesktop bridge', () => {
  it('rejects gracefully when running outside native Tauri window environment', async () => {
    await expect(invokeBerryCommand('get_desktop_info')).rejects.toThrow(
      /Berry Desktop bridge unavailable: cannot invoke get_desktop_info outside native shell/,
    )
  })
})
