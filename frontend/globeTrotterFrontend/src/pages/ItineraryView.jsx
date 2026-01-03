import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const ItineraryView = () => {
    const navigate = useNavigate();

    // Mock Trip Data
    const tripDetails = {
        title: "Backpacking in Bali",
        dates: "Jan 2 - Jan 15, 2026",
        totalBudget: 2500,
        spent: 1200,
        days: [
            {
                dayNum: 1,
                date: "Jan 2",
                location: "Ubud",
                activities: [
                    { time: "10:00 AM", title: "Sacred Monkey Forest Sanctuary", cost: 15 },
                    { time: "01:00 PM", title: "Lunch at Bebek Bengil", cost: 30 },
                    { time: "04:00 PM", title: "Campuhan Ridge Walk", cost: 0 },
                ]
            },
            {
                dayNum: 2,
                date: "Jan 3",
                location: "Ubud -> Canggu",
                activities: [
                    { time: "09:00 AM", title: "Tegalalang Rice Terrace", cost: 10 },
                    { time: "12:00 PM", title: "Taxi Transfer to Canggu", cost: 45 },
                    { time: "07:00 PM", title: "Dinner & Drinks at Beach Club", cost: 80 },
                ]
            }
        ]
    };

    const percentUsed = Math.min((tripDetails.spent / tripDetails.totalBudget) * 100, 100);

    return (
        <div className="trip-container">

            {/* HEADER & NAV */}
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/trips')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '5px 0',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    &larr; Back to Trips
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                    <div>
                        <h1 className="page-title">{tripDetails.title}</h1>
                        <p className="page-subtitle">{tripDetails.dates} • 14 Days</p>
                    </div>
                    <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                        Edit Itinerary
                    </button>
                </div>
            </div>

            {/* BUDGET OVERVIEW SECTION */}
            <div className="budget-summary">
                <div className="budget-stat">
                    <span className="stat-label">Total Budget</span>
                    <span className="stat-value">${tripDetails.totalBudget}</span>
                </div>
                <div className="budget-stat" style={{ flex: 2 }}>
                    <span className="stat-label" style={{ textAlign: 'left' }}>Spending Tracker</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                        <span className="text-danger">${tripDetails.spent} Spent</span>
                        <span className="text-success">${tripDetails.totalBudget - tripDetails.spent} Left</span>
                    </div>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${percentUsed}%` }}></div>
                    </div>
                </div>
                <div className="budget-stat">
                    <span className="stat-label">Avg. / Day</span>
                    <span className="stat-value">$178</span>
                </div>
            </div>

            {/* DAY-WISE ITINERARY */}
            <h3 className="section-title" style={{ marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                Daily Itinerary & Expenses
            </h3>

            {tripDetails.days.map((day) => (
                <div key={day.dayNum} className="day-container">
                    <h4 className="day-header">
                        Day {day.dayNum} <span style={{ fontWeight: 400, color: '#6b7280' }}>— {day.date} ({day.location})</span>
                    </h4>

                    {day.activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-info">
                                <span className="activity-time">{activity.time}</span>
                                <span style={{ fontWeight: 600, color: '#374151' }}>{activity.title}</span>
                            </div>
                            <div className="activity-cost">
                                {activity.cost > 0 ? `-$${activity.cost}` : 'Free'}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

        </div>
    );
};

export default ItineraryView;