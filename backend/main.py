from fastapi import FastAPI, Header
from schemas import SignupRequest, LoginRequest
from auth_services.auth import signup_user, login_user, get_current_user
from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

app = FastAPI(title="GlobeTrotter API")

# ---------------------------
# HEALTH CHECK
# ---------------------------
@app.get("/")
def root():
    return {"status": "FastAPI is running ✅"}

# ---------------------------
# SUPABASE CONNECTION TEST
# ---------------------------
@app.get("/test-supabase")
def test_supabase():
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    data = supabase.table("cities").select("*").limit(1).execute()
    return {"status": "Supabase connected ✅", "data": data.data}

# ---------------------------
# AUTH ROUTES
# ---------------------------
@app.post("/signup")
def signup(payload: SignupRequest):
    return signup_user(payload)

@app.post("/login")
def login(payload: LoginRequest):
    return login_user(payload)

@app.get("/me")
def me(user_id: str = Header(..., alias="X-User-Id")):
    user = get_current_user(user_id)
    return {
        "id": user["id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    }