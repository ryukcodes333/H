// nav.js — Shared nav + particles + toast
(function () {
  'use strict'

  // ── Particles ──────────────────────────────────────────
  function spawnParticles() {
    const el = document.getElementById('particles')
    if (!el) return
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.cssText = `
        left:${Math.random()*100}%;
        width:${1+Math.random()*3}px;
        height:${1+Math.random()*3}px;
        animation-duration:${6+Math.random()*10}s;
        animation-delay:${Math.random()*8}s;
        opacity:0;
      `
      el.appendChild(p)
    }
  }

  // ── Toast ──────────────────────────────────────────────
  window.showToast = function(msg, type = '') {
    let c = document.getElementById('toast-container')
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c) }
    const t = document.createElement('div')
    t.className = 'toast ' + type
    t.textContent = msg
    c.appendChild(t)
    setTimeout(() => t.remove(), 3200)
  }

  // ── Nav HTML ───────────────────────────────────────────
  function currentPage() {
    const p = window.location.pathname.replace('/', '') || 'index'
    return p
  }
  function isActive(page) {
    const cur = currentPage()
    return cur === page || (page === 'index' && cur === '') ? 'active' : ''
  }

  function injectNav() {
    // Bottom nav
    const nav = document.createElement('nav')
    nav.className = 'nav-bottom'
    nav.innerHTML = `
      <a href="/" class="nav-item ${isActive('index')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>Home
      </a>
      <a href="/cards" class="nav-item ${isActive('cards')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>Cards
      </a>
      <button class="nav-center-btn" id="nav-menu-btn" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <a href="/leaderboard" class="nav-item ${isActive('leaderboard')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>Board
      </a>
      <a href="/profile" class="nav-item ${isActive('profile')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>Profile
      </a>
    `
    document.body.appendChild(nav)

    // Slide menu
    const menu = document.createElement('div')
    menu.className = 'slide-menu'
    menu.id = 'slide-menu'
    menu.innerHTML = `
      <div class="slide-menu-header">
        <span class="slide-menu-title">✦ Shadow Garden</span>
        <button class="close-btn" id="nav-close-btn">✕</button>
      </div>
      <div class="menu-links">
        <a href="/" class="menu-link"><span class="menu-link-icon">🏠</span>Home</a>
        <a href="/profile" class="menu-link"><span class="menu-link-icon">👤</span>My Profile</a>
        <a href="/shop" class="menu-link"><span class="menu-link-icon">🛒</span>Item Shop</a>
        <a href="/leaderboard" class="menu-link"><span class="menu-link-icon">🏆</span>Leaderboard</a>
        <a href="/cards" class="menu-link"><span class="menu-link-icon">🃏</span>Card Gallery</a>
        <a href="/pokemons" class="menu-link"><span class="menu-link-icon">⚡</span>Pokédex</a>
        <a href="/daily" class="menu-link"><span class="menu-link-icon">🎁</span>Daily Reward</a>
        <a href="/login" class="menu-link" id="nav-auth-btn"><span class="menu-link-icon">🔑</span>Login</a>
      </div>
    `
    document.body.appendChild(menu)

    // Toast container
    const tc = document.createElement('div')
    tc.id = 'toast-container'
    document.body.appendChild(tc)

    // Events
    document.getElementById('nav-menu-btn').addEventListener('click', () => {
      menu.classList.add('open')
    })
    document.getElementById('nav-close-btn').addEventListener('click', () => {
      menu.classList.remove('open')
    })
    menu.addEventListener('click', e => {
      if (e.target === menu) menu.classList.remove('open')
    })

    // Auth button
    const user = window.KonoAuth?.getUser()
    const authBtn = document.getElementById('nav-auth-btn')
    if (user && authBtn) {
      authBtn.href = '#'
      authBtn.innerHTML = '<span class="menu-link-icon">🚪</span>Logout (' + (user.name || 'You') + ')'
      authBtn.addEventListener('click', e => { e.preventDefault(); window.KonoAuth.logout() })
    }
  }

  // Particles container
  function injectParticles() {
    if (!document.getElementById('particles')) {
      const d = document.createElement('div')
      d.id = 'particles'
      document.body.prepend(d)
    }
  }

  window.KonoNav = {
    toggle() {
      const m = document.getElementById('slide-menu')
      if (m) m.classList.toggle('open')
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { injectParticles(); injectNav(); spawnParticles() })
  } else {
    injectParticles(); injectNav(); spawnParticles()
  }
})()
