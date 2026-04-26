from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import ArticleList, ArticleOut
from ..services import news_service
from ..utils.dependencies import get_optional_current_user
from ..models.models import User
from typing import Optional

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("", response_model=ArticleList)
def get_news(
    response: Response,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("latest", pattern="^(latest|popular)$"),
    db: Session = Depends(get_db)
):
    """Get all news articles with pagination."""
    result = news_service.get_all_articles(db, page, limit, sort)
    response.headers["X-Total-Count"] = str(result["total"])
    return result

@router.get("/search", response_model=ArticleList)
def search_news(
    q: str,
    response: Response,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search news articles."""
    result = news_service.search_articles(db, q, page, limit)
    response.headers["X-Total-Count"] = str(result["total"])
    return result

@router.get("/category/{category}", response_model=ArticleList)
def get_news_by_category(
    category: str,
    response: Response,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get news by category."""
    result = news_service.get_articles_by_category(db, category, page, limit)
    response.headers["X-Total-Count"] = str(result["total"])
    return result

@router.get("/{id}", response_model=ArticleOut)
def get_article(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get a single article by ID."""
    user_id = current_user.id if current_user else None
    return news_service.get_article_by_id(db, id, user_id)
