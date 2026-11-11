#!/usr/bin/env bash
# Render scripts/og/og.html → public/og.png (1200×630) dengan Chrome headless.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --virtual-time-budget=2000 --window-size=1200,630 \
  --screenshot="$PWD/public/og.png" "file://$PWD/scripts/og/og.html" 2>/dev/null
echo "public/og.png"
