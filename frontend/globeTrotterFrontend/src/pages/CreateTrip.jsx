import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const CreateTrip = () => {
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        cover_image: "",
        is_public: false,
    });
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Suggested places
    const popularPlaces = ["Paris", "Bali", "Tokyo", "New York", "Safari", "Swiss Alps"];
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    // Toggle place selection
    const togglePlace = (place) => {
        if (selectedPlaces.includes(place)) {
            setSelectedPlaces(selectedPlaces.filter(p => p !== place));
        } else {
            setSelectedPlaces([...selectedPlaces, place]);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setError(""); // Clear error when user types
    };

    // Validate form
    const validateForm = () => {
        if (!formData.title.trim()) {
            setError("Trip title is required");
            return false;
        }

        if (!formData.start_date || !formData.end_date) {
            setError("Start and end dates are required");
            return false;
        }

        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setError("End date must be after start date");
            return false;
        }

        if (new Date(formData.start_date) < new Date()) {
            setError("Start date cannot be in the past");
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Prepare trip data
            const tripData = {
                ...formData,
                description: formData.description.trim() || 
                    (selectedPlaces.length > 0 
                        ? `Trip to explore: ${selectedPlaces.join(", ")}` 
                        : "An exciting new adventure"),
            };

            // Add selected places to description if not already included
            if (selectedPlaces.length > 0 && !tripData.description.includes(selectedPlaces[0])) {
                tripData.description += `\n\nInterests: ${selectedPlaces.join(", ")}`;
            }

            console.log("Creating trip with data:", tripData);

            // Call API to create trip
            const response = await tripsAPI.create(tripData);
            
            console.log("Trip created successfully:", response);

            // Show success message
            alert("Trip created successfully!");

            // Navigate to build itinerary with trip data
            navigate(`/build-itinerary/${response.trip_id}`, {
                state: {
                    tripData: {
                        ...tripData,
                        trip_id: response.trip_id,
                        selectedPlaces
                    }
                }
            });

        } catch (err) {
            console.error("Error creating trip:", err);
            setError(err.message || "Failed to create trip. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/trips');
    };

    // Calculate trip duration
    const getTripDuration = () => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '';
        }
        return '';
    };

    return (
        <div className="trip-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Start a New Adventure</h1>
                <p className="page-subtitle">Basic details to get your journey started.</p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Main Form Card */}
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
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                            Give your trip a memorable name
                        </p>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            placeholder="Brief overview of your trip plans... What are you excited about?"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            style={{ minHeight: '80px' }}
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
                                min={new Date().toISOString().split('T')[0]}
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
                                min={formData.start_date || new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Trip Duration Info */}
                    {getTripDuration() && (
                        <div style={{
                            padding: '12px',
                            background: '#EEF2FF',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>📅</span>
                            <span style={{ color: '#4F46E5', fontWeight: 600 }}>
                                Trip Duration: {getTripDuration()}
                            </span>
                        </div>
                    )}

                    {/* Cover Image URL */}
                    <div className="form-group">
                        <label className="form-label">Cover Image URL (Optional)</label>
                        <input
                            type="url"
                            name="cover_image"
                            className="form-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.cover_image}
                            onChange={handleChange}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                            Add a link to an image that represents your trip
                        </p>
                    </div>

                    {/* Cover Image Preview */}
                    {formData.cover_image && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                                Image Preview:
                            </p>
                            <img
                                src={formData.cover_image}
                                alt="Cover preview"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    setError("Invalid image URL");
                                }}
                                style={{
                                    width: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                        </div>
                    )}

                    {/* Public Trip Toggle */}
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '12px',
                            background: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        >
                            <input
                                type="checkbox"
                                name="is_public"
                                checked={formData.is_public}
                                onChange={handleChange}
                                style={{
                                    marginRight: '12px',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer'
                                }}
                            />
                            <div>
                                <span className="form-label" style={{ margin: 0, display: 'block' }}>
                                    🌍 Make this trip public
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Others can view and get inspired by your itinerary
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Suggested Activities/Places */}
                    <div className="form-group" style={{ marginTop: '25px' }}>
                        <label className="form-label">Suggested Interests / Places</label>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>
                            Select themes or destinations you're interested in
                        </p>

                        <div className="suggestions-grid">
                            {popularPlaces.map(place => (
                                <div
                                    key={place}
                                    className={`suggestion-tag ${selectedPlaces.includes(place) ? 'selected' : ''}`}
                                    onClick={() => togglePlace(place)}
                                    style={{
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    {selectedPlaces.includes(place) ? "✓ " : "+ "}
                                    {place}
                                </div>
                            ))}
                        </div>

                        {selectedPlaces.length > 0 && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px',
                                background: '#EEF2FF',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: '#4F46E5'
                            }}>
                                <strong>Selected:</strong> {selectedPlaces.join(", ")}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ flex: 2 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span style={{ 
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #fff',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite'
                                    }}></span>
                                    Creating Trip...
                                </span>
                            ) : (
                                "Continue to Itinerary →"
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px 24px',
                                background: 'transparent',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.background = '#F3F4F6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Helper Text */}
                    <p style={{
                        marginTop: '20px',
                        fontSize: '0.8rem',
                        color: '#9CA3AF',
                        textAlign: 'center'
                    }}>
                        You'll be able to add detailed itinerary and activities in the next step
                    </p>
                </form>
            </div>

            {/* Add spinning animation */}
            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateTrip;