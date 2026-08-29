/* ==========================================================================
   Phase 5, Stage 2 — Local wishlist storage foundation
   assets/wishlist.js

   Client-only, browser/device-specific wishlist. Kept entirely independent
   from theme.js (cart/account/search/filters/checkout) — nothing here is
   read or called by any other script, and nothing else writes this
   storage key. Stores only { id, handle } pairs, never full product data,
   prices or images, and never touches cookies/metafields/network requests.

   Storage is versioned (stockisti:wishlist:v1) so a future format change
   can detect and discard incompatible data instead of crashing on it.
   Every storage read/write is wrapped so a blocked, disabled, full or
   corrupted localStorage degrades to "wishlist controls stay hidden",
   never a thrown error that could break browsing elsewhere on the page.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'stockisti:wishlist:v1';
  var storageAvailable = false;

  /* ---------------- Storage primitives ---------------- */
  function testStorageAvailable() {
    try {
      var testKey = STORAGE_KEY + ':test';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* Parses and validates the stored array, deduplicating by id and
     silently dropping any entry that isn't a well-formed { id, handle }
     pair — a corrupted or hand-edited value degrades to an empty list
     rather than throwing. */
  function readList() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      var seen = {};
      var out = [];
      parsed.forEach(function (entry) {
        if (!entry || typeof entry !== 'object') return;
        if (entry.id === undefined || entry.id === null || entry.id === '') return;
        if (typeof entry.handle !== 'string' || entry.handle === '') return;
        var id = String(entry.id);
        if (seen[id]) return;
        seen[id] = true;
        out.push({ id: id, handle: entry.handle });
      });
      return out;
    } catch (e) {
      return [];
    }
  }

  function writeList(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function dispatchChange(id, saved) {
    document.dispatchEvent(
      new CustomEvent('wishlist:change', { detail: { id: id, saved: saved, count: readList().length } })
    );
  }

  /* ---------------- Public-shaped internal operations ---------------- */
  function isSaved(id) {
    if (!storageAvailable || id === undefined || id === null) return false;
    id = String(id);
    return readList().some(function (entry) { return entry.id === id; });
  }

  function count() {
    if (!storageAvailable) return 0;
    return readList().length;
  }

  function add(id, handle) {
    if (!storageAvailable) return false;
    id = String(id);
    var list = readList();
    if (list.some(function (entry) { return entry.id === id; })) return true;
    list.push({ id: id, handle: handle });
    if (!writeList(list)) return false;
    dispatchChange(id, true);
    return true;
  }

  function remove(id) {
    if (!storageAvailable) return false;
    id = String(id);
    var list = readList();
    var next = list.filter(function (entry) { return entry.id !== id; });
    if (next.length === list.length) return true;
    if (!writeList(next)) return false;
    dispatchChange(id, false);
    return true;
  }

  function toggle(id, handle) {
    if (!storageAvailable) return null;
    var ok = isSaved(id) ? remove(id) : add(id, handle);
    return ok ? true : null;
  }

  /* ---------------- Button rendering ---------------- */
  function syncButton(btn) {
    var id = btn.getAttribute('data-wishlist-id');
    var saved = isSaved(id);
    btn.setAttribute('aria-pressed', String(saved));
    var label = saved ? btn.getAttribute('data-label-remove') : btn.getAttribute('data-label-add');
    if (label) btn.setAttribute('aria-label', label);
    btn.classList.toggle('is-saved', saved);
  }

  function syncAllButtons(scope) {
    (scope || document).querySelectorAll('[data-wishlist-toggle]').forEach(syncButton);
  }

  function revealAllButtons(scope) {
    (scope || document).querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      btn.hidden = false;
    });
  }

  function updateCountBadges() {
    var n = count();
    document.querySelectorAll('[data-wishlist-count]').forEach(function (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    });
  }

  /* Buttons injected later (Shopify product recommendations replacing
     their whole section wrapper, or any future async section) need the
     same reveal/sync pass. Scoped to only act when an added subtree
     actually contains a wishlist button, rather than resyncing on every
     unrelated mutation (drawer open/close etc. only toggle attributes,
     which this childList-only observer never sees). No polling. */
  function observeForNewButtons() {
    var observer = new MutationObserver(function (mutations) {
      var found = false;
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (found || node.nodeType !== 1) return;
          if (node.matches && node.matches('[data-wishlist-toggle]')) {
            found = true;
          } else if (node.querySelector && node.querySelector('[data-wishlist-toggle]')) {
            found = true;
          }
        });
      });
      if (found) {
        syncAllButtons(document);
        revealAllButtons(document);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------- Wishlist page hydration ----------------
     Phase 5, Stage 3. sections/main-wishlist.liquid renders a static
     shell (loading/empty/error states + an empty grid mount point) since
     the wishlist is entirely client-side — nothing about which products
     are saved is knowable server-side. This reads the saved { id, handle }
     list and, for each entry, fetches the real Liquid-rendered card from
     sections/wishlist-product-card.liquid via the same classic Section
     Rendering API pattern already used for cart/recommendations refreshes
     elsewhere in this theme, so a wishlist-page card is never hand-built
     here — only ever extracted from a real section response. */
  function shopifyRoot() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  /* Pulls out only the actual .product-card node from a wishlist-product-
     card section response -- never the #shopify-section-* wrapper or the
     [data-wishlist-product-card-source] div around it, so nothing with a
     duplicate id/wrapper is ever inserted into the wishlist grid. Returns
     null for any response that isn't shaped exactly as expected (missing
     wrapper/source/card), which the caller treats the same as a 404 --
     stale/prunable, not a transient failure.

     Verified against a real handle that doesn't resolve to any product:
     Shopify's section_id endpoint answers 200 (not 404) with this exact
     section re-rendered against a blank `product` -- wrapper/source/card
     all structurally present, but product-card.liquid's link ends up with
     href="" since product.url is blank. A missing/empty href is therefore
     the reliable signal that this "card" isn't a real product, on top of
     the structural wrapper/source checks. */
  function extractWishlistCard(html) {
    var temp = document.createElement('div');
    temp.innerHTML = html;
    var wrapper = temp.querySelector('#shopify-section-wishlist-product-card');
    if (!wrapper) return null;
    var source = wrapper.querySelector('[data-wishlist-product-card-source]');
    if (!source) return null;
    var card = source.firstElementChild;
    if (!card) return null;
    var link = card.querySelector('a[href]');
    if (!link || !link.getAttribute('href')) return null;
    return card;
  }

  function initWishlistPage() {
    var grid = document.querySelector('[data-wishlist-grid]');
    if (!grid || grid.hasAttribute('data-wishlist-hydrated')) return;
    grid.setAttribute('data-wishlist-hydrated', 'true');

    var loadingEl = document.querySelector('[data-wishlist-loading]');
    var emptyEl = document.querySelector('[data-wishlist-empty]');
    var errorEl = document.querySelector('[data-wishlist-error]');

    function showEmpty() {
      if (loadingEl) loadingEl.hidden = true;
      if (errorEl) errorEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      grid.setAttribute('aria-busy', 'false');
    }

    function showPartialError() {
      if (errorEl) {
        errorEl.textContent = errorEl.getAttribute('data-label-partial-error') || '';
        errorEl.hidden = false;
      }
    }

    // Distinct from showEmpty(): every saved entry failed to load for a
    // TEMPORARY reason (e.g. offline). The wishlist is not actually empty
    // -- saying so would be actively misleading and would hide the one
    // message that explains what happened, so this shows the error state
    // instead and leaves the (empty) grid exactly as collapsed as the
    // empty state would, without claiming there's nothing saved.
    function showFullError() {
      if (loadingEl) loadingEl.hidden = true;
      if (emptyEl) emptyEl.hidden = true;
      if (errorEl) {
        errorEl.textContent = errorEl.getAttribute('data-label-full-error') || errorEl.getAttribute('data-label-partial-error') || '';
        errorEl.hidden = false;
      }
      grid.setAttribute('aria-busy', 'false');
    }

    function finishLoading() {
      if (loadingEl) loadingEl.hidden = true;
      grid.setAttribute('aria-busy', 'false');
    }

    // storageAvailable is false only when localStorage itself is blocked --
    // in that case there is no way to know what (if anything) was ever
    // saved from this browser, so the honest, non-alarming result is the
    // same empty state a genuinely-empty wishlist would show.
    var list = storageAvailable ? readList() : [];
    if (list.length === 0) {
      showEmpty();
      return;
    }

    var root = shopifyRoot();
    var pending = list.length;
    var visibleCount = 0;
    var hadTemporaryFailure = false;

    // Slots are created up front, in saved order, before any fetch
    // resolves -- this is what guarantees final card order matches saved
    // order regardless of which network request finishes first.
    var slots = list.map(function () {
      var slot = document.createElement('div');
      slot.className = 'wishlist-page__slot';
      slot.hidden = true;
      grid.appendChild(slot);
      return slot;
    });

    function settle(index, entry, result) {
      pending -= 1;
      if (result.kind === 'ok') {
        slots[index].hidden = false;
        slots[index].appendChild(result.card);
        visibleCount += 1;
      } else if (result.kind === 'missing') {
        // Deleted/unpublished/404/structurally-invalid: permanently stale,
        // safe to prune -- remove() itself is a no-op if it's already gone.
        slots[index].remove();
        remove(entry.id);
      } else {
        // Temporary network/server failure: keep the saved entry, just
        // don't show a card for it this time.
        slots[index].remove();
        hadTemporaryFailure = true;
      }

      if (pending === 0) {
        finishLoading();
        if (visibleCount === 0) {
          if (hadTemporaryFailure) {
            showFullError();
          } else {
            showEmpty();
          }
        } else if (hadTemporaryFailure) {
          showPartialError();
        }
      }
    }

    list.forEach(function (entry, index) {
      var url = root + 'products/' + encodeURIComponent(entry.handle) + '?section_id=wishlist-product-card';
      fetch(url, { headers: { Accept: 'text/html' } })
        .then(function (response) {
          if (response.status === 404) return { kind: 'missing' };
          if (!response.ok) return { kind: 'temp-error' };
          return response.text().then(function (html) {
            var card = extractWishlistCard(html);
            return card ? { kind: 'ok', card: card } : { kind: 'missing' };
          });
        })
        .catch(function () {
          return { kind: 'temp-error' };
        })
        .then(function (result) {
          settle(index, entry, result);
        });
    });
  }

  /* Removing a product's wishlist button anywhere (including from inside
     a card this page itself injected) must remove that card from the grid
     immediately, without refetching anything, and land keyboard focus
     somewhere sensible. Only fires once this page has actually hydrated;
     harmless no-op everywhere else (grid.querySelector finds nothing for
     ids it never rendered, e.g. a prune during initial hydration itself). */
  function initWishlistPageRemovalSync() {
    document.addEventListener('wishlist:change', function (e) {
      var grid = document.querySelector('[data-wishlist-grid]');
      if (!grid || !grid.hasAttribute('data-wishlist-hydrated')) return;
      if (!e.detail || e.detail.saved) return;

      var btn = grid.querySelector('[data-wishlist-toggle][data-wishlist-id="' + e.detail.id + '"]');
      if (!btn) return;
      var slot = btn.closest('.wishlist-page__slot');
      if (!slot) return;

      var allSlots = Array.prototype.slice.call(grid.querySelectorAll('.wishlist-page__slot'));
      var slotIndex = allSlots.indexOf(slot);
      var nextSlot = allSlots[slotIndex + 1];
      var prevSlot = slotIndex > 0 ? allSlots[slotIndex - 1] : null;

      slot.remove();

      var remaining = grid.querySelectorAll('.wishlist-page__slot').length;
      if (remaining === 0) {
        var emptyEl = document.querySelector('[data-wishlist-empty]');
        if (emptyEl) emptyEl.hidden = false;
        var errorEl = document.querySelector('[data-wishlist-error]');
        if (errorEl) errorEl.hidden = true;
        var cta = emptyEl && emptyEl.querySelector('a, button');
        var heading = document.querySelector('.wishlist-page__heading');
        if (cta) {
          cta.focus();
        } else if (heading) {
          heading.focus();
        }
        return;
      }

      var focusTarget =
        (nextSlot && nextSlot.querySelector('[data-wishlist-toggle]')) ||
        (prevSlot && prevSlot.querySelector('[data-wishlist-toggle]'));
      if (focusTarget) focusTarget.focus();
    });
  }

  /* ---------------- Events ---------------- */
  function initEvents() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wishlist-toggle]');
      if (!btn || !storageAvailable) return;
      toggle(btn.getAttribute('data-wishlist-id'), btn.getAttribute('data-wishlist-handle'));
    });

    document.addEventListener('wishlist:change', function () {
      syncAllButtons(document);
      updateCountBadges();
    });
  }

  function init() {
    storageAvailable = testStorageAvailable();
    initEvents();
    initWishlistPageRemovalSync();

    if (!storageAvailable) {
      initWishlistPage();
      return;
    }

    syncAllButtons(document);
    revealAllButtons(document);
    updateCountBadges();
    observeForNewButtons();
    initWishlistPage();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
