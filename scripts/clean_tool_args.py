import re

def clean_tool_arguments(filepath):
    print(f"Cleaning {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex matches:
    # 1. list_dir: - `list_dir` {DirectoryPath: `value`}
    content = re.sub(r'- `list_dir` \{DirectoryPath: `([^`]+)`\}', r'- `list_dir`: `\1`', content)
    
    # 2. view_file: - `view_file` File: `value`
    content = re.sub(r'- `view_file` File: `([^`]+)`', r'- `view_file`: `\1`', content)
    
    # 3. write_to_file: - `write_to_file` File: `value`
    content = re.sub(r'- `write_to_file` File: `([^`]+)`', r'- `write_to_file`: `\1`', content)
    
    # 4. run_command: - `run_command` Command: `value`
    content = re.sub(r'- `run_command` Command: `([^`]+)`', r'- `run_command`: `\1`', content)

    # Let's also check if there are other variations or commands with double backticks or no backticks
    # e.g., - `run_command` Command: `...`
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done.")

clean_tool_arguments('/Users/thiennq/workspace/personal/farm/chatlog.md')
clean_tool_arguments('/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md')
