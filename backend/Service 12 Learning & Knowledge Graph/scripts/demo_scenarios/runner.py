import json
import time
import os
from scripts.demo_scenarios.scenarios import SCENARIOS

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "../../reports")

def run_all():
    results = []
    
    for name, func in SCENARIOS:
        print(f"Running Scenario: {name}...")
        start = time.time()
        try:
            stats = func()
            status = "PASS"
        except Exception as e:
            stats = {"entities_created": 0, "api_calls": 0, "error": str(e)}
            status = "FAIL"
        duration = time.time() - start
        
        results.append({
            "Scenario Name": name,
            "Entities Created": stats.get("entities_created", 0),
            "API Calls Made": stats.get("api_calls", 0),
            "Execution Time (s)": round(duration, 3),
            "Pass / Fail": status
        })
        print(f"[{status}] {name} in {round(duration, 3)}s\n")
    
    # Save JSON
    with open(os.path.join(REPORTS_DIR, "scenario_results.json"), "w") as f:
        json.dump(results, f, indent=2)
    
    # Save Markdown Summary
    with open(os.path.join(REPORTS_DIR, "scenario_summary.md"), "w") as f:
        f.write("# Demo Scenarios Execution Summary\n\n")
        f.write("| Scenario Name | Status | Time (s) | Entities | API Calls |\n")
        f.write("| --- | --- | --- | --- | --- |\n")
        for r in results:
            f.write(f"| {r['Scenario Name']} | {r['Pass / Fail']} | {r['Execution Time (s)']} | {r['Entities Created']} | {r['API Calls Made']} |\n")
    
    print(f"Reports successfully generated in {REPORTS_DIR}")

if __name__ == "__main__":
    os.makedirs(REPORTS_DIR, exist_ok=True)
    run_all()
