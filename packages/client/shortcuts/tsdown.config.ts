import { clientBundle } from '../tsdown.client.ts'

export default clientBundle(
  '@berry-ai/harness-client-shortcuts',
  ['lib/types/index.js', 'lib/types/protocol.js'],
  { hostPhase: true },
)
