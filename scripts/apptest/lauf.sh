#!/bin/bash
# App-Test: startet vite (Port 5199) und Chrome headless (Port 9333), lädt alle Modelle aus modelle/
# per simuliertem Drop, rechnet und schreibt die Ausgabe nach ergebnisse/<name>/.
#
# Aufruf (aus dem Repo, außerhalb einer Sandbox, da Chrome Sockets braucht):
#   python3 scripts/apptest/modelle.py
#   scripts/apptest/lauf.sh neu            # alle Modelle
#   scripts/apptest/lauf.sh neu 't3*'      # nur bestimmte Modelle
#   python3 scripts/apptest/pruefen.py neu
set -e
HIER=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HIER/../.." && pwd)
NAME=${1:-neu}
MUSTER=${2:-'t*.d2beam'}
OUT=$HIER/ergebnisse/$NAME; mkdir -p "$OUT"
cd "$REPO"
npx vite --port 5199 --strictPort > "$OUT/vite.log" 2>&1 &
VPID=$!
google-chrome --headless=new --remote-debugging-port=9333 --user-data-dir="$HIER/ergebnisse/chrome-profil" \
  --no-first-run about:blank > "$OUT/chrome.log" 2>&1 &
CPID=$!
for i in $(seq 1 30); do
  curl -s http://127.0.0.1:9333/json/version >/dev/null 2>&1 && curl -s http://localhost:5199/ >/dev/null 2>&1 && break
  sleep 1
done
node "$HIER/runner.mjs" 9333 "$OUT" "$HIER"/modelle/$MUSTER || true
kill $CPID $VPID 2>/dev/null || true
wait 2>/dev/null || true
