from sqlalchemy.orm import Session
from bs4 import BeautifulSoup
import requests
from datetime import datetime
from ..schemas.schemas import ArticleCreate
from .news_service import create_article
import logging
from ..config import settings

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)"
}

def guess_category(text: str):
    text_lower = text.lower()
    categories = ["technology", "sports", "politics", "health", "business", "entertainment", "science", "world"]
    for cat in categories:
        if cat in text_lower:
            return cat
    return "world"

def run_scraper(db: Session):
    stats = {"scraped": 0, "saved": 0, "duplicates": 0}
    articles_to_save = []
    
    api_key = getattr(settings, "NEWS_API_KEY", None)
    
    if api_key and api_key != "your_newsapi_key_here":
        try:
            url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            data = res.json()
            if data.get("status") == "ok":
                for article in data.get("articles", []):
                    title = article.get("title")
                    url = article.get("url")
                    if not title or not url or title == "[Removed]":
                        continue
                    
                    content_text = f"{title} {article.get('description', '')} {url}"
                    source = article.get("source", {}).get("name", "NewsAPI")
                    
                    articles_to_save.append({
                        "title": title,
                        "url": url,
                        "source": source,
                        "category": guess_category(content_text),
                        "summary": article.get("description") or f"Scraped from {source}",
                        "published_at": article.get("publishedAt"),
                        "image_url": article.get("urlToImage")
                    })
        except Exception as e:
            logger.error(f"NewsAPI scrape error: {e}")
            stats["error"] = str(e)
    else:
        # BBC
        try:
            res = requests.get("https://www.bbc.com/news", headers=HEADERS, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            for a in soup.find_all("a", href=True):
                title = a.get_text(strip=True)
                href = a['href']
                if len(title) > 10 and "/news/" in href:
                    url = href if href.startswith("http") else f"https://www.bbc.com{href}"
                    articles_to_save.append({
                        "title": title,
                        "url": url,
                        "source": "BBC News",
                        "category": guess_category(url),
                        "summary": "Scraped from BBC News"
                    })
        except Exception as e:
            logger.error(f"BBC scrape error: {e}")

        # Reuters
        try:
            res = requests.get("https://www.reuters.com", headers=HEADERS, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            for a in soup.find_all("a", href=True):
                title = a.get_text(strip=True)
                href = a['href']
                if len(title) > 10 and ("/world/" in href or "/business/" in href):
                    url = href if href.startswith("http") else f"https://www.reuters.com{href}"
                    articles_to_save.append({
                        "title": title,
                        "url": url,
                        "source": "Reuters",
                        "category": guess_category(url),
                        "summary": "Scraped from Reuters"
                    })
        except Exception as e:
            logger.error(f"Reuters scrape error: {e}")

    stats["scraped"] = len(articles_to_save)
    
    # Save
    for item in articles_to_save:
        try:
            # Parse published_at if available
            pub_date = datetime.utcnow()
            if "published_at" in item and item["published_at"]:
                try:
                    # NewsAPI returns ISO 8601 strings like "2024-04-23T06:00:00Z"
                    pub_date_str = item["published_at"].replace("Z", "+00:00")
                    pub_date = datetime.fromisoformat(pub_date_str)
                    # Strip timezone info to match local DB expectations if naive datetime is needed
                    pub_date = pub_date.replace(tzinfo=None)
                except Exception:
                    pass
            
            art_data = ArticleCreate(
                title=item["title"],
                url=item["url"],
                source=item["source"],
                category=item["category"],
                published_at=pub_date,
                summary=item.get("summary", f"Scraped from {item['source']}"),
                image_url=item.get("image_url")
            )
            from ..models.models import Article
            existing = db.query(Article).filter(Article.url == art_data.url).first()
            if existing:
                # Backfill image_url if it was missing
                if not existing.image_url and art_data.image_url:
                    existing.image_url = art_data.image_url
                    db.commit()
                stats["duplicates"] += 1
            else:
                create_article(db, art_data)
                stats["saved"] += 1
        except Exception as e:
            logger.error(f"Save error: {e}")
            
    return stats
