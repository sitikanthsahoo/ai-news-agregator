# API Reference

### GET /health
- Auth: No
- Response: `{"status": "ok", "version": "1.0"}`

### POST /api/auth/register
- Auth: No
- Body: `{"username": "...", "email": "...", "password": "..."}`
- Success: 201 `{"id": 1, "username": "...", "email": "...", "is_active": true, "created_at": "..."}`
- Errors: 400 username or email already exists

### POST /api/auth/login
- Auth: No
- Body: `{"username": "...", "password": "..."}`
- Success: 200 `{"access_token": "...", "token_type": "bearer"}`
- Errors: 401 Incorrect username or password

### GET /api/auth/me
- Auth: Yes
- Success: 200 `{"id": 1, "username": "...", "email": "...", "is_active": true, "created_at": "..."}`

### GET /api/news
- Auth: No
- Query Parameters: `page` (int), `limit` (int), `sort` ("latest" or "popular")
- Success: 200 `{"data": [...], "total": 100, "page": 1, "limit": 10, "total_pages": 10}`

### GET /api/news/category/{category}
- Auth: No
- Query Parameters: `page` (int), `limit` (int)
- Success: 200 `{"data": [...], "total": 10, "page": 1, "limit": 10, "total_pages": 1}`

### GET /api/news/{id}
- Auth: Optional (if provided, tracks history)
- Success: 200 `{"id": 1, "title": "...", ...}`

### GET /api/news/search
- Auth: No
- Query Parameters: `q` (string), `page` (int), `limit` (int)
- Success: 200 `{"data": [...], "total": 5, "page": 1, "limit": 10, "total_pages": 1}`

### POST /api/ai/summarize
- Auth: No
- Body: `{"article_id": 1}` OR `{"text": "..."}`
- Success: 200 `{"summary": ["point 1", "point 2", "point 3"]}`

### POST /api/ai/sentiment
- Auth: No
- Body: `{"article_id": 1}` OR `{"text": "..."}`
- Success: 200 `{"sentiment": "Positive", "score": 0.99}`

### POST /api/bookmarks
- Auth: Yes
- Body: `{"article_id": 1}`
- Success: 201 `{"id": 1, "user_id": 1, "article_id": 1, "created_at": "..."}`

### GET /api/bookmarks
- Auth: Yes
- Query Parameters: `page` (int), `limit` (int)
- Success: 200 `{"data": [...], "total": 2, "page": 1, "limit": 10, "total_pages": 1}`

### DELETE /api/bookmarks/{id}
- Auth: Yes
- Success: 200 `{"message": "Bookmark removed successfully"}`

### GET /api/recommendations
- Auth: Yes
- Query Parameters: `limit` (int)
- Success: 200 `{"data": [...], "based_on": ["technology", "sports"], "total": 10}`

### WS /ws/news
- Auth: No
- Type: WebSocket
- Flow: Connect -> Receive initial 5 articles -> Keep alive -> Receive breaking news when available

### POST /api/admin/scrape
- Auth: Yes
- Success: 200 `{"scraped": 25, "saved": 10, "duplicates": 15}`

### GET /api/admin/stats
- Auth: Yes
- Success: 200 `{"articles": 150, "users": 10, "bookmarks": 45}`
