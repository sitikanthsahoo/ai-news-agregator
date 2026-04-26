from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import History, Article, Preferences
from collections import Counter
import json

def get_recommendations(db: Session, user_id: int, limit: int = 10):
    # 1. Query last 20 rows from history
    histories = db.query(History).filter(History.user_id == user_id).order_by(History.viewed_at.desc()).limit(20).all()
    
    # Get history article IDs to exclude
    history_article_ids = [h.article_id for h in histories]
    
    # 2. Get categories from those articles
    history_categories = []
    if history_article_ids:
        articles_in_history = db.query(Article).filter(Article.id.in_(history_article_ids)).all()
        # Create a dict for quick lookup to maintain frequency properly
        art_dict = {art.id: art for art in articles_in_history}
        for h in histories:
            if h.article_id in art_dict and art_dict[h.article_id].category:
                history_categories.append(art_dict[h.article_id].category)
                
    # 3. Count frequency -> pick top 3
    top_categories = [cat for cat, _ in Counter(history_categories).most_common(3)]
    
    # 4. Query preferences
    pref = db.query(Preferences).filter(Preferences.user_id == user_id).first()
    pref_categories = []
    if pref and pref.preferred_categories:
        try:
            pref_categories = json.loads(pref.preferred_categories)
        except json.JSONDecodeError:
            pass
            
    # 5. Merge top history + preferred (no duplicates)
    merged_categories = list(set(top_categories + pref_categories))
    
    # Fallback if no history and no preferences
    if not merged_categories:
        articles = db.query(Article).order_by(Article.view_count.desc(), Article.published_at.desc()).limit(limit).all()
        return {
            "data": articles,
            "based_on": ["popular"],
            "total": len(articles)
        }
        
    # 6. Query articles WHERE category IN (merged list)
    # 7. Exclude already in history
    query = db.query(Article).filter(Article.category.in_(merged_categories))
    if history_article_ids:
        query = query.filter(Article.id.notin_(history_article_ids))
        
    # 8. Order by published_at DESC, view_count DESC
    articles = query.order_by(Article.published_at.desc(), Article.view_count.desc()).limit(limit).all()
    
    # If not enough articles, maybe fallback and append some popular ones (not required by prompt)
    
    # 9. Return
    return {
        "data": articles,
        "based_on": merged_categories,
        "total": len(articles)
    }
