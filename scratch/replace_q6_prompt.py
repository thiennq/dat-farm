def update_q6_prompt(filepath):
    print(f"Updating Q6 prompt in {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start of the 6th User heading (Q6)
    pos = -1
    for _ in range(6):
        pos = content.find("## 👤 User", pos + 1)
        if pos == -1:
            break
            
    if pos != -1:
        # We find the end of the code block following the 6th User heading.
        # It looks like:
        # ## 👤 User
        # 
        # ```
        # ...
        # ```
        # 
        # ## 🤖 Antigravity
        code_start = content.find("```", pos)
        if code_start != -1:
            code_end = content.find("```", code_start + 3)
            if code_end != -1:
                old_block = content[pos:code_end + 3]
                new_block = """## 👤 User

```
Sửa lại title và logo-sub thành "Let’s vibe up a farm", còn pixel-text đổi thành "AI made me unemployed".
Xong rồi tạo repo GitHub dat-farm và deploy lên github.io giùm.
```"""
                new_content = content[:pos] + new_block + content[code_end + 3:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print("Updated successfully.")
            else:
                print("Could not find code block end.")
        else:
            print("Could not find code block start.")
    else:
        print("Could not find the 6th User heading.")

update_q6_prompt('/Users/thiennq/workspace/personal/farm/chatlog.md')
update_q6_prompt('/Users/thiennq/workspace/personal/farm/public/writeup/md/chatlog.md')
