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

  function dispatchChange() {
    document.dispatchEvent(
      new CustomEvent('wishlist:change', { detail: { count: readList().length } })
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
    dispatchChange();
    return true;
  }

  function remove(id) {
    if (!storageAvailable) return false;
    id = String(id);
    var list = readList();
    var next = list.filter(function (entry) { return entry.id !== id; });
    if (next.length === list.length) return true;
    if (!writeList(next)) return false;
    dispatchChange();
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
    if (!storageAvailable) return;

    syncAllButtons(document);
    revealAllButtons(document);
    updateCountBadges();
    observeForNewButtons();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
