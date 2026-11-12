/**
 * Virorah PMS - Sidebar Navigation Builder
 * Injects the full sidebar nav into any element with id="pms-nav-root".
 * Nav structure mirrors the Softr navigation extracted via MCP.
 */
(function () {
  'use strict';

  /* ---- Full nav structure ---- */
  const NAV = [
    {
      id: 'platform-tour',
      label: 'Platform Tour',
      href: '/pages/tour.html',
      icon: 'map',
      pro: false
    },
    {
      section: 'Overview',
      items: [
        { label: 'Home',  href: '/pages/home.html',  icon: 'home',  pro: false },
        { label: 'About', href: '/pages/about.html', icon: 'info',  pro: false }
      ]
    },
    {
      section: 'Forge',
      items: [
        { label: 'Forge Team Simulation', href: '/pages/forge.html',              icon: 'users',      pro: true },
        { label: 'Forge Your Org',        href: '/pages/forge-your-org.html',     icon: 'building',   pro: true },
        { label: 'The Case Room',         href: '/pages/case-room.html',          icon: 'briefcase',  pro: true },
        { label: 'The Foundry',           href: '/pages/the-foundry.html',        icon: 'flask',      pro: true },
        { label: 'Forge Case Studies',    href: '/pages/forge-case-studies.html', icon: 'book-open',  pro: false }
      ]
    },
    {
      section: 'Simulate',
      items: [
        { label: 'Simulate Conversations', href: '/pages/simulate.html', icon: 'message-circle', pro: true },
        { label: 'Manager Game',           href: '/pages/game.html',     icon: 'gamepad-2',      pro: false }
      ]
    },
    {
      section: 'Practice',
      items: [
        { label: 'Scenarios',         href: '/pages/scenarios.html',       icon: 'layers',   pro: false },
        { label: 'Analyse Your Org',  href: '/pages/analyse-your-org.html',icon: 'bar-chart',pro: true  }
      ]
    },
    {
      section: 'Tools',
      items: [
        { label: 'Manager Report Card', href: '/pages/manager-report-card.html', icon: 'clipboard-check', pro: true  },
        { label: 'Bias Audit',          href: '/pages/bias-audit.html',          icon: 'shield',           pro: true  },
        { label: 'Goal Lab',            href: '/pages/goal-lab.html',            icon: 'target',           pro: true  },
        { label: 'Review Cycle',        href: '/pages/review-cycle.html',        icon: 'refresh-cw',       pro: true  }
      ]
    },
    {
      section: 'Humacity',
      items: [
        { label: 'Value Ledger',       href: '/pages/humacity-ledger.html',          icon: 'file-text',   pro: false },
        { label: 'Talent Premium',     href: '/pages/humacity-talent-premium.html',  icon: 'award',       pro: false },
        { label: 'Org Vitals',         href: '/pages/humacity-org-vitals.html',      icon: 'activity',    pro: false },
        { label: 'Human P&L',          href: '/pages/humacity-human-pl.html',        icon: 'trending-up', pro: false },
        { label: 'Human Balance Sheet',href: '/pages/humacity-balance-sheet.html',   icon: 'layout',      pro: false }
      ]
    },
    {
      section: 'Learn',
      items: [
        { label: 'Learning Hub',         href: '/pages/learning-hub.html',    icon: 'book',          pro: false },
        { label: 'Learning Case Studies',href: '/pages/case-studies.html',    icon: 'file-text',     pro: false },
        { label: 'Templates',            href: '/pages/templates.html',       icon: 'layout',        pro: false },
        { label: 'Downloads',            href: '/pages/downloads.html',       icon: 'download',      pro: false }
      ]
    },
    {
      section: 'Progress',
      items: [
        { label: 'Certifications', href: '/pages/certifications.html', icon: 'award',    pro: false },
        { label: 'My Progress',    href: '/pages/progress.html',       icon: 'trending-up', pro: false }
      ]
    },
    {
      id: 'pricing',
      label: 'Pricing',
      href: '/pages/pricing.html',
      icon: 'tag',
      pro: false
    },
    {
      id: 'pulse',
      label: 'Pulse',
      href: '/pages/pulse.html',
      icon: 'activity',
      pro: true
    },
    {
      id: 'billing',
      label: 'Billing',
      href: '/pages/billing.html',
      icon: 'credit-card',
      pro: false
    }
  ];

  /* ---- Lucide-compatible SVG icons (inline, no external dep) ---- */
  const ICONS = {
    'map':             '<path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13m6-10v13"/>',
    'home':            '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'info':            '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'users':           '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    'building':        '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2"/>',
    'briefcase':       '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m2 5h4"/>',
    'flask':           '<path d="M9 3h6v8l3 7H6l3-7V3zM6 20h12M9 3H6m9 0h3"/>',
    'book-open':       '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
    'message-circle':  '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    'gamepad-2':       '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
    'layers':          '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'bar-chart':       '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'clipboard-check': '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>',
    'shield':          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'target':          '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'refresh-cw':      '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>',
    'book':            '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    'file-text':       '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'layout':          '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    'download':        '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'award':           '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>',
    'trending-up':     '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    'tag':             '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    'activity':        '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'credit-card':     '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    'settings':        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',
    'log-out':         '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
  };

  function icon (name, size) {
    size = size || 16;
    const paths = ICONS[name] || '';
    return '<svg class="nav-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function navItem (item, isPro) {
    const proBadge = item.pro && !isPro
      ? '<span class="nav-pro-badge">PRO</span>'
      : '';
    const startBadge = item.href === '/pages/tour.html'
      ? '<span class="nav-start-badge">Start</span>'
      : '';
    return '<a class="pms-nav-item" href="' + item.href + '">' +
      icon(item.icon) +
      '<span>' + item.label + '</span>' +
      startBadge +
      proBadge +
      '</a>';
  }

  function buildNav (isPro) {
    let html = '';
    NAV.forEach(function (entry) {
      if (entry.section) {
        html += '<div class="pms-nav-section">';
        html += '<div class="pms-nav-section-label">' + entry.section + '</div>';
        entry.items.forEach(function (item) {
          html += navItem(item, isPro);
        });
        html += '</div>';
      } else {
        html += navItem(entry, isPro);
      }
    });
    return html;
  }

  function buildUserChip () {
    return '<div class="pms-user-chip">' +
      '<div class="pms-avatar">?</div>' +
      '<div class="pms-user-info">' +
        '<div class="pms-user-name">Loading...</div>' +
        '<div class="pms-user-plan">Free</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;padding:4px 2px 0;">' +
      '<a href="/pages/account.html" class="btn btn-ghost btn-sm" style="flex:1;justify-content:center;">' +
        icon('settings', 14) + 'Account' +
      '</a>' +
      '<button data-action="sign-out" class="btn btn-ghost btn-sm" style="flex:1;justify-content:center;">' +
        icon('log-out', 14) + 'Sign out' +
      '</button>' +
    '</div>';
  }

  function buildSidebar (isPro) {
    return '<a href="/pages/home.html" class="pms-sidebar-logo">' +
      '<img src="/virorah_logo_navmatch.png" alt="Virorah PMS">' +
      '<span>Virorah PMS</span>' +
    '</a>' +
    '<nav class="pms-nav">' + buildNav(isPro) + '</nav>' +
    '<div class="pms-sidebar-footer">' + buildUserChip() + '</div>';
  }

  /* ---- Mobile toggle ---- */
  function bindMobileToggle () {
    const toggle    = document.querySelector('.pms-menu-toggle');
    const sidebar   = document.querySelector('.pms-sidebar');
    const backdrop  = document.querySelector('.pms-sidebar-backdrop');
    if (!toggle || !sidebar) return;

    function open () {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    }
    function close () {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }

    toggle.addEventListener('click', function () {
      sidebar.classList.contains('open') ? close() : open();
    });
    if (backdrop) backdrop.addEventListener('click', close);
  }

  /* ---- Init ---- */
  function init () {
    const root = document.getElementById('pms-nav-root');
    if (!root) return;

    /* Render immediately (plan unknown yet) */
    root.innerHTML = buildSidebar(false);
    bindMobileToggle();

    /* Update once auth resolves and we know the plan */
    document.addEventListener('pms:auth-ready', function (e) {
      const isPro = (e.detail && e.detail.plan === 'pro');
      root.innerHTML = buildSidebar(isPro);
      bindMobileToggle();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
