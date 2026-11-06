import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DESKTOP_HOST_RUNTIME_FILES, DESKTOP_PACKAGES_DIR } from '../src/core-package-set.ts'
import {
  assertDesktopHostPackageFiles,
  prepareDesktopPackageSet,
  selectDesktopPackageClosure,
  type PackedDesktopPackage,
} from '../scripts/prepare-package-set.ts'

function packed(name: string, manifest: Record<string, unknown> = {}): PackedDesktopPackage {
  return { tarball: `${name}.tgz`, manifest: { name, version: '1.0.0', ...manifest } }
}

describe('desktop package-set selection', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not select a packaging target when imported as a library', async () => {
    vi.stubEnv('DSH_DESKTOP_TARGET_PLATFORM', 'linux')
    vi.stubEnv('DSH_DESKTOP_TARGET_ARCH', 'x64')
    vi.resetModules()
    await expect(import('../scripts/prepare-package-set.ts')).resolves.toHaveProperty('prepareDesktopPackageSet')
  })

  it('includes only the available internal production closure', () => {
    const available = new Map<string, PackedDesktopPackage>([
      ['@berry-ai/harness', packed('@berry-ai/harness', {
        dependencies: { '@berry-ai/harness-base': '^1.0.0', external: '^2.0.0' },
        optionalDependencies: { '@deepseek-ai/platform-package': '1.0.0', '@deepseek-ai/missing-platform': '1.0.0' },
      })],
      ['@berry-ai/harness-desktop-host', packed('@berry-ai/harness-desktop-host', {
        dependencies: { '@berry-ai/harness': '^1.0.0' },
      })],
      ['@berry-ai/harness-base', packed('@berry-ai/harness-base', {
        peerDependencies: { '@deepseek-ai/cordis': '^1.0.0' },
      })],
      ['@deepseek-ai/cordis', packed('@deepseek-ai/cordis')],
      ['@deepseek-ai/platform-package', packed('@deepseek-ai/platform-package')],
      ['@deepseek-ai/unused', packed('@deepseek-ai/unused')],
    ])
    expect(selectDesktopPackageClosure(available, { platform: 'win32', arch: 'x64' }).map(entry => entry.manifest.name)).toEqual([
      '@berry-ai/harness',
      '@berry-ai/harness-base',
      '@berry-ai/harness-desktop-host',
      '@deepseek-ai/cordis',
      '@deepseek-ai/platform-package',
    ])
  })

  it.each([
    '@berry-ai/harness-base', '@deepseek-ai/cordis', '@deepseek-ai/node-addon-system',
  ])('rejects required prepared package %s absent from the packed release inputs', (dependency) => {
    const available = new Map<string, PackedDesktopPackage>([
      ['@berry-ai/harness', packed('@berry-ai/harness', {
        dependencies: { [dependency]: '^1.0.0' },
      })],
      ['@berry-ai/harness-desktop-host', packed('@berry-ai/harness-desktop-host', {
        dependencies: { '@berry-ai/harness': '^1.0.0' },
      })],
    ])
    expect(() => selectDesktopPackageClosure(available, { platform: 'win32', arch: 'x64' })).toThrow(/unpacked package/u)
    expect(() => selectDesktopPackageClosure(new Map([
      ['@berry-ai/harness', packed('@berry-ai/harness')],
    ]), { platform: 'win32', arch: 'x64' })).toThrow(/omit @berry-ai\/harness-desktop-host/u)
  })

  it('leaves independently published Office packages to npm resolution', () => {
    const available = new Map<string, PackedDesktopPackage>([
      ['@berry-ai/harness', packed('@berry-ai/harness', {
        dependencies: {
          '@deepseek-ai/libreoffice-kit': '0.0.1',
          '@deepseek-ai/libreoffice-kit-wasm': '0.0.1',
        },
      })],
      ['@berry-ai/harness-desktop-host', packed('@berry-ai/harness-desktop-host')],
    ])
    expect(selectDesktopPackageClosure(available, { platform: 'win32', arch: 'x64' }).map(entry => entry.manifest.name)).toEqual([
      '@berry-ai/harness', '@berry-ai/harness-desktop-host',
    ])
  })

  it('requires both Desktop Host and public CLI entries', () => {
    const files = [
      'package/lib/index.js',
      'package/lib/cli.js',
    ]
    expect(() => {
      assertDesktopHostPackageFiles(files)
    }).not.toThrow()
    expect(() => {
      assertDesktopHostPackageFiles(files.slice(1))
    }).toThrow(/lib\/index\.js/u)
    expect(() => { assertDesktopHostPackageFiles(files.slice(0, 1)) }).toThrow(/lib\/cli\.js/u)
  })
})

const macProvider = '@berry-ai/harness-experimental-cua-macos'
const cuaBundle = '@berry-ai/harness-cua-bundle'
const targetManifests = () => new Map<string, PackedDesktopPackage>([
  ['@berry-ai/harness', packed('@berry-ai/harness', { dependencies: { [cuaBundle]: '1.0.0' } })],
  ['@berry-ai/harness-desktop-host', packed('@berry-ai/harness-desktop-host')],
  [cuaBundle, packed(cuaBundle, {
    optionalDependencies: { [macProvider]: '1.0.0' }, dependencies: { '@berry-ai/harness-cua': '1.0.0' },
  })],
  ['@berry-ai/harness-cua', packed('@berry-ai/harness-cua')],
  [macProvider, packed(macProvider, { os: ['darwin'] })],
])

it.each([
  ['darwin', 'arm64', true], ['darwin', 'x64', true], ['win32', 'x64', false],
] as const)('selects the CUA native tarball for target %s/%s independently of the host', (platform, arch, included) => {
  const selected = selectDesktopPackageClosure(targetManifests(), { platform, arch }).map(entry => entry.manifest.name)
  expect(selected.includes(macProvider)).toBe(included)
  expect(selected).toContain('@berry-ai/harness-cua')
  expect(selected).toContain(cuaBundle)
})

it.each([
  [{ cpu: ['arm64'] }, false], [{ os: ['!win32'] }, false], [{ os: ['!linux'] }, true],
  [{ os: [] }, true], [{ os: ['any'] }, true], [{ os: ['any', '!win32'] }, false],
  [{ cpu: ['x64'] }, true],
])('honors optional package platform constraints %j', (constraints, included) => {
  const packages = targetManifests()
  packages.set(macProvider, packed(macProvider, constraints))
  expect(selectDesktopPackageClosure(packages, { platform: 'win32', arch: 'x64' })
    .some(entry => entry.manifest.name === macProvider)).toBe(included)
})

it.each([{ os: 'darwin' }, { cpu: [42] }])('rejects malformed platform constraints %j', (constraints) => {
  const packages = targetManifests()
  packages.set(macProvider, packed(macProvider, constraints))
  expect(() => selectDesktopPackageClosure(packages, { platform: 'win32', arch: 'x64' })).toThrow(/has invalid/u)
})

it('copies no macOS tarball into the Windows package set', () => {
  const root = mkdtempSync(join(tmpdir(), 'desktop-platform-packages-'))
  onTestFinished(() => { rmSync(root, { recursive: true, force: true }) })
  const inputs = join(root, 'inputs')
  mkdirSync(inputs)
  for (const [name, entry] of targetManifests()) {
    const stem = name.replace('@berry-ai/harness', 'dsh').replace('@deepseek-ai/dsh', 'dsh')
    const folder = join(root, stem, 'package')
    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, 'package.json'), JSON.stringify(entry.manifest))
    if (name === '@berry-ai/harness-desktop-host') {
      for (const file of DESKTOP_HOST_RUNTIME_FILES) {
        mkdirSync(join(folder, file, '..'), { recursive: true })
        writeFileSync(join(folder, file), '')
      }
    }
    execFileSync('tar', ['-czf', `${stem}.tgz`, '-C', join(folder, '..'), 'package'], { cwd: inputs })
  }
  const output = join(root, 'output')
  prepareDesktopPackageSet([inputs], output, { platform: 'win32', arch: 'x64' })
  expect(readdirSync(join(output, DESKTOP_PACKAGES_DIR))).not.toContain('dsh-experimental-cua-macos.tgz')
  prepareDesktopPackageSet([inputs], output, { platform: 'darwin', arch: 'arm64' })
  expect(readFileSync(join(output, DESKTOP_PACKAGES_DIR, 'dsh-experimental-cua-macos.tgz')))
    .toEqual(readFileSync(join(inputs, 'dsh-experimental-cua-macos.tgz')))
})
