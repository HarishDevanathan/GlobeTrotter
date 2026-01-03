import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// IMPORT YOUR NEW CSS HERE
import "../styles/GlobeTrotterAuth.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT SIDE: FORM */}
      <div className="auth-side-form">
        <div className="auth-content-box">
          <span className="auth-brand">🌍 GlobeTrotter</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to plan your next adventure.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="traveler@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <label className="form-label">Password</label>
                <Link to="/forgot" className="link-forgot">Forgot Password?</Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register" className="link-signup"> Join the club</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: IMAGE */}
      <div className="auth-side-image">
        <div className="image-card-frame">
          <img
            src="https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop"
            alt="Travel Landscape"
            className="hero-img"
          />
          {/* Gradient Overlay for text readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
          }}></div>

          <div className="image-overlay-text">
            <h3 className="overlay-quote">"We travel not to escape life, but for life not to escape us."</h3>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;