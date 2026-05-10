console.log('>> [AmbientGlass] Script Triggered! <<');
// AmbientGlass - theme.js (v15.0)
// Branding: AmbientGlass startup screen.
// Entrance: soft drop and zoom.
// Layout: 50/50 split.
// Safety: 60px margin.
// NavFix: colon-to-slash conversion added by Antigravity.

(function AmbientGlass() {
  'use strict';
  console.log("AmbientGlass V16.5. Created by EROX");

  if (!Spicetify?.Player || !Spicetify?.Platform) {
    setTimeout(AmbientGlass, 300);
    return;
  }

  const ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    album: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
    playlist: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    artist: '<path d="M12 12.25c2.899 0 5.25-2.351 5.25-5.25S14.899 1.75 12 1.75 6.75 4.101 6.75 7 9.101 12.25 12 12.25zm0-1.5c-2.071 0-3.75-1.679-3.75-3.75S9.929 3.25 12 3.25s3.75 1.679 3.75 3.75S14.071 10.75 12 10.75zM22.25 21.75H1.75v-1.5c0-3.314 2.686-6 6-6h8.5c3.314 0 6 2.686 6 6v1.5zm-1.5-1.5c0-2.485-2.015-4.5-4.5-4.5H7.75c-2.485 0-4.5 2.015-4.5 4.5v.15h17.5v-.15z"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    stats: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  };

  function svg(pathContent, opts = {}) {
    const stroke = opts.stroke ?? 2.5; const size = opts.size ?? 24;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${pathContent}</svg>`;
  }

  const DEFAULT_LAYOUT = {
    dock: { x: 16, y: 48 },
    homeCluster: { x: 50, y: 34 },
    search: { x: 50, y: 46 },
    nowPlaying: { x: 50, y: 94, w: 58 }
  };
  let _layoutEditMode = false;
  let _layoutDraft = null;
  let _layoutFrame = 0;
  let _layoutDragging = false;
  let _visibilityFrame = 0;
  let _runtimeTimers = { light: 0, full: 0, menu: 0, dock: 0, jam: 0 };
  let _dockButtonsCache = [];
  let _dockButtonsDirty = true;
  let _lastAppliedLayoutSignature = '';
  let _lastVisibilitySignature = '';
  const HITBOX_STYLE_TEXT = `
      #ag-side-dock {
        position: fixed !important;
        left: var(--ag-dock-x, 14px) !important;
        top: var(--ag-dock-y, 40px) !important;
        z-index: 1000002 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 8px !important;
        width: 44px !important;
        pointer-events: auto !important;
      }
      .ag-dock-hitbox {
        position: relative !important;
        z-index: 1;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        cursor: pointer;
        border-radius: 50%;
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        color: #fff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .ag-dock-hitbox:hover {
        background: rgba(255,255,255,0.15) !important;
        border-color: rgba(255,255,255,0.2) !important;
        box-shadow: 0 0 20px rgba(123,95,219,0.3);
      }
      .ag-dock-hitbox svg { width: 20px; height: 20px; color: #fff; opacity: 0.82; }
      .ag-dock-hitbox img { width: 34px !important; height: 34px !important; border-radius: 50% !important; object-fit: cover !important; }
      .main-contextMenu-tippy,
      [data-tippy-root]:has(.main-contextMenu-menu),
      body:has(.main-contextMenu-menu) .main-contextMenu-menu { z-index: 100000 !important; }
    `;

  function cloneLayout(layout = DEFAULT_LAYOUT) {
    return JSON.parse(JSON.stringify(layout));
  }

  function getLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem('ag-layout') || 'null');
      const base = cloneLayout(DEFAULT_LAYOUT);
      Object.keys(saved || {}).forEach(key => {
        base[key] = { ...(base[key] || {}), ...(saved[key] || {}) };
      });
      delete base.sidebar;
      return base;
    } catch {
      return cloneLayout(DEFAULT_LAYOUT);
    }
  }

  function saveLayout(layout) {
    localStorage.setItem('ag-layout', JSON.stringify(layout));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampPx(value, size, viewportSize, margin = 8) {
    return clamp(value, margin, Math.max(margin, viewportSize - size - margin));
  }

  function snapPercent(value, snap = 50, threshold = 1.4) {
    return Math.abs(value - snap) <= threshold ? snap : value;
  }

  function snapPxCenter(left, size, viewportSize, threshold = 16) {
    const centeredLeft = (viewportSize - size) / 2;
    return Math.abs(left - centeredLeft) <= threshold ? centeredLeft : left;
  }

  function setStyleIfChanged(el, prop, value, priority = '') {
    if (!el) return;
    if (el.style.getPropertyValue(prop) === value && el.style.getPropertyPriority(prop) === priority) return;
    if (priority) el.style.setProperty(prop, value, priority);
    else el.style.setProperty(prop, value);
  }

  function queueVisibilityUpdate() {
    if (_visibilityFrame) return;
    _visibilityFrame = requestAnimationFrame(() => {
      _visibilityFrame = 0;
      updateVisibility();
    });
  }

  function scheduleRuntimeFix(mode = 'light', delay = 0) {
    clearTimeout(_runtimeTimers[mode]);
    _runtimeTimers[mode] = setTimeout(() => {
      _runtimeTimers[mode] = 0;
      runRuntimeFixes(mode);
    }, delay);
  }

  function markDockDirty() {
    _dockButtonsDirty = true;
  }

  function applyLayout(layout = getLayout()) {
    document.body?.classList.toggle('ag-layout-custom', !!localStorage.getItem('ag-layout') || _layoutEditMode);
    const pinHomeTop = !_layoutEditMode && getMainScrollY() > 12;
    const signature = [
      _layoutEditMode ? 'edit' : 'live',
      pinHomeTop ? 'pinned' : 'free',
      layout.homeCluster.x, layout.homeCluster.y,
      layout.search.x, layout.search.y,
      layout.nowPlaying.x, layout.nowPlaying.y
    ].join('|');
    if (signature === _lastAppliedLayoutSignature) return;
    _lastAppliedLayoutSignature = signature;
    const cluster = document.getElementById('ag-home-cluster');
    if (cluster) {
      setStyleIfChanged(cluster, 'left', pinHomeTop ? '50%' : `${layout.homeCluster.x}%`, 'important');
      setStyleIfChanged(cluster, 'top', pinHomeTop ? '60px' : `${layout.homeCluster.y}%`, 'important');
      setStyleIfChanged(cluster, 'right', 'auto', 'important');
      setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
      setStyleIfChanged(cluster, 'width', '340px', 'important');
      setStyleIfChanged(cluster, 'height', '92px', 'important');
      setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
    }

    const search = document.getElementById('ag-centered-search');
    if (search) {
      setStyleIfChanged(search, 'left', `${layout.search.x}%`);
      setStyleIfChanged(search, 'top', `${layout.search.y}%`);
      setStyleIfChanged(search, 'transform', 'translate(-50%, -50%) scale(1)');
    }

    const nowPlaying = document.querySelector('.Root__now-playing-bar');
    if (nowPlaying) {
      nowPlaying.style.setProperty('--ag-now-x', layout.nowPlaying.x + '%');
      nowPlaying.style.setProperty('--ag-now-y', layout.nowPlaying.y + '%');
    }

    const jamPill = document.getElementById('ag-jam-floating-pill');
    if (jamPill) {
      setStyleIfChanged(jamPill, 'left', `${layout.nowPlaying.x}%`, 'important');
      setStyleIfChanged(jamPill, 'top', `calc(${layout.nowPlaying.y}% - 68px)`, 'important');
      setStyleIfChanged(jamPill, 'bottom', 'auto', 'important');
      setStyleIfChanged(jamPill, 'transform', 'translate(-50%, -50%)', 'important');
    }

    positionUpNextCard();

    document.body?.classList.remove('ag-sidebar-on-left', 'ag-sidebar-on-right');
  }

  function getMainScrollY() {
    const scrollers = Array.from(document.querySelectorAll('.Root__main-view [data-overlayscrollbars-viewport], .Root__main-view .os-viewport, .Root__main-view'));
    if (!scrollers.length) return _lastScrollY || 0;
    return scrollers.reduce((max, el) => Math.max(max, Number(el?.scrollTop) || 0), 0);
  }

  // Navigator fix.
  function safeNavigate(input) {
    if (!input) return;
    let path = input;
    if (path.startsWith('spotify:')) {
      path = '/' + path.split(':').slice(1).join('/');
    }
    try { Spicetify.Platform.History.push(path); }
    catch { window.location.hash = '#' + path; }
  }

    function killTopbar() {
    const el = document.querySelector(".main-topBar-container");
    if (!el) return;
    
    // Marketplace is a special case: keep the native top bar visible.
    const path = Spicetify.Platform.History.location.pathname;
    const isMarketplace = path.includes("marketplace") || !!document.querySelector('.marketplace-header') || !!document.querySelector('#marketplace-extension-button');

    if (isMarketplace) {
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("display", "flex", "important");
        el.style.setProperty("pointer-events", "auto", "important");
        return;
    }

    el.style.setProperty("background", "transparent", "important");
    el.style.setProperty("box-shadow", "none", "important");
    el.style.setProperty("opacity", "0", "important");
    el.style.setProperty("pointer-events", "none", "important");
  }

  function killResidues() {
    const targets = ['.main-entityHeader-backgroundColor', '.main-entityHeader-overlay', '.main-actionBar-ActionBarBackground', '.main-actionBarBackground-background', '.main-home-filterChipsSection', '.main-home-filterChipsSectionActive', '[class*="filterChipsSection"]', '[class*="actionBarBackground"]'];
    targets.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { 
        const style = el.getAttribute('style') || '';
        // Only clear backgrounds that are not real image URLs.
        if (!style.includes('url(')) {
          el.style.setProperty('background', 'transparent', 'important');
          el.style.setProperty('background-color', 'transparent', 'important');
          el.style.setProperty('background-image', 'none', 'important');
        }
        el.style.setProperty('box-shadow', 'none', 'important');
      });
    });
  }

  function createHomeCluster() {
    if (document.getElementById('ag-home-cluster')) return;
    const cluster = document.createElement('div'); cluster.id = 'ag-home-cluster';
    const createBtn = (cls, icon, title, action, id) => {
      const btn = document.createElement('button'); btn.className = 'ag-cluster-btn ' + cls; if (id) btn.id = id;
      btn.title = title; btn.innerHTML = icon; btn.addEventListener('click', e => { e.stopPropagation(); action(); });
      return btn;
    };
    const liked = createBtn('ag-cluster-liked ag-cluster-lib', svg(ICONS.heart, { stroke: 0, size: 20 }), 'Liked Songs', () => safeNavigate('/collection/tracks'));
    const albums = createBtn('ag-cluster-albums ag-cluster-lib', svg(ICONS.album, { size: 20 }), 'Albums', () => openLibraryPanel('albums'));
    const home = createBtn('ag-home-main', svg(ICONS.home, { size: 20 }), 'Home', () => safeNavigate('/'), 'ag-home-button');
    const playlists = createBtn('ag-cluster-playlists ag-cluster-lib', svg(ICONS.playlist, { size: 20 }), 'Playlists', () => openLibraryPanel('playlists'));
    const artists = createBtn('ag-cluster-artists ag-cluster-lib', svg(ICONS.artist, { size: 20 }), 'Artists', () => openLibraryPanel('artists'));
    [liked, albums, home, playlists, artists].forEach(b => cluster.appendChild(b));
    let clusterHideTimer = null;
    const openCluster = () => {
      window.clearTimeout(clusterHideTimer);
      cluster.classList.add('ag-cluster-open');
    };
    const closeCluster = () => {
      window.clearTimeout(clusterHideTimer);
      clusterHideTimer = window.setTimeout(() => cluster.classList.remove('ag-cluster-open'), 220);
    };
    cluster.addEventListener('pointerenter', openCluster);
    cluster.addEventListener('pointerleave', closeCluster);
    cluster.addEventListener('focusin', openCluster);
    cluster.addEventListener('focusout', closeCluster);
    document.body.appendChild(cluster);
    applyLayout();
  }

  function createHeroGlow() { if (!document.getElementById('ag-hero-glow')) { const g = document.createElement('div'); g.id = 'ag-hero-glow'; document.body.prepend(g); } }
  function createBlobs() {
    if (document.getElementById('ag-blobs')) return;
    const w = document.createElement('div'); w.id = 'ag-blobs';
    w.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
    [
      {t:'-15%', l:'-10%', w:'80vw'}, 
      {t:'35%', l:'50%', w:'65vw'}, 
      {t:'-10%', l:'60%', w:'75vw'},
      {t:'-5%', l:'-5%', w:'50vw'}, // Top Left Blob
      {t:'-15%', l:'35%', w:'65vw'} // Top Center/Right Blob
    ].forEach(d => {
      const b = document.createElement('div'); 
      b.className = 'ag-blob';
      b.style.cssText = `position:absolute;top:${d.t};left:${d.l};width:${d.w};height:${d.w};border-radius:50%;filter:blur(115px);`;
      w.appendChild(b);
    });
    document.body.prepend(w);
  }
  function createGlowSmoother() {
    if (document.getElementById('ag-glow-smoother')) return;
    const smoother = document.createElement('div');
    smoother.id = 'ag-glow-smoother';
    document.body.prepend(smoother);
  }

  function createSearchOverlay() {
    if (document.getElementById('ag-centered-search')) return;
    const d = document.createElement('div'); d.id = 'ag-centered-search';
    d.innerHTML = `<div class="ag-ring"></div><div class="ag-pill-search">${svg(ICONS.search, { size: 18 })}<input class="ag-input" placeholder="Artists..."/></div><div id="ag-search-suggestions"></div>`;
    const inp = d.querySelector('input');
    inp.setAttribute('autocomplete', 'new-password');
    inp.setAttribute('autocorrect', 'off');
    inp.setAttribute('autocapitalize', 'off');
    inp.setAttribute('spellcheck', 'false');
    inp.setAttribute('aria-autocomplete', 'none');
    inp.setAttribute('data-form-type', 'other');
    inp.id = 'ag-input-' + Date.now();
    inp.name = 'ag-search-' + Date.now();
    setupSearchPlaceholderRotation(inp);
    setupSearchSuggestions(inp, d.querySelector('#ag-search-suggestions'));
    document.body.appendChild(d);
    applyLayout();
  }

  function focusAmbientSearch() {
    createSearchOverlay();
    const search = document.getElementById('ag-centered-search');
    const input = search?.querySelector('input');
    if (!search || !input) return false;
    search.classList.add('ag-search-hotkey-focus');
    input.focus();
    input.select?.();
    setTimeout(() => search.classList.remove('ag-search-hotkey-focus'), 900);
    return true;
  }

  function setupAmbientSearchHotkey() {
    if (window.__agSearchHotkeyInstalled) return;
    window.__agSearchHotkeyInstalled = true;
    window.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey || event.key?.toLowerCase?.() !== 'k') return;
      if (!focusAmbientSearch()) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);
  }

  function createUpNextCard() {
    if (document.getElementById('ag-up-next-card')) return;
    const card = document.createElement('button');
    card.id = 'ag-up-next-card';
    card.type = 'button';
    card.innerHTML = `
      <span class="ag-up-next-art"></span>
      <span class="ag-up-next-copy">
        <span class="ag-up-next-label">Up next</span>
        <span class="ag-up-next-title"></span>
        <span class="ag-up-next-subtitle"></span>
      </span>
    `;
    card.addEventListener('click', () => {
      const uri = card.dataset.uri;
      if (uri) safeNavigate(uri);
    });
    document.body.appendChild(card);
    positionUpNextCard();
  }

  function positionUpNextCard() {
    const card = document.getElementById('ag-up-next-card');
    const nowPlaying = document.querySelector('.main-nowPlayingBar-container') ||
                       document.querySelector('.Root__now-playing-bar > *') ||
                       document.querySelector('.Root__now-playing-bar') ||
                       document.getElementById('ag-centered-search');
    if (!card || !nowPlaying) return;
    const rect = nowPlaying.getBoundingClientRect();
    if (!rect.width) return;
    const showBelow = rect.top < 130;
    const top = showBelow ? rect.bottom + 12 : rect.top - 12;
    card.style.left = `${rect.left + rect.width / 2}px`;
    card.style.top = `${top}px`;
    card.style.width = `${Math.min(Math.max(rect.width * 0.68, 300), 460)}px`;
    card.classList.toggle('ag-up-next-below', showBelow);
  }

  function getPlayerPositionMs() {
    try {
      if (typeof Spicetify.Player.getProgress === 'function') return Number(Spicetify.Player.getProgress()) || 0;
    } catch {}
    const data = Spicetify.Player?.data || {};
    const position = Number(data.position || data.progress || data.progressMs || 0);
    const since = Number(data.positionAsOfTimestamp || data.timestamp || 0);
    if (position && since) return position + Math.max(0, Date.now() - since);
    return position || 0;
  }

  function getPlayerDurationMs() {
    const item = Spicetify.Player?.data?.item || {};
    const metadata = item.metadata || {};
    return Number(item.duration?.milliseconds || item.duration_ms || metadata.duration || metadata.duration_ms || 0);
  }

  function normalizeSpotifyImageUrl(url) {
    const clean = String(url || '').trim();
    if (!clean) return '';
    if (clean.startsWith('spotify:image:')) return `https://i.scdn.co/image/${clean.split(':').pop()}`;
    return clean;
  }

  function firstImageUrl(...sources) {
    for (const source of sources) {
      if (!source) continue;
      if (typeof source === 'string') {
        const url = normalizeSpotifyImageUrl(source);
        if (url) return url;
      }
      if (Array.isArray(source)) {
        const url = firstImageUrl(...source);
        if (url) return url;
      }
      if (source?.url) return normalizeSpotifyImageUrl(source.url);
      if (source?.uri) return normalizeSpotifyImageUrl(source.uri);
      if (source?.sources) {
        const url = firstImageUrl(source.sources);
        if (url) return url;
      }
      if (source?.items) {
        const url = firstImageUrl(source.items);
        if (url) return url;
      }
    }
    return '';
  }

  function deepFindImageUrl(source, depth = 0, seen = new Set()) {
    if (!source || depth > 5 || seen.has(source)) return '';
    if (typeof source === 'string') {
      if (source.startsWith('spotify:image:') || source.includes('i.scdn.co/image/') || /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?|$)/i.test(source)) {
        return normalizeSpotifyImageUrl(source);
      }
      return '';
    }
    if (typeof source !== 'object') return '';
    seen.add(source);
    if (Array.isArray(source)) {
      for (const item of source) {
        const url = deepFindImageUrl(item, depth + 1, seen);
        if (url) return url;
      }
      return '';
    }
    if (source.url || source.uri) {
      const url = firstImageUrl(source.url, source.uri);
      if (url) return url;
    }
    if (source.file_id) return normalizeSpotifyImageUrl(`spotify:image:${source.file_id}`);
    const preferredKeys = ['image', 'images', 'coverArt', 'cover', 'cover_group', 'album', 'albumOfTrack', 'metadata', 'sources', 'items'];
    for (const key of preferredKeys) {
      const url = deepFindImageUrl(source[key], depth + 1, seen);
      if (url) return url;
    }
    for (const [key, value] of Object.entries(source)) {
      if (!/image|cover|album|art|metadata|source|item/i.test(key)) continue;
      const url = deepFindImageUrl(value, depth + 1, seen);
      if (url) return url;
    }
    return '';
  }

  function normalizeNextTrack(raw) {
    const item = raw?.track || raw?.item || raw?.contextTrack || raw?.data || raw;
    if (!item) return null;
    const metadata = item.metadata || {};
    const name = item.name || metadata.title || metadata.name || item.title;
    const artistItems = item.artists?.items || item.artists || item.albumOfTrack?.artists?.items || [];
    const artists = artistItems?.map?.(artist => artist?.name || artist?.profile?.name).filter(Boolean).join(', ') ||
                    metadata.artist_name ||
                    metadata.artistName ||
                    metadata.artists ||
                    item.subtitle ||
                    '';
    const image = firstImageUrl(
      item.album?.images,
      item.images,
      item.images?.items,
      item.coverArt,
      item.albumOfTrack?.coverArt,
      item.image_url,
      item.imageUrl,
      metadata.image_url,
      metadata.imageUrl,
      metadata.image_small_url,
      metadata.image_large_url,
      metadata.image_xlarge_url,
      metadata.album_image_url
    ) || deepFindImageUrl(raw) || deepFindImageUrl(item);
    const uri = item.uri || raw?.uri || metadata.uri || '';
    return name ? { name, artists, image, uri } : null;
  }

  function getCurrentTrackImage() {
    const data = Spicetify.Player?.data || Spicetify.Platform?.PlayerAPI?._state || {};
    const item = data.item || data.track || data.contextTrack || data.current || data;
    return normalizeNextTrack(item)?.image || deepFindImageUrl(data) || '';
  }

  let _lastSidebarCover = '';
  function updateSidebarCoverBackground() {
    const image = getCurrentTrackImage();
    if (image === _lastSidebarCover) return;
    _lastSidebarCover = image;
    document.body?.classList.toggle('ag-sidebar-cover-active', !!image);
    if (image) {
      document.documentElement.style.setProperty('--ag-sidebar-cover', `url("${image.replace(/"/g, '\\"')}")`);
    } else {
      document.documentElement.style.removeProperty('--ag-sidebar-cover');
    }
  }

  function applySidebarWidth() {
    const sidebar = getRightSidebarRoot();
    if (!sidebar) return;
    if (!window.__agSidebarResizeResetDone) {
      window.__agSidebarResizeResetDone = true;
      localStorage.removeItem('ag-sidebar-width');
      ['width', 'min-width', 'max-width', 'flex-basis'].forEach(prop => sidebar.style.removeProperty(prop));
      const parent = sidebar.parentElement;
      parent?.style.removeProperty('--ag-sidebar-width');
      parent?.style.removeProperty('--right-sidebar-width');
      parent?.style.removeProperty('grid-template-columns');
    }
    document.body?.classList.remove('ag-sidebar-custom-width');
    document.documentElement.style.removeProperty('--ag-sidebar-width');
    document.documentElement.style.removeProperty('--ag-sidebar-extra');
    document.getElementById('ag-sidebar-resize-hitbox')?.remove();
    sidebar.querySelectorAll(`
      .main-nowPlayingView-nowPlayingView,
      [data-testid="now-playing-view"],
      [data-testid="now-playing-view-background"],
      .main-nowPlayingView-scrollNode,
      .main-nowPlayingView-content,
      .main-nowPlayingView-section,
      [class*="nowPlayingView_nowPlayingView"],
      [class*="nowPlayingView_content"],
      [class*="nowPlayingView_scrollNode"],
      [class*="nowPlayingView_section"],
      [data-overlayscrollbars-viewport],
      .os-viewport,
      .os-content
    `).forEach(el => {
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('min-width', '0', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('transform', 'none', 'important');
    });
  }

  function getRightSidebarRoot() {
    return document.querySelector('.Root__right-sidebar') ||
           document.querySelector('aside[data-testid="right-sidebar"]') ||
           document.querySelector('[data-testid="right-sidebar"]')?.closest?.('.Root__right-sidebar, aside[data-testid="right-sidebar"]') ||
           document.querySelector('[data-testid="right-sidebar"]');
  }

  function syncSidebarOuterCollapse() {
    if (isFullscreen()) {
      document.body?.classList.remove('ag-sidebar-native-collapsed', 'ag-sidebar-force-open');
      document.getElementById('ag-sidebar-reveal-hitbox')?.remove();
      document.documentElement.style.removeProperty('--ag-sidebar-collapsed-width');
      return;
    }
    const sidebar = getRightSidebarRoot();
    const rect = sidebar?.getBoundingClientRect?.();
    if (window.__agSidebarRevealUntil && Date.now() < window.__agSidebarRevealUntil) return;
    if (document.body?.classList.contains('ag-sidebar-force-open')) {
      if (sidebar) forceOpenRightSidebar(sidebar);
      document.body?.classList.remove('ag-sidebar-native-collapsed', 'ag-sidebar-peek');
      document.getElementById('ag-sidebar-reveal-hitbox')?.remove();
      document.documentElement.style.removeProperty('--ag-sidebar-collapsed-width');
      return;
    }
    const alreadyHidden = document.body?.classList.contains('ag-sidebar-native-collapsed') &&
                          !!document.getElementById('ag-sidebar-reveal-hitbox');
    const visuallyCollapsed = !!rect && rect.width > 0 && (
      rect.width <= 140 ||
      (rect.left >= window.innerWidth - 150 && rect.right >= window.innerWidth - 4)
    );
    const collapsed = !!sidebar && (alreadyHidden || visuallyCollapsed);
    document.body?.classList.toggle('ag-sidebar-native-collapsed', collapsed);
    if (collapsed) {
      document.documentElement.style.setProperty('--ag-sidebar-collapsed-width', `${Math.ceil(rect.width)}px`);
      ensureSidebarRevealHitbox(sidebar);
    } else {
      document.documentElement.style.removeProperty('--ag-sidebar-collapsed-width');
      document.getElementById('ag-sidebar-reveal-hitbox')?.remove();
    }
  }

  function updateSidebarResizeHitbox() {
    const sidebar = getRightSidebarRoot();
    document.getElementById('ag-sidebar-resize-hitbox')?.remove();
    if (!sidebar) return;
    applySidebarWidth();
    normalizeNativeSidebarResizeGrip(sidebar);
    setupForceOpenCollapseHandler(sidebar);
    syncSidebarOuterCollapse();
  }

  function getExpandedSidebarWidth() {
    return `${Math.round(Math.min(380, Math.max(300, window.innerWidth * 0.23)))}px`;
  }

  function forceOpenRightSidebar(sidebar = getRightSidebarRoot()) {
    if (!sidebar) return;
    const savedWidth = document.documentElement.style.getPropertyValue('--ag-sidebar-expanded-width').trim();
    const width = savedWidth || getExpandedSidebarWidth();
    const rect = sidebar.getBoundingClientRect?.();
    const top = Math.round(clamp(rect?.top || 56, 48, Math.max(48, window.innerHeight - 260)));
    document.documentElement.style.setProperty('--ag-sidebar-expanded-width', width);
    document.documentElement.style.setProperty('--ag-sidebar-open-top', `${top}px`);
    document.body?.classList.add('ag-sidebar-force-open');
    sidebar.style.removeProperty('display');
    sidebar.style.removeProperty('visibility');
    sidebar.style.removeProperty('opacity');
    sidebar.style.setProperty('position', 'fixed', 'important');
    sidebar.style.setProperty('top', `${top}px`, 'important');
    sidebar.style.setProperty('right', '15px', 'important');
    sidebar.style.setProperty('bottom', '0', 'important');
    sidebar.style.setProperty('left', 'auto', 'important');
    sidebar.style.setProperty('height', `calc(100vh - ${top}px)`, 'important');
    sidebar.style.setProperty('margin', '0', 'important');
    sidebar.style.setProperty('width', width, 'important');
    sidebar.style.setProperty('min-width', width, 'important');
    sidebar.style.setProperty('max-width', width, 'important');
    sidebar.style.setProperty('flex-basis', width, 'important');
    sidebar.style.setProperty('pointer-events', 'auto', 'important');
    sidebar.style.setProperty('z-index', '2147483600', 'important');
    const parent = sidebar.parentElement;
    parent?.style.setProperty('--right-sidebar-width', width, 'important');
    parent?.style.setProperty('--ag-sidebar-width', width, 'important');
    normalizeNowPlayingPanelWidth(sidebar, width);
    normalizeRightSidebarShell(sidebar);
    ensureForceOpenSidebarResizeHitbox(sidebar);
    ensureForceOpenSidebarCollapseHitbox(sidebar);
    window.setTimeout(() => clickShowNowPlayingView(sidebar), 80);
  }

  function stabilizeForceOpenRightSidebar(sidebar = getRightSidebarRoot()) {
    window.__agSidebarRevealUntil = Date.now() + 1800;
    [0, 80, 180, 360, 720, 1200].forEach(delay => {
      window.setTimeout(() => {
        const activeSidebar = getRightSidebarRoot() || sidebar;
        if (!activeSidebar || !document.body?.classList.contains('ag-sidebar-force-open')) return;
        forceOpenRightSidebar(activeSidebar);
      }, delay);
    });
    window.setTimeout(() => {
      window.__agSidebarRevealUntil = 0;
      syncSidebarOuterCollapse();
    }, 1850);
  }

  function collapseRightSidebarOuter(sidebar = getRightSidebarRoot()) {
    if (!sidebar) return;
    const rect = sidebar.getBoundingClientRect?.();
    const collapsedWidth = rect?.width && rect.width <= 140 ? Math.ceil(rect.width) : 72;
    document.documentElement.style.setProperty('--ag-sidebar-collapsed-width', `${collapsedWidth}px`);
    document.body?.classList.remove('ag-sidebar-force-open', 'ag-sidebar-peek');
    delete sidebar.dataset.agManualReveal;
    ['display', 'visibility', 'opacity', 'pointer-events', 'position', 'top', 'right', 'bottom', 'left', 'height', 'margin', 'width', 'min-width', 'max-width', 'flex-basis', 'z-index'].forEach(prop => {
      sidebar.style.removeProperty(prop);
    });
    const parent = sidebar.parentElement;
    parent?.style.removeProperty('--right-sidebar-width');
    parent?.style.removeProperty('--ag-sidebar-width');
    document.getElementById('ag-sidebar-resize-hitbox')?.remove();
    document.getElementById('ag-sidebar-collapse-hitbox')?.remove();
    document.documentElement.style.removeProperty('--ag-sidebar-open-top');
    ensureSidebarRevealHitbox(sidebar);
    document.body?.classList.add('ag-sidebar-native-collapsed');
  }

  function isForceOpenCollapseControl(button, sidebar) {
    if (!button || !sidebar) return false;
    const label = `${button.getAttribute('aria-label') || ''} ${button.title || ''}`.toLowerCase();
    if (label.includes('fullscreen') ||
        label.includes('full screen') ||
        label.includes('vollbild') ||
        label.includes('cinema') ||
        label.includes('theater') ||
        label.includes('pip')) return false;
    if ((label.includes('hide') || label.includes('collapse') || label.includes('close') || label.includes('ausblenden') || label.includes('einklappen') || label.includes('schliessen') || label.includes('schließen')) &&
        (label.includes('now playing') || label.includes('wiedergabe') || label.includes('right sidebar'))) return true;
    const rect = button.getBoundingClientRect?.();
    const sideRect = sidebar.getBoundingClientRect?.();
    if (!rect?.width || !rect?.height || !sideRect?.width || !sideRect?.height) return false;
    const glyph = (button.textContent || '').trim();
    const nearLeftEdge = rect.left <= sideRect.left + 72;
    const inMiddle = rect.top >= sideRect.top + 96 && rect.bottom <= sideRect.bottom - 96;
    return nearLeftEdge && inMiddle && ['<', '>', '\u2039', '\u203a'].includes(glyph);
  }

  function setupForceOpenCollapseHandler(sidebar) {
    if (!sidebar || sidebar.dataset.agForceOpenCollapseHooked === 'true') return;
    sidebar.dataset.agForceOpenCollapseHooked = 'true';
    sidebar.addEventListener('click', event => {
      if (!document.body?.classList.contains('ag-sidebar-force-open')) return;
      const button = event.target?.closest?.('button, [role="button"]');
      if (!button || !sidebar.contains(button)) return;
      if (!isForceOpenCollapseControl(button, sidebar)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      collapseRightSidebarOuter(sidebar);
    }, true);
  }

  function ensureForceOpenSidebarCollapseHitbox(sidebar) {
    let hitbox = document.getElementById('ag-sidebar-collapse-hitbox');
    if (!hitbox) {
      hitbox = document.createElement('button');
      hitbox.id = 'ag-sidebar-collapse-hitbox';
      hitbox.type = 'button';
      hitbox.setAttribute('aria-label', 'Hide right sidebar');
      hitbox.addEventListener('click', event => {
        if (!document.body?.classList.contains('ag-sidebar-force-open')) return;
        const activeSidebar = getRightSidebarRoot();
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        collapseRightSidebarOuter(activeSidebar || sidebar);
      }, true);
      document.body.appendChild(hitbox);
    }
    positionForceOpenSidebarCollapseHitbox(sidebar);
  }

  function positionForceOpenSidebarCollapseHitbox(sidebar) {
    const hitbox = document.getElementById('ag-sidebar-collapse-hitbox');
    const rect = sidebar?.getBoundingClientRect?.();
    if (!hitbox || !rect?.width || !rect?.height) return;
    hitbox.style.setProperty('left', `${Math.round(rect.left)}px`, 'important');
    hitbox.style.setProperty('top', `${Math.round(rect.top + Math.max(110, rect.height * 0.38))}px`, 'important');
    hitbox.style.setProperty('height', `${Math.round(Math.min(240, Math.max(150, rect.height * 0.24)))}px`, 'important');
  }

  function normalizeRightSidebarShell(sidebar) {
    const shell = sidebar?.firstElementChild;
    if (!shell || shell.matches?.('button, [role="button"]')) return;
    shell.style.setProperty('display', 'flex', 'important');
    shell.style.setProperty('flex-direction', 'column', 'important');
    shell.style.setProperty('flex', '1 1 auto', 'important');
    shell.style.setProperty('height', '100%', 'important');
    shell.style.setProperty('min-height', '0', 'important');
    shell.style.setProperty('width', '100%', 'important');
    shell.style.setProperty('min-width', '0', 'important');
    shell.style.setProperty('max-width', 'none', 'important');
    shell.style.setProperty('opacity', '1', 'important');
    shell.style.setProperty('visibility', 'visible', 'important');
    shell.style.setProperty('pointer-events', 'auto', 'important');
  }

  function normalizeNowPlayingPanelWidth(sidebar, width) {
    if (!sidebar) return;
    const panel = sidebar.querySelector('aside[aria-label="Now playing view"], aside[aria-label="Aktuelle Wiedergabe"], aside[aria-label*="playing" i], aside[aria-label*="wiedergabe" i]');
    if (!panel) return;
    panel.style.setProperty('width', width, 'important');
    panel.style.setProperty('min-width', '0', 'important');
    panel.style.setProperty('max-width', 'none', 'important');
    panel.style.setProperty('pointer-events', 'auto', 'important');
    const content = panel.querySelector('.main-nowPlayingView-headerContainer')?.parentElement ||
                    panel.querySelector('.main-nowPlayingView-mainWrapper')?.parentElement;
    if (!content) return;
    content.style.setProperty('width', '100%', 'important');
    content.style.setProperty('min-width', '0', 'important');
    content.style.setProperty('max-width', 'none', 'important');
  }

  function clickShowNowPlayingView(sidebar = getRightSidebarRoot()) {
    if (!sidebar || isFullscreen()) return false;
    if (window.__agShowNowPlayingLastClick && Date.now() - window.__agShowNowPlayingLastClick < 450) return false;
    const button = Array.from(sidebar.querySelectorAll('button[aria-label]'))
      .find(candidate => candidate.getAttribute('aria-label') === 'Show Now Playing view');
    const rect = button?.getBoundingClientRect?.();
    if (!button || !rect?.width || !rect?.height) return false;
    const sideRect = sidebar.getBoundingClientRect?.();
    if (sideRect && (rect.left < sideRect.left - 12 || rect.right > sideRect.right + 12)) return false;
    window.__agShowNowPlayingLastClick = Date.now();
    button.dataset.agShowNowPlayingClicked = 'true';
    button.click?.();
    window.setTimeout(() => {
      delete button.dataset.agShowNowPlayingClicked;
    }, 800);
    return true;
  }

  function setForceOpenSidebarWidth(px, sidebar = getRightSidebarRoot()) {
    const width = `${Math.round(clamp(px, 280, Math.min(520, window.innerWidth - 120)))}px`;
    document.documentElement.style.setProperty('--ag-sidebar-expanded-width', width);
    if (!sidebar) return;
    sidebar.style.setProperty('width', width, 'important');
    sidebar.style.setProperty('min-width', width, 'important');
    sidebar.style.setProperty('max-width', width, 'important');
    sidebar.style.setProperty('flex-basis', width, 'important');
    const parent = sidebar.parentElement;
    parent?.style.setProperty('--right-sidebar-width', width, 'important');
    parent?.style.setProperty('--ag-sidebar-width', width, 'important');
    normalizeNowPlayingPanelWidth(sidebar, width);
    normalizeRightSidebarShell(sidebar);
    positionForceOpenSidebarCollapseHitbox(sidebar);
  }

  function ensureForceOpenSidebarResizeHitbox(sidebar) {
    let hitbox = document.getElementById('ag-sidebar-resize-hitbox');
    if (!hitbox) {
      hitbox = document.createElement('div');
      hitbox.id = 'ag-sidebar-resize-hitbox';
      hitbox.addEventListener('pointerdown', event => {
        const activeSidebar = getRightSidebarRoot();
        if (!document.body?.classList.contains('ag-sidebar-force-open') || !activeSidebar) return;
        event.preventDefault();
        event.stopPropagation();
        document.body?.classList.add('ag-sidebar-resizing');
        hitbox.setPointerCapture?.(event.pointerId);
        const move = moveEvent => {
          setForceOpenSidebarWidth(window.innerWidth - moveEvent.clientX, activeSidebar);
          const rect = activeSidebar.getBoundingClientRect?.();
          if (rect) hitbox.style.setProperty('left', `${Math.round(rect.left - 8)}px`, 'important');
        };
        const stop = () => {
          document.body?.classList.remove('ag-sidebar-resizing');
          window.removeEventListener('pointermove', move, true);
          window.removeEventListener('pointerup', stop, true);
          window.removeEventListener('pointercancel', stop, true);
        };
        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerup', stop, true);
        window.addEventListener('pointercancel', stop, true);
      }, true);
      document.body.appendChild(hitbox);
    }
    const rect = sidebar?.getBoundingClientRect?.();
    if (!rect) return;
    hitbox.style.setProperty('left', `${Math.round(rect.left - 8)}px`, 'important');
    hitbox.style.setProperty('top', `${Math.round(rect.top)}px`, 'important');
    hitbox.style.setProperty('height', `${Math.round(rect.height)}px`, 'important');
  }

  function revealRightSidebar() {
    const sidebar = getRightSidebarRoot();
    window.__agSidebarRevealUntil = Date.now() + 1800;
    document.body?.classList.remove('ag-sidebar-peek', 'ag-sidebar-native-collapsed');
    document.getElementById('ag-sidebar-reveal-hitbox')?.remove();
    document.documentElement.style.removeProperty('--ag-sidebar-collapsed-width');
    if (sidebar) {
      delete sidebar.dataset.agManualReveal;
      sidebar.style.removeProperty('display');
      sidebar.style.removeProperty('visibility');
      sidebar.style.removeProperty('opacity');
      forceOpenRightSidebar(sidebar);
      stabilizeForceOpenRightSidebar(sidebar);
    }
  }

  function ensureSidebarRevealHitbox(sidebar) {
    let hitbox = document.getElementById('ag-sidebar-reveal-hitbox');
    if (!hitbox) {
      hitbox = document.createElement('button');
      hitbox.id = 'ag-sidebar-reveal-hitbox';
      hitbox.type = 'button';
      hitbox.setAttribute('aria-label', 'Show right sidebar');
      hitbox.addEventListener('pointerenter', () => {
        document.body?.classList.add('ag-sidebar-peek');
        sidebar.dataset.agManualReveal = 'true';
      });
      hitbox.addEventListener('pointerleave', () => {
        if (window.__agSidebarRevealUntil && Date.now() < window.__agSidebarRevealUntil) return;
        document.body?.classList.remove('ag-sidebar-peek');
        delete sidebar.dataset.agManualReveal;
      });
      hitbox.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        revealRightSidebar();
      }, true);
      document.body.appendChild(hitbox);
    }
    const rect = sidebar?.getBoundingClientRect?.();
    const top = Math.max(64, Math.round(rect?.top || 64));
    const bottomGap = Math.max(92, Math.round(window.innerHeight - (rect?.bottom || window.innerHeight - 92)));
    hitbox.style.setProperty('--ag-sidebar-hitbox-top', `${top}px`);
    hitbox.style.setProperty('--ag-sidebar-hitbox-bottom', `${bottomGap}px`);
  }

  function normalizeNativeSidebarResizeGrip(sidebar = getRightSidebarRoot()) {
    if (!sidebar) return;
    const sideRect = sidebar.getBoundingClientRect();
    if (!sideRect.width || !sideRect.height) return;
    sidebar.querySelectorAll('.LayoutResizer__resize-bar, [class*="LayoutResizer"][class*="resize-bar"]').forEach(el => {
      el.classList.add('ag-native-sidebar-resize-grip');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('left', '-10px', 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('top', '0', 'important');
      el.style.setProperty('bottom', '0', 'important');
      el.style.setProperty('width', '20px', 'important');
      el.style.setProperty('min-width', '20px', 'important');
      el.style.setProperty('max-width', '20px', 'important');
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('border', '0', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('cursor', 'ew-resize', 'important');
      el.style.setProperty('pointer-events', 'auto', 'important');
    });
    Array.from(document.querySelectorAll('div, button, [role="separator"]')).forEach(el => {
      if (el.id === 'ag-sidebar-resize-hitbox' || el.closest('.Root__main-view, #ag-settings-panel, .Root__now-playing-bar')) return;
      const rect = el.getBoundingClientRect?.();
      if (!rect || rect.height < 120 || rect.width > 16 || rect.width < 1) return;
      const nearRightInside = Math.abs(rect.right - sideRect.right) < 8 || Math.abs(rect.left - sideRect.right) < 8;
      const nearSidebarHeight = rect.top >= sideRect.top - 24 && rect.bottom <= sideRect.bottom + 24;
      if (!nearRightInside || !nearSidebarHeight) return;
      el.classList.add('ag-native-sidebar-resize-grip');
      el.style.setProperty('position', 'fixed', 'important');
      el.style.setProperty('left', `${Math.round(sideRect.left - 10)}px`, 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('top', `${Math.round(sideRect.top)}px`, 'important');
      el.style.setProperty('width', '20px', 'important');
      el.style.setProperty('height', `${Math.round(sideRect.height)}px`, 'important');
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('border', '0', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('cursor', 'ew-resize', 'important');
      el.style.setProperty('z-index', '2147483645', 'important');
      el.style.setProperty('pointer-events', 'auto', 'important');
    });
  }

  window.addEventListener('pointerup', () => document.body?.classList.remove('ag-sidebar-resizing'), true);
  window.addEventListener('blur', () => document.body?.classList.remove('ag-sidebar-resizing'), true);

  async function hydrateNextTrackImage(track) {
    if (!track || track.image || !track.uri?.startsWith?.('spotify:track:')) return track;
    const id = track.uri.split(':').pop();
    try {
      const data = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${id}`);
      return {
        ...track,
        image: firstImageUrl(data?.album?.images),
        artists: track.artists || (data?.artists || []).map(artist => artist.name).join(', ')
      };
    } catch {
      try {
        const data = await Spicetify.CosmosAsync.get(`sp://metadata/4/track/${id}`);
        return {
          ...track,
          image: firstImageUrl(
            data?.album?.cover_group?.image?.map?.(image => image.file_id ? `spotify:image:${image.file_id}` : ''),
            data?.album?.cover?.map?.(image => image.file_id ? `spotify:image:${image.file_id}` : '')
          ),
          artists: track.artists || (data?.artist || []).map(artist => artist.name).join(', ')
        };
      } catch {
        return track;
      }
    }
  }

  async function getNextTrackInfo() {
    const directSources = [
      Spicetify.Queue?.nextTracks?.[0],
      Spicetify.Queue?.queue?.nextTracks?.[0],
      Spicetify.Queue?.queue?.next_tracks?.[0],
      Spicetify.Player?.data?.nextItems?.[0],
      Spicetify.Player?.data?.queue?.nextTracks?.[0],
      Spicetify.Player?.data?.queue?.next_tracks?.[0],
      Spicetify.Platform?.PlayerAPI?._state?.nextTracks?.[0],
      Spicetify.Platform?.PlayerAPI?._state?.queue?.nextTracks?.[0]
    ];
    for (const source of directSources) {
      const normalized = normalizeNextTrack(source);
      if (normalized) return hydrateNextTrackImage(normalized);
    }

    try {
      const data = await Spicetify.CosmosAsync.get('sp://player/v2/main');
      const candidates = [
        data?.queue?.next_tracks?.[0],
        data?.queue?.nextTracks?.[0],
        data?.next_tracks?.[0],
        data?.nextTracks?.[0]
      ];
      for (const source of candidates) {
        const normalized = normalizeNextTrack(source);
        if (normalized) return hydrateNextTrackImage(normalized);
      }
    } catch {}
    return null;
  }

  let _upNextLastUri = '';
  let _upNextLastImage = '';
  let _upNextLastFetch = 0;
  let _upNextCached = null;
  async function updateUpNextCard() {
    const card = document.getElementById('ag-up-next-card');
    if (!card) return;
    positionUpNextCard();

    const duration = getPlayerDurationMs();
    const position = getPlayerPositionMs();
    const remaining = duration - position;
    const shouldShow = duration > 0 && remaining > 0 && remaining <= 20000 && !isModalOpen() && !isFullscreen();
    if (!shouldShow) {
      card.classList.remove('ag-up-next-visible');
      return;
    }

    if (!_upNextCached || Date.now() - _upNextLastFetch > 5000) {
      _upNextLastFetch = Date.now();
      _upNextCached = await getNextTrackInfo();
    }
    const next = _upNextCached;
    if (!next) {
      card.classList.remove('ag-up-next-visible');
      return;
    }

    const image = next.image || '';
    if (_upNextLastUri !== next.uri || _upNextLastImage !== image) {
      _upNextLastUri = next.uri;
      _upNextLastImage = image;
      card.querySelector('.ag-up-next-title').textContent = next.name;
      card.querySelector('.ag-up-next-subtitle').textContent = next.artists || 'Next track';
      card.dataset.uri = next.uri || '';
      const art = card.querySelector('.ag-up-next-art');
      art.style.backgroundImage = image ? `url("${image.replace(/"/g, '\\"')}")` : '';
      art.classList.toggle('ag-up-next-art-empty', !image);
    }
    card.classList.add('ag-up-next-visible');
  }

  function setupSearchPlaceholderRotation(input) {
    if (!input || input.dataset.agPlaceholderRotation === 'true') return;
    input.dataset.agPlaceholderRotation = 'true';
    let labels = getCachedPersonalSearchPlaceholders();
    if (!labels.length) labels = ['Search...'];
    let index = 0;
    const apply = () => {
      if (document.activeElement === input && input.value.trim()) return;
      input.placeholder = labels[index % labels.length];
      index += 1;
    };
    apply();
    window.setInterval(apply, 1800);
    const load = () => loadPersonalSearchPlaceholders().then(personalLabels => {
      if (personalLabels.length) {
        labels = personalLabels;
        index = 0;
        apply();
      }
    }).catch(() => {});
    load();
    let retryCount = 0;
    const retry = window.setInterval(() => {
      retryCount += 1;
      if ((labels.length > 1 && labels[0] !== 'Search...') || retryCount > 2) {
        window.clearInterval(retry);
        return;
      }
      load();
    }, 5000);
  }

  function getCachedPersonalSearchPlaceholders() {
    try {
      const cached = JSON.parse(localStorage.getItem('ag-personal-search-placeholders') || '[]');
      return Array.isArray(cached) ? cached.filter(Boolean).slice(0, 18) : [];
    } catch {
      return [];
    }
  }

  function rememberPersonalSearchPlaceholders(labels) {
    try {
      localStorage.setItem('ag-personal-search-placeholders', JSON.stringify(labels.slice(0, 18)));
      localStorage.setItem('ag-personal-search-placeholders-ts', String(Date.now()));
    } catch {}
  }

  function shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function loadPersonalSearchPlaceholders() {
    const cached = getCachedPersonalSearchPlaceholders();
    const cachedAt = Number(localStorage.getItem('ag-personal-search-placeholders-ts') || 0);
    const freshEnough = cached.length && cachedAt && Date.now() - cachedAt < 6 * 60 * 60 * 1000;
    if (freshEnough || window.__agPersonalSearchLoadInFlight) return cached;
    window.__agPersonalSearchLoadInFlight = true;
    const seen = new Set();
    const groups = { artists: [], tracks: [], albums: [], playlists: [] };
    const push = (group, name) => {
      const clean = String(name || '').trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      groups[group]?.push(`${clean}...`);
    };

    try {
      const [artists, tracks] = await Promise.all([
        Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=3'),
        Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=6')
      ]);

      (artists?.items || []).slice(0, 3).forEach(item => push('artists', item.name));
      (tracks?.items || []).slice(0, 3).forEach(item => push('tracks', item.name));
      (tracks?.items || [])
        .map(item => item?.album?.name)
        .filter(Boolean)
        .slice(0, 3)
        .forEach(name => push('albums', name));
    } catch {}

    try {
      const recent = await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/me/player/recently-played?limit=12');
      (recent?.items || []).slice(0, 6).forEach(entry => {
        const track = entry?.track;
        push('tracks', track?.name);
        push('artists', track?.artists?.[0]?.name);
        push('albums', track?.album?.name);
      });
    } catch {}

    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 300 });
      const items = lib?.items || [];
      items.filter(item => item?.uri?.includes(':artist:')).slice(0, 3).forEach(item => push('artists', item.name));
      items.filter(item => item?.uri?.includes(':album:')).slice(0, 3).forEach(item => push('albums', item.name));
      items.filter(item => item?.uri?.includes(':playlist:')).slice(0, 3).forEach(item => push('playlists', item.name));
    } catch {}

    collectVisibleSearchPlaceholders().forEach(item => push(item.group, item.name));

    const mixed = [];
    const shuffledGroups = shuffleArray(Object.values(groups).map(group => shuffleArray(group)));
    for (let round = 0; round < 3; round += 1) {
      shuffledGroups.forEach(group => {
        if (group[round]) mixed.push(group[round]);
      });
    }
    const labels = mixed.length ? shuffleArray(mixed).slice(0, 12) : getCachedPersonalSearchPlaceholders();
    if (labels.length) rememberPersonalSearchPlaceholders(labels);
    window.__agPersonalSearchLoadInFlight = false;
    return labels.length ? labels : cached;
  }

  function collectVisibleSearchPlaceholders() {
    const items = [];
    const add = (group, name) => {
      const clean = String(name || '').trim();
      if (!clean || clean.length < 2 || clean.length > 48) return;
      if (/^(music|podcasts|show all|search|ambientglass|date added)$/i.test(clean)) return;
      items.push({ group, name: clean });
    };
    document.querySelectorAll('.view-homeShortcutsGrid-shortcut, [data-testid="home-card"], [data-testid="card-click-handler"]').forEach(card => {
      const text = (card.textContent || '').split('\n').map(x => x.trim()).filter(Boolean)[0];
      add('playlists', text);
    });
    document.querySelectorAll('[data-testid="tracklist-row"], .main-trackList-trackListRow').forEach(row => {
      const lines = (row.textContent || '').split('\n').map(x => x.trim()).filter(Boolean);
      add('tracks', lines.find(line => !/^\d+$/.test(line)));
      if (lines[1]) add('artists', lines[1].replace(/^E\s+/, ''));
    });
    return items.slice(0, 12);
  }

  // Library panel.
  let _allLibraryItems = []; let _currentType = ''; let _filterText = ''; let _sortOrder = 'recent';
  function createLibraryPanel() {
    if (document.getElementById('ag-lib-panel')) return;
    const backdrop = document.createElement('div'); backdrop.id = 'ag-lib-panel-backdrop';
    backdrop.addEventListener('click', closeLibraryPanel);
    const panel = document.createElement('div'); panel.id = 'ag-lib-panel';
    panel.innerHTML = `<div id="ag-lib-panel-header"><div class="ag-lib-header-row"><h2 id="ag-lib-panel-title">Library</h2><button id="ag-lib-panel-close">${svg(ICONS.close)}</button></div><div class="ag-lib-controls"><div class="ag-lib-search">${svg(ICONS.search, { size: 16 })}<input id="ag-lib-search-input" placeholder="Filter..."/></div><select id="ag-lib-sort"><option value="recent">Most Recent</option><option value="az">Name (A-Z)</option></select></div></div><div id="ag-lib-panel-grid"></div>`;
    panel.querySelector('#ag-lib-panel-close').addEventListener('click', closeLibraryPanel);
    panel.querySelector('#ag-lib-search-input').addEventListener('input', e => { _filterText = e.target.value.toLowerCase(); renderLibraryGrid(); });
    panel.querySelector('#ag-lib-sort').addEventListener('change', e => { _sortOrder = e.target.value; renderLibraryGrid(); });
    document.body.appendChild(backdrop); document.body.appendChild(panel);
  }
  function closeLibraryPanel() { document.getElementById('ag-lib-panel')?.classList.remove('ag-panel-visible'); document.getElementById('ag-lib-panel-backdrop')?.classList.remove('ag-panel-visible'); }
  async function openLibraryPanel(type) {
    _currentType = type; _filterText = ''; _sortOrder = 'recent';
    const p = document.getElementById('ag-lib-panel'); const b = document.getElementById('ag-lib-panel-backdrop');
    const g = document.getElementById('ag-lib-panel-grid'); const title = document.getElementById('ag-lib-panel-title');
    if (!p || !g) return;
    title.textContent = type.toUpperCase();
    p.classList.add('ag-panel-visible'); b.classList.add('ag-panel-visible');
    g.innerHTML = '<div class="ag-lib-empty">Loading...</div>';
    const res = await Spicetify.Platform.LibraryAPI.getContents({ limit: 400 });
    const raw = res.items || [];
    if (type === 'albums') _allLibraryItems = raw.filter(i => i.uri.includes(':album:'));
    else if (type === 'playlists') _allLibraryItems = raw.filter(i => i.uri.includes(':playlist:'));
    else if (type === 'artists') _allLibraryItems = raw.filter(i => i.uri.includes(':artist:'));
    renderLibraryGrid();
  }
  function renderLibraryGrid() {
    const grid = document.getElementById('ag-lib-panel-grid'); if (!grid) return;
    let items = [..._allLibraryItems];
    if (_filterText) items = items.filter(i => i.name?.toLowerCase().includes(_filterText));
    if (_sortOrder === 'az') items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    grid.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'ag-lib-empty';
      empty.textContent = `No ${_currentType} found`;
      grid.appendChild(empty);
      return;
    }
    items.forEach(item => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ag-lib-item';
      card.addEventListener('click', () => {
        safeNavigate(item.uri);
        closeLibraryPanel();
      });

      const cover = document.createElement('div');
      cover.className = 'ag-lib-item-cover';
      const imageUrl = item.images?.[0]?.url || item.image?.url || '';
      if (imageUrl) cover.style.backgroundImage = `url("${imageUrl.replace(/"/g, '\\"')}")`;

      const name = document.createElement('div');
      name.className = 'ag-lib-item-name';
      name.textContent = item.name || 'Untitled';

      card.append(cover, name);
      grid.appendChild(card);
    });
  }

  let _lastScrollY = 0;
  function handleScroll(e) {
    const target = e.target;
    if (!target || !target.closest) return;
    // React only to main-view scrolling and ignore sidebars or menus.
    if (target.closest('.Root__right-sidebar') ||
        target.closest('.Root__nav-bar') ||
        target.closest('.main-contextMenu-menu') ||
        target.closest('#ag-lib-panel') ||
        target.closest('#ag-settings-panel') ||
        target.closest('.main-buddyFeed-buddyFeed')) return;
    if (!target.closest('.Root__main-view')) return;
    const y = Number.isFinite(target.scrollTop) ? Math.max(0, target.scrollTop) : getMainScrollY();
    _lastScrollY = y;
    queueVisibilityUpdate();
  }

  function triggerStartupAnimation() {
    if (document.getElementById('ag-startup-splash')) return;
    if (sessionStorage.getItem('ag-skip-startup-once') === 'marketplace-tab') {
      sessionStorage.removeItem('ag-skip-startup-once');
      triggerEntrance();
      return;
    }
    const s = document.createElement('div'); s.id = 'ag-startup-splash';
    const l = `<svg viewBox="0 0 24 24" width="80" height="80" fill="#1DB954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305c-.218.358-.684.474-1.042.256-2.848-1.74-6.433-2.133-10.655-1.17-.41.094-.813-.164-.906-.574-.094-.41.163-.813.573-.906 4.622-1.057 8.583-.605 11.774 1.345.358.218.474.685.256 1.043zm1.468-3.26c-.275.446-.86.59-1.306.314-3.258-2-8.226-2.583-12.08-1.413-.502.152-1.03-.134-1.182-.636-.152-.503.134-1.03.636-1.182 4.4-1.335 9.876-.683 13.618 1.618.447.275.59.86.314 1.306zm.128-3.41c-3.905-2.32-10.334-2.533-14.075-1.398-.6.182-1.24-.163-1.422-.763-.182-.6.163-1.24.763-1.422 4.29-1.302 11.393-1.04 15.894 1.63.54.32.715 1.014.395 1.554-.32.54-1.014.715-1.555.395z"/></svg>`;
    s.innerHTML = `
      <style>
        #ag-startup-splash { position: fixed; inset: 0; background: #040408 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; transition: opacity 1s; }
        #ag-startup-splash.fade-out { opacity: 0; pointer-events: none; }
        .ag-splash-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(123,95,219,0.4) 0%, rgba(79,142,235,0.1) 40%, transparent 70%); filter: blur(60px); animation: ag-glow-cinematic 8s infinite alternate ease-in-out; pointer-events: none; }
        .ag-splash-content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .ag-splash-title { color: #fff; font-size: 24px; font-weight: 200; letter-spacing: 8px; text-transform: uppercase; opacity: 0.8; margin-top: 10px; background: linear-gradient(to right, #fff, #b4a0ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ag-splash-footer { position: absolute; bottom: 40px; color: rgba(255,255,255,0.25); font-size: 10px; letter-spacing: 4px; text-transform: uppercase; }
        @keyframes ag-glow-cinematic { 0% { transform: scale(0.8) translate(-40px, -20px); opacity: 0.3; } 50% { transform: scale(1.1) translate(40px, 40px); opacity: 0.6; } 100% { transform: scale(0.9) translate(-20px, 60px); opacity: 0.2; } }
      </style>
      <div class="ag-splash-glow"></div>
      <div class="ag-splash-content">
        ${l}
        <div class="ag-splash-title">AmbientGlass</div>
      </div>
      <div class="ag-splash-footer">made by EROX</div>
      <div style="position: absolute; bottom: 20px; left: 20px; color: #fff; font-size: 10px; letter-spacing: 1px; font-family: monospace;">V16.5</div>
    `;
    document.body.appendChild(s);
    
    setTimeout(() => s.classList.add('fade-out'), 2500);
    setTimeout(() => { s.remove(); triggerEntrance(); }, 3000);
  }

  function triggerEntrance() {
    const c = document.getElementById('ag-home-cluster'); const s = document.getElementById('ag-centered-search');
    if (c) c.classList.add('ag-entrance-home');
    setTimeout(() => { if (s) s.classList.add('ag-entrance-search'); }, 150);
    setTimeout(() => { 
      if (c) { c.classList.remove('ag-entrance-home'); c.style.visibility = 'visible'; }
      if (s) { s.classList.remove('ag-entrance-search'); s.style.visibility = 'visible'; }
    }, 1200);
  }

  const _artistImageCache = new Map();

  async function healArtistImage() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes('/artist/')) return;

    const artistId = path.split('/').pop();
    const artistUri = `spotify:artist:${artistId}`;
    const header = document.querySelector('.main-entityHeader-headerText');
    
    // Avoid duplicate repair: heal only when no image exists yet.
    const existingImg = document.querySelector('.main-entityHeader-imageContainer:not(.ag-healed-image)');
    if (!header || existingImg || document.querySelector('.ag-healed-image')) return;

    if (_artistImageCache.has(artistId)) {
      injectHealedImage(header, _artistImageCache.get(artistId));
      return;
    }

    try {
      // 2. In der Library nachschauen (da sind die "echten" Bilder)
      const library = await Spicetify.Platform.LibraryAPI.getContents({ limit: 500 });
      const savedArtist = library.items?.find(i => i.uri === artistUri);
      
      let imgUrl = savedArtist?.images?.[0]?.url || savedArtist?.image?.url;

      // 3. Falls nicht in Library, Cosmos fragen aber Avatar PRIORISIEREN
      if (!imgUrl) {
        const data = await Spicetify.CosmosAsync.get(`hm://artist/v1/artist/${artistId}/desktop`);
        imgUrl = data.visuals?.avatar?.sources?.[0]?.url || data.header_image?.url;
      }
      
      if (imgUrl) {
        _artistImageCache.set(artistId, imgUrl);
        injectHealedImage(header, imgUrl);
      }
    } catch (e) {
      // Letzter Fallback
      const banner = document.querySelector('[class*="jX9OuHoZE8EC2SYi"]');
      if (banner) {
        const match = (banner.getAttribute('style') || '').match(/url\("?(.+?)"?\)/);
        if (match) {
          _artistImageCache.set(artistId, match[1]);
          injectHealedImage(header, match[1]);
        }
      }
    }
  }

  function injectHealedImage(header, imgUrl) {
    if (document.querySelector('.ag-healed-image')) return;
    const container = header.closest('.main-entityHeader-container') || header.parentElement;
    const newDiv = document.createElement('div');
    newDiv.className = 'main-entityHeader-imageContainer ag-healed-image';
    newDiv.style.cssText = 'margin-right: 32px; flex-shrink: 0; z-index: 10; display: flex; align-items: center; background: none !important;';
    newDiv.innerHTML = `
      <div class="main-entityHeader-image" style="background:none!important; border-radius: 12px; overflow: hidden; width: 232px; height: 232px; box-shadow: 0 12px 48px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);">
        <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `;
    if (container.classList.contains('main-entityHeader-container')) {
      const content = container.querySelector('.main-entityHeader-contentWrapper');
      if (content) content.insertBefore(newDiv, content.firstChild);
      else container.insertBefore(newDiv, container.firstChild);
    } else {
      header.parentElement.insertBefore(newDiv, header);
    }
  }

  function enforceProfileHitboxLegacyUnused() {
    const isBlocking = document.getElementById('ag-startup-splash') || document.getElementById('ag-settings-panel');
    ['ag-profile-hitbox', 'ag-market-hitbox', 'ag-stats-hitbox'].forEach(id => {
      const h = document.getElementById(id);
      if (h) h.style.opacity = isBlocking ? '0' : '1';
    });
    if (isBlocking) return;

    const profileBox = document.querySelector('.main-userWidget-box');
    if (!profileBox) return;

    const realBtn = profileBox.closest('button') || profileBox.closest('a') || profileBox;

    {
      let style = document.getElementById('ag-hitbox-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'ag-hitbox-style';
        document.head.appendChild(style);
      }
      style.textContent = `
        #ag-side-dock {
          display: contents !important;
        }
        .ag-fixed-hitbox {
          position: fixed !important;
          z-index: 1;
          width: 44px !important;
          height: 44px !important;
          min-width: 44px !important;
          min-height: 44px !important;
          max-width: 44px !important;
          max-height: 44px !important;
          margin: 0 !important;
          transform: none !important;
          cursor: pointer;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .ag-fixed-hitbox:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 0 20px rgba(123, 95, 219, 0.3);
        }
        #ag-profile-hitbox { order: 0; }
        #ag-market-hitbox { order: 1; }
        #ag-stats-hitbox { order: 2; }
        .ag-fixed-hitbox svg { width: 20px; height: 20px; color: #fff; opacity: 0.8; }
        .ag-profile-avatar-hitbox {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
          opacity: 0.01 !important;
        }
        .ag-profile-avatar-hitbox::before {
          content: none !important;
        }
        .main-contextMenu-tippy,
        [data-tippy-root]:has(.main-contextMenu-menu),
        body:has(.main-contextMenu-menu) .main-contextMenu-menu {
          z-index: 100000 !important;
        }
        body:has(.main-contextMenu-menu) .ag-fixed-hitbox {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
    }

    let dock = document.getElementById('ag-side-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'ag-side-dock';
      document.body.appendChild(dock);
    }

    let hitbox = document.getElementById('ag-profile-hitbox');
    if (!hitbox) {
      hitbox = document.createElement('div');
      hitbox.id = 'ag-profile-hitbox';
      hitbox.className = 'ag-fixed-hitbox ag-profile-avatar-hitbox';
      hitbox.addEventListener('click', e => {
        e.stopPropagation();
        const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: e.clientX, clientY: e.clientY });
        realBtn.dispatchEvent(evt);
      });
      document.body.appendChild(hitbox);
      if (!window.__agHitboxNotified) {
        setTimeout(() => Spicetify.showNotification("AmbientGlass: Hitbox OK"), 1000);
        window.__agHitboxNotified = true;
      }
    } else if (hitbox.parentElement !== document.body) {
      document.body.appendChild(hitbox);
    }

    const rect = getAvatarAnchorRect(profileBox);
    if (rect.width > 0 && rect.height > 0) {
      const size = 44;
      hitbox.style.width = size + 'px';
      hitbox.style.height = size + 'px';
      const layout = getLayout();
      const dx = layout.dock.x - DEFAULT_LAYOUT.dock.x;
      const dy = layout.dock.y - DEFAULT_LAYOUT.dock.y;
      hitbox.style.left = (rect.left + (rect.width / 2) - (size / 2) + dx) + 'px';
      hitbox.style.top = (rect.top + (rect.height / 2) - (size / 2) + dy) + 'px';
      // Keep Marketplace and Stats hitboxes in sync.
      enforceExtensionHitboxes(rect, size, layout);
    }
  }

  function getAvatarAnchorRect(profileBox) {
    const candidates = Array.from(document.querySelectorAll('button img, .main-userWidget-box img, [style*="url("]'))
      .map(el => ({ el, rect: el.getBoundingClientRect() }))
      .filter(x => x.rect.width >= 20 &&
                   x.rect.width <= 64 &&
                   x.rect.height >= 20 &&
                   x.rect.height <= 64 &&
                   x.rect.left < 120 &&
                   x.rect.top > 60 &&
                   x.rect.top < 260 &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'));
    if (candidates.length) return candidates.sort((a, b) => b.rect.top - a.rect.top)[0].rect;
    return profileBox.getBoundingClientRect();
  }

  function enforceExtensionHitboxes(anchorRect, size, layout = getLayout()) {
    const marketBtn = document.getElementById('marketplace-extension-button') || 
                      document.querySelector('button[aria-label*="Marketplace"]') || 
                      document.querySelector('button[title*="Marketplace"]');
    const statsBtn = document.getElementById('stats-extension-button') || 
                     document.querySelector('.stats-button') ||
                     document.querySelector('button[aria-label*="Stat"]') || 
                     document.querySelector('button[title*="Stat"]');

    const createOrUpdate = (id, iconSvg, originalBtn, offsetIndex) => {
      if (!originalBtn) return;
      
      // Hide the native button; the floating hitbox forwards clicks.
      originalBtn.style.setProperty('opacity', '0', 'important');
      originalBtn.style.setProperty('pointer-events', 'none', 'important');
      originalBtn.style.setProperty('visibility', 'hidden', 'important');
      originalBtn.style.setProperty('display', 'none', 'important');

      let h = document.getElementById(id);
      if (!h) {
        h = document.createElement('div'); h.id = id; h.className = 'ag-fixed-hitbox';
        h.innerHTML = iconSvg;
        h.addEventListener('click', () => originalBtn?.click());
        document.body.appendChild(h);
      } else if (h.parentElement !== document.body) {
        document.body.appendChild(h);
      }
      h.style.width = size + 'px';
      h.style.height = size + 'px';
      const baseLeft = anchorRect.left + (anchorRect.width / 2) - (size / 2);
      const baseTop = anchorRect.top + (anchorRect.height / 2) - (size / 2);
      const dx = layout.dock.x - DEFAULT_LAYOUT.dock.x;
      const dy = layout.dock.y - DEFAULT_LAYOUT.dock.y;
      h.style.left = (baseLeft + dx) + 'px';
      h.style.top = (baseTop + dy + (offsetIndex * 52)) + 'px';
    };

    createOrUpdate('ag-market-hitbox', svg(ICONS.cart, { size: 18 }), marketBtn, 1);
    createOrUpdate('ag-stats-hitbox', svg(ICONS.stats, { size: 18 }), statsBtn, 2);
  }

  function enforceProfileHitbox() {
    const ids = ['ag-notify-hitbox', 'ag-friends-hitbox', 'ag-market-hitbox', 'ag-stats-hitbox'];
    const isBlocking = document.getElementById('ag-startup-splash') || document.getElementById('ag-settings-panel');
    ids.forEach(id => {
      const h = document.getElementById(id);
      if (h) h.style.opacity = isBlocking ? '0' : '1';
    });
    if (isBlocking) return;

    positionNativeLeftDock();
    document.querySelectorAll('.ag-dock-hitbox').forEach(button => button.remove());
    const dock = document.getElementById('ag-side-dock');
    if (dock) {
      dock.classList.remove('ag-dock-open');
      dock.style.setProperty('display', 'none', 'important');
      dock.style.setProperty('pointer-events', 'none', 'important');
    }
    if (!window.__agDockNotified && document.querySelector('.ag-native-dock-button')) {
      setTimeout(() => Spicetify.showNotification("AmbientGlass: Dock OK"), 1000);
      window.__agDockNotified = true;
    }
  }

  function findNativeLeftRailButtons() {
    const badText = /back|forward|zur.ck|vorw.rts|previous|next/i;
    return Array.from(document.querySelectorAll('button, a'))
      .map(el => ({
        el,
        rect: el.getBoundingClientRect(),
        label: `${el.getAttribute('aria-label') || ''} ${el.title || ''} ${el.textContent || ''}`
      }))
      .filter(x => x.rect.width >= 24 &&
                   x.rect.width <= 68 &&
                   x.rect.height >= 24 &&
                   x.rect.height <= 68 &&
                   x.rect.left < 140 &&
                   x.rect.top > 24 &&
                   x.rect.top < 380 &&
                   !badText.test(x.label) &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'))
      .sort((a, b) => a.rect.top - b.rect.top)
      .map(x => x.el);
  }

  function positionNativeLeftDock() {
    const layout = getLayout();
    const startX = clamp(layout.dock?.x ?? DEFAULT_LAYOUT.dock.x, 8, 72);
    const startY = clamp(layout.dock?.y ?? DEFAULT_LAYOUT.dock.y, 40, 96);
    const profile = findNativeProfileButton();
    const market = document.getElementById('marketplace-extension-button') ||
                   document.querySelector('button[aria-label*="Marketplace"], button[title*="Marketplace"]');
    const stats = document.getElementById('stats-extension-button') ||
                  document.querySelector('.stats-button') ||
                  document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]');
    const rail = findNativeLeftRailButtons();
    const used = new Set([profile, market, stats].filter(Boolean));
    const smallRail = rail.filter(button => !used.has(button) && !button.querySelector?.('img')).slice(0, 2);
    smallRail.forEach(button => used.add(button));
    const extensionRail = rail
      .filter(button => !used.has(button) && !button.querySelector?.('img'))
      .slice(0, 8)
      .map((button, index) => ({ key: `ext-${index}`, button }));
    const entries = [
      { key: 'profile', button: profile },
      { key: 'notify', button: smallRail[0] },
      { key: 'friends', button: smallRail[1] },
      { key: 'market', button: market ? ensureNativeDockProxy('market', market, svg(ICONS.cart, { size: 18 })) : null },
      { key: 'stats', button: stats ? ensureNativeDockProxy('stats', stats, svg(ICONS.stats, { size: 18 })) : null },
      ...extensionRail
    ].filter(entry => entry.button?.isConnected);

    document.querySelectorAll('.ag-native-dock-button').forEach(button => {
      if (!entries.some(entry => entry.button === button)) cleanupNativeDockButton(button);
    });

    entries.forEach((entry, index) => styleNativeDockButton(entry.button, entry.key, startX, startY + index * 52));
    document.body?.classList.add('ag-dock-ready');
  }

  function ensureNativeDockProxy(key, original, html) {
    const id = `ag-native-${key}-proxy`;
    let proxy = document.getElementById(id);
    if (!proxy) {
      proxy = document.createElement('button');
      proxy.id = id;
      proxy.type = 'button';
      proxy.className = 'ag-native-dock-proxy';
      proxy.innerHTML = html;
      proxy.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const fresh = key === 'market'
          ? (document.getElementById('marketplace-extension-button') || document.querySelector('button[aria-label*="Marketplace"], button[title*="Marketplace"]'))
          : (document.getElementById('stats-extension-button') || document.querySelector('.stats-button') || document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]'));
        (fresh || original)?.click?.();
      });
      document.body.appendChild(proxy);
    } else if (proxy.parentElement !== document.body) {
      document.body.appendChild(proxy);
    }
    return proxy;
  }

  function styleNativeDockButton(button, key, left, top) {
    const safeKey = String(key).replace(/[^a-z0-9_-]/gi, '-');
    button.classList.add('ag-native-dock-button', `ag-native-dock-${safeKey}`);
    button.dataset.agDockKey = key;
    button.removeAttribute('disabled');
    button.style.setProperty('position', 'fixed', 'important');
    button.style.setProperty('left', `${left}px`, 'important');
    button.style.setProperty('top', `${top}px`, 'important');
    button.style.setProperty('right', 'auto', 'important');
    button.style.setProperty('bottom', 'auto', 'important');
    button.style.setProperty('width', '44px', 'important');
    button.style.setProperty('height', '44px', 'important');
    button.style.setProperty('min-width', '44px', 'important');
    button.style.setProperty('min-height', '44px', 'important');
    button.style.setProperty('max-width', '44px', 'important');
    button.style.setProperty('max-height', '44px', 'important');
    button.style.setProperty('margin', '0', 'important');
    button.style.setProperty('padding', '0', 'important');
    button.style.setProperty('display', 'flex', 'important');
    button.style.setProperty('align-items', 'center', 'important');
    button.style.setProperty('justify-content', 'center', 'important');
    button.style.setProperty('cursor', 'pointer', 'important');
    if (key === 'profile') {
      button.style.setProperty('opacity', '1', 'important');
      button.style.setProperty('visibility', 'visible', 'important');
      button.style.setProperty('pointer-events', 'auto', 'important');
      button.style.setProperty('transform', 'none', 'important');
    } else {
      button.style.removeProperty('opacity');
      button.style.removeProperty('visibility');
      button.style.removeProperty('pointer-events');
      button.style.removeProperty('transform');
    }
    button.style.setProperty('z-index', '2147483647', 'important');
    button.style.setProperty('-webkit-app-region', 'no-drag', 'important');
    if (!button.dataset.agNativeDockHoverBound) {
      button.dataset.agNativeDockHoverBound = 'true';
      button.addEventListener('pointerenter', () => setDockOpen(true));
      button.addEventListener('pointerleave', () => setDockOpen(false));
      button.addEventListener('focusin', () => setDockOpen(true));
      button.addEventListener('focusout', () => setDockOpen(false));
    }
  }

  function cleanupNativeDockButton(button) {
    button.className = String(button.className || '').split(/\s+/).filter(cls => cls && cls !== 'ag-native-dock-button' && !cls.startsWith('ag-native-dock-')).join(' ');
    delete button.dataset.agDockKey;
  }

  function ensureDockContainer(layout = getLayout()) {
    let dock = document.getElementById('ag-side-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'ag-side-dock';
      document.body.appendChild(dock);
    } else if (dock.parentElement !== document.body) {
      document.body.appendChild(dock);
    }
    positionDockContainer(dock, layout);
    return dock;
  }

  function positionDockContainer(dock, layout = getLayout()) {
    if (!dock) return;
    const profile = findNativeProfileButton();
    const rect = profile?.getBoundingClientRect?.();
    const dockX = rect?.width ? rect.left : clamp(layout.dock.x || DEFAULT_LAYOUT.dock.x, 8, 90);
    const dockY = rect?.height ? rect.bottom + 8 : clamp(layout.dock.y || DEFAULT_LAYOUT.dock.y, 38, 72);
    dock.style.setProperty('--ag-dock-x', `${dockX}px`);
    dock.style.setProperty('--ag-dock-y', `${dockY}px`);
    dock.style.left = `${dockX}px`;
    dock.style.top = `${dockY}px`;
  }

  function setDockOpen(open) {
    const dock = document.getElementById('ag-side-dock');
    window.clearTimeout(window._agNativeDockCloseTimer);
    if (dock) window.clearTimeout(dock._agCloseTimer);
    if (open) {
      document.body?.classList.add('ag-native-dock-open');
      dock?.classList.add('ag-dock-open');
    } else {
      window._agNativeDockCloseTimer = window.setTimeout(() => document.body?.classList.remove('ag-native-dock-open'), 180);
      if (dock) dock._agCloseTimer = window.setTimeout(() => dock.classList.remove('ag-dock-open'), 180);
    }
  }

  function bindNativeProfileHover(button) {
    if (!button) return;
    button.classList.remove('ag-native-profile-docked');
    button.classList.add('ag-native-profile-anchor');
    ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'margin', 'transform', 'z-index'].forEach(prop => {
      button.style.removeProperty(prop);
    });
    button.style.setProperty('opacity', '1', 'important');
    button.style.setProperty('visibility', 'visible', 'important');
    button.style.setProperty('pointer-events', 'auto', 'important');
    button.style.setProperty('-webkit-app-region', 'no-drag', 'important');
    button.removeAttribute('disabled');
    if (!button.dataset.agDockHoverBound) {
      button.dataset.agDockHoverBound = 'true';
      button.addEventListener('pointerenter', () => setDockOpen(true));
      button.addEventListener('pointerleave', () => setDockOpen(false));
      button.addEventListener('focusin', () => setDockOpen(true));
      button.addEventListener('focusout', () => setDockOpen(false));
    }
  }

  function getDockButtons(force = false) {
    if (!force && !_dockButtonsDirty && _dockButtonsCache.length && _dockButtonsCache.every(entry => entry?.original?.isConnected)) {
      return _dockButtonsCache;
    }
    const badText = /back|forward|zur.ck|vorw.rts|previous|next/i;
    const rail = Array.from(document.querySelectorAll('button, a'))
      .map(el => ({ el, rect: el.getBoundingClientRect(), label: `${el.getAttribute('aria-label') || ''} ${el.title || ''} ${el.textContent || ''}` }))
      .filter(x => x.rect.width >= 28 && x.rect.width <= 58 &&
                   x.rect.height >= 28 && x.rect.height <= 58 &&
                   x.rect.left < 120 &&
                   x.rect.top > 34 &&
                   x.rect.top < 285 &&
                   !badText.test(x.label) &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'))
      .sort((a, b) => a.rect.top - b.rect.top)
      .slice(0, 3)
      .map((x, i) => ({ key: ['notify', 'friends', 'profile'][i], original: x.el, html: dockButtonHtml(x.el, i) }));

    const profileButton = findNativeProfileButton();
    const visibleRail = rail.filter(entry => entry.original !== profileButton && !entry.original.querySelector?.('img'));

    const seen = new Set(visibleRail.map(x => x.original));
    const add = (key, original, html) => {
      if (!original || seen.has(original)) return;
      seen.add(original);
      visibleRail.push({ key, original, html });
    };
    add('market', document.getElementById('marketplace-extension-button') || document.querySelector('button[aria-label*="Marketplace"], button[title*="Marketplace"]'), svg(ICONS.cart, { size: 18 }));
    add('stats', document.getElementById('stats-extension-button') || document.querySelector('.stats-button') || document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]'), svg(ICONS.stats, { size: 18 }));
    _dockButtonsCache = visibleRail;
    _dockButtonsDirty = false;
    return _dockButtonsCache;
  }

  function dockButtonHtml(original, index) {
    const img = original?.querySelector?.('img');
    if (img?.src) return `<img src="${img.src}" alt="">`;
    const svgEl = original?.querySelector?.('svg');
    if (svgEl) return svgEl.outerHTML;
    if (index === 1) return svg(ICONS.artist, { size: 18 });
    if (index === 2) return '<span style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.2);display:block"></span>';
    return original?.innerHTML || svg(ICONS.stats, { size: 18 });
  }

  function createOrUpdateDockButton(entry, layout, index) {
    if (!entry?.original) return;
    const dock = ensureDockContainer(layout);
    const id = `ag-${entry.key}-hitbox`;
    let h = document.getElementById(id);
    if (!h) {
      h = document.createElement('button');
      h.id = id;
      h.type = 'button';
      h.className = 'ag-dock-hitbox';
      h.addEventListener('click', event => {
        if (entry.key === 'profile') return;
        event.preventDefault();
        event.stopPropagation();
        const freshEntry = getDockButtons(true).find(item => item.key === entry.key) || entry;
        const target = entry.key === 'profile'
          ? (findNativeProfileButton() || freshEntry.original || entry.original)
          : (freshEntry.original?.isConnected ? freshEntry.original : entry.original);
        const rect = h.getBoundingClientRect();
        const targetRect = target?.getBoundingClientRect?.();
        const eventX = targetRect?.width ? targetRect.left + targetRect.width / 2 : rect.left + rect.width / 2;
        const eventY = targetRect?.height ? targetRect.top + targetRect.height / 2 : rect.top + rect.height / 2;
        const restore = [];
        if (entry.key === 'profile' && target?.style) {
          ['pointer-events', 'visibility', 'opacity', 'z-index', '-webkit-app-region'].forEach(prop => {
            restore.push([prop, target.style.getPropertyValue(prop), target.style.getPropertyPriority(prop)]);
          });
          target.style.setProperty('pointer-events', 'auto', 'important');
          target.style.setProperty('visibility', 'visible', 'important');
          target.style.setProperty('opacity', '0.01', 'important');
          target.style.setProperty('z-index', '2147483647', 'important');
          target.style.setProperty('-webkit-app-region', 'no-drag', 'important');
          h.style.setProperty('pointer-events', 'none', 'important');
        }
        const eventInit = {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: eventX,
          clientY: eventY,
          screenX: Math.round(window.screenX + eventX),
          screenY: Math.round(window.screenY + eventY),
          button: 0,
          buttons: 1,
          composed: true,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true
        };
        try { target?.focus?.({ preventScroll: true }); } catch {}
        const realHit = entry.key === 'profile' ? document.elementFromPoint(eventX, eventY) : null;
        const dispatchTarget = realHit?.closest?.('button, a') || target;
        ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
          const Evt = type.startsWith('pointer') && typeof PointerEvent !== 'undefined' ? PointerEvent : MouseEvent;
          dispatchTarget?.dispatchEvent(new Evt(type, eventInit));
        });
        if (entry.key === 'profile') {
          ['keydown', 'keyup'].forEach(type => {
            dispatchTarget?.dispatchEvent(new KeyboardEvent(type, {
              bubbles: true,
              cancelable: true,
              key: 'Enter',
              code: 'Enter',
              composed: true
            }));
          });
        }
        if (typeof dispatchTarget?.click === 'function') dispatchTarget.click();
        if (restore.length) {
          window.setTimeout(() => {
            restore.forEach(([prop, value, priority]) => {
              if (value) target.style.setProperty(prop, value, priority);
              else target.style.removeProperty(prop);
            });
            h.style.setProperty('pointer-events', 'auto', 'important');
          }, 260);
        }
      });
      dock.appendChild(h);
    } else if (h.parentElement !== dock) {
      dock.appendChild(h);
    }
    h.innerHTML = entry.html || '';
    h.classList.remove('ag-profile-spacer');
    h.style.pointerEvents = 'auto';
    h.style.display = '';
    h.style.left = 'auto';
    h.style.top = 'auto';
    h.style.order = String(index);
    if (entry.key !== 'profile') {
      entry.original.style.setProperty('opacity', '0', 'important');
      entry.original.style.setProperty('pointer-events', 'none', 'important');
      entry.original.style.setProperty('visibility', 'hidden', 'important');
    }
  }

  function findNativeProfileButton() {
    const userBox = document.querySelector('.main-userWidget-box');
    const direct = userBox?.closest?.('button, a');
    if (direct?.isConnected) return direct;
    const labeled = Array.from(document.querySelectorAll('button, a')).find(el => {
      const label = `${el.getAttribute('aria-label') || ''} ${el.title || ''}`.toLowerCase();
      const rect = el.getBoundingClientRect();
      return rect.left < 150 && rect.top > 28 && rect.top < 330 && (label.includes('profile') || label.includes('konto') || label.includes('account'));
    });
    if (labeled) return labeled;
    const candidates = Array.from(document.querySelectorAll('button, a'))
      .map(el => ({ el, rect: el.getBoundingClientRect(), html: el.innerHTML || '' }))
      .filter(x => x.rect.width >= 28 &&
                   x.rect.width <= 58 &&
                   x.rect.height >= 28 &&
                   x.rect.height <= 58 &&
                   x.rect.left < 130 &&
                   x.rect.top > 34 &&
                   x.rect.top < 320 &&
                   !x.el.classList.contains('ag-dock-hitbox') &&
                   !String(x.el.id || '').startsWith('ag-') &&
                   !!x.el.querySelector('img') &&
                   !x.el.closest('.Root__main-view, .Root__now-playing-bar, .main-connectBar-connectBar, .Root__right-sidebar, [data-testid="queue-page"], [class*="Queue"], [class*="queue"]'));
    return candidates.sort((a, b) => b.rect.top - a.rect.top)[0]?.el || null;
  }

  function findOpenProfileMenu() {
    return Array.from(document.querySelectorAll('.main-contextMenu-menu, [role="menu"], [data-radix-menu-content]')).find(menu => {
      const text = (menu.textContent || '').toLowerCase();
      return text.includes('ambientglass settings') || text.includes('account') || text.includes('log out') || text.includes('profile');
    });
  }

  function repositionDockMenu(anchorRect) {
    const menu = findOpenProfileMenu();
    if (!menu) return;
    const width = Math.max(260, menu.getBoundingClientRect().width || 260);
    const height = Math.min(menu.getBoundingClientRect().height || 420, window.innerHeight - 32);
    const openRight = anchorRect.left < window.innerWidth / 2;
    const left = openRight ? anchorRect.right + 8 : anchorRect.left - width - 8;
    const top = anchorRect.top + anchorRect.height / 2 - height / 2;
    menu.style.setProperty('position', 'fixed', 'important');
    menu.style.setProperty('left', clampPx(left, width, window.innerWidth) + 'px', 'important');
    menu.style.setProperty('top', clampPx(top, height, window.innerHeight, 16) + 'px', 'important');
    menu.style.setProperty('z-index', '100000', 'important');
  }

  function fixYouLiked() {
    const artistImg = document.querySelector('.main-entityHeader-image')?.src || 
                      document.querySelector('.main-entityHeader-imageContainer img')?.src ||
                      document.querySelector('img[class*="image"]')?.src;

    if (!document.getElementById('ag-yl-fix-style')) {
      const style = document.createElement('style');
      style.id = 'ag-yl-fix-style';
      style.textContent = `
        .ag-yl-node { position: relative !important; width: 100% !important; background: transparent !important; }
        .ag-yl-node h2 { margin: 0 0 12px 0 !important; font-size: 24px !important; font-weight: 700 !important; background: transparent !important; }
        .ag-yl-main-row { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 24px !important; width: 100% !important; height: 80px !important; background: transparent !important; }
        .ag-yl-text-row { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; background: transparent !important; }
        .ag-yl-text-line1 { display: block !important; white-space: nowrap !important; color: white !important; font-size: 14px !important; font-weight: 600 !important; }
        .ag-yl-text-line1 * { display: inline !important; margin: 0 !important; padding: 0 !important; white-space: nowrap !important; background: none !important; }
        .ag-yl-text-line2 { font-size: 12px !important; color: rgba(255,255,255,0.5) !important; margin: 0 !important; display: block !important; }
        .ag-yl-text-line2 * { display: inline !important; background: none !important; color: inherit !important; }
        
        /* Hide stale native elements after rebuilding this block. */
        .ag-yl-node > *:not(h2):not(.ag-yl-main-row) {
          display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; opacity: 0 !important;
        }
        .ag-yl-node img, .ag-yl-node [class*="Avatar"], .ag-yl-node [class*="imageContainer"] {
          display: none !important; width: 0 !important; height: 0 !important; visibility: hidden !important; opacity: 0 !important;
        }
        #ag-custom-yl-avatar-container { display: block !important; width: 80px !important; height: 80px !important; visibility: visible !important; opacity: 1 !important; }
        .ag-yl-main-row { display: flex !important; visibility: visible !important; opacity: 1 !important; }
      `;
      document.head.appendChild(style);
    }

    document.querySelectorAll('h2').forEach(h2 => {
      const text = h2.innerText.trim();
      if ((text.includes('You Liked') || text.includes('Gef\u00e4llt dir')) && 
          !text.includes('Artist pick') && !text.includes('Auswahl des K\u00fcnstlers')) {
        
        const node = h2.parentElement;
        if (!node || node.querySelector('.ag-yl-main-row')) return;
        node.classList.add('ag-yl-node');

        const imgSrc = node.querySelector('img')?.src || artistImg;
        if (!imgSrc) return;

        const mainRow = document.createElement('div');
        mainRow.className = 'ag-yl-main-row';
        const avContainer = document.createElement('div');
        avContainer.id = 'ag-custom-yl-avatar-container';
        avContainer.style.cssText = `position: relative !important; width: 80px !important; height: 80px !important; min-width: 80px !important; border-radius: 50% !important; background-image: url(${imgSrc}) !important; background-size: cover !important; background-position: center !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; border: 2px solid rgba(255,255,255,0.1) !important; z-index: 100 !important;`;
        const textRow = document.createElement('div');
        textRow.className = 'ag-yl-text-row';
        
        // Manual text extraction for maximum stability.
        let songsCount = "";
        let releasesCount = "";
        let artistName = "";

        node.querySelectorAll('span, div, a').forEach(el => {
          const t = el.innerText.trim();
          if (!t || t.includes('You Liked') || t.includes('Gef\u00e4llt dir')) return;
          if (t.toLowerCase().includes('song')) songsCount = t;
          else if (t.toLowerCase().includes('release')) releasesCount = t;
          else if (t.length > 1 && !t.includes('\u2022')) artistName = t;
        });

        const line1 = document.createElement('div');
        line1.className = 'ag-yl-text-line1';
        line1.innerText = `${songsCount}${songsCount && releasesCount ? ' - ' : ''}${releasesCount}`;
        
        const line2 = document.createElement('div');
        line2.className = 'ag-yl-text-line2';
        line2.innerText = artistName;

        if (line1.innerText.trim()) textRow.appendChild(line1);
        if (line2.innerText.trim()) textRow.appendChild(line2);

        // Klickbarkeit wiederherstellen (Internes Routing)
        const originalLink = node.querySelector('a')?.href;
        if (originalLink) {
          mainRow.style.cursor = 'pointer';
          mainRow.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              // Extrahiere Pfad (z.B. /artist/...)
              const path = originalLink.replace('https://xpui.app.spotify.com', '');
              Spicetify.Platform.History.push(path);
            } catch (err) {
              window.location.href = originalLink;
            }
          };
        }

        // Herz finden (als einziges klonen)
        const originalHeart = node.querySelector('svg')?.parentElement?.parentElement || node.querySelector('.main-likedSongsButton-likedSongsIcon');
        if (originalHeart) {
          const heartClone = originalHeart.cloneNode(true);
          heartClone.style.cssText = 'position: absolute !important; bottom: -2px !important; right: -2px !important; width: 30px !important; height: 30px !important; z-index: 110 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: none !important; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) !important;';
          avContainer.appendChild(heartClone);
        }
        
        mainRow.appendChild(avContainer);
        mainRow.appendChild(textRow);
        node.appendChild(mainRow);
      }
    });
  }

  function isFullscreen() {
    try {
      const path = Spicetify.Platform.History.location.pathname || '';
      const fulls = ['/lyrics', '/queue', '/preferences'];
      if (fulls.some(r => path.startsWith(r))) return true;
      return !!(
        document.fullscreenElement ||
        document.querySelector('.npv-main-container') ||
        document.querySelector('button[aria-label*="Exit full screen" i]') ||
        document.querySelector('button[aria-label*="Exit fullscreen" i]') ||
        document.querySelector('button[aria-label*="Vollbild beenden" i]')
      );
    } catch { return false; }
  }

  function isModalOpen() {
    return !!(
      document.querySelector('[data-testid="dialog"]') ||
      document.querySelector('[class*="GenericModal"]') ||
      document.querySelector('[class*="modal-overlay"]') ||
      document.querySelector('.main-embedWidgetGenerator-container') ||
      document.querySelector('[class*="Backdrop"]') ||
      document.getElementById('ag-settings-panel') ||
      document.getElementById('ag-layout-overlay')
    );
  }

  function updateVisibility() {
    const search = document.getElementById('ag-centered-search');
    const cluster = document.getElementById('ag-home-cluster');
    if (!search || !cluster) return;
    const layout = _layoutDraft || getLayout();

    if (_layoutEditMode) {
      applyLayout(layout);
      setStyleIfChanged(search, 'opacity', '1');
      setStyleIfChanged(search, 'visibility', 'visible');
      setStyleIfChanged(search, 'pointer-events', 'auto');
      setStyleIfChanged(cluster, 'opacity', '1');
      setStyleIfChanged(cluster, 'visibility', 'visible');
      setStyleIfChanged(cluster, 'pointer-events', 'auto');
      if (!_layoutDragging) scheduleLayoutEditorFrame(false);
      return;
    }

    applyLayout(layout);

    const path = Spicetify.Platform.History.location.pathname || '';
    const isSearchPage = path.startsWith('/search/');
    const isNarrow = window.innerWidth < 750;
    const isExtensionPage = path.includes('marketplace') ||
                            path.includes('stats') ||
                            path.includes('statistics') ||
                            !!document.querySelector('.marketplace-header') ||
                            !!document.querySelector('.stats-header');
    const isFull = isFullscreen();
    document.body?.classList.toggle('ag-fullscreen-active', isFullscreen());
    document.body?.classList.toggle('ag-extension-page', isExtensionPage);
    const isModal = isModalOpen();
    const shouldHide = !_layoutEditMode && (isFull || isNarrow || isModal);
    const suppressSearch = shouldHide || isExtensionPage;
    const y = getMainScrollY();
    const searchFadeDistance = isSearchPage ? 220 : 150;
    const o = suppressSearch ? 0 : Math.max(0, 1 - y / searchFadeDistance);
    const hidden = suppressSearch || y > searchFadeDistance || o < 0.05;
    const pinHomeTop = shouldHide || isSearchPage || isExtensionPage || y > 12;
    const visibilitySignature = [
      shouldHide ? 1 : 0,
      pinHomeTop ? 1 : 0,
      Math.round(o * 100),
      Math.min(Math.round(y * 0.18), 80),
      path
    ].join('|');
    if (visibilitySignature === _lastVisibilitySignature) return;
    _lastVisibilitySignature = visibilitySignature;

    if (shouldHide) {
      setStyleIfChanged(search, 'opacity', '0');
      setStyleIfChanged(search, 'visibility', 'hidden');
      setStyleIfChanged(search, 'pointer-events', 'none');
      setStyleIfChanged(cluster, 'opacity', '0');
      setStyleIfChanged(cluster, 'visibility', 'hidden');
      setStyleIfChanged(cluster, 'pointer-events', 'none');
      setStyleIfChanged(cluster, 'left', '50%', 'important');
      setStyleIfChanged(cluster, 'top', '60px', 'important');
      setStyleIfChanged(cluster, 'right', 'auto', 'important');
      setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
      setStyleIfChanged(cluster, 'width', '340px', 'important');
      setStyleIfChanged(cluster, 'height', '92px', 'important');
      setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
    } else {
      setStyleIfChanged(search, 'opacity', String(o));
      setStyleIfChanged(search, 'visibility', hidden ? 'hidden' : 'visible');
      setStyleIfChanged(search, 'pointer-events', hidden || o < 0.1 ? 'none' : 'auto');
      setStyleIfChanged(search, 'left', `${layout.search.x}%`);
      setStyleIfChanged(search, 'top', `${layout.search.y}%`);
      setStyleIfChanged(search, 'transform', `translate(-50%, -50%) translateY(-${Math.min(y * 0.18, 80)}px) scale(1)`);
      setStyleIfChanged(cluster, 'opacity', '1');
      setStyleIfChanged(cluster, 'visibility', 'visible');
      setStyleIfChanged(cluster, 'pointer-events', 'auto');
      if (pinHomeTop) {
        setStyleIfChanged(cluster, 'left', '50%', 'important');
        setStyleIfChanged(cluster, 'top', isSearchPage ? '48px' : '60px', 'important');
        setStyleIfChanged(cluster, 'right', 'auto', 'important');
        setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
        setStyleIfChanged(cluster, 'width', '340px', 'important');
        setStyleIfChanged(cluster, 'height', '92px', 'important');
        setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
      } else {
        setStyleIfChanged(cluster, 'left', `${layout.homeCluster.x}%`, 'important');
        setStyleIfChanged(cluster, 'top', `${layout.homeCluster.y}%`, 'important');
        setStyleIfChanged(cluster, 'right', 'auto', 'important');
        setStyleIfChanged(cluster, 'bottom', 'auto', 'important');
        setStyleIfChanged(cluster, 'width', '340px', 'important');
        setStyleIfChanged(cluster, 'height', '92px', 'important');
        setStyleIfChanged(cluster, 'transform', 'translate(-50%, -50%)', 'important');
      }
    }
  }
  let _searchSuggestionItems = [];
  let _searchSuggestionLoaded = false;
  let _searchSuggestionActiveIndex = -1;
  let _searchSuggestionRequestId = 0;
  let _searchPageRequestId = 0;
  const _searchSuggestionCache = new Map();

  function normalizeSpotifySearchItems(section, type) {
    return (section?.items || [])
      .filter(item => item?.name && item?.uri)
      .map(item => ({
        name: item.name,
        uri: item.uri,
        type,
        image: item.images?.[0]?.url || item.album?.images?.[0]?.url || ''
      }));
  }

  function normalizeLooseSearchItems(items, fallbackType = 'item') {
    return (items || []).map(raw => {
      const item = raw?.data || raw?.item || raw;
      const uri = item?.uri || item?.id || raw?.uri;
      const name = item?.name || item?.title || item?.profile?.name || item?.albumOfTrack?.name;
      const type = item?.type || raw?.type || fallbackType;
      const image = item?.images?.items?.[0]?.sources?.[0]?.url ||
                    item?.visuals?.avatarImage?.sources?.[0]?.url ||
                    item?.coverArt?.sources?.[0]?.url ||
                    item?.albumOfTrack?.coverArt?.sources?.[0]?.url ||
                    item?.images?.[0]?.url ||
                    item?.album?.images?.[0]?.url ||
                    '';
      return name && uri ? { name, uri, type, image } : null;
    }).filter(Boolean);
  }

  async function searchSpotifySuggestions(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    if (_searchSuggestionCache.has(normalized)) return _searchSuggestionCache.get(normalized);

    try {
      const endpoint = 'https://api.spotify.com/v1/search?' + new URLSearchParams({
        q: query.trim(),
        type: 'artist,album,playlist,track',
        limit: '4'
      }).toString();
      const data = await Spicetify.CosmosAsync.get(endpoint);
      const results = [
        ...normalizeSpotifySearchItems(data?.artists, 'artist'),
        ...normalizeSpotifySearchItems(data?.albums, 'album'),
        ...normalizeSpotifySearchItems(data?.tracks, 'track'),
        ...normalizeSpotifySearchItems(data?.playlists, 'playlist')
      ].slice(0, 8);
      if (results.length) {
        _searchSuggestionCache.set(normalized, results);
        return results;
      }
    } catch {}

    try {
      const data = await Spicetify.CosmosAsync.get('sp://core-search/v1/search?' + new URLSearchParams({
        query: query.trim(),
        type: 'artist,album,playlist,track',
        limit: '6'
      }).toString());
      const results = [
        ...normalizeLooseSearchItems(data?.artists?.items || data?.artists, 'artist'),
        ...normalizeLooseSearchItems(data?.albums?.items || data?.albums, 'album'),
        ...normalizeLooseSearchItems(data?.tracks?.items || data?.tracks, 'track'),
        ...normalizeLooseSearchItems(data?.playlists?.items || data?.playlists, 'playlist'),
        ...normalizeLooseSearchItems(data?.topResults?.items || data?.topResults, 'result')
      ].slice(0, 8);
      _searchSuggestionCache.set(normalized, results);
      return results;
    } catch {}

    _searchSuggestionCache.set(normalized, []);
    return [];
  }

  async function loadSearchSuggestionItems() {
    if (_searchSuggestionLoaded) return _searchSuggestionItems;
    _searchSuggestionLoaded = true;
    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 600 });
      _searchSuggestionItems = (lib.items || [])
        .filter(item => item?.name && item?.uri)
        .map(item => ({
          name: item.name,
          uri: item.uri,
          type: item.uri.split(':')[1] || 'item',
          image: item.images?.[0]?.url || item.image?.url || ''
        }));
    } catch {
      _searchSuggestionItems = [];
    }
    return _searchSuggestionItems;
  }

  function setupSearchSuggestions(input, panel) {
    if (!input || !panel) return;

    const close = () => {
      panel.classList.remove('ag-search-suggestions-visible');
      panel.replaceChildren();
      _searchSuggestionActiveIndex = -1;
    };

    const clearInputAfterSearch = () => {
      window.setTimeout(() => {
        input.value = '';
        close();
      }, 80);
    };

    const navigateQuery = () => {
      const query = input.value.trim();
      if (!query) return;
      close();
      safeNavigate('/search/' + encodeURIComponent(query));
      clearInputAfterSearch();
    };

    const setActive = index => {
      const buttons = Array.from(panel.querySelectorAll('.ag-search-suggestion'));
      _searchSuggestionActiveIndex = buttons.length ? clamp(index, 0, buttons.length - 1) : -1;
      buttons.forEach((button, i) => button.classList.toggle('ag-search-suggestion-active', i === _searchSuggestionActiveIndex));
    };

    const render = async () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        close();
        return;
      }

      const requestId = ++_searchSuggestionRequestId;
      const spotifyMatches = await searchSpotifySuggestions(input.value.trim());
      if (requestId !== _searchSuggestionRequestId) return;
      const localItems = await loadSearchSuggestionItems();
      if (requestId !== _searchSuggestionRequestId) return;
      const seenUris = new Set(spotifyMatches.map(item => item.uri));
      const localMatches = localItems
        .filter(item => !seenUris.has(item.uri) && item.name.toLowerCase().includes(query))
        .sort((a, b) => {
          const an = a.name.toLowerCase();
          const bn = b.name.toLowerCase();
          const aStarts = an.startsWith(query) ? 0 : 1;
          const bStarts = bn.startsWith(query) ? 0 : 1;
          return aStarts - bStarts || an.localeCompare(bn);
        });
      const matches = [...spotifyMatches, ...localMatches].slice(0, 6);

      panel.replaceChildren();

      const searchButton = document.createElement('button');
      searchButton.type = 'button';
      searchButton.className = 'ag-search-suggestion ag-search-suggestion-query';
      searchButton.innerHTML = svg(ICONS.search, { size: 16 });
      const searchText = document.createElement('span');
      searchText.textContent = `Search "${input.value.trim()}"`;
      searchButton.appendChild(searchText);
      searchButton.addEventListener('mousedown', event => event.preventDefault());
      searchButton.addEventListener('click', navigateQuery);
      panel.appendChild(searchButton);

      matches.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ag-search-suggestion';
        button.addEventListener('mousedown', event => event.preventDefault());
        button.addEventListener('click', () => {
          close();
          safeNavigate(item.uri);
          clearInputAfterSearch();
        });

        const art = document.createElement('span');
        art.className = 'ag-search-suggestion-art';
        if (item.image) {
          art.style.backgroundImage = `url("${item.image.replace(/"/g, '\\"')}")`;
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = '';
          img.loading = 'lazy';
          art.appendChild(img);
        }

        const copy = document.createElement('span');
        copy.className = 'ag-search-suggestion-copy';

        const title = document.createElement('span');
        title.className = 'ag-search-suggestion-title';
        title.textContent = item.name;

        const type = document.createElement('span');
        type.className = 'ag-search-suggestion-type';
        type.textContent = item.type;

        copy.append(title, type);
        button.append(art, copy);
        panel.appendChild(button);
      });

      panel.classList.add('ag-search-suggestions-visible');
      setActive(0);
    };

    let debounce = 0;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(render, 80);
    });
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => window.setTimeout(close, 120));
    input.addEventListener('keydown', event => {
      const buttons = Array.from(panel.querySelectorAll('.ag-search-suggestion'));
      if (event.key === 'Escape') {
        close();
        input.blur();
        return;
      }
      if (event.key === 'ArrowDown' && buttons.length) {
        event.preventDefault();
        setActive(_searchSuggestionActiveIndex + 1);
        return;
      }
      if (event.key === 'ArrowUp' && buttons.length) {
        event.preventDefault();
        setActive(_searchSuggestionActiveIndex - 1);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const active = buttons[_searchSuggestionActiveIndex];
        if (active && panel.classList.contains('ag-search-suggestions-visible')) active.click();
        else navigateQuery();
      }
    });
  }

  function getSearchPageQuery() {
    const path = Spicetify.Platform.History.location.pathname || '';
    if (!path.startsWith('/search/')) return '';
    return decodeURIComponent(path.replace(/^\/search\/?/, '').split('/')[0] || '').trim();
  }

  function findMainContentRoot() {
    return document.querySelector('.main-view-container__scroll-node-child') ||
           document.querySelector('.Root__main-view main') ||
           document.querySelector('.Root__main-view');
  }

  function updateSearchPageVisualCenter() {
    const shell = document.getElementById('ag-search-page-redesign');
    if (!shell) {
      document.documentElement.style.removeProperty('--ag-search-page-shift');
      return;
    }
    const rect = shell.getBoundingClientRect();
    if (!rect.width) return;
    const viewportCenter = window.innerWidth / 2;
    const shellCenter = rect.left + rect.width / 2;
    const shift = clamp(viewportCenter - shellCenter, -160, 160);
    document.documentElement.style.setProperty('--ag-search-page-shift', `${shift}px`);
  }

  function createSearchPageCard(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'ag-search-page-card';
    card.addEventListener('click', () => safeNavigate(item.uri));

    const art = document.createElement('span');
    art.className = 'ag-search-page-card-art';
    if (item.image) {
      art.style.backgroundImage = `url("${item.image.replace(/"/g, '\\"')}")`;
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.loading = 'lazy';
      art.appendChild(img);
    }

    const copy = document.createElement('span');
    copy.className = 'ag-search-page-card-copy';

    const title = document.createElement('span');
    title.className = 'ag-search-page-card-title';
    title.textContent = item.name;

    const type = document.createElement('span');
    type.className = 'ag-search-page-card-type';
    type.textContent = item.type;

    copy.append(title, type);
    card.append(art, copy);
    return card;
  }

  async function updateSearchPageRedesign() {
    const query = getSearchPageQuery();
    const existing = document.getElementById('ag-search-page-redesign');
    if (!query) {
      existing?.remove();
      document.body?.classList.remove('ag-search-page');
      return;
    }

    const root = findMainContentRoot();
    if (!root) return;
    document.body?.classList.add('ag-search-page');

    let shell = existing;
    if (!shell) {
      shell = document.createElement('section');
      shell.id = 'ag-search-page-redesign';
      root.prepend(shell);
    } else if (shell.parentElement !== root) {
      root.prepend(shell);
    }
    requestAnimationFrame(updateSearchPageVisualCenter);

    const requestId = ++_searchPageRequestId;
    shell.replaceChildren();

    const hero = document.createElement('div');
    hero.className = 'ag-search-page-hero';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'ag-search-page-eyebrow';
    eyebrow.textContent = 'AmbientGlass Search';

    const title = document.createElement('h1');
    title.textContent = query;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Top matches, albums, artists and playlists blended into the glass view.';

    const cards = document.createElement('div');
    cards.className = 'ag-search-page-cards';
    const loading = document.createElement('div');
    loading.className = 'ag-search-page-loading';
    loading.textContent = 'Finding covers...';
    cards.appendChild(loading);

    hero.append(eyebrow, title, subtitle, cards);
    shell.appendChild(hero);
    requestAnimationFrame(updateSearchPageVisualCenter);

    const results = await searchSpotifySuggestions(query);
    if (requestId !== _searchPageRequestId || !document.body?.classList.contains('ag-search-page')) return;

    cards.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'ag-search-page-loading';
      empty.textContent = 'No preview results found yet.';
      cards.appendChild(empty);
      return;
    }

    results.slice(0, 8).forEach(item => cards.appendChild(createSearchPageCard(item)));
  }

  // Friends panel overlap fix.
  function fixFriendsPanel() {
    if (!document.getElementById('ag-friends-fix-style')) {
      const style = document.createElement('style');
      style.id = 'ag-friends-fix-style';
      style.textContent = `
        /* Prevent the current track from overlapping the Friends panel. */
        .main-buddyFeed-buddyFeed {
          padding-bottom: 0 !important;
          overflow-y: auto !important;
        }
        /* Keep the now-playing bar below the Friends panel. */
        .Root__now-playing-bar {
          z-index: 100 !important;
        }
        /* Keep now-playing content out of the Friends panel while it is open. */
        .main-globalNav-globalNav ~ .Root__right-sidebar .main-buddyFeed-buddyFeed {
          margin-bottom: 0 !important;
        }
        /* Prevent the current track from covering the Friends feed. */
        [data-testid="buddy-feed-container"],
        .main-buddyFeed-buddyFeedHeader {
          z-index: 10 !important;
          position: relative !important;
        }
        /* Hide now-playing views while the Friends panel is open. */
        .Root__right-sidebar:has([class*="buddyFeed"]) [data-testid="now-playing-view"]:not(:has([class*="buddyFeed"])),
        .Root__right-sidebar:has([class*="buddyFeed"]) .main-nowPlayingView-section:not(:has([class*="buddyFeed"])),
        .Root__right-sidebar.ag-friends-open [data-testid="now-playing-view"]:not(:has([class*="buddyFeed"])),
        .Root__right-sidebar.ag-friends-open .main-nowPlayingView-section:not(:has([class*="buddyFeed"])) {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          opacity: 0 !important;
          overflow: hidden !important;
          pointer-events: none !important;
        }
        .Root__right-sidebar {
          overflow: hidden !important;
        }
        .Root__right-sidebar.ag-friends-open [class*="buddyFeed"],
        .Root__right-sidebar.ag-friends-open [data-testid*="buddy" i],
        .Root__right-sidebar.ag-friends-open [class*="friend" i] {
          display: block !important;
          visibility: visible !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          overflow: visible !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function setupSidebarObserver() {
    const sidebar = getRightSidebarRoot();
    if (!sidebar) { setTimeout(setupSidebarObserver, 500); return; }
    if (false && !sidebar.dataset.agCollapseHooked) {
      sidebar.dataset.agCollapseHooked = 'true';
      sidebar.addEventListener('click', event => {
        const btn = event.target?.closest?.('button');
        if (!btn) return;
        const label = `${btn.getAttribute('aria-label') || ''} ${btn.title || ''} ${btn.textContent || ''}`.toLowerCase();
        const rect = btn.getBoundingClientRect();
        const sideRect = sidebar.getBoundingClientRect();
        const inHeaderZone = rect.top <= sideRect.top + 86;
        if (!inHeaderZone) return;
        const nearEdge = rect.left < sideRect.left + 72 || rect.right > sideRect.right - 72;
        const looksLikeCollapse = label.includes('collapse') ||
                                  label.includes('expand') ||
                                  label.includes('close') ||
                                  label.includes('hide') ||
                                  label.includes('now playing') ||
                                  label.includes('friend') ||
                                  ['<', '>', '\u2039', '\u203a'].includes((btn.textContent || '').trim());
        if (!nearEdge && !looksLikeCollapse) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const isCollapsed = sidebar.classList.contains('ag-sidebar-collapsed') || sidebar.dataset.agManualCollapsed === 'true';
        setSidebarCollapsed(sidebar, !isCollapsed);
      }, true);
    }
    const observer = new MutationObserver(() => {
      syncFriendsSidebarState(sidebar);
      setupForceOpenCollapseHandler(sidebar);
      syncSidebarOuterCollapse();
    });
    observer.observe(sidebar, { childList: true, subtree: true });
    syncFriendsSidebarState(sidebar);
    setupForceOpenCollapseHandler(sidebar);
    syncSidebarOuterCollapse();
  }

  function syncFriendsSidebarState(sidebar = getRightSidebarRoot()) {
    if (!sidebar) return;
    const isBuddy = !!sidebar.querySelector('[class*="buddyFeed"], [data-testid*="buddy" i], [aria-label*="Friend"], [aria-label*="Freund"], [class*="friend" i]');
    sidebar.classList.toggle('ag-friends-open', isBuddy);
    sidebar.querySelectorAll('[data-ag-hidden-for-friends="true"]').forEach(el => {
      const containsBuddy = !!el.querySelector?.('[class*="buddyFeed"], [data-testid*="buddy" i], [class*="friend" i]');
      if (!isBuddy || containsBuddy) {
        delete el.dataset.agHiddenForFriends;
        ['display', 'visibility', 'height', 'min-height', 'max-height', 'opacity', 'overflow', 'pointer-events'].forEach(prop => el.style.removeProperty(prop));
      }
    });
    sidebar.querySelectorAll('[class*="buddyFeed"], [data-testid*="buddy" i], [class*="friend" i]').forEach(el => {
      ['display', 'visibility', 'height', 'min-height', 'max-height', 'opacity', 'overflow', 'pointer-events'].forEach(prop => el.style.removeProperty(prop));
    });
    const nowPlayingEls = sidebar.querySelectorAll('[data-testid="now-playing-view"], .main-nowPlayingView-section');
    nowPlayingEls.forEach(el => {
      const containsBuddy = !!el.querySelector?.('[class*="buddyFeed"], [data-testid*="buddy" i], [class*="friend" i]');
      if (containsBuddy) return;
      if (isBuddy) {
        el.dataset.agHiddenForFriends = 'true';
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0', 'important');
        el.style.setProperty('min-height', '0', 'important');
        el.style.setProperty('max-height', '0', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      } else if (el.dataset.agHiddenForFriends === 'true') {
        delete el.dataset.agHiddenForFriends;
        ['display', 'visibility', 'height', 'min-height', 'max-height', 'opacity', 'overflow', 'pointer-events'].forEach(prop => el.style.removeProperty(prop));
      }
    });
    sidebar.querySelectorAll('[data-ag-sidebar-nonfriends="true"]').forEach(el => {
      delete el.dataset.agSidebarNonfriends;
      ['display', 'visibility', 'opacity', 'pointer-events', 'height', 'max-height', 'overflow'].forEach(prop => el.style.removeProperty(prop));
    });
    if (isBuddy) {
      sidebar.querySelectorAll('[class*="buddyFeed"], [data-testid*="buddy" i], [class*="friend" i]').forEach(el => {
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
      });
    }
  }

  function syncSidebarCollapse() {
    return;
  }

  function setSidebarCollapsed(sidebar, collapsed, remember = true) {
    return;
  }

  function restoreNativeSidebar() {
    const sidebar = document.querySelector('.Root__right-sidebar');
    document.body?.classList.remove('ag-sidebar-on-left', 'ag-sidebar-on-right');
    document.getElementById('ag-sidebar-reveal-hitbox')?.remove();
    document.documentElement.style.removeProperty('--ag-sidebar-space');
    document.documentElement.style.removeProperty('--ag-sidebar-collapsed-width');
    if (!sidebar) return;
    sidebar.classList.remove('ag-sidebar-left', 'ag-sidebar-right', 'ag-sidebar-collapsed');
    delete sidebar.dataset.agManualCollapsed;
    delete sidebar.dataset.agCollapseSession;
    delete sidebar.dataset.agCollapsed;
    ['--ag-sidebar-y', '--ag-sidebar-w', '--ag-sidebar-left'].forEach(prop => sidebar.style.removeProperty(prop));
  }

  function fixMarketplaceDropdown() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes("marketplace")) {
      document.body?.classList.remove('ag-marketplace-page');
      document.getElementById("ag-marketplace-tabs")?.remove();
      fixMarketplaceSpacing();
      return;
    }
    document.body?.classList.add('ag-marketplace-page');

    const defaultTabs = ['Extensions', 'Themes', 'Snippets', 'Apps', 'Installed'];
    try {
      const savedTabs = JSON.parse(localStorage.getItem('marketplace:tabs') || '[]');
      const normalized = defaultTabs.map(name => {
        const saved = Array.isArray(savedTabs) ? savedTabs.find(tab => tab?.name === name) : null;
        return { name, enabled: true, ...(saved || {}) };
      }).map(tab => ({ ...tab, enabled: true }));
      if (JSON.stringify(savedTabs) !== JSON.stringify(normalized)) {
        localStorage.setItem('marketplace:tabs', JSON.stringify(normalized));
      }
      if (!localStorage.getItem('marketplace:active-tab')) localStorage.setItem('marketplace:active-tab', defaultTabs[0]);
    } catch {
      localStorage.setItem('marketplace:tabs', JSON.stringify(defaultTabs.map(name => ({ name, enabled: true }))));
    }

    // Fix 1: Handle link-based tabs.
    const links = document.querySelectorAll(".marketplace-tabBar-headerItemLink, [class*='marketplace-tabBar-headerItemLink']");
    links.forEach(link => {
        link.style.setProperty("display", "inline-block", "important");
        link.style.setProperty("visibility", "visible", "important");
        link.style.setProperty("opacity", "1", "important");
        if (link.classList.contains("marketplace-tabBar-active")) {
            link.classList.add("active");
        }
    });

    hideMarketplaceMoreDropdown();

    // Fix 3: Handle dropdown/select-based tabs.
    const allSelects = document.querySelectorAll(".marketplace-header select");
    let tabSelect = null;
    allSelects.forEach(s => {
        if (s.options[0]?.text.includes("Extensions") || s.options[0]?.text.includes("Themes") || s.options.length > 3) {
            tabSelect = s;
        }
    });

    if (tabSelect) tabSelect.style.setProperty("display", "none", "important");

    const wireMarketplaceTab = (btn, opt, tabs) => {
      btn.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const previousTab = getMarketplaceContentTitle();
        localStorage.setItem('marketplace:active-tab', opt.label);
        tabs.querySelectorAll('.ag-market-tab-btn').forEach(item => item.classList.toggle('active', item === btn));
        if (tabSelect) {
          tabSelect.value = opt.value;
          tabSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const native = Array.from(document.querySelectorAll(".marketplace-tabBar-headerItemLink, [class*='marketplace-tabBar-headerItemLink'], button, a"))
          .filter(el => !el.closest('#ag-marketplace-tabs'))
          .find(el => (el.textContent || '').trim().toLowerCase() === opt.label.toLowerCase());
        if (native) native.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => {
          hideMarketplaceMoreDropdown();
          const nextTab = getMarketplaceContentTitle();
          const wanted = opt.label.toLowerCase();
          const stillOld = previousTab && nextTab && nextTab.toLowerCase() === previousTab.toLowerCase();
          const wrongContent = nextTab && !nextTab.toLowerCase().includes(wanted);
          if ((stillOld || wrongContent) && !window.__agMarketplaceReloading) {
            window.__agMarketplaceReloading = true;
            sessionStorage.setItem('ag-skip-startup-once', 'marketplace-tab');
            location.reload();
          }
        }, 260);
      };
    };

    if (!document.getElementById("ag-marketplace-tabs")) {
        const tabs = document.createElement("div");
        tabs.id = "ag-marketplace-tabs";
        const sourceTabs = tabSelect ? Array.from(tabSelect.options).map(opt => ({ label: opt.text, value: opt.value })) : defaultTabs.map(name => ({ label: name, value: name }));
        sourceTabs.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "ag-market-tab-btn";
            if ((localStorage.getItem('marketplace:active-tab') || defaultTabs[0]) === opt.label || tabSelect?.value === opt.value) btn.classList.add("active");
            btn.innerText = opt.label;
            wireMarketplaceTab(btn, opt, tabs);
            tabs.appendChild(btn);
        });
        const header = document.querySelector(".marketplace-header");
        if (header) {
            const search = header.querySelector(".marketplace-header__search-container");
            if (search) header.insertBefore(tabs, search);
            else header.appendChild(tabs);
        }
    } else {
      const tabs = document.getElementById("ag-marketplace-tabs");
      const sourceTabs = tabSelect ? Array.from(tabSelect.options).map(opt => ({ label: opt.text, value: opt.value })) : defaultTabs.map(name => ({ label: name, value: name }));
      tabs.querySelectorAll('.ag-market-tab-btn').forEach((btn, index) => {
        const opt = sourceTabs[index] || { label: btn.textContent.trim(), value: btn.textContent.trim() };
        wireMarketplaceTab(btn, opt, tabs);
      });
    }
    alignMarketplaceTabsToHome();
    [80, 240, 600].forEach(delay => setTimeout(alignMarketplaceTabsToHome, delay));
  }

  function alignMarketplaceTabsToHome() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes("marketplace")) return;
    const home = document.getElementById('ag-home-button') ||
                 document.querySelector('#ag-home-cluster .ag-home-main') ||
                 document.querySelector('#ag-home-cluster button');
    const tabs = document.getElementById('ag-marketplace-tabs');
    const header = document.querySelector('.marketplace-header');
    if (!home || !tabs || !header) return;
    const snippets = Array.from(tabs.querySelectorAll('.ag-market-tab-btn'))
      .find(btn => (btn.textContent || '').trim().toLowerCase() === 'snippets');
    if (!snippets) return;
    const homeRect = home.getBoundingClientRect();
    const snippetsRect = snippets.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    if (!homeRect.width || !snippetsRect.width || !headerRect.width) return;
    const homeCenter = homeRect.left + homeRect.width / 2;
    const snippetsCenter = snippetsRect.left + snippetsRect.width / 2;
    const delta = Math.round(homeCenter - snippetsCenter);
    if (Math.abs(delta) < 2) return;
    header.style.setProperty('left', `${Math.round(headerRect.left + delta)}px`, 'important');
    header.style.setProperty('right', 'auto', 'important');
    header.style.setProperty('transform', 'none', 'important');
  }

  function hideMarketplaceMoreDropdown() {
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes("marketplace")) return;
    document.querySelectorAll('[data-ag-marketplace-more="true"]').forEach(el => {
      const text = `${el.textContent || ''} ${el.getAttribute?.('aria-label') || ''} ${el.title || ''}`.trim().toLowerCase();
      const isStillMore = text === 'more' || text === 'mehr' || text.includes('more') || text.includes('mehr') || !!el.querySelector?.('[aria-haspopup="menu"], button[aria-haspopup="menu"]');
      if (isStillMore) return;
      delete el.dataset.agMarketplaceMore;
      ['display', 'visibility', 'opacity', 'pointer-events', 'width', 'height', 'overflow'].forEach(prop => el.style.removeProperty(prop));
    });

    const homeCluster = document.getElementById('ag-home-cluster');
    if (homeCluster?.dataset.agMarketplaceMore === 'true') {
      delete homeCluster.dataset.agMarketplaceMore;
      ['display', 'visibility', 'opacity', 'pointer-events', 'width', 'height', 'overflow'].forEach(prop => homeCluster.style.removeProperty(prop));
    }

    Array.from(document.querySelectorAll('button, [role="button"], select, .marketplace-tabBar-headerItem, [class*="marketplace-tabBar-headerItem"]')).forEach(el => {
      const text = `${el.textContent || ''} ${el.getAttribute?.('aria-label') || ''} ${el.title || ''}`.trim().toLowerCase();
      const rect = el.getBoundingClientRect();
      const isCompactMore = rect.top < 260 && rect.width < 220 && (text === 'more' || text === 'mehr' || text.includes('more') || text.includes('mehr'));
      const isMoreMenuTrigger = rect.top < 260 &&
        !!el.querySelector?.('[aria-haspopup="menu"], button[aria-haspopup="menu"]') &&
        (text === 'more' || text === 'mehr' || text.includes('more') || text.includes('mehr'));
      if (!isCompactMore && !isMoreMenuTrigger) return;
      const target = el.closest?.('.marketplace-tabBar-headerItem, [class*="marketplace-tabBar-headerItem"]') || el;
      target.dataset.agMarketplaceMore = 'true';
      target.style.setProperty('display', 'none', 'important');
      target.style.setProperty('visibility', 'hidden', 'important');
      target.style.setProperty('opacity', '0', 'important');
      target.style.setProperty('pointer-events', 'none', 'important');
      target.style.setProperty('width', '0', 'important');
      target.style.setProperty('height', '0', 'important');
      target.style.setProperty('overflow', 'hidden', 'important');
    });
  }

  function getMarketplaceContentTitle() {
    const headings = Array.from(document.querySelectorAll('.Root__main-view h1, .Root__main-view h2, h1, h2'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean);
    return headings.find(text => ['extensions', 'themes', 'snippets', 'apps', 'installed'].includes(text.toLowerCase())) || '';
  }

  function fixMarketplaceSpacing() {
    document.querySelectorAll('[data-ag-marketplace-pulled="true"]').forEach(el => {
      delete el.dataset.agMarketplacePulled;
      ['margin-top', 'padding-top', 'transform'].forEach(prop => el.style.removeProperty(prop));
    });
  }

  // Settings.
  function ensureLayoutEditorStyle() {
    if (document.getElementById('ag-layout-editor-style')) return;
    const style = document.createElement('style');
    style.id = 'ag-layout-editor-style';
    style.textContent = `
      #ag-layout-overlay { position: fixed; inset: 0; z-index: 99998; pointer-events: none; background: rgba(0,0,0,0.16); }
      #ag-layout-toolbar { position: fixed; top: 56px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; background: rgba(10, 8, 22, 0.9); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 12px 40px rgba(0,0,0,0.45); backdrop-filter: blur(20px); pointer-events: auto; }
      #ag-layout-toolbar button { min-height: 32px; padding: 0 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); color: #fff; background: rgba(255,255,255,0.08); font-weight: 700; }
      #ag-layout-save { background: var(--ag-accent-main, #7b5fdb) !important; }
      .ag-layout-handle { position: fixed; z-index: 99999; display: flex; align-items: center; justify-content: center; min-width: 96px; height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); color: #fff; background: rgba(123,95,219,0.78); box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 12px; font-weight: 800; cursor: grab; pointer-events: auto; user-select: none; }
      .ag-layout-handle:active { cursor: grabbing; }
      .ag-layout-ghost {
        position: fixed;
        z-index: 99997;
        pointer-events: auto;
        cursor: grab;
        border: 1px dashed rgba(255,255,255,0.32);
        border-radius: 12px;
        background: rgba(123,95,219,0.08);
        box-shadow: inset 0 0 0 1px rgba(123,95,219,0.16), 0 8px 24px rgba(0,0,0,0.18);
      }
      .ag-layout-ghost:active { cursor: grabbing; }
      body.ag-layout-dragging .ag-layout-handle,
      body.ag-layout-dragging .ag-layout-ghost {
        transition: none !important;
      }
      body.ag-layout-dragging #ag-home-cluster,
      body.ag-layout-dragging #ag-centered-search,
      body.ag-layout-dragging .Root__now-playing-bar,
      body.ag-layout-dragging .Root__right-sidebar,
      body.ag-layout-dragging #ag-jam-floating-pill {
        transition: none !important;
      }
      .ag-layout-ghost::after {
        content: attr(data-label);
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(123,95,219,0.78);
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      }
      body.ag-layout-editing #ag-jam-floating-pill { opacity: 1 !important; visibility: visible !important; pointer-events: none !important; }
    `;
    document.head.appendChild(style);
  }

  function layoutTargets() {
    return [
      { key: 'dock', label: 'Dock', el: document.getElementById('ag-notify-hitbox') || document.getElementById('ag-profile-hitbox') || document.querySelector('.main-userWidget-box'), unit: 'px' },
      { key: 'homeCluster', label: 'Home Cluster', el: document.getElementById('ag-home-cluster'), unit: '%' },
      { key: 'search', label: 'Searchbar', el: document.getElementById('ag-centered-search'), unit: '%' },
      { key: 'nowPlaying', label: 'Now Playing', el: document.querySelector('.Root__now-playing-bar'), unit: '%' }
    ].filter(t => t.el);
  }

  function positionLayoutHandles() {
    const overlay = document.getElementById('ag-layout-overlay');
    if (!overlay) return;
    const draft = _layoutDraft || getLayout();
    layoutTargets().forEach(target => {
      const handle = overlay.querySelector(`[data-layout-target="${target.key}"]`);
      if (!handle) return;
      let x;
      let y;
      if (_layoutEditMode && draft[target.key]) {
        if (target.unit === 'px') {
          x = draft[target.key].x + (target.el.offsetWidth || 44) / 2;
          y = draft[target.key].y;
        } else {
          x = (draft[target.key].x / 100) * window.innerWidth;
          y = (draft[target.key].y / 100) * window.innerHeight - 38;
        }
      } else {
        const rect = target.el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top - 38;
      }
      handle.style.left = clampPx(x - handle.offsetWidth / 2, handle.offsetWidth, window.innerWidth) + 'px';
      handle.style.top = clampPx(y, handle.offsetHeight, window.innerHeight, 64) + 'px';
    });
    positionLayoutPreviews();
  }

  function positionLayoutPreviews() {
    if (!_layoutEditMode || !_layoutDraft) return;
    layoutTargets().forEach(target => {
      let ghost = document.querySelector(`.ag-layout-ghost[data-layout-target="${target.key}"]`);
      if (!ghost) return;
      const realRect = target.el.getBoundingClientRect();
      let left;
      let top;
      let width = Math.max(44, realRect.width);
      let height = Math.max(34, realRect.height);
      if (target.key === 'dock') {
        width = 44;
        height = 44 * 5 + 12 * 4;
        left = _layoutDraft.dock.x;
        top = _layoutDraft.dock.y;
      } else if (target.key === 'homeCluster') {
        width = Math.min(120, Math.max(52, realRect.width || 52));
        height = Math.min(72, Math.max(52, realRect.height || 52));
        left = (_layoutDraft.homeCluster.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.homeCluster.y / 100) * window.innerHeight - height / 2;
      } else if (target.key === 'search') {
        width = Math.min(760, Math.max(360, realRect.width || 560));
        height = Math.min(72, Math.max(46, realRect.height || 46));
        left = (_layoutDraft.search.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.search.y / 100) * window.innerHeight - height / 2;
      } else if (target.key === 'nowPlaying') {
        width = Math.min(760, window.innerWidth * 0.58);
        height = Math.min(86, Math.max(66, realRect.height || 66));
        left = (_layoutDraft.nowPlaying.x / 100) * window.innerWidth - width / 2;
        top = (_layoutDraft.nowPlaying.y / 100) * window.innerHeight - height / 2;
      } else if (target.key === 'sidebar') {
        width = Math.max(220, (_layoutDraft.sidebar.w / 100) * window.innerWidth);
        height = Math.max(260, window.innerHeight - ((_layoutDraft.sidebar.y / 100) * window.innerHeight) - 88);
        left = (_layoutDraft.sidebar.x / 100) * window.innerWidth;
        top = (_layoutDraft.sidebar.y / 100) * window.innerHeight;
      }
      ghost.style.left = clampPx(left, width, window.innerWidth) + 'px';
      ghost.style.top = clampPx(top, height, window.innerHeight, 64) + 'px';
      ghost.style.width = width + 'px';
      ghost.style.height = height + 'px';
    });
    const jamPreview = document.getElementById('ag-jam-floating-pill');
    if (jamPreview) {
      jamPreview.style.setProperty('left', `${_layoutDraft.nowPlaying.x}%`, 'important');
      jamPreview.style.setProperty('top', `calc(${_layoutDraft.nowPlaying.y}% - 52px)`, 'important');
      jamPreview.style.setProperty('bottom', 'auto', 'important');
      jamPreview.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    }
    getDockButtons().forEach((entry, index) => createOrUpdateDockButton(entry, _layoutDraft, index));
  }

  function scheduleLayoutEditorFrame(applyReal = true) {
    if (_layoutFrame) return;
    _layoutFrame = requestAnimationFrame(() => {
      _layoutFrame = 0;
      if (!_layoutEditMode || !_layoutDraft) return;
      if (applyReal) applyLayout(_layoutDraft);
      positionLayoutHandles();
    });
  }

  function startLayoutEditor() {
    if (document.getElementById('ag-layout-overlay')) return;
    ensureLayoutEditorStyle();
    restoreNativeSidebar();
    _layoutEditMode = true;
    _layoutDraft = getLayout();
    document.body.classList.add('ag-layout-editing');
    restoreNativeSidebar();

    const overlay = document.createElement('div');
    overlay.id = 'ag-layout-overlay';
    overlay.innerHTML = `<div id="ag-layout-toolbar"><button id="ag-layout-save">Save</button><button id="ag-layout-reset">Reset</button><button id="ag-layout-cancel">Cancel</button></div>`;
    document.body.appendChild(overlay);

    let jamPreview = document.getElementById('ag-jam-floating-pill');
    if (!jamPreview) {
      jamPreview = document.createElement('div');
      jamPreview.id = 'ag-jam-floating-pill';
      document.body.appendChild(jamPreview);
    }
    jamPreview.dataset.agPreview = 'true';
    jamPreview.textContent = "Jam pill";
    jamPreview.style.setProperty('display', 'inline-flex', 'important');
    jamPreview.classList.remove('ag-jam-hidden');
    positionLayoutPreviews();

    layoutTargets().forEach(target => {
      const ghost = document.createElement('div');
      ghost.className = 'ag-layout-ghost';
      ghost.dataset.layoutTarget = target.key;
      ghost.dataset.label = target.label;
      overlay.appendChild(ghost);

      const handle = document.createElement('div');
      handle.className = 'ag-layout-handle';
      handle.dataset.layoutTarget = target.key;
      handle.textContent = target.label;
      overlay.appendChild(handle);
      const beginDrag = event => {
        event.preventDefault();
        const dragEl = event.currentTarget;
        dragEl.setPointerCapture(event.pointerId);
        _layoutDragging = true;
        document.body.classList.add('ag-layout-dragging');
        const startX = event.clientX;
        const startY = event.clientY;
        const start = cloneLayout(_layoutDraft);
        const move = ev => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (target.unit === 'px') {
            const width = target.key === 'dock' ? 44 : (target.el.offsetWidth || 44);
            const height = target.key === 'dock' ? (44 * 5 + 12 * 4) : (target.el.offsetHeight || 44);
            _layoutDraft[target.key].x = clampPx(snapPxCenter(start[target.key].x + dx, width, window.innerWidth), width, window.innerWidth);
            _layoutDraft[target.key].y = clampPx(snapPxCenter(start[target.key].y + dy, height, window.innerHeight), height, window.innerHeight);
          } else {
            _layoutDraft[target.key].x = snapPercent(clamp(start[target.key].x + (dx / window.innerWidth) * 100, 0, 100));
            _layoutDraft[target.key].y = snapPercent(clamp(start[target.key].y + (dy / window.innerHeight) * 100, 0, 100));
          }
          if (target.key === 'homeCluster') _lastScrollY = 0;
          scheduleLayoutEditorFrame(true);
        };
        const up = () => {
          _layoutDragging = false;
          document.body.classList.remove('ag-layout-dragging');
          scheduleLayoutEditorFrame(true);
          dragEl.removeEventListener('pointermove', move);
          dragEl.removeEventListener('pointerup', up);
          dragEl.removeEventListener('pointercancel', up);
        };
        dragEl.addEventListener('pointermove', move);
        dragEl.addEventListener('pointerup', up);
        dragEl.addEventListener('pointercancel', up);
      };
      handle.addEventListener('pointerdown', beginDrag);
      ghost.addEventListener('pointerdown', beginDrag);
    });

    overlay.querySelector('#ag-layout-save').addEventListener('click', () => {
      saveLayout(_layoutDraft);
      applyLayout(_layoutDraft);
      stopLayoutEditor();
      Spicetify.showNotification("AmbientGlass: Layout saved");
    });
    overlay.querySelector('#ag-layout-reset').addEventListener('click', () => {
      _layoutDraft = cloneLayout(DEFAULT_LAYOUT);
      localStorage.removeItem('ag-layout');
      positionLayoutHandles();
    });
    overlay.querySelector('#ag-layout-cancel').addEventListener('click', stopLayoutEditor);
    window.addEventListener('resize', positionLayoutHandles);
    setTimeout(positionLayoutHandles, 50);
  }

  function stopLayoutEditor() {
    const previewJam = document.querySelector('#ag-jam-floating-pill[data-ag-preview="true"]');
    previewJam?.remove();
    if (_layoutFrame) {
      cancelAnimationFrame(_layoutFrame);
      _layoutFrame = 0;
    }
    document.getElementById('ag-layout-overlay')?.remove();
    document.body.classList.remove('ag-layout-editing');
    document.body.classList.remove('ag-layout-dragging');
    _layoutEditMode = false;
    _layoutDragging = false;
    _layoutDraft = null;
    applyLayout(getLayout());
    updateVisibility();
    restoreNativeSidebar();
    window.removeEventListener('resize', positionLayoutHandles);
  }

  const DEFAULTS = {
    glow: '#7b5fdb', s1: '#7b5fdb', s2: '#4f8edb', accent: '#7b5fdb',
    home: '#1DB954', liked: '#ff4b4b', albums: '#4b9eff', playlists: '#b34bff', artists: '#ffcc4b',
    btn_bg: 'rgba(20, 18, 38, 0.65)', btn_icon: '#f0f0ff', blobs: '#7b5fdb',
    now_mode: 'colored', now_gradient_enabled: 'false', now_color: '#2a2034', now_color_2: '#5b3d7a', now_gradient_angle: '135', now_gradient_position: '50', now_gradient_blend: '36', now_brightness: '72', now_frost: '52',
    now_width: '860', now_height: '80', now_radius: '40', cover_spin: 'false',
    sidebar_song_bg: 'true', sidebar_bg_strength: '60',
    glow_opacity: '0.8', glow_size: '155', blobs_opacity: '0.25',
    glass_reflection: 'true', glass_blur: '24',
    performance_mode: 'false'
  };

  function getSetting(key) { 
    const saved = localStorage.getItem('ag-setting-' + key);
    if (saved !== null) return saved;
    return DEFAULTS[key];
  }

  function getNumericSetting(key, fallback, min = -Infinity, max = Infinity) {
    const value = Number(getSetting(key));
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
  }

  function isNowGradientEnabled() {
    if (getSetting('now_mode') === 'transparent' || getSetting('now_mode') === 'frosted') return false;
    const saved = localStorage.getItem('ag-setting-now_gradient_enabled');
    if (saved !== null) return saved === 'true';
    return getSetting('now_mode') === 'gradient';
  }

  function isPerformanceMode() {
    return getSetting('performance_mode') === 'true';
  }

  function stripCloneIds(root) {
    root.querySelectorAll?.('[id]').forEach(el => el.removeAttribute('id'));
  }

  function updateNowPlayingPreviewClone() {
    if (!document.body?.classList.contains('ag-now-preview')) return;
    const source = document.querySelector('.Root__now-playing-bar');
    if (!source) return;
    let preview = document.getElementById('ag-now-playing-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'ag-now-playing-preview';
      preview.setAttribute('aria-hidden', 'true');
      document.body.appendChild(preview);
    }
    const clone = source.cloneNode(true);
    stripCloneIds(clone);
    clone.classList.add('ag-now-preview-clone');
    preview.replaceChildren(clone);
  }

  function setNowPlayingPreview(enabled) {
    document.body?.classList.toggle('ag-now-preview', !!enabled);
    if (enabled) {
      updateNowPlayingPreviewClone();
      setTimeout(updateNowPlayingPreviewClone, 80);
    } else {
      document.getElementById('ag-now-playing-preview')?.remove();
    }
  }

  const ONBOARDING_SEEN_KEY = 'ag-onboarding-seen';
  const ONBOARDING_SLIDES = [
    {
      kicker: 'Start',
      title: 'Welcome to AmbientGlass',
      text: 'A lighter glass layer for Spotify with floating controls, quick access, and a performance mode for weaker PCs.'
    },
    {
      kicker: 'Home Cluster',
      title: 'Fast navigation',
      text: 'Hover the home button to open Liked Songs, Albums, Playlists, and Artists without digging through Spotify menus.'
    },
    {
      kicker: 'Search',
      title: 'Ambient Search',
      text: 'Use the centered search bar or Ctrl+K to jump into search. The floating layout can be moved from Settings.'
    },
    {
      kicker: 'Performance',
      title: 'Keep it smooth',
      text: 'Performance Mode reduces heavy blur, shadows, hover effects, and background polling when a system needs more headroom.'
    },
    {
      kicker: 'Profile Dock',
      title: 'Settings and addons',
      text: 'Hover your profile picture to open the AmbientGlass dock with Settings, Marketplace, Listening Stats, and more installed addons.'
    }
  ];

  function hasSeenOnboarding() {
    return localStorage.getItem(ONBOARDING_SEEN_KEY) === 'true';
  }

  function markOnboardingSeen() {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  }

  function showOnboarding(force = false) {
    if (!force && hasSeenOnboarding()) return;
    document.getElementById('ag-onboarding')?.remove();

    let index = 0;
    const overlay = document.createElement('div');
    overlay.id = 'ag-onboarding';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ag-onboarding-title');

    overlay.innerHTML = `
      <div class="ag-onboarding-backdrop"></div>
      <div class="ag-onboarding-card">
        <div class="ag-onboarding-topline">
          <span class="ag-onboarding-kicker"></span>
          <button class="ag-onboarding-close" type="button" aria-label="Close introduction">${svg(ICONS.close, {size:16})}</button>
        </div>
        <div class="ag-onboarding-mark" aria-hidden="true">AG</div>
        <h2 id="ag-onboarding-title"></h2>
        <p class="ag-onboarding-copy"></p>
        <div class="ag-onboarding-dots" aria-label="Introduction progress"></div>
        <div class="ag-onboarding-actions">
          <button class="ag-onboarding-skip" type="button">Skip</button>
          <button class="ag-onboarding-next" type="button">Next</button>
        </div>
      </div>
    `;

    const close = (seen = true) => {
      if (seen) markOnboardingSeen();
      overlay.remove();
      document.body?.classList.remove('ag-onboarding-open');
      document.removeEventListener('keydown', onKeydown, true);
    };

    const render = () => {
      const slide = ONBOARDING_SLIDES[index];
      overlay.querySelector('.ag-onboarding-kicker').textContent = slide.kicker;
      overlay.querySelector('#ag-onboarding-title').textContent = slide.title;
      overlay.querySelector('.ag-onboarding-copy').textContent = slide.text;
      overlay.querySelector('.ag-onboarding-next').textContent = index === ONBOARDING_SLIDES.length - 1 ? 'Got it' : 'Next';
      overlay.querySelector('.ag-onboarding-dots').innerHTML = ONBOARDING_SLIDES.map((_, i) => (
        `<button type="button" class="${i === index ? 'active' : ''}" aria-label="Go to introduction step ${i + 1}"></button>`
      )).join('');
      overlay.querySelectorAll('.ag-onboarding-dots button').forEach((button, i) => {
        button.addEventListener('click', () => {
          index = i;
          render();
        });
      });
    };

    const onKeydown = event => {
      if (event.key === 'Escape') close(true);
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (index < ONBOARDING_SLIDES.length - 1) {
          index += 1;
          render();
        } else {
          close(true);
        }
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        index -= 1;
        render();
      }
    };

    overlay.querySelector('.ag-onboarding-close')?.addEventListener('click', () => close(true));
    overlay.querySelector('.ag-onboarding-skip')?.addEventListener('click', () => close(true));
    overlay.querySelector('.ag-onboarding-next')?.addEventListener('click', () => {
      if (index < ONBOARDING_SLIDES.length - 1) {
        index += 1;
        render();
      } else {
        close(true);
      }
    });
    overlay.addEventListener('pointerdown', event => {
      if (event.target === overlay.querySelector('.ag-onboarding-backdrop')) close(true);
    });

    document.body?.appendChild(overlay);
    document.body?.classList.add('ag-onboarding-open');
    document.addEventListener('keydown', onKeydown, true);
    render();
    setTimeout(() => overlay.querySelector('.ag-onboarding-next')?.focus(), 30);
  }

  function openSettingsPanel() {
    if (document.getElementById('ag-settings-panel')) return;
    const d = document.createElement('div'); d.id = 'ag-settings-panel';
    document.body?.classList.add('ag-settings-open');
    localStorage.removeItem('ag-privacy');
    document.getElementById('ag-privacy-logic')?.remove();
    const tip = text => `<button class="ag-setting-help" type="button" aria-label="${text}" title="${text}">?</button>`;
    
    d.innerHTML = `
      <div class="ag-settings-wrapper">
        <div class="ag-settings-content">
          <div class="ag-settings-header">
            <h3>Theme Settings</h3>
            <button id="ag-settings-close" type="button">${svg(ICONS.close, {size:16})}</button>
          </div>
          
          <div class="ag-settings-tabs">
            <button class="ag-tab-btn active" data-tab="general">General</button>
            <button class="ag-tab-btn" data-tab="cluster">Cluster</button>
            <button class="ag-tab-btn" data-tab="search">Search</button>
            <button class="ag-tab-btn" data-tab="layout">Layout</button>
            <button class="ag-tab-btn" data-tab="ui">UI & Accent</button>
          </div>

            <div class="ag-settings-body">
              <div class="ag-tab-content active" id="tab-general">
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Color</label>${tip('Main ambient glow color used across the home view and glass tint.')}</span><input type="color" id="ag-col-glow" value="${getSetting('glow')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Intensity</label>${tip('Controls how visible the large background glow is.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-glow_opacity" min="0" max="1" step="0.05" value="${getSetting('glow_opacity')}"/><span id="ag-glow-opacity-value">${Math.round(Number(getSetting('glow_opacity')) * 100)}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Hero Glow Size</label>${tip('Changes how wide and tall the main background glow spreads.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-glow_size" min="60" max="220" step="5" value="${getSetting('glow_size')}"/><span id="ag-glow-size-value">${getSetting('glow_size')}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Background Glow Color</label>${tip('Color used by the soft background glow.')}</span><input type="color" id="ag-col-blobs" value="${getSetting('blobs')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Background Glow Intensity</label>${tip('Controls the strength of the soft background glow.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-blobs_opacity" min="0" max="1" step="0.05" value="${getSetting('blobs_opacity')}"/><span id="ag-blobs-opacity-value">${Math.round(Number(getSetting('blobs_opacity')) * 100)}%</span></div></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Song Sidebar BG</label>${tip('Uses the current cover as a blurred frosted background in the right sidebar.')}</span><input type="checkbox" id="ag-check-sidebar_song_bg" ${getSetting('sidebar_song_bg') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Sidebar BG Strength</label>${tip('Adjusts how strongly the cover colors show through the sidebar glass.')}</span><input type="range" id="ag-range-sidebar_bg_strength" min="0" max="100" step="5" value="${getSetting('sidebar_bg_strength')}"/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>FrostedGlass/Glass</label>${tip('Adds a stronger reflective border and inset shine to glass surfaces.')}</span><input type="checkbox" id="ag-check-glass_reflection" ${getSetting('glass_reflection') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Frosted Glass Blur</label>${tip('Controls blur amount for AmbientGlass glass panels.')}</span><input type="range" id="ag-range-glass_blur" min="0" max="80" step="2" value="${getSetting('glass_blur')}"/></div>
              <div class="ag-setting-item ag-performance-setting"><span class="ag-setting-label"><label>Performance Mode</label><span class="ag-beta-sticker" aria-label="Beta">BETA</span>${tip('Reduces heavy blur, shadows, hover effects, and background polling for smoother use on weaker PCs.')}</span><input type="checkbox" id="ag-check-performance_mode" ${isPerformanceMode() ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><span class="ag-setting-label"><label>Introduction</label>${tip('Shows the AmbientGlass first-run introduction again.')}</span><button id="ag-show-onboarding" type="button">Show</button></div>
            </div>

            <div class="ag-tab-content" id="tab-cluster">
              <div class="ag-setting-item"><label>Home Button (Glow)</label><input type="color" id="ag-col-home" value="${getSetting('home')}"/></div>
              <div class="ag-setting-item"><label>Liked Songs (Glow)</label><input type="color" id="ag-col-liked" value="${getSetting('liked')}"/></div>
              <div class="ag-setting-item"><label>Albums (Glow)</label><input type="color" id="ag-col-albums" value="${getSetting('albums')}"/></div>
              <div class="ag-setting-item"><label>Playlists (Glow)</label><input type="color" id="ag-col-playlists" value="${getSetting('playlists')}"/></div>
              <div class="ag-setting-item"><label>Artists (Glow)</label><input type="color" id="ag-col-artists" value="${getSetting('artists')}"/></div>
            </div>

            <div class="ag-tab-content" id="tab-search">
              <div class="ag-setting-item"><label>Search Color 1</label><input type="color" id="ag-col-s1" value="${getSetting('s1')}"/></div>
              <div class="ag-setting-item"><label>Search Color 2</label><input type="color" id="ag-col-s2" value="${getSetting('s2')}"/></div>
            </div>

            <div class="ag-tab-content" id="tab-layout">
              <div class="ag-setting-item ag-layout-change-setting"><span class="ag-setting-label"><label>Move AmbientGlass Layout</label><span class="ag-note-sticker" aria-label="Note">BETA</span></span><button id="ag-change-layout" type="button">Change</button></div>
              <div class="ag-setting-item"><label>Reset Saved Layout</label><button id="ag-reset-layout" type="button">Reset</button></div>
            </div>

            <div class="ag-tab-content" id="tab-ui">
              <div class="ag-gradient-builder" data-gradient-enabled="${isNowGradientEnabled()}" data-now-mode="${getSetting('now_mode')}">
                <div class="ag-settings-section">
                  <div class="ag-settings-section-title">Basics</div>
                  <div class="ag-setting-item"><label>Accent Color (Like/UI)</label><input type="color" id="ag-col-accent" value="${getSetting('accent')}"/></div>
                  <div class="ag-setting-item"><label>Now Playing Color</label><input type="color" id="ag-col-now_color" value="${getSetting('now_color')}"/></div>
                  <div class="ag-setting-item"><label>Bar Style</label><select id="ag-select-now_mode"><option value="transparent" ${getSetting('now_mode') === 'transparent' ? 'selected' : ''}>Normal glass</option><option value="frosted" ${getSetting('now_mode') === 'frosted' ? 'selected' : ''}>Frosted glass</option><option value="colored" ${getSetting('now_mode') !== 'transparent' && getSetting('now_mode') !== 'frosted' ? 'selected' : ''}>Colored glass</option></select></div>
                  <div class="ag-setting-item"><label>Gradient</label><input type="checkbox" id="ag-check-now_gradient_enabled" ${isNowGradientEnabled() ? 'checked' : ''}/></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Spinning Cover</label>${tip('Turns the player and sidebar cover art into a slow rotating circle.')}</span><input type="checkbox" id="ag-check-cover_spin" ${getSetting('cover_spin') === 'true' ? 'checked' : ''}/></div>
                </div>
                <div class="ag-settings-section">
                  <div class="ag-settings-section-title">Player</div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Width</label>${tip('Changes the floating song player width in pixels.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_width" min="520" max="1120" step="20" value="${getSetting('now_width')}"/><span id="ag-now-width-value">${getSetting('now_width')}px</span></div></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Height</label>${tip('Changes the floating song player height in pixels.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_height" min="62" max="110" step="2" value="${getSetting('now_height')}"/><span id="ag-now-height-value">${getSetting('now_height')}px</span></div></div>
                  <div class="ag-setting-item"><span class="ag-setting-label"><label>Player Radius</label>${tip('Rounds the song player. Higher values make it pill shaped.')}</span><div class="ag-angle-control"><input type="range" id="ag-range-now_radius" min="8" max="56" step="2" value="${getSetting('now_radius')}"/><span id="ag-now-radius-value">${getSetting('now_radius')}px</span></div></div>
                  <div class="ag-setting-item ag-frosted-only"><label>Frosted Strength</label><div class="ag-angle-control"><input type="range" id="ag-range-now_frost" min="0" max="100" step="2" value="${getSetting('now_frost')}"/><span id="ag-now-frost-value">${getSetting('now_frost')}%</span></div></div>
                </div>
                <div class="ag-settings-section ag-settings-section-wide">
                  <div class="ag-settings-section-title">Gradient</div>
                  <div class="ag-setting-item ag-gradient-only"><label>Second Color</label><input type="color" id="ag-col-now_color_2" value="${getSetting('now_color_2')}"/></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Gradient Angle</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_angle" min="0" max="360" step="5" value="${getSetting('now_gradient_angle')}"/><span id="ag-now-angle-value">${getSetting('now_gradient_angle')} deg</span></div></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Gradient Position</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_position" min="0" max="100" step="1" value="${getSetting('now_gradient_position')}"/><span id="ag-now-position-value">${getSetting('now_gradient_position')}%</span></div></div>
                  <div class="ag-setting-item ag-gradient-only"><label>Blend Width</label><div class="ag-angle-control"><input type="range" id="ag-range-now_gradient_blend" min="0" max="100" step="2" value="${getSetting('now_gradient_blend')}"/><span id="ag-now-blend-value">${getSetting('now_gradient_blend')}%</span></div></div>
                  <div class="ag-setting-item"><label>Glass Brightness</label><div class="ag-angle-control"><input type="range" id="ag-range-now_brightness" min="20" max="100" step="2" value="${getSetting('now_brightness')}"/><span id="ag-now-brightness-value">${getSetting('now_brightness')}%</span></div></div>
                  <div class="ag-gradient-preview" style="--ag-preview-angle:${getSetting('now_gradient_angle')}deg;--ag-preview-position:${getSetting('now_gradient_position')}%;--ag-preview-blend:${getNumericSetting('now_gradient_blend', 36, 0, 100)}%;--ag-preview-a:${getSetting('now_color')};--ag-preview-b:${getSetting('now_color_2')};--ag-preview-brightness:${getSetting('now_brightness')}%;"></div>
                </div>
               </div>
               <p style="font-size: 11px; opacity: 0.6; margin-top: 10px;">These options use AmbientGlass variables only and do not change Spotify spice text colors.</p>
            </div>
          </div>

          <div class="ag-settings-footer">
            <button id="ag-save-settings">Save & Apply</button>
            <button id="ag-reset-settings" style="background:rgba(255,255,255,0.05);color:#fff;margin-top:10px;">Reset to Defaults</button>
          </div>
        </div>
        <div class="ag-settings-preview-container">
          <div class="ag-preview-glow"></div>
          <div class="ag-settings-preview">
            <span>Glass Preview</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(d);
    d.querySelectorAll('.ag-setting-item').forEach((item, index) => {
      const label = item.querySelector('label');
      const control = item.querySelector('input, select, textarea, button:not(.ag-setting-help)');
      if (!label || !control) return;
      if (!control.id) control.id = `ag-setting-control-${index}`;
      label.setAttribute('for', control.id);
    });
    const closeSettings = () => {
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
    };
    d.querySelector('#ag-settings-close')?.addEventListener('click', closeSettings);

    // Tab Logic
    const tabs = d.querySelectorAll('.ag-tab-btn');
    const contents = d.querySelectorAll('.ag-tab-content');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        contents.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        d.querySelector('#tab-' + t.dataset.tab).classList.add('active');
        setNowPlayingPreview(t.dataset.tab === 'ui');
      });
    });

    d.querySelector('#ag-change-layout')?.addEventListener('click', () => {
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      startLayoutEditor();
    });
    d.querySelector('#ag-reset-layout')?.addEventListener('click', () => {
      localStorage.removeItem('ag-layout');
      _layoutDraft = null;
      applyLayout(getLayout());
      updateVisibility();
      Spicetify.showNotification("AmbientGlass: Layout reset");
    });
    d.querySelector('#ag-show-onboarding')?.addEventListener('click', () => showOnboarding(true));
    // Live update logic.
    const inputs = d.querySelectorAll('input, select');
    inputs.forEach(input => {
      const eventType = input.type === 'range' || input.type === 'color' ? 'input' : 'change';
      input.addEventListener(eventType, () => {
        const k = input.id.replace('ag-col-', '').replace('ag-range-', '').replace('ag-check-', '').replace('ag-select-', '');
            const val = input.type === 'checkbox' ? input.checked.toString() : input.value;
            localStorage.setItem('ag-setting-' + k, val);
            if (k === 'now_mode' && (val === 'transparent' || val === 'frosted')) {
              const gradientCheck = d.querySelector('#ag-check-now_gradient_enabled');
              if (gradientCheck) gradientCheck.checked = false;
              localStorage.setItem('ag-setting-now_gradient_enabled', 'false');
            }
            if (k === 'now_gradient_angle') d.querySelector('#ag-now-angle-value').textContent = val + ' deg';
            if (k === 'now_gradient_position') d.querySelector('#ag-now-position-value').textContent = val + '%';
            if (k === 'now_gradient_blend') d.querySelector('#ag-now-blend-value').textContent = val + '%';
            if (k === 'now_brightness') d.querySelector('#ag-now-brightness-value').textContent = val + '%';
            if (k === 'now_frost') d.querySelector('#ag-now-frost-value').textContent = val + '%';
            if (k === 'now_width') d.querySelector('#ag-now-width-value').textContent = val + 'px';
            if (k === 'now_height') d.querySelector('#ag-now-height-value').textContent = val + 'px';
            if (k === 'now_radius') d.querySelector('#ag-now-radius-value').textContent = val + 'px';
            if (k === 'glow_opacity') d.querySelector('#ag-glow-opacity-value').textContent = Math.round(Number(val) * 100) + '%';
            if (k === 'glow_size') d.querySelector('#ag-glow-size-value').textContent = val + '%';
            if (k === 'blobs_opacity') d.querySelector('#ag-blobs-opacity-value').textContent = Math.round(Number(val) * 100) + '%';
            const builder = d.querySelector('.ag-gradient-builder');
            if (builder) {
              builder.dataset.gradientEnabled = (d.querySelector('#ag-check-now_gradient_enabled')?.checked || false).toString();
              builder.dataset.nowMode = d.querySelector('#ag-select-now_mode')?.value || getSetting('now_mode');
            }
            const preview = d.querySelector('.ag-gradient-preview');
            if (preview) {
              preview.style.setProperty('--ag-preview-angle', (d.querySelector('#ag-range-now_gradient_angle')?.value || getSetting('now_gradient_angle')) + 'deg');
              preview.style.setProperty('--ag-preview-position', (d.querySelector('#ag-range-now_gradient_position')?.value || getSetting('now_gradient_position')) + '%');
              preview.style.setProperty('--ag-preview-blend', (d.querySelector('#ag-range-now_gradient_blend')?.value || getSetting('now_gradient_blend')) + '%');
              preview.style.setProperty('--ag-preview-a', d.querySelector('#ag-col-now_color')?.value || getSetting('now_color'));
              preview.style.setProperty('--ag-preview-b', d.querySelector('#ag-col-now_color_2')?.value || getSetting('now_color_2'));
              preview.style.setProperty('--ag-preview-brightness', (d.querySelector('#ag-range-now_brightness')?.value || getSetting('now_brightness')) + '%');
            }
            applyCustomColors();
            updateNowPlayingPreviewClone();
      });
    });

    d.querySelector('#ag-save-settings').addEventListener('click', () => {
      localStorage.removeItem('ag-privacy');
      document.getElementById('ag-privacy-logic')?.remove();
      Object.keys(DEFAULTS).forEach(k => {
        const el = d.querySelector('#ag-col-' + k) || d.querySelector('#ag-range-' + k) || d.querySelector('#ag-check-' + k) || d.querySelector('#ag-select-' + k);
        if (el) {
          const val = el.type === 'checkbox' ? el.checked.toString() : el.value;
          localStorage.setItem('ag-setting-' + k, val);
        }
      });
      
      // Live Apply!
      try {
        applyCustomColors();
      } catch(e) {}
      
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      Spicetify.showNotification("AmbientGlass: Applied");
    });
    d.querySelector('#ag-reset-settings').addEventListener('click', () => {
      localStorage.removeItem('ag-privacy');
      Object.keys(DEFAULTS).forEach(k => localStorage.removeItem('ag-setting-' + k));
      
      applyCustomColors();
      document.getElementById('ag-privacy-logic')?.remove();
      
      d.remove();
      document.body?.classList.remove('ag-settings-open');
      setNowPlayingPreview(false);
      Spicetify.showNotification("AmbientGlass: Reset to defaults");
    });
  }

  function applyCustomColors() {
    const glow = getSetting('glow');
    const s1 = getSetting('s1');
    const s2 = getSetting('s2');
    const bg = getSetting('bg');
    const home = getSetting('home');
    const liked = getSetting('liked');
    const albums = getSetting('albums');
    const playlists = getSetting('playlists');
    const artists = getSetting('artists');
    const accent = getSetting('accent');
    const selectedNowMode = getSetting('now_mode');
    const nowSurfaceMode = selectedNowMode === 'transparent' ? 'transparent' : selectedNowMode === 'frosted' ? 'frosted' : 'colored';
    const nowMode = isNowGradientEnabled() ? 'gradient' : nowSurfaceMode;
    const nowColor = getSetting('now_color');
    const nowColor2 = getSetting('now_color_2');
    const nowGradientAngle = getSetting('now_gradient_angle');
    const nowGradientPosition = getNumericSetting('now_gradient_position', 50, 0, 100);
    const nowGradientBlend = getNumericSetting('now_gradient_blend', 36, 0, 100);
    const nowBrightness = Math.max(20, Math.min(100, Number(getSetting('now_brightness')) || 72));
    const nowFrost = Math.max(0, Math.min(100, Number(getSetting('now_frost')) || 52));
    const nowWidth = Math.max(520, Math.min(1120, Number(getSetting('now_width')) || 860));
    const nowHeight = Math.max(62, Math.min(110, Number(getSetting('now_height')) || 80));
    const nowRadius = Math.max(8, Math.min(56, Number(getSetting('now_radius')) || 40));
    const coverSpin = getSetting('cover_spin') === 'true';
    const sidebarSongBg = getSetting('sidebar_song_bg') === 'true';
    const sidebarBgStrength = Math.max(0, Math.min(100, Number(getSetting('sidebar_bg_strength')) || 60));
    const btn_bg = getSetting('btn_bg');
    const btn_icon = getSetting('btn_icon');
    const blobs = getSetting('blobs');
    const glowOpacity = getSetting('glow_opacity');
    const glowSize = getNumericSetting('glow_size', 155, 60, 220);
    const blobsOpacity = getSetting('blobs_opacity');

    // Root Variables for Cluster & Glow
    const root = document.documentElement;
    root.style.setProperty('--ag-s1', s1);
    root.style.setProperty('--ag-s2', s2);
    root.style.setProperty('--ag-s3', s2);
    root.style.setProperty('--ag-accent-main', accent);
    root.style.setProperty('--ag-accent-1', accent);
    root.style.setProperty('--ag-accent-2', s2);
    root.style.setProperty('--ag-now-mode', nowMode);
    root.style.setProperty('--ag-now-color', nowColor);
    root.style.setProperty('--ag-now-color-2', nowColor2);
    root.style.setProperty('--ag-now-gradient-angle', nowGradientAngle + 'deg');
    root.style.setProperty('--ag-now-gradient-position', nowGradientPosition + '%');
    root.style.setProperty('--ag-now-gradient-blend', nowGradientBlend + '%');
    root.style.setProperty('--ag-now-brightness', nowBrightness + '%');
    root.style.setProperty('--ag-now-frost', nowFrost + '%');
    root.style.setProperty('--ag-now-width', nowWidth + 'px');
    root.style.setProperty('--ag-now-height', nowHeight + 'px');
    root.style.setProperty('--ag-now-radius', nowRadius + 'px');
    document.body?.classList.toggle('ag-cover-spin', coverSpin);
    document.body?.classList.toggle('ag-performance-mode', isPerformanceMode());
    root.style.setProperty('--ag-sidebar-cover-opacity', (sidebarBgStrength / 100).toFixed(2));
    root.style.setProperty('--ag-sidebar-cover-blur', (28 + sidebarBgStrength * 0.42).toFixed(0) + 'px');
    document.body?.classList.toggle('ag-sidebar-song-bg-disabled', !sidebarSongBg);
    root.style.setProperty('--ag-now-frost-blur', nowMode === 'frosted' ? (18 + nowFrost * 0.62).toFixed(0) + 'px' : 'var(--ag-glass-blur, 24px)');
    root.style.setProperty('--ag-now-frost-saturate', nowMode === 'frosted' ? (130 + nowFrost * 0.9).toFixed(0) + '%' : '180%');
    root.style.setProperty('--ag-now-glass-filter-brightness', (0.86 + nowBrightness / 300).toFixed(2));
    const nowBase = `rgba(8,7,14,${(0.88 - nowBrightness / 220).toFixed(2)})`;
    const nowGlass = 'linear-gradient(0deg, rgba(14, 12, 26, 0.42), rgba(14, 12, 26, 0.42))';
    const frostAlpha = (0.18 + nowFrost / 190).toFixed(2);
    const frostWhite = (nowFrost * 0.32).toFixed(1);
    const nowFrosted = `linear-gradient(135deg, color-mix(in srgb, rgba(255,255,255,${frostAlpha}) ${frostWhite}%, rgba(10,9,18,0.62)), rgba(12,10,20,${(0.34 + nowFrost / 260).toFixed(2)}))`;
    const nowSolid = `linear-gradient(0deg, color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase}), color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase}))`;
    const nowHalfBlend = nowGradientBlend / 2;
    const nowLeftStop = Math.max(0, nowGradientPosition - nowHalfBlend);
    const nowRightStop = Math.min(100, nowGradientPosition + nowHalfBlend);
    const nowA = `color-mix(in srgb, ${nowColor} ${nowBrightness}%, ${nowBase})`;
    const nowB = `color-mix(in srgb, ${nowColor2} ${nowBrightness}%, ${nowBase})`;
    const nowGradient = nowGradientBlend <= 0
      ? `linear-gradient(${nowGradientAngle}deg, ${nowA} 0%, ${nowA} ${nowGradientPosition}%, ${nowB} ${nowGradientPosition}%, ${nowB} 100%)`
      : `linear-gradient(${nowGradientAngle}deg, ${nowA} 0%, ${nowA} ${nowLeftStop}%, ${nowB} ${nowRightStop}%, ${nowB} 100%)`;
    const glowLeftStop = Math.max(0, nowGradientPosition - Math.max(nowHalfBlend, 30));
    const glowRightStop = Math.min(100, nowGradientPosition + Math.max(nowHalfBlend, 30));
    const nowGlowGlass = 'linear-gradient(90deg, var(--ag-surface-tint-soft, rgba(123,95,219,0.22)), color-mix(in srgb, var(--ag-s2, #4f8edb) 18%, transparent))';
    const nowGlowSolid = `linear-gradient(0deg, color-mix(in srgb, ${nowColor} 50%, transparent), color-mix(in srgb, ${nowColor} 50%, transparent))`;
    const nowGlowGradient = `linear-gradient(${nowGradientAngle}deg, color-mix(in srgb, ${nowColor} 52%, transparent) 0%, color-mix(in srgb, ${nowColor} 42%, ${nowColor2} 18%) ${glowLeftStop}%, color-mix(in srgb, ${nowColor} 30%, ${nowColor2} 30%) ${nowGradientPosition}%, color-mix(in srgb, ${nowColor2} 42%, ${nowColor} 18%) ${glowRightStop}%, color-mix(in srgb, ${nowColor2} 52%, transparent) 100%)`;
    root.style.setProperty('--ag-now-glass-bg', nowMode === 'gradient' ? nowGradient : nowMode === 'colored' ? nowSolid : nowMode === 'frosted' ? nowFrosted : nowGlass);
    root.style.setProperty('--ag-now-glow-bg', nowMode === 'gradient' ? nowGlowGradient : nowMode === 'colored' ? nowGlowSolid : nowMode === 'frosted' ? nowFrosted : nowGlowGlass);
    root.style.setProperty('--ag-now-glow-a', `color-mix(in srgb, ${nowColor} 52%, transparent)`);
    root.style.setProperty('--ag-now-glow-b', `color-mix(in srgb, ${nowMode === 'gradient' ? nowColor2 : nowColor} 52%, transparent)`);
    root.style.setProperty('--ag-now-glass-border', nowMode === 'transparent'
      ? 'rgba(255, 255, 255, 0.09)'
      : nowMode === 'frosted'
        ? `rgba(255, 255, 255, ${(0.12 + nowFrost / 380).toFixed(2)})`
      : 'rgba(255, 255, 255, 0.13)');
    root.style.setProperty('--ag-now-glass-glow', nowMode === 'gradient'
      ? `color-mix(in srgb, ${nowColor2} 36%, transparent)`
      : nowMode === 'colored'
        ? `color-mix(in srgb, ${nowColor} 42%, transparent)`
      : 'var(--ag-surface-tint-soft, rgba(123,95,219,0.18))');
    
    root.style.setProperty('--ag-col-home', home);
    root.style.setProperty('--ag-col-liked', liked);
    root.style.setProperty('--ag-col-albums', albums);
    root.style.setProperty('--ag-col-playlists', playlists);
    root.style.setProperty('--ag-col-artists', artists);
    root.style.setProperty('--ag-col-btn_bg', btn_bg);
    
    root.style.setProperty('--ag-ambient-color', glow);
    root.style.setProperty('--ag-glow-opacity', glowOpacity);
    root.style.setProperty('--ag-glow-size', glowSize + 'vw');
    root.style.setProperty('--ag-glow-height', Math.round(glowSize * 0.84) + 'vh');
    root.style.setProperty('--ag-blobs-opacity', blobsOpacity);
    root.style.setProperty('--ag-col-blobs', blobs);
    root.style.setProperty('--ag-surface-tint', `color-mix(in srgb, ${glow} 22%, transparent)`);
    root.style.setProperty('--ag-surface-tint-soft', `color-mix(in srgb, ${glow} 13%, transparent)`);
    root.style.setProperty('--ag-surface-tint-strong', `color-mix(in srgb, ${glow} 34%, transparent)`);
    root.style.setProperty('--ag-search-tint-a', `color-mix(in srgb, ${s1} 26%, transparent)`);
    root.style.setProperty('--ag-search-tint-b', `color-mix(in srgb, ${s2} 22%, transparent)`);
    
    const reflection = getSetting('glass_reflection') === 'true';
    const blur = getSetting('glass_blur');
    root.style.setProperty('--ag-glass-blur', blur + 'px');

    let s = document.getElementById('ag-dynamic-colors');
    if (!s) { s = document.createElement('style'); s.id = 'ag-dynamic-colors'; document.head.appendChild(s); }
    
    s.textContent = `
      :root { 
        --spice-button: ${accent} !important;
        --spice-button-active: ${accent} !important;
        --spice-accent: ${accent} !important;
      }
      html, body, .Root__top-container, .under-main-view { background: transparent !important; }
      #ag-startup-splash { background: transparent !important; }
      #ag-home-cluster,
      #ag-centered-search,
      #ag-jam-floating-pill {
        position: fixed !important;
        z-index: 30 !important;
      }
      #ag-centered-search {
        z-index: 9000 !important;
      }
      #ag-jam-floating-pill {
        width: auto !important;
        min-width: 92px !important;
        max-width: 220px !important;
        height: 34px !important;
        min-height: 34px !important;
        max-height: 34px !important;
        padding: 0 16px !important;
        border-radius: 999px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        background: rgba(123,95,219,0.72) !important;
        color: #fff !important;
        font-weight: 800 !important;
        font-size: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 18px rgba(123,95,219,0.28) !important;
      }
      #ag-jam-floating-pill.ag-jam-hidden {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      body.ag-layout-custom .Root__now-playing-bar {
        position: fixed !important;
        left: var(--ag-now-x, 50%) !important;
        top: var(--ag-now-y, 94%) !important;
        bottom: auto !important;
        transform: translate(-50%, -50%) !important;
        width: min(var(--ag-now-width, 860px), calc(100vw - 80px)) !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: var(--ag-now-height, 80px) !important;
        max-height: var(--ag-now-height, 80px) !important;
        background: none !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        border: 0 !important;
        overflow: visible !important;
        z-index: 80 !important;
      }
      body.ag-layout-custom .Root__now-playing-bar > * {
        position: relative !important;
        left: auto !important;
        top: auto !important;
        transform: none !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: min(var(--ag-now-width, 860px), calc(100vw - 80px)) !important;
        margin: 0 auto !important;
        z-index: 80 !important;
      }
      body.ag-layout-editing .Root__now-playing-bar,
      body.ag-layout-editing .Root__now-playing-bar > *,
      body.ag-now-preview .Root__now-playing-bar,
      body.ag-now-preview .Root__now-playing-bar > *,
      body:has(#ag-settings-panel) .Root__now-playing-bar,
      body:has(#ag-settings-panel) .Root__now-playing-bar > * {
        z-index: 2147483646 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      body.ag-now-preview .Root__top-container {
        z-index: 2147483645 !important;
        isolation: auto !important;
      }
      body.ag-now-preview .Root__now-playing-bar {
        position: fixed !important;
        bottom: 30px !important;
        top: auto !important;
      }
      body.ag-layout-custom .Root__now-playing-bar::before,
      body.ag-layout-custom .Root__now-playing-bar::after {
        display: none !important;
      }
      .ag-blob { background: ${blobs} !important; opacity: var(--ag-blobs-opacity) !important; }
      .ag-cluster-btn { background: ${btn_bg} !important; border: 1px solid rgba(255,255,255,0.05) !important; }

      /* CLUSTER COLORS - DEFAULT (WHITE) */
      .ag-cluster-btn svg { color: #fff !important; stroke: #fff !important; filter: none !important; opacity: 0.6; transition: all 0.3s ease !important; }
      .ag-cluster-btn.ag-cluster-liked svg { fill: #fff !important; stroke: none !important; }
      .ag-cluster-btn.ag-cluster-liked svg path { fill: #fff !important; }

      /* CLUSTER COLORS - HOVER INJECTION */
      html body .ag-cluster-btn.ag-home-main:hover { color: ${home} !important; }
      html body .ag-cluster-btn.ag-home-main:hover svg { stroke: ${home} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${home}cc) !important; }
      html body .ag-cluster-btn.ag-home-main:hover { box-shadow: 0 0 25px ${home}66 !important; border-color: ${home}88 !important; }

      html body .ag-cluster-btn.ag-cluster-liked:hover { color: ${liked} !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover svg { fill: ${liked} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${liked}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover svg path { fill: ${liked} !important; }
      html body .ag-cluster-btn.ag-cluster-liked:hover { box-shadow: 0 0 25px ${liked}66 !important; border-color: ${liked}88 !important; }

      html body .ag-cluster-btn.ag-cluster-albums:hover { color: ${albums} !important; }
      html body .ag-cluster-btn.ag-cluster-albums:hover svg { stroke: ${albums} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${albums}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-albums:hover { box-shadow: 0 0 25px ${albums}66 !important; border-color: ${albums}88 !important; }

      html body .ag-cluster-btn.ag-cluster-playlists:hover { color: ${playlists} !important; }
      html body .ag-cluster-btn.ag-cluster-playlists:hover svg { stroke: ${playlists} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${playlists}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-playlists:hover { box-shadow: 0 0 25px ${playlists}66 !important; border-color: ${playlists}88 !important; }

      html body .ag-cluster-btn.ag-cluster-artists:hover { color: ${artists} !important; }
      html body .ag-cluster-btn.ag-cluster-artists:hover svg { stroke: ${artists} !important; opacity: 1 !important; filter: drop-shadow(0 0 3px ${artists}cc) !important; }
      html body .ag-cluster-btn.ag-cluster-artists:hover { box-shadow: 0 0 25px ${artists}66 !important; border-color: ${artists}88 !important; }




      #ag-centered-search { will-change: transform, opacity !important; }
      #ag-centered-search:hover .ag-pill-search { transform: scale(1.03) !important; }
      
      #ag-centered-search:hover .ag-ring { opacity: 0.8 !important; border-color: rgba(255, 255, 255, 0.2) !important; }
      #ag-centered-search:hover .ag-pill-search { border-color: rgba(255, 255, 255, 0.15) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important; }
      
      .ag-albums:hover { box-shadow: 0 0 25px ${albums}44 !important; border-color: ${albums}66 !important; }
      .ag-albums:hover svg { stroke: ${albums} !important; }
      .ag-playlists:hover { box-shadow: 0 0 25px ${playlists}44 !important; border-color: ${playlists}66 !important; }
      .ag-playlists:hover svg { stroke: ${playlists} !important; }
      .ag-artists:hover { box-shadow: 0 0 25px ${artists}44 !important; border-color: ${artists}66 !important; }
      .ag-artists:hover svg { stroke: ${artists} !important; }

      #ag-settings-panel .ag-settings-tabs {
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 8px !important;
        overflow: visible !important;
      }
      #ag-settings-panel .ag-tab-btn {
        min-width: 0 !important;
        max-width: none !important;
        white-space: normal !important;
        text-align: center !important;
      }
      #ag-settings-panel .ag-setting-item button:not(.ag-setting-help),
      #ag-settings-panel #ag-change-layout,
      #ag-settings-panel #ag-reset-layout {
        min-width: 92px !important;
        min-height: 32px !important;
        padding: 0 14px !important;
        border-radius: 7px !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        background: rgba(123,95,219,0.72) !important;
        color: #fff !important;
        font-weight: 800 !important;
        box-shadow: 0 8px 18px rgba(0,0,0,0.25) !important;
      }

      /* Spotify Native UI Skining */
      .main-addButton-button[aria-checked="true"], 
      .main-addButton-active,
      .main-playButton-PlayButton,
      .epS_o7V0M0_As_9V_970,
      button[aria-checked="true"] svg {
        color: ${accent} !important;
        fill: ${accent} !important;
      }
      .x-progressBar-fillColor { background-color: ${accent} !important; }

      /* Glass settings injection - high-specificity overrides */
      html body .ag-pill-search, 
      html body .ag-cluster-btn, 
      html body #ag-lib-panel, 
      html body .view-homeShortcutsGrid-shortcut, 
      html body .main-contextMenu-menu, 
      html body [data-testid="context-menu"],
      html body .ag-settings-preview {
        backdrop-filter: blur(${blur}px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(${blur}px) saturate(180%) !important;
        ${reflection ? `
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 10px 40px rgba(0,0,0,0.4) !important;
        ` : `
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        `}
      }

      /* Context menu playlist submenu: keep long playlist lists inside the menu */
      html body .main-contextMenu-tippy {
        overflow: visible !important;
      }
      html body .main-contextMenu-menu:has(.main-contextMenu-subMenuIcon),
      html body .main-contextMenu-menu:has([aria-haspopup="menu"]),
      html body [role="menu"]:has(.main-contextMenu-subMenuIcon),
      html body [role="menu"]:has([aria-haspopup="menu"]) {
        max-height: none !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
      }
      html body .main-contextMenu-menu.ag-context-parent,
      html body [role="menu"].ag-context-parent,
      html body [data-radix-menu-content].ag-context-parent {
        max-height: none !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
      }
      html body .main-contextMenu-menu.ag-scrollable-submenu,
      html body [role="menu"].ag-scrollable-submenu,
      html body [data-radix-menu-content].ag-scrollable-submenu {
        height: min(460px, calc(100vh - 32px)) !important;
        max-height: min(460px, calc(100vh - 32px)) !important;
        overflow-y: scroll !important;
        overflow-x: hidden !important;
        display: block !important;
        overscroll-behavior: contain !important;
        scrollbar-gutter: stable !important;
        clip-path: inset(0 round 8px) !important;
        contain: paint !important;
      }
      html body .ag-scrollable-submenu-root {
        max-height: min(460px, calc(100vh - 32px)) !important;
        overflow: hidden !important;
        overscroll-behavior: contain !important;
        clip-path: inset(0 round 8px) !important;
        contain: paint !important;
      }
      html body #ag-submenu-scrollwrap {
        display: contents !important;
      }
      html body .main-contextMenu-menu.ag-scrollable-submenu > *,
      html body [role="menu"].ag-scrollable-submenu > *,
      html body [data-radix-menu-content].ag-scrollable-submenu > * {
        flex-shrink: 0 !important;
      }
    `;
  }

  function hideAboutArtistCards() {
    const sidebar = document.querySelector('.Root__right-sidebar, [data-testid="right-sidebar"], aside[data-testid="right-sidebar"]');
    if (!sidebar) return;
    const candidates = Array.from(sidebar.querySelectorAll('section, article, div, [role="region"]'));
    candidates.forEach(el => {
      const ownText = (el.innerText || el.textContent || '').trim().toLowerCase();
      if (!ownText.startsWith('about the artist') && !ownText.startsWith('uber den kunstler') && !ownText.startsWith('über den künstler')) return;
      const card = el.closest('.main-nowPlayingView-section, [class*="nowPlayingView_section"], section, article') || el;
      card.dataset.agHiddenAboutArtist = 'true';
      card.style.setProperty('display', 'none', 'important');
      card.style.setProperty('visibility', 'hidden', 'important');
      card.style.setProperty('height', '0', 'important');
      card.style.setProperty('min-height', '0', 'important');
      card.style.setProperty('max-height', '0', 'important');
      card.style.setProperty('margin', '0', 'important');
      card.style.setProperty('padding', '0', 'important');
      card.style.setProperty('overflow', 'hidden', 'important');
      card.style.setProperty('pointer-events', 'none', 'important');
    });
  }
  function injectSettingsToMenu() {
    const menus = Array.from(document.querySelectorAll('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content]'));
    const menu = menus.find(m => {
      const text = (m.textContent || '').toLowerCase();
      return text.includes('account') || text.includes('profile') || text.includes('log out') || text.includes('settings');
    });
    if (menu && !menu.querySelector('#ag-menu-item')) {
      document.querySelectorAll('#ag-menu-item').forEach(item => {
        if (!item.closest('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content]')) item.remove();
      });
      menu.classList.add('ag-user-menu');
      const item = document.createElement(menu.tagName === 'UL' ? 'li' : 'div'); item.id = 'ag-menu-item'; item.className = 'main-contextMenu-menuItem';
      item.innerHTML = `<button class="main-contextMenu-menuItemButton"><span class="main-contextMenu-listItemText">AmbientGlass Settings</span>${svg(ICONS.home, {size:16})}</button>`;
      item.addEventListener('click', () => { const b = document.querySelector('.main-contextMenu-backdrop'); if (b) b.click(); openSettingsPanel(); });
      menu.insertBefore(item, menu.firstChild);
    }
  }

  function fixSubmenuScrollLegacyUnused() {
    const menus = document.querySelectorAll('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content]');
    const menuSelector = 'ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content]';
    const applyPlaylistScroll = (menu, root) => {
      if (!menu) return;
      menu.classList.add('ag-scrollable-submenu');
      menu.classList.remove('ag-context-parent');
      const rect = (root || menu).getBoundingClientRect();
      const top = Math.max(16, rect.top || 16);
      const maxHeight = Math.min(460, Math.max(220, window.innerHeight - top - 16));
      const floatingRoot = root || menu.closest('[data-tippy-root], .main-contextMenu-tippy');

      if (floatingRoot) {
        floatingRoot.style.setProperty('max-height', `${maxHeight}px`, 'important');
        floatingRoot.style.setProperty('overflow-y', 'auto', 'important');
        floatingRoot.style.setProperty('overflow-x', 'hidden', 'important');
        floatingRoot.style.setProperty('overscroll-behavior', 'contain', 'important');
        floatingRoot.classList.add('ag-scrollable-submenu-root');
      }

      menu.style.setProperty('max-height', `${maxHeight}px`, 'important');
      menu.style.removeProperty('height');
      menu.style.setProperty('overflow-y', 'auto', 'important');
      menu.style.setProperty('overflow-x', 'hidden', 'important');
      menu.style.setProperty('overscroll-behavior', 'contain', 'important');

      const viewport = menu.querySelector('[data-radix-scroll-area-viewport], [data-overlayscrollbars-viewport]') ||
                       floatingRoot?.querySelector?.('[data-radix-scroll-area-viewport], [data-overlayscrollbars-viewport]');
      if (viewport) {
        viewport.style.setProperty('max-height', `${maxHeight}px`, 'important');
        viewport.style.setProperty('min-height', '0', 'important');
        viewport.style.setProperty('overflow-y', 'auto', 'important');
        viewport.style.setProperty('overflow-x', 'hidden', 'important');
      }

      const wheelTarget = floatingRoot || menu;
      if (wheelTarget && !wheelTarget.dataset.agWheelHooked) {
        wheelTarget.dataset.agWheelHooked = 'true';
        wheelTarget.addEventListener('wheel', ev => {
          if (!menu.classList.contains('ag-scrollable-submenu')) return;
          const scroller = viewport || floatingRoot || menu;
          scroller.scrollTop += ev.deltaY;
          ev.preventDefault();
          ev.stopPropagation();
        }, { passive: false, capture: true });
      }
    };

    menus.forEach(menu => {
      const text = (menu.textContent || '').toLowerCase();
      const ownsInput = Array.from(menu.querySelectorAll('input')).some(input => input.closest(menuSelector) === menu) ||
                        Array.from(menu.querySelectorAll('input')).some(input => `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`.toLowerCase().includes('playlist'));
      const inputText = Array.from(menu.querySelectorAll('input'))
        .filter(input => input.closest(menuSelector) === menu)
        .map(input => `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`)
        .join(' ')
        .toLowerCase();
      const hasPlaylistSearch = ownsInput && (
        text.includes('find a playlist') ||
        text.includes('playlist suchen') ||
        text.includes('new playlist') ||
        text.includes('neue playlist') ||
        inputText.includes('playlist')
      );
      if (!hasPlaylistSearch) {
        menu.classList.remove('ag-scrollable-submenu');
        const wrap = menu.querySelector(':scope > #ag-submenu-scrollwrap');
        if (wrap) {
          Array.from(wrap.children).forEach(child => menu.insertBefore(child, wrap));
          wrap.remove();
        }
        const hasSubmenuTrigger = !!menu.querySelector('.main-contextMenu-subMenuIcon, [aria-haspopup="menu"], [aria-expanded="true"]');
        menu.classList.toggle('ag-context-parent', hasSubmenuTrigger);
        if (hasSubmenuTrigger) {
          menu.style.removeProperty('max-height');
          menu.style.removeProperty('height');
          menu.style.removeProperty('clip-path');
          menu.style.removeProperty('contain');
          menu.style.setProperty('overflow', 'visible', 'important');
          menu.style.setProperty('overflow-y', 'visible', 'important');
          menu.style.setProperty('overflow-x', 'visible', 'important');
        } else {
          menu.style.removeProperty('overflow');
          menu.style.removeProperty('overflow-y');
          menu.style.removeProperty('overflow-x');
        }
        return;
      }

      applyPlaylistScroll(menu);
    });

    document.querySelectorAll('input').forEach(input => {
      const inputText = `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`.toLowerCase();
      if (!inputText.includes('playlist')) return;
      const root = input.closest('[data-tippy-root], .main-contextMenu-tippy');
      const menu = input.closest(menuSelector) || root?.querySelector(menuSelector);
      applyPlaylistScroll(menu, root);
    });
  }

  function getActiveJamInfo() {
    const isVisible = el => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };
    const visibleStartJam = Array.from(document.querySelectorAll('button')).find(btn => {
      if (!isVisible(btn)) return false;
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.toLowerCase();
      return label.includes('start a jam');
    });

    const sidebarJam = Array.from(document.querySelectorAll('.Root__right-sidebar, [data-testid="right-sidebar"], [class*="queue"], [data-testid="queue-page"]'))
      .find(panel => {
        if (!isVisible(panel)) return false;
        const rect = panel.getBoundingClientRect();
        const text = (panel.innerText || panel.textContent || '').toLowerCase();
        const hasEnd = Array.from(panel.querySelectorAll('button')).some(btn => {
          if (!isVisible(btn)) return false;
          const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.toLowerCase().trim();
          return label === 'end' || label.startsWith('end ') || label.includes('jam beenden');
        });
        const hasStart = Array.from(panel.querySelectorAll('button')).some(btn => {
          if (!isVisible(btn)) return false;
          const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.toLowerCase();
          return label.includes('start a jam');
        });
        const looksLikeActiveJam = text.includes("'s jam") || text.includes('\u2019s jam') || text.includes('jam\n') || text.includes('jam\r');
        return rect.width > 0 && rect.height > 0 && text.includes('jam') && !hasStart && (hasEnd || looksLikeActiveJam);
      });
    if (sidebarJam) {
      const line = (sidebarJam.innerText || '').split('\n').find(x => x.toLowerCase().includes('jam'));
      return { el: sidebarJam, text: line || 'Jam Active' };
    }

    const candidates = Array.from(document.querySelectorAll('.main-connectBar-connectBar, [class*="connectBar"], [class*="Jam"], [data-testid*="jam" i]'))
      .filter(el => isVisible(el) || el.dataset?.agNativeJam === 'true' || String(el.className || '').includes('connectBar-connected'));
    const endJamButton = Array.from(document.querySelectorAll('button')).find(btn => {
      if (!isVisible(btn)) return false;
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.toLowerCase();
      return label.includes('end') && label.includes('jam');
    });
    if (visibleStartJam && !endJamButton) return null;
    if (endJamButton) {
      const panel = endJamButton.closest('.Root__right-sidebar, [data-testid="right-sidebar"], [class*="connectBar"], [class*="Jam"]') || endJamButton.parentElement;
      return { el: panel, text: (panel?.innerText || 'Jam Active').split('\n').find(line => line.toLowerCase().includes('jam')) || 'Jam Active' };
    }
    for (const el of candidates) {
      const text = (el.innerText || el.textContent || '').trim();
      const lower = text.toLowerCase();
      if (!lower.includes('jam')) continue;
      if (lower.includes('start a jam') || lower.includes('invite others') || lower.includes('invite friends')) continue;
      if (lower.includes('connect to a device')) continue;
      return { el, text: text || 'Jam Active' };
    }
    return null;
  }

  function fixSubmenuScroll() {
    const candidates = new Set();
    const menuSelector = 'ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content], [data-testid="context-menu"]';

    document.querySelectorAll('input').forEach(input => {
      const inputText = `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''} ${input.value || ''}`.toLowerCase();
      if (!inputText.includes('playlist')) return;

      let node = input.closest(menuSelector) || input.parentElement;
      for (let i = 0; node && node !== document.body && i < 10; i++, node = node.parentElement) {
        const text = (node.textContent || '').toLowerCase();
        const rect = node.getBoundingClientRect();
        const isUsefulSize = rect.width >= 180 && rect.width <= 520 && rect.height >= 80;
        if (isUsefulSize && (text.includes('new playlist') || text.includes('neue playlist') || text.includes('find a playlist') || text.includes('playlist suchen'))) {
          candidates.add(node);
          break;
        }
      }
    });

    document.querySelectorAll('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content], [data-testid="context-menu"]').forEach(menu => {
      const text = (menu.textContent || '').toLowerCase();
      if ((text.includes('find a playlist') || text.includes('playlist suchen')) &&
          (text.includes('new playlist') || text.includes('neue playlist'))) {
        candidates.add(menu);
      }
    });

    candidates.forEach(menu => {
      if (!menu || menu === document.body) return;

      menu.classList.add('ag-scrollable-submenu');
      const rect = menu.getBoundingClientRect();
      const maxHeight = Math.min(460, Math.max(220, window.innerHeight - Math.max(12, rect.top || 12) - 16));
      menu.style.setProperty('max-height', `${maxHeight}px`, 'important');
      menu.style.setProperty('height', 'auto', 'important');
      menu.style.setProperty('display', 'flex', 'important');
      menu.style.setProperty('flex-direction', 'column', 'important');
      menu.style.setProperty('overflow', 'hidden', 'important');
      menu.style.setProperty('overscroll-behavior', 'contain', 'important');
      menu.style.setProperty('scrollbar-gutter', 'stable', 'important');
      menu.style.setProperty('position', 'relative', 'important');

      const floatingRoot = menu.closest('[data-tippy-root], .main-contextMenu-tippy, [data-radix-popper-content-wrapper]');
      if (floatingRoot) {
        floatingRoot.classList.add('ag-scrollable-submenu-root');
        floatingRoot.style.removeProperty('max-height');
        floatingRoot.style.setProperty('overflow', 'visible', 'important');
        floatingRoot.style.removeProperty('clip-path');
        floatingRoot.style.removeProperty('contain');
      }

      const viewport = menu.querySelector('[data-radix-scroll-area-viewport], [data-overlayscrollbars-viewport]');
      if (viewport) {
        viewport.style.setProperty('height', `${maxHeight}px`, 'important');
        viewport.style.setProperty('max-height', `${maxHeight}px`, 'important');
        viewport.style.setProperty('overflow-y', 'scroll', 'important');
        viewport.style.setProperty('overflow-x', 'hidden', 'important');
      }

      let scrollWrap = menu.querySelector(':scope > .ag-submenu-list-scroll');
      if (!scrollWrap) {
        const children = Array.from(menu.children);
        const firstScrollableIndex = Math.max(2, children.findIndex(child => (child.textContent || '').toLowerCase().includes('new playlist')) + 1);
        if (children.length > firstScrollableIndex + 2) {
          scrollWrap = document.createElement(menu.tagName === 'UL' ? 'li' : 'div');
          scrollWrap.className = 'ag-submenu-list-scroll';
          scrollWrap.setAttribute('role', 'presentation');
          children.slice(firstScrollableIndex).forEach(child => scrollWrap.appendChild(child));
          menu.appendChild(scrollWrap);
        }
      }

      if (scrollWrap) {
        const wrapTop = scrollWrap.getBoundingClientRect().top || (rect.top + 96);
        const wrapMax = Math.max(140, maxHeight - Math.max(72, wrapTop - rect.top));
        scrollWrap.style.setProperty('max-height', `${wrapMax}px`, 'important');
        scrollWrap.style.setProperty('overflow-y', 'auto', 'important');
        scrollWrap.style.setProperty('overflow-x', 'hidden', 'important');
        scrollWrap.style.setProperty('display', 'block', 'important');
        scrollWrap.style.setProperty('overscroll-behavior', 'contain', 'important');
      }

      const wheelTarget = scrollWrap || viewport || menu;
      if (!wheelTarget.dataset.agWheelHooked) {
        wheelTarget.dataset.agWheelHooked = 'true';
        wheelTarget.addEventListener('wheel', ev => {
          wheelTarget.scrollTop += ev.deltaY;
          ev.preventDefault();
          ev.stopPropagation();
        }, { passive: false, capture: true });
      }
    });
  }

  function updateJamPillLegacy() {
    const isVisible = el => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };
    const jamButtonScope = document.querySelectorAll('.Root__right-sidebar button, [data-testid="right-sidebar"] button, [data-testid="queue-page"] button, [role="dialog"] button, .main-connectBar-connectBar button, [class*="connectBar"] button');
    const visibleStartJam = Array.from(jamButtonScope).find(btn => {
      if (!isVisible(btn)) return false;
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.trim().toLowerCase();
      return label.includes('start a jam');
    });
    const visibleEndJam = Array.from(jamButtonScope).find(btn => {
      if (!isVisible(btn)) return false;
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.trim().toLowerCase();
      return label === 'end' || label.startsWith('end ') || label.includes('jam beenden');
    });
    let pill = document.getElementById("ag-jam-floating-pill");
    if (visibleStartJam && !visibleEndJam) {
      if (pill && pill.dataset.agPreview !== 'true') {
        pill.classList.add('ag-jam-hidden');
        pill.style.setProperty("display", "none", "important");
        pill.style.setProperty("visibility", "hidden", "important");
        pill.style.setProperty("pointer-events", "none", "important");
      }
      document.querySelectorAll('.main-connectBar-connected, .main-connectBar-connectBar, [class*="connectBar-connected"]').forEach(bar => {
        bar.style.removeProperty("opacity");
        bar.style.removeProperty("pointer-events");
        bar.style.removeProperty("height");
      });
      return;
    }
    const jamInfo = getActiveJamInfo();
    const nativeBar = Array.from(document.querySelectorAll('.main-connectBar-connected, .main-connectBar-connectBar, [class*="connectBar-connected"], [class*="connectBar"]'))
      .find(el => {
        const text = String(el.innerText || el.textContent || '').toLowerCase();
        const className = String(el.className || '');
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const existsInLayout = rect.width > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        const isConnected = className.includes('connectBar-connected') || el.dataset.agNativeJam === 'true';
        return existsInLayout && !text.includes('connect to a device') && (isConnected || text.includes('jam') || text.includes('\u2022'));
      });
    const endButton = visibleEndJam;
    const jamPanel = endButton?.closest('.Root__right-sidebar, [data-testid="right-sidebar"], [class*="queue"], [data-testid="queue-page"], [role="dialog"]');
    const real = jamInfo?.el || jamPanel || nativeBar;
    const text = real?.innerText || '';
    const lower = text.toLowerCase();
    const hasActiveJamPanel = !!(jamPanel && /(^|\s)end(\s|$)/i.test(endButton?.textContent || ''));
    const nativeBarText = (nativeBar?.innerText || nativeBar?.textContent || '').toLowerCase();
    const isNativeJam = !!(nativeBar && !nativeBarText.includes('start a jam') && (
      nativeBarText.includes('jam') ||
      nativeBarText.includes('\u2022') ||
      nativeBar.dataset.agNativeJam === 'true' ||
      String(nativeBar.className || '').includes('connectBar-connected')
    ));
    const isJam = hasActiveJamPanel || !!(jamInfo && !visibleStartJam) || isNativeJam;

    if (isJam) {
      if (!pill) {
        pill = document.createElement("div");
        pill.id = "ag-jam-floating-pill";
        document.body.appendChild(pill);
        pill.onclick = () => {
          const qBtn = document.querySelector('button[aria-label="Queue"]') || document.querySelector('button[data-testid="control-button-queue"]');
          if (qBtn) qBtn.click();
          else Spicetify.Platform.History.push({ pathname: "/queue" });
        };
      }
      let jamText = jamInfo?.text || '';
      if (!jamText && jamPanel) {
        jamText = (jamPanel.innerText || '').split('\n').find(line => line.toLowerCase().includes('jam')) || '';
      }
      if (!jamText && nativeBar) jamText = nativeBar.innerText || '';
      if (!jamText || jamText.length < 3) {
        const spans = real?.querySelectorAll?.('span, div') || [];
        for (let s of spans) {
          if (s.innerText && s.innerText.length > 2 && !s.innerText.includes('Connect')) {
            jamText = s.innerText;
            break;
          }
        }
      }
      pill.innerText = (jamText || "Jam Active").replace(/Connect to a device/gi, "").trim();
      pill.classList.remove('ag-jam-hidden');
      pill.style.setProperty("display", "inline-flex", "important");
      pill.style.setProperty("visibility", "visible", "important");
      pill.style.setProperty("pointer-events", "auto", "important");
      applyLayout(_layoutEditMode ? (_layoutDraft || getLayout()) : getLayout());
      if (real?.matches?.(".main-connectBar-connectBar, [class*='connectBar']")) {
        real.dataset.agNativeJam = 'true';
        real.style.setProperty("opacity", "0", "important");
        real.style.setProperty("pointer-events", "none", "important");
        real.style.setProperty("height", "0", "important");
      }
      document.querySelectorAll('.main-connectBar-connected, .main-connectBar-connectBar, [class*="connectBar-connected"]').forEach(bar => {
        bar.dataset.agNativeJam = 'true';
        bar.style.setProperty("opacity", "0", "important");
        bar.style.setProperty("pointer-events", "none", "important");
        bar.style.setProperty("height", "0", "important");
      });
    } else if (pill && pill.dataset.agPreview !== 'true') {
      pill.classList.add('ag-jam-hidden');
      pill.style.setProperty("display", "none", "important");
      pill.style.setProperty("visibility", "hidden", "important");
      pill.style.setProperty("pointer-events", "none", "important");
    }
  }

  function agSafeRun(label, fn) {
    try {
      fn();
    } catch (e) {
      console.warn(`[AmbientGlass] ${label} failed`, e);
    }
  }

  function runRuntimeFixes(mode = 'full') {
    if (mode === 'light') {
      agSafeRun('enforceProfileHitbox', enforceProfileHitbox);
      if (!_layoutEditMode) agSafeRun('queueVisibilityUpdate', queueVisibilityUpdate);
      if ((Spicetify.Platform.History.location.pathname || '').includes('marketplace')) {
        agSafeRun('fixMarketplaceDropdown', fixMarketplaceDropdown);
        agSafeRun('fixMarketplaceSpacing', fixMarketplaceSpacing);
        agSafeRun('alignMarketplaceTabsToHome', alignMarketplaceTabsToHome);
      }
      const hasMenu = !!document.querySelector('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content], [data-testid="context-menu"]');
      if (hasMenu) {
        agSafeRun('injectSettingsToMenu', injectSettingsToMenu);
        agSafeRun('fixSubmenuScroll', fixSubmenuScroll);
      }
      const hasJamUi = !!document.querySelector('.Root__right-sidebar, [data-testid="right-sidebar"], [data-testid="queue-page"], .main-connectBar-connectBar, [class*="connectBar"], #ag-jam-floating-pill');
      if (hasJamUi) agSafeRun('updateJamPillLegacy', updateJamPillLegacy);
      return;
    }
    const performanceMode = isPerformanceMode();
    agSafeRun('killTopbar', killTopbar);
    agSafeRun('killResidues', killResidues);
    agSafeRun('healArtistImage', healArtistImage);
    agSafeRun('enforceProfileHitbox', enforceProfileHitbox);
    if (!_layoutEditMode) agSafeRun('queueVisibilityUpdate', queueVisibilityUpdate);
    agSafeRun('fixFriendsPanel', fixFriendsPanel);
    if (!performanceMode) agSafeRun('updateSidebarCoverBackground', updateSidebarCoverBackground);
    if (!performanceMode) agSafeRun('hideAboutArtistCards', hideAboutArtistCards);
    agSafeRun('syncSidebarOuterCollapse', syncSidebarOuterCollapse);
    agSafeRun('updateSidebarResizeHitbox', updateSidebarResizeHitbox);
    agSafeRun('syncFriendsSidebarState', () => syncFriendsSidebarState());
    const hasMenu = !!document.querySelector('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content], [data-testid="context-menu"]');
    if (hasMenu) {
      agSafeRun('injectSettingsToMenu', injectSettingsToMenu);
      agSafeRun('fixSubmenuScroll', fixSubmenuScroll);
    }
    agSafeRun('fixYouLiked', fixYouLiked);
    agSafeRun('fixMarketplaceDropdown', fixMarketplaceDropdown);
    agSafeRun('fixMarketplaceSpacing', fixMarketplaceSpacing);
    agSafeRun('alignMarketplaceTabsToHome', alignMarketplaceTabsToHome);
    agSafeRun('updateSearchPageRedesign', updateSearchPageRedesign);
    agSafeRun('restoreNativeSidebar', restoreNativeSidebar);
    const hasJamUi = !!document.querySelector('.Root__right-sidebar, [data-testid="right-sidebar"], [data-testid="queue-page"], .main-connectBar-connectBar, [class*="connectBar"], #ag-jam-floating-pill');
    if (hasJamUi) agSafeRun('updateJamPillLegacy', updateJamPillLegacy);
    agSafeRun('hideMarketplaceSearch', () => {
      const mSearch = document.querySelector(".marketplace-header__search-container");
      if (mSearch) {
        mSearch.style.setProperty("opacity", "0", "important");
        mSearch.style.setProperty("pointer-events", "none", "important");
        mSearch.style.setProperty("height", "0", "important");
      }
    });
  }

  function init() {
    console.log("%c AmbientGlass - EROX %c", "background:#7b5fdb;color:#fff;padding:5px;border-radius:5px;", "");
    try { applyCustomColors(); } catch(e) {}
    localStorage.removeItem('ag-privacy');
    document.getElementById('ag-privacy-logic')?.remove();
    
    triggerStartupAnimation(); createBlobs(); createHeroGlow(); createGlowSmoother();
    createHomeCluster(); createSearchOverlay(); createUpNextCard(); createLibraryPanel();
    setTimeout(() => agSafeRun('showOnboarding', () => showOnboarding(false)), 1000);
    setupAmbientSearchHotkey();
    updateSidebarCoverBackground();
    killTopbar(); killResidues();
    agSafeRun('enforceProfileHitbox', enforceProfileHitbox);
    [50, 150, 400, 900, 1800].forEach(delay => setTimeout(() => {
      markDockDirty();
      agSafeRun('enforceProfileHitbox', enforceProfileHitbox);
    }, delay));
    setupSidebarObserver();
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', () => {
      markDockDirty();
      updateSearchPageVisualCenter();
      positionUpNextCard();
      queueVisibilityUpdate();
      updateSidebarResizeHitbox();
      scheduleRuntimeFix('light', 40);
    });
    window.addEventListener('pointerdown', () => {
      markDockDirty();
      scheduleRuntimeFix('light', 40);
    }, true);
    try { Spicetify.Platform.History.listen(() => {
      markDockDirty();
      agSafeRun('updateSearchPageRedesign', updateSearchPageRedesign);
      agSafeRun('alignMarketplaceTabsToHome', alignMarketplaceTabsToHome);
      [120, 420, 900, 1600].forEach(delay => setTimeout(() => agSafeRun('fixMarketplaceSpacing', fixMarketplaceSpacing), delay));
      [140, 460, 940, 1650].forEach(delay => setTimeout(() => agSafeRun('alignMarketplaceTabsToHome', alignMarketplaceTabsToHome), delay));
      scheduleRuntimeFix('full', 120);
    }); } catch {}
    fixFriendsPanel();
    runRuntimeFixes();

    const observer = new MutationObserver(mutations => {
      let needsLight = false;
      let needsFull = false;
      let needsMenu = false;
      let needsJam = false;
      let needsDock = false;
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        const touched = [...mutation.addedNodes, ...mutation.removedNodes].filter(node => node?.nodeType === 1);
        if (!touched.length) continue;
        for (const node of touched) {
          const html = node.outerHTML || '';
          const text = node.textContent || '';
          if (html.includes('contextMenu') || html.includes('role="menu"') || text.toLowerCase().includes('find a playlist')) needsMenu = true;
          if (html.includes('connectBar') || text.toLowerCase().includes('start a jam') || text.toLowerCase().includes(' jam')) needsJam = true;
          if (html.includes('main-userWidget') ||
              html.includes('marketplace-extension-button') ||
              html.includes('stats-extension-button') ||
              html.includes('extension-button') ||
              html.includes('aria-label') && html.includes('Marketplace') ||
              html.includes('aria-label') && html.includes('Stat')) needsDock = true;
          if (html.includes('buddyFeed') || html.includes('entityHeader') || html.includes('marketplace')) needsFull = true;
        }
      }
      needsLight = needsMenu || needsJam || needsDock;
      if (needsDock) markDockDirty();
      if (needsLight) scheduleRuntimeFix('light', 50);
      if (needsMenu) scheduleRuntimeFix('light', 10);
      if (needsJam) scheduleRuntimeFix('light', 10);
      if (needsFull) scheduleRuntimeFix('full', isPerformanceMode() ? 420 : 180);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const repeat = (fn, delayForMode) => {
      const tick = () => {
        fn();
        window.setTimeout(tick, delayForMode());
      };
      window.setTimeout(tick, delayForMode());
    };
    repeat(() => scheduleRuntimeFix('light', 0), () => isPerformanceMode() ? 30000 : 15000);
    repeat(() => agSafeRun('updateUpNextCard', updateUpNextCard), () => isPerformanceMode() ? 10000 : 5000);
    repeat(() => {
      if (!isPerformanceMode()) agSafeRun('updateSidebarCoverBackground', updateSidebarCoverBackground);
    }, () => isPerformanceMode() ? 12000 : 1500);
    repeat(() => {
      if (!isPerformanceMode()) agSafeRun('hideAboutArtistCards', hideAboutArtistCards);
    }, () => isPerformanceMode() ? 6000 : 2000);
    repeat(() => agSafeRun('syncSidebarOuterCollapse', syncSidebarOuterCollapse), () => isPerformanceMode() ? 2500 : 1000);
    repeat(() => agSafeRun('updateSidebarResizeHitbox', updateSidebarResizeHitbox), () => isPerformanceMode() ? 4000 : 2000);
    repeat(() => {
      markDockDirty();
      scheduleRuntimeFix('full', 0);
    }, () => isPerformanceMode() ? 150000 : 90000);
  }
  
  window.AmbientGlass = { safeNavigate, closeLibraryPanel };
  init();
})();








