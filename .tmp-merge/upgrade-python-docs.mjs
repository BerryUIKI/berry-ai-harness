import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
const root = process.cwd()
for (const path of process.argv.slice(2)) {
  let text = execFileSync('git', ['show', `:3:${path}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  text = text
    .replaceAll('git clone https://github.com/deepseek-ai/deepseek-harness.git', 'git clone https://github.com/BerryUIKI/berry-ai-harness.git')
    .replace(/^cd deepseek-harness$/gmu, 'cd berry-ai-harness')
    .replaceAll('Set-Location deepseek-harness', 'Set-Location berry-ai-harness')
    .replaceAll('deepseek-harness-sdk', 'berry-ai-harness-sdk')
    .replaceAll('deepseek-harness-runtime-bin', 'berry-ai-harness-runtime-bin')
    .replaceAll('deepseek_harness_runtime', 'berry_ai_harness_runtime')
    .replaceAll('from deepseek_harness', 'from berry_ai_harness')
    .replaceAll('--dsh-home', '--berry-home')
    .replaceAll('example-dsh-home', 'example-berry-home')
    .replaceAll('$env:DSH_HOME', '$env:BERRY_HOME')
    .replaceAll('export DSH_HOME', 'export BERRY_HOME')
    .replaceAll('`DSH_HOME`', '`BERRY_HOME`')
    .replaceAll('$DSH_HOME', '$BERRY_HOME')
    .replaceAll('~/.dsh', '~/.berry')
    .replace(/`dsh --profile/gu, '`berry --profile')
    .replace(/`dsh plugin/gu, '`berry plugin')
    .replace(/`dsh web`/gu, '`berry web`')
    .replace(/^dsh --profile/gmu, 'berry --profile')
    .replace(/^dsh plugin/gmu, 'berry plugin')
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
  execFileSync('git', ['add', path])
  console.log('upgraded', path)
}
