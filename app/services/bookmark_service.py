from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.models import Bookmark, Article

def add_bookmark(db: Session, user_id: int, article_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    existing_bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == user_id, 
        Bookmark.article_id == article_id
    ).first()
    
    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Bookmark already exists")
        
    new_bookmark = Bookmark(user_id=user_id, article_id=article_id)
    db.add(new_bookmark)
    db.commit()
    db.refresh(new_bookmark)
    return new_bookmark

def get_user_bookmarks(db: Session, user_id: int, page: int, limit: int):
    query = db.query(Article).join(Bookmark, Article.id == Bookmark.article_id).filter(Bookmark.user_id == user_id)
    total = query.count()
    articles = query.order_by(Bookmark.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1
    }

def remove_bookmark(db: Session, user_id: int, bookmark_id: int):
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark or bookmark.user_id != user_id:
        raise HTTPException(status_code=404, detail="Bookmark not found or unauthorized")
        
    db.delete(bookmark)
    db.commit()
    return True
