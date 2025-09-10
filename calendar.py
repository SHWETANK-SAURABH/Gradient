from fastapi import APIRouter, Depends
from utils.supabase_utils import get_supabase_client, verify_jwt, is_admin

router = APIRouter()

@router.post("/", dependencies=[Depends(verify_jwt), Depends(is_admin)])
def insert_update_event(event: dict):
    supabase = get_supabase_client()
    res = supabase.table("calendar").upsert(event).execute()
    return res.data

@router.get("/", dependencies=[Depends(verify_jwt)])
def fetch_calendar():
    supabase = get_supabase_client()
    res = supabase.table("calendar").select("*").execute()
    return res.data