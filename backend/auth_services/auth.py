import os
import uuid
from fastapi import HTTPException
from supabase import create_client
from dotenv import load_dotenv

# ---------------------------
# ENV + CLIENT
# ---------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# ---------------------------
# SIGNUP USER (PLAIN PASSWORD)
# ---------------------------
def signup_user(data):
    try:
        user_id = str(uuid.uuid4())

        # Check if email already exists
        existing = (
            supabase.table("users")
            .select("id")
            .eq("email", data.email)
            .execute()
        )

        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        supabase.table("users").insert({
            "id": user_id,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": data.email,
            "phone_number": data.phone_number,
            "city": data.city,
            "country": data.country,
            "additional_info": data.additional_info,
            "photo_url": data.photo_url,
            "password_hash": data.password  # ⚠️ plain text
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
# LOGIN USER (PLAIN PASSWORD)
# ---------------------------
def login_user(data):
    try:
        response = (
            supabase.table("users")
            .select("id, email, password_hash")
            .eq("email", data.email)
            .single()
            .execute()
        )

        user = response.data

        if not user or user["password_hash"] != data.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user_id": user["id"],
            "email": user["email"]
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")


# ---------------------------
# GET CURRENT USER
# ---------------------------
def get_current_user(user_id: str):
    response = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return response.data