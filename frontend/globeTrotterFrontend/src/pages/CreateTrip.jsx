import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const CreateTrip = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        cover_image: "",
        is_public: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const popularPlaces = ["Paris", "Bali", "Tokyo", "New York", "Safari", "Swiss Alps"];
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const togglePlace = (place) => {
        if (selectedPlaces.includes(place)) {
            setSelectedPlaces(selectedPlaces.filter(p => p !== place));
        } else {
            setSelectedPlaces([...selectedPlaces, place]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setError("End date must be after start date");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Add selected places to description
            const description = formData.description +
                (selectedPlaces.length > 0 ? `\n\nInterests: ${selectedPlaces.join(", ")}` : "");

            const response = await tripsAPI.create({
                ...formData,
                description,
            });

            console.log("Trip created:", response);
            navigate(`/build-itinerary/${response.trip_id}`);
        } catch (err) {
            setError(err.message || "Failed to create trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trip-container">
            <div className="page-header">
                <h1 className="page-title">Start a New Adventure</h1>
                <p className="page-subtitle">Basic details to get your journey started.</p>
            </div>

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

            <div className="trip-card">
                <form onSubmit={handleSubmit}>
                    {/* Trip Title */}
                    <div className="form-group">
                        <label className="form-label">Trip Title *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="e.g., Summer in Italy 2026"
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            placeholder="Brief overview of your trip plans..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Date Range Row */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input
                                type="date"
                                name="start_date"
                                className="form-input"
                                required
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date *</label>
                            <input
                                type="date"
                                name="end_date"
                                className="form-input"
                                required
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Cover Image URL */}
                    <div className="form-group">
                        <label className="form-label">Cover Image URL</label>
                        <input
                            type="url"
                            name="cover_image"
                            className="form-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.cover_image}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Public Trip Toggle */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="is_public"
                                checked={formData.is_public}
                                onChange={handleChange}
                                style={{ marginRight: '10px', width: '18px', height: '18px' }}
                            />
                            <span className="form-label" style={{ margin: 0 }}>
                                Make this trip public (others can view it)
                            </span>
                        </label>
                    </div>

                    {/* Suggested Activities/Places */}
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label className="form-label">Suggested Interests / Places</label>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                            Select themes or add your own.
                        </p>

                        <div className="suggestions-grid">
                            {popularPlaces.map(place => (
                                <div
                                    key={place}
                                    className={`suggestion-tag ${selectedPlaces.includes(place) ? 'selected' : ''}`}
                                    onClick={() => togglePlace(place)}
                                >
                                    {selectedPlaces.includes(place) ? "✓ " : "+ "}
                                    {place}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Creating..." : "Continue to Itinerary →"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/trips')}
                            style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrip;