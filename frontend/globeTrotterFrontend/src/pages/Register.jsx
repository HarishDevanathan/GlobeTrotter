import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT SIDE: IMAGE (Swapped side for visual variety) */}
      <div className="auth-side-image">
        <div className="image-card-frame">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
            alt="Adventure Road"
            className="hero-img"
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }}></div>

          <div className="image-overlay-text">
            <h3 className="overlay-quote">Start your journey today.</h3>
            <p style={{ marginTop: '10px', color: '#e5e7eb' }}>Join over 15,000 travelers building their dream itineraries.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="auth-side-form">
        <div className="auth-content-box">
          <span className="auth-brand">🌍 GlobeTrotter</span>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Budget, plan, and share your trips.</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className="form-input"
              />
            </div>

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
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="Create a password"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating Profile..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            Already a member?
            <Link to="/login" className="link-signup"> Sign In</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;