#!/bin/bash
# Baut das Theorie-Handbuch aus timoshenko_theorie.md:
#   HTML  -> ../../public/Theorie_Timoshenko_deutsch.html  (MathML, Bilder eingebettet)
#   DOCX  -> ausgabe/Theorie_Timoshenko_deutsch.docx        (Formeln als Word-/OnlyOffice-Formelobjekte)
#   PDF   -> ausgabe/Theorie_Timoshenko_deutsch.pdf         (XeLaTeX)
# pandoc: im PATH oder unter ~/git-code/tools/pandoc-*/bin/pandoc
set -e
cd "$(dirname "$0")"
PANDOC=$(command -v pandoc || ls -d ~/git-code/tools/pandoc-*/bin/pandoc | tail -1)
QUELLE=timoshenko_theorie.md
NAME=Theorie_Timoshenko_deutsch
mkdir -p ausgabe bilder/png bilder/pdf

# Zeichnungen erzeugen und umwandeln
python3 bilder/gen_bilder.py
for f in bilder/*.svg; do
  b=$(basename "$f" .svg)
  inkscape "$f" --export-type=png --export-dpi=200 --export-filename="bilder/png/$b.png" 2>/dev/null
  inkscape "$f" --export-type=pdf --export-filename="bilder/pdf/$b.pdf" 2>/dev/null
done

GEMEINSAM=(--number-sections --toc --toc-depth=2 -M toc-title="Inhalt")

# HTML (SVG-Bilder)
"$PANDOC" "$QUELLE" -s --mathml --embed-resources --css theorie.css "${GEMEINSAM[@]}" \
  --default-image-extension=svg -o "../../public/$NAME.html"

# Bildpfade für DOCX/PDF umbiegen: bilder/x -> bilder/png/x bzw. bilder/pdf/x
sed 's#](bilder/\([a-z_]*\))#](bilder/png/\1)#' "$QUELLE" > ausgabe/_docx.md
"$PANDOC" ausgabe/_docx.md "${GEMEINSAM[@]}" --default-image-extension=png -o "ausgabe/$NAME.docx"
sed 's#](bilder/\([a-z_]*\))#](bilder/pdf/\1)#' "$QUELLE" > ausgabe/_pdf.md
"$PANDOC" ausgabe/_pdf.md "${GEMEINSAM[@]}" --default-image-extension=pdf --pdf-engine=xelatex \
  -V documentclass=scrartcl -V papersize=a4 -V geometry:margin=2.3cm -V fontsize=11pt \
  -V mainfont="DejaVu Serif" -V sansfont="DejaVu Sans" -V mathfont="Latin Modern Math" \
  -V colorlinks=true -V linkcolor=blue \
  -H latex_kopf.tex -o "ausgabe/$NAME.pdf"
rm -f ausgabe/_docx.md ausgabe/_pdf.md
echo "fertig: public/$NAME.html, ausgabe/$NAME.docx, ausgabe/$NAME.pdf"
