/** Private built entry for the persistent Node REPL. */
import { openInheritedControlChannel } from '@berry-ai/harness-subprocess/control'
import { runPersistentMain } from './persistent-process.ts'

void runPersistentMain(openInheritedControlChannel(), Number(process.argv[2]), process)
