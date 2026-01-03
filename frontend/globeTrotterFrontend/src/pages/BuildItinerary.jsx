import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const BuildItinerary = () => {
    const navigate = useNavigate();

    // State for multiple itinerary sections
    const [sections, setSections] = useState([
        { id: 1, title: "Stop 1: Arrival", description: "", dateRange: "", budget: "" }
    ]);

    // Add new blank section
    const addSection = () => {
        const newId = sections.length + 1;
        setSections([...sections, { id: newId, title: `Stop ${newId}: [City Name]`, description: "", dateRange: "", budget: "" }]);
    };

    // Delete section
    const removeSection = (idToRemove) => {
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

    const handleSaveTrip = () => {
        console.log("Full Trip Data:", sections);
        alert("Trip Saved Successfully!");
        navigate("/dashboard");
    };

    return (
        <div className="trip-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Build Your Itinerary</h1>
                    <p className="page-subtitle">Organize your trip by cities or days.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Budget</p>
                    {/* Dynamic sum of all sections (logic simplified for demo) */}
                    <h3 style={{ color: '#4F46E5', fontSize: '1.5rem', margin: 0 }}>$0.00</h3>
                </div>
            </div>

            {/* Render Dynamic Sections */}
            {sections.map((section, index) => (
                <div key={section.id} className="trip-card section-card">
                    <div className="section-header">
                        <span className="section-title">#{index + 1} &nbsp; — &nbsp; Section Details</span>
                        {sections.length > 1 && (
                            <button type="button" onClick={() => removeSection(section.id)} className="btn-remove">
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

                    <label className="form-label" style={{ marginTop: '15px' }}>Description & Activities</label>
                    <textarea
                        className="form-textarea"
                        placeholder="List planned activities (e.g., Louvre Museum, Dinner at..."
                        value={section.description}
                        onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                    ></textarea>

                    <label className="form-label" style={{ marginTop: '15px' }}>Estimated Budget ($)</label>
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
            <button onClick={addSection} className="btn-add-section">
                + Add Another Section (Day/City)
            </button>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-primary" onClick={handleSaveTrip} style={{ flex: 2 }}>
                    Save Trip
                </button>
                <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ flex: 1, background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' }}>
                    Cancel
                </button>
            </div>

        </div>
    );
};

export default BuildItinerary;