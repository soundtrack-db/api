/**
 * SoundtrackDB Plug & Play Widget
 * Self-contained embeddable Spotify Soundtrack player widget
 * GitHub: https://github.com/soundtrack-db/api
 */
(function () {
  if (window.__SOUNDTRACKDB_WIDGET_LOADED__) return;
  window.__SOUNDTRACKDB_WIDGET_LOADED__ = true;

  // Auto-detect script origin for API requests
  let scriptSrc = '';
  const currentScript = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (currentScript && currentScript.src) {
    try {
      const parsed = new URL(currentScript.src);
      scriptSrc = parsed.origin;
    } catch (e) {}
  }
  const API_BASE = scriptSrc || (window.location.origin.includes('localhost') ? window.location.origin : 'https://soundtrackdb.vercel.app');

  // Inject Scoped Styles once
  const styleId = 'soundtrackdb-widget-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      .stdb-card {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        width: 100%;
        max-width: 440px;
        background: #09090b;
        color: #f4f4f5;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        box-sizing: border-box;
        margin: 12px auto;
        user-select: none;
      }
      .stdb-card * {
        box-sizing: border-box;
      }
      .stdb-header {
        position: relative;
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
      }
      .stdb-artwork-wrap {
        position: relative;
        flex-shrink: 0;
        width: 56px;
        height: 56px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #18181b;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      }
      .stdb-artwork-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.5s ease;
      }
      .stdb-artwork-wrap:hover img {
        transform: scale(1.08);
      }
      .stdb-meta {
        flex: 1;
        min-width: 0;
      }
      .stdb-badge-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .stdb-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: rgba(29, 185, 84, 0.12);
        color: #1DB954;
        border: 1px solid rgba(29, 185, 84, 0.25);
      }
      .stdb-year {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        color: rgba(255, 255, 255, 0.35);
      }
      .stdb-title-wrap {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
      }
      .stdb-title {
        font-size: 13.5px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: #ffffff;
        margin: 0;
        display: inline-block;
      }
      .stdb-subtitle {
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.45);
        margin: 4px 0 0 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stdb-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
      }
      .stdb-btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
        padding: 0;
      }
      .stdb-btn-icon:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }
      .stdb-btn-icon:active {
        transform: scale(0.95);
      }
      .stdb-arrow-icon {
        transition: transform 0.3s ease;
      }
      .stdb-arrow-icon.rotated {
        transform: rotate(180deg);
      }
      /* Expandable Tracklist */
      .stdb-expandable {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.25);
      }
      .stdb-expandable.expanded {
        grid-template-rows: 1fr;
      }
      .stdb-expandable-inner {
        overflow: hidden;
      }
      .stdb-track-list {
        padding: 6px;
        max-height: 280px;
        overflow-y: auto;
      }
      .stdb-track-list::-webkit-scrollbar {
        width: 4px;
      }
      .stdb-track-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 10px;
      }
      .stdb-track-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .stdb-track-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .stdb-track-item.playing {
        background: rgba(29, 185, 84, 0.08);
      }
      .stdb-track-idx {
        width: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.25);
        text-align: center;
        flex-shrink: 0;
      }
      .stdb-track-item:hover .stdb-track-idx {
        color: #1DB954;
      }
      .stdb-equalizer {
        display: none;
        gap: 2px;
        align-items: flex-end;
        height: 12px;
        width: 20px;
        justify-content: center;
      }
      .stdb-equalizer span {
        width: 2px;
        background: #1DB954;
        animation: stdbBounce 0.8s infinite alternate;
      }
      .stdb-equalizer span:nth-child(2) { animation-delay: 0.2s; height: 10px; }
      .stdb-equalizer span:nth-child(3) { animation-delay: 0.4s; height: 6px; }
      .stdb-track-item.playing .stdb-equalizer {
        display: flex;
      }
      .stdb-track-item.playing .stdb-track-idx {
        display: none;
      }
      @keyframes stdbBounce {
        0% { height: 3px; }
        100% { height: 12px; }
      }
      .stdb-track-info {
        flex: 1;
        min-width: 0;
      }
      .stdb-track-name {
        font-size: 12.5px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stdb-track-item.playing .stdb-track-name {
        color: #1DB954;
      }
      .stdb-track-artist {
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.35);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 1px;
      }
      .stdb-track-dur {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.25);
        flex-shrink: 0;
      }
      .stdb-stats-bar {
        padding: 10px 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
      }
      .stdb-stats-count {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .stdb-stats-link {
        font-size: 10px;
        font-weight: 600;
        color: #1DB954;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stdb-stats-link:hover {
        color: #1ed760;
      }
      /* Graceful GitHub Label */
      .stdb-github-footer {
        padding: 8px 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
      }
      .stdb-brand {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.4);
        font-weight: 500;
      }
      .stdb-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #1DB954;
        box-shadow: 0 0 8px #1DB954;
      }
      .stdb-gh-link {
        display: flex;
        align-items: center;
        gap: 5px;
        color: rgba(255, 255, 255, 0.4);
        text-decoration: none;
        transition: color 0.2s;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
      }
      .stdb-gh-link:hover {
        color: #ffffff;
      }
      .stdb-gh-link svg {
        width: 13px;
        height: 13px;
        fill: currentColor;
      }
    `;
    document.head.appendChild(style);
  }

  // Global Audio Controller for Preview
  let currentAudio = null;
  let currentPlayingItem = null;

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentPlayingItem) {
      currentPlayingItem.classList.remove('playing');
      currentPlayingItem = null;
    }
  }

  function playPreview(track, itemEl) {
    if (currentPlayingItem === itemEl) {
      stopAudio();
      return;
    }
    stopAudio();

    if (!track.preview_url) {
      // Fallback: Open track in Spotify if no preview URL available
      if (track.spotify_url) window.open(track.spotify_url, '_blank');
      return;
    }

    currentAudio = new Audio(track.preview_url);
    currentPlayingItem = itemEl;
    itemEl.classList.add('playing');

    currentAudio.play().catch(() => {
      stopAudio();
    });

    currentAudio.onended = () => {
      stopAudio();
    };
  }

  // Render Widget in Container
  async function initWidget(container) {
    const imdbId = container.getAttribute('data-imdb') || 'tt0816692';
    const initialTitle = container.getAttribute('data-title') || '';

    // Create Initial Shell
    container.innerHTML = `
      <div class="stdb-card">
        <div class="stdb-header">
          <div class="stdb-artwork-wrap">
            <img class="stdb-img" src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&h=200&auto=format&fit=crop" alt="Cover" />
          </div>
          <div class="stdb-meta">
            <div class="stdb-badge-row">
              <span class="stdb-badge">ORIGINAL</span>
              <span class="stdb-year">...</span>
            </div>
            <div class="stdb-title-wrap">
              <h3 class="stdb-title">Resolving soundtrack...</h3>
            </div>
            <p class="stdb-subtitle">SoundtrackDB API</p>
          </div>
          <div class="stdb-actions">
            <a class="stdb-btn-icon stdb-spotify-link" href="https://spotify.com" target="_blank" rel="noopener" title="Open Spotify">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </a>
            <button class="stdb-btn-icon stdb-toggle-btn" title="Expand Tracklist">
              <svg class="stdb-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </div>

        <div class="stdb-expandable">
          <div class="stdb-expandable-inner">
            <div class="stdb-track-list">
              <div style="padding: 16px; text-align: center; color: rgba(255,255,255,0.4); font-size: 11px;">Loading tracks...</div>
            </div>
            <div class="stdb-stats-bar">
              <span class="stdb-stats-count">Loading...</span>
              <a class="stdb-stats-link stdb-full-link" href="https://spotify.com" target="_blank" rel="noopener">
                Open in Spotify
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="stdb-github-footer">
          <div class="stdb-brand">
            <span class="stdb-dot"></span>
            <span>SoundTrackDB</span>
          </div>
          <a class="stdb-gh-link" href="https://github.com/soundtrack-db/api" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            <span>soundtrack-db/api</span>
          </a>
        </div>
      </div>
    `;

    const titleEl = container.querySelector('.stdb-title');
    const subtitleEl = container.querySelector('.stdb-subtitle');
    const yearEl = container.querySelector('.stdb-year');
    const imgEl = container.querySelector('.stdb-img');
    const spotifyLink = container.querySelector('.stdb-spotify-link');
    const fullLink = container.querySelector('.stdb-full-link');
    const toggleBtn = container.querySelector('.stdb-toggle-btn');
    const arrowIcon = container.querySelector('.stdb-arrow-icon');
    const expandable = container.querySelector('.stdb-expandable');
    const trackListEl = container.querySelector('.stdb-track-list');
    const statsCountEl = container.querySelector('.stdb-stats-count');

    // Toggle expand
    toggleBtn.addEventListener('click', () => {
      const isExpanded = expandable.classList.toggle('expanded');
      arrowIcon.classList.toggle('rotated', isExpanded);
    });

    // Fetch Live Tracks Data from SoundtrackDB API
    try {
      const endpoint = imdbId ? `${API_BASE}/v1/titles/imdb/${encodeURIComponent(imdbId)}/tracks` : `${API_BASE}/v1/titles/resolve?title=${encodeURIComponent(initialTitle)}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const title = data.title || {};
      const st = data.soundtrack || {};
      const tracks = st.tracks || [];

      // Update UI with real data
      titleEl.textContent = `${title.name || 'Soundtrack'} // OST`;
      yearEl.textContent = title.year || '';
      subtitleEl.textContent = `${st.title || title.name} · ${tracks.length} Tracks`;
      if (st.thumbnail) imgEl.src = st.thumbnail;
      if (st.spotify_url) {
        spotifyLink.href = st.spotify_url;
        fullLink.href = st.spotify_url;
      }
      statsCountEl.textContent = `Total: ${tracks.length} Tracks`;

      // Render ALL real tracks
      if (tracks.length > 0) {
        trackListEl.innerHTML = '';
        tracks.forEach((track, idx) => {
          const item = document.createElement('div');
          item.className = 'stdb-track-item';
          item.title = track.preview_url ? 'Click to preview track (30s)' : 'Click to open in Spotify';
          item.innerHTML = `
            <div class="stdb-track-idx">${String(idx + 1).padStart(2, '0')}</div>
            <div class="stdb-equalizer">
              <span></span><span></span><span></span>
            </div>
            <div class="stdb-track-info">
              <div class="stdb-track-name">${escapeHtml(track.title)}</div>
              <div class="stdb-track-artist">${escapeHtml(track.artist || 'Hans Zimmer')}</div>
            </div>
            <div class="stdb-track-dur">${track.duration || '03:00'}</div>
          `;

          item.addEventListener('click', () => {
            playPreview(track, item);
          });

          trackListEl.appendChild(item);
        });
      } else {
        trackListEl.innerHTML = '<div style="padding: 16px; text-align: center; color: rgba(255,255,255,0.4); font-size: 11px;">No tracks available for this title.</div>';
      }

    } catch (err) {
      titleEl.textContent = 'Could not load soundtrack';
      subtitleEl.textContent = 'Check IMDb ID or network';
      console.error('[SoundtrackDB Widget Error]:', err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  // Auto-mount all .soundtrackdb-widget containers on page load
  function mountAll() {
    document.querySelectorAll('.soundtrackdb-widget').forEach((el) => {
      if (!el.getAttribute('data-stdb-mounted')) {
        el.setAttribute('data-stdb-mounted', 'true');
        initWidget(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  // Export Global API
  window.SoundtrackDBWidget = {
    mount: initWidget,
    mountAll,
  };
})();
