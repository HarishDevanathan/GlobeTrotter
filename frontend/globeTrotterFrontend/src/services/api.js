// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get user ID from localStorage
const getUserId = () => localStorage.getItem('user_id');

// Helper to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
    const userId = getUserId();

    const headers = {
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-Id': userId }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
};

// ==================== AUTH APIs ====================
export const authAPI = {
    signup: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Signup failed');
        }

        return response.json();
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();

        // Store user data in localStorage
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_name', `${data.first_name} ${data.last_name}`);

        return data;
    },

    logout: () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
    },

    getCurrentUser: () => fetchWithAuth('/api/auth/me'),

    updateProfile: (userData) => fetchWithAuth('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    isAuthenticated: () => !!getUserId(),
};

// ==================== CITIES APIs ====================
export const citiesAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/api/cities?${query}`);
    },

    getById: (cityId) => fetchWithAuth(`/api/cities/${cityId}`),

    create: (cityData) => fetchWithAuth('/api/cities', {
        method: 'POST',
        body: JSON.stringify(cityData),
    }),

    getActivities: (cityId, category = null) => {
        const query = category ? `?category=${category}` : '';
        return fetchWithAuth(`/api/cities/${cityId}/activities${query}`);
    },
};

// ==================== ACTIVITIES APIs ====================
export const activitiesAPI = {
    search: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchWithAuth(`/api/activities?${query}`);
    },

    getById: (activityId) => fetchWithAuth(`/api/activities/${activityId}`),

    create: (activityData) => fetchWithAuth('/api/activities', {
        method: 'POST',
        body: JSON.stringify(activityData),
    }),
};

// ==================== TRIPS APIs ====================
export const tripsAPI = {
    getAll: (status = null) => {
        const query = status ? `?status=${status}` : '';
        return fetchWithAuth(`/api/trips${query}`);
    },

    getById: (tripId) => fetchWithAuth(`/api/trips/${tripId}`),

    create: (tripData) => fetchWithAuth('/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
    }),

    update: (tripId, tripData) => fetchWithAuth(`/api/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify(tripData),
    }),

    delete: (tripId) => fetchWithAuth(`/api/trips/${tripId}`, {
        method: 'DELETE',
    }),

    share: (tripId) => fetchWithAuth(`/api/trips/${tripId}/share`, {
        method: 'POST',
    }),
};

// ==================== TRIP STOPS APIs ====================
export const tripStopsAPI = {
    getAll: (tripId) => fetchWithAuth(`/api/trips/${tripId}/stops`),

    create: (stopData) => fetchWithAuth(`/api/trips/${stopData.trip_id}/stops`, {
        method: 'POST',
        body: JSON.stringify(stopData),
    }),

    delete: (stopId) => fetchWithAuth(`/api/stops/${stopId}`, {
        method: 'DELETE',
    }),
};

// ==================== TRIP ACTIVITIES APIs ====================
export const tripActivitiesAPI = {
    getAll: (stopId) => fetchWithAuth(`/api/stops/${stopId}/activities`),

    add: (activityData) => fetchWithAuth(`/api/stops/${activityData.trip_stop_id}/activities`, {
        method: 'POST',
        body: JSON.stringify(activityData),
    }),

    remove: (activityId) => fetchWithAuth(`/api/trip-activities/${activityId}`, {
        method: 'DELETE',
    }),
};

// ==================== BUDGET APIs ====================
export const budgetAPI = {
    get: (tripId) => fetchWithAuth(`/api/trips/${tripId}/budget`),

    update: (tripId, budgetData) => fetchWithAuth(`/api/trips/${tripId}/budget`, {
        method: 'PUT',
        body: JSON.stringify(budgetData),
    }),
};

// ==================== SAVED CITIES APIs ====================
export const savedCitiesAPI = {
    getAll: () => fetchWithAuth('/api/saved-cities'),

    save: (cityId) => fetchWithAuth(`/api/saved-cities/${cityId}`, {
        method: 'POST',
    }),

    unsave: (cityId) => fetchWithAuth(`/api/saved-cities/${cityId}`, {
        method: 'DELETE',
    }),
};

// ==================== SHARED TRIPS APIs ====================
export const sharedTripsAPI = {
    get: (publicSlug) => fetch(`${API_BASE_URL}/api/shared/${publicSlug}`).then(r => r.json()),
};