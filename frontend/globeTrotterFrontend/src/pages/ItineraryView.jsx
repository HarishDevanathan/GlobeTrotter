import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsAPI, tripStopsAPI, budgetAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const ItineraryView = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    
    const [tripDetails, setTripDetails] = useState(null);
    const [stops, setStops] = useState([]);
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (tripId) {
            loadTripData();
        } else {
            // Fallback to mock data if no tripId
            loadMockData();
        }
    }, [tripId]);

    const loadTripData = async () => {
        try {
            setLoading(true);
            
            // Load trip details
            const trip = await tripsAPI.getById(tripId);
            setTripDetails(trip);

            // Load trip stops
            const stopsData = await tripStopsAPI.getAll(tripId);
            setStops(stopsData.stops || []);

            // Load budget
            const budgetData = await budgetAPI.get(tripId);
            setBudget(budgetData);

        } catch (err) {
            console.error("Failed to load trip data:", err);
            setError(err.message || "Failed to load trip");
            loadMockData();
        } finally {
            setLoading(false);
        }
    };

    const loadMockData = () => {
        // Mock data as fallback
        setTripDetails({
            id: 1,
            title: "Backpacking in Bali",
            start_date: "2026-01-02",
            end_date: "2026-01-15",
        });

        setStops([
            {
                id: 1,
                cities: { city_name: "Ubud" },
                start_date: "2026-01-02",
                activities: [
                    { id: 1, activities: { act_name: "Sacred Monkey Forest Sanctuary" }, estimated_cost: 15, scheduled_date: "2026-01-02" },
                    { id: 2, activities: { act_name: "Lunch at Bebek Bengil" }, estimated_cost: 30, scheduled_date: "2026-01-02" },
                ]
            },
            {
                id: 2,
                cities: { city_name: "Canggu" },
                start_date: "2026-01-03",
                activities: [
                    { id: 3, activities: { act_name: "Tegalalang Rice Terrace" }, estimated_cost: 10, scheduled_date: "2026-01-03" },
                    { id: 4, activities: { act_name: "Beach Club Dinner" }, estimated_cost: 80, scheduled_date: "2026-01-03" },
                ]
            }
        ]);

        setBudget({
            transport_cost: 500,
            stay_cost: 800,
            food_cost: 600,
            activity_cost: 600,
        });

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading itinerary...</p>
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
                    Trip not found
                </div>
            </div>
        );
    }

    const calculateTotalBudget = () => {
        if (budget) {
            return (budget.transport_cost || 0) + 
                   (budget.stay_cost || 0) + 
                   (budget.food_cost || 0) + 
                   (budget.activity_cost || 0);
        }
        return 0;
    };

    const calculateSpent = () => {
        let total = 0;
        stops.forEach(stop => {
            if (stop.activities) {
                stop.activities.forEach(activity => {
                    total += activity.estimated_cost || 0;
                });
            }
        });
        return total;
    };

    const totalBudget = calculateTotalBudget();
    const spent = calculateSpent();
    const remaining = totalBudget - spent;
    const percentUsed = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;

    const getDaysDuration = () => {
        const start = new Date(tripDetails.start_date);
        const end = new Date(tripDetails.end_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    const formatDateRange = () => {
        const start = new Date(tripDetails.start_date);
        const end = new Date(tripDetails.end_date);
        return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    return (
        <div className="trip-container">
            {error && (
                <div style={{
                    padding: '12px',
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    color: '#92400E',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error} (Showing sample data)
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
                        <p className="page-subtitle">{formatDateRange()} • {getDaysDuration()} Days</p>
                    </div>
                    <button 
                        className="btn-primary" 
                        style={{ width: 'auto', padding: '10px 20px' }}
                        onClick={() => navigate(`/build-itinerary/${tripId || tripDetails.id}`, { state: { tripData: tripDetails } })}
                    >
                        Edit Itinerary
                    </button>
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
                        <span className="text-danger">${spent.toFixed(0)} Spent</span>
                        <span className="text-success">${remaining.toFixed(0)} Left</span>
                    </div>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${percentUsed}%` }}></div>
                    </div>
                </div>
                <div className="budget-stat">
                    <span className="stat-label">Avg. / Day</span>
                    <span className="stat-value">${(totalBudget / getDaysDuration()).toFixed(0)}</span>
                </div>
            </div>

            {/* DAY-WISE ITINERARY */}
            <h3 className="section-title" style={{ marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                Daily Itinerary & Expenses
            </h3>

            {stops.length > 0 ? (
                stops.map((stop, index) => (
                    <div key={stop.id} className="day-container">
                        <h4 className="day-header">
                            Day {index + 1} 
                            <span style={{ fontWeight: 400, color: '#6b7280' }}>
                                — {new Date(stop.start_date).toLocaleDateString('default', { month: 'short', day: 'numeric' })} 
                                ({stop.cities?.city_name || 'Unknown'})
                            </span>
                        </h4>

                        {stop.activities && stop.activities.length > 0 ? (
                            stop.activities.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-info">
                                        <span className="activity-time">
                                            {activity.scheduled_date ? new Date(activity.scheduled_date).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' }) : 'All Day'}
                                        </span>
                                        <span style={{ fontWeight: 600, color: '#374151' }}>
                                            {activity.activities?.act_name || activity.title || 'Activity'}
                                        </span>
                                    </div>
                                    <div className="activity-cost">
                                        {activity.estimated_cost > 0 ? `-$${activity.estimated_cost}` : 'Free'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '10px' }}>
                                No activities planned yet
                            </p>
                        )}
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
                    <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No stops added yet</h3>
                    <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                        Click "Edit Itinerary" to add destinations and activities
                    </p>
                </div>
            )}
        </div>
    );
};

export default ItineraryView;