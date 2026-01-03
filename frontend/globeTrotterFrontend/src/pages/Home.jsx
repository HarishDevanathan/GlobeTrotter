import "../styles/home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Plan trips, <span>your way</span>
          </h1>
          <p>
            Discover cities, organize activities, track budgets and share
            memorable journeys.
          </p>

          <div className="hero-buttons">
            <a href="/register" className="btn primary">
              Get Started
            </a>
            <a href="/login" className="btn secondary">
              Login
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Travel"
          />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why use our platform?</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>🌍 Smart Trips</h3>
            <p>Create multi-city trips with clear timelines.</p>
          </div>

          <div className="feature-card">
            <h3>💸 Budget Tracking</h3>
            <p>Track transport, stay, food & activity costs.</p>
          </div>

          <div className="feature-card">
            <h3>📍 City Discovery</h3>
            <p>Explore popular cities with insights & ratings.</p>
          </div>

          <div className="feature-card">
            <h3>🔗 Share Trips</h3>
            <p>Generate public links to share your travel plans.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start planning today</h2>
        <p>Your next adventure is just a few clicks away.</p>
        <a href="/register" className="btn primary">
          Create Account
        </a>
      </section>
    </div>
  );
};

export default Home;