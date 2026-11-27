# App-Test d2beam-gui

Rechnet Testmodelle in der echten App (vite + Chrome headless) und vergleicht die Ergebnisse mit
Sollwerten aus Handrechnungen bzw. exakten Lösungen (siehe Theorie-Handbuch, `doku/theorie/`).

```bash
python3 scripts/apptest/modelle.py          # Modelle nach scripts/apptest/modelle/ schreiben
scripts/apptest/lauf.sh neu                 # alle Modelle rechnen -> scripts/apptest/ergebnisse/neu/
scripts/apptest/lauf.sh neu 't3*'           # nur einzelne Modelle
python3 scripts/apptest/pruefen.py neu      # Soll/Ist-Vergleich
```

- `lauf.sh` braucht `google-chrome`, Node ≥ 22 und freie Ports 5199 (vite) und 9333 (Chrome).
  In der Claude-Code-Sandbox nur ohne Sandbox lauffähig (Chrome braucht Sockets).
- Die Modelle werden per simuliertem Drag & Drop geladen; das automatische Speichern der Eingabe im
  localStorage wird im Testbrowser abgeschaltet.
- Vorher/Nachher-Vergleich: alte Version einer Datei einspielen
  (`git show <commit>:src/pages/timoshenko_beam.ts > src/pages/timoshenko_beam.ts`),
  `lauf.sh alt`, danach `git checkout src/pages/timoshenko_beam.ts`.

| Modell | prüft |
|---|---|
| t1 | Längsverschiebung bei trapezförmiger Längslast |
| t2 | Lastart 4 (x-Projektion) mit starrem Ende |
| t3 | Th. II. O. mit Kombinationsfaktor: N und β entlang des Stabes |
| t4, t5 | vorgegebene Knotenverdrehung mit starrem Ende bzw. Momentengelenk |
| t6–t8 | Th. II. O. mit Stabvorverformung und Elementteilung |
| t9 | Knickeigenwerte mit GSL- und ARPACK-Löser |
| t10 | Eigenfrequenzen ohne/mit Drehträgheit |
| t11 | nichtlineare Berechnung: Fachwerk mit Diagonalen „nur Zug“ |
