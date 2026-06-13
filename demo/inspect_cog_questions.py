import json
import sys

# Set stdout to use utf-8 encoding to prevent errors in windows shell
sys.stdout.reconfigure(encoding='utf-8')

with open("questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

cog_qs = [q for q in questions if q.get("Domain") == "Cognitive Ability"]
print(f"Total Cognitive questions: {len(cog_qs)}")
for q in cog_qs[:15]:
    question_text = q.get('Question', '')
    # Safely format and print
    print(f"QID: {q.get('QID')} | Sub: {q.get('Subdomain')} | Diff: {q.get('Difficulty')} | Q: {question_text[:50]} | Key: {q.get('Correct/Key')}")
