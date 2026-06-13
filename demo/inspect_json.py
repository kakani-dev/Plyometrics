import json

def inspect():
    with open("questions.json", "r", encoding="utf-8") as f:
        questions = json.load(f)
    with open("rules.json", "r", encoding="utf-8") as f:
        rules = json.load(f)
        
    print(f"Total master questions: {len(questions)}")
    
    # Check domains & subdomains in master
    domains = {}
    for q in questions:
        dom = q.get("Domain", "Unknown")
        sub = q.get("Subdomain", "Unknown")
        domains.setdefault(dom, set()).add(sub)
    print("\nMaster Domains & Subdomains:")
    for dom, subs in domains.items():
        print(f" - {dom}: {sorted(list(subs))}")
        
    # Check template questions
    template = rules.get("Student_Response_Template", [])
    print(f"\nTotal compact template questions: {len(template)}")
    if template:
        print("First compact question example:", template[0])
        
    # Check permutations structure
    perms = rules.get("Permutation_AI_Rules", [])
    print(f"\nTotal permutations: {len(perms)}")
    if perms:
        print("First permutation example:", perms[0])
        # Find unique values for each dimension
        riasec_dom = set(p.get("RIASEC_Dominant", "") for p in perms)
        big5_dom = set(p.get("Big5_Dominant", "") for p in perms)
        cog_band = set(p.get("Cognitive_Band", "") for p in perms)
        emo_band = set(p.get("Emotional_Band", "") for p in perms)
        learn_style = set(p.get("Learning_Style", "") for p in perms)
        print(f"Unique RIASEC: {riasec_dom}")
        print(f"Unique Big5: {big5_dom}")
        print(f"Unique Cognitive Band: {cog_band}")
        print(f"Unique Emotional Band: {emo_band}")
        print(f"Unique Learning Style: {learn_style}")

inspect()
