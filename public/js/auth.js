// auth.js — JWT auth helpers
(function () {
  'use strict'
  const KEY = 'kono_token'
  const UKEY = 'kono_user'

  window.KonoAuth = {
    getToken() { return localStorage.getItem(KEY) },
    getUser()  {
      try { return JSON.parse(localStorage.getItem(UKEY) || 'null') } catch { return null }
    },
    isLoggedIn() { return !!this.getToken() },
    save(token, user) {
      localStorage.setItem(KEY, token)
      localStorage.setItem(UKEY, JSON.stringify(user))
    },
    logout() {
      localStorage.removeItem(KEY)
      localStorage.removeItem(UKEY)
      window.location.href = '/login'
    },
    headers() {
      return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.getToken() }
    },
    async fetch(url, opts = {}) {
      const res = await fetch(url, { ...opts, headers: this.headers() })
      if (res.status === 401) { this.logout(); return null }
      return res
    },
    requireAuth() {
      if (!this.isLoggedIn()) { window.location.href = '/login'; return false }
      return true
    }
  }
})()
