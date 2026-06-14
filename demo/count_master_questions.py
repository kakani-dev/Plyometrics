import json

with open("questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

counts = {}
for q in questions:
    domain = q.get("Domain", "Unknown")
    subdomain = q.get("Subdomain", "Unknown")
    difficulty = q.get("Difficulty", "Unknown")
    
    key = (domain, subdomain)
    counts.setdefault(key, {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0})
    counts[key][difficulty] = counts[key].get(difficulty, 0) + 1
    counts[key]["Total"] += 1

print(f"{'Domain':<30} | {'Subdomain':<20} | {'Easy':<5} | {'Medium':<6} | {'Hard':<5} | {'Total':<5}")
print("-" * 80)
for (dom, sub), diffs in sorted(counts.items()):
    print(f"{dom:<30} | {sub:<20} | {diffs.get('Easy', 0):<5} | {diffs.get('Medium', 0):<6} | {diffs.get('Hard', 0):<5} | {diffs['Total']:<5}")
