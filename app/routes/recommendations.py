from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import recommendation_service
from ..utils.dependencies import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("")
def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized recommendations."""
    return recommendation_service.get_recommendations(db, current_user.id, limit)
