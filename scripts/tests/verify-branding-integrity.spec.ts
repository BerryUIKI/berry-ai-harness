import { describe, expect, it } from 'vitest'
import {
  collectViolations,
  findStaleIdentifiers,
  findUnbudgetedElectronDependencies,
  isExemptPath,
} from '../verify-branding-integrity.ts'

describe('verify-branding-integrity', () => {
  it('rejects the stale owned package scope and reports its line', () => {
    const text = [
      "import { tools } from '../../core/tools/src/index.ts'",
      "const guest = '@deepseek-ai/dsh-tools'",
      "const subpath = '@deepseek-ai/dsh/lib/bin.js'",
    ].join('\n')
    const violations = findStaleIdentifiers('packages/example/src/index.ts', text)
    expect(violations.map(violation => violation.line)).toEqual([2, 3])
    expect(violations.every(violation => violation.rule === 'stale owned package scope')).toBe(true)
  })

  it('leaves lookalike package names and the current scope alone', () => {
    const text = [
      "const other = '@deepseek-ai/dshx'",
      "const current = '@berry-ai/harness-tools'",
      "const vendored = '@deepseek-ai/cordis'",
    ].join('\n')
    expect(findStaleIdentifiers('packages/example/src/index.ts', text)).toEqual([])
  })

  it('exempts vendored, native, frozen, recorded, and fixture paths', () => {
    for (const file of [
      'vendor/cordis/src/index.ts',
      'native/system/package.json',
      '.agents/notes/archived/architecture/2026-01-01-note.md',
      'docs/upgrade-guide/v0.2.1-alpha.2/tauri-migration/guide.md',
      'snapshots/acp/cancel/session.v3.jsonl',
      'scripts/snapshots/python-sdk-single-exe/advanced/session.v3.jsonl',
      'scripts/dependency-catalog/package-lock.json',
      'docs/dependency-catalog.json',
      'scripts/gen-dependency-catalog.ts',
      'packages/session/session-format-v3-to-v4/src/sources.ts',
      'packages/example/tests/fixtures/recorded.json',
      'packages/example/tests/expected/notice.expected.md',
      'scripts/verify-branding-integrity.ts',
    ]) {
      expect(isExemptPath(file), file).toBe(true)
    }
    for (const file of ['apps/cli/src/bin.ts', 'tsconfig.base.json', 'packages/example/package.json']) {
      expect(isExemptPath(file), file).toBe(false)
    }
  })

  it('accepts the recorded Electron baseline and rejects an addition', () => {
    const baseline = JSON.stringify({
      devDependencies: { electron: '^44.7.0', 'electron-builder': '^26.17.0', tslib: '^2.9.1' },
      dependencies: { 'electron-updater': '^6.8.9', '@electron/get': '^5.1.0', '@electron/notarize': '2.5.0' },
    })
    expect(findUnbudgetedElectronDependencies(baseline)).toEqual([])
    const grown = JSON.stringify({
      devDependencies: { electron: '^44.7.0' },
      dependencies: { 'electron-store': '^10.0.0', '@electron/remote': '^2.1.0' },
    })
    expect(findUnbudgetedElectronDependencies(grown)).toEqual(['@electron/remote', 'electron-store'])
  })

  it('finds no violation in the repository', () => {
    expect(collectViolations()).toEqual([])
  })
})
