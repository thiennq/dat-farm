def truncate_chatlog(filepath):
    print(f"Truncating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start of the 6th User heading.
    # The headings are "## 👤 User".
    # Let's find all occurrences of "## 👤 User".
    pos = -1
    for _ in range(6):  # 1st, 2nd, 3rd, 4th, 5th, 6th
        pos = content.find("## 👤 User", pos + 1)
        if pos == -1:
            break
            
    if pos != -1:
        # Truncate content at pos, but let's strip trailing spaces or newlines
        truncated = content[:pos].rstrip() + "\n"
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(truncated)
        print("Truncated successfully.")
    else:
        print("Could not find the 6th User turn.")

truncate_chatlog('/Users/thiennq/workspace/personal/farm/chatlog.md')
truncate_chatlog('/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md')
