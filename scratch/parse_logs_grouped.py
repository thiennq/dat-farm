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

output_file = "/Users/thiennq/workspace/personal/farm/chatlog.md"

def extract_user_request(content):
    if not content:
        return ""
    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return content.strip()

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("# Chat Logs of Farm Project\n\n")
    
    for cid in ids:
        p = os.path.join(brain_dir, cid, '.system_generated', 'logs', 'transcript.jsonl')
        if not os.path.exists(p):
            continue
            
        with open(p, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    step = json.loads(line)
                    source = step.get("source")
                    step_type = step.get("type")
                    content = step.get("content", "")
                    
                    if source == "USER_EXPLICIT" or step_type == "USER_INPUT":
                        clean_req = extract_user_request(content)
                        if clean_req:
                            out.write(f"### 👤 User\n\n```\n{clean_req}\n```\n\n")
                    elif source == "MODEL" and step_type == "PLANNER_RESPONSE":
                        if content and content.strip():
                            out.write(f"### 🤖 Antigravity\n\n{content.strip()}\n\n")
                except Exception as e:
                    pass

print("Finished grouping chatlogs into chatlog.md")
