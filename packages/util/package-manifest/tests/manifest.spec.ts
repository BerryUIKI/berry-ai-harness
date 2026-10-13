import { describe, expect, it } from 'vitest'
import { getHarnessManifest } from '../src/index.ts'

describe('package manifest reader', () => {
  it('returns undefined for non-object or null input', () => {
    expect(getHarnessManifest(null)).toBeUndefined()
    expect(getHarnessManifest(undefined)).toBeUndefined()
  })

  it('prioritizes berry declarations over legacy dsh declarations', () => {
    const manifest = {
      name: '@example/pkg',
      version: '1.0.0',
      berry: {
        bundle: { patch: './berry.patch.yml' },
      },
      dsh: {
        bundle: { patch: './legacy.patch.yml' },
      },
    }
    const resolved = getHarnessManifest(manifest)
    expect(resolved).toEqual({
      bundle: { patch: './berry.patch.yml' },
    })
  })

  it('falls back to dsh declarations when berry is absent', () => {
    const manifest = {
      name: '@example/pkg',
      version: '1.0.0',
      dsh: {
        bundle: { patch: './legacy.patch.yml' },
      },
    }
    const resolved = getHarnessManifest(manifest)
    expect(resolved).toEqual({
      bundle: { patch: './legacy.patch.yml' },
    })
  })

  it('returns undefined when neither berry nor dsh is present', () => {
    const manifest = {
      name: '@example/pkg',
      version: '1.0.0',
    }
    expect(getHarnessManifest(manifest)).toBeUndefined()
  })
})
