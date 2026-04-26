from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import AIRequest, SummarizeOut, SentimentOut
from ..services import ai_service
from ..models.models import Article, User
from ..utils.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ──────────────────────────────────────────────
# POST  /api/ai/summarize  (text or article_id)
# ──────────────────────────────────────────────
@router.post("/summarize", response_model=SummarizeOut)
def summarize(request: AIRequest, db: Session = Depends(get_db)):
    """Summarize an article or provided text."""
    if not request.text and not request.article_id:
        raise HTTPException(status_code=400, detail="Must provide either text or article_id")
    try:
        points = ai_service.summarize_text(text=request.text, db=db, article_id=request.article_id)
        return {"summary": points}
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# GET  /api/ai/article/{id}/summarize
# Convenience GET endpoint for the article page
# ──────────────────────────────────────────────
@router.get("/article/{article_id}/summarize", response_model=SummarizeOut)
def summarize_article(article_id: int, db: Session = Depends(get_db)):
    """Get or generate AI summary for an article by ID."""
    try:
        points = ai_service.summarize_text(text=None, db=db, article_id=article_id)
        return {"summary": points}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Error during summarization for article {article_id}: {e}\n{tb}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST  /api/ai/sentiment  (text or article_id)
# ──────────────────────────────────────────────
@router.post("/sentiment", response_model=SentimentOut)
def analyze_sentiment(request: AIRequest, db: Session = Depends(get_db)):
    """Analyze sentiment of an article or provided text."""
    if not request.text and not request.article_id:
        raise HTTPException(status_code=400, detail="Must provide either text or article_id")
    try:
        result = ai_service.analyze_sentiment(text=request.text, db=db, article_id=request.article_id)
        return result
    except Exception as e:
        logger.error(f"Error during sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# GET  /api/ai/article/{id}/sentiment
# ──────────────────────────────────────────────
@router.get("/article/{article_id}/sentiment", response_model=SentimentOut)
def sentiment_article(article_id: int, db: Session = Depends(get_db)):
    """Get or generate sentiment for an article by ID."""
    try:
        result = ai_service.analyze_sentiment(text=None, db=db, article_id=article_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST  /api/ai/batch-sentiment   (Admin only)
# Runs sentiment on all articles missing it
# ──────────────────────────────────────────────
def _run_batch_sentiment(db: Session):
    """Background task: run sentiment on all articles without a sentiment tag."""
    articles = db.query(Article).filter(
        (Article.sentiment == None) | (Article.sentiment == "")
    ).all()
    count = 0
    for article in articles:
        try:
            text = article.content or article.summary
            if not text:
                continue
            ai_service.analyze_sentiment(text=text, db=db, article_id=article.id)
            count += 1
        except Exception as e:
            logger.warning(f"Batch sentiment skip article {article.id}: {e}")
    logger.info(f"Batch sentiment complete: {count} articles processed.")


@router.post("/batch-sentiment")
def batch_sentiment(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger background sentiment analysis for all articles missing a sentiment label. Admin only."""
    total_pending = db.query(Article).filter(
        (Article.sentiment == None) | (Article.sentiment == "")
    ).count()
    background_tasks.add_task(_run_batch_sentiment, db)
    return {
        "message": f"Batch sentiment started in background.",
        "pending_articles": total_pending,
    }
