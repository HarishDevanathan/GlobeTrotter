import React, { useState } from "react";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.j@traveler.com",
        city: "San Francisco",
        country: "USA",
        bio: "Passionate photographer and food lover exploring the world one city at a time.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
    });

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div className="trip-container">
            {/* 1. Header & Editable Details */}
            <div className="profile-header-card">
                <img src={user.image} alt="User Profile" className="profile-avatar-large" />
                <div className="profile-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                            {user.firstName} {user.lastName}
                        </h2>
                        <button
                            className={`edit-btn ${isEditing ? 'active' : ''}`}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                    <p style={{ color: '#6b7280', margin: '5px 0' }}>{user.city}, {user.country}</p>

                    {/* Editable Form Grid */}
                    <div className="form-grid" style={{ marginTop: '20px' }}>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                name="email" value={user.email}
                                className="form-input" disabled={!isEditing} onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                defaultValue="+1 405-555-0192"
                                className="form-input" disabled={!isEditing}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label className="form-label">About Me</label>
                        <textarea
                            name="bio"
                            value={user.bio}
                            className="form-textarea"
                            disabled={!isEditing} onChange={handleChange}
                            style={{ minHeight: '60px' }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. PREPLANNED TRIPS (Future) */}
            <h3 className="section-title">Upcoming Adventures</h3>
            <div className="dashboard-grid">
                {/* Reusing Listing Card Style */}
                <div className="listing-card trip-card">
                    <img src="https://images.unsplash.com/photo-1523906834698-679418d60c28?q=80&w=1000&auto=format&fit=crop" className="card-img-top" alt="Venice" />
                    <div className="card-body">
                        <span className="status-badge status-upcoming">3 Days Left</span>
                        <h3 style={{ fontWeight: 700 }}>Venetian Canals</h3>
                    </div>
                </div>
            </div>

            {/* 3. PREVIOUS TRIPS (History) */}
            <h3 className="section-title" style={{ marginTop: '40px' }}>Travel History</h3>
            <div className="dashboard-grid">
                <div className="listing-card trip-card" style={{ opacity: 0.8 }}>
                    <img src="https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?q=80&w=1000&auto=format&fit=crop" className="card-img-top" alt="Japan" />
                    <div className="card-body">
                        <span className="status-badge status-completed">Dec 2025</span>
                        <h3 style={{ fontWeight: 700 }}>Kyoto Temples</h3>
                    </div>
                </div>
                <div className="listing-card trip-card" style={{ opacity: 0.8 }}>
                    <img src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1000&auto=format&fit=crop" className="card-img-top" alt="Mountain" />
                    <div className="card-body">
                        <span className="status-badge status-completed">Nov 2024</span>
                        <h3 style={{ fontWeight: 700 }}>Rocky Mountains</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;