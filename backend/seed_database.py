"""
Database seeding script for GlobeTrotter
Run this to populate your database with sample cities and activities
"""

import os
from supabase import create_client
from dotenv import load_dotenv
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Sample Cities Data with cost index (0-100 scale, 50 is average)
CITIES_DATA = [
    {
        "id": str(uuid.uuid4()),
        "city_name": "Paris",
        "country": "France",
        "cost_index": 75,
        "popularity": 95,
        "latitude": 48.8566,
        "longitude": 2.3522
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Bali",
        "country": "Indonesia",
        "cost_index": 30,
        "popularity": 90,
        "latitude": -8.3405,
        "longitude": 115.0920
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Tokyo",
        "country": "Japan",
        "cost_index": 85,
        "popularity": 92,
        "latitude": 35.6762,
        "longitude": 139.6503
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "New York",
        "country": "USA",
        "cost_index": 90,
        "popularity": 94,
        "latitude": 40.7128,
        "longitude": -74.0060
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "London",
        "country": "UK",
        "cost_index": 85,
        "popularity": 93,
        "latitude": 51.5074,
        "longitude": -0.1278
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Bangkok",
        "country": "Thailand",
        "cost_index": 25,
        "popularity": 88,
        "latitude": 13.7563,
        "longitude": 100.5018
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Dubai",
        "country": "UAE",
        "cost_index": 70,
        "popularity": 86,
        "latitude": 25.2048,
        "longitude": 55.2708
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Barcelona",
        "country": "Spain",
        "cost_index": 65,
        "popularity": 89,
        "latitude": 41.3851,
        "longitude": 2.1734
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Sydney",
        "country": "Australia",
        "cost_index": 80,
        "popularity": 87,
        "latitude": -33.8688,
        "longitude": 151.2093
    },
    {
        "id": str(uuid.uuid4()),
        "city_name": "Rome",
        "country": "Italy",
        "cost_index": 70,
        "popularity": 91,
        "latitude": 41.9028,
        "longitude": 12.4964
    }
]

def create_activities_for_city(city_id, city_name):
    """Create sample activities for each city"""
    
    activities_by_city = {
        "Paris": [
            {
                "act_name": "Eiffel Tower Visit",
                "category": "Culture",
                "avg_cost": 26,
                "duration_hours": 2,
                "description": "Visit the iconic Eiffel Tower with priority access",
                "image_url": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f"
            },
            {
                "act_name": "Louvre Museum Tour",
                "category": "Culture",
                "avg_cost": 20,
                "duration_hours": 3,
                "description": "Explore world-famous art collections including the Mona Lisa",
                "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
            },
            {
                "act_name": "Seine River Cruise",
                "category": "Walking",
                "avg_cost": 15,
                "duration_hours": 1.5,
                "description": "Romantic boat cruise along the Seine with city views",
                "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"
            },
            {
                "act_name": "French Cooking Class",
                "category": "Food",
                "avg_cost": 85,
                "duration_hours": 3,
                "description": "Learn to cook classic French dishes with a local chef",
                "image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d"
            }
        ],
        "Bali": [
            {
                "act_name": "Sacred Monkey Forest",
                "category": "Nature",
                "avg_cost": 5,
                "duration_hours": 2,
                "description": "Walk through lush forest sanctuary home to playful monkeys",
                "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
            },
            {
                "act_name": "Tegalalang Rice Terraces",
                "category": "Nature",
                "avg_cost": 10,
                "duration_hours": 2,
                "description": "Stunning emerald rice terraces with photo opportunities",
                "image_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"
            },
            {
                "act_name": "Surfing Lesson in Canggu",
                "category": "Adventure",
                "avg_cost": 35,
                "duration_hours": 2,
                "description": "Beginner-friendly surf lessons on beautiful beaches",
                "image_url": "https://images.unsplash.com/photo-1502680390469-be75c86b636f"
            },
            {
                "act_name": "Traditional Balinese Spa",
                "category": "Culture",
                "avg_cost": 40,
                "duration_hours": 2,
                "description": "Relaxing massage and spa treatments",
                "image_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874"
            }
        ],
        "Tokyo": [
            {
                "act_name": "Senso-ji Temple Visit",
                "category": "Culture",
                "avg_cost": 0,
                "duration_hours": 1.5,
                "description": "Tokyo's oldest and most significant Buddhist temple",
                "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26"
            },
            {
                "act_name": "Tsukiji Fish Market Tour",
                "category": "Food",
                "avg_cost": 50,
                "duration_hours": 3,
                "description": "Experience the world's largest fish market with sushi breakfast",
                "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
            },
            {
                "act_name": "TeamLab Borderless Museum",
                "category": "Entertainment",
                "avg_cost": 35,
                "duration_hours": 2.5,
                "description": "Immersive digital art museum experience",
                "image_url": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc"
            },
            {
                "act_name": "Mount Fuji Day Trip",
                "category": "Nature",
                "avg_cost": 120,
                "duration_hours": 10,
                "description": "Full day tour to iconic Mount Fuji and surrounding lakes",
                "image_url": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65"
            }
        ],
        "New York": [
            {
                "act_name": "Statue of Liberty & Ellis Island",
                "category": "Culture",
                "avg_cost": 24,
                "duration_hours": 4,
                "description": "Ferry tour to America's most iconic landmarks",
                "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74"
            },
            {
                "act_name": "Central Park Bike Tour",
                "category": "Walking",
                "avg_cost": 45,
                "duration_hours": 2,
                "description": "Explore NYC's famous park by bicycle",
                "image_url": "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90"
            },
            {
                "act_name": "Broadway Show",
                "category": "Entertainment",
                "avg_cost": 150,
                "duration_hours": 3,
                "description": "Experience world-class musical theater",
                "image_url": "https://images.unsplash.com/photo-1503095396549-807759245b35"
            },
            {
                "act_name": "Food Tour in Brooklyn",
                "category": "Food",
                "avg_cost": 65,
                "duration_hours": 3,
                "description": "Sample diverse cuisines across Brooklyn's neighborhoods",
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591"
            }
        ],
        "Bangkok": [
            {
                "act_name": "Grand Palace & Wat Phra Kaew",
                "category": "Culture",
                "avg_cost": 15,
                "duration_hours": 3,
                "description": "Visit Thailand's most sacred Buddhist temple",
                "image_url": "https://images.unsplash.com/photo-1563492065599-3520f775eeed"
            },
            {
                "act_name": "Floating Market Tour",
                "category": "Culture",
                "avg_cost": 25,
                "duration_hours": 4,
                "description": "Experience traditional Thai market on the canals",
                "image_url": "https://images.unsplash.com/photo-1528181304800-259b08848526"
            },
            {
                "act_name": "Thai Cooking Class",
                "category": "Food",
                "avg_cost": 30,
                "duration_hours": 3,
                "description": "Learn to cook authentic Thai dishes",
                "image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d"
            },
            {
                "act_name": "Rooftop Bar Experience",
                "category": "Entertainment",
                "avg_cost": 40,
                "duration_hours": 2,
                "description": "Sunset drinks with panoramic city views",
                "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b"
            }
        ]
    }
    
    activities = activities_by_city.get(city_name, [])
    result = []
    
    for activity in activities:
        result.append({
            "id": str(uuid.uuid4()),
            "city_id": city_id,
            **activity
        })
    
    return result

def seed_database():
    """Seed the database with sample data"""
    
    print("🌍 Starting database seeding...")
    
    # Insert cities
    print("\n📍 Inserting cities...")
    try:
        for city in CITIES_DATA:
            supabase.table("cities").insert(city).execute()
            print(f"   ✓ Added {city['city_name']}, {city['country']}")
    except Exception as e:
        print(f"   ⚠️  Error inserting cities: {e}")
    
    # Insert activities
    print("\n🎯 Inserting activities...")
    try:
        for city in CITIES_DATA:
            activities = create_activities_for_city(city['id'], city['city_name'])
            if activities:
                for activity in activities:
                    supabase.table("activities").insert(activity).execute()
                print(f"   ✓ Added {len(activities)} activities for {city['city_name']}")
    except Exception as e:
        print(f"   ⚠️  Error inserting activities: {e}")
    
    print("\n✅ Database seeding complete!")
    print("\n📊 Summary:")
    print(f"   • {len(CITIES_DATA)} cities added")
    print(f"   • Activities added for major cities")
    print(f"   • Ready to use the recommendation system!")

if __name__ == "__main__":
    seed_database()