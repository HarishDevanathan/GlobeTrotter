import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsAPI, tripStopsAPI, budgetAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const ItineraryView = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    
    const [tripDetails, setTripDetails] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState("schedule"); // "schedule" or "simple"

    useEffect(() => {
        if (tripId) {
            loadTripData();
        } else {
            setError("No trip ID provided");
            setLoading(false);
        }
    }, [tripId]);

    const loadTripData = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Load trip details
            const trip = await tripsAPI.getById(tripId);
            setTripDetails(trip);

            // Load smart schedule
            try {
                const userId = localStorage.getItem('user_id');
                const response = await fetch(`http://localhost:8000/api/trips/${tripId}/schedule`, {
                    headers: {
                        'X-User-Id': userId
                    }
                });
                
                if (response.ok) {
                    const scheduleData = await response.json();
                    setSchedules(scheduleData.schedules || []);
                }
            } catch (err) {
                console.error("Failed to load schedule:", err);
            }

            // Load budget
            try {
                const budgetData = await budgetAPI.get(tripId);
                setBudget(budgetData);
            } catch (err) {
                console.error("Failed to load budget:", err);
                setBudget({
                    transport_cost: 0,
                    stay_cost: 0,
                    food_cost: 0,
                    activity_cost: 0
                });
            }

        } catch (err) {
            console.error("Failed to load trip data:", err);
            setError(err.message || "Failed to load trip");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ 
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f4f6',
                        borderTopColor: '#4F46E5',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading your personalized itinerary...</p>
                </div>
            </div>
        );
    }

    if (!tripDetails) {
        return (
            <div className="trip-container">
                <div style={{
                    padding: '20px',
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    color: '#DC2626'
                }}>
                    {error || "Trip not found"}
                </div>
                <button 
                    className="btn-primary" 
                    style={{ marginTop: '20px', width: 'auto', padding: '10px 20px' }}
                    onClick={() => navigate('/trips')}
                >
                    ← Back to Trips
                </button>
            </div>
        );
    }

    const calculateTotalBudget = () => {
        if (budget) {
            return (parseFloat(budget.transport_cost) || 0) + 
                   (parseFloat(budget.stay_cost) || 0) + 
                   (parseFloat(budget.food_cost) || 0) + 
                   (parseFloat(budget.activity_cost) || 0);
        }
        return 0;
    };

    const calculateSpent = () => {
        let total = 0;
        schedules.forEach(stop => {
            stop.daily_schedules?.forEach(day => {
                total += day.daily_cost || 0;
            });
        });
        return total;
    };

    const totalBudget = calculateTotalBudget();
    const spent = calculateSpent();
    const remaining = totalBudget - spent;
    const percentUsed = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;

    const getDaysDuration = () => {
        if (!tripDetails.start_date || !tripDetails.end_date) return 0;
        const start = new Date(tripDetails.start_date);
        const end = new Date(tripDetails.end_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    const formatDateRange = () => {
        if (!tripDetails.start_date || !tripDetails.end_date) return "Dates not set";
        const start = new Date(tripDetails.start_date);
        const end = new Date(tripDetails.end_date);
        return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const getIconForType = (type, icon) => {
        if (icon) return icon;
        const icons = {
            'activity': '🎯',
            'meal': '🍽️',
            'accommodation': '🏨',
            'free_time': '⏰',
            'transport': '🚗'
        };
        return icons[type] || '📍';
    };

    const days = getDaysDuration();

    return (
        <div className="trip-container">
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .timeline-item {
                    position: relative;
                    padding-left: 40px;
                    padding-bottom: 30px;
                }
                
                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: 15px;
                    top: 30px;
                    bottom: -10px;
                    width: 2px;
                    background: linear-gradient(to bottom, #E5E7EB 0%, #E5E7EB 100%);
                }
                
                .timeline-item:last-child::before {
                    display: none;
                }
                
                .timeline-icon {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #E5E7EB;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    z-index: 1;
                }
                
                .timeline-icon.selected {
                    background: #4F46E5;
                    border-color: #4F46E5;
                }
                
                .timeline-icon.meal {
                    background: #FEF3C7;
                    border-color: #FCD34D;
                }
                
                .timeline-icon.hotel {
                    background: #DBEAFE;
                    border-color: #60A5FA;
                }
                
                .timeline-content {
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 15px;
                    transition: all 0.2s;
                }
                
                .timeline-content:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-color: #4F46E5;
                }
                
                .timeline-content.suggested {
                    border: 2px dashed #D1D5DB;
                    background: #F9FAFB;
                }
                
                .view-toggle {
                    display: inline-flex;
                    background: #F3F4F6;
                    border-radius: 8px;
                    padding: 4px;
                }
                
                .view-toggle button {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                
                .view-toggle button.active {
                    background: white;
                    color: #4F46E5;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
            `}</style>

            {error && (
                <div style={{
                    padding: '12px',
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    color: '#92400E',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* HEADER & NAV */}
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/trips')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '5px 0',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    ← Back to Trips
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                    <div>
                        <h1 className="page-title">{tripDetails.title}</h1>
                        <p className="page-subtitle">{formatDateRange()} • {days} Day{days !== 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="view-toggle">
                            <button 
                                className={viewMode === "schedule" ? "active" : ""}
                                onClick={() => setViewMode("schedule")}
                            >
                                📅 Detailed Schedule
                            </button>
                            <button 
                                className={viewMode === "simple" ? "active" : ""}
                                onClick={() => setViewMode("simple")}
                            >
                                📋 Simple View
                            </button>
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ width: 'auto', padding: '10px 20px' }}
                            onClick={() => navigate(`/build-itinerary/${tripId}`, { 
                                state: { tripData: tripDetails } 
                            })}
                        >
                            Edit Itinerary
                        </button>
                    </div>
                </div>
            </div>

            {/* BUDGET OVERVIEW SECTION */}
            <div className="budget-summary">
                <div className="budget-stat">
                    <span className="stat-label">Total Budget</span>
                    <span className="stat-value">${totalBudget.toFixed(0)}</span>
                </div>
                <div className="budget-stat" style={{ flex: 2 }}>
                    <span className="stat-label" style={{ textAlign: 'left' }}>Spending Tracker</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                        <span className="text-danger">${spent.toFixed(0)} Planned</span>
                        <span className="text-success">${remaining.toFixed(0)} Buffer</span>
                    </div>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${percentUsed}%` }}></div>
                    </div>
                </div>
                <div className="budget-stat">
                    <span className="stat-label">Avg. / Day</span>
                    <span className="stat-value">${days > 0 ? (spent / days).toFixed(0) : '0'}</span>
                </div>
            </div>

            {/* ITINERARY CONTENT */}
            {viewMode === "schedule" ? (
                // DETAILED SCHEDULE VIEW
                <>
                    <h3 className="section-title" style={{ marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                        📍 Your Complete Itinerary
                    </h3>

                    {schedules.length > 0 ? (
                        schedules.map((stop, stopIndex) => (
                            <div key={stopIndex} style={{ marginBottom: '40px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                                        📍 {stop.city_name}, {stop.country}
                                    </h2>
                                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                                        {new Date(stop.start_date).toLocaleDateString('default', { month: 'long', day: 'numeric' })} - {new Date(stop.end_date).toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                                    </p>
                                </div>

                                {stop.daily_schedules?.map((daySchedule, dayIndex) => (
                                    <div key={dayIndex} className="day-container" style={{ marginBottom: '30px' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                            paddingBottom: '10px',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <h4 className="day-header" style={{ margin: 0 }}>
                                                Day {daySchedule.day_number} - {daySchedule.day_name}
                                                <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '10px' }}>
                                                    {new Date(daySchedule.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </h4>
                                            <div style={{ 
                                                background: '#EEF2FF', 
                                                padding: '6px 12px', 
                                                borderRadius: '20px',
                                                color: '#4F46E5',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            }}>
                                                ${daySchedule.daily_cost.toFixed(0)} • {daySchedule.total_activities} Activities
                                            </div>
                                        </div>

                                        <div>
                                            {daySchedule.schedule?.map((item, itemIndex) => (
                                                <div key={itemIndex} className="timeline-item">
                                                    <div className={`timeline-icon ${item.is_selected ? 'selected' : ''} ${item.is_meal ? 'meal' : ''} ${item.is_hotel ? 'hotel' : ''}`}>
                                                        {getIconForType(item.type, item.icon)}
                                                    </div>
                                                    
                                                    <div className={`timeline-content ${item.is_suggested ? 'suggested' : ''}`}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                                    <span style={{ 
                                                                        fontWeight: 700, 
                                                                        color: '#4F46E5',
                                                                        fontSize: '0.9rem',
                                                                        background: '#EEF2FF',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px'
                                                                    }}>
                                                                        {item.time}
                                                                    </span>
                                                                    {item.category && (
                                                                        <span className="pill-badge" style={{ fontSize: '0.75rem' }}>
                                                                            {item.category}
                                                                        </span>
                                                                    )}
                                                                    {item.is_selected && (
                                                                        <span style={{ 
                                                                            background: '#10B981', 
                                                                            color: 'white',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 600
                                                                        }}>
                                                                            YOUR CHOICE
                                                                        </span>
                                                                    )}
                                                                    {item.is_suggested && (
                                                                        <span style={{ 
                                                                            background: '#F59E0B', 
                                                                            color: 'white',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 600
                                                                        }}>
                                                                            SUGGESTED
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                <h4 style={{ 
                                                                    margin: '8px 0 5px 0', 
                                                                    fontSize: '1.05rem',
                                                                    fontWeight: 700,
                                                                    color: '#111827'
                                                                }}>
                                                                    {item.title}
                                                                </h4>
                                                                
                                                                <p style={{ 
                                                                    margin: '5px 0', 
                                                                    color: '#6B7280',
                                                                    fontSize: '0.9rem',
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    {item.description}
                                                                </p>
                                                                
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    gap: '15px', 
                                                                    marginTop: '10px',
                                                                    fontSize: '0.85rem',
                                                                    color: '#6B7280'
                                                                }}>
                                                                    <span>⏱️ {item.duration}h</span>
                                                                    <span style={{ 
                                                                        color: item.cost > 0 ? '#DC2626' : '#10B981',
                                                                        fontWeight: 600 
                                                                    }}>
                                                                        {item.cost > 0 ? `$${item.cost}` : 'Free'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#F9FAFB',
                            borderRadius: '12px',
                            border: '2px dashed #D1D5DB'
                        }}>
                            <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No detailed schedule yet</h3>
                            <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                                Add stops and activities to generate your personalized itinerary
                            </p>
                            <button 
                                className="btn-primary"
                                style={{ width: 'auto', padding: '10px 20px' }}
                                onClick={() => navigate(`/build-itinerary/${tripId}`, { 
                                    state: { tripData: tripDetails } 
                                })}
                            >
                                Start Building Itinerary
                            </button>
                        </div>
                    )}
                </>
            ) : (
                // SIMPLE LIST VIEW
                <>
                    <h3 className="section-title" style={{ marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                        Daily Activities Overview
                    </h3>

                    {schedules.length > 0 ? (
                        schedules.map((stop, stopIndex) => (
                            <div key={stopIndex} style={{ marginBottom: '30px' }}>
                                <h3 style={{ 
                                    color: '#4F46E5', 
                                    marginBottom: '15px',
                                    fontSize: '1.2rem',
                                    fontWeight: 700
                                }}>
                                    📍 {stop.city_name}
                                </h3>

                                {stop.daily_schedules?.map((daySchedule, dayIndex) => (
                                    <div key={dayIndex} className="day-container">
                                        <h4 className="day-header">
                                            Day {daySchedule.day_number}
                                            <span style={{ fontWeight: 400, color: '#6b7280' }}>
                                                — {new Date(daySchedule.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </h4>

                                        {daySchedule.schedule?.filter(item => item.type === 'activity').map((activity, actIndex) => (
                                            <div key={actIndex} className="activity-item">
                                                <div className="activity-info">
                                                    <span className="activity-time">{activity.time}</span>
                                                    <span style={{ fontWeight: 600, color: '#374151' }}>
                                                        {activity.title}
                                                    </span>
                                                </div>
                                                <div className="activity-cost">
                                                    {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            background: '#F9FAFB',
                            borderRadius: '12px',
                            border: '2px dashed #D1D5DB'
                        }}>
                            <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No activities added yet</h3>
                            <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                                Click "Edit Itinerary" to add destinations and activities
                            </p>
                            <button 
                                className="btn-primary"
                                style={{ width: 'auto', padding: '10px 20px' }}
                                onClick={() => navigate(`/build-itinerary/${tripId}`, { 
                                    state: { tripData: tripDetails } 
                                })}
                            >
                                Start Building Itinerary
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ItineraryView;