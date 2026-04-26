from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Article Schemas
class ArticleCreate(BaseModel):
    title: str
    url: str
    source: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    summary: Optional[str] = None
    content: Optional[str] = None

class ArticleOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    url: str
    source: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    sentiment: Optional[str] = None
    ai_summary: Optional[str] = None
    view_count: int
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ArticleList(BaseModel):
    data: List[ArticleOut]
    total: int
    page: int
    limit: int
    total_pages: int

# Bookmark Schemas
class BookmarkCreate(BaseModel):
    article_id: int

class BookmarkOut(BaseModel):
    id: int
    user_id: int
    article_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# History Schemas
class HistoryOut(BaseModel):
    id: int
    user_id: int
    article_id: int
    viewed_at: datetime

    class Config:
        from_attributes = True

# Preferences Schemas
class PreferencesUpdate(BaseModel):
    preferred_categories: List[str]

class PreferencesOut(BaseModel):
    id: int
    user_id: int
    preferred_categories: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True

# AI Schemas
class AIRequest(BaseModel):
    text: Optional[str] = None
    article_id: Optional[int] = None

class SummarizeOut(BaseModel):
    summary: List[str]

class SentimentOut(BaseModel):
    sentiment: str
    score: Optional[float] = None
