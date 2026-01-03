import os
from fastapi import FastAPI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

app = FastAPI(title="Connection Test API")

@app.get("/")
def root():
    return {"status": "FastAPI is running ✅"}

@app.get("/test-supabase")
def test_supabase():
    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        )

        # SIMPLE QUERY: fetch 1 row from cities (or users if cities empty)
        response = supabase.table("cities").select("*").limit(1).execute()

        return {
            "status": "Supabase connected ✅",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "Supabase connection failed ❌",
            "error": str(e)
        }