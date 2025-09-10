import os
from supabase_py import create_client, Client
from fastapi import HTTPException, status, Depends

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def verify_jwt(token: str = Depends(...)):  # Fill in JWT extraction logic
    # Validate JWT token using Supabase's public key
    # Raise HTTPException if invalid
    pass

def is_admin(user = Depends(verify_jwt)):
    # Check user's role (admin/student) from JWT claims or Supabase DB
    pass
