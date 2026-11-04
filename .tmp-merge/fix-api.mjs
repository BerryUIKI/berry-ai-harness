import { readFileSync, writeFileSync } from 'node:fs'
let text = readFileSync('.tmp-merge/theirs-api.py', 'utf8')
text = text.replaceAll('DeepSeekHarnessConfig', 'BerryAIHarnessConfig')
text = text.replaceAll('"DeepSeekHarness"', '"BerryAIHarness"')
text = text.replaceAll('DeepSeekHarness', 'BerryAIHarness')
text = text.replace('local DeepSeek Harness SDK runtime', 'local Berry AI Harness SDK runtime')
text = text.replace('running DeepSeek Harness agent turns', 'running Berry AI Harness agent turns')
text = text.replace('    dsh_bin: str | None = None\n', '    dsh_bin: str | None = None\n    berry_bin: str | None = None\n')
text = text.replace('    dsh_home: str | None = None\n', '    dsh_home: str | None = None\n    berry_home: str | None = None\n')
text = text.replace('dsh_bin=self.config.dsh_bin,', 'dsh_bin=self.config.berry_bin or self.config.dsh_bin,')
text = text.replace('dsh_home=self.config.dsh_home,', 'dsh_home=self.config.berry_home or self.config.dsh_home,')
text = text.replaceAll('BerryAIHarnessBerryAIHarness', 'BerryAIHarness')
text = text.replace(/\n+$/u, '') + '\n\n\n# Backward-compatibility aliases\nBerryAIHarnessConfigAlias = BerryAIHarnessConfig\n'
text = text.replace('BerryAIHarnessConfigAlias', 'DeepSeekHarnessConfig')
text += 'DeepSeekHarness = BerryAIHarness\n'
writeFileSync('python/sdk/src/berry_ai_harness/api.py', text)
