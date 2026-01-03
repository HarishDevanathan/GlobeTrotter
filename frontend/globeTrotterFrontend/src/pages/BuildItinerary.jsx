import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { tripsAPI, citiesAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const BuildItinerary = () => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const location = useLocation();
    const tripData = location.state?.tripData;

    // Initialize sections based on selected places from CreateTrip
    const [sections, setSections] = useState([
        { 
            id: 1, 
            title: "Stop 1", 
            city_id: "", 
            start_date: tripData?.start_date || "", 
            end_date: tripData?.end_date || "", 
            activities: [], 
            estimatedBudget: null 
        }
    ]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCities();
        
        // If we have selected places from CreateTrip, pre-populate sections
        if (tripData?.selectedPlaces && tripData.selectedPlaces.length > 0) {
            initializeSectionsFromPlaces();
        }
    }, []);

    const loadCities = async () => {
        try {
            const response = await citiesAPI.getAll({ limit: 100 });
            setCities(response.cities || []);
        } catch (err) {
            console.error("Failed to load cities:", err);
        }
    };

    const initializeSectionsFromPlaces = async () => {
        const selectedPlaces = tripData.selectedPlaces;
        
        // Try to find matching cities
        const response = await citiesAPI.getAll({ limit: 100 });
        const allCities = response.cities || [];
        
        const newSections = selectedPlaces.map((place, index) => {
            // Try to find city that matches the selected place name
            const matchingCity = allCities.find(city => 
                city.city_name.toLowerCase().includes(place.toLowerCase()) ||
                place.toLowerCase().includes(city.city_name.toLowerCase())
            );
            
            return {
                id: index + 1,
                title: `Stop ${index + 1}`,
                city_id: matchingCity?.id || "",
                city_name: matchingCity?.city_name || place,
                start_date: tripData.start_date || "",
                end_date: tripData.end_date || "",
                activities: [],
                estimatedBudget: null
            };
        });
        
        if (newSections.length > 0) {
            setSections(newSections);
        }
    };

    const updateSectionBudget = async (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section.city_id || !section.start_date || !section.end_date) return;

        try {
            const params = new URLSearchParams({
                city_id: section.city_id,
                start_date: section.start_date,
                end_date: section.end_date
            });

            section.activities.forEach(actId => {
                params.append('activity_ids', actId);
            });

            const response = await fetch(
                `http://localhost:8000/api/budget/estimate?${params.toString()}`,
                { method: 'POST' }
            );
            const data = await response.json();

            setSections(prev => prev.map(s => 
                s.id === sectionId 
                    ? { ...s, estimatedBudget: data.estimated_budget }
                    : s
            ));
        } catch (err) {
            console.error("Failed to calculate budget:", err);
        }
    };

    const calculateTotalBudget = () => {
        return sections.reduce((total, section) => {
            if (section.estimatedBudget) {
                return total + section.estimatedBudget.total_cost;
            }
            return total;
        }, 0);
    };

    const addSection = () => {
        const newId = sections.length + 1;
        setSections([...sections, { 
            id: newId, 
            title: `Stop ${newId}`, 
            city_id: "",
            start_date: "", 
            end_date: "",
            activities: [],
            estimatedBudget: null
        }]);
    };

    const removeSection = (idToRemove) => {
        if (sections.length === 1) {
            alert("You must have at least one stop in your itinerary.");
            return;
        }
        setSections(sections.filter(section => section.id !== idToRemove));
    };

    const handleSectionChange = (id, field, value) => {
        const updatedSections = sections.map(section => {
            if (section.id === id) {
                return { ...section, [field]: value };
            }
            return section;
        });
        setSections(updatedSections);

        if (['city_id', 'start_date', 'end_date'].includes(field)) {
            setTimeout(() => updateSectionBudget(id), 500);
        }
    };

    const openActivityRecommendations = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section.city_id) {
            alert("Please select a city first");
            return;
        }

        // Navigate with section data
        navigate(`/activity-recommendations/${section.city_id}`, {
            state: { 
                sectionId,
                tripId: tripId || tripData?.trip_id,
                tripData,
                start_date: section.start_date,
                end_date: section.end_date,
                returnTo: `/build-itinerary/${tripId || tripData?.trip_id}`
            }
        });
    };

    const handleSaveTrip = async () => {
        setLoading(true);
        setError("");

        try {
            for (let section of sections) {
                if (!section.city_id) {
                    throw new Error("Please select a city for all stops");
                }
                if (!section.start_date || !section.end_date) {
                    throw new Error("Please set dates for all stops");
                }
            }

            const currentTripId = tripId || tripData?.trip_id;
            
            if (!currentTripId) {
                throw new Error("Trip ID not found. Please create the trip first.");
            }

            // Save each section as a trip stop
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                await fetch(`http://localhost:8000/api/trips/${currentTripId}/stops`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': localStorage.getItem('user_id')
                    },
                    body: JSON.stringify({
                        trip_id: currentTripId,
                        city_id: section.city_id,
                        start_date: section.start_date,
                        end_date: section.end_date,
                        stop_order: i + 1
                    })
                });
            }

            alert("Trip itinerary saved successfully!");
            navigate("/trips");

        } catch (err) {
            console.error("Error saving trip:", err);
            setError(err.message || "Failed to save trip");
        } finally {
            setLoading(false);
        }
    };

    const getCityName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        return city ? `${city.city_name}, ${city.country}` : "";
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
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Estimated Budget</p>
                    <h3 style={{ color: '#4F46E5', fontSize: '1.5rem', margin: 0 }}>
                        ${calculateTotalBudget().toFixed(0)}
                    </h3>
                </div>
            </div>

            {sections.map((section, index) => (
                <div key={section.id} className="trip-card section-card">
                    <div className="section-header">
                        <span className="section-title">Stop #{index + 1}</span>
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

                    <div className="form-group">
                        <label className="form-label">Select City *</label>
                        <select
                            className="form-input"
                            value={section.city_id}
                            onChange={(e) => handleSectionChange(section.id, 'city_id', e.target.value)}
                        >
                            <option value="">Choose a city...</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>
                                    {city.city_name}, {city.country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grid">
                        <div>
                            <label className="form-label">Start Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={section.start_date}
                                onChange={(e) => handleSectionChange(section.id, 'start_date', e.target.value)}
                                min={index === 0 ? (tripData?.start_date || new Date().toISOString().split('T')[0]) : sections[index - 1]?.end_date}
                            />
                        </div>
                        <div>
                            <label className="form-label">End Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={section.end_date}
                                onChange={(e) => handleSectionChange(section.id, 'end_date', e.target.value)}
                                min={section.start_date}
                            />
                        </div>
                    </div>

                    {section.estimatedBudget && (
                        <div style={{
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '8px',
                            padding: '15px',
                            marginTop: '15px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                                paddingBottom: '10px',
                                borderBottom: '1px solid #BBF7D0'
                            }}>
                                <span style={{ fontWeight: 600, color: '#166534' }}>
                                    💰 Estimated Budget for {section.estimatedBudget.days} day(s)
                                </span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534' }}>
                                    ${section.estimatedBudget.total_cost.toFixed(0)}
                                </span>
                            </div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '10px',
                                fontSize: '0.85rem'
                            }}>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Transport</div>
                                    <div style={{ fontWeight: 600, color: '#166534' }}>
                                        ${section.estimatedBudget.transport_cost.toFixed(0)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Stay</div>
                                    <div style={{ fontWeight: 600, color: '#166534' }}>
                                        ${section.estimatedBudget.stay_cost.toFixed(0)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Food</div>
                                    <div style={{ fontWeight: 600, color: '#166534' }}>
                                        ${section.estimatedBudget.food_cost.toFixed(0)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Activities</div>
                                    <div style={{ fontWeight: 600, color: '#166534' }}>
                                        ${section.estimatedBudget.activity_cost.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <button
                            type="button"
                            onClick={() => openActivityRecommendations(section.id)}
                            disabled={!section.city_id}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: section.city_id ? '#4F46E5' : '#E5E7EB',
                                color: section.city_id ? 'white' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: section.city_id ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            🎯 Browse Recommended Activities
                            {section.activities.length > 0 && (
                                <span style={{
                                    background: 'white',
                                    color: '#4F46E5',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem'
                                }}>
                                    {section.activities.length} selected
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            ))}

            <button 
                onClick={addSection} 
                className="btn-add-section"
                disabled={loading}
            >
                + Add Another Stop
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