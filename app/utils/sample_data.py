from sqlalchemy.orm import Session
from ..models.models import Article, User
from datetime import datetime
import bcrypt
import logging

logger = logging.getLogger(__name__)

def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_admin_user(db: Session):
    """Seed a default admin user if none exists."""
    existing = db.query(User).filter(User.username == "admin").first()
    if not existing:
        admin = User(
            username="admin",
            email="admin@ainews.local",
            hashed_password=_hash_password("admin123"),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logger.info("✅ Default admin user created: admin / admin123")
    else:
        logger.info("ℹ️  Admin user already exists, skipping seed.")

def seed_sample_articles(db: Session):
    # Seed admin user first
    seed_admin_user(db)

    count = db.query(Article).count()
    if count == 0:
        categories = ["technology", "sports", "politics", "health", "business", "entertainment", "science", "world"]
        for i in range(20):
            cat = categories[i % len(categories)]
            article = Article(
                title=f"Sample Article {i+1}",
                url=f"https://example.com/article-{i+1}",
                source="Sample Source",
                category=cat,
                summary=f"This is a summary for sample article {i+1} in {cat}.",
                content=f"Full content for sample article {i+1} is here. It talks about {cat}.",
                published_at=datetime.utcnow()
            )
            db.add(article)
        db.commit()
        logger.info("✅ 20 sample articles seeded.")
