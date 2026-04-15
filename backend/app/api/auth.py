from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth import verify_password, create_access_token, get_password_hash
from app.schemas import Token, UserCreate, User

router = APIRouter()

# Mock DB for initial Phase 1 testing
# Will be replaced with real DB session in Phase 2
mock_users = {
    "admin@edc.local": {
        "id": 1,
        "email": "admin@edc.local",
        "name": "Admin Concierge",
        "hashed_password": get_password_hash("admin123"),
        "department_id": 1,
        "created_at": "2024-04-15T00:00:00"
    }
}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = mock_users.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    if user.email in mock_users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In a real app, we'd save to DB here
    new_user = {
        "id": len(mock_users) + 1,
        "email": user.email,
        "name": user.name,
        "hashed_password": get_password_hash(user.password),
        "department_id": user.department_id,
        "created_at": "2024-04-15"
    }
    mock_users[user.email] = new_user
    return new_user
