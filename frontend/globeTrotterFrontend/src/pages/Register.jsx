import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/GlobeTrotterAuth.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State to handle photo preview (optional visual touch)
  const [photoName, setPhotoName] = useState("No file chosen");

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPhotoName(e.target.files[0].name);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic: Submit multi-part form data
    setTimeout(() => {
      setLoading(false);
      navigate("/trips"); // Navigate to Trips Listing
    }, 1500);
  };

  return (
    <div className="auth-wrapper">

      {/* LEFT: IMAGE (Switched sides for visual interest) */}
      <div className="auth-side-image">
        <div className="image-card-frame">
          <img
            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=2070&auto=format&fit=crop"
            alt="Journey"
            className="hero-img"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}></div>
          <div className="image-overlay-text">
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Join the Community</h3>
            <p style={{ color: '#ddd', marginTop: '10px' }}>Connect with 50,000+ travelers planning their dream trips.</p>
          </div>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="auth-side-form">
        <div className="auth-content-box">
          <span style={{ color: '#4F46E5', fontWeight: 800, fontSize: '0.9rem' }}>GlobeTrotter</span>
          <h1 className="auth-title">Create Account</h1>

          <form onSubmit={handleRegister} style={{ marginTop: '20px' }}>

            {/* 1. Profile Photo */}
            <div className="form-group">
              <label className="form-label">Profile Photo</label>
              <label className="file-upload-box" style={{ display: 'block' }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {photoName === "No file chosen" ? "📂 Click to upload image" : `✅ ${photoName}`}
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            {/* 2. Names Row */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" required placeholder="Jane" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" required placeholder="Doe" />
              </div>
            </div>

            {/* 3. Contact Row */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" required placeholder="+1 234 567 890" />
              </div>
            </div>

            {/* 4. Location Row */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" required placeholder="Paris" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" className="form-input" required placeholder="France" />
              </div>
            </div>

            {/* 5. Additional Info */}
            <div className="form-group">
              <label className="form-label">Additional Information</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us about your travel preferences (Optional)..."
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="link-signup"> Sign In</Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;