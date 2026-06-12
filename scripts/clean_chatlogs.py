import re

def clean_chatlog(filepath):
    print(f"Cleaning {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    changed_count = 0
    for line in lines:
        if line.strip().startswith("- Call tool"):
            # Replace all occurrences of \\\" or \" with " inside the line
            new_line = line.replace('\\"', '"').replace('\"', '"')
            if new_line != line:
                changed_count += 1
                line = new_line
        new_lines.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Done. Changed {changed_count} lines.")

clean_chatlog('/Users/thiennq/workspace/personal/farm/chatlog.md')
clean_chatlog('/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md')
