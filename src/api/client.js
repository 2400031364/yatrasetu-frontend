import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8017/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yatra_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

// ---- Endpoint helpers (mirror backend REST controllers) ----

export const AuthAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  requestOtp: (email) => api.post('/auth/otp/request', { email }),
  verifyOtp: (email, otp) => api.post('/auth/otp/verify', { email, otp }),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/me', payload),
}

export const DestinationsAPI = {
  list: (params) => api.get('/destinations', { params }),
  get: (id) => api.get(`/destinations/${id}`),
  featured: () => api.get('/destinations/featured'),
  categories: () => api.get('/destinations/categories'),
}

export const HotelsAPI = {
  list: (params) => api.get('/hotels', { params }),
  get: (id) => api.get(`/hotels/${id}`),
  byDestination: (destinationId) => api.get(`/hotels/destination/${destinationId}`),
}

export const PlacesAPI = {
  // Live tourist attractions + nearby stays for any city, fetched in real
  // time from OpenStreetMap — not limited to the curated demo destinations.
  search: (city) => api.get('/places/search', { params: { city } }),
  // "Promotes" a clicked live result into a real Destination (+ Hotels),
  // so it gets a full detail page, reviews and the booking flow for free.
  import: (payload) => api.post('/places/import', payload),
}

export const RoutesAPI = {
  // Plans a real, drivable route between two places (live OSRM routing)
  // and returns the notable tourist places found along the way (live
  // Overpass/OpenStreetMap data) — used by the home page source/destination
  // search.
  plan: (source, destination) => api.get('/routes/plan', { params: { source, destination } }),
}

export const BookingsAPI = {
  create: (payload) => api.post('/bookings', payload),
  pay: (id, method) => api.post(`/bookings/${id}/pay`, { method }),
  mine: () => api.get('/bookings/me'),
  cancel: (id) => api.delete(`/bookings/${id}`),
  // Hotel-manager dashboard: bookings (with guest contact info) for the
  // manager's own hotel.
  forHotelManager: () => api.get('/bookings/hotel-manager'),
}

export const ReviewsAPI = {
  byDestination: (destinationId) => api.get(`/reviews/destination/${destinationId}`),
  create: (payload) => api.post('/reviews', payload),
}

export const ItineraryAPI = {
  mine: () => api.get('/itineraries/me'),
  create: (payload) => api.post('/itineraries', payload),
  addItem: (itineraryId, payload) => api.post(`/itineraries/${itineraryId}/items`, payload),
  removeItem: (itineraryId, itemId) => api.delete(`/itineraries/${itineraryId}/items/${itemId}`),
  delete: (itineraryId) => api.delete(`/itineraries/${itineraryId}`),
}
