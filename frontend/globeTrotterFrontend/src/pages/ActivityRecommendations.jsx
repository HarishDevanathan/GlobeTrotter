import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const ActivityRecommendations = () => {
    const { cityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get data passed from BuildItinerary
    const sectionId = location.state?.sectionId;
    const tripId = location.state?.tripId;
    const tripData = location.state?.tripData;
    const returnTo = location.state?.returnTo;
    
    const [city, setCity] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [filters, setFilters] = useState({
        category: "",
        budget: ""
    });
    const [estimatedBudget, setEstimatedBudget] = useState(null);
    const [tripDates, setTripDates] = useState({
        start_date: location.state?.start_date || "",
        end_date: location.state?.end_date || ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (cityId) {
            loadCityAndRecommendations();
        }
    }, [cityId, filters]);

    useEffect(() => {
        if (selectedActivities.length > 0 && tripDates.start_date && tripDates.end_date) {
            calculateBudget();
        }
    }, [selectedActivities, tripDates]);

    const loadCityAndRecommendations = async () => {
        try {
            setLoading(true);
            
            const cityResponse = await fetch(`http://localhost:8000/api/cities/${cityId}`);
            const cityData = await cityResponse.json();
            setCity(cityData);

            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.budget) params.append('budget', filters.budget);
            params.append('limit', '20');

            const recResponse = await fetch(
                `http://localhost:8000/api/cities/${cityId}/recommendations?${params.toString()}`
            );
            const recData = await recResponse.json();
            setRecommendations(recData.recommendations || []);

        } catch (err) {
            console.error("Failed to load recommendations:", err);
            setError("Failed to load recommendations");
        } finally {
            setLoading(false);
        }
    };

    const calculateBudget = async () => {
        try {
            const params = new URLSearchParams({
                city_id: cityId,
                start_date: tripDates.start_date,
                end_date: tripDates.end_date
            });

            selectedActivities.forEach(actId => {
                params.append('activity_ids', actId);
            });

            const response = await fetch(
                `http://localhost:8000/api/budget/estimate?${params.toString()}`,
                { method: 'POST' }
            );
            const data = await response.json();
            setEstimatedBudget(data.estimated_budget);

        } catch (err) {
            console.error("Failed to calculate budget:", err);
        }
    };

    const toggleActivity = (activityId) => {
        setSelectedActivities(prev => {
            if (prev.includes(activityId)) {
                return prev.filter(id => id !== activityId);
            } else {
                return [...prev, activityId];
            }
        });
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const getTotalActivityCost = () => {
        return selectedActivities.reduce((total, actId) => {
            const activity = recommendations.find(a => a.id === actId);
            return total + (activity?.avg_cost || 0);
        }, 0);
    };

    const getDays = () => {
        if (tripDates.start_date && tripDates.end_date) {
            const start = new Date(tripDates.start_date);
            const end = new Date(tripDates.end_date);
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    };

    const handleAddActivities = () => {
        // Navigate back to BuildItinerary with selected activities
        if (returnTo) {
            navigate(returnTo, {
                state: {
                    tripData,
                    selectedActivitiesForSection: {
                        sectionId,
                        activities: selectedActivities,
                        activityCost: getTotalActivityCost()
                    }
                }
            });
        } else {
            alert(`Selected ${selectedActivities.length} activities. Total: $${getTotalActivityCost()}`);
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading recommendations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="trip-container">
            <div className="page-header">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    ← Back
                </button>
                <h1 className="page-title">
                    Recommended Activities in {city?.city_name}
                </h1>
                <p className="page-subtitle">
                    {city?.country} • Select activities to build your itinerary
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '12px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {tripDates.start_date && tripDates.end_date && (
                <div className="trip-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: 700 }}>
                        📅 Trip Duration
                    </h3>
                    <div className="form-grid">
                        <div>
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={tripDates.start_date}
                                onChange={(e) => setTripDates(prev => ({ ...prev, start_date: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={tripDates.end_date}
                                onChange={(e) => setTripDates(prev => ({ ...prev, end_date: e.target.value }))}
                                min={tripDates.start_date || new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    {getDays() > 0 && (
                        <p style={{ marginTop: '10px', color: '#4F46E5', fontWeight: 600 }}>
                            Duration: {getDays()} day{getDays() !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            )}

            {estimatedBudget && (
                <div className="budget-summary" style={{ marginBottom: '25px' }}>
                    <div className="budget-stat">
                        <span className="stat-label">Transport</span>
                        <span className="stat-value">${estimatedBudget.transport_cost.toFixed(0)}</span>
                    </div>
                    <div className="budget-stat">
                        <span className="stat-label">Accommodation</span>
                        <span className="stat-value">${estimatedBudget.stay_cost.toFixed(0)}</span>
                    </div>
                    <div className="budget-stat">
                        <span className="stat-label">Food</span>
                        <span className="stat-value">${estimatedBudget.food_cost.toFixed(0)}</span>
                    </div>
                    <div className="budget-stat">
                        <span className="stat-label">Activities</span>
                        <span className="stat-value">${estimatedBudget.activity_cost.toFixed(0)}</span>
                    </div>
                    <div className="budget-stat" style={{ background: '#EEF2FF' }}>
                        <span className="stat-label" style={{ color: '#4F46E5' }}>Total Estimate</span>
                        <span className="stat-value" style={{ color: '#4F46E5', fontSize: '1.6rem' }}>
                            ${estimatedBudget.total_cost.toFixed(0)}
                        </span>
                    </div>
                </div>
            )}

            <div className="search-toolbar" style={{ marginBottom: '25px' }}>
                <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Culture">Culture & Art</option>
                    <option value="Food">Food & Drink</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Walking">Walking Tours</option>
                    <option value="Nature">Nature</option>
                    <option value="Entertainment">Entertainment</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.budget}
                    onChange={(e) => handleFilterChange('budget', e.target.value)}
                >
                    <option value="">All Budgets</option>
                    <option value="low">Low ($0 - $30)</option>
                    <option value="medium">Medium ($30 - $100)</option>
                    <option value="high">High ($100+)</option>
                </select>

                <div style={{ 
                    background: '#F3F4F6', 
                    padding: '10px 16px', 
                    borderRadius: '8px',
                    fontWeight: 600,
                    color: '#374151'
                }}>
                    {selectedActivities.length} Selected
                </div>
            </div>

            {recommendations.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {recommendations.map(activity => {
                        const isSelected = selectedActivities.includes(activity.id);
                        return (
                            <div
                                key={activity.id}
                                onClick={() => toggleActivity(activity.id)}
                                style={{
                                    border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isSelected ? '#EEF2FF' : '#fff',
                                    position: 'relative'
                                }}
                            >
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#4F46E5',
                                        color: 'white',
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        zIndex: 10
                                    }}>
                                        ✓ Selected
                                    </div>
                                )}

                                <img
                                    src={activity.image_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000"}
                                    alt={activity.act_name}
                                    style={{
                                        width: '100%',
                                        height: '180px',
                                        objectFit: 'cover'
                                    }}
                                />

                                <div style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {activity.category && (
                                            <span className="pill-badge">{activity.category}</span>
                                        )}
                                        {activity.duration_hours && (
                                            <span className="pill-badge">⏱️ {activity.duration_hours}h</span>
                                        )}
                                        {activity.recommendation_score && (
                                            <span className="pill-badge" style={{ background: '#DCFCE7', color: '#166534' }}>
                                                ⭐ {activity.recommendation_score}
                                            </span>
                                        )}
                                    </div>

                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0' }}>
                                        {activity.act_name}
                                    </h3>

                                    {activity.description && (
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#6B7280',
                                            marginBottom: '12px',
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {activity.description}
                                        </p>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '12px',
                                        borderTop: '1px solid #E5E7EB'
                                    }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                            Estimated Cost
                                        </span>
                                        <span style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            color: '#4F46E5'
                                        }}>
                                            ${activity.avg_cost || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '2px dashed #D1D5DB'
                }}>
                    <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>
                        No activities found
                    </h3>
                    <p style={{ color: '#9CA3AF' }}>
                        Try adjusting your filters
                    </p>
                </div>
            )}

            {selectedActivities.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 100
                }}>
                    <button
                        className="btn-primary"
                        style={{
                            padding: '16px 32px',
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
                        }}
                        onClick={handleAddActivities}
                    >
                        Add {selectedActivities.length} Activities (${getTotalActivityCost().toFixed(0)})
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityRecommendations;