import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkFileBranding } from '../verify-branding-integrity.ts'

describe('verify-branding-integrity', () => {
  it('detects banned electron patterns in given files', () => {
    const root = resolve(import.meta.dirname, '../..')
    const desktopPackageJson = resolve(root, 'apps/desktop/package.json')
    const violations = checkFileBranding(desktopPackageJson)
    expect(violations.length).toBeGreaterThan(0)
    expect(violations.some(v => v.pattern.includes('electron'))).toBe(true)
  })
})
