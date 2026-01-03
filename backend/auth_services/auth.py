import os
from fastapi import HTTPException
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase environment variables not set")

# Create ONE reusable Supabase client
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)

# ----------------------------------
# SIGNUP USER
# ----------------------------------
def signup_user(data):
    """
    data: SignupRequest schema
    """
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True
        })

        user_id = auth_response.user.id

        # Store additional profile data
        supabase.table("profiles").insert({
            "id": user_id,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "phone": data.phone,
            "city": data.city,
            "country": data.country,
            "additional_info": data.additional_info,
            "photo_url": data.photo_url
        }).execute()

        return {
            "message": "User registered successfully",
            "user_id": user_id
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------------------------
# LOGIN USER
# ----------------------------------
def login_user(data):
    """
    data: LoginRequest schema
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")


# ----------------------------------
# VERIFY JWT TOKEN
# ----------------------------------
def get_current_user(token: str):
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
