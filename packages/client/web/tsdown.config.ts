import { staticLinked } from '../tsdown.client.ts'

export default staticLinked(
  '@berry-ai/harness-client-web',
  ['lib/types/index.js', 'lib/types/apply-injections.js'],
)
