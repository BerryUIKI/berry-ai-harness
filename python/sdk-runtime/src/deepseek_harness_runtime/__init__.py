"""Backward compatibility package forwarding deepseek_harness_runtime to berry_ai_harness_runtime."""
import sys
import berry_ai_harness_runtime as _runtime
from berry_ai_harness_runtime import *
from berry_ai_harness_runtime import __all__

import berry_ai_harness_runtime._resources as _resources

sys.modules["deepseek_harness_runtime._resources"] = _resources

def __getattr__(name: str):
    return getattr(_runtime, name)
