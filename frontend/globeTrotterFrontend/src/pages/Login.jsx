import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css"; // Ensure this path is correct

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic: Authenticate User
    setTimeout(() => {
      setLoading(false);
      navigate("/trips"); // Redirects to TripListing based on your App.jsx
    }, 1500);
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT: FORM */}
      <div className="auth-side-form">
        <div className="auth-content-box">
          <h2 style={{ color: '#4F46E5', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            GlobeTrotter
          </h2>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to access your personalized itineraries.</p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label className="form-label">Username / Email</label>
              <input
                type="text"
                required
                placeholder="Enter username or email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <Link to="#" style={{ fontSize: '0.85rem', color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register" className="link-signup"> Create an account</Link>
          </div>
        </div>
      </div>

      {/* RIGHT: IMAGE */}
      <div className="auth-side-image">
        <div className="image-card-frame">
          <img
            src="https://images.unsplash.com/photo-1518684079-3c830dcefacf?q=80&w=2070&auto=format&fit=crop"
            alt="Travel Landscape"
            className="hero-img"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}></div>
          <div className="image-overlay-text">
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              "Adventure is worthwhile in itself."
            </h3>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;