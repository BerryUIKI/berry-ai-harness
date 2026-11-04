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
  '@berry-ai/harness-client-locale': ['@berry-ai/harness-api-remotes'],
  '@berry-ai/harness-client-ui-conversation': [
    '@berry-ai/harness-api-remotes',
    '@berry-ai/harness-client-ui-workspace',
  ],
  '@berry-ai/harness-client-ui-model-selection': ['@berry-ai/harness-client-ui-input-trigger'],
  '@berry-ai/harness-client-ui-sidebar': ['@berry-ai/harness-client-ui-workspace'],
  '@berry-ai/harness-client-ui-subagent': ['@berry-ai/harness-client-ui-input-trigger'],
  '@berry-ai/harness-client-ui-theme': ['@berry-ai/harness-api-remotes'],
  '@berry-ai/harness-client-ui-tool': ['@berry-ai/harness-api-remotes'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Workspace packages whose complete runtime surface is safe across duplicate installations. */
const DUPLICATE_SAFE_PACKAGES: readonly string[] = [
  '@berry-ai/harness-brand',
  '@berry-ai/harness-lazy-require',
  '@berry-ai/harness-typert-protocol',
  '@berry-ai/harness-util-code-language',
  '@berry-ai/harness-util-crypto',
  '@berry-ai/harness-util-values',
]

/**
 * Runtime exports whose values remain valid when npm installs another package copy.
 * New entries are forbidden by default. Automated agents must not add an
 * exception; every addition requires explicit human review and a dedicated,
 * prominent heading in the pull request description.
 */
const SAFE_HOST_DEPENDENCY_EXPORTS = {
  '@berry-ai/harness-atomic-write': ['withFileLock', 'writeFileAtomic'],
  '@berry-ai/harness-computer-use/brand': ['ComputerUseProviderName'],
  '@berry-ai/harness-credentials': ['credentialKey'],
  '@berry-ai/harness-deque': ['Deque'],
  // The Liveshare wire codec and identity helpers are stateless functions over caller-owned values.
  '@berry-ai/harness-experimental-liveshare-protocol': [
    'LIVESHARE_CAPABILITIES', 'LIVESHARE_PROTOCOL_VERSION', 'parseRelayFrame', 'parseShareAccessState',
    'parseTunnelWorkerCommand', 'parseTunnelWorkerEvent', 'rawText', 'sendFrame', 'unsupportedFrameRefusal',
    'viewerRequestFields', 'identityFromKey', 'identityKeyOf',
  ],
  '@berry-ai/harness-llm': ['callConfigEquals'],
  '@berry-ai/harness-session': ['SessionId'],
  '@berry-ai/harness-session-format': ['sessionFormatLogFilename'],
  '@berry-ai/harness-storage-domain': ['defineDomain'],
  '@berry-ai/harness-timeout': ['MAX_TIMER_DELAY_MS'],
  '@deepseek-ai/schemastery': ['default'],
} as const satisfies HostDependencyExports

/** Runtime exports that require every consumer to resolve the provider's shared peer instance. */
const PEER_REQUIRED_HOST_EXPORTS = {
  // Profile settings must match the installed Node provider's configuration schema.
  '@berry-ai/harness-ptc-runtime-node/configuration': ['resolvePersistentExecution'],
  // CUA checks UserQuestionError and preserves AttachmentError from image admission.
  '@berry-ai/harness-attachment': ['admitEncodedImages'],
  '@berry-ai/harness-user-questions': ['UserQuestionError'],
  // `instanceof` checks need the translator's own class instance.
  '@berry-ai/harness-experimental-translator': ['TranslationError'],
  // Stateless; a safe classification would turn the forge panel's forge and worktree peers into dependencies.
  '@berry-ai/harness-experimental-forge': ['changeRequestKey'],
  '@berry-ai/harness-experimental-worktree': ['generatedWorktreeName'],
  // The forge panel matches ctx.fs failures with `instanceof FsError`.
  '@berry-ai/harness-fs': ['FsError'],
  '@berry-ai/harness-scope': ['carrierKeyOf', 'createScope', 'scopeOf', 'scopeTarget'],
  // appendPluginRecord writes through the Session class's private log; pluginRecordOf is stateless.
  '@berry-ai/harness-session': ['SESSION_FORMAT_VERSION', 'appendPluginRecord', 'pluginRecordOf'],
  '@berry-ai/harness-session-persistence': ['SessionPersistenceNotFoundError'],
  // Readers recognize a deadline's TimeoutReason only by `instanceof` against their own copy.
  '@berry-ai/harness-timeout': ['deadline'],
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
