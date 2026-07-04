"""
Tests the running Flask app end-to-end by POSTing all three project scenarios
to /predict and checking the returned HTML for sensible HDI values + tiers.
"""
import re
import requests

BASE = "http://127.0.0.1:5000"

scenarios = [
    {
        "name": "Scenario 1 - Very High (Norway-like)",
        "data": {"life_expectancy": 82.6, "mean_schooling": 12.9,
                 "expected_schooling": 18.2, "gni": 66000},
        "expect_min": 0.85, "expect_max": 1.0,
        "expect_tier_contains": "Very High",
    },
    {
        "name": "Scenario 2 - Medium (emerging economy)",
        "data": {"life_expectancy": 72.5, "mean_schooling": 8.0,
                 "expected_schooling": 13.0, "gni": 11000},
        "expect_min": 0.55, "expect_max": 0.70,
        "expect_tier_contains": "Medium",
    },
    {
        "name": "Scenario 3 - Low (needs intervention)",
        "data": {"life_expectancy": 60.0, "mean_schooling": 3.5,
                 "expected_schooling": 8.0, "gni": 2000},
        "expect_min": 0.0, "expect_max": 0.55,
        "expect_tier_contains": "Low",
    },
]

# 1) Home page renders
r = requests.get(f"{BASE}/")
assert r.status_code == 200, "home page failed"
assert "Human Development Index" in r.text, "home page missing title"
print("[OK] Home page renders (200)")

all_passed = True
for s in scenarios:
    r = requests.post(f"{BASE}/predict", data=s["data"])
    ok_status = r.status_code == 200
    html = r.text

    # Extract the score from the badge
    m = re.search(r'score-badge">([0-9.]+)<', html)
    score = float(m.group(1)) if m else None
    ok_score = score is not None and s["expect_min"] <= score <= s["expect_max"]

    # Extract the tier text from the visible <span class="tier ..."> element
    m2 = re.search(r'<span class="tier[^"]*">([^<]+)</span>', html)
    tier = m2.group(1).strip() if m2 else ""
    ok_tier = s["expect_tier_contains"].lower() in tier.lower()

    status = "PASS" if (ok_status and ok_score and ok_tier) else "FAIL"
    if status == "FAIL":
        all_passed = False
    print(f"[{status}] {s['name']}: HDI={score} tier='{tier}'")

print("\nAll scenarios passed." if all_passed else "\nSOME SCENARIOS FAILED.")
