import re

with open('dialogueData.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Check that options has 4 items for each
options_matches = re.findall(r'options:\s*\[(.*?)\]', code, re.DOTALL)
print(f"Total options lists found: {len(options_matches)}")

for idx, opt in enumerate(options_matches):
    items = [x.strip() for x in opt.split(',') if x.strip()]
    if len(items) != 4:
        print(f"Warning: item {idx} has {len(items)} options: {items}")

print("Validation check finished successfully!")
