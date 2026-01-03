import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const TripListing = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const response = await tripsAPI.getAll();
            setTrips(response.trips || []);
        } catch (err) {
            setError(err.message || "Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const getTripStatus = (startDate, endDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > today) return "upcoming";
        if (start <= today && end >= today) return "ongoing";
        return "completed";
    };

    const filterTripsByStatus = (status) => {
        return trips.filter(trip => getTripStatus(trip.start_date, trip.end_date) === status);
    };

    const TripCard = ({ trip }) => {
        const status = getTripStatus(trip.start_date, trip.end_date);

        return (
            <div
                className="trip-card listing-card"
                onClick={() => navigate(`/itinerary-view/${trip.id}`)}
                style={{ cursor: 'pointer' }}
            >
                <img
                    src={trip.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop"}
                    alt={trip.title}
                    className="card-img-top"
                />
                <div className="card-body">
                    <span className={`status-badge status-${status}`}>
                        {status}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '5px 0' }}>
                        {trip.title}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </p>
                    {trip.description && (
                        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '8px' }}>
                            {trip.description.substring(0, 80)}...
                        </p>
                    )}
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ color: '#4F46E5', fontWeight: 600, fontSize: '0.9rem' }}>
                            View Plan &rarr;
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading trips...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trip-container">
                <div style={{
                    padding: '20px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626'
                }}>
                    {error}
                </div>
            </div>
        );
    }

    const ongoingTrips = filterTripsByStatus("ongoing");
    const upcomingTrips = filterTripsByStatus("upcoming");
    const completedTrips = filterTripsByStatus("completed");

    return (
        <div className="trip-container">
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

            {trips.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '2px dashed #D1D5DB'
                }}>
                    <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No trips yet</h3>
                    <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                        Start planning your first adventure!
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/create-trip')}
                    >
                        Create Your First Trip
                    </button>
                </div>
            ) : (
                <>
                    {/* 1. ONGOING */}
                    {ongoingTrips.length > 0 && (
                        <>
                            <h3 className="section-title" style={{ marginBottom: '15px' }}>
                                Happening Now
                            </h3>
                            <div className="dashboard-grid">
                                {ongoingTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* 2. UPCOMING */}
                    {upcomingTrips.length > 0 && (
                        <>
                            <h3 className="section-title" style={{ marginBottom: '15px' }}>
                                Coming Up
                            </h3>
                            <div className="dashboard-grid">
                                {upcomingTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* 3. COMPLETED */}
                    {completedTrips.length > 0 && (
                        <>
                            <h3 className="section-title" style={{ marginBottom: '15px' }}>
                                Past Adventures
                            </h3>
                            <div className="dashboard-grid">
                                {completedTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default TripListing;