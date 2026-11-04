/** Request metadata exposed to pi-ai transport-header contributors. */

import type { GenerateOptions } from '@berry-ai/harness-llm'

/** Model-hidden routing metadata from the exact prepared adapter call. */
export interface PiAiRequestHeaderContext extends Readonly<Pick<GenerateOptions<string>,
  'provider' | 'model' | 'sessionId' | 'purpose'>> {
  /** Resolved endpoint of the model selected for this call. */
  readonly baseURL: string
}
