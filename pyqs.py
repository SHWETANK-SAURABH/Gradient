from fastapi import APIRouter, Depends, Query
from utils.supabase_utils import get_supabase_client, verify_jwt, is_admin

router = APIRouter()

@router.post("/", dependencies=[Depends(verify_jwt), Depends(is_admin)])
def insert_update_pyq(pyq: dict):
    supabase = get_supabase_client()
    res = supabase.table("pyqs").upsert(pyq).execute()
    return res.data

@router.get("/", dependencies=[Depends(verify_jwt)])
def fetch_pyqs(subject: str = None, year: int = None, difficulty: str = None):
    supabase = get_supabase_client()
    query = supabase.table("pyqs").select("*")
    if subject:
        query = query.eq("subject", subject)
    if year:
        query = query.eq("year", year)
    if difficulty:
        query = query.eq("difficulty", difficulty)
    res = query.execute()
    return res.data