// nav.js — Shared navigation injected on every page

(function () {
  'use strict'

  const NAV_ITEMS = [
    { href: '/',           icon: 'fas fa-home',          label: 'Home' },
    { href: '/shop',       icon: 'fas fa-store',         label: 'Shop' },
    { href: null,          icon: null,                   label: 'Menu', isMenu: true },
    { href: '/cards',      icon: 'fas fa-id-card',       label: 'Cards' },
    { href: '/pokemons',   icon: 'fas fa-dragon',        label: 'Pokémon' },
  ]

  const MENU_SECTIONS = [
    {
      title: 'Explore',
      items: [
        { href: '/',           icon: 'fas fa-home',      label: 'Home' },
        { href: '/shop',       icon: 'fas fa-store',     label: 'Shop' },
        { href: '/leaderboard',icon: 'fas fa-trophy',    label: 'Leaderboard' },
        { href: '/cards',      icon: 'fas fa-id-card',   label: 'Cards' },
        { href: '/pokemons',   icon: 'fas fa-dragon',    label: 'Pokémon' },
        { href: '/daily',      icon: 'fas fa-gift',      label: 'Daily Reward' },
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/profile',  icon: 'fas fa-user',        label: 'My Profile' },
        { href: '/signup',   icon: 'fas fa-user-plus',   label: 'Sign Up' },
        { href: '/login',    icon: 'fas fa-right-to-bracket', label: 'Login' },
      ]
    }
  ]

  function currentPath() { return window.location.pathname.replace(/\/$/, '') || '/' }

  function isActive(href) {
    const p = currentPath()
    return (href === '/' ? p === '/' : p.startsWith(href)) ? 'active' : ''
  }

  function injectNav() {
    // Bottom nav
    const nav = document.createElement('nav')
    nav.className = 'bottom-nav'
    nav.innerHTML = NAV_ITEMS.map(item => {
      if (item.isMenu) return `
        <button class="nav-item nav-menu-btn" onclick="KonoNav.toggle()" aria-label="Menu">
          <div class="menu-dot"><i class="fas fa-bars"></i></div>
          <span>Menu</span>
        </button>`
      return `
        <a href="${item.href}" class="nav-item ${isActive(item.href)}">
          <i class="${item.icon}"></i>
          <span>${item.label}</span>
        </a>`
    }).join('')
    document.body.appendChild(nav)

    // Menu overlay
    const overlay = document.createElement('div')
    overlay.id = 'menuOverlay'
    overlay.className = 'menu-overlay'
    overlay.addEventListener('click', e => { if (e.target === overlay) KonoNav.close() })

    const sectionsHtml = MENU_SECTIONS.map(sec => `
      <div class="menu-section">
        <div class="menu-section-title">${sec.title}</div>
        ${sec.items.map(item => {
          const active = isActive(item.href)
          return `<a href="${item.href}" class="menu-link ${active}" onclick="KonoNav.close()">
            <i class="${item.icon}"></i> ${item.label}
          </a>`
        }).join('')}
      </div>`).join('')

    const user = KonoAuth.getUser()
    const brandSub = user ? `Logged in as ${user.name}` : 'Konosuba Community Bot'

    overlay.innerHTML = `
      <div class="menu-sheet" id="menuSheet">
        <div class="menu-handle"></div>
        <div class="menu-brand">
          <img src="/img/icon.jpg" alt="Konosuba Bot" onerror="this.style.display='none'">
          <div>
            <div class="menu-brand-name gradient-text">Konosuba Bot</div>
            <div class="menu-brand-sub">${brandSub}</div>
          </div>
        </div>
        ${sectionsHtml}
        ${user ? `<div class="menu-section">
          <button class="menu-link" onclick="KonoAuth.logout(); KonoNav.close();" style="color:#fca5a5;">
            <i class="fas fa-right-from-bracket" style="color:#fca5a5;"></i> Logout
          </button>
        </div>` : ''}
      </div>`

    document.body.appendChild(overlay)
  }

  function injectToast() {
    const t = document.createElement('div')
    t.id = 'toast'
    document.body.appendChild(t)
  }

  window.KonoNav = {
    toggle() {
      const o = document.getElementById('menuOverlay')
      if (o.classList.contains('open')) this.close()
      else this.open()
    },
    open() {
      document.getElementById('menuOverlay').classList.add('open')
      document.body.style.overflow = 'hidden'
    },
    close() {
      document.getElementById('menuOverlay').classList.remove('open')
      document.body.style.overflow = ''
    }
  }

  window.showToast = function (msg, type = '', duration = 3000) {
    const t = document.getElementById('toast')
    if (!t) return
    t.textContent = msg
    t.className = `show${type ? ' ' + type : ''}`
    clearTimeout(t._timer)
    t._timer = setTimeout(() => { t.className = '' }, duration)
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectNav()
    injectToast()
  })
})()
