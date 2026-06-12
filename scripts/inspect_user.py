import os
import json
import re

brain_dir = "/Users/thiennq/.gemini/antigravity-ide/brain"
ids = [
    "8a086da6-ea35-45db-b334-f69e6abadde0",
    "28d232d8-c35d-4b50-902a-59d37075e168",
    "146dc93a-e8a9-494b-b5a4-cdf915976d90",
    "fc3a9499-5eb3-4f6a-9e9b-a3e1ffacdaf5"
]

for cid in ids:
    p = os.path.join(brain_dir, cid, '.system_generated', 'logs', 'transcript.jsonl')
    if not os.path.exists(p):
        continue
    print("=== File:", cid)
    with open(p, 'r', encoding='utf-8') as f:
        for line in f:
            step = json.loads(line)
            if step.get("source") == "USER_EXPLICIT" or step.get("type") == "USER_INPUT":
                content = step.get("content", "")
                # Print a snippet
                print(repr(content[:200]))
