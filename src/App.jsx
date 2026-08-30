import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Destinations from './pages/Destinations'
import RoutePlanner from './pages/RoutePlanner'
import DestinationDetail from './pages/DestinationDetail'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'
import Itinerary from './pages/Itinerary'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import HotelDashboard from './pages/HotelDashboard'
import Payment from './pages/Payment'
import About from './pages/About'
import Contact from './pages/Contact'
import HelpCenter from './pages/HelpCenter'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/hotel-dashboard" element={<HotelDashboard />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
