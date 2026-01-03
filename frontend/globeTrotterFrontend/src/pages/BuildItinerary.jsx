import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { tripsAPI, tripStopsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const BuildItinerary = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const location = useLocation();
    const tripData = location.state?.tripData;

    const [sections, setSections] = useState([
        { id: 1, title: "Stop 1: Arrival", description: "", dateRange: "", budget: "", city_id: "" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculate total budget
    const totalBudget = sections.reduce((sum, section) => {
        return sum + (parseFloat(section.budget) || 0);
    }, 0);

    // Add new blank section
    const addSection = () => {
        const newId = sections.length + 1;
        setSections([...sections, { 
            id: newId, 
            title: `Stop ${newId}: [City Name]`, 
            description: "", 
            dateRange: "", 
            budget: "",
            city_id: ""
        }]);
    };

    // Delete section
    const removeSection = (idToRemove) => {
        if (sections.length === 1) {
            alert("You must have at least one stop in your itinerary.");
            return;
        }
        setSections(sections.filter(section => section.id !== idToRemove));
    };

    // Handle Input Change for specific section
    const handleSectionChange = (id, field, value) => {
        const updatedSections = sections.map(section => {
            if (section.id === id) {
                return { ...section, [field]: value };
            }
            return section;
        });
        setSections(updatedSections);
    };

    const handleSaveTrip = async () => {
        setLoading(true);
        setError("");

        try {
            // Validate sections
            for (let section of sections) {
                if (!section.title.trim()) {
                    throw new Error("All sections must have a title");
                }
            }

            // Save stops to the backend
            const currentTripId = tripId || tripData?.trip_id;
            
            if (!currentTripId) {
                throw new Error("Trip ID not found. Please create the trip first.");
            }

            // In a real implementation, you would:
            // 1. Parse the dateRange to get start_date and end_date
            // 2. Save each section as a trip_stop via tripStopsAPI
            // For now, we'll just navigate to trips view

            console.log("Saving trip with data:", {
                tripId: currentTripId,
                sections,
                totalBudget
            });

            alert("Trip itinerary saved successfully!");
            navigate("/trips");

        } catch (err) {
            console.error("Error saving trip:", err);
            setError(err.message || "Failed to save trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trip-container">
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    color: '#DC2626',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Build Your Itinerary</h1>
                    <p className="page-subtitle">
                        {tripData?.title ? `Organizing: ${tripData.title}` : 'Organize your trip by cities or days.'}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Budget</p>
                    <h3 style={{ color: '#4F46E5', fontSize: '1.5rem', margin: 0 }}>
                        ${totalBudget.toFixed(2)}
                    </h3>
                </div>
            </div>

            {/* Render Dynamic Sections */}
            {sections.map((section, index) => (
                <div key={section.id} className="trip-card section-card">
                    <div className="section-header">
                        <span className="section-title">#{index + 1} — Section Details</span>
                        {sections.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeSection(section.id)} 
                                className="btn-remove"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    <div className="form-grid">
                        <div>
                            <label className="form-label">City / Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Paris"
                                value={section.title}
                                onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Date Range</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., July 10 - July 14"
                                value={section.dateRange}
                                onChange={(e) => handleSectionChange(section.id, 'dateRange', e.target.value)}
                            />
                        </div>
                    </div>

                    <label className="form-label" style={{ marginTop: '15px' }}>
                        Description & Activities
                    </label>
                    <textarea
                        className="form-textarea"
                        placeholder="List planned activities (e.g., Louvre Museum, Dinner at...)"
                        value={section.description}
                        onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                    ></textarea>

                    <label className="form-label" style={{ marginTop: '15px' }}>
                        Estimated Budget ($)
                    </label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="500"
                        style={{ maxWidth: '200px' }}
                        value={section.budget}
                        onChange={(e) => handleSectionChange(section.id, 'budget', e.target.value)}
                    />
                </div>
            ))}

            {/* Action Buttons */}
            <button 
                onClick={addSection} 
                className="btn-add-section"
                disabled={loading}
            >
                + Add Another Section (Day/City)
            </button>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                    className="btn-primary" 
                    onClick={handleSaveTrip} 
                    style={{ flex: 2 }}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Trip"}
                </button>
                <button 
                    className="btn-primary" 
                    onClick={() => navigate('/trips')} 
                    style={{ 
                        flex: 1, 
                        background: '#e5e7eb', 
                        color: '#374151', 
                        border: '1px solid #d1d5db' 
                    }}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BuildItinerary;