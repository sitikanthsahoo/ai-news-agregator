# 🚀 AI News Aggregator — Antigravity Build Prompts
> **Final Year Project | FastAPI + Oracle 21c XE + HuggingFace + Next.js**
> Follow each step in order. Test with Postman before moving to the next step.

---

## 📌 PROJECT OVERVIEW

| Property | Value |
|----------|-------|
| **Project** | AI-Powered News Aggregator |
| **Backend** | FastAPI (Python) |
| **Database** | Oracle 21c XE (SQLAlchemy ORM) |
| **Frontend** | Next.js (connected separately) |
| **AI** | HuggingFace Transformers |
| **Auth** | JWT (JSON Web Tokens) |
| **Real-time** | WebSocket |

---

## 🗄️ ORACLE 21c XE CONNECTION DETAILS

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 1521 |
| Service Name | XEPDB1 |
| Default User | system |
| Password | (set during Oracle XE installation) |
| Connection String | `oracle+oracledb://system:password@localhost:1521/XEPDB1` |

---

## ⚠️ DEVELOPER RULES (READ BEFORE STARTING)

- ✅ Build **one step at a time** — do not skip ahead
- ✅ Each step must return **complete, runnable code**
- ✅ Follow the **exact folder structure** defined in Step 1
- ✅ All secrets go in `.env` — never hardcode credentials
- ✅ Every route must have **proper error handling** (`try/except`, HTTP exceptions)
- ✅ Use **Pydantic v2** for all schemas
- ✅ All database operations go through **service layer** — never in routes directly
- ✅ Add **docstrings** to every function
- ✅ Use **Oracle Sequences** for all auto-increment IDs (NOT AUTOINCREMENT)
- ✅ Use **oracledb** package — NOT pymysql or cx_Oracle
- ✅ Oracle does NOT support JSON column type — store JSON as **CLOB** and parse manually
- ✅ Oracle strings use **NVARCHAR2** or **VARCHAR2** — not VARCHAR

---

## 📁 REQUIRED FOLDER STRUCTURE

```
app/
├── main.py
├── database.py
├── config.py
├── routes/
│   ├── auth.py
│   ├── news.py
│   ├── bookmarks.py
│   ├── recommendations.py
│   ├── ai.py
│   ├── admin.py
│   └── websocket.py
├── models/
│   └── models.py
├── schemas/
│   └── schemas.py
├── services/
│   ├── auth_service.py
│   ├── news_service.py
│   ├── bookmark_service.py
│   ├── recommendation_service.py
│   ├── ai_service.py
│   └── scraper_service.py
└── utils/
    ├── jwt_utils.py
    └── dependencies.py
.env
requirements.txt
```

---

## 🧱 STEP 1 — Project Initialization & Backend Setup

```
You are building a production-grade FastAPI backend for an AI News Aggregator.
The database is Oracle 21c XE — NOT MySQL.

TASK: Set up the complete project skeleton.

Create the following files with full working code:

1. requirements.txt — include exactly these packages:
   fastapi
   uvicorn
   sqlalchemy
   oracledb
   python-jose[cryptography]
   passlib[bcrypt]
   python-dotenv
   httpx
   pydantic[email]
   websockets
   transformers
   torch
   beautifulsoup4
   requests
   alembic

   DO NOT include pymysql or cx_Oracle — use oracledb only.

2. .env (template only, no real values):
   DATABASE_URL=oracle+oracledb://system:your_password@localhost:1521/XEPDB1
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60

3. app/config.py
   - Load all env variables using pydantic BaseSettings
   - Export a single settings object

4. app/database.py
   - Use SQLAlchemy with oracledb dialect
   - Connection: oracle+oracledb://system:password@localhost:1521/XEPDB1
   - Create engine with pool_pre_ping=True
   - Create SessionLocal
   - Create Base = declarative_base()
   - Create get_db() dependency function

5. app/main.py — FastAPI app with:
   - CORS middleware (allow all origins for dev)
   - Include all routers (placeholders OK for now)
   - GET /health endpoint returning {"status": "ok", "version": "1.0"}
   - Lifespan event that runs Base.metadata.create_all(bind=engine) on startup

ORACLE SPECIFIC RULES:
- Use oracledb in thick mode if needed: oracledb.init_oracle_client()
- Connection string format: oracle+oracledb://user:pass@host:port/service_name
- Do not use any MySQL-specific syntax anywhere

Return complete code for ALL 5 files. No placeholders inside the code.
```

---

## 🗄️ STEP 2 — Database Models & Schemas

```
TASK: Create all SQLAlchemy models and Pydantic schemas.
Database: Oracle 21c XE — follow Oracle-specific rules strictly.

File: app/models/models.py

ORACLE RULES FOR MODELS:
- Use Sequence() for all primary key auto-increment (NOT autoincrement=True)
- Use VARCHAR2 equivalent: String(n) in SQLAlchemy maps correctly
- For JSON/list fields: use Text (CLOB in Oracle) and store as JSON string
- Use DateTime for date fields (Oracle compatible)
- Table names must be UPPERCASE or short — Oracle has 30 char limit on older,
  128 char on 21c, but keep names short and clean

Create these 5 tables:

1. users
   - id: Integer, PK, Sequence('users_id_seq')
   - username: String(100), unique, indexed, not null
   - email: String(200), unique, indexed, not null
   - hashed_password: String(500), not null
   - created_at: DateTime, default=datetime.utcnow
   - is_active: Boolean, default=True

2. articles
   - id: Integer, PK, Sequence('articles_id_seq')
   - title: String(500), not null
   - summary: Text, nullable
   - content: Text, nullable
   - url: String(1000), unique, not null
   - source: String(200)
   - category: String(100), indexed
   - image_url: String(1000), nullable
   - sentiment: String(20), nullable
   - ai_summary: Text, nullable
   - view_count: Integer, default=0
   - published_at: DateTime, indexed
   - created_at: DateTime, default=datetime.utcnow

3. bookmarks
   - id: Integer, PK, Sequence('bookmarks_id_seq')
   - user_id: Integer, FK → users.id, not null
   - article_id: Integer, FK → articles.id, not null
   - created_at: DateTime, default=datetime.utcnow
   - UniqueConstraint on (user_id, article_id)

4. history
   - id: Integer, PK, Sequence('history_id_seq')
   - user_id: Integer, FK → users.id, not null
   - article_id: Integer, FK → articles.id, not null
   - viewed_at: DateTime, default=datetime.utcnow

5. preferences
   - id: Integer, PK, Sequence('preferences_id_seq')
   - user_id: Integer, FK → users.id, unique, not null
   - preferred_categories: Text (store as JSON string, parse in service layer)
   - updated_at: DateTime, default=datetime.utcnow

File: app/schemas/schemas.py

Create Pydantic v2 schemas (BaseModel) for:
- UserCreate, UserLogin, UserOut, Token, TokenData
- ArticleCreate, ArticleOut, ArticleList (with pagination meta)
- BookmarkCreate, BookmarkOut
- HistoryOut
- PreferencesUpdate (preferred_categories: list[str]), PreferencesOut
- AIRequest (text: str), SummarizeOut, SentimentOut

Return complete code for both files.
```

---

## 🔐 STEP 3 — Authentication System

```
TASK: Implement full JWT authentication.
Database: Oracle 21c XE.

Files to create:

1. app/utils/jwt_utils.py
   - create_access_token(data: dict) → str
   - verify_token(token: str) → TokenData
   - Use python-jose with HS256 algorithm
   - Read SECRET_KEY and ALGORITHM from config/settings

2. app/utils/dependencies.py
   - get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) → User
   - Raises HTTP 401 if token invalid or user not found
   - Use OAuth2PasswordBearer for token extraction

3. app/services/auth_service.py
   - register_user(db, data: UserCreate) → User
     • Query Oracle: check if username or email exists
     • If exists → raise HTTPException 400
     • Hash password with passlib bcrypt
     • Use Sequence for ID (Oracle handles this automatically via model)
     • db.add() → db.commit() → db.refresh()
   - login_user(db, data: UserLogin) → dict with access_token
     • Query user by username
     • Verify hashed password
     • Return JWT token dict

4. app/routes/auth.py
   - POST /api/auth/register → returns UserOut
   - POST /api/auth/login → returns Token
   - GET /api/auth/me → returns current user (protected route)

Rules:
- Never store plain passwords
- All errors return proper HTTPException with clear detail message
- Protected routes use Depends(get_current_user)

Return complete code for all 4 files.
```

---

## 📰 STEP 4 — News APIs

```
TASK: Build all news-related API endpoints.
Database: Oracle 21c XE — use SQLAlchemy ORM only, no raw SQL.

File: app/services/news_service.py

Functions:
- get_all_articles(db, page: int, limit: int, sort_by: str) → list[Article]
  • sort_by options: "latest" (published_at DESC), "popular" (view_count DESC)
  • Use .offset((page-1)*limit).limit(limit)

- get_articles_by_category(db, category: str, page: int, limit: int) → list[Article]
  • Filter by category (case-insensitive)

- get_article_by_id(db, article_id: int, user_id: int = None) → Article
  • Increment view_count by 1
  • If user_id provided → insert into history table
  • Raise 404 if not found

- search_articles(db, query: str, page: int, limit: int) → list[Article]
  • Search in title and summary using LIKE %query%
  • Oracle LIKE is case-sensitive — use UPPER() on both sides

- create_article(db, data: ArticleCreate) → Article
  • Check URL duplicate → skip if exists
  • Save and return

File: app/routes/news.py

Endpoints:
- GET /api/news?page=1&limit=10&sort=latest
- GET /api/news/category/{category}?page=1&limit=10
- GET /api/news/{id}
- GET /api/news/search?q=keyword&page=1&limit=10

Response format for list endpoints:
{
  "data": [...articles],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}

Valid categories:
["technology", "sports", "politics", "health",
 "business", "entertainment", "science", "world"]

Return complete code for both files.
```

---

## 🤖 STEP 5 — AI Features (Summarization + Sentiment)

```
TASK: Add AI capabilities using HuggingFace Transformers.
Database: Oracle 21c XE — cache AI results in articles table.

File: app/services/ai_service.py

1. Summarization
   - Model: "sshleifer/distilbart-cnn-12-6" (lightweight, fast)
   - Function: summarize_text(text: str, db, article_id: int = None) → list[str]
   - Steps:
     • If article_id given → check articles.ai_summary in Oracle DB
     • If cached → parse and return (stored as pipe-separated string)
     • If not cached → run HuggingFace pipeline
     • Split result into 3 bullet points
     • Save back to articles.ai_summary as "point1|point2|point3"
   - Max input: 1024 tokens — truncate if longer

2. Sentiment Analysis
   - Model: "distilbert-base-uncased-finetuned-sst-2-english"
   - Function: analyze_sentiment(text: str, db, article_id: int = None) → dict
   - Steps:
     • If article_id given → check articles.sentiment in Oracle DB
     • If cached → return cached value
     • If not cached → run pipeline
     • Map: POSITIVE → "Positive", NEGATIVE → "Negative"
     • If score < 0.6 → "Neutral"
     • Save to articles.sentiment

File: app/routes/ai.py

- POST /api/ai/summarize
  • Body: {"article_id": int} OR {"text": str}
  • Returns: {"summary": ["point1", "point2", "point3"]}

- POST /api/ai/sentiment
  • Body: {"article_id": int} OR {"text": str}
  • Returns: {"sentiment": "Positive", "score": 0.98}

Important:
- Load models lazily (only when first called)
- Auto detect GPU or CPU
- If model not loaded yet → include "note": "cold start, may be slow"

Return complete code for both files.
```

---

## 🔖 STEP 6 — Bookmark System

```
TASK: Build the bookmark feature for authenticated users.
Database: Oracle 21c XE.

File: app/services/bookmark_service.py

- add_bookmark(db, user_id: int, article_id: int) → Bookmark
  • Query Oracle: check if article exists → raise 404 if not
  • Check if bookmark already exists (user_id + article_id) → raise 400
  • Create and save bookmark

- get_user_bookmarks(db, user_id: int, page: int, limit: int) → list[Article]
  • Join bookmarks → articles
  • Return paginated article list

- remove_bookmark(db, user_id: int, bookmark_id: int) → bool
  • Check bookmark exists and belongs to user → raise 404 if not
  • Delete and commit

File: app/routes/bookmarks.py

All routes are PROTECTED (require valid JWT token via Depends)

- POST /api/bookmarks
  • Body: {"article_id": int}
  • Returns: BookmarkOut

- GET /api/bookmarks?page=1&limit=10
  • Returns paginated bookmarked articles

- DELETE /api/bookmarks/{id}
  • Returns: {"message": "Bookmark removed successfully"}

Return complete code for both files.
```

---

## 🎯 STEP 7 — Recommendation Engine

```
TASK: Build a personalized recommendation system.
Database: Oracle 21c XE.

File: app/services/recommendation_service.py

Function: get_recommendations(db, user_id: int, limit: int = 10) → dict

Logic (in this exact order):
1. Query last 20 rows from history table for this user
2. Get article categories from those history articles
3. Count category frequency → pick top 3
4. Query preferences table for user's preferred_categories
   (stored as JSON string in CLOB → parse with json.loads())
5. Merge top history categories + preferred categories (no duplicates)
6. Query articles WHERE category IN (merged list)
7. Exclude article IDs already in user's history
8. Order by published_at DESC, view_count DESC
9. Return top `limit` articles + the category list used

Fallback (if user has no history):
- Return top 10 articles ordered by view_count DESC, published_at DESC

File: app/routes/recommendations.py

- GET /api/recommendations?limit=10 (PROTECTED route)
  • Returns:
    {
      "data": [...articles],
      "based_on": ["technology", "sports"],
      "total": 10
    }

Return complete code for both files.
```

---

## 🔄 STEP 8 — Real-Time Updates (WebSocket)

```
TASK: Implement WebSocket for real-time breaking news.
Database: Oracle 21c XE.

File: app/routes/websocket.py

1. ConnectionManager class:
   - active_connections: list[WebSocket] = []
   - async connect(websocket) → accept + append + send welcome JSON
   - disconnect(websocket) → remove from list
   - async broadcast(message: str) → send to all connections

2. WebSocket endpoint: GET /ws/news
   - Accept connection via manager.connect()
   - On connect: fetch top 5 latest articles from DB → send as JSON:
     {"type": "initial", "articles": [...]}
   - Keep alive with try/except loop
   - On disconnect: call manager.disconnect()

3. Background task: async news_broadcaster(db_factory)
   - Loop every 60 seconds using asyncio.sleep(60)
   - Open new DB session each iteration
   - Check articles published in last 5 minutes
   - If any found → manager.broadcast(JSON string):
     {"type": "breaking_news", "articles": [...]}
   - Close DB session after each iteration

4. Expose manager.broadcast so admin scrape route can call it

File: Update app/main.py
   - On startup lifespan → create asyncio task for news_broadcaster
   - Include websocket router

Return complete code for both files.
```

---

## 🕷️ STEP 9 — News Scraper

```
TASK: Build a news scraper using BeautifulSoup.
Database: Oracle 21c XE — save scraped articles to articles table.

File: app/services/scraper_service.py

Scrape from 2 sources:

Source 1: BBC News — https://www.bbc.com/news
- Fetch homepage HTML with requests + User-Agent header
- Parse with BeautifulSoup
- Extract: article title, url (make absolute if relative)
- Guess category from URL path segments

Source 2: Reuters — https://www.reuters.com
- Same approach
- Extract: title, url, category

For each scraped article:
1. Check Oracle DB: does this URL already exist? → skip if yes
2. Build ArticleCreate object:
   - title, url, source (BBC/Reuters)
   - category (from URL or default "world")
   - published_at = datetime.utcnow()
3. Save to Oracle via create_article service
4. After all saved → trigger WebSocket broadcast

Function signature:
run_scraper(db: Session) → dict
Returns: {"scraped": int, "saved": int, "duplicates": int}

Headers to use:
{
  "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)"
}

File: app/routes/admin.py

- POST /api/admin/scrape (PROTECTED)
  • Calls run_scraper(db)
  • Returns scrape summary dict

- GET /api/admin/stats (PROTECTED)
  • Query Oracle for:
    - Total articles count
    - Total users count
    - Total bookmarks count
  • Returns: {"articles": int, "users": int, "bookmarks": int}

Return complete code for both files.
```

---

## 🔗 STEP 10 — Frontend Integration & Final Touches

```
TASK: Prepare backend for Next.js frontend connection.
Database: Oracle 21c XE.

1. Update app/main.py CORS:
   - allow_origins: ["http://localhost:3000", "http://127.0.0.1:3000"]
   - allow_credentials: True
   - allow_methods: ["*"]
   - allow_headers: ["*"]

2. Create app/utils/sample_data.py
   - Function: seed_sample_articles(db)
   - Insert 20 sample articles across all 8 categories
   - Check if articles table is empty first (Oracle: SELECT COUNT(*))
   - If empty → insert samples
   - Call this function inside main.py lifespan on startup

3. Verify every router in main.py:
   - auth, news, bookmarks, recommendations, ai, admin, websocket
   - All included with correct prefix and tags

4. Add X-Total-Count header to all list API responses

5. Generate API_REFERENCE.md with this format for each endpoint:
   ### POST /api/auth/register
   - Auth: No
   - Body: {"username": "...", "email": "...", "password": "..."}
   - Success: 201 {"id": 1, "username": "...", "email": "..."}
   - Errors: 400 username/email already exists

6. Verify Oracle connection works on startup — if connection fails,
   print a clear error message and exit gracefully

7. Final startup command:
   uvicorn app.main:app --reload --port 8000

Return all updated/new files with complete code.
```

---

## ✅ FINAL CHECKLIST (Verify Before Submitting Project)

| Feature | Endpoint | Auth | Status |
|---------|----------|------|--------|
| Health Check | GET /health | ❌ | ⬜ |
| Register | POST /api/auth/register | ❌ | ⬜ |
| Login | POST /api/auth/login | ❌ | ⬜ |
| Get Me | GET /api/auth/me | ✅ | ⬜ |
| All News | GET /api/news | ❌ | ⬜ |
| News by Category | GET /api/news/category/{cat} | ❌ | ⬜ |
| News Detail | GET /api/news/{id} | ❌ | ⬜ |
| Search News | GET /api/news/search | ❌ | ⬜ |
| AI Summarize | POST /api/ai/summarize | ❌ | ⬜ |
| AI Sentiment | POST /api/ai/sentiment | ❌ | ⬜ |
| Add Bookmark | POST /api/bookmarks | ✅ | ⬜ |
| Get Bookmarks | GET /api/bookmarks | ✅ | ⬜ |
| Delete Bookmark | DELETE /api/bookmarks/{id} | ✅ | ⬜ |
| Recommendations | GET /api/recommendations | ✅ | ⬜ |
| WebSocket | WS /ws/news | ❌ | ⬜ |
| Admin Scrape | POST /api/admin/scrape | ✅ | ⬜ |
| Admin Stats | GET /api/admin/stats | ✅ | ⬜ |

---

## 🧪 POSTMAN TESTING ORDER

```
1. GET  /health                  → server running?
2. POST /api/auth/register       → create account
3. POST /api/auth/login          → copy access_token
4. Set Bearer Token in Postman
5. GET  /api/auth/me             → token working?
6. POST /api/admin/scrape        → populate articles
7. GET  /api/news                → see articles list
8. GET  /api/news/{id}           → single article
9. POST /api/ai/summarize        → test AI summarize
10. POST /api/ai/sentiment       → test AI sentiment
11. POST /api/bookmarks          → bookmark article
12. GET  /api/bookmarks          → see bookmarks
13. GET  /api/recommendations    → personalized feed
14. WS  /ws/news                 → WebSocket tab in Postman
```

---

## ⚡ ORACLE QUICK REFERENCE FOR ANTIGRAVITY

```
❌ MySQL way          ✅ Oracle 21c XE way
─────────────────────────────────────────────
AUTO_INCREMENT     →  Sequence('table_id_seq')
JSON column        →  Text (CLOB), json.loads/dumps manually  
LIMIT n            →  .limit(n) in SQLAlchemy (handled auto)
VARCHAR            →  String(n) → maps to VARCHAR2
SHOW TABLES        →  SELECT table_name FROM user_tables
CREATE DATABASE    →  Not needed — use XEPDB1 pluggable DB
pymysql            →  oracledb
```

---

*Built for Final Year Project · FastAPI + Oracle 21c XE + HuggingFace · v2.0*
