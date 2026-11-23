#!/bin/bash
# Favicons aus icon-quelle/d2beam-favicon.svg erzeugen (Inkscape + ImageMagick), Aufruf im Projektordner:
#   ./icon-quelle/favicon-erzeugen.sh
set -e
Q=icon-quelle/d2beam-favicon.svg
T=$(mktemp -d)
for s in 16 32 48; do inkscape "$Q" --export-type=png --export-filename="$T/$s.png" -w $s -h $s 2>/dev/null; done
magick "$T/16.png" "$T/32.png" "$T/48.png" public/favicon.ico
cp "$T/48.png" public/favicon-48.png
cp "$Q" public/favicon.svg
rm -r "$T"
ls -la public/favicon.ico public/favicon-48.png public/favicon.svg
