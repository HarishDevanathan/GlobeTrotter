import os
import uuid
from fastapi import HTTPException
from supabase import create_client
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------
# PASSWORD HELPERS
# ---------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


# ---------------------------
# SIGNUP USER (USERS TABLE)
# ---------------------------
def signup_user(data):
    try:
        user_id = str(uuid.uuid4())

        # Check email exists
        existing = supabase.table("users").select("id").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        supabase.table("users").insert({
            "id": user_id,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": data.email,
            "phone_number": data.phone,
            "city": data.city,
            "country": data.country,
            "additional_info": data.additional_info,
            "photo_url": data.photo_url,
            "password_hash": hash_password(data.password)
        }).execute()

        return {
            "message": "User registered successfully",
            "user_id": user_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# LOGIN USER
# ---------------------------
def login_user(data):
    try:
        response = supabase.table("users") \
            .select("id, password_hash, email") \
            .eq("email", data.email) \
            .single() \
            .execute()

        user = response.data
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")
