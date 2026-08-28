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

  /* ---------------- AJAX cart: shared helpers ----------------
     Stage 4B. Every helper below is shared by the two AJAX flows further
     down (product-form add, cart quantity/removal) so section-replacement/
     focus/error/announcement logic is never duplicated between them. */
  function shopifyRoot() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  /* Swaps the *complete* #shopify-section-<id> wrapper for a freshly
     rendered one from an Ajax Cart API response — never [data-cart-drawer]
     itself (which the wrapper contains one level down), so a refresh can
     never nest a second wrapper inside the first. Returns the new
     wrapper's inner element (the actual .cart-drawer / cart-page section
     root) so callers always re-query against fresh, current DOM. */
  function replaceSection(sectionId, html) {
    var oldWrapper = document.getElementById('shopify-section-' + sectionId);
    if (!oldWrapper || !html) return null;
    var temp = document.createElement('div');
    temp.innerHTML = html.trim();
    var newWrapper = temp.firstElementChild;
    if (!newWrapper) return null;
    oldWrapper.replaceWith(newWrapper);
    return newWrapper.firstElementChild;
  }

  /* The Ajax Cart API's bundled sections= response resolves each section
     against whichever theme is actually serving the storefront request —
     on a real published theme that's always the same theme being edited,
     but a section can legitimately come back null in any transitional
     state (a section added since the last publish, a cache not yet
     warm). Rather than silently losing the refresh in that case, fall
     back to the classic Section Rendering API (?section_id=), which
     always resolves against whatever theme is actually serving the
     current page — this is what keeps the drawer/cart-page refresh
     resilient rather than a single point of failure. */
  function resolveSectionHtml(sectionsFromResponse, sectionId) {
    var bundled = sectionsFromResponse && sectionsFromResponse[sectionId];
    if (bundled) return Promise.resolve(bundled);
    return fetch(window.location.pathname + '?section_id=' + sectionId, { headers: { Accept: 'text/html' } })
      .then(function (response) {
        return response.ok ? response.text() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function updateCartCountBadges(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (badge) {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  /* Accessible status announcer for cart changes — created once and left
     in the DOM permanently (outside any section that ever gets replaced).
     Screen readers reliably announce *mutations* to an existing live
     region but aren't guaranteed to announce one that arrives already
     populated as part of a wholesale section swap, so this is
     deliberately never part of the swapped drawer/cart-page markup. */
  function getCartAnnouncer() {
    var el = document.getElementById('CartLiveAnnouncer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'CartLiveAnnouncer';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.className = 'visually-hidden';
      document.body.appendChild(el);
    }
    return el;
  }

  function announceCartUpdate(message) {
    if (!message) return;
    getCartAnnouncer().textContent = message;
  }

  function extractErrorMessage(data, fallback) {
    if (!data) return fallback;
    if (data.description) return data.description;
    if (data.message) return data.message;
    if (data.errors) {
      if (typeof data.errors === 'string') return data.errors;
      var firstKey = Object.keys(data.errors)[0];
      if (firstKey) {
        var value = data.errors[firstKey];
        return Array.isArray(value) ? value[0] : String(value);
      }
    }
    return fallback;
  }

  function showError(el, data) {
    if (!el) return;
    var fallback = el.getAttribute('data-label-generic-error') || 'Something went wrong. Please try again.';
    el.textContent = extractErrorMessage(data, fallback);
    el.hidden = false;
  }

  function clearError(el) {
    if (el) {
      el.hidden = true;
      el.textContent = '';
    }
  }

  /* ---------------- AJAX cart: add to cart (PDP form) ----------------
     Stage 4B. Intercepts sections/main-product.liquid's already-working
     {% form 'product' %} only when JS runs — with JS off the exact same
     form still submits natively (Stage 2 behavior, untouched). Submits
     the form's own FormData (so whatever variant radio/quantity value is
     currently selected is exactly what's sent — nothing rebuilt by hand)
     plus sections=cart-drawer so the drawer refresh is Liquid's own
     render of real post-add cart state. Never fetches /cart.js — the
     bundled section response is the sole source of truth. */
  function handleProductFormSubmit(form) {
    if (form.hasAttribute('data-submitting')) return; // prevent duplicate submits
    form.setAttribute('data-submitting', 'true');
    form.setAttribute('aria-busy', 'true');

    var submitBtn = form.querySelector('[data-product-submit]');
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    var errorEl = form.querySelector('[data-product-form-error]');
    clearError(errorEl);

    var formData = new FormData(form);
    formData.append('sections', 'cart-drawer');
    formData.append('sections_url', window.location.pathname);

    function restoreButtonState() {
      form.removeAttribute('data-submitting');
      form.removeAttribute('aria-busy');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = originalLabel;
      }
    }

    fetch(shopifyRoot() + 'cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    }).then(function (response) {
      return response.json().then(function (data) {
        return { ok: response.ok, data: data };
      });
    }).then(function (result) {
      restoreButtonState();

      if (!result.ok) {
        showError(errorEl, result.data);
        return;
      }

      resolveSectionHtml(result.data.sections, 'cart-drawer').then(function (drawerHtml) {
        if (!drawerHtml) return;
        var newDrawer = replaceSection('cart-drawer', drawerHtml);
        if (!newDrawer) return;

        var count = parseInt(newDrawer.getAttribute('data-cart-item-count'), 10) || 0;
        updateCartCountBadges(count);

        /* Preserve Add-to-Cart as the focus-return target: openDrawer()
           reads document.activeElement at call time to set
           lastFocusedElement, and disabling the button above may already
           have moved focus to <body> — so it's explicitly re-focused
           (now that restoreButtonState() has re-enabled it) immediately
           before opening. */
        if (submitBtn) submitBtn.focus();
        openDrawer('[data-cart-drawer]');

        var addedLabel = form.getAttribute('data-label-added-to-cart') || '';
        announceCartUpdate((addedLabel + ' ' + (result.data.title || '')).trim());
      });
    }).catch(function () {
      restoreButtonState();
      showError(errorEl, null);
    });
  }

  /* ---------------- AJAX cart: quantity change / removal ----------------
     Stage 4B. Delegated on document (data-cart-control="quantity"/
     "remove"), so this covers both the drawer's and /cart's identical
     controls with one implementation. Every request carries a generation
     token — if a newer request has already started by the time an older
     one resolves, the stale response is discarded, so rapid repeated
     input (fast typing, holding an arrow key, double-clicking Remove)
     can never let an out-of-order response clobber a more recent edit. */
  var cartChangeRequestId = 0;

  function getMainCartSectionId() {
    var el = document.querySelector('[data-section-id]');
    return el ? el.getAttribute('data-section-id') : null;
  }

  function normalizeCartQuantity(rawValue, previousValue) {
    var parsed = parseInt(rawValue, 10);
    if (isNaN(parsed)) return previousValue; // unparseable — revert rather than guess
    if (parsed < 0) parsed = 0; // matches this field's own min="0" floor
    return parsed;
  }

  function findLineControl(container, lineKey, controlType) {
    if (!container || !lineKey) return null;
    return container.querySelector('[data-cart-line-key="' + lineKey + '"][data-cart-control="' + controlType + '"]');
  }

  function focusFirstAvailable(elements) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i]) {
        elements[i].focus();
        return;
      }
    }
  }

  function restoreDrawerFocus(newDrawer, lineKey, controlType) {
    var equivalent = findLineControl(newDrawer, lineKey, controlType);
    if (equivalent) {
      equivalent.focus();
      return;
    }
    /* Line was removed — fall back to the next remaining line control,
       then the close button, then the empty-state CTA if the cart is now
       fully empty. */
    focusFirstAvailable([
      newDrawer.querySelector('[data-cart-control]'),
      newDrawer.querySelector('.cart-drawer__close'),
      newDrawer.querySelector('[data-cart-empty] a, [data-cart-empty] button')
    ]);
  }

  function restoreMainCartFocus(newMainCart, lineKey, controlType) {
    var equivalent = findLineControl(newMainCart, lineKey, controlType);
    if (equivalent) {
      equivalent.focus();
      return;
    }
    focusFirstAvailable([
      newMainCart.querySelector('[data-cart-control]'),
      newMainCart.querySelector('[data-cart-page-empty] a, [data-cart-page-empty] button'),
      newMainCart.querySelector('.cart-page__continue')
    ]);
  }

  function setLineBusy(triggerEl, busy) {
    var row = triggerEl.closest('.cart-drawer__item, .cart-page__item');
    if (!row) return;
    row.classList.toggle('is-loading', busy);
    row.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function applyCartSectionsResponse(sections, mainCartSectionId, lineKey, controlType, sourceIsDrawer, wasRemoval) {
    if (!sections) return;

    var drawerEl = document.querySelector('[data-cart-drawer]');
    var wasOpen = !!(drawerEl && drawerEl.hasAttribute('data-open'));

    Promise.all([
      resolveSectionHtml(sections, 'cart-drawer'),
      mainCartSectionId ? resolveSectionHtml(sections, mainCartSectionId) : Promise.resolve(null)
    ]).then(function (results) {
      var drawerHtml = results[0];
      var mainCartHtml = results[1];

      var newDrawer = drawerHtml ? replaceSection('cart-drawer', drawerHtml) : null;
      var newMainCart = (mainCartSectionId && mainCartHtml) ? replaceSection(mainCartSectionId, mainCartHtml) : null;

      applyReplacedCartSections(newDrawer, newMainCart, wasOpen, lineKey, controlType, sourceIsDrawer, wasRemoval);
    });
  }

  function applyReplacedCartSections(newDrawer, newMainCart, wasOpen, lineKey, controlType, sourceIsDrawer, wasRemoval) {
    if (newDrawer) {
      var count = parseInt(newDrawer.getAttribute('data-cart-item-count'), 10) || 0;
      updateCartCountBadges(count);

      if (wasOpen) {
        /* Restore open state directly — deliberately not calling
           openDrawer(), which would overwrite lastFocusedElement with
           whatever is focused right now (mid-AJAX-refresh, not the
           original trigger that opened the drawer), breaking Escape/
           backdrop/close-button focus restoration afterward. */
        newDrawer.setAttribute('data-open', '');
        newDrawer.setAttribute('aria-hidden', 'false');
        syncDrawerTriggers(newDrawer.id, true);
        updateScrollLock();

        if (sourceIsDrawer) {
          restoreDrawerFocus(newDrawer, lineKey, controlType);
          var drawerLabel = wasRemoval
            ? newDrawer.getAttribute('data-label-item-removed')
            : newDrawer.getAttribute('data-label-cart-updated');
          announceCartUpdate(drawerLabel);
        }
      }
    }

    if (newMainCart && !sourceIsDrawer) {
      restoreMainCartFocus(newMainCart, lineKey, controlType);
      if (newDrawer) {
        var pageLabel = wasRemoval
          ? newDrawer.getAttribute('data-label-item-removed')
          : newDrawer.getAttribute('data-label-cart-updated');
        announceCartUpdate(pageLabel);
      }
    }
  }

  function performCartChange(triggerEl, lineKey, quantity, controlType) {
    var requestId = ++cartChangeRequestId;
    var sourceIsDrawer = !!triggerEl.closest('[data-cart-drawer]');
    var mainCartSectionId = getMainCartSectionId();

    var sectionIds = ['cart-drawer'];
    if (mainCartSectionId) sectionIds.push(mainCartSectionId);

    var sourceContainer = sourceIsDrawer ? triggerEl.closest('[data-cart-drawer]') : triggerEl.closest('[data-section-id]');
    var errorEl = sourceContainer && sourceContainer.querySelector('[data-cart-error]');
    clearError(errorEl);
    setLineBusy(triggerEl, true);

    fetch(shopifyRoot() + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: lineKey,
        quantity: quantity,
        sections: sectionIds.join(','),
        sections_url: window.location.pathname
      })
    }).then(function (response) {
      return response.json().then(function (data) {
        return { ok: response.ok, data: data };
      });
    }).then(function (result) {
      if (requestId !== cartChangeRequestId) return; // superseded by a newer request

      if (!result.ok) {
        setLineBusy(triggerEl, false);
        showError(errorEl, result.data);
        return;
      }

      applyCartSectionsResponse(result.data.sections, mainCartSectionId, lineKey, controlType, sourceIsDrawer, quantity === 0);
    }).catch(function () {
      if (requestId !== cartChangeRequestId) return;
      setLineBusy(triggerEl, false);
      showError(errorEl, null);
    });
  }

  /* ---------------- Product recommendations ----------------
     Stage 7. sections/product-recommendations.liquid renders collapsed
     (hidden, no grid) on a normal page load, since Liquid's recommendations
     object is only populated when the *current* request is Shopify's own
     recommendations endpoint. This fetches that endpoint — routes.
     product_recommendations_url, exposed via a data attribute so nothing
     here hardcodes a path — with the required section_id/product_id/
     limit/intent=related params, and replaces the #shopify-section-<id>
     wrapper wholesale with the response using the same replaceSection()
     helper Stage 4B already established (the response is complete Shopify
     section markup, so this avoids ever nesting a second wrapper inside
     the first). A non-2xx/empty/malformed response is swallowed silently
     — the section simply stays exactly as collapsed as it started, no
     console-breaking error and nothing left half-rendered. */
  function initProductRecommendations() {
    document.querySelectorAll('[data-product-recommendations]').forEach(function (section) {
      // Already in flight, or already carries real recommendation content
      // (a previous successful load) — never fetch/inject a second time.
      if (section.hasAttribute('data-loading')) return;
      if (section.querySelector('.product-recommendations__grid')) return;

      var baseUrl = section.getAttribute('data-recommendations-url');
      var sectionId = section.getAttribute('data-section-id');
      var productId = section.getAttribute('data-product-id');
      var limit = section.getAttribute('data-limit');
      if (!baseUrl || !sectionId || !productId) return;

      section.setAttribute('data-loading', 'true');

      var url = baseUrl
        + '?section_id=' + encodeURIComponent(sectionId)
        + '&product_id=' + encodeURIComponent(productId)
        + '&limit=' + encodeURIComponent(limit || '4')
        + '&intent=related';

      fetch(url)
        .then(function (response) {
          return response.ok ? response.text() : null;
        })
        .then(function (html) {
          if (html) replaceSection(sectionId, html);
        })
        .catch(function () {
          /* left collapsed — a non-blocking, silent failure */
        });
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

      // Cart line item removal (AJAX, quantity 0) — item.url_to_remove
      // stays the real, working no-JS href; this only runs when JS can
      // intercept the click, in the drawer and on /cart alike.
      var cartRemove = e.target.closest('[data-cart-control="remove"]');
      if (cartRemove) {
        e.preventDefault();
        performCartChange(cartRemove, cartRemove.getAttribute('data-cart-line-key'), 0, 'remove');
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

      // Cart line item quantity (AJAX) — fires on blur/enter, not per
      // keystroke (matching the same rationale as the PDP quantity field
      // above). Reverts to the field's last known-good (server-rendered)
      // value on anything unparseable rather than guessing at intent.
      var cartQuantityInput = e.target.closest('[data-cart-control="quantity"]');
      if (cartQuantityInput) {
        var previousQuantity = parseInt(cartQuantityInput.defaultValue, 10) || 0;
        var normalizedQuantity = normalizeCartQuantity(cartQuantityInput.value, previousQuantity);
        cartQuantityInput.value = normalizedQuantity;
        performCartChange(cartQuantityInput, cartQuantityInput.getAttribute('data-cart-line-key'), normalizedQuantity, 'quantity');
      }
    });

    // AJAX add-to-cart: intercepts only sections/main-product.liquid's
    // {% form 'product' %} (data-product-form). With JS off, this listener
    // never runs and the exact same form still submits natively (Stage 2
    // behavior, unchanged).
    document.addEventListener('submit', function (e) {
      var productForm = e.target.closest('[data-product-form]');
      if (productForm) {
        e.preventDefault();
        handleProductFormSubmit(productForm);
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
    initProductRecommendations();
  });
})();
