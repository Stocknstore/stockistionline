/* ==========================================================================
   Ella 7 Reconstruction — Phase 1: global shell interactions
   theme.js
   ========================================================================== */
(function () {
  'use strict';

  var OPEN_DRAWER_SELECTORS = ['[data-mobile-menu-drawer]', '[data-search-drawer]', '[data-account-drawer]', '[data-cart-drawer]'];
  var lastFocusedElement = null;

  /* ---------------- Scroll lock ---------------- */
  function anyDrawerOpen() {
    return OPEN_DRAWER_SELECTORS.some(function (sel) {
      var el = document.querySelector(sel);
      return el && el.hasAttribute('data-open');
    });
  }

  function updateScrollLock() {
    document.body.classList.toggle('scroll-locked', anyDrawerOpen());
  }

  /* ---------------- Generic drawer open/close ---------------- */
  function openDrawer(selector, focusSelector) {
    var el = document.querySelector(selector);
    if (!el) return;
    lastFocusedElement = document.activeElement;
    el.setAttribute('data-open', '');
    el.setAttribute('aria-hidden', 'false');
    updateScrollLock();
    var focusTarget = focusSelector ? el.querySelector(focusSelector) : el.querySelector('button, [href], input');
    if (focusTarget) {
      window.setTimeout(function () {
        focusTarget.focus();
      }, 50);
    }
  }

  function closeDrawer(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.removeAttribute('data-open');
    el.setAttribute('aria-hidden', 'true');
    updateScrollLock();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  function closeAllDrawers() {
    OPEN_DRAWER_SELECTORS.forEach(function (sel) {
      closeDrawer(sel);
    });
  }

  /* ---------------- Mobile menu: drill-down navigation ---------------- */
  var drillStack = ['root'];

  function showPanel(panelId) {
    var drawer = document.querySelector('[data-mobile-menu-drawer]');
    if (!drawer) return;
    drawer.querySelectorAll('[data-menu-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-panel-id') === panelId);
    });
  }

  function drillIn(targetId) {
    drillStack.push(targetId);
    showPanel(targetId);
  }

  function drillOut() {
    if (drillStack.length > 1) {
      drillStack.pop();
      showPanel(drillStack[drillStack.length - 1]);
    }
  }

  function resetDrill() {
    drillStack = ['root'];
    showPanel('root');
  }

  /* ---------------- Announcement bar rotation ---------------- */
  function initAnnouncementBar() {
    var el = document.querySelector('[data-announcement-bar]');
    if (!el) return;
    var items = el.querySelectorAll('[data-announcement-item]');
    if (items.length < 2) return;
    var current = 0;
    var speed = (parseInt(el.getAttribute('data-autoplay'), 10) || 5) * 1000;
    setInterval(function () {
      items[current].classList.remove('is-active');
      current = (current + 1) % items.length;
      items[current].classList.add('is-active');
    }, speed);
  }

  /* ---------------- Event delegation ---------------- */
  function initEvents() {
    document.addEventListener('click', function (e) {
      // Mobile menu
      if (e.target.closest('[data-mobile-menu-toggle]')) {
        resetDrill();
        openDrawer('[data-mobile-menu-drawer]');
        return;
      }
      if (e.target.closest('[data-mobile-menu-close]')) {
        closeDrawer('[data-mobile-menu-drawer]');
        window.setTimeout(resetDrill, 300);
        return;
      }
      var drillInBtn = e.target.closest('[data-drill-in]');
      if (drillInBtn) {
        drillIn(drillInBtn.getAttribute('data-target'));
        return;
      }
      if (e.target.closest('[data-drill-out]')) {
        drillOut();
        return;
      }

      // Search
      if (e.target.closest('[data-search-toggle]')) {
        openDrawer('[data-search-drawer]', '[data-search-input]');
        return;
      }
      if (e.target.closest('[data-search-close]')) {
        closeDrawer('[data-search-drawer]');
        return;
      }

      // Account
      if (e.target.closest('[data-account-toggle]') || e.target.closest('[data-open-account]')) {
        closeDrawer('[data-cart-drawer]');
        openDrawer('[data-account-drawer]');
        return;
      }
      if (e.target.closest('[data-account-close]')) {
        closeDrawer('[data-account-drawer]');
        return;
      }

      // Cart
      if (e.target.closest('[data-cart-toggle]')) {
        e.preventDefault();
        openDrawer('[data-cart-drawer]');
        return;
      }
      if (e.target.closest('[data-cart-close]')) {
        closeDrawer('[data-cart-drawer]');
        return;
      }

      // Language selector button (utility row) opens the mobile menu's region
      // panel on small screens, or a simple inline toggle on desktop.
      if (e.target.closest('[data-language-toggle]')) {
        var btn = e.target.closest('[data-language-toggle]');
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (anyDrawerOpen()) {
        closeAllDrawers();
        window.setTimeout(resetDrill, 300);
      }
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initEvents();
    initAnnouncementBar();
  });
})();
