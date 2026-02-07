"""
Supabase client for backend. Uses service role so we can query any user's data.
Frontend sends user_id; backend filters by it.
"""
import os

from supabase import create_client, Client

_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase() -> Client:
    if not _url or not _key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) must be set")
    return create_client(_url, _key)
