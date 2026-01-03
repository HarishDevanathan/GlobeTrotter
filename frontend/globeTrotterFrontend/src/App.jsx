import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TripListing from "./pages/TripListing";
import CreateTrip from "./pages/CreateTrip";
import BuildItinerary from "./pages/BuildItinerary";
import CalendarView from "./pages/CalendarView";
import ItineraryView from "./pages/ItineraryView";
import SearchActivity from "./pages/SearchActivity";
import Profile from "./pages/Profile";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PRIVATE ROUTES WITH LAYOUT */}
        <Route element={<Layout />}>
          <Route path="/trips" element={<TripListing />} />
          <Route path="/dashboard" element={<Navigate to="/trips" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar-view" element={<CalendarView />} />
          <Route path="/search-activity" element={<SearchActivity />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/build-itinerary" element={<BuildItinerary />} />
          <Route path="/itinerary-view" element={<ItineraryView />} />

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <div style={{ padding: "50px", textAlign: "center" }}>
                <h1>404 - Not Found</h1>
              </div>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;