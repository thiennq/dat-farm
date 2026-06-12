import os
import json
import re

brain_dir = "/Users/thiennq/.gemini/antigravity-ide/brain"
target_workspace = "/Users/thiennq/workspace/personal/farm"
output_files = [
    "/Users/thiennq/workspace/personal/farm/chatlog.md",
    "/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md"
]

def extract_user_request(content):
    if not content:
        return None
    if "The USER performed the following action:" in content and "<USER_REQUEST>" not in content:
        return None
    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
    if match:
        return match.group(1).strip()
    if content.strip().startswith("The USER performed the following action:"):
        return None
    return content.strip()

def clean_arg_value(val):
    if isinstance(val, str):
        val = val.strip()
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        val = val.replace('/Users/thiennq/workspace/personal/farm', 'farm')
    return val

def format_tool_args(tool_name, args):
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except Exception:
            pass
    if not isinstance(args, dict):
        return str(args)
    
    def clean_path(p):
        if not isinstance(p, str):
            return str(p)
        p = p.replace("/Users/thiennq/workspace/personal/farm", "farm")
        p = p.replace("farm/farm", "farm")
        return p
    
    if tool_name == "list_dir":
        path = clean_path(args.get("DirectoryPath", ""))
        return f": `{path}`"
    elif tool_name == "view_file":
        path = clean_path(args.get("AbsolutePath", "") or args.get("TargetFile", ""))
        return f": `{path}`"
    elif tool_name in ("write_to_file", "replace_file_content"):
        path = clean_path(args.get("TargetFile", ""))
        return f": `{path}`"
    elif tool_name == "run_command":
        cmd = args.get("CommandLine", "")
        return f": `{cmd}`"
    elif tool_name == "search_web":
        query = args.get("query", "")
        summary = args.get("toolSummary", "")
        return f" {{query: `{query}`, toolSummary: `{summary}`}}"
    elif tool_name == "ask_question":
        questions = args.get("questions", [])
        if isinstance(questions, str):
            try:
                questions = json.loads(questions)
            except:
                pass
        if not isinstance(questions, list):
            return f" : {args}"
        
        result_lines = [" :"]
        for idx, q in enumerate(questions, 1):
            is_multi = q.get("is_multi_select", False)
            title = q.get("question", "")
            suffix = " (Multiple)" if is_multi else ""
            result_lines.append(f"  - **Câu hỏi {idx}{suffix}**: {title}")
            for opt in q.get("options", []):
                result_lines.append(f"    - {opt}")
        return "\n".join(result_lines)
    
    keys = ["Target", "CommandLine", "AbsolutePath", "TargetFile", "Url", "Query"]
    for k in keys:
        if k in args:
            val = clean_path(args[k])
            return f" : {k}=`{val}`"
    return f": {args}"

def process_conversation(path, out):
    current_user_request = None
    blocks = []
    
    def flush_turn():
        nonlocal current_user_request, blocks
        if not current_user_request and not blocks:
            return
            
        if current_user_request:
            out.write(f"## 👤 User\n\n```\n{current_user_request}\n```\n\n")
            current_user_request = None
            
        if blocks:
            out.write("## 🤖 Antigravity\n\n")
            
            # Group consecutive blocks of the same type
            merged_blocks = []
            for b in blocks:
                if not merged_blocks:
                    merged_blocks.append(b)
                else:
                    prev = merged_blocks[-1]
                    if prev["type"] == b["type"]:
                        if b["type"] == "thinking":
                            prev["content"] += "\n\n" + b["content"]
                        elif b["type"] == "action":
                            prev["tools"].extend(b["tools"])
                        elif b["type"] == "response":
                            prev["content"] += "\n\n" + b["content"]
                    else:
                        merged_blocks.append(b)
            
            for block in merged_blocks:
                btype = block["type"]
                if btype == "thinking":
                    out.write(f"##### 🧠 Thinking\n\n{block['content']}\n\n")
                elif btype == "action":
                    out.write("##### 🛠️ Action\n")
                    for tool in block["tools"]:
                        tool_name = tool["name"]
                        args = tool.get("args", {})
                        if tool_name == "Action Result":
                            out.write(f"- Action Result: {args}\n")
                        else:
                            formatted = format_tool_args(tool_name, args)
                            out.write(f"- `{tool_name}`{formatted}\n")
                    out.write("\n")
                elif btype == "response":
                    out.write(f"##### 💬 Response\n\n{block['content']}\n\n")
            blocks = []

    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            try:
                step = json.loads(line)
                source = step.get("source")
                step_type = step.get("type")
                content = step.get("content", "")
                
                if source == "USER_EXPLICIT" or step_type == "USER_INPUT":
                    flush_turn()
                    clean_req = extract_user_request(content)
                    if clean_req:
                        current_user_request = clean_req
                elif source == "MODEL" and step_type == "PLANNER_RESPONSE":
                    thinking = step.get("thinking", "")
                    tool_calls = step.get("tool_calls", [])
                    if thinking:
                        blocks.append({"type": "thinking", "content": thinking.strip()})
                    if tool_calls:
                        cleaned_calls = []
                        for tc in tool_calls:
                            tc_args = tc.get("args", {})
                            if isinstance(tc_args, str):
                                try:
                                    tc_args = json.loads(tc_args)
                                except:
                                    pass
                            cleaned_calls.append({"name": tc.get("name"), "args": tc_args})
                        blocks.append({"type": "action", "tools": cleaned_calls})
                    if content and content.strip():
                        blocks.append({"type": "response", "content": content.strip()})
                elif step_type in ("RUN_COMMAND", "VIEW_FILE", "WRITE_TO_FILE", "REPLACE_FILE_CONTENT", "MULTI_REPLACE_FILE_CONTENT", "ASK_QUESTION", "SEARCH_WEB", "LIST_DIRECTORY"):
                    status = step.get("status")
                    if status and status != "DONE":
                        if not blocks or blocks[-1]["type"] != "action":
                            blocks.append({"type": "action", "tools": []})
                        blocks[-1]["tools"].append({
                            "name": "Action Result",
                            "args": f"Tool `{step_type}` executed with status: `{status}`"
                        })
            except Exception:
                pass
        flush_turn()

def scout_conversations():
    print(f"Scouting conversations in {brain_dir} matching workspace {target_workspace}...")
    matching = []
    
    if not os.path.exists(brain_dir):
        print(f"Error: Brain directory {brain_dir} does not exist.")
        return []
        
    for item in os.listdir(brain_dir):
        item_path = os.path.join(brain_dir, item)
        if os.path.isdir(item_path):
            transcript_path = os.path.join(item_path, ".system_generated", "logs", "transcript.jsonl")
            if os.path.exists(transcript_path):
                try:
                    with open(transcript_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            if target_workspace in line:
                                mtime = os.path.getmtime(transcript_path)
                                matching.append((item, transcript_path, mtime))
                                break
                except Exception:
                    pass
                    
    matching.sort(key=lambda x: x[2])
    return matching

def main():
    matching = scout_conversations()
    print(f"Found {len(matching)} matching conversations in chronological order:\n")
    
    for idx, (cid, path, _) in enumerate(matching, 1):
        print(f"[{idx}] Conversation ID: {cid}")
        try:
            with open(path, 'r', encoding='utf-8') as f:
                prompt_count = 0
                for line in f:
                    if not line.strip():
                        continue
                    step = json.loads(line)
                    if step.get("source") == "USER_EXPLICIT" or step.get("type") == "USER_INPUT":
                        content = step.get("content", "")
                        clean_req = extract_user_request(content)
                        if clean_req:
                            prompt_count += 1
                            preview = clean_req.replace('\n', ' ')[:100]
                            print(f"    - Turn {prompt_count}: {preview}...")
        except Exception as e:
            print(f"    Error reading transcript: {e}")
        print()

    print("Generating merged chatlog files with structured formats...")
    for out_path in output_files:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        try:
            with open(out_path, 'w', encoding='utf-8') as out:
                out.write("# Chat Logs of Farm Project\n\n")
                for _, path, _ in matching:
                    process_conversation(path, out)
            print(f"Saved to {out_path}")
        except Exception as e:
            print(f"Error saving to {out_path}: {e}")

if __name__ == '__main__':
    main()
