"""
Phase 3 Full Test Script
Tests: login -> scrape (NewsAPI) -> verify articles are saved
"""
import requests
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = "http://localhost:8000"
CREDS = {"username": "admin", "password": "admin123"}

print("=" * 55)
print("  AI News Aggregator -- Phase 3 Test")
print("=" * 55)

# Step 1: Login
print("\n[1/4] Logging in...")
token = None
try:
    r = requests.post(f"{BASE}/api/auth/login", json=CREDS, timeout=10)
    if r.status_code == 200:
        token = r.json().get("access_token")
        print(f"  [OK] Login successful. Token: {token[:30]}...")
    else:
        print(f"  [FAIL] Login failed ({r.status_code}): {r.text}")
        print("  Trying to register admin user first...")
        reg = requests.post(f"{BASE}/api/auth/register",
                            json={"username": "admin", "email": "admin@test.com",
                                  "password": "admin123"}, timeout=10)
        print(f"  Register -> {reg.status_code}: {reg.text[:120]}")
        r2 = requests.post(f"{BASE}/api/auth/login", json=CREDS, timeout=10)
        if r2.status_code == 200:
            token = r2.json().get("access_token")
            print(f"  [OK] Login OK after register. Token: {token[:30]}...")
        else:
            print(f"  [FAIL] Still cannot login: {r2.text}")
            sys.exit(1)
except Exception as e:
    print(f"  [ERROR] Cannot reach backend: {e}")
    print("  Make sure uvicorn is running on port 8000!")
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {token}"}

# Step 2: Stats BEFORE scrape
print("\n[2/4] Checking article count BEFORE scrape...")
try:
    r = requests.get(f"{BASE}/api/admin/stats", headers=HEADERS, timeout=10)
    sb = r.json()
    print(f"  Articles: {sb.get('articles')} | Users: {sb.get('users')} | Bookmarks: {sb.get('bookmarks')}")
except Exception as e:
    print(f"  [ERROR] Stats error: {e}")

# Step 3: Trigger Scraper
print("\n[3/4] Triggering NewsAPI scraper (this may take ~15s)...")
try:
    r = requests.post(f"{BASE}/api/admin/scrape", headers=HEADERS, timeout=60)
    result = r.json()
    print(f"  HTTP Status : {r.status_code}")
    print(f"  Scraped     : {result.get('scraped', 0)}")
    print(f"  Saved (new) : {result.get('saved', 0)}")
    print(f"  Duplicates  : {result.get('duplicates', 0)}")
    print(f"  Message     : {result.get('message', '')}")
    if result.get("error"):
        print(f"  WARNING Error: {result['error']}")
except Exception as e:
    print(f"  [ERROR] Scrape error: {e}")

# Step 4: Stats AFTER + sample articles
print("\n[4/4] Verifying articles in DB after scrape...")
try:
    r = requests.get(f"{BASE}/api/admin/stats", headers=HEADERS, timeout=10)
    sa = r.json()
    print(f"  Articles in DB now: {sa.get('articles')}")

    r2 = requests.get(f"{BASE}/api/news?limit=5", timeout=10)
    if r2.status_code == 200:
        data = r2.json()
        items = data if isinstance(data, list) else data.get("items", data.get("articles", []))
        print(f"\n  Latest {len(items)} articles fetched:")
        for a in items[:5]:
            title = a.get("title", "N/A")[:60]
            src   = a.get("source", "N/A")
            cat   = a.get("category", "N/A")
            print(f"    [{cat.upper():15}] {title} -- {src}")
    else:
        print(f"  WARNING Could not fetch articles: {r2.status_code} {r2.text[:100]}")
except Exception as e:
    print(f"  [ERROR] Verification error: {e}")

print("\n" + "=" * 55)
print("  Phase 3 Test Complete!")
print("=" * 55)
