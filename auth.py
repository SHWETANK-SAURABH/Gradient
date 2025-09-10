from fastapi import APIRouter, Depends, HTTPException, status
from supabase_py import create_client, Client
import os

router = APIRouter()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/login")
def login(email: str, password: str):
    # Leverage Supabase Auth API
    user = supabase.auth.sign_in(email=email, password=password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": user['access_token'], "user": user['user']}

@router.post("/signup")
def signup(email: str, password: str):
    # Supabase handles signup
    user = supabase.auth.sign_up(email=email, password=password)
    return user

# Add Google login and JWT verification utility functions as needed
