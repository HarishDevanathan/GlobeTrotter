from pydantic import BaseModel, EmailStr
from typing import Optional


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str