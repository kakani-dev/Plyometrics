import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("rules.json", "r", encoding="utf-8") as f:
    rules = json.load(f)

template = rules.get("Student_Response_Template", [])
cog_template = [r for r in template if r.get("Layer") == "Cognitive Ability"]
print(f"Total Cognitive questions in template: {len(cog_template)}")
for r in cog_template:
    print(f"AQID: {r.get('Assessment_QID')} | Sub: {r.get('Metric')} | Q: {r.get('Question')[:50]} | Correct: {r.get('Correct_Key')} | Low/Mod/High Time: {r.get('Time_Low_Max')}/{r.get('Time_Moderate_Max')}/{r.get('Time_High_Above')}")
