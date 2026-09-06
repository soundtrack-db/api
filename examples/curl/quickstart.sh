#!/usr/bin/env bash
# SoundtrackDB API Quickstart Examples
# Base URL: https://soundtrackdb.vercel.app

BASE_URL="https://soundtrackdb.vercel.app"

echo "=== 1. Resolve by IMDb ID (e.g. Dune: Part Two - tt15239678) ==="
curl -s "${BASE_URL}/v1/titles/imdb/tt15239678/music" | jq .

echo ""
echo "=== 2. Resolve by TMDB ID (e.g. Oppenheimer - 872585) ==="
curl -s "${BASE_URL}/v1/titles/tmdb/872585/music?type=movie" | jq .

echo ""
echo "=== 3. Search & Auto-Resolve by Title Query ==="
curl -s "${BASE_URL}/v1/titles/resolve?title=Interstellar&year=2014" | jq .

echo ""
echo "=== 4. Check API System Health ==="
curl -s "${BASE_URL}/health" | jq .
