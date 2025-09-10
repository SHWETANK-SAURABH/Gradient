from fastapi import APIRouter, Depends, HTTPException
from utils.supabase_utils import get_supabase_client, verify_jwt, is_admin

router = APIRouter()

@router.post("/", dependencies=[Depends(verify_jwt), Depends(is_admin)])
def add_update_exam(exam_data: dict):
    supabase = get_supabase_client()
    res = supabase.table("exams").upsert(exam_data).execute()
    return res.data

@router.get("/", dependencies=[Depends(verify_jwt)])
def get_exams():
    supabase = get_supabase_client()
    res = supabase.table("exams").select("*").execute()
    return res.data