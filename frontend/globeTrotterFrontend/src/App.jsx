import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Component
import Layout from './components/Layout';

// Pages (Using your exact filenames)
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripListing from './pages/TripListing';
import BuildIternery from './pages/BuildIternery';
import CalenderView from './pages/CalenderView';
import IternaryView from './pages/IternaryView';
import SearchActivity from './pages/SearchActivity';
import Profile from './pages/Profile';

import './App.css';

function NotFound() {
  return (
    <div style={{ padding: "50px", textAlign: "center", marginLeft: "260px" }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* --- PUBLIC ROUTES (No Sidebar) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* --- PRIVATE ROUTES (With Sidebar Layout) --- */}
        <Route element={<Layout />}>

          {/* Main Dashboard showing all trips */}
          <Route path="/trips" element={<TripListing />} />

          {/* Also make /dashboard redirect to /trips so your previous 404 works */}
          <Route path="/dashboard" element={<Navigate to="/trips" replace />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar-view" element={<CalenderView />} />
          <Route path="/search-activity" element={<SearchActivity />} />

          {/* Specific Trip Actions */}
          <Route path="/trips/create" element={<CreateTrip />} />
          <Route path="/build-itinerary" element={<BuildIternery />} />
          <Route path="/itinerary-view" element={<IternaryView />} />

          {/* 404 INSIDE layout so header stays */}
          <Route path="*" element={<NotFound />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;