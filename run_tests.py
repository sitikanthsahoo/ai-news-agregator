"""
Comprehensive Test Suite for AI News Aggregator
Tests: DB connection, Auth, News CRUD, Bookmarks, Recommendations, Admin Stats
"""
import sys
import os
import traceback

# Force UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf8', buffering=1)

# ─── Color helpers ──────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

PASS = f"{GREEN}[PASS]{RESET}"
FAIL = f"{RED}[FAIL]{RESET}"
SKIP = f"{YELLOW}[SKIP]{RESET}"
INFO = f"{CYAN}[INFO]{RESET}"

results = []

def run_test(name, fn):
    try:
        result = fn()
        print(f"  {PASS} {name}")
        if result:
            print(f"        → {result}")
        results.append(("PASS", name))
        return True
    except Exception as e:
        print(f"  {FAIL} {name}")
        print(f"        → {RED}{e}{RESET}")
        results.append(("FAIL", name, str(e)))
        return False

# ═══════════════════════════════════════════════════════════════════════════
print(f"\n{BOLD}{CYAN}╔══════════════════════════════════════════════╗{RESET}")
print(f"{BOLD}{CYAN}║   AI News Aggregator — Full Test Suite       ║{RESET}")
print(f"{BOLD}{CYAN}╚══════════════════════════════════════════════╝{RESET}\n")

# ─── 1. Import / config checks ─────────────────────────────────────────────
print(f"{BOLD}1. MODULE IMPORTS{RESET}")

run_test("Load app.config", lambda: __import__("app.config", fromlist=["settings"]).settings)

run_test("Load app.database", lambda: (
    __import__("app.database", fromlist=["engine","Base","SessionLocal","get_db"])
))

run_test("Load app.models.models", lambda: (
    __import__("app.models.models", fromlist=["User","Article","Bookmark","History","Preferences"])
))

run_test("Load app.schemas.schemas", lambda: (
    __import__("app.schemas.schemas", fromlist=["UserCreate","ArticleCreate"])
))

run_test("Load auth_service", lambda: (
    __import__("app.services.auth_service", fromlist=["register_user","login_user"])
))

run_test("Load news_service", lambda: (
    __import__("app.services.news_service", fromlist=["get_all_articles","create_article"])
))

run_test("Load scraper_service", lambda: (
    __import__("app.services.scraper_service", fromlist=["run_scraper","guess_category"])
))

run_test("Load recommendation_service", lambda: (
    __import__("app.services.recommendation_service", fromlist=["get_recommendations"])
))

run_test("Load bookmark_service", lambda: (
    __import__("app.services.bookmark_service", fromlist=[])
))

# ─── 2. Database connection ────────────────────────────────────────────────
print(f"\n{BOLD}2. DATABASE{RESET}")

from app.database import engine, Base, SessionLocal

def test_db_connect():
    with engine.connect() as conn:
        return "Oracle DB connection OK"
run_test("Connect to Oracle DB", test_db_connect)

def test_create_tables():
    Base.metadata.create_all(bind=engine)
    return "All tables created/verified"
run_test("Create all tables", test_create_tables)

# ─── 3. Sample data seeding ────────────────────────────────────────────────
print(f"\n{BOLD}3. SAMPLE DATA{RESET}")

from app.utils.sample_data import seed_sample_articles
from app.models.models import Article

def test_seed():
    db = SessionLocal()
    try:
        seed_sample_articles(db)
        count = db.query(Article).count()
        return f"Articles in DB: {count}"
    finally:
        db.close()
run_test("Seed sample articles", test_seed)

# ─── 4. Auth service ───────────────────────────────────────────────────────
print(f"\n{BOLD}4. AUTH SERVICE{RESET}")

from app.schemas.schemas import UserCreate, UserLogin
from app.services.auth_service import register_user, login_user, get_password_hash, verify_password

def test_hash():
    h = get_password_hash("testpass123")
    assert h != "testpass123" and len(h) > 20
    return f"Hash length: {len(h)}"
run_test("Password hashing", test_hash)

def test_verify():
    h = get_password_hash("mypassword")
    assert verify_password("mypassword", h) is True
    assert verify_password("wrongpass", h) is False
    return "Correct & wrong password verified"
run_test("Password verification", test_verify)

import uuid
TEST_USERNAME = f"test_{uuid.uuid4().hex[:6]}"
TEST_EMAIL    = f"{TEST_USERNAME}@test.com"
TEST_PASSWORD = "TestPass@123"
_registered_user = None

def test_register():
    global _registered_user
    db = SessionLocal()
    try:
        data = UserCreate(username=TEST_USERNAME, email=TEST_EMAIL, password=TEST_PASSWORD)
        user = register_user(db, data)
        _registered_user = user
        return f"Registered user id={user.id}, username={user.username}"
    finally:
        db.close()
run_test("Register new user", test_register)

def test_duplicate_register():
    from fastapi import HTTPException
    db = SessionLocal()
    try:
        data = UserCreate(username=TEST_USERNAME, email=TEST_EMAIL, password=TEST_PASSWORD)
        try:
            register_user(db, data)
            return False  # should have raised
        except HTTPException as e:
            assert e.status_code == 400
            return "Duplicate blocked (400)"
    finally:
        db.close()
run_test("Block duplicate registration", test_duplicate_register)

def test_login():
    db = SessionLocal()
    try:
        data = UserLogin(username=TEST_USERNAME, password=TEST_PASSWORD)
        token = login_user(db, data)
        assert "access_token" in token
        assert token["token_type"] == "bearer"
        return f"Token received, type={token['token_type']}"
    finally:
        db.close()
run_test("Login user", test_login)

def test_bad_login():
    from fastapi import HTTPException
    db = SessionLocal()
    try:
        data = UserLogin(username=TEST_USERNAME, password="WrongPassword!")
        try:
            login_user(db, data)
            return False
        except HTTPException as e:
            assert e.status_code == 401
            return "Wrong password blocked (401)"
    finally:
        db.close()
run_test("Block wrong password login", test_bad_login)

# ─── 5. JWT utilities ─────────────────────────────────────────────────────
print(f"\n{BOLD}5. JWT{RESET}")

from app.utils.jwt_utils import create_access_token, verify_token

def test_jwt_create():
    token = create_access_token({"sub": TEST_USERNAME})
    assert len(token) > 10
    return f"Token length: {len(token)}"
run_test("Create JWT token", test_jwt_create)

def test_jwt_verify():
    token = create_access_token({"sub": TEST_USERNAME})
    data  = verify_token(token)
    assert data is not None
    assert data.username == TEST_USERNAME
    return f"Token decoded: username={data.username}"
run_test("Verify JWT token", test_jwt_verify)

def test_jwt_invalid():
    data = verify_token("totally.invalid.token")
    assert data is None
    return "Invalid token returns None"
run_test("Reject invalid token", test_jwt_invalid)

# ─── 6. News service ──────────────────────────────────────────────────────
print(f"\n{BOLD}6. NEWS SERVICE{RESET}")

from app.services.news_service import get_all_articles, get_articles_by_category, search_articles, create_article, get_article_by_id
from app.schemas.schemas import ArticleCreate
from datetime import datetime

TEST_ARTICLE_URL = f"https://test-auto.com/article-{uuid.uuid4().hex[:8]}"

def test_create_article():
    db = SessionLocal()
    try:
        data = ArticleCreate(
            title="Auto Test Article",
            url=TEST_ARTICLE_URL,
            source="Test Suite",
            category="technology",
            summary="This is an automated test article.",
            content="Full content of the test article for validation.",
            published_at=datetime.utcnow()
        )
        art = create_article(db, data)
        return f"Created article id={art.id}, category={art.category}"
    finally:
        db.close()
run_test("Create article", test_create_article)

def test_get_all_articles():
    db = SessionLocal()
    try:
        result = get_all_articles(db, page=1, limit=5, sort_by="latest")
        assert "data" in result
        assert result["total"] >= 1
        return f"Total={result['total']}, pages={result['total_pages']}, returned={len(result['data'])}"
    finally:
        db.close()
run_test("Get all articles (paginated)", test_get_all_articles)

def test_popular_sort():
    db = SessionLocal()
    try:
        result = get_all_articles(db, page=1, limit=5, sort_by="popular")
        assert len(result["data"]) >= 1
        return f"Popular sort works, count={len(result['data'])}"
    finally:
        db.close()
run_test("Get articles sorted by popular", test_popular_sort)

def test_category_filter():
    db = SessionLocal()
    try:
        result = get_articles_by_category(db, "technology", page=1, limit=10)
        assert all(a.category.lower() == "technology" for a in result["data"])
        return f"Category=technology, count={result['total']}"
    finally:
        db.close()
run_test("Filter articles by category", test_category_filter)

def test_search():
    db = SessionLocal()
    try:
        result = search_articles(db, "sample", page=1, limit=10)
        assert "data" in result
        return f"Search 'sample' → {result['total']} results"
    finally:
        db.close()
run_test("Search articles", test_search)

def test_get_by_id():
    db = SessionLocal()
    try:
        first = db.query(Article).first()
        if not first:
            return "No articles to fetch"
        result = get_article_by_id(db, first.id)
        assert result.id == first.id
        return f"Fetched id={result.id}, view_count={result.view_count}"
    finally:
        db.close()
run_test("Get article by ID", test_get_by_id)

def test_view_count_increment():
    db = SessionLocal()
    try:
        first = db.query(Article).first()
        before = first.view_count
        get_article_by_id(db, first.id)
        db.refresh(first)
        after = first.view_count
        assert after == before + 1
        return f"view_count: {before} → {after}"
    finally:
        db.close()
run_test("View count increments", test_view_count_increment)

# ─── 7. Bookmark service ──────────────────────────────────────────────────
print(f"\n{BOLD}7. BOOKMARK SERVICE{RESET}")

from app.services import bookmark_service
from app.models.models import User

def test_add_bookmark():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        article = db.query(Article).first()
        if not user or not article:
            raise AssertionError("No user/article to bookmark")
        bm = bookmark_service.add_bookmark(db, user.id, article.id)
        return f"Bookmark created id={bm.id}, article={bm.article_id}"
    finally:
        db.close()
run_test("Add bookmark", test_add_bookmark)

def test_duplicate_bookmark():
    from fastapi import HTTPException
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        article = db.query(Article).first()
        try:
            bookmark_service.add_bookmark(db, user.id, article.id)
            raise AssertionError("Should have raised HTTPException for duplicate")
        except HTTPException as e:
            assert e.status_code == 400
            return "Duplicate bookmark blocked (400)"
    finally:
        db.close()
run_test("Block duplicate bookmark", test_duplicate_bookmark)

def test_get_bookmarks():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        result = bookmark_service.get_user_bookmarks(db, user.id, page=1, limit=10)
        assert result["total"] >= 1
        return f"Bookmarks for user: {result['total']}"
    finally:
        db.close()
run_test("Get user bookmarks", test_get_bookmarks)

def test_remove_bookmark():
    from app.models.models import Bookmark
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        # Find the bookmark ID we just created
        bm = db.query(Bookmark).filter(Bookmark.user_id == user.id).first()
        if not bm:
            raise AssertionError("No bookmark found to remove")
        result = bookmark_service.remove_bookmark(db, user.id, bm.id)
        return f"Bookmark removed (id={bm.id}): {result}"
    finally:
        db.close()
run_test("Remove bookmark", test_remove_bookmark)

# ─── 8. Recommendations ───────────────────────────────────────────────────
print(f"\n{BOLD}8. RECOMMENDATIONS{RESET}")

from app.services.recommendation_service import get_recommendations

def test_recommendations_cold_start():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        result = get_recommendations(db, user.id, limit=5)
        assert "data" in result and "based_on" in result
        return f"Cold start recs: {result['total']} articles, based_on={result['based_on']}"
    finally:
        db.close()
run_test("Recommendations (cold start)", test_recommendations_cold_start)

# ─── 9. Scraper logic ─────────────────────────────────────────────────────
print(f"\n{BOLD}9. SCRAPER{RESET}")

from app.services.scraper_service import guess_category

def test_guess_category():
    assert guess_category("https://bbc.com/news/technology/article") == "technology"
    assert guess_category("https://site.com/sports/football")        == "sports"
    assert guess_category("https://site.com/random/page")            == "world"
    return "Category guessing logic OK"
run_test("Guess category from URL", test_guess_category)

# ─── 10. FastAPI app creation ─────────────────────────────────────────────
print(f"\n{BOLD}10. FASTAPI APP{RESET}")

def test_fastapi_routes():
    from app.main import app
    routes = [r.path for r in app.routes]
    required = ["/api/auth/register", "/api/auth/login", "/api/news", "/api/admin/scrape", "/health"]
    for r in required:
        assert r in routes, f"Missing route: {r}"
    return f"All {len(required)} required routes present"
run_test("FastAPI routes registered", test_fastapi_routes)

def test_health_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    # We can't use TestClient with lifespan easily in a test; do a direct call
    from app.main import health_check
    result = health_check()
    assert result["status"] == "ok"
    return f"Health: {result}"
run_test("Health check endpoint", test_health_endpoint)

# ─── CLEANUP ──────────────────────────────────────────────────────────────
print(f"\n{BOLD}CLEANUP{RESET}")

def test_cleanup():
    db = SessionLocal()
    try:
        from app.models.models import Bookmark, History, Preferences
        user = db.query(User).filter(User.username == TEST_USERNAME).first()
        if user:
            db.query(Bookmark).filter(Bookmark.user_id == user.id).delete()
            db.query(History).filter(History.user_id == user.id).delete()
            db.query(Preferences).filter(Preferences.user_id == user.id).delete()
            db.delete(user)
            db.commit()
        # Remove test article
        art = db.query(Article).filter(Article.url == TEST_ARTICLE_URL).first()
        if art:
            db.delete(art)
            db.commit()
        return f"Removed test user '{TEST_USERNAME}' and test article"
    finally:
        db.close()
run_test("Cleanup test data", test_cleanup)

# ─── SUMMARY ──────────────────────────────────────────────────────────────
total  = len(results)
passed = sum(1 for r in results if r[0] == "PASS")
failed = sum(1 for r in results if r[0] == "FAIL")

print(f"\n{BOLD}{'═'*48}{RESET}")
print(f"{BOLD}RESULTS: {GREEN}{passed} passed{RESET}  {RED}{failed} failed{RESET}  (total {total}){RESET}")
print(f"{BOLD}{'═'*48}{RESET}")

if failed:
    print(f"\n{RED}Failed tests:{RESET}")
    for r in results:
        if r[0] == "FAIL":
            print(f"  • {r[1]}: {r[2]}")
    sys.exit(1)
else:
    print(f"\n{GREEN}✓ All tests passed!{RESET}\n")
    sys.exit(0)
