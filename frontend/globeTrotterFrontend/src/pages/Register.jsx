import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/GlobeTrotterAuth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    city: "",
    country: "",
    additional_info: "",
    photo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("No file chosen");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoName(file.name);

      // Convert to base64 or upload to cloud storage
      // For now, we'll just store the filename
      // In production, upload to AWS S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo_url: reader.result, // This will be a base64 string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.signup(formData);
      console.log("Registration successful:", response);

      // Auto-login after registration
      await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      navigate("/trips");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT: IMAGE */}
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

          {error && (
            <div style={{
              padding: '12px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.9rem',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ marginTop: '20px' }}>
            {/* 1. Profile Photo */}
            <div className="form-group">
              <label className="form-label">Profile Photo</label>
              <label className="file-upload-box" style={{ display: 'block', cursor: 'pointer' }}>
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
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  required
                  placeholder="Jane"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 3. Contact Row */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  className="form-input"
                  placeholder="+1 234 567 890"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 4. Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                required
                placeholder="••••••••"
                minLength="6"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* 5. Location Row */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  placeholder="France"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 6. Additional Info */}
            <div className="form-group">
              <label className="form-label">Additional Information</label>
              <textarea
                name="additional_info"
                className="form-textarea"
                placeholder="Tell us about your travel preferences (Optional)..."
                value={formData.additional_info}
                onChange={handleChange}
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