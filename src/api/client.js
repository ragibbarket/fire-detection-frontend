import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// attach the JWT to every request, if we're logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if the token is invalid/expired, force back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const getLatestReadings = (limit = 50) =>
  api.get("/api/sensor-data/latest", { params: { limit } }).then((r) => r.data);

export const getAlerts = () => api.get("/api/alerts").then((r) => r.data);

export const getAlert = (id) => api.get(`/api/alerts/${id}`).then((r) => r.data);

export const getFireStations = (lat, lng) =>
  api.get("/api/fire-stations", { params: { lat, lng } }).then((r) => r.data);

export const notifyFireStation = (stationId, alertId) =>
  api.post(`/api/fire-stations/${stationId}/notify`, { alertId }).then((r) => r.data);

export const verifyAlert = (alertId, decision) =>
  api.post(`/api/alerts/${alertId}/dashboard-verify`, { decision }).then((r) => r.data);

export const resolveAlert = (alertId) =>
  api.post(`/api/alerts/${alertId}/resolve`).then((r) => r.data);

export const labelReading = (readingId, label) =>
  api.post(`/api/sensor-data/${readingId}/label`, { label }).then((r) => r.data);

// ---- auth ----
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const registerOwner = (deviceId, name, email, password) =>
  api.post("/api/auth/register-owner", { deviceId, name, email, password }).then((r) => r.data);

export const acceptInvite = (token, name, password) =>
  api.post("/api/auth/accept-invite", { token, name, password }).then((r) => r.data);

// ---- device members (owner-only actions enforced server-side too) ----
export const getMembers = (deviceId) =>
  api.get(`/api/devices/${deviceId}/members`).then((r) => r.data);

export const inviteMember = (deviceId, email) =>
  api.post(`/api/devices/${deviceId}/invite`, { email }).then((r) => r.data);

export const removeMember = (deviceId, userId) =>
  api.delete(`/api/devices/${deviceId}/members/${userId}`).then((r) => r.data);

export default api;
