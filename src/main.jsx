import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ItineraryProvider } from './context/ItineraryContext.jsx'
import './styles/tokens.css'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ItineraryProvider>
          <App />
        </ItineraryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
