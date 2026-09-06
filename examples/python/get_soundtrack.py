#!/usr/bin/env python3
"""
SoundtrackDB API Python Client Example
Zero external dependencies required (uses standard library urllib)
"""

import json
import urllib.request
import urllib.parse

BASE_URL = "https://soundtrackdb.vercel.app"

def get_soundtrack_by_imdb(imdb_id: str) -> dict:
    """Resolve verified Spotify soundtrack playlist by IMDb ID (e.g. tt15239678)"""
    url = f"{BASE_URL}/v1/titles/imdb/{urllib.parse.quote(imdb_id)}/music"
    req = urllib.request.Request(url, headers={"User-Agent": "SoundtrackDB-Python-Example/1.0"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP {e.code}: {error_body}")

def search_soundtrack(title: str, year: int = None) -> dict:
    """Search and auto-resolve soundtrack by title name and optional year"""
    params = {"title": title}
    if year:
        params["year"] = str(year)
    
    query_str = urllib.parse.urlencode(params)
    url = f"{BASE_URL}/v1/titles/resolve?{query_str}"
    req = urllib.request.Request(url, headers={"User-Agent": "SoundtrackDB-Python-Example/1.0"})
    
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

if __name__ == "__main__":
    print("Fetching soundtrack for Dune: Part Two (tt15239678)...")
    data = get_soundtrack_by_imdb("tt15239678")
    
    movie = data.get("title", {})
    soundtrack = data.get("soundtrack", {})
    
    print("=" * 50)
    print(f"Title:       {movie.get('name')} ({movie.get('year')})")
    print(f"IMDb ID:     {movie.get('imdb_id')}")
    print(f"Soundtrack:  {soundtrack.get('title')}")
    print(f"Tracks:      {soundtrack.get('track_count')}")
    print(f"Spotify URL: {soundtrack.get('spotify_url')}")
    print("=" * 50)
