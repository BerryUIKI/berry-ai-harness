"""Backward compatibility package forwarding deepseek_harness_runtime to berry_ai_harness_runtime."""
import sys
import berry_ai_harness_runtime as _runtime
from berry_ai_harness_runtime import *
from berry_ai_harness_runtime import __all__

import berry_ai_harness_runtime._resources as _resources

sys.modules["deepseek_harness_runtime._resources"] = _resources
# Alias the legacy module to the implementation it forwards to: callers that
# patch `deepseek_harness_runtime.<name>` must reach the same module object
# that `berry_ai_harness` imports.
sys.modules[__name__] = _runtime
