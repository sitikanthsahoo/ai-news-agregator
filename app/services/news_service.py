from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from ..models.models import Article, History
from ..schemas.schemas import ArticleCreate

def get_all_articles(db: Session, page: int, limit: int, sort_by: str):
    query = db.query(Article)
    
    if sort_by == "popular":
        query = query.order_by(Article.view_count.desc())
    else:
        query = query.order_by(Article.published_at.desc())
        
    total = query.count()
    articles = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1
    }

def get_articles_by_category(db: Session, category: str, page: int, limit: int):
    query = db.query(Article).filter(func.lower(Article.category) == category.lower())
    total = query.count()
    articles = query.order_by(Article.published_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1
    }

def get_article_by_id(db: Session, article_id: int, user_id: int = None):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    article.view_count += 1
    db.commit()
    db.refresh(article)
    
    if user_id:
        history_entry = History(user_id=user_id, article_id=article_id)
        db.add(history_entry)
        db.commit()
        
    return article

def search_articles(db: Session, query_str: str, page: int, limit: int):
    query = db.query(Article).filter(
        func.upper(Article.title).like(f"%{query_str.upper()}%") |
        func.upper(Article.summary).like(f"%{query_str.upper()}%")
    )
    total = query.count()
    articles = query.order_by(Article.published_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": articles,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1
    }

def create_article(db: Session, data: ArticleCreate):
    existing = db.query(Article).filter(Article.url == data.url).first()
    if existing:
        return existing
        
    new_article = Article(
        title=data.title,
        url=data.url,
        source=data.source,
        category=data.category,
        image_url=data.image_url,
        published_at=data.published_at,
        summary=data.summary,
        content=data.content
    )
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article
