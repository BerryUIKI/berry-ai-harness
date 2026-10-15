/** Explicit exceptions and Host packages for the published dependency policy. */

/** Packages treated as Client/Host packages without declaring `dsh.client`. */
const CLIENT_FACE_INCLUDE: readonly string[] = []

/** Packages exempted from automatic Client/Host treatment despite declaring `dsh.client`. */
const CLIENT_FACE_EXCLUDE: readonly string[] = [
  '@berry-ai/harness-api-session-controller',
  '@berry-ai/harness-api-workspace-controller',
]

/** Host-only packages whose peer relays are deliberately flattened. */
const HOST_DEPENDENCY_PACKAGES: readonly string[] = [
  '@berry-ai/harness-llm',
  '@berry-ai/harness-session',
]

/** Required Cordis services whose Host imports are type-only. */
const REQUIRED_SERVICE_PEERS = {
  '@berry-ai/harness-api-terminal-controller': ['@berry-ai/harness-subprocess'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Development-only package relationships not represented by source imports. */
const CONFIGURATION_ONLY_DEV_DEPENDENCIES = {
  '@deepseek-ai/dsh-client-locale': ['@berry-ai/harness-api-remotes'],
  '@deepseek-ai/dsh-client-ui-conversation': [
    '@berry-ai/harness-api-remotes',
    '@deepseek-ai/dsh-client-ui-workspace',
  ],
  '@deepseek-ai/dsh-client-ui-model-selection': ['@deepseek-ai/dsh-client-ui-input-trigger'],
  '@deepseek-ai/dsh-client-ui-sidebar': ['@deepseek-ai/dsh-client-ui-workspace'],
  '@deepseek-ai/dsh-client-ui-subagent': ['@deepseek-ai/dsh-client-ui-input-trigger'],
  '@deepseek-ai/dsh-client-ui-theme': ['@berry-ai/harness-api-remotes'],
  '@deepseek-ai/dsh-client-ui-tool': ['@berry-ai/harness-api-remotes'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Workspace packages whose complete runtime surface is safe across duplicate installations. */
const DUPLICATE_SAFE_PACKAGES: readonly string[] = [
  '@berry-ai/harness-brand',
  '@berry-ai/harness-lazy-require',
  '@berry-ai/harness-util-code-language',
  '@berry-ai/harness-util-crypto',
  '@berry-ai/harness-util-values',
  '@berry-ai/harness-typert-protocol',
]

/**
 * Runtime exports whose values remain valid when npm installs another package copy.
 * New entries are forbidden by default. Automated agents must not add an
 * exception; every addition requires explicit human review and a dedicated,
 * prominent heading in the pull request description.
 */
const SAFE_HOST_DEPENDENCY_EXPORTS = {
  '@berry-ai/harness-deque': ['Deque'],
  '@berry-ai/harness-timeout': ['MAX_TIMER_DELAY_MS'],
  '@berry-ai/harness-credentials': ['credentialKey'],
  '@berry-ai/harness-llm': ['callConfigEquals'],
  '@berry-ai/harness-session-format': ['sessionFormatLogFilename'],
  '@deepseek-ai/schemastery': ['default'],
} as const satisfies HostDependencyExports

/** Runtime exports that require every consumer to resolve the provider's shared peer instance. */
const PEER_REQUIRED_HOST_EXPORTS = {
  '@deepseek-ai/dsh-client-connection': ['OperatorPeer'],
  '@berry-ai/harness-scope': ['carrierKeyOf', 'createScope', 'scopeOf', 'scopeTarget'],
  '@berry-ai/harness-session': ['SESSION_FORMAT_VERSION'],
  '@berry-ai/harness-session-persistence': ['SessionPersistenceNotFoundError'],
} as const satisfies HostDependencyExports

/** Exact import specifier to reviewed runtime exports. */
type HostDependencyExports = Readonly<Record<string, readonly string[]>>

/** Complete configurable input to package dependency classification. */
export interface PackageDependencyPolicy {
  readonly clientFaceInclude: readonly string[]
  readonly clientFaceExclude: readonly string[]
  readonly hostPackages: readonly string[]
  readonly requiredServicePeers?: Readonly<Record<string, readonly string[]>>
  readonly configurationOnlyDevDependencies: Readonly<Record<string, readonly string[]>>
  readonly duplicateSafePackages?: readonly string[]
  readonly safeHostDependencyExports: HostDependencyExports
  readonly peerRequiredHostExports: HostDependencyExports
}

/** Repository dependency policy consumed by verification and benchmarking. */
export const PACKAGE_DEPENDENCY_POLICY: PackageDependencyPolicy = {
  clientFaceInclude: CLIENT_FACE_INCLUDE,
  clientFaceExclude: CLIENT_FACE_EXCLUDE,
  hostPackages: HOST_DEPENDENCY_PACKAGES,
  requiredServicePeers: REQUIRED_SERVICE_PEERS,
  configurationOnlyDevDependencies: CONFIGURATION_ONLY_DEV_DEPENDENCIES,
  duplicateSafePackages: DUPLICATE_SAFE_PACKAGES,
  safeHostDependencyExports: SAFE_HOST_DEPENDENCY_EXPORTS,
  peerRequiredHostExports: PEER_REQUIRED_HOST_EXPORTS,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Whether a package manifest declares a dynamically loaded Client entry. */
export function hasClientDeclaration(dshField: unknown): boolean {
  return isRecord(dshField) && Object.hasOwn(dshField, 'client')
}

/** Whether the repository policy flattens one package's non-Cordis peers. */
export function usesFlattenedPackageDependencies(
  manifestPath: string,
  packageName: string,
  dshField: unknown,
  policy: PackageDependencyPolicy = PACKAGE_DEPENDENCY_POLICY,
): boolean {
  if (!manifestPath.startsWith('packages/') || manifestPath.startsWith('packages/experimental/')) return false
  if (policy.hostPackages.includes(packageName)) return true
  if (manifestPath.startsWith('packages/client/')) return true
  const included = hasClientDeclaration(dshField) || policy.clientFaceInclude.includes(packageName)
  return included && !policy.clientFaceExclude.includes(packageName)
}
