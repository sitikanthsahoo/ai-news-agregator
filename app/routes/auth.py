from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import UserCreate, UserOut, UserLogin, Token
from ..services import auth_service
from ..utils.dependencies import get_current_user
from ..models.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    return auth_service.register_user(db, data)

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and get a JWT token."""
    return auth_service.login_user(db, data)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user."""
    return current_user
