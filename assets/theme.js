/* ==========================================================================
   Ella 7 Reconstruction — Phase 1: global shell interactions
   theme.js
   ========================================================================== */
(function () {
  'use strict';

  var OPEN_DRAWER_SELECTORS = ['[data-mobile-menu-drawer]', '[data-search-drawer]', '[data-account-drawer]', '[data-cart-drawer]', '[data-filter-drawer]'];
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

  /* Any trigger that declares aria-controls="<drawer id>" gets its
     aria-expanded kept in sync automatically — a no-op for existing
     triggers that don't set aria-controls, functional for the filter
     drawer's toggle button (Stage 6). */
  function syncDrawerTriggers(drawerId, expanded) {
    if (!drawerId) return;
    document.querySelectorAll('[aria-controls="' + drawerId + '"]').forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', String(expanded));
    });
  }

  /* ---------------- Generic drawer open/close ---------------- */
  function openDrawer(selector, focusSelector) {
    var el = document.querySelector(selector);
    if (!el) return;
    lastFocusedElement = document.activeElement;
    el.setAttribute('data-open', '');
    el.setAttribute('aria-hidden', 'false');
    syncDrawerTriggers(el.id, true);
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
    syncDrawerTriggers(el.id, false);
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

  /* ---------------- Collection toolbar: view + column state ----------------
     Client-side only, no AJAX product loading — every value is validated
     before use so a corrupted/foreign localStorage value can never apply an
     unsupported view or column count. State lives on the ancestor
     .collection-grid section via data-view/data-columns; both the grid and
     list product sets are already server-rendered (see sections/
     collection-grid.liquid), so toggling is a pure attribute flip with no
     re-fetch. */
  var COLLECTION_VIEW_KEY = 'collectionView';
  var COLLECTION_COLUMNS_KEY = 'collectionColumns';
  var VALID_COLLECTION_VIEWS = ['grid', 'list'];
  var VALID_COLLECTION_COLUMNS = ['2', '3', '4'];

  function readStoredValue(key, validValues) {
    try {
      var value = window.localStorage.getItem(key);
      return validValues.indexOf(value) !== -1 ? value : null;
    } catch (e) {
      return null;
    }
  }

  function writeStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable (private mode, quota, etc.) — state stays session-only */
    }
  }

  function syncCollectionToolbar(grid) {
    var view = grid.getAttribute('data-view');
    var columns = grid.getAttribute('data-columns');
    grid.querySelectorAll('[data-view-btn]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-view-btn') === view));
    });
    grid.querySelectorAll('[data-columns-btn]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-columns-btn') === columns));
    });
  }

  function initCollectionToolbar() {
    var grids = document.querySelectorAll('.collection-grid[data-view]');
    if (!grids.length) return;

    var storedView = readStoredValue(COLLECTION_VIEW_KEY, VALID_COLLECTION_VIEWS);
    var storedColumns = readStoredValue(COLLECTION_COLUMNS_KEY, VALID_COLLECTION_COLUMNS);

    grids.forEach(function (grid) {
      if (storedView) grid.setAttribute('data-view', storedView);
      if (storedColumns) grid.setAttribute('data-columns', storedColumns);
      syncCollectionToolbar(grid);
    });
  }

  /* ---------------- Product gallery: thumbnail selection ----------------
     Progressive enhancement only — snippets/product-gallery.liquid already
     renders a fully viewable horizontal scroll-snap row with zero JS. This
     adds the is-enhanced marker that CSS uses (scoped to min-width:768px,
     theme.css section 33) to switch to a single-active-slide + thumbnail-
     nav presentation; mobile's scroll-snap row is untouched either way. */
  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
      gallery.classList.add('is-enhanced');
    });
  }

  function selectGalleryMedia(gallery, mediaId) {
    gallery.querySelectorAll('[data-gallery-slide]').forEach(function (slide) {
      var isActive = slide.getAttribute('data-media-id') === mediaId;
      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('product-gallery__slide--inactive', !isActive);
    });
    gallery.querySelectorAll('[data-gallery-thumb]').forEach(function (thumb) {
      var isActive = thumb.getAttribute('data-media-id') === mediaId;
      thumb.classList.toggle('is-active', isActive);
      thumb.setAttribute('aria-current', String(isActive));
    });
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

      // Mobile filter drawer
      if (e.target.closest('[data-filter-drawer-toggle]')) {
        openDrawer('[data-filter-drawer]');
        return;
      }
      if (e.target.closest('[data-filter-drawer-close]')) {
        closeDrawer('[data-filter-drawer]');
        return;
      }

      // Language selector button (utility row) opens the mobile menu's region
      // panel on small screens, or a simple inline toggle on desktop.
      if (e.target.closest('[data-language-toggle]')) {
        var btn = e.target.closest('[data-language-toggle]');
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
      }

      // Collection view (grid/list) toggle
      var viewBtn = e.target.closest('[data-view-btn]');
      if (viewBtn) {
        var viewGrid = viewBtn.closest('.collection-grid');
        var view = viewBtn.getAttribute('data-view-btn');
        if (viewGrid && VALID_COLLECTION_VIEWS.indexOf(view) !== -1) {
          viewGrid.setAttribute('data-view', view);
          writeStoredValue(COLLECTION_VIEW_KEY, view);
          syncCollectionToolbar(viewGrid);
        }
        return;
      }

      // Collection column-count toggle (desktop/tablet grid view only)
      var columnsBtn = e.target.closest('[data-columns-btn]');
      if (columnsBtn) {
        var columnsGrid = columnsBtn.closest('.collection-grid');
        var columns = columnsBtn.getAttribute('data-columns-btn');
        if (columnsGrid && VALID_COLLECTION_COLUMNS.indexOf(columns) !== -1) {
          columnsGrid.setAttribute('data-columns', columns);
          writeStoredValue(COLLECTION_COLUMNS_KEY, columns);
          syncCollectionToolbar(columnsGrid);
        }
        return;
      }

      // Product gallery thumbnail selection
      var galleryThumb = e.target.closest('[data-gallery-thumb]');
      if (galleryThumb) {
        var gallery = galleryThumb.closest('[data-product-gallery]');
        if (gallery) selectGalleryMedia(gallery, galleryThumb.getAttribute('data-media-id'));
        return;
      }
    });

    // Sort select: progressive enhancement — the form already works via its
    // visible submit button with no JS; this just auto-submits on change.
    document.addEventListener('change', function (e) {
      var sortSelect = e.target.closest('[data-sort-select]');
      if (sortSelect) {
        var form = sortSelect.closest('form');
        if (form) form.submit();
      }
    });

    // Brand/vendor filter search: progressive enhancement over an
    // already-rendered checkbox list (snippets/collection-filters.liquid).
    // With no JS the input simply does nothing and every checkbox stays
    // visible and fully usable.
    document.addEventListener('input', function (e) {
      var searchInput = e.target.closest('[data-brand-search-input]');
      if (!searchInput) return;
      var list = searchInput.parentElement && searchInput.parentElement.querySelector('[data-brand-search-list]');
      if (!list) return;
      var query = searchInput.value.trim().toLowerCase();
      list.querySelectorAll('.collection-filters__option').forEach(function (option) {
        var label = option.querySelector('label');
        var text = label ? label.textContent.trim().toLowerCase() : '';
        option.hidden = query.length > 0 && text.indexOf(query) === -1;
      });
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
    initCollectionToolbar();
    initProductGallery();
  });
})();
