import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const SearchActivity = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    // Mock Results Data
    const results = [
        {
            id: 1,
            title: "Guided Louvre Museum Tour",
            location: "Paris, France",
            rating: 4.8,
            reviews: 1240,
            price: 45,
            image: "https://images.unsplash.com/photo-1499856871940-b3ded97f193c?q=80&w=1000&auto=format&fit=crop",
            category: "Culture",
            description: "Skip the line and deep dive into art history with an expert guide."
        },
        {
            id: 2,
            title: "Seine River Dinner Cruise",
            location: "Paris, France",
            rating: 4.5,
            reviews: 890,
            price: 85,
            image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
            category: "Food",
            description: "Romantic 3-course dinner while sailing past the illuminated Eiffel Tower."
        },
        {
            id: 3,
            title: "Montmartre Walking Tour",
            location: "Paris, France",
            rating: 4.9,
            reviews: 500,
            price: 25,
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
            category: "Walking",
            description: "Explore the artistic history of Paris in the most charming district."
        }
    ];

    return (
        <div className="trip-container">
            <div className="page-header">
                <h1 className="page-title">Discover Activities</h1>
                <p className="page-subtitle">Find top-rated things to do in your destination.</p>
            </div>

            {/* SEARCH TOOLBAR */}
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
                <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    <option value="culture">Culture & Art</option>
                    <option value="food">Food & Drink</option>
                    <option value="adventure">Adventure</option>
                </select>
                <select className="filter-select">
                    <option value="relevance">Sort: Recommended</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                </select>
            </div>

            {/* RESULTS LIST */}
            <div>
                {results.map(item => (
                    <div key={item.id} className="result-card-horizontal">
                        <img src={item.image} alt={item.title} className="result-img-side" />
                        <div className="result-content">
                            <div>
                                <div className="result-header">
                                    <div>
                                        <div className="result-badges">
                                            <span className="pill-badge">{item.category}</span>
                                            <span className="pill-badge rating-badge">★ {item.rating} ({item.reviews})</span>
                                        </div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '5px 0' }}>{item.title}</h2>
                                        <p style={{ color: '#6b7280' }}>📍 {item.location}</p>
                                    </div>
                                    <div className="price-tag">${item.price}</div>
                                </div>
                                <p style={{ marginTop: '15px', lineHeight: '1.5', color: '#4b5563' }}>
                                    {item.description}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button className="btn-primary" style={{ padding: '12px' }}>
                                    + Add to Itinerary
                                </button>
                                <button style={{
                                    padding: '12px 20px',
                                    background: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default SearchActivity;