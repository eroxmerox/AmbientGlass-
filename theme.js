console.log('>> [AmbientGlass] Script Triggered! <<');
// AmbientGlass — theme.js (v15.0) ✦ ULTIMATE BUILD
// • Branding: "AmbientGlass" added to Startup
// • Entrance: Soft Drop & Zoom
// • Layout: 50/50 Split
// • Safety: 60px Margin
// • NavFix: Colon to Slash conversion added by Antigravity

(function AmbientGlass() {
  'use strict';
  console.log("AmbientGlass v15.0: ULTIMATE BUILD. Created by EROX");

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

  function applyLayout(layout = getLayout()) {
    document.body?.classList.toggle('ag-layout-custom', !!localStorage.getItem('ag-layout') || _layoutEditMode);
    const cluster = document.getElementById('ag-home-cluster');
    if (cluster) {
      const pinHomeTop = !_layoutEditMode && getMainScrollY() > 12;
      cluster.style.setProperty('left', pinHomeTop ? '50%' : `${layout.homeCluster.x}%`, 'important');
      cluster.style.setProperty('top', pinHomeTop ? '60px' : `${layout.homeCluster.y}%`, 'important');
      cluster.style.setProperty('right', 'auto', 'important');
      cluster.style.setProperty('bottom', 'auto', 'important');
      cluster.style.setProperty('width', '340px', 'important');
      cluster.style.setProperty('height', '92px', 'important');
      cluster.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    }

    const search = document.getElementById('ag-centered-search');
    if (search) {
      search.style.left = `${layout.search.x}%`;
      search.style.top = `${layout.search.y}%`;
      search.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    const nowPlaying = document.querySelector('.Root__now-playing-bar');
    if (nowPlaying) {
      nowPlaying.style.setProperty('--ag-now-x', layout.nowPlaying.x + '%');
      nowPlaying.style.setProperty('--ag-now-y', layout.nowPlaying.y + '%');
    }

    const jamPill = document.getElementById('ag-jam-floating-pill');
    if (jamPill) {
      jamPill.style.setProperty('left', `${layout.nowPlaying.x}%`, 'important');
      jamPill.style.setProperty('top', `calc(${layout.nowPlaying.y}% - 68px)`, 'important');
      jamPill.style.setProperty('bottom', 'auto', 'important');
      jamPill.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    }

    document.body?.classList.remove('ag-sidebar-on-left', 'ag-sidebar-on-right');
  }

  function getMainScrollY() {
    const scrollers = Array.from(document.querySelectorAll('.Root__main-view [data-overlayscrollbars-viewport], .Root__main-view .os-viewport, .Root__main-view'));
    const liveY = scrollers.reduce((max, el) => Math.max(max, el?.scrollTop || 0), 0);
    return liveY || _lastScrollY || 0;
  }

  // ── NAVIGATOR FIX ──
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
    
    // RADIKALE AUSNAHME: Wenn wir im Marketplace sind, zeigen wir ALLES
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
        // Nur löschen, wenn KEIN Bild (url) im Style ist
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

  function createSearchOverlay() {
    if (document.getElementById('ag-centered-search')) return;
    const d = document.createElement('div'); d.id = 'ag-centered-search';
    d.innerHTML = `<div class="ag-ring"></div><div class="ag-pill-search">${svg(ICONS.search, { size: 18 })}<input id="ag-input" placeholder="Search..."/></div>`;
    const inp = d.querySelector('input');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') safeNavigate('/search/' + encodeURIComponent(inp.value)); });
    document.body.appendChild(d);
    applyLayout();
    setTimeout(() => setupAnimatedPlaceholder(inp), 2000);
  }

  // ── LIBRARY ──
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
    grid.innerHTML = items.map(i => `<div class="ag-lib-item" onclick="AmbientGlass.safeNavigate('${i.uri}'); AmbientGlass.closeLibraryPanel();"><div class="ag-lib-item-cover" style="background-image:url('${i.images?.[0]?.url || i.image?.url || ''}')"></div><div class="ag-lib-item-name">${i.name || 'Untitled'}</div></div>`).join('') || `<div class="ag-lib-empty">No ${_currentType} found</div>`;
  }

  let _lastScrollY = 0;
  function handleScroll(e) {
    const target = e.target;
    if (!target || !target.closest) return;
    // Nur auf Main-View Scrolling reagieren — Sidebar, Menüs etc. ignorieren
    if (target.closest('.Root__right-sidebar') ||
        target.closest('.Root__nav-bar') ||
        target.closest('.main-contextMenu-menu') ||
        target.closest('#ag-lib-panel') ||
        target.closest('#ag-settings-panel') ||
        target.closest('.main-buddyFeed-buddyFeed')) return;
    if (!target.closest('.Root__main-view')) return;
    const y = Math.max(target.scrollTop || 0, getMainScrollY());
    _lastScrollY = y;
    updateVisibility();
  }

  function triggerStartupAnimation() {
    if (document.getElementById('ag-startup-splash')) return;
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
      <div style="position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.15); font-size: 10px; letter-spacing: 1px; font-family: monospace;">BUILD 15.0.ULTIMATE</div>
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
    
    // ANTI-DOPPEL: Nur heilen, wenn KEIN Bild da ist und wir nicht schon geheilt haben
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

  function enforceProfileHitbox() {
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
      if (!hitboxNotified) {
        setTimeout(() => Spicetify.showNotification("AmbientGlass: Hitbox OK ✓"), 1000);
        hitboxNotified = true;
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
      // Marketplace & Stats Hitboxes synchronisieren
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
      
      // Original verstecken
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
    const ids = ['ag-notify-hitbox', 'ag-friends-hitbox', 'ag-profile-hitbox', 'ag-market-hitbox', 'ag-stats-hitbox'];
    const isBlocking = document.getElementById('ag-startup-splash') || document.getElementById('ag-settings-panel');
    ids.forEach(id => {
      const h = document.getElementById(id);
      if (h) h.style.opacity = isBlocking ? '0' : '1';
    });
    if (isBlocking) return;

    let style = document.getElementById('ag-hitbox-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ag-hitbox-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      #ag-side-dock { display: contents !important; }
      .ag-dock-hitbox {
        position: fixed !important;
        z-index: 70;
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

    if (!document.getElementById('ag-side-dock')) {
      const dock = document.createElement('div');
      dock.id = 'ag-side-dock';
      document.body.appendChild(dock);
    }

    const buttons = getDockButtons();
    const layout = getLayout();
    buttons.forEach((entry, index) => createOrUpdateDockButton(entry, layout, index));
    ids.forEach(id => {
      if (!buttons.some(entry => id === `ag-${entry.key}-hitbox`)) document.getElementById(id)?.remove();
    });
    if (!hitboxNotified && buttons.length) {
      setTimeout(() => Spicetify.showNotification("AmbientGlass: Dock OK"), 1000);
      hitboxNotified = true;
    }
  }

  function getDockButtons() {
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

    const seen = new Set(rail.map(x => x.original));
    const add = (key, original, html) => {
      if (!original || seen.has(original)) return;
      seen.add(original);
      rail.push({ key, original, html });
    };
    add('market', document.getElementById('marketplace-extension-button') || document.querySelector('button[aria-label*="Marketplace"], button[title*="Marketplace"]'), svg(ICONS.cart, { size: 18 }));
    add('stats', document.getElementById('stats-extension-button') || document.querySelector('.stats-button') || document.querySelector('button[aria-label*="Stat"], button[title*="Stat"]'), svg(ICONS.stats, { size: 18 }));
    return rail.slice(0, 5);
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
    const id = `ag-${entry.key}-hitbox`;
    let h = document.getElementById(id);
    if (!h) {
      h = document.createElement('button');
      h.id = id;
      h.type = 'button';
      h.className = 'ag-dock-hitbox';
      h.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const rect = h.getBoundingClientRect();
        const evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
        entry.original.dispatchEvent(evt);
        if (entry.key === 'profile') {
          setTimeout(() => {
            injectSettingsToMenu();
            repositionDockMenu(rect);
          }, 180);
        }
      });
      document.body.appendChild(h);
    }
    h.innerHTML = entry.html || '';
    h.style.left = `${layout.dock.x}px`;
    h.style.top = `${layout.dock.y + index * 52}px`;
    h.style.pointerEvents = 'auto';
    entry.original.style.setProperty('opacity', '0', 'important');
    entry.original.style.setProperty('pointer-events', 'none', 'important');
    entry.original.style.setProperty('visibility', 'hidden', 'important');
  }

  function repositionDockMenu(anchorRect) {
    const menu = Array.from(document.querySelectorAll('.main-contextMenu-menu, [role="menu"], [data-radix-menu-content]')).find(m => {
      const text = (m.textContent || '').toLowerCase();
      return text.includes('ambientglass settings') || text.includes('account') || text.includes('log out');
    });
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
        
        /* RADIKAL ALLES ALTE VERSTECKEN */
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
      if ((text.includes('You Liked') || text.includes('Gefällt dir')) && 
          !text.includes('Artist pick') && !text.includes('Auswahl des Künstlers')) {
        
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
        
        // Text-Extraktion (Manuell für maximale Stabilität)
        let songsCount = "";
        let releasesCount = "";
        let artistName = "";

        node.querySelectorAll('span, div, a').forEach(el => {
          const t = el.innerText.trim();
          if (!t || t.includes('You Liked') || t.includes('Gefällt dir')) return;
          if (t.toLowerCase().includes('song')) songsCount = t;
          else if (t.toLowerCase().includes('release')) releasesCount = t;
          else if (t.length > 1 && !t.includes('•')) artistName = t;
        });

        const line1 = document.createElement('div');
        line1.className = 'ag-yl-text-line1';
        line1.innerText = `${songsCount}${songsCount && releasesCount ? ' • ' : ''}${releasesCount}`;
        
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
      return !!(document.fullscreenElement || document.querySelector('.npv-main-container'));
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
      search.style.opacity = '1';
      search.style.visibility = 'visible';
      search.style.pointerEvents = 'auto';
      cluster.style.opacity = '1';
      cluster.style.visibility = 'visible';
      cluster.style.pointerEvents = 'auto';
      if (!_layoutDragging) scheduleLayoutEditorFrame(false);
      return;
    }

    applyLayout(layout);

    const path = Spicetify.Platform.History.location.pathname || '';
    const isNarrow = window.innerWidth < 750;
    const isFull = isFullscreen() || 
                   path.includes('marketplace') || 
                   path.includes('stats') || 
                   path.includes('statistics') ||
                   !!document.querySelector('.marketplace-header') ||
                   !!document.querySelector('.stats-header');
    const isModal = isModalOpen();
    const shouldHide = !_layoutEditMode && (isFull || isNarrow || isModal);

    if (shouldHide) {
      search.style.opacity = '0';
      search.style.visibility = 'hidden';
      search.style.pointerEvents = 'none';
      cluster.style.opacity = '1';
      cluster.style.visibility = 'visible';
      cluster.style.pointerEvents = 'auto';
      cluster.style.setProperty('left', '50%', 'important');
      cluster.style.setProperty('top', isNarrow ? '60px' : '60px', 'important');
      cluster.style.setProperty('right', 'auto', 'important');
      cluster.style.setProperty('bottom', 'auto', 'important');
      cluster.style.setProperty('width', '340px', 'important');
      cluster.style.setProperty('height', '92px', 'important');
      cluster.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    } else {
      const y = getMainScrollY();
      const o = Math.max(0, 1 - y / 360);
      const hidden = o < 0.05;
      search.style.opacity = String(o);
      search.style.visibility = hidden ? 'hidden' : 'visible';
      search.style.pointerEvents = o < 0.1 ? 'none' : 'auto';
      search.style.left = `${layout.search.x}%`;
      search.style.top = `${layout.search.y}%`;
      search.style.transform = `translate(-50%, -50%) translateY(-${Math.min(y * 0.18, 80)}px) scale(1)`;
      cluster.style.opacity = '1';
      cluster.style.visibility = 'visible';
      cluster.style.pointerEvents = 'auto';
      if (y > 12) {
        cluster.style.setProperty('left', '50%', 'important');
        cluster.style.setProperty('top', '60px', 'important');
        cluster.style.setProperty('right', 'auto', 'important');
        cluster.style.setProperty('bottom', 'auto', 'important');
        cluster.style.setProperty('width', '340px', 'important');
        cluster.style.setProperty('height', '92px', 'important');
        cluster.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
      } else {
        cluster.style.setProperty('left', `${layout.homeCluster.x}%`, 'important');
        cluster.style.setProperty('top', `${layout.homeCluster.y}%`, 'important');
        cluster.style.setProperty('right', 'auto', 'important');
        cluster.style.setProperty('bottom', 'auto', 'important');
        cluster.style.setProperty('width', '340px', 'important');
        cluster.style.setProperty('height', '92px', 'important');
        cluster.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
      }
    }
  }
  async function setupAnimatedPlaceholder(input) {
    const baseLabels = ['Search...', 'Songs...', 'Artists...', 'Albums...', 'Playlists...'];
    let items = [...baseLabels];
    try {
      const lib = await Spicetify.Platform.LibraryAPI.getContents({ limit: 15 });
      const recent = (lib.items || []).slice(0, 5).map(i => i.name).filter(Boolean).map(n => n + '...');
      if (recent.length > 0) items = ['Search...', ...recent, ...baseLabels.slice(1)];
    } catch {}
    let idx = 0;
    setInterval(() => {
      if (document.activeElement === input) return;
      input.placeholder = items[idx % items.length];
      idx++;
    }, 2000);
  }

  // ── FRIENDS PANEL OVERLAP FIX ──
  function fixFriendsPanel() {
    if (!document.getElementById('ag-friends-fix-style')) {
      const style = document.createElement('style');
      style.id = 'ag-friends-fix-style';
      style.textContent = `
        /* Verhindert, dass der "Jetzt läuft"-Track im Freunde-Panel überlappt */
        .main-buddyFeed-buddyFeed {
          padding-bottom: 0 !important;
          overflow-y: auto !important;
        }
        /* Now-playing bar UNTER dem Freundes-Panel fixieren */
        .Root__now-playing-bar {
          z-index: 100 !important;
        }
        /* Wenn Friends-Panel offen: Now-playing nicht über dem Panel */
        .main-globalNav-globalNav ~ .Root__right-sidebar .main-buddyFeed-buddyFeed {
          margin-bottom: 0 !important;
        }
        /* Verhindern, dass der aktuelle Track den Freunde-Feed überlagert */
        [data-testid="buddy-feed-container"],
        .main-buddyFeed-buddyFeedHeader {
          z-index: 10 !important;
          position: relative !important;
        }
        /* Now-playing-Bar und andere Ansichten komplett ausblenden wenn Freunde offen sind */
        .Root__right-sidebar:has([class*="buddyFeed"]) [data-testid="now-playing-view"],
        .Root__right-sidebar:has([class*="buddyFeed"]) .main-nowPlayingView-section {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        .Root__right-sidebar {
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function setupSidebarObserver() {
    const sidebar = document.querySelector('.Root__right-sidebar');
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
                                  ['<', '>', '‹', '›'].includes((btn.textContent || '').trim());
        if (!nearEdge && !looksLikeCollapse) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const isCollapsed = sidebar.classList.contains('ag-sidebar-collapsed') || sidebar.dataset.agManualCollapsed === 'true';
        setSidebarCollapsed(sidebar, !isCollapsed);
      }, true);
    }
    const observer = new MutationObserver(() => {
      const isBuddy = sidebar.querySelector('[class*="buddyFeed"]');
      const nowPlaying = sidebar.querySelector('[class*="nowPlayingView"], [data-testid="now-playing-view"]');
      if (isBuddy && nowPlaying) { nowPlaying.style.display = 'none'; }
    });
    observer.observe(sidebar, { childList: true, subtree: true });
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
    document.documentElement.style.removeProperty('--ag-sidebar-space');
    if (!sidebar) return;
    sidebar.classList.remove('ag-sidebar-left', 'ag-sidebar-right', 'ag-sidebar-collapsed');
    delete sidebar.dataset.agManualCollapsed;
    delete sidebar.dataset.agCollapseSession;
    delete sidebar.dataset.agCollapsed;
    ['--ag-sidebar-y', '--ag-sidebar-w', '--ag-sidebar-left'].forEach(prop => sidebar.style.removeProperty(prop));
  }

  function fixMarketplaceDropdown() {
    return; // AG-FIX: Deaktiviert, da CSS nun das Layout übernimmt
    const path = Spicetify.Platform.History.location.pathname;
    if (!path.includes("marketplace")) return;

    // Fix 1: Handle Link-based Tabs (New Marketplace)
    const links = document.querySelectorAll(".marketplace-tabBar-headerItemLink");
    links.forEach(link => {
        link.style.setProperty("display", "inline-block", "important");
        link.style.setProperty("visibility", "visible", "important");
        link.style.setProperty("opacity", "1", "important");
        if (link.classList.contains("marketplace-tabBar-active")) {
            link.classList.add("active");
        }
    });

    // Fix 2: Handle Dropdown-based Tabs (Old Marketplace)
    const allSelects = document.querySelectorAll(".marketplace-header select");
    let tabSelect = null;
    allSelects.forEach(s => {
        if (s.options[0]?.text.includes("Extensions") || s.options[0]?.text.includes("Themes") || s.options.length > 3) {
            tabSelect = s;
        }
    });

    if (tabSelect && !document.getElementById("ag-marketplace-tabs")) {
        tabSelect.style.setProperty("display", "none", "important");
        const tabs = document.createElement("div");
        tabs.id = "ag-marketplace-tabs";
        Array.from(tabSelect.options).forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "ag-market-tab-btn";
            if (tabSelect.value === opt.value) btn.classList.add("active");
            btn.innerText = opt.text;
            btn.onclick = () => {
                tabSelect.value = opt.value;
                tabSelect.dispatchEvent(new Event("change", { bubbles: true }));
                setTimeout(fixMarketplaceDropdown, 50);
            };
            tabs.appendChild(btn);
        });
        const header = document.querySelector(".marketplace-header");
        if (header) {
            const search = header.querySelector(".marketplace-header__search-container");
            if (search) header.insertBefore(tabs, search);
            else header.appendChild(tabs);
        }
    }
  }

  // ── SETTINGS & PRIVACY ──
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
    glow_opacity: '0.8', blobs_opacity: '0.25',
    glass_reflection: 'true', glass_blur: '24'
  };

  function getSetting(key) { 
    const saved = localStorage.getItem('ag-setting-' + key);
    if (saved) return saved;
    return DEFAULTS[key];
  }

  function openSettingsPanel() {
    if (document.getElementById('ag-settings-panel')) return;
    const d = document.createElement('div'); d.id = 'ag-settings-panel';
    const isPrivacy = localStorage.getItem('ag-privacy') === 'true';
    
    d.innerHTML = `
      <div class="ag-settings-wrapper">
        <div class="ag-settings-content">
          <div class="ag-settings-header">
            <h3>Theme Settings</h3>
            <button onclick="this.closest('#ag-settings-panel').remove()">${svg(ICONS.close, {size:16})}</button>
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
              <div class="ag-setting-item"><label>Privacy Mode</label><input type="checkbox" id="ag-check-privacy" ${isPrivacy ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><label>Hero Glow Color</label><input type="color" id="ag-col-glow" value="${getSetting('glow')}"/></div>
              <div class="ag-setting-item"><label>Hero Glow Intensity</label><input type="range" id="ag-range-glow_opacity" min="0" max="1" step="0.05" value="${getSetting('glow_opacity')}"/></div>
              <div class="ag-setting-item"><label>Background Blobs Color</label><input type="color" id="ag-col-blobs" value="${getSetting('blobs')}"/></div>
              <div class="ag-setting-item"><label>Blobs Intensity</label><input type="range" id="ag-range-blobs_opacity" min="0" max="1" step="0.05" value="${getSetting('blobs_opacity')}"/></div>
              <div class="ag-setting-item"><label>FrostedGlass/Glass</label><input type="checkbox" id="ag-check-glass_reflection" ${getSetting('glass_reflection') === 'true' ? 'checked' : ''}/></div>
              <div class="ag-setting-item"><label>Frosted Glass Blur</label><input type="range" id="ag-range-glass_blur" min="0" max="80" step="2" value="${getSetting('glass_blur')}"/></div>
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
              <div class="ag-setting-item"><label>Move AmbientGlass Layout</label><button id="ag-change-layout" type="button">Change</button></div>
              <div class="ag-setting-item"><label>Reset Saved Layout</label><button id="ag-reset-layout" type="button">Reset</button></div>
            </div>

            <div class="ag-tab-content" id="tab-ui">
               <div class="ag-setting-item"><label>Accent Color (Like/UI)</label><input type="color" id="ag-col-accent" value="${getSetting('accent')}"/></div>
               <p style="font-size: 11px; opacity: 0.6; margin-top: 10px;">This skins native Spotify elements like the Like button and progress bar.</p>
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

    // Tab Logic
    const tabs = d.querySelectorAll('.ag-tab-btn');
    const contents = d.querySelectorAll('.ag-tab-content');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        contents.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        d.querySelector('#tab-' + t.dataset.tab).classList.add('active');
      });
    });

    d.querySelector('#ag-change-layout')?.addEventListener('click', () => {
      d.remove();
      startLayoutEditor();
    });
    d.querySelector('#ag-reset-layout')?.addEventListener('click', () => {
      localStorage.removeItem('ag-layout');
      _layoutDraft = null;
      applyLayout(getLayout());
      updateVisibility();
      Spicetify.showNotification("AmbientGlass: Layout reset");
    });
    // Live Change Logic
    const inputs = d.querySelectorAll('input, select');
    inputs.forEach(input => {
      const eventType = input.type === 'range' || input.type === 'color' ? 'input' : 'change';
      input.addEventListener(eventType, () => {
        const k = input.id.replace('ag-col-', '').replace('ag-range-', '').replace('ag-check-', '');
        if (input.id === 'ag-check-privacy') {
            const wasTrue = localStorage.getItem('ag-privacy') === 'true';
            localStorage.setItem('ag-privacy', input.checked);
            if (input.checked) {
                applyPrivacy();
            } else if (wasTrue) {
                Spicetify.showNotification("Privacy Off: Reloading to restore text... ↺");
                setTimeout(() => location.reload(), 1200);
            }
        } else {
            const val = input.type === 'checkbox' ? input.checked.toString() : input.value;
            localStorage.setItem('ag-setting-' + k, val);
            applyCustomColors();
        }
      });
    });

    d.querySelector('#ag-save-settings').addEventListener('click', () => {
      localStorage.setItem('ag-privacy', d.querySelector('#ag-check-privacy').checked);
      Object.keys(DEFAULTS).forEach(k => {
        const el = d.querySelector('#ag-col-' + k) || d.querySelector('#ag-range-' + k) || d.querySelector('#ag-check-' + k);
        if (el) {
          const val = el.type === 'checkbox' ? el.checked.toString() : el.value;
          localStorage.setItem('ag-setting-' + k, val);
        }
      });
      
      // Live Apply!
      try {
        applyCustomColors();
        if (localStorage.getItem('ag-privacy') === 'true') {
            applyPrivacy();
        }
      } catch(e) {}
      
      d.remove();
      Spicetify.showNotification("AmbientGlass: Applied! ✨");
    });
    d.querySelector('#ag-reset-settings').addEventListener('click', () => {
      localStorage.removeItem('ag-privacy');
      Object.keys(DEFAULTS).forEach(k => localStorage.removeItem('ag-setting-' + k));
      
      applyCustomColors();
      document.getElementById('ag-privacy-logic')?.remove();
      
      d.remove();
      Spicetify.showNotification("AmbientGlass: Reset to Defaults! ↺");
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
    const btn_bg = getSetting('btn_bg');
    const btn_icon = getSetting('btn_icon');
    const blobs = getSetting('blobs');
    const glowOpacity = getSetting('glow_opacity');
    const blobsOpacity = getSetting('blobs_opacity');

    // Root Variables for Cluster & Glow
    const root = document.documentElement;
    root.style.setProperty('--ag-s1', s1);
    root.style.setProperty('--ag-s2', s2);
    root.style.setProperty('--ag-s3', s2);
    root.style.setProperty('--ag-accent-main', accent);
    
    root.style.setProperty('--ag-col-home', home);
    root.style.setProperty('--ag-col-liked', liked);
    root.style.setProperty('--ag-col-albums', albums);
    root.style.setProperty('--ag-col-playlists', playlists);
    root.style.setProperty('--ag-col-artists', artists);
    root.style.setProperty('--ag-col-btn_bg', btn_bg);
    
    root.style.setProperty('--ag-ambient-color', glow);
    root.style.setProperty('--ag-glow-opacity', glowOpacity);
    root.style.setProperty('--ag-blobs-opacity', blobsOpacity);
    root.style.setProperty('--ag-col-blobs', blobs);
    
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
        width: min(760px, 58vw) !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 66px !important;
        max-height: 86px !important;
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
        max-width: min(760px, 58vw) !important;
        margin: 0 auto !important;
        z-index: 80 !important;
      }
      body.ag-layout-editing .Root__now-playing-bar,
      body.ag-layout-editing .Root__now-playing-bar > *,
      body:has(#ag-settings-panel) .Root__now-playing-bar,
      body:has(#ag-settings-panel) .Root__now-playing-bar > * {
        z-index: 99996 !important;
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
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
        overflow: visible !important;
      }
      #ag-settings-panel .ag-tab-btn {
        flex: 1 1 calc(33.333% - 6px) !important;
        min-width: 72px !important;
        max-width: none !important;
        white-space: normal !important;
        text-align: center !important;
      }
      #ag-settings-panel .ag-setting-item button,
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

      /* Glass Settings Injection — High Specificity Overrides */
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

  function applyPrivacy() { return; }
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
        const looksLikeActiveJam = text.includes("'s jam") || text.includes("’s jam") || text.includes('jam\n') || text.includes('jam\r');
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
    const visibleStartJam = Array.from(document.querySelectorAll('button')).find(btn => {
      if (!isVisible(btn)) return false;
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''} ${btn.title || ''}`.trim().toLowerCase();
      return label.includes('start a jam');
    });
    const visibleEndJam = Array.from(document.querySelectorAll('button')).find(btn => {
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
        return existsInLayout && !text.includes('connect to a device') && (isConnected || text.includes('jam') || text.includes('•'));
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
      nativeBarText.includes('•') ||
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
      if (!_layoutEditMode) agSafeRun('updateVisibility', updateVisibility);
      if (document.querySelector('ul.main-contextMenu-menu, div[role="menu"], [data-radix-menu-content], [data-testid="context-menu"]')) {
        agSafeRun('injectSettingsToMenu', injectSettingsToMenu);
        agSafeRun('fixSubmenuScroll', fixSubmenuScroll);
      }
      return;
    }
    agSafeRun('killTopbar', killTopbar);
    agSafeRun('killResidues', killResidues);
    agSafeRun('healArtistImage', healArtistImage);
    agSafeRun('enforceProfileHitbox', enforceProfileHitbox);
    if (!_layoutEditMode) agSafeRun('updateVisibility', updateVisibility);
    agSafeRun('fixFriendsPanel', fixFriendsPanel);
    agSafeRun('injectSettingsToMenu', injectSettingsToMenu);
    agSafeRun('fixYouLiked', fixYouLiked);
    agSafeRun('fixMarketplaceDropdown', fixMarketplaceDropdown);
    agSafeRun('fixSubmenuScroll', fixSubmenuScroll);
    agSafeRun('restoreNativeSidebar', restoreNativeSidebar);
    agSafeRun('updateJamPillLegacy', updateJamPillLegacy);
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
    console.log("%c AmbientGlass ✦ EROX %c", "background:#7b5fdb;color:#fff;padding:5px;border-radius:5px;", "");
    try { applyCustomColors(); } catch(e) {}
    try { applyPrivacy(); } catch(e) {}
    
    triggerStartupAnimation(); createBlobs(); createHeroGlow();
    createHomeCluster(); createSearchOverlay(); createLibraryPanel();
    killTopbar(); killResidues();
    setupSidebarObserver();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateVisibility);
    window.addEventListener('pointerdown', () => setTimeout(() => runRuntimeFixes('light'), 80), true);
    try { Spicetify.Platform.History.listen(() => setTimeout(() => runRuntimeFixes('full'), 120)); } catch {}
    fixFriendsPanel();
    runRuntimeFixes();
    
    setInterval(() => { 
      return runRuntimeFixes('light');
      try {
        killTopbar(); killResidues(); healArtistImage(); enforceProfileHitbox();
        updateVisibility(); fixFriendsPanel(); injectSettingsToMenu();
        fixYouLiked(); fixMarketplaceDropdown(); fixSubmenuScroll(); syncSidebarCollapse();
      // --- STABLE JAM & MARKETPLACE FIX ---
      updateJamPillLegacy();
      const jamInfo = getActiveJamInfo();
      const real = jamInfo?.el || { innerText: '', classList: { contains: () => false }, querySelectorAll: () => [], style: { setProperty: () => {} }, className: '' };
      let pill = document.getElementById("ag-jam-floating-pill");
      const isJam = real && (real.innerText.toLowerCase().includes("jam") || real.innerText.includes("•") || real.classList.contains("main-connectBar-connected"));
      
          if (false && jamInfo) {
          if (pill?.dataset.agPreview === 'true' && !_layoutEditMode) pill.remove();
          pill = document.getElementById("ag-jam-floating-pill");
          if (!pill) {
              pill = document.createElement("div"); pill.id = "ag-jam-floating-pill";
              document.body.appendChild(pill);
              pill.onclick = () => {
                  const qBtn = document.querySelector('button[aria-label="Queue"]') || document.querySelector('button[data-testid="control-button-queue"]');
                  if (qBtn) qBtn.click(); else Spicetify.Platform.History.push({ pathname: "/queue" });
              };
          }
          let jamText = jamInfo.text || real?.innerText || '';
          if (!jamText || jamText.length < 3) {
              const spans = real?.querySelectorAll('span, div') || [];
              for (let s of spans) {
                  if (s.innerText && s.innerText.length > 2 && !s.innerText.includes('Connect')) {
                      jamText = s.innerText; break;
                  }
              }
          }
          pill.innerText = (jamText || "Jam Active").replace(/Connect to a device/gi, "").trim();
          pill.classList.remove('ag-jam-hidden');
          pill.style.setProperty("display", "inline-flex", "important");
          pill.style.setProperty("visibility", "visible", "important");
          pill.style.setProperty("pointer-events", "auto", "important");
          applyLayout(_layoutEditMode ? (_layoutDraft || getLayout()) : getLayout());
          if (real?.className && String(real.className).includes('connectBar')) {
              real.style.setProperty("opacity", "0", "important");
              real.style.setProperty("pointer-events", "none", "important");
              real.style.setProperty("height", "0", "important");
          }
          document.querySelectorAll(".main-connectBar-connectBar, [class*='connectBar']").forEach(bar => {
              if ((bar.innerText || '').toLowerCase().includes('jam')) {
                  bar.style.setProperty("opacity", "0", "important");
                  bar.style.setProperty("pointer-events", "none", "important");
                  bar.style.setProperty("height", "0", "important");
              }
          });
      } else if (false && pill && !_layoutEditMode && pill.dataset.agPreview !== 'true') {
          pill.remove();
      }

      const mSearch = document.querySelector(".marketplace-header__search-container");
      if (mSearch) {
          mSearch.style.setProperty("opacity", "0", "important");
          mSearch.style.setProperty("pointer-events", "none", "important");
          mSearch.style.setProperty("height", "0", "important");
      }

      } catch(e) {}
    }, 750);
    setInterval(() => runRuntimeFixes('full'), 5000);
  }
  
  window.AmbientGlass = { safeNavigate, closeLibraryPanel };
  init();
})();








