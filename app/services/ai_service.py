from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.models import Article
import logging

logger = logging.getLogger(__name__)

# Lazy loading of models
summarizer = None
sentiment_analyzer = None

def get_summarizer():
    global summarizer
    if summarizer is None:
        logger.info("Loading summarizer model...")
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model_name = "sshleifer/distilbart-cnn-12-6"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
        
        def summarize(text, max_length=130, min_length=30, do_sample=False):
            inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True).to(device)
            summary_ids = model.generate(inputs["input_ids"], max_length=max_length, min_length=min_length, do_sample=do_sample)
            summary_text = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            return [{"summary_text": summary_text}]
            
        summarizer = summarize
    return summarizer

def get_sentiment_analyzer():
    global sentiment_analyzer
    if sentiment_analyzer is None:
        logger.info("Loading sentiment analyzer model...")
        from transformers import pipeline
        import torch
        device = 0 if torch.cuda.is_available() else -1
        sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=device)
    return sentiment_analyzer

def summarize_text(text: str, db: Session = None, article_id: int = None):
    logger.info(f"Summarizing text for article_id: {article_id}")
    article = None
    if article_id and db:
        logger.info(f"Fetching article {article_id} from DB")
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            logger.error(f"Article {article_id} not found")
            raise HTTPException(status_code=404, detail="Article not found")
            
        if article.ai_summary:
            logger.info("Using cached summary from DB")
            return article.ai_summary.split("|")
            
        text = article.content or article.summary
        if not text:
            logger.error("Article has no content")
            raise HTTPException(status_code=400, detail="Article has no content to summarize")
            
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
        
    logger.info("Loading summarizer model...")
    model = get_summarizer()
    
    # Truncate text to ~1024 tokens (approx 4000 chars)
    truncated_text = text[:4000]
    
    logger.info("Running model inference...")
    # Run summarization
    result = model(truncated_text, max_length=130, min_length=30, do_sample=False)
    summary_text = result[0]['summary_text']
    logger.info("Model inference complete")
    
    # Split into 3 bullet points (roughly split by sentences)
    import re
    sentences = re.split(r'(?<=[.!?]) +', summary_text)
    
    points = []
    if len(sentences) >= 3:
        points = sentences[:3]
    elif len(sentences) > 0:
        points = [summary_text, "Additional details in full text.", "Read article for more context."]
    else:
        points = ["Summary not available.", "", ""]
        
    # Save back to DB if applicable
    if article and db:
        logger.info("Saving summary to DB")
        article.ai_summary = "|".join(points)
        try:
            db.commit()
            logger.info("DB commit successful")
        except Exception as e:
            logger.error(f"DB commit failed: {e}")
            db.rollback()
            raise
        
    return points

def analyze_sentiment(text: str, db: Session = None, article_id: int = None):
    article = None
    if article_id and db:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
            
        if article.sentiment:
            return {"sentiment": article.sentiment, "score": None}
            
        text = article.content or article.summary
        if not text:
            raise HTTPException(status_code=400, detail="Article has no content for sentiment analysis")

    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    model = get_sentiment_analyzer()
    truncated_text = text[:2000]
    
    result = model(truncated_text)
    sentiment_label = result[0]['label']
    score = result[0]['score']
    
    final_sentiment = "Neutral"
    if score >= 0.6:
        if sentiment_label == "POSITIVE":
            final_sentiment = "Positive"
        elif sentiment_label == "NEGATIVE":
            final_sentiment = "Negative"
            
    if article and db:
        article.sentiment = final_sentiment
        db.commit()
        
    return {"sentiment": final_sentiment, "score": score}
