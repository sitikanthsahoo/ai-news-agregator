from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.models import Article
import asyncio
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/ws", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await websocket.send_text(json.dumps({"type": "welcome", "message": "Connected to News WebSocket"}))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@router.websocket("/news")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    # Send initial data
    db = SessionLocal()
    try:
        articles = db.query(Article).order_by(Article.published_at.desc()).limit(5).all()
        # Create a simple list of dicts to serialize
        art_list = [
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "category": a.category,
                "published_at": a.published_at.isoformat() if a.published_at else None
            } for a in articles
        ]
        await websocket.send_text(json.dumps({"type": "initial", "articles": art_list}))
    finally:
        db.close()
        
    try:
        while True:
            data = await websocket.receive_text()
            # Keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def news_broadcaster():
    while True:
        await asyncio.sleep(60)
        db = SessionLocal()
        try:
            # Check articles published in last 5 minutes
            five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
            recent_articles = db.query(Article).filter(Article.published_at >= five_mins_ago).all()
            
            if recent_articles:
                art_list = [
                    {
                        "id": a.id,
                        "title": a.title,
                        "url": a.url,
                        "category": a.category,
                        "published_at": a.published_at.isoformat() if a.published_at else None
                    } for a in recent_articles
                ]
                await manager.broadcast(json.dumps({
                    "type": "breaking_news",
                    "articles": art_list
                }))
        except Exception as e:
            print(f"Error in broadcaster: {e}")
        finally:
            db.close()
