import os
import json

brain_dir = "/Users/thiennq/.gemini/antigravity-ide/brain"
target_workspace = "/Users/thiennq/workspace/personal/farm"

count = 0
matching_convs = []

for item in os.listdir(brain_dir):
    item_path = os.path.join(brain_dir, item)
    if os.path.isdir(item_path):
        transcript_path = os.path.join(item_path, ".system_generated", "logs", "transcript.jsonl")
        if os.path.exists(transcript_path):
            # Check if target_workspace is mentioned in this file
            try:
                with open(transcript_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if target_workspace in line:
                            count += 1
                            matching_convs.append(item)
                            break
            except Exception as e:
                pass

print(f"Total matching conversations: {count}")
print("Matching conversation IDs:", matching_convs)
