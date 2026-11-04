/**
 * Remove Host-emitted declarations that a split package's Client leaf re-emits.
 *
 * Runs between the Host/Desktop bundles and the Client compiler, where both
 * faces write into the same `lib/types` directory. Typert declarations at the
 * package `lib/` root are untouched.
 * @module scripts/clean-shared-face-types
 */

import { resolve } from 'node:path'
import { cleanSharedFaceTypes } from './compile-referenced-projects.ts'

cleanSharedFaceTypes(resolve(import.meta.dirname, '..'))
