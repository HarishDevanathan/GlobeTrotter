import React, { useState, useEffect } from "react";
import { authAPI, tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState({ upcoming: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadUserData();
        loadUserTrips();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } catch (err) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadUserTrips = async () => {
        try {
            const response = await tripsAPI.getAll();
            const allTrips = response.trips || [];

            const today = new Date();
            const upcoming = allTrips.filter(trip => new Date(trip.start_date) > today);
            const completed = allTrips.filter(trip => new Date(trip.end_date) < today);

            setTrips({ upcoming, completed });
        } catch (err) {
            console.error("Failed to load trips:", err);
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            await authAPI.updateProfile({
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                city: user.city,
                country: user.country,
                additional_info: user.additional_info,
                photo_url: user.photo_url,
            });

            setIsEditing(false);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="trip-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="trip-container">
                <div style={{
                    padding: '20px',
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    color: '#DC2626'
                }}>
                    Failed to load profile. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="trip-container">
            {error && (
                <div style={{
                    padding: '12px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626',
                    fontSize: '0.9rem',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* 1. Header & Editable Details */}
            <div className="profile-header-card">
                <img
                    src={user.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"}
                    alt="User Profile"
                    className="profile-avatar-large"
                />
                <div className="profile-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                            {user.first_name} {user.last_name}
                        </h2>
                        <button
                            className={`edit-btn ${isEditing ? 'active' : ''}`}
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                    <p style={{ color: '#6b7280', margin: '5px 0' }}>
                        {user.city && user.country ? `${user.city}, ${user.country}` : 'Location not set'}
                    </p>

                    {/* Editable Form Grid */}
                    <div className="form-grid" style={{ marginTop: '20px' }}>
                        <div>
                            <label className="form-label">First Name</label>
                            <input
                                name="first_name"
                                value={user.first_name}
                                className="form-input"
                                disabled={!isEditing}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input
                                name="last_name"
                                value={user.last_name}
                                className="form-input"
                                disabled={!isEditing}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-grid" style={{ marginTop: '15px' }}>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                name="email"
                                value={user.email}
                                className="form-input"
                                disabled={true}
                            />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                name="phone_number"
                                value={user.phone_number || ""}
                                className="form-input"
                                disabled={!isEditing}
                                onChange={handleChange}
                                placeholder="+1 405-555-0192"
                            />
                        </div>
                    </div>

                    <div className="form-grid" style={{ marginTop: '15px' }}>
                        <div>
                            <label className="form-label">City</label>
                            <input
                                name="city"
                                value={user.city || ""}
                                className="form-input"
                                disabled={!isEditing}
                                onChange={handleChange}
                                placeholder="San Francisco"
                            />
                        </div>
                        <div>
                            <label className="form-label">Country</label>
                            <input
                                name="country"
                                value={user.country || ""}
                                className="form-input"
                                disabled={!isEditing}
                                onChange={handleChange}
                                placeholder="USA"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label className="form-label">About Me</label>
                        <textarea
                            name="additional_info"
                            value={user.additional_info || ""}
                            className="form-textarea"
                            disabled={!isEditing}
                            onChange={handleChange}
                            style={{ minHeight: '60px' }}
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
            </div>

            {/* 2. UPCOMING TRIPS */}
            <h3 className="section-title">Upcoming Adventures</h3>
            {trips.upcoming.length > 0 ? (
                <div className="dashboard-grid">
                    {trips.upcoming.slice(0, 3).map(trip => (
                        <div key={trip.id} className="listing-card trip-card">
                            <img
                                src={trip.cover_image || "https://images.unsplash.com/photo-1523906834698-679418d60c28?q=80&w=1000&auto=format&fit=crop"}
                                className="card-img-top"
                                alt={trip.title}
                            />
                            <div className="card-body">
                                <span className="status-badge status-upcoming">
                                    {Math.ceil((new Date(trip.start_date) - new Date()) / (1000 * 60 * 60 * 24))} Days Left
                                </span>
                                <h3 style={{ fontWeight: 700 }}>{trip.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    {new Date(trip.start_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No upcoming trips planned yet.
                </p>
            )}

            {/* 3. PREVIOUS TRIPS */}
            <h3 className="section-title" style={{ marginTop: '40px' }}>Travel History</h3>
            {trips.completed.length > 0 ? (
                <div className="dashboard-grid">
                    {trips.completed.slice(0, 4).map(trip => (
                        <div key={trip.id} className="listing-card trip-card" style={{ opacity: 0.8 }}>
                            <img
                                src={trip.cover_image || "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?q=80&w=1000&auto=format&fit=crop"}
                                className="card-img-top"
                                alt={trip.title}
                            />
                            <div className="card-body">
                                <span className="status-badge status-completed">
                                    {new Date(trip.end_date).toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                                </span>
                                <h3 style={{ fontWeight: 700 }}>{trip.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No completed trips yet.
                </p>
            )}
        </div>
    );
};

export default Profile;