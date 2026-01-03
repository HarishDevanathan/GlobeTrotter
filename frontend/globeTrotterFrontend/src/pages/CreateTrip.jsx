import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css"; // Reuse buttons/forms base
import "../styles/TripStyles.css";       // Specific trip styles

const CreateTrip = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        startDate: "",
        endDate: ""
    });

    // Suggested Places Logic
    const popularPlaces = ["Paris", "Bali", "Tokyo", "New York", "Safari", "Swiss Alps"];
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const togglePlace = (place) => {
        if (selectedPlaces.includes(place)) {
            setSelectedPlaces(selectedPlaces.filter(p => p !== place));
        } else {
            setSelectedPlaces([...selectedPlaces, place]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ ...formData, selectedPlaces });
        // Navigate to next step
        navigate("/build-itinerary");
    };

    return (
        <div className="trip-container">
            <div className="page-header">
                <h1 className="page-title">Start a New Adventure</h1>
                <p className="page-subtitle">Basic details to get your journey started.</p>
            </div>

            <div className="trip-card">
                <form onSubmit={handleSubmit}>
                    {/* Trip Title */}
                    <div className="form-group">
                        <label className="form-label">Trip Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Summer in Italy 2026"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Date Range Row */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Suggested Activities/Places */}
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label className="form-label">Suggested Interests / Places</label>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Select themes or add your own.</p>

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

                    <button type="submit" className="btn-primary" style={{ marginTop: '30px' }}>
                        Continue to Itinerary &rarr;
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTrip;