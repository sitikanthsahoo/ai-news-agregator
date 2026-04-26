from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import BookmarkCreate, BookmarkOut, ArticleList
from ..services import bookmark_service
from ..utils.dependencies import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])

@router.post("", response_model=BookmarkOut, status_code=201)
def create_bookmark(
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new bookmark."""
    return bookmark_service.add_bookmark(db, current_user.id, data.article_id)

@router.get("", response_model=ArticleList)
def get_bookmarks(
    response: Response,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user bookmarks."""
    result = bookmark_service.get_user_bookmarks(db, current_user.id, page, limit)
    response.headers["X-Total-Count"] = str(result["total"])
    return result

@router.delete("/by-article/{article_id}")
def remove_bookmark_by_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a bookmark by article ID (frontend-friendly)."""
    from ..models.models import Bookmark
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.article_id == article_id
    ).first()
    if not bookmark:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark removed successfully"}

@router.delete("/{id}")
def remove_bookmark(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a bookmark by bookmark ID."""
    bookmark_service.remove_bookmark(db, current_user.id, id)
    return {"message": "Bookmark removed successfully"}
