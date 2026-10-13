"""Backward compatibility package forwarding deepseek_harness to berry_ai_harness."""
import sys
from berry_ai_harness import *
from berry_ai_harness import __all__

# Also register deepseek_harness.errors, deepseek_harness.models, deepseek_harness.office, deepseek_harness.client, deepseek_harness.api
import berry_ai_harness.errors as errors
import berry_ai_harness.models as models
import berry_ai_harness.office as office
import berry_ai_harness.client as client
import berry_ai_harness.api as api

sys.modules["deepseek_harness.errors"] = errors
sys.modules["deepseek_harness.models"] = models
sys.modules["deepseek_harness.office"] = office
sys.modules["deepseek_harness.client"] = client
sys.modules["deepseek_harness.api"] = api
