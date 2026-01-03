import os
import uuid
from datetime import date, datetime, timedelta, time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client
from dotenv import load_dotenv
import bcrypt
import random

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

def calculate_estimated_budget(city_id: str, days: int, activities: List[str] = None) -> dict:
    """Calculate estimated budget based on city cost index and selected activities"""
    try:
        city = supabase.table("cities").select("cost_index, city_name").eq("id", city_id).single().execute()
        cost_index = city.data.get("cost_index", 50) if city.data else 50
        
        base_transport_per_day = 20
        base_stay_per_day = 80
        base_food_per_day = 50
        
        multiplier = cost_index / 50.0
        
        transport_cost = base_transport_per_day * days * multiplier
        stay_cost = base_stay_per_day * days * multiplier
        food_cost = base_food_per_day * days * multiplier
        
        activity_cost = 0
        if activities:
            for activity_id in activities:
                activity = supabase.table("activities").select("avg_cost").eq("id", activity_id).single().execute()
                if activity.data and activity.data.get("avg_cost"):
                    activity_cost += float(activity.data["avg_cost"])
        else:
            activity_cost = 30 * days * multiplier
        
        return {
            "transport_cost": round(transport_cost, 2),
            "stay_cost": round(stay_cost, 2),
            "food_cost": round(food_cost, 2),
            "activity_cost": round(activity_cost, 2),
            "total_cost": round(transport_cost + stay_cost + food_cost + activity_cost, 2),
            "days": days
        }
    except Exception as e:
        return {
            "transport_cost": 20 * days,
            "stay_cost": 80 * days,
            "food_cost": 50 * days,
            "activity_cost": 30 * days,
            "total_cost": 180 * days,
            "days": days
        }

def get_meal_recommendations(city_id: str, cost_index: int) -> Dict[str, Any]:
    """Get meal recommendations based on city"""
    multiplier = cost_index / 50.0
    
    meals = {
        "breakfast": {
            "name": "Local Breakfast Spot",
            "type": "Breakfast",
            "cost": round(10 * multiplier, 2),
            "duration": 1.0,
            "description": "Start your day with a traditional breakfast"
        },
        "lunch": {
            "name": "Midday Dining",
            "type": "Lunch",
            "cost": round(20 * multiplier, 2),
            "duration": 1.5,
            "description": "Refuel with local cuisine"
        },
        "dinner": {
            "name": "Evening Restaurant",
            "type": "Dinner",
            "cost": round(35 * multiplier, 2),
            "duration": 2.0,
            "description": "End your day with a delightful meal"
        }
    }
    return meals

def get_hotel_recommendation(city_id: str, cost_index: int) -> Dict[str, Any]:
    """Get hotel recommendation based on city"""
    multiplier = cost_index / 50.0
    base_cost = 80 * multiplier
    
    return {
        "name": "Recommended Hotel",
        "type": "Accommodation",
        "cost_per_night": round(base_cost, 2),
        "check_in": "15:00",
        "check_out": "11:00",
        "description": "Comfortable stay in the heart of the city"
    }

def generate_smart_schedule(
    stop_data: Dict[str, Any],
    selected_activities: List[Dict[str, Any]],
    city_id: str,
    cost_index: int
) -> List[Dict[str, Any]]:
    """
    Generate a smart daily schedule including:
    - Selected activities
    - Suggested additional activities
    - Meals (breakfast, lunch, dinner)
    - Hotel check-in/check-out
    - Free time
    """
    
    start_date = datetime.strptime(stop_data['start_date'], '%Y-%m-%d').date()
    end_date = datetime.strptime(stop_data['end_date'], '%Y-%m-%d').date()
    
    # Get additional activity suggestions
    try:
        suggested_activities_response = supabase.table("activities").select("*").eq("city_id", city_id).limit(20).execute()
        all_city_activities = suggested_activities_response.data or []
        
        # Filter out already selected activities
        selected_ids = [act['id'] for act in selected_activities]
        suggested_activities = [act for act in all_city_activities if act['id'] not in selected_ids]
        random.shuffle(suggested_activities)
    except:
        suggested_activities = []
    
    # Get meal and hotel info
    meals = get_meal_recommendations(city_id, cost_index)
    hotel = get_hotel_recommendation(city_id, cost_index)
    
    daily_schedules = []
    current_date = start_date
    day_number = 1
    
    # Distribute selected activities across days
    activities_per_day = {}
    total_days = (end_date - start_date).days + 1
    activities_to_distribute = selected_activities.copy()
    
    for day_offset in range(total_days):
        day_date = start_date + timedelta(days=day_offset)
        activities_per_day[day_date.isoformat()] = []
    
    # Distribute activities evenly
    for idx, activity in enumerate(activities_to_distribute):
        day_offset = idx % total_days
        day_date = start_date + timedelta(days=day_offset)
        activities_per_day[day_date.isoformat()].append(activity)
    
    # Build schedule for each day
    while current_date <= end_date:
        schedule_items = []
        current_time = time(8, 0)  # Start day at 8 AM
        
        # Day 1: Hotel Check-in
        if day_number == 1:
            schedule_items.append({
                "time": "15:00",
                "type": "accommodation",
                "title": hotel["name"],
                "description": f"Check-in • {hotel['description']}",
                "duration": 0.5,
                "cost": hotel["cost_per_night"],
                "is_selected": False,
                "is_meal": False,
                "is_hotel": True,
                "icon": "🏨"
            })
        
        # Breakfast
        schedule_items.append({
            "time": "08:00",
            "type": "meal",
            "title": meals["breakfast"]["name"],
            "description": meals["breakfast"]["description"],
            "duration": meals["breakfast"]["duration"],
            "cost": meals["breakfast"]["cost"],
            "is_selected": False,
            "is_meal": True,
            "is_hotel": False,
            "icon": "🍳"
        })
        current_time = time(9, 0)
        
        # Morning Activities (9 AM - 12 PM)
        day_activities = activities_per_day.get(current_date.isoformat(), [])
        morning_activities = day_activities[:1] if day_activities else []
        
        for activity in morning_activities:
            hour = current_time.hour
            minute = current_time.minute
            schedule_items.append({
                "time": f"{hour:02d}:{minute:02d}",
                "type": "activity",
                "title": activity.get("act_name", "Activity"),
                "description": activity.get("description", "Explore this attraction"),
                "duration": activity.get("duration_hours", 2.0),
                "cost": activity.get("avg_cost", 0),
                "category": activity.get("category", "General"),
                "is_selected": True,
                "is_meal": False,
                "is_hotel": False,
                "icon": "🎯"
            })
            
            # Advance time
            duration_hours = int(activity.get("duration_hours", 2.0))
            duration_minutes = int((activity.get("duration_hours", 2.0) % 1) * 60)
            current_time = time(
                (current_time.hour + duration_hours) % 24,
                (current_time.minute + duration_minutes) % 60
            )
        
        # Add a suggested activity if we have room before lunch
        if current_time.hour < 12 and suggested_activities:
            suggested = suggested_activities.pop(0)
            schedule_items.append({
                "time": f"{current_time.hour:02d}:{current_time.minute:02d}",
                "type": "activity",
                "title": f"💡 {suggested.get('act_name', 'Suggested Activity')}",
                "description": f"Recommended: {suggested.get('description', 'Explore this attraction')}",
                "duration": suggested.get("duration_hours", 1.5),
                "cost": suggested.get("avg_cost", 0),
                "category": suggested.get("category", "Suggested"),
                "is_selected": False,
                "is_meal": False,
                "is_hotel": False,
                "is_suggested": True,
                "icon": "💡"
            })
            current_time = time(12, 0)
        
        # Lunch
        schedule_items.append({
            "time": "13:00",
            "type": "meal",
            "title": meals["lunch"]["name"],
            "description": meals["lunch"]["description"],
            "duration": meals["lunch"]["duration"],
            "cost": meals["lunch"]["cost"],
            "is_selected": False,
            "is_meal": True,
            "is_hotel": False,
            "icon": "🍽️"
        })
        current_time = time(14, 30)
        
        # Afternoon Activities (2:30 PM - 6 PM)
        afternoon_activities = day_activities[1:2] if len(day_activities) > 1 else []
        
        for activity in afternoon_activities:
            hour = current_time.hour
            minute = current_time.minute
            schedule_items.append({
                "time": f"{hour:02d}:{minute:02d}",
                "type": "activity",
                "title": activity.get("act_name", "Activity"),
                "description": activity.get("description", "Explore this attraction"),
                "duration": activity.get("duration_hours", 2.0),
                "cost": activity.get("avg_cost", 0),
                "category": activity.get("category", "General"),
                "is_selected": True,
                "is_meal": False,
                "is_hotel": False,
                "icon": "🎯"
            })
            
            duration_hours = int(activity.get("duration_hours", 2.0))
            duration_minutes = int((activity.get("duration_hours", 2.0) % 1) * 60)
            current_time = time(
                (current_time.hour + duration_hours) % 24,
                (current_time.minute + duration_minutes) % 60
            )
        
        # Free Time / Rest
        if current_time.hour < 18:
            schedule_items.append({
                "time": f"{current_time.hour:02d}:{current_time.minute:02d}",
                "type": "free_time",
                "title": "Free Time",
                "description": "Relax or explore at your own pace",
                "duration": 1.5,
                "cost": 0,
                "is_selected": False,
                "is_meal": False,
                "is_hotel": False,
                "icon": "⏰"
            })
        
        # Dinner
        schedule_items.append({
            "time": "19:00",
            "type": "meal",
            "title": meals["dinner"]["name"],
            "description": meals["dinner"]["description"],
            "duration": meals["dinner"]["duration"],
            "cost": meals["dinner"]["cost"],
            "is_selected": False,
            "is_meal": True,
            "is_hotel": False,
            "icon": "🍷"
        })
        
        # Evening activity or rest
        if len(day_activities) > 2:
            evening_activity = day_activities[2]
            schedule_items.append({
                "time": "21:00",
                "type": "activity",
                "title": evening_activity.get("act_name", "Evening Activity"),
                "description": evening_activity.get("description", "Evening exploration"),
                "duration": evening_activity.get("duration_hours", 1.5),
                "cost": evening_activity.get("avg_cost", 0),
                "category": evening_activity.get("category", "General"),
                "is_selected": True,
                "is_meal": False,
                "is_hotel": False,
                "icon": "🌙"
            })
        else:
            schedule_items.append({
                "time": "21:00",
                "type": "free_time",
                "title": "Evening Leisure",
                "description": "Unwind and prepare for tomorrow",
                "duration": 1.0,
                "cost": 0,
                "is_selected": False,
                "is_meal": False,
                "is_hotel": False,
                "icon": "🌙"
            })
        
        # Last day: Check-out
        if current_date == end_date:
            schedule_items.insert(0, {
                "time": "11:00",
                "type": "accommodation",
                "title": hotel["name"],
                "description": "Check-out",
                "duration": 0.5,
                "cost": 0,
                "is_selected": False,
                "is_meal": False,
                "is_hotel": True,
                "icon": "🏨"
            })
        
        # Sort schedule by time
        schedule_items.sort(key=lambda x: x["time"])
        
        # Calculate daily total cost
        daily_cost = sum(item.get("cost", 0) for item in schedule_items)
        
        daily_schedules.append({
            "date": current_date.isoformat(),
            "day_number": day_number,
            "day_name": current_date.strftime("%A"),
            "schedule": schedule_items,
            "daily_cost": round(daily_cost, 2),
            "total_activities": len([s for s in schedule_items if s["type"] == "activity"])
        })
        
        current_date += timedelta(days=1)
        day_number += 1
    
    return daily_schedules

# ==================== AUTH ENDPOINTS ====================

@app.get("/")
def root():
    return {"status": "GlobeTrotter API is running ✅", "version": "2.0"}

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
    get_user_by_id(user_id)
    
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

# ==================== ACTIVITY RECOMMENDATIONS ====================

@app.get("/api/cities/{city_id}/recommendations")
def get_activity_recommendations(
    city_id: str,
    category: Optional[str] = Query(None),
    budget: Optional[str] = Query(None),
    limit: int = Query(10, le=50)
):
    """Get recommended activities for a city based on filters"""
    try:
        query = supabase.table("activities").select("*").eq("city_id", city_id)
        
        if category:
            query = query.eq("category", category)
        
        if budget:
            if budget == "low":
                query = query.lte("avg_cost", 30)
            elif budget == "medium":
                query = query.gte("avg_cost", 30).lte("avg_cost", 100)
            elif budget == "high":
                query = query.gte("avg_cost", 100)
        
        response = query.order("avg_cost", desc=False).limit(limit).execute()
        
        activities = response.data or []
        
        for activity in activities:
            score = 0
            if activity.get("avg_cost") and activity.get("duration_hours"):
                score = activity["duration_hours"] / max(activity["avg_cost"], 1) * 10
            activity["recommendation_score"] = round(score, 2)
        
        activities.sort(key=lambda x: x.get("recommendation_score", 0), reverse=True)
        
        return {
            "city_id": city_id,
            "recommendations": activities,
            "count": len(activities)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== BUDGET ESTIMATION ====================

@app.post("/api/budget/estimate")
def estimate_budget(
    city_id: str = Query(...),
    start_date: date = Query(...),
    end_date: date = Query(...),
    activity_ids: Optional[List[str]] = Query(None)
):
    """Calculate estimated budget for a trip"""
    try:
        days = (end_date - start_date).days + 1
        
        if days < 1:
            raise HTTPException(status_code=400, detail="Invalid date range")
        
        budget = calculate_estimated_budget(city_id, days, activity_ids)
        
        return {
            "city_id": city_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "estimated_budget": budget
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@app.post("/api/trips")
def create_trip(payload: TripCreate, user_id: str = Header(..., alias="X-User-Id")):
    """Create a new trip"""
    try:
        get_user_by_id(user_id)
        
        trip_id = str(uuid.uuid4())
        
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
        
        return {"message": "Trip created successfully", "trip_id": trip_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips")
def get_all_trips(
    user_id: str = Header(..., alias="X-User-Id"),
    status: Optional[str] = Query(None)
):
    """Get all trips for the authenticated user"""
    try:
        query = supabase.table("trips").select("*").eq("user_id", user_id)
        
        if status:
            if status == "ongoing":
                today = date.today().isoformat()
                query = query.lte("start_date", today).gte("end_date", today)
            elif status == "upcoming":
                today = date.today().isoformat()
                query = query.gt("start_date", today)
            elif status == "completed":
                today = date.today().isoformat()
                query = query.lt("end_date", today)
        
        response = query.order("start_date", desc=True).execute()
        return {"trips": response.data or []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}")
def get_trip(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """Get a specific trip by ID"""
    try:
        response = supabase.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trips/{trip_id}")
def update_trip(trip_id: str, payload: TripUpdate, user_id: str = Header(..., alias="X-User-Id")):
    """Update a trip"""
    """
CONTINUATION OF main.py - Place this after the previous part
"""

    try:
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        update_data = {k: v for k, v in payload.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        if "start_date" in update_data:
            update_data["start_date"] = update_data["start_date"].isoformat()
        if "end_date" in update_data:
            update_data["end_date"] = update_data["end_date"].isoformat()
        
        supabase.table("trips").update(update_data).eq("id", trip_id).execute()
        
        return {"message": "Trip updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trips/{trip_id}/stops")
def create_trip_stop(trip_id: str, payload: TripStopCreate, user_id: str = Header(..., alias="X-User-Id")):
    """Create a new stop for a trip"""
    try:
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        stop_id = str(uuid.uuid4())
        
        stop_data = {
            "id": stop_id,
            "trip_id": trip_id,
            "city_id": payload.city_id,
            "start_date": payload.start_date.isoformat(),
            "end_date": payload.end_date.isoformat(),
            "stop_order": payload.stop_order
        }
        
        supabase.table("trip_stops").insert(stop_data).execute()
        
        return {"message": "Trip stop created successfully", "stop_id": stop_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}/stops")
def get_trip_stops(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """Get all stops for a trip"""
    try:
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        response = supabase.table("trip_stops").select(
            "*, cities(*), trip_activities(*, activities(*))"
        ).eq("trip_id", trip_id).order("stop_order").execute()
        
        return {"stops": response.data or []}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting trip stops: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}/schedule")
def get_trip_schedule(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """
    Get detailed daily schedule for a trip including:
    - Selected activities with timing
    - Suggested additional activities
    - Meals (breakfast, lunch, dinner)
    - Hotel check-in/check-out times
    - Free time slots
    """
    try:
        # Verify trip belongs to user
        trip = supabase.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip_data = trip.data[0]
        
        # Get all stops with activities
        stops_response = supabase.table("trip_stops").select(
            "*, cities(*), trip_activities(*, activities(*))"
        ).eq("trip_id", trip_id).order("stop_order").execute()
        
        stops = stops_response.data or []
        
        # Generate schedule for each stop
        all_schedules = []
        
        for stop in stops:
            city_id = stop["city_id"]
            city_data = stop.get("cities", {})
            cost_index = city_data.get("cost_index", 50)
            
            # Get selected activities for this stop
            selected_activities = []
            if stop.get("trip_activities"):
                for trip_activity in stop["trip_activities"]:
                    if trip_activity.get("activities"):
                        selected_activities.append(trip_activity["activities"])
            
            # Generate smart schedule
            stop_schedule = generate_smart_schedule(
                stop_data=stop,
                selected_activities=selected_activities,
                city_id=city_id,
                cost_index=cost_index
            )
            
            all_schedules.append({
                "stop_id": stop["id"],
                "city_name": city_data.get("city_name", "Unknown"),
                "country": city_data.get("country", ""),
                "start_date": stop["start_date"],
                "end_date": stop["end_date"],
                "daily_schedules": stop_schedule
            })
        
        return {
            "trip_id": trip_id,
            "trip_title": trip_data.get("title", "Trip"),
            "total_stops": len(stops),
            "schedules": all_schedules
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating trip schedule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}/budget")
def get_trip_budget(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """Get budget for a trip"""
    try:
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        response = supabase.table("trip_budget").select("*").eq("trip_id", trip_id).execute()
        
        if not response.data or len(response.data) == 0:
            return {
                "trip_id": trip_id,
                "transport_cost": 0,
                "stay_cost": 0,
                "food_cost": 0,
                "activity_cost": 0
            }
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting trip budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trips/{trip_id}/budget")
def update_trip_budget(trip_id: str, payload: BudgetUpdate, user_id: str = Header(..., alias="X-User-Id")):
    """Update or create trip budget"""
    try:
        # Verify trip belongs to user
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        # Check if budget exists
        existing_budget = supabase.table("trip_budget").select("*").eq("trip_id", trip_id).execute()
        
        budget_data = {
            "trip_id": trip_id,
            "transport_cost": payload.transport_cost,
            "stay_cost": payload.stay_cost,
            "food_cost": payload.food_cost,
            "activity_cost": payload.activity_cost
        }
        
        if existing_budget.data and len(existing_budget.data) > 0:
            # Update existing
            supabase.table("trip_budget").update(budget_data).eq("trip_id", trip_id).execute()
        else:
            # Create new
            budget_data["id"] = str(uuid.uuid4())
            supabase.table("trip_budget").insert(budget_data).execute()
        
        return {"message": "Budget updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """Delete a trip"""
    try:
        trip = supabase.table("trips").select("id").eq("id", trip_id).eq("user_id", user_id).execute()
        
        if not trip.data or len(trip.data) == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        supabase.table("trips").delete().eq("id", trip_id).execute()
        
        return {"message": "Trip deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TRIP ACTIVITIES ENDPOINTS ====================

@app.post("/api/trip-activities")
def create_trip_activity(payload: TripActivityCreate, user_id: str = Header(..., alias="X-User-Id")):
    """Add an activity to a trip stop"""
    try:
        activity_id = str(uuid.uuid4())
        
        activity_data = {
            "id": activity_id,
            "trip_stop_id": payload.trip_stop_id,
            "activity_id": payload.activity_id,
            "scheduled_date": payload.scheduled_date.isoformat() if payload.scheduled_date else None,
            "estimated_cost": payload.estimated_cost
        }
        
        supabase.table("trip_activities").insert(activity_data).execute()
        
        return {"message": "Activity added to trip successfully", "activity_id": activity_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/trip-activities/{activity_id}")
def delete_trip_activity(activity_id: str, user_id: str = Header(..., alias="X-User-Id")):
    """Remove an activity from a trip"""
    try:
        supabase.table("trip_activities").delete().eq("id", activity_id).execute()
        
        return {"message": "Activity removed from trip successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PUBLIC ENDPOINTS ====================

@app.get("/api/public/trips")
def get_public_trips(limit: int = Query(20, le=50)):
    """Get all public trips"""
    try:
        response = supabase.table("trips").select(
            "*, users(first_name, last_name, photo_url)"
        ).eq("is_public", True).order("created_at", desc=True).limit(limit).execute()
        
        return {"trips": response.data or []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/public/trips/{trip_id}")
def get_public_trip(trip_id: str):
    """Get a specific public trip"""
    try:
        response = supabase.table("trips").select(
            "*, users(first_name, last_name, photo_url), trip_stops(*, cities(*), trip_activities(*, activities(*)))"
        ).eq("id", trip_id).eq("is_public", True).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Trip not found or is private")
        
        return response.data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": "GlobeTrotter API",
        "version": "2.0"
    }

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)