from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import bcrypt
from ..models.models import User
from ..schemas.schemas import UserCreate, UserLogin
from ..utils.jwt_utils import create_access_token

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def register_user(db: Session, data: UserCreate):
    existing_user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(db: Session, data: UserLogin):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
