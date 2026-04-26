from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Sequence, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, Sequence('users_id_seq'), primary_key=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, Sequence('articles_id_seq'), primary_key=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(1000), unique=True, nullable=False)
    source = Column(String(200))
    category = Column(String(100), index=True)
    image_url = Column(String(1000), nullable=True)
    sentiment = Column(String(20), nullable=True)
    ai_summary = Column(Text, nullable=True)
    view_count = Column(Integer, default=0)
    published_at = Column(DateTime, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, Sequence('bookmarks_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('user_id', 'article_id', name='_user_article_uc'),)

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, Sequence('history_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)

class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, Sequence('preferences_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    preferred_categories = Column(Text) # Store JSON as string
    updated_at = Column(DateTime, default=datetime.utcnow)
