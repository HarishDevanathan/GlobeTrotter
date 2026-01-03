import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const TripListing = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState({ ongoing: [], upcoming: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const response = await tripsAPI.getAll();
            const allTrips = response.trips || [];

            // Categorize trips
            const today = new Date();
            const categorized = {
                ongoing: [],
                upcoming: [],
                completed: []
            };

            allTrips.forEach(trip => {
                const startDate = new Date(trip.start_date);
                const endDate = new Date(trip.end_date);

                if (startDate <= today && endDate >= today) {
                    categorized.ongoing.push(trip);
                } else if (startDate > today) {
                    categorized.upcoming.push(trip);
                } else {
                    categorized.completed.push(trip);
                }
            });

            setTrips(categorized);
        } catch (err) {
            console.error("Failed to load trips:", err);
            setError(err.message || "Failed to load trips");
            
            // Fallback to mock data if API fails
            const mockTrips = {
                ongoing: [
                    { id: 1, title: "Backpacking in Bali", start_date: "2026-01-02", end_date: "2026-01-15", cover_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop" }
                ],
                upcoming: [
                    { id: 2, title: "Paris & London", start_date: "2026-03-10", end_date: "2026-03-20", cover_image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" }
                ],
                completed: [
                    { id: 3, title: "Tokyo Adventure", start_date: "2025-12-10", end_date: "2025-12-25", cover_image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop" }
                ]
            };
            setTrips(mockTrips);
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const TripCard = ({ trip }) => (
        <div 
            className="trip-card listing-card" 
            onClick={() => navigate(`/itinerary-view/${trip.id}`)} 
            style={{ cursor: 'pointer' }}
        >
            <img 
                src={trip.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop"} 
                alt={trip.title} 
                className="card-img-top" 
            />
            <div className="card-body">
                <span className={`status-badge status-${getStatus(trip)}`}>
                    {getStatus(trip)}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '5px 0' }}>
                    {trip.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    {formatDateRange(trip.start_date, trip.end_date)}
                </p>
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ color: '#4F46E5', fontWeight: 600, fontSize: '0.9rem' }}>
                        View Plan →
                    </span>
                </div>
            </div>
        </div>
    );

    const getStatus = (trip) => {
        const today = new Date();
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);

        if (startDate <= today && endDate >= today) return 'ongoing';
        if (startDate > today) return 'upcoming';
        return 'completed';
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading your trips...</p>
                </div>
            </div>
        );
    }

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

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">My Trips</h1>
                    <p className="page-subtitle">Manage your ongoing and past journeys.</p>
                </div>
                <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '10px 20px' }} 
                    onClick={() => navigate('/create-trip')}
                >
                    + Plan New Trip
                </button>
            </div>

            {/* ONGOING */}
            {trips.ongoing.length > 0 && (
                <>
                    <h3 className="section-title" style={{ marginBottom: '15px' }}>Happening Now</h3>
                    <div className="dashboard-grid">
                        {trips.ongoing.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </>
            )}

            {/* UPCOMING */}
            {trips.upcoming.length > 0 && (
                <>
                    <h3 className="section-title" style={{ marginBottom: '15px' }}>Coming Up</h3>
                    <div className="dashboard-grid">
                        {trips.upcoming.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </>
            )}

            {/* COMPLETED */}
            {trips.completed.length > 0 && (
                <>
                    <h3 className="section-title" style={{ marginBottom: '15px' }}>Past Adventures</h3>
                    <div className="dashboard-grid">
                        {trips.completed.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </>
            )}

            {/* Empty State */}
            {trips.ongoing.length === 0 && trips.upcoming.length === 0 && trips.completed.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '2px dashed #D1D5DB'
                }}>
                    <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No trips yet</h3>
                    <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                        Start planning your next adventure!
                    </p>
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/create-trip')}
                    >
                        Create Your First Trip
                    </button>
                </div>
            )}
        </div>
    );
};

export default TripListing;