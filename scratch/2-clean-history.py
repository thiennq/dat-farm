import re

output_files = [
    "/Users/thiennq/workspace/personal/farm/chatlog.md",
    "/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md"
]

def clean_quotes(content):
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        if line.strip().startswith("- ") and "`" in line:
            new_line = line.replace('\\"', '"').replace('\"', '"')
            line = new_line
        new_lines.append(line)
    return "\n".join(new_lines)

def clean_call_tool_prefixes(content):
    return content.replace("- Call tool `", "- `")

def clean_tool_arguments(content):
    # 1. list_dir: - `list_dir` {DirectoryPath: `value`} or similar
    content = re.sub(r'- `list_dir` \{DirectoryPath: `([^`]+)`\}', r'- `list_dir`: `\1`', content)
    # 2. view_file: - `view_file` File: `value`
    content = re.sub(r'- `view_file` File: `([^`]+)`', r'- `view_file`: `\1`', content)
    # 3. write_to_file: - `write_to_file` File: `value`
    content = re.sub(r'- `write_to_file` File: `([^`]+)`', r'- `write_to_file`: `\1`', content)
    # 4. run_command: - `run_command` Command: `value`
    content = re.sub(r'- `run_command` Command: `([^`]+)`', r'- `run_command`: `\1`', content)
    return content

def clean_file(filepath):
    print(f"Cleaning {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply cleaning passes
        content = clean_quotes(content)
        content = clean_call_tool_prefixes(content)
        content = clean_tool_arguments(content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Done.")
    except Exception as e:
        print(f"Error cleaning {filepath}: {e}")

def main():
    for filepath in output_files:
        clean_file(filepath)

if __name__ == '__main__':
    main()
