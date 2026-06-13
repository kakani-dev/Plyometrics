import json
import os

def convert():
    # Load questions.json
    if os.path.exists("questions.json"):
        with open("questions.json", "r", encoding="utf-8") as f:
            q_data = json.load(f)
        with open("questions.js", "w", encoding="utf-8") as f:
            f.write("// NeuroPi Master Question Bank (525 items)\n")
            f.write("window.NEUROPI_QUESTIONS = ")
            json.dump(q_data, f, indent=2, ensure_ascii=False)
            f.write(";\n")
        print("Converted questions.json -> questions.js")
        
    # Load rules.json
    if os.path.exists("rules.json"):
        with open("rules.json", "r", encoding="utf-8") as f:
            r_data = json.load(f)
        with open("rules.js", "w", encoding="utf-8") as f:
            f.write("// NeuroPi Scoring, Timing, and AI Rules\n")
            f.write("window.NEUROPI_RULES = ")
            json.dump(r_data, f, indent=2, ensure_ascii=False)
            f.write(";\n")
        print("Converted rules.json -> rules.js")

if __name__ == "__main__":
    convert()
