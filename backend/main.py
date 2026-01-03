from schemas import LoginRequest, SignupRequest
from auth_services.auth import signup_user, login_user, get_current_user
from fastapi import Header
from dotenv import load_dotenv
from fastapi import FastAPI
import os
from supabase import create_client


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

@app.post("/signup")
def signup(payload: SignupRequest):
    return signup_user(payload)

@app.post("/login")
def login(payload: LoginRequest):
    return login_user(payload)

@app.get("/me")
def me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token)
    return {
        "id": user.id,
        "email": user.email
    }
