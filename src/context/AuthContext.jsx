import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('yatra_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) localStorage.setItem('yatra_user', JSON.stringify(user))
    else localStorage.removeItem('yatra_user')
  }, [user])

  async function login(credentials) {
    setLoading(true); setError('')
    try {
      const { data } = await AuthAPI.login(credentials)
      localStorage.setItem('yatra_token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not sign in. Check your details and try again.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function register(payload) {
    setLoading(true); setError('')
    try {
      const { data } = await AuthAPI.register(payload)
      return { ok: true, message: data?.message }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create your account. Try a different email.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function requestOtp(email) {
    setLoading(true); setError('')
    try {
      await AuthAPI.requestOtp(email)
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not send a code. Check the email and try again.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(email, otp) {
    setLoading(true); setError('')
    try {
      const { data } = await AuthAPI.verifyOtp(email, otp)
      localStorage.setItem('yatra_token', data.token)
      setUser(data.user)
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || 'That code didn\'t work. Check it and try again.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(payload) {
    setLoading(true); setError('')
    try {
      const { data } = await AuthAPI.updateProfile(payload)
      setUser(data)
      return { ok: true }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not save your profile. Try again.'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('yatra_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, requestOtp, verifyOtp, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
