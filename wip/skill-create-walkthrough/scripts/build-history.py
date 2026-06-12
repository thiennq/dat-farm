import os
import json
import re

# Resolve dynamic paths relative to this script's location
script_dir = os.path.dirname(os.path.abspath(__file__))
# The script is in <root>/wip/skill-create-walkthrough/scripts/ (3 levels deep)
target_workspace = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
brain_dir = os.path.expanduser("~/.gemini/antigravity-ide/brain")
output_file = os.path.join(target_workspace, "history", "chatlog", "conversations.md")

def extract_user_request(content):
    if not content:
        return None
    match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", content, re.DOTALL)
    if match:
        return match.group(1).strip()
    if content.strip().startswith("The USER performed the following action:"):
        return None
    return content.strip()

def clean_path(p):
    if not isinstance(p, str):
        return str(p)
    p = p.replace(target_workspace, "farm")
    p = p.replace("farm/farm", "farm")
    return p

def clean_quotes(s):
    if not isinstance(s, str):
        return s
    s = s.strip()
    if len(s) >= 2 and s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    # Unescape quotes
    s = s.replace('\\"', '"').replace('\"', '"')
    return s

def parse_args(args):
    if not args:
        return {}
    if isinstance(args, dict):
        return args
    if isinstance(args, str):
        args = args.strip()
        try:
            parsed = json.loads(args)
            if isinstance(parsed, (dict, list, str)):
                return parse_args(parsed)
        except Exception:
            pass
        
        # Fallback regex parsing if JSON load fails but looks like key-values
        for key in ["CommandLine", "TargetFile", "AbsolutePath", "DirectoryPath", "Url", "Query", "Target"]:
            match = re.search(r"['\"]" + key + r"['\"]\s*:\s*['\"](.*?)['\"]", args)
            if match:
                return {key: match.group(1)}
    return args

def format_tool_args(tool_name, args):
    args = parse_args(args)
    
    def clean_val(v):
        return clean_quotes(clean_path(str(v)))
        
    if not isinstance(args, dict):
        return f": `{clean_val(args)}`"
        
    if not args:
        return " {}"
        
    if tool_name == "list_dir":
        path = clean_val(args.get("DirectoryPath", ""))
        return f": `{path}`"
    elif tool_name == "view_file":
        path = clean_val(args.get("AbsolutePath", "") or args.get("TargetFile", ""))
        return f": `{path}`"
    elif tool_name in ("write_to_file", "replace_file_content", "multi_replace_file_content"):
        path = clean_val(args.get("TargetFile", ""))
        return f": `{path}`"
    elif tool_name == "run_command":
        cmd = clean_val(args.get("CommandLine", ""))
        return f": `{cmd}`"
    elif tool_name == "search_web":
        query = clean_val(args.get("query", ""))
        summary = clean_val(args.get("toolSummary", ""))
        return f" {{query: `{query}`, toolSummary: `{summary}`}}"
    elif tool_name == "ask_question":
        questions = args.get("questions", [])
        if isinstance(questions, str):
            try:
                questions = json.loads(questions)
            except:
                pass
        if not isinstance(questions, list):
            return f" : {clean_val(args)}"
        
        result_lines = [" :"]
        for idx, q in enumerate(questions, 1):
            is_multi = q.get("is_multi_select", False)
            title = clean_val(q.get("question", ""))
            suffix = " (Multiple)" if is_multi else ""
            result_lines.append(f"  - **Câu hỏi {idx}{suffix}**: {title}")
            for opt in q.get("options", []):
                result_lines.append(f"    - {clean_val(opt)}")
        return "\n".join(result_lines)
    
    # Fallback dictionary formatting (e.g. browser_subagent)
    items = []
    for k in sorted(args.keys()):
        cleaned_k = clean_val(k)
        val = args[k]
        if isinstance(val, (dict, list)):
            cleaned_v = clean_quotes(clean_path(json.dumps(val)))
        else:
            cleaned_v = clean_val(val)
        items.append(f"'{cleaned_k}': '{cleaned_v}'")
    return " {" + ", ".join(items) + "}"

def is_important_thinking(thinking):
    thinking = thinking.strip()
    if not thinking:
        return False
    if "**" in thinking:
        return True
    if len(thinking) > 150:
        return True
    return False

def is_minor_response(content):
    content = content.strip()
    if content.startswith("I will ") and len(content) < 150:
        return True
    return False

def process_conversation(path, out, start_q_idx):
    current_user_request = None
    blocks = []
    question_counter = start_q_idx
    
    def flush_turn():
        nonlocal current_user_request, blocks, question_counter
        if not current_user_request and not blocks:
            return
            
        if current_user_request:
            question_counter += 1
            out.write(f"## 👤 User <a id=\"q{question_counter}\"></a>\n\n```\n{current_user_request}\n```\n\n")
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
                block_content = clean_path(block.get("content", ""))
                if btype == "thinking":
                    out.write(f"##### 🧠 Thinking\n\n{block_content}\n\n")
                elif btype == "action":
                    tools = block["tools"]
                    if len(tools) > 2:
                        out.write("<details>\n<summary>🛠️ Action (Click to expand)</summary>\n\n")
                        for tool in tools:
                            tool_name = tool["name"]
                            args = tool.get("args", {})
                            if tool_name == "Action Result":
                                out.write(f"- Action Result: {args}\n")
                            else:
                                formatted = format_tool_args(tool_name, args)
                                out.write(f"- `{tool_name}`{formatted}\n")
                        out.write("\n</details>\n\n")
                    else:
                        out.write("##### 🛠️ Action\n")
                        for tool in tools:
                            tool_name = tool["name"]
                            args = tool.get("args", {})
                            if tool_name == "Action Result":
                                out.write(f"- Action Result: {args}\n")
                            else:
                                formatted = format_tool_args(tool_name, args)
                                out.write(f"- `{tool_name}`{formatted}\n")
                        out.write("\n")
                elif btype == "response":
                    out.write(f"##### 💬 Response\n\n{block_content}\n\n")
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
                    
                    if thinking and is_important_thinking(thinking):
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
                        
                    if content and content.strip() and not is_minor_response(content):
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
        return question_counter

def scout_conversations():
    matching = []
    if not os.path.exists(brain_dir):
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
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    global_q_counter = 0
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("# Conversations of Farm Project\n\n")
        for _, path, _ in matching:
            global_q_counter = process_conversation(path, out, global_q_counter)
    print(f"Generated hybrid chatlog at: {output_file}")

if __name__ == '__main__':
    main()
