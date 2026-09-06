/**
 * Minimal JavaScript / Node.js client example for SoundtrackDB
 * No npm dependencies required (uses native fetch in Node 18+)
 */

const BASE_URL = 'https://soundtrackdb.vercel.app';

/**
 * Resolve soundtrack by IMDb ID (e.g. tt15239678)
 * @param {string} imdbId 
 */
async function getSoundtrackByImdb(imdbId) {
  const url = `${BASE_URL}/v1/titles/imdb/${encodeURIComponent(imdbId)}/music`;
  const res = await fetch(url);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP ${res.status}: Failed to resolve soundtrack`);
  }

  return await res.json();
}

/**
 * Universal search & resolve by title name and release year
 * @param {string} title 
 * @param {number} [year] 
 */
async function searchSoundtrack(title, year) {
  const params = new URLSearchParams({ title });
  if (year) params.append('year', year.toString());

  const url = `${BASE_URL}/v1/titles/resolve?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP ${res.status}: Failed to resolve soundtrack`);
  }

  return await res.json();
}

// Example Execution
(async () => {
  try {
    console.log('Resolving soundtrack for Dune: Part Two (tt15239678)...');
    const result = await getSoundtrackByImdb('tt15239678');
    
    console.log('Title:', result.title.name, `(${result.title.year})`);
    console.log('IMDb ID:', result.title.imdb_id);
    console.log('Soundtrack:', result.soundtrack.title);
    console.log('Spotify URL:', result.soundtrack.spotify_url);
    console.log('Total Tracks:', result.soundtrack.track_count);
  } catch (err) {
    console.error('Resolution Error:', err.message);
  }
})();
