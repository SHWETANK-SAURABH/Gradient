from .supabase_client import get_supabase_client

def upload_file(file_data, file_name, bucket="gradient-files"):
    supabase = get_supabase_client()
    res = supabase.storage.from_(bucket).upload(file_name, file_data)
    return res

def get_file_url(file_name, bucket="gradient-files"):
    supabase = get_supabase_client()
    url = supabase.storage.from_(bucket).get_public_url(file_name)
    return url
