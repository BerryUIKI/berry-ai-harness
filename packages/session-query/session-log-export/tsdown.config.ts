import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@berry-ai/harness-session-log-export',
  ['lib/types/index.js'],
  { hostPhase: true },
)
