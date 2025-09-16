# Complete Python Backend for Gamified Environmental Educational Platform
# Using FastAPI for API, SQLAlchemy for MySQL ORM, JWT for auth.
# Features: User auth (register/login), profiles with points/badges, challenges creation/submission, school leaderboards.
# Aligned with SIH requirements: Gamification (points, badges, competitions), experiential learning (tasks/quizzes).
# Security: Basic JWT; passwords plain (add hashing e.g., passlib[bcrypt] in prod).
# Database: MySQL (PlanetScale free tier recommended).
# Deployment: Render (Python env), GitHub integration.
# Setup:
# 1. pip install fastapi uvicorn sqlalchemy mysql-connector-python python-dotenv python-jose[cryptography] pydantic passlib[bcrypt]  # For prod hashing
# 2. Create .env: DATABASE_URL=mysql+mysqlconnector://user:pass@host/db, JWT_SECRET=secret_key
# 3. Run: uvicorn main:app --reload
# 4. Docs: /docs (Swagger UI)
# 5. For Render: requirements.txt (pip freeze > requirements.txt), Start: uvicorn main:app --host 0.0.0.0 --port $PORT

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext  # For password hashing
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="EcoQuest API", description="Backend for Gamified Environmental Education Platform", version="1.0")

# Config
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "your_secret_key_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Password hashing

# Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    school = Column(String(255), nullable=False, index=True)
    points = Column(Integer, default=0)
    role = Column(Enum('student', 'teacher', 'admin', name='user_role'), default='student')
    created_at = Column(DateTime, default=func.now())
    badges = relationship("Badge", back_populates="user")
    submissions = relationship("Submission", back_populates="user")

class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    earned_date = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="badges")

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(Enum('quiz', 'task', name='challenge_type'), nullable=False)
    points = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # Teacher/Admin
    created_at = Column(DateTime, default=func.now())
    submissions = relationship("Submission", back_populates="challenge")
    creator = relationship("User")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    proof = Column(Text)  # e.g., quiz answers, task photo URL
    submitted_date = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")

Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    school: str
    role: str = "student"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    school: str
    points: int
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

class Login(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class BadgeOut(BaseModel):
    id: int
    name: str
    earned_date: datetime

    class Config:
        orm_mode = True

class ChallengeCreate(BaseModel):
    title: str
    description: str
    type: str
    points: int

class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    type: str
    points: int
    created_by: int
    created_at: datetime

    class Config:
        orm_mode = True

class SubmissionCreate(BaseModel):
    proof: str

class SubmissionOut(BaseModel):
    id: int
    proof: str
    submitted_date: datetime
    user_id: int
    challenge_id: int

    class Config:
        orm_mode = True

# Helpers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")

async def get_current_teacher_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ['teacher', 'admin']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return current_user

# Routes
@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password, school=user.school, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token({"sub": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(login: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login.email).first()
    if not user or not pwd_context.verify(login.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/users/badges", response_model=list[BadgeOut])
def get_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Badge).filter(Badge.user_id == current_user.id).all()

@app.get("/api/users/leaderboard/{school}", response_model=list[UserOut])
def get_leaderboard(school: str, db: Session = Depends(get_db)):
    return db.query(User).filter(User.school == school).order_by(User.points.desc()).limit(10).all()

@app.post("/api/challenges", response_model=ChallengeOut)
def create_challenge(challenge: ChallengeCreate, current_user: User = Depends(get_current_teacher_or_admin), db: Session = Depends(get_db)):
    new_challenge = Challenge(**challenge.dict(), created_by=current_user.id)
    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)
    return new_challenge

@app.get("/api/challenges", response_model=list[ChallengeOut])
def get_challenges(db: Session = Depends(get_db)):
    return db.query(Challenge).all()

@app.get("/api/challenges/{id}", response_model=ChallengeOut)
def get_challenge(id: int, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

@app.post("/api/challenges/{id}/submit", response_model=SubmissionOut)
def submit_challenge(id: int, submission: SubmissionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    # Check if already submitted (optional)
    existing = db.query(Submission).filter(Submission.user_id == current_user.id, Submission.challenge_id == id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")
    new_submission = Submission(proof=submission.proof, user_id=current_user.id, challenge_id=id)
    db.add(new_submission)
    current_user.points += challenge.points
    # Award badge if threshold met
    if current_user.points >= 100 and current_user.points - challenge.points < 100:
        new_badge = Badge(name="Eco-Warrior Level 1", user_id=current_user.id)
        db.add(new_badge)
    elif current_user.points >= 500 and current_user.points - challenge.points < 500:
        new_badge = Badge(name="Eco-Champion", user_id=current_user.id)
        db.add(new_badge)
    db.commit()
    db.refresh(new_submission)
    return new_submission

# Error Handling (example)
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"detail": exc.detail}

# Run with uvicorn main:app --host 0.0.0.0 --port 8000 for prod