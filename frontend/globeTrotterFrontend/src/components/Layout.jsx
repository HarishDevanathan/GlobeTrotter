import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/TripStyles.css";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Navigation Links
    const navItems = [
        { label: "My Trips", path: "/trips", icon: "✈️" },
        { label: "Calendar", path: "/calendar-view", icon: "📅" },
        { label: "Discover", path: "/search-activity", icon: "🔍" },
        { label: "Profile", path: "/profile", icon: "👤" },
    ];

    const handleLogout = () => {
        authAPI.logout();
        navigate("/login");
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
            {/* SIDEBAR */}
            <aside style={{
                width: '260px',
                background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100%',
                left: 0,
                top: 0,
                zIndex: 50
            }}>
                <div style={{ padding: '30px', borderBottom: '1px solid #f3f4f6' }}>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5' }}>
                        GlobeTrotter
                    </h1>
                </div>

                <nav style={{ flex: 1, padding: '20px' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    color: isActive ? '#4F46E5' : '#4b5563',
                                    background: isActive ? '#eef2ff' : 'transparent',
                                    fontWeight: isActive ? 700 : 500,
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6' }}>
                    <button 
                        onClick={handleLogout} 
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            color: '#dc2626',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#fef2f2';
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;