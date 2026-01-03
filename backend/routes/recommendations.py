from fastapi import APIRouter, Depends
from services.recommend import recommend_activities
from db.connection import get_db

recommend_router = APIRouter(prefix="/recommend", tags=["recommendations"])

@recommend_router.get("/activities/{user_id}")
def get_activity_recommendations(user_id: str, db=Depends(get_db)):
    return recommend_activities(user_id, db)
