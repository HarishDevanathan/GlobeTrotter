import React, { useState, useEffect } from "react";
import { activitiesAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const SearchActivity = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (category && category !== "all") params.category = category;

            const response = await activitiesAPI.search(params);
            setActivities(response.activities || []);
        } catch (err) {
            setError(err.message || "Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadActivities();
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    useEffect(() => {
        if (category !== "") {
            loadActivities();
        }
    }, [category]);

    return (
        <div className="trip-container">
            <div className="page-header">
                <h1 className="page-title">Discover Activities</h1>
                <p className="page-subtitle">Find top-rated things to do in your destination.</p>
            </div>

            {/* SEARCH TOOLBAR */}
            <form onSubmit={handleSearch}>
                <div className="search-toolbar">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="search-main-input"
                            placeholder="Search by city (e.g., Paris) or activity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={category}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        <option value="Culture">Culture & Art</option>
                        <option value="Food">Food & Drink</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Walking">Walking Tours</option>
                        <option value="Nature">Nature</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                        Search
                    </button>
                </div>
            </form>

            {error && (
                <div style={{
                    padding: '12px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626',
                    marginTop: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* RESULTS LIST */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading activities...</p>
                </div>
            ) : activities.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '2px dashed #D1D5DB',
                    marginTop: '20px'
                }}>
                    <h3 style={{ color: '#6B7280', marginBottom: '10px' }}>No activities found</h3>
                    <p style={{ color: '#9CA3AF' }}>
                        Try adjusting your search terms or category filter
                    </p>
                </div>
            ) : (
                <div>
                    <p style={{ color: '#6B7280', marginTop: '20px', marginBottom: '15px' }}>
                        Found {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                    </p>

                    {activities.map(item => (
                        <div key={item.id} className="result-card-horizontal">
                            <img
                                src={item.image_url || "https://images.unsplash.com/photo-1499856871940-b3ded97f193c?q=80&w=1000&auto=format&fit=crop"}
                                alt={item.act_name}
                                className="result-img-side"
                            />
                            <div className="result-content">
                                <div>
                                    <div className="result-header">
                                        <div>
                                            <div className="result-badges">
                                                {item.category && (
                                                    <span className="pill-badge">{item.category}</span>
                                                )}
                                                {item.duration_hours && (
                                                    <span className="pill-badge">
                                                        ⏱️ {item.duration_hours}h
                                                    </span>
                                                )}
                                            </div>
                                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '5px 0' }}>
                                                {item.act_name}
                                            </h2>
                                            {item.cities && (
                                                <p style={{ color: '#6b7280' }}>
                                                    📍 {item.cities.city_name}, {item.cities.country}
                                                </p>
                                            )}
                                        </div>
                                        {item.avg_cost && (
                                            <div className="price-tag">${item.avg_cost}</div>
                                        )}
                                    </div>
                                    {item.description && (
                                        <p style={{ marginTop: '15px', lineHeight: '1.5', color: '#4b5563' }}>
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '12px' }}
                                        onClick={() => alert('Add to itinerary feature coming soon!')}
                                    >
                                        + Add to Itinerary
                                    </button>
                                    <button
                                        style={{
                                            padding: '12px 20px',
                                            background: 'transparent',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                        onClick={() => alert('View details feature coming soon!')}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchActivity;