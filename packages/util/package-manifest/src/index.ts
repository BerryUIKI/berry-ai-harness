/**
 * Public package manifest, plugin display types, and compatibility reader.
 * @module @berry-ai/harness-package-manifest
 */

import type { DshManifest, DshPackageManifest } from './types.ts'

export type {
  BerryBundleManifest,
  BerryClientManifest,
  BerryEnginesManifest,
  BerryManifest,
  BerryPackageManifest,
  BerryProfileManifest,
  DshBundleManifest,
  DshClientManifest,
  DshEnginesManifest,
  DshManifest,
  DshPackageManifest,
  DshProfileManifest,
  LocalizedText,
  PluginLocalizedMeta,
} from './types.ts'

/**
 * Extract Berry or legacy DSH author declarations from a package manifest.
 * Prioritizes `manifest.berry` over `manifest.dsh`.
 * @param manifest - Raw or parsed package manifest object.
 * @returns The author declarations, or undefined when absent.
 */
export function getHarnessManifest(
  manifest: Partial<DshPackageManifest> | Record<string, unknown> | null | undefined,
): DshManifest | undefined {
  if (manifest === null || typeof manifest !== 'object') return undefined
  const berry = (manifest as { berry?: unknown }).berry
  if (typeof berry === 'object' && berry !== null) {
    return berry as DshManifest
  }
  const dsh = (manifest as { dsh?: unknown }).dsh
  if (typeof dsh === 'object' && dsh !== null) {
    return dsh as DshManifest
  }
  return undefined
}
