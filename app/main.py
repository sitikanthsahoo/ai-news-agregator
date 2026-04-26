from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from contextlib import asynccontextmanager
import asyncio
from .routes import auth, news, bookmarks, recommendations, ai, admin, websocket
from .utils.sample_data import seed_sample_articles
from .routes.websocket import news_broadcaster
import logging
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check DB Connection
    try:
        with engine.connect() as conn:
            logger.info("Successfully connected to Oracle DB!")
    except Exception as e:
        logger.error(f"Failed to connect to Oracle DB: {e}")
        sys.exit(1)
        
    # Startup event: create all tables
    Base.metadata.create_all(bind=engine)
    
    # Seed sample data
    db = SessionLocal()
    try:
        seed_sample_articles(db)
    finally:
        db.close()
        
    # Start websocket broadcaster task
    task = asyncio.create_task(news_broadcaster())
    
    yield
    # Shutdown event
    task.cancel()

app = FastAPI(title="AI News Aggregator", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"]
)

# Include routers
app.include_router(auth.router)
app.include_router(news.router)
app.include_router(bookmarks.router)
app.include_router(recommendations.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(websocket.router)

@app.get("/health")
def health_check():
    """Health check endpoint to verify server is running."""
    return {"status": "ok", "version": "1.0"}
