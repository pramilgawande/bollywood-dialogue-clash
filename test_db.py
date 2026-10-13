import re

with open('dialogueData.js', 'r', encoding='utf-8') as f:
    text = f.read()

ids = re.findall(r'id:\s*["\']([^"\']+)["\']', text)
print(f"Total entries found: {len(ids)}")
print("Sample entries:")
for i, item in enumerate(ids[:10]):
    print(f" {i+1}. {item}")
