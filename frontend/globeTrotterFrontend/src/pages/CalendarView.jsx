import React, { useState, useEffect } from "react";
import { tripsAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [myTrips, setMyTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const response = await tripsAPI.getAll();
            setMyTrips(response.trips || []);
        } catch (err) {
            console.error("Failed to load trips:", err);
            // Fallback to mock data if API fails
            setMyTrips([
                { id: 1, title: "Trip to Bali", start_date: "2026-02-05", end_date: "2026-02-10" },
                { id: 2, title: "Paris Business", start_date: "2026-02-14", end_date: "2026-02-16" },
                { id: 3, title: "Tokyo Adventure", start_date: "2026-03-01", end_date: "2026-03-10" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Helper Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    // Handlers for Next/Prev Month
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    // Check if a specific calendar day falls within any trip range
    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return myTrips.filter(trip => {
            const startDate = trip.start_date || trip.startDate;
            const endDate = trip.end_date || trip.endDate;
            return dateStr >= startDate && dateStr <= endDate;
        });
    };

    // Generate grid arrays
    const emptySlots = Array.from({ length: startDay });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    if (loading) {
        return (
            <div className="trip-container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="trip-container" style={{ maxWidth: '1000px' }}>
            <div className="page-header">
                <h1 className="page-title">Trip Calendar</h1>
                <p className="page-subtitle">Visual timeline of your upcoming journeys.</p>
            </div>

            {/* HEADER CONTROLS */}
            <div className="calendar-controls">
                <button onClick={prevMonth} className="calendar-nav-btn">← Previous</button>
                <div className="month-label">
                    {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="calendar-nav-btn">Next →</button>
            </div>

            {/* GRID WRAPPER */}
            <div className="calendar-wrapper">
                {/* Days of Week Header */}
                <div className="calendar-grid-header">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="weekday-name">{d}</div>
                    ))}
                </div>

                {/* The Grid */}
                <div className="calendar-grid">
                    {/* Empty slots for days belonging to previous month */}
                    {emptySlots.map((_, index) => (
                        <div key={`empty-${index}`} className="calendar-day-cell empty-cell"></div>
                    ))}

                    {/* Actual Days */}
                    {daysArray.map((day) => {
                        const events = getEventsForDay(day);
                        const isToday = isCurrentMonth && day === today.getDate();

                        return (
                            <div key={day} className="calendar-day-cell">
                                <span className={`day-number ${isToday ? 'today' : ''}`}>
                                    {day}
                                </span>

                                {/* Render Trips on this Day */}
                                <div style={{ marginTop: '5px' }}>
                                    {events.map((ev, i) => (
                                        <div 
                                            key={`${ev.id}-${i}`} 
                                            className="trip-event-marker" 
                                            title={ev.title}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Tip */}
            <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
                {myTrips.length === 0 
                    ? "No trips scheduled yet. Create your first trip to see it here!"
                    : `Showing ${myTrips.length} trip${myTrips.length !== 1 ? 's' : ''}`
                }
            </div>
        </div>
    );
};

export default CalendarView;