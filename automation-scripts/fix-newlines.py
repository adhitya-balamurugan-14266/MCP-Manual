import re
import sys
import os

# Get default path relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CODE_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_TSX = os.path.join(CODE_DIR, 'src/components/ZohoServicePanel.tsx')

filepath = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TSX
with open(filepath, 'r') as f:
    content = f.read()

result = []
i = 0
fixed_count = 0

while i < len(content):
    m = content.find("purpose: '", i)
    if m == -1:
        result.append(content[i:])
        break

    result.append(content[i:m + len("purpose: '")])
    i = m + len("purpose: '")

    purpose_chars = []
    while i < len(content):
        c = content[i]
        if c == '\\' and i + 1 < len(content):
            purpose_chars.append(c)
            purpose_chars.append(content[i+1])
            i += 2
        elif c == "'":
            i += 1
            break
        else:
            purpose_chars.append(c)
            i += 1

    purpose = ''.join(purpose_chars)

    if '\n' in purpose:
        fixed_purpose = re.sub(r'\s*\n\s*', ' ', purpose).strip()
        result.append(fixed_purpose + "'")
        fixed_count += 1
    else:
        result.append(purpose + "'")

new_content = ''.join(result)

with open(filepath, 'w') as f:
    f.write(new_content)

print(f"Fixed {fixed_count} multi-line purpose strings.")

remaining = len(re.findall(r"purpose: '([^']*\n[^']*)'", new_content))
print(f"Remaining broken entries after fix: {remaining}")
