import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useState, useContext, useEffect } from 'react';

// Layout Component
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripListing from './pages/TripListing';
import BuildItinerary from './pages/BuildItinerary';
import CalendarView from './pages/CalendarView';
import ItineraryView from './pages/ItineraryView';
import SearchActivity from './pages/SearchActivity';
import Profile from './pages/Profile';
import ActivityRecommendations from './pages/ActivityRecommendations';

// API
import { authAPI } from './services/api';

import './App.css';

// Create Context for global state
export const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

function NotFound() {
  return (
    <div style={{ padding: "50px", textAlign: "center", marginLeft: "260px" }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAppContext();
  
  // Check if user is authenticated
  const isAuthenticated = user || authAPI.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  // Global State
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);

  // Check for existing auth on mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    
    if (userId && userName) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail
      });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store in localStorage for persistence
    if (userData.id || userData.user_id) {
      localStorage.setItem('user_id', userData.id || userData.user_id);
      localStorage.setItem('user_name', userData.name || `${userData.first_name} ${userData.last_name}`);
      localStorage.setItem('user_email', userData.email);
    }
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const addTrip = (tripData) => {
    const newTrip = {
      ...tripData,
      id: tripData.trip_id || Date.now(),
      status: 'upcoming',
    };
    setTrips([...trips, newTrip]);
  };

  const contextValue = {
    user,
    login,
    logout,
    trips,
    addTrip
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES (No Sidebar) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- PRIVATE ROUTES (With Sidebar Layout) --- */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/trips" element={<TripListing />} />
            <Route path="/dashboard" element={<Navigate to="/trips" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar-view" element={<CalendarView />} />
            <Route path="/search-activity" element={<SearchActivity />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/build-itinerary/:tripId" element={<BuildItinerary />} />
            <Route path="/build-itinerary" element={<BuildItinerary />} />
            <Route path="/itinerary-view/:tripId" element={<ItineraryView />} />
            <Route path="/itinerary-view" element={<ItineraryView />} />
            <Route path="/activity-recommendations/:cityId" element={<ActivityRecommendations />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;