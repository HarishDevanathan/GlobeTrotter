import { useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";
import "../styles/TripStyles.css";

const TripListing = () => {
    const navigate = useNavigate();

    // Mock Data
    const myTrips = [
        { id: 1, title: "Backpacking in Bali", status: "ongoing", date: "Jan 2 - Jan 15, 2026", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop" },
        { id: 2, title: "Paris & London", status: "upcoming", date: "Mar 10 - Mar 20, 2026", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" },
        { id: 3, title: "Tokyo Adventure", status: "completed", date: "Dec 10 - Dec 25, 2025", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop" },
    ];

    // Helper function to render card
    const TripCard = ({ trip }) => (
        <div className="trip-card listing-card" onClick={() => navigate('/itinerary-view')} style={{ cursor: 'pointer' }}>
            <img src={trip.img} alt={trip.title} className="card-img-top" />
            <div className="card-body">
                <span className={`status-badge status-${trip.status}`}>
                    {trip.status}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '5px 0' }}>{trip.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{trip.date}</p>
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ color: '#4F46E5', fontWeight: 600, fontSize: '0.9rem' }}>View Plan &rarr;</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="trip-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">My Trips</h1>
                    <p className="page-subtitle">Manage your ongoing and past journeys.</p>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/create-trip')}>
                    + Plan New Trip
                </button>
            </div>

            {/* 1. ONGOING */}
            <h3 className="section-title" style={{ marginBottom: '15px' }}>Happening Now</h3>
            <div className="dashboard-grid">
                {myTrips.filter(t => t.status === 'ongoing').map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {/* 2. UPCOMING */}
            <h3 className="section-title" style={{ marginBottom: '15px' }}>Coming Up</h3>
            <div className="dashboard-grid">
                {myTrips.filter(t => t.status === 'upcoming').map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {/* 3. COMPLETED */}
            <h3 className="section-title" style={{ marginBottom: '15px' }}>Past Adventures</h3>
            <div className="dashboard-grid">
                {myTrips.filter(t => t.status === 'completed').map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>
        </div>
    );
};

export default TripListing;