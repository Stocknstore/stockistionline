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

  /* ---------------- Product form: variant selection ----------------
     Progressive enhancement only — snippets/product-variant-picker.liquid
     already renders working radios (name="id") inside a real
     {% form 'product' %}, so a plain submit with zero JS already adds the
     correct variant (see sections/main-product.liquid for the server-
     rendered initial state). This just updates price/availability/etc. in
     place on change, without a reload. Every price comes pre-formatted via
     Liquid's money filter (embedded in the per-form JSON blob), so no
     currency formatting of any kind happens here. */
  function applyVariantState(form, variant) {
    if (!variant) return;

    var priceEl = form.querySelector('[data-product-price]');
    if (priceEl) priceEl.textContent = variant.price;

    var compareEl = form.querySelector('[data-product-compare-at]');
    var discountEl = form.querySelector('[data-product-discount]');
    if (variant.compareAtPrice) {
      if (compareEl) { compareEl.textContent = variant.compareAtPrice; compareEl.hidden = false; }
      if (discountEl) { discountEl.textContent = '−' + variant.discountPercent + '%'; discountEl.hidden = false; }
    } else {
      if (compareEl) compareEl.hidden = true;
      if (discountEl) discountEl.hidden = true;
    }

    var availabilityEl = form.querySelector('[data-product-availability]');
    if (availabilityEl) {
      var inStockLabel = availabilityEl.getAttribute('data-label-in-stock');
      var soldOutLabel = availabilityEl.getAttribute('data-label-sold-out');
      availabilityEl.textContent = variant.available ? inStockLabel : soldOutLabel;
      availabilityEl.classList.toggle('product__availability--sold-out', !variant.available);
    }

    var skuEl = form.querySelector('[data-product-sku]');
    if (skuEl) {
      if (variant.sku) {
        skuEl.textContent = skuEl.getAttribute('data-label-sku-prefix') + variant.sku;
        skuEl.hidden = false;
      } else {
        skuEl.hidden = true;
      }
    }

    var submitEl = form.querySelector('[data-product-submit]');
    if (submitEl) {
      submitEl.disabled = !variant.available;
      submitEl.textContent = variant.available
        ? submitEl.getAttribute('data-label-add')
        : submitEl.getAttribute('data-label-sold-out');
    }

    if (window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);
    }

    if (variant.featuredMediaId) {
      var gallery = document.querySelector('[data-product-gallery]');
      if (gallery) selectGalleryMedia(gallery, String(variant.featuredMediaId));
    }
  }

  /* ---------------- Product form: quantity selector ----------------
     Progressive enhancement only — the number input already works with
     zero JS (min="1" + required trigger native constraint validation on
     submit, blocking anything empty or below 1). This normalizes the field
     to a valid whole number on every change (typing then blur/enter, or a
     +/- click) and announces the result once per change through a single
     shared function, so the two entry paths never double-announce the same
     update. */
  function normalizeQuantity(rawValue) {
    var parsed = parseInt(rawValue, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    return parsed;
  }

  function setQuantity(input, rawValue) {
    var normalized = normalizeQuantity(rawValue);
    input.value = normalized;

    var wrapper = input.closest('[data-product-quantity]');
    var announcer = wrapper && wrapper.querySelector('[data-quantity-announcer]');
    if (announcer) {
      announcer.textContent = announcer.getAttribute('data-label-quantity-prefix') + normalized;
    }
    return normalized;
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

      // Product quantity +/- (type="button", never submits the form)
      var quantityDecrease = e.target.closest('[data-quantity-decrease]');
      var quantityIncrease = e.target.closest('[data-quantity-increase]');
      if (quantityDecrease || quantityIncrease) {
        var quantityWrapper = (quantityDecrease || quantityIncrease).closest('[data-product-quantity]');
        var quantityInput = quantityWrapper && quantityWrapper.querySelector('[data-quantity-input]');
        if (quantityInput) {
          var current = normalizeQuantity(quantityInput.value);
          var next = quantityDecrease ? Math.max(1, current - 1) : current + 1;
          setQuantity(quantityInput, next);
        }
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

      // Product variant radios: the form already submits the correct
      // variant natively (name="id" on each radio); this only updates
      // price/availability/etc. in place, without a reload.
      var variantRadio = e.target.closest('[data-variant-radio]');
      if (variantRadio) {
        var productForm = variantRadio.closest('[data-product-form]');
        var dataEl = productForm && productForm.querySelector('[data-product-variants]');
        if (dataEl) {
          try {
            var variants = JSON.parse(dataEl.textContent);
            var selected = variants.filter(function (v) { return String(v.id) === variantRadio.value; })[0];
            applyVariantState(productForm, selected);
          } catch (err) {
            /* malformed/missing variant data — form still submits correctly without JS */
          }
        }
      }

      // Product quantity: normalize on change (fires on blur/enter, not per
      // keystroke) so typing isn't interrupted and the field never
      // announces more than once per completed edit.
      var quantityInput = e.target.closest('[data-quantity-input]');
      if (quantityInput) {
        setQuantity(quantityInput, quantityInput.value);
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
