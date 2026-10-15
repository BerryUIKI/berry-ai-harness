import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@berry-ai/harness-api-remotes',
  ['lib/types/index.js'],
  { hostPhase: true },
)
