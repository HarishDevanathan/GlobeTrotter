import os
import uuid
from datetime import date
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client
from dotenv import load_dotenv
import bcrypt

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="GlobeTrotter API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== SCHEMAS ====================

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

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None

class CityCreate(BaseModel):
    city_name: str
    country: str
    cost_index: Optional[int] = None
    popularity: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ActivityCreate(BaseModel):
    city_id: str
    act_name: str
    category: Optional[str] = None
    avg_cost: Optional[float] = None
    duration_hours: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    cover_image: Optional[str] = None
    is_public: bool = False

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    cover_image: Optional[str] = None
    is_public: Optional[bool] = None

class TripStopCreate(BaseModel):
    trip_id: str
    city_id: str
    start_date: date
    end_date: date
    stop_order: int

class TripActivityCreate(BaseModel):
    trip_stop_id: str
    activity_id: str
    scheduled_date: Optional[date] = None
    estimated_cost: Optional[float] = None

class BudgetUpdate(BaseModel):
    transport_cost: Optional[float] = 0
    stay_cost: Optional[float] = 0
    food_cost: Optional[float] = 0
    activity_cost: Optional[float] = 0

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_id(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data

def serialize_dates(data: dict) -> dict:
    """Convert date objects to ISO format strings"""
    serialized = {}
    for key, value in data.items():
        if isinstance(value, date):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized

# ==================== AUTH ENDPOINTS ====================

@app.get("/")
def root():
    return {"status": "GlobeTrotter API is running ✅", "version": "1.0"}

@app.post("/api/auth/signup")
def signup(payload: SignupRequest):
    try:
        existing = supabase.table("users").select("id").eq("email", payload.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid.uuid4())
        hashed_pw = hash_password(payload.password)

        supabase.table("users").insert({
            "id": user_id,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "email": payload.email,
            "phone_number": payload.phone_number,
            "city": payload.city,
            "country": payload.country,
            "additional_info": payload.additional_info,
            "photo_url": payload.photo_url,
            "password_hash": hashed_pw
        }).execute()

        return {"message": "User registered successfully", "user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    try:
        response = supabase.table("users").select("id, email, password_hash, first_name, last_name").eq("email", payload.email).single().execute()
        user = response.data

        if not user or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user_id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"]
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/api/auth/me")
def get_current_user(user_id: str = Header(..., alias="X-User-Id")):
    user = get_user_by_id(user_id)
    user.pop("password_hash", None)
    return user

@app.put("/api/auth/me")
def update_current_user(payload: UserUpdate, user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)  # Verify user exists
    
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    supabase.table("users").update(update_data).eq("id", user_id).execute()
    return {"message": "User updated successfully"}

# ==================== CITIES ENDPOINTS ====================

@app.get("/api/cities")
def get_cities(
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(50, le=100)
):
    query = supabase.table("cities").select("*").eq("is_blacklisted", False)
    
    if search:
        query = query.ilike("city_name", f"%{search}%")
    if country:
        query = query.eq("country", country)
    
    response = query.limit(limit).execute()
    return {"cities": response.data}

@app.get("/api/cities/{city_id}")
def get_city(city_id: str):
    response = supabase.table("cities").select("*").eq("id", city_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="City not found")
    return response.data

@app.post("/api/cities")
def create_city(payload: CityCreate, user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)
    
    city_id = str(uuid.uuid4())
    supabase.table("cities").insert({
        "id": city_id,
        **payload.dict()
    }).execute()
    
    return {"message": "City created successfully", "city_id": city_id}

@app.get("/api/cities/{city_id}/activities")
def get_city_activities(city_id: str, category: Optional[str] = Query(None)):
    query = supabase.table("activities").select("*").eq("city_id", city_id)
    
    if category:
        query = query.eq("category", category)
    
    response = query.execute()
    return {"activities": response.data}

# ==================== ACTIVITIES ENDPOINTS ====================

@app.get("/api/activities")
def search_activities(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100)
):
    query = supabase.table("activities").select("*, cities(city_name, country)")
    
    if search:
        query = query.ilike("act_name", f"%{search}%")
    if category:
        query = query.eq("category", category)
    if city_id:
        query = query.eq("city_id", city_id)
    
    response = query.limit(limit).execute()
    return {"activities": response.data}

@app.get("/api/activities/{activity_id}")
def get_activity(activity_id: str):
    response = supabase.table("activities").select("*, cities(city_name, country)").eq("id", activity_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return response.data

@app.post("/api/activities")
def create_activity(payload: ActivityCreate, user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)
    
    activity_id = str(uuid.uuid4())
    supabase.table("activities").insert({
        "id": activity_id,
        **payload.dict()
    }).execute()
    
    return {"message": "Activity created successfully", "activity_id": activity_id}

# ==================== TRIPS ENDPOINTS ====================

@app.get("/api/trips")
def get_user_trips(
    user_id: str = Header(..., alias="X-User-Id"),
    status: Optional[str] = Query(None, regex="^(upcoming|ongoing|completed)$")
):
    get_user_by_id(user_id)
    
    response = supabase.table("trips").select("*").eq("user_id", user_id).order("start_date", desc=False).execute()
    
    trips = response.data
    
    if status:
        today = date.today()
        filtered = []
        for trip in trips:
            trip_start = date.fromisoformat(trip["start_date"])
            trip_end = date.fromisoformat(trip["end_date"])
            
            if status == "upcoming" and trip_start > today:
                filtered.append(trip)
            elif status == "ongoing" and trip_start <= today <= trip_end:
                filtered.append(trip)
            elif status == "completed" and trip_end < today:
                filtered.append(trip)
        
        return {"trips": filtered}
    
    return {"trips": trips}

@app.get("/api/trips/{trip_id}")
def get_trip(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    response = supabase.table("trips").select("*").eq("id", trip_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip = response.data
    if trip["user_id"] != user_id and not trip["is_public"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return trip

@app.post("/api/trips")
def create_trip(payload: TripCreate, user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)
    
    if payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    trip_id = str(uuid.uuid4())
    
    # Convert dates to strings for JSON serialization
    trip_data = {
        "id": trip_id,
        "user_id": user_id,
        "title": payload.title,
        "description": payload.description,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat(),
        "cover_image": payload.cover_image,
        "is_public": payload.is_public
    }
    
    supabase.table("trips").insert(trip_data).execute()
    
    # Create default budget entry
    supabase.table("trip_budget").insert({
        "id": str(uuid.uuid4()),
        "trip_id": trip_id
    }).execute()
    
    return {"message": "Trip created successfully", "trip_id": trip_id}

@app.put("/api/trips/{trip_id}")
def update_trip(trip_id: str, payload: TripUpdate, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Serialize dates
    update_data = serialize_dates(update_data)
    
    supabase.table("trips").update(update_data).eq("id", trip_id).execute()
    return {"message": "Trip updated successfully"}

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    supabase.table("trips").delete().eq("id", trip_id).execute()
    return {"message": "Trip deleted successfully"}

# ==================== TRIP STOPS ENDPOINTS ====================

@app.get("/api/trips/{trip_id}/stops")
def get_trip_stops(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id, is_public").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id and not trip.data["is_public"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    response = supabase.table("trip_stops").select("*, cities(city_name, country)").eq("trip_id", trip_id).order("stop_order").execute()
    return {"stops": response.data}

@app.post("/api/trips/{trip_id}/stops")
def create_trip_stop(trip_id: str, payload: TripStopCreate, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    stop_id = str(uuid.uuid4())
    
    # Serialize dates
    stop_data = {
        "id": stop_id,
        "trip_id": payload.trip_id,
        "city_id": payload.city_id,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat(),
        "stop_order": payload.stop_order
    }
    
    supabase.table("trip_stops").insert(stop_data).execute()
    
    return {"message": "Trip stop created successfully", "stop_id": stop_id}

@app.delete("/api/stops/{stop_id}")
def delete_trip_stop(stop_id: str, user_id: str = Header(..., alias="X-User-Id")):
    stop = supabase.table("trip_stops").select("trip_id, trips(user_id)").eq("id", stop_id).single().execute()
    
    if not stop.data:
        raise HTTPException(status_code=404, detail="Stop not found")
    if stop.data["trips"]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    supabase.table("trip_stops").delete().eq("id", stop_id).execute()
    return {"message": "Stop deleted successfully"}

# ==================== TRIP ACTIVITIES ENDPOINTS ====================

@app.get("/api/stops/{stop_id}/activities")
def get_stop_activities(stop_id: str, user_id: str = Header(..., alias="X-User-Id")):
    response = supabase.table("trip_activities").select("*, activities(*)").eq("trip_stop_id", stop_id).execute()
    return {"activities": response.data}

@app.post("/api/stops/{stop_id}/activities")
def add_activity_to_stop(stop_id: str, payload: TripActivityCreate, user_id: str = Header(..., alias="X-User-Id")):
    stop = supabase.table("trip_stops").select("trip_id, trips(user_id)").eq("id", stop_id).single().execute()
    
    if not stop.data:
        raise HTTPException(status_code=404, detail="Stop not found")
    if stop.data["trips"]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    activity_id = str(uuid.uuid4())
    
    # Serialize dates
    activity_data = {
        "id": activity_id,
        "trip_stop_id": payload.trip_stop_id,
        "activity_id": payload.activity_id,
        "scheduled_date": payload.scheduled_date.isoformat() if payload.scheduled_date else None,
        "estimated_cost": payload.estimated_cost
    }
    
    supabase.table("trip_activities").insert(activity_data).execute()
    
    return {"message": "Activity added successfully", "activity_id": activity_id}

@app.delete("/api/trip-activities/{activity_id}")
def remove_activity(activity_id: str, user_id: str = Header(..., alias="X-User-Id")):
    supabase.table("trip_activities").delete().eq("id", activity_id).execute()
    return {"message": "Activity removed successfully"}

# ==================== BUDGET ENDPOINTS ====================

@app.get("/api/trips/{trip_id}/budget")
def get_trip_budget(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id, is_public").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id and not trip.data["is_public"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    response = supabase.table("trip_budget").select("*").eq("trip_id", trip_id).single().execute()
    return response.data if response.data else {}

@app.put("/api/trips/{trip_id}/budget")
def update_trip_budget(trip_id: str, payload: BudgetUpdate, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    supabase.table("trip_budget").update(update_data).eq("trip_id", trip_id).execute()
    
    return {"message": "Budget updated successfully"}

# ==================== SAVED CITIES ENDPOINTS ====================

@app.get("/api/saved-cities")
def get_saved_cities(user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)
    
    response = supabase.table("saved_cities").select("*, cities(*)").eq("user_id", user_id).execute()
    return {"saved_cities": response.data}

@app.post("/api/saved-cities/{city_id}")
def save_city(city_id: str, user_id: str = Header(..., alias="X-User-Id")):
    get_user_by_id(user_id)
    
    existing = supabase.table("saved_cities").select("id").eq("user_id", user_id).eq("city_id", city_id).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="City already saved")
    
    saved_id = str(uuid.uuid4())
    supabase.table("saved_cities").insert({
        "id": saved_id,
        "user_id": user_id,
        "city_id": city_id
    }).execute()
    
    return {"message": "City saved successfully"}

@app.delete("/api/saved-cities/{city_id}")
def unsave_city(city_id: str, user_id: str = Header(..., alias="X-User-Id")):
    supabase.table("saved_cities").delete().eq("user_id", user_id).eq("city_id", city_id).execute()
    return {"message": "City removed from saved"}

# ==================== SHARED TRIPS ENDPOINTS ====================

@app.post("/api/trips/{trip_id}/share")
def share_trip(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    trip = supabase.table("trips").select("user_id, is_public").eq("id", trip_id).single().execute()
    
    if not trip.data:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if already shared
    existing = supabase.table("shared_trips").select("public_slug").eq("trip_id", trip_id).execute()
    if existing.data:
        return {"public_slug": existing.data[0]["public_slug"]}
    
    # Create shareable link
    public_slug = str(uuid.uuid4())[:8]
    supabase.table("shared_trips").insert({
        "id": str(uuid.uuid4()),
        "trip_id": trip_id,
        "public_slug": public_slug
    }).execute()
    
    # Make trip public
    supabase.table("trips").update({"is_public": True}).eq("id", trip_id).execute()
    
    return {"public_slug": public_slug}

@app.get("/api/shared/{public_slug}")
def get_shared_trip(public_slug: str):
    response = supabase.table("shared_trips").select("trip_id, trips(*)").eq("public_slug", public_slug).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Shared trip not found")
    
    return response.data["trips"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)