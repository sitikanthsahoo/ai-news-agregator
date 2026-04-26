from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from ..database import get_db
from ..services import scraper_service
from ..utils.dependencies import get_current_user
from ..models.models import User, Article, Bookmark
from .websocket import manager
import json
import asyncio
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])

async def _broadcast_new_articles(saved_count: int, db: Session):
    """Background task to broadcast new articles via WebSocket."""
    try:
        articles = db.query(Article).order_by(Article.created_at.desc()).limit(saved_count).all()
        articles_data = [
            {
                "id": a.id,
                "title": a.title,
                "summary": a.summary,
                "category": a.category,
                "source": a.source,
                "sentiment": a.sentiment,
                "image_url": a.image_url,
                "published_at": a.published_at.isoformat() if a.published_at else None,
                "created_at": a.created_at.isoformat(),
                "view_count": a.view_count,
                "url": a.url,
            }
            for a in articles
        ]
        await manager.broadcast(json.dumps({
            "type": "breaking_news",
            "articles": articles_data
        }))
    except Exception as e:
        logger.error(f"WebSocket broadcast failed: {e}")

@router.post("/scrape")
def scrape_news(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger news scraper manually."""
    try:
        stats = scraper_service.run_scraper(db)
        if stats.get("saved", 0) > 0:
            background_tasks.add_task(
                asyncio.ensure_future,
                _broadcast_new_articles(stats["saved"], db)
            )
        return {**stats, "message": f"Scrape complete. {stats.get('saved', 0)} new articles saved."}
    except Exception as e:
        logger.error(f"Scraper error: {e}")
        return {"scraped": 0, "saved": 0, "duplicates": 0, "message": f"Scraper error: {str(e)}"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get overall statistics including rich analytics breakdown."""
    # Core counts
    articles_count = db.query(Article).count()
    users_count = db.query(User).count()
    bookmarks_count = db.query(Bookmark).count()
    total_views = db.query(func.coalesce(func.sum(Article.view_count), 0)).scalar() or 0

    # Category breakdown: list of {category, count}
    category_rows = (
        db.query(Article.category, func.count(Article.id).label("count"))
        .filter(Article.category != None)
        .group_by(Article.category)
        .order_by(func.count(Article.id).desc())
        .all()
    )
    categories = [{"category": row.category, "count": row.count} for row in category_rows]

    # Sentiment distribution: {Positive, Negative, Neutral, None}
    sentiment_rows = (
        db.query(Article.sentiment, func.count(Article.id).label("count"))
        .group_by(Article.sentiment)
        .all()
    )
    sentiment = {}
    for row in sentiment_rows:
        label = row.sentiment if row.sentiment else "Unknown"
        sentiment[label] = row.count

    # Top 5 articles by view count
    top_articles_rows = (
        db.query(Article)
        .order_by(Article.view_count.desc())
        .limit(5)
        .all()
    )
    top_articles = [
        {
            "id": a.id,
            "title": a.title,
            "category": a.category,
            "view_count": a.view_count,
            "source": a.source,
        }
        for a in top_articles_rows
    ]

    # 7-day article publication trend
    today = datetime.utcnow().date()
    daily_trend = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, 0, 0, 0)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59)
        count = (
            db.query(func.count(Article.id))
            .filter(Article.published_at >= day_start, Article.published_at <= day_end)
            .scalar()
        ) or 0
        daily_trend.append({"date": day.strftime("%a"), "count": count})

    return {
        "articles": articles_count,
        "users": users_count,
        "bookmarks": bookmarks_count,
        "total_views": int(total_views),
        "categories": categories,
        "sentiment": sentiment,
        "top_articles": top_articles,
        "daily_trend": daily_trend,
    }
