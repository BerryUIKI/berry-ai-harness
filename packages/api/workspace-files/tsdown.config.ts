import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@berry-ai/harness-api-workspace-files',
  ['lib/types/index.js'],
  { hostPhase: true },
)
