from fastapi import HTTPException, status, Depends
import jwt
import os

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")  # Get from Supabase Project Settings

def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def require_admin(payload=Depends(verify_jwt)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
