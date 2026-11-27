#!/usr/bin/env python3
"""Vergleicht die Ergebnisse des App-Tests mit den Sollwerten.

Aufruf: python3 scripts/apptest/pruefen.py <name>     (Ordner ergebnisse/<name>/ von lauf.sh)

Die Sollwerte sind Handrechnungen bzw. exakte Lösungen der Differentialgleichung
(siehe Theorie-Handbuch, doku/theorie/sympy/).
"""
import math
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))


def zahl(s):
    """Deutsche Zahl '1.234,56' -> 1234.56"""
    return float(s.strip().replace('.', '').replace(',', '.'))


def lies(name, ordner):
    f = os.path.join(HIER, 'ergebnisse', ordner, name + '.txt')
    if not os.path.exists(f):
        return None
    return open(f, encoding='utf-8').read().split('\n')


def tabelle(zeilen, titel, element=None):
    """Zeilen (als Listen) der ersten Tabelle nach der Überschrift '## titel' (bzw. '## Element n')."""
    start = None
    for i, z in enumerate(zeilen):
        if element is not None and z.strip() == f'## Element {element}':
            start = i
            break
        if element is None and z.startswith('## ' + titel):
            start = i
            break
    if start is None:
        return []
    erg = []
    for z in zeilen[start + 2:]:
        if z.startswith('##') or z.strip() == '':
            break
        erg.append(z.split('\t'))
    return erg


def schnittgroessen(zeilen):
    """alle Zeilen aller Elemente: [x, N, V, M, u, w, beta, ...] als Zahlen"""
    erg = []
    for el in range(1, 50):
        t = tabelle(zeilen, None, element=el)
        if not t:
            break
        for r in t:
            try:
                erg.append([zahl(v) for v in r if v.strip() != ''])
            except ValueError:
                pass
    return erg


def zeile_bei(sg, x):
    for r in sg:
        if abs(r[0] - x) < 1e-6:
            return r
    return None


def alpha_cr(zeilen):
    for z in zeilen:
        if 'αcr[Eigenwert 1]' in z:
            return [zahl(v) for v in re.findall(r'=\s*([-\d.,]+)', z)]
    return []


PRUEFUNGEN = []


def pruefung(name, beschreibung, soll, toleranz):
    def deko(f):
        PRUEFUNGEN.append((name, beschreibung, soll, toleranz, f))
        return f
    return deko


@pruefung('t1_laengslast', 'Trapez-Längslast: u bei x = 2 m [mm]', 2.778, 0.002)
def _(z):
    return zeile_bei(schnittgroessen(z), 2.0)[4]


@pruefung('t2_projektion_x', 'Lastart 4 mit starrem Ende: Summe der Auflagerkräfte x [kN]', 22.93, 0.02)
def _(z):
    return sum(zahl(r[1]) for r in tabelle(z, 'Lagerreaktionen'))


@pruefung('t3_th2_faktor', 'Th. II. O., Faktor 2: N am Stabende [kN]', 0.0, 0.01)
def _(z):
    return zeile_bei(schnittgroessen(z), 4.0)[1]


@pruefung('t3_th2_faktor', 'Th. II. O., Faktor 2: beta bei x = 0,8 m [mrad]', 0.880, 0.002)
def _(z):
    return zeile_bei(schnittgroessen(z), 0.8)[6]


@pruefung('t4_knotenverf_starr', 'Knotenverdrehung mit starrem Ende: Auflagerkraft rechts [kN]', -56.25, 0.01)
def _(z):
    return zahl(tabelle(z, 'Lagerreaktionen')[1][2])


@pruefung('t5_knotenverf_gelenk', 'Knotenverdrehung mit Momentengelenk: Auflagerkraft rechts [kN]', 0.0, 0.01)
def _(z):
    return zahl(tabelle(z, 'Lagerreaktionen')[1][2])


@pruefung('t6_vorverformung_n4', 'Stütze L = 5 m, Vorkrümmung, 4 Elemente: max M [kNm]', 21.146, 0.02)
def _(z):
    return max(r[3] for r in schnittgroessen(z))


@pruefung('t7_vorverformung_L20_n2', 'Stütze L = 20 m, Vorkrümmung, 2 Elemente: max M [kNm]', 20.236, 0.05)
def _(z):
    return max(r[3] for r in schnittgroessen(z))


@pruefung('t8_vorverformung_L20_n8', 'Stütze L = 20 m, Vorkrümmung, 8 Elemente: max M [kNm]', 20.236, 0.02)
def _(z):
    return max(r[3] for r in schnittgroessen(z))


for _name in ('t9_knicken_gsl', 't9b_knicken_arpack'):
    for _i, _soll in enumerate((18.95, 75.84, 170.97)):
        def _f(z, i=_i):
            a = alpha_cr(z)
            return a[i] if len(a) > i else float('nan')
        PRUEFUNGEN.append((_name, f'Knickeigenwert {_i + 1}', _soll, 0.02, _f))


def frequenzen(zeilen):
    return [zahl(r[1]) for r in tabelle(zeilen, 'Eigenwerte')]


# Einfeldträger h = 1 m: Biegeschwingungen exakt nach Euler bzw. Rayleigh (mit Drehträgheit),
# Nr. 2 ist die erste Längsschwingung (173 Hz)
for _name, _sollw in (('t10a_dynamik_drehmasse_false', ((0, 62.832), (2, 251.327))),
                      ('t10b_dynamik_drehmasse_true', ((0, 61.823), (2, 236.262), (3, 496.713)))):
    for _i, _soll in _sollw:
        def _f(z, i=_i):
            fr = frequenzen(z)
            return fr[i] if len(fr) > i else float('nan')
        PRUEFUNGEN.append((_name, f'Eigenfrequenz {_i + 1} [Hz]', _soll, 0.006 * _soll, _f))


def main():
    ordner = sys.argv[1] if len(sys.argv) > 1 else 'neu'
    fehler = 0
    for name, text, soll, tol, f in PRUEFUNGEN:
        z = lies(name, ordner)
        if z is None:
            print(f'  --    {name}: keine Ergebnisdatei')
            continue
        try:
            ist = f(z)
        except Exception as e:      # Tabelle fehlt o. ä.
            ist = float('nan')
            text += f' ({e})'
        ok = not math.isnan(ist) and abs(ist - soll) <= tol
        fehler += 0 if ok else 1
        print(f'  {"ok  " if ok else "FEHLER"} {name}: {text}: ist {ist:.3f}, soll {soll:.3f}')
    print(f'\n{len(PRUEFUNGEN) - fehler} von {len(PRUEFUNGEN)} Prüfungen bestanden')
    sys.exit(1 if fehler else 0)


if __name__ == '__main__':
    main()
