// auth.js — JWT auth helpers shared across all pages

(function () {
  'use strict'

  const KEY_TOKEN = 'kono_token'
  const KEY_USER  = 'kono_user'

  window.KonoAuth = {
    getToken() { return localStorage.getItem(KEY_TOKEN) },
    getUser()  {
      try { return JSON.parse(localStorage.getItem(KEY_USER)) }
      catch { return null }
    },
    isLoggedIn() { return !!this.getToken() },

    save(token, user) {
      localStorage.setItem(KEY_TOKEN, token)
      localStorage.setItem(KEY_USER, JSON.stringify(user))
    },

    logout() {
      localStorage.removeItem(KEY_TOKEN)
      localStorage.removeItem(KEY_USER)
      window.location.href = '/login'
    },

    requireAuth() {
      if (!this.isLoggedIn()) { window.location.href = '/login'; return false }
      return true
    },

    redirectIfLoggedIn() {
      if (this.isLoggedIn()) { window.location.href = '/profile'; return true }
      return false
    },

    async apiFetch(url, options = {}) {
      const token = this.getToken()
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(url, { ...options, headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return data
    }
  }

  // Expose a convenience fetch
  window.apiFetch = (url, opts) => KonoAuth.apiFetch(url, opts)
})()
