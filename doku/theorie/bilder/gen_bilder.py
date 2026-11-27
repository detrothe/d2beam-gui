#!/usr/bin/env python3
"""Erzeugt die SVG-Zeichnungen für das Theorie-Handbuch.

Aufruf:  python3 gen_bilder.py      (schreibt *.svg in dieses Verzeichnis)

Farben wie in den Vorlesungsfolien: Kräfte rot, Achsen blau, Verformungen schwarz.
z zeigt nach unten, Drehungen und Momente (Konvention II) positiv entgegen dem Uhrzeigersinn.
"""
import math
import os

ROT = '#c00000'
BLAU = '#2f5597'
SCHWARZ = '#000000'
GRAU = '#808080'
KNOTEN = '#ddd9c3'
FONT = "DejaVu Sans, Arial, Helvetica, sans-serif"

HIER = os.path.dirname(os.path.abspath(__file__))


class Svg:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.items = []

    def add(self, s):
        self.items.append(s)

    # ---------------------------------------------------------------- Grundelemente
    def line(self, x1, y1, x2, y2, color=SCHWARZ, width=2.0, dash=None, cap='butt'):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" '
                 f'stroke-width="{width}" stroke-linecap="{cap}"{d}/>')

    def arrow(self, x1, y1, x2, y2, color=SCHWARZ, width=2.0, head=10.0, dash=None):
        """Linie mit gefüllter Pfeilspitze bei (x2, y2)."""
        ang = math.atan2(y2 - y1, x2 - x1)
        hl = head
        hw = head * 0.42
        bx, by = x2 - hl * math.cos(ang), y2 - hl * math.sin(ang)
        self.line(x1, y1, bx, by, color, width, dash)
        p1 = (bx + hw * math.sin(ang), by - hw * math.cos(ang))
        p2 = (bx - hw * math.sin(ang), by + hw * math.cos(ang))
        self.add(f'<polygon points="{x2:.1f},{y2:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{color}"/>')

    def arc_arrow(self, cx, cy, r, a1, a2, color=ROT, width=2.0, head=10.0):
        """Kreisbogen um (cx, cy) von Winkel a1 nach a2 (Grad, mathematisch im Bildschirm:
        0 = rechts, 90 = oben), Pfeilspitze am Ende a2."""
        def pt(a):
            return cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))
        # Pfeilspitze: Tangente am Ende
        sgn = 1 if a2 > a1 else -1
        # Bogen etwas kürzen, damit die Spitze sauber sitzt
        dl = math.degrees(head / r) * sgn
        x1, y1 = pt(a1)
        xe, ye = pt(a2 - dl)
        large = 1 if abs(a2 - dl - a1) > 180 else 0
        sweep = 0 if sgn > 0 else 1
        self.add(f'<path d="M {x1:.1f} {y1:.1f} A {r} {r} 0 {large} {sweep} {xe:.1f} {ye:.1f}" '
                 f'fill="none" stroke="{color}" stroke-width="{width}"/>')
        x2, y2 = pt(a2)
        ang = math.atan2(y2 - ye, x2 - xe)
        hw = head * 0.42
        p1 = (xe + hw * math.sin(ang), ye - hw * math.cos(ang))
        p2 = (xe - hw * math.sin(ang), ye + hw * math.cos(ang))
        self.add(f'<polygon points="{x2:.1f},{y2:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{color}"/>')

    def arc(self, cx, cy, r, a1, a2, color=SCHWARZ, width=1.2):
        def pt(a):
            return cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))
        x1, y1 = pt(a1)
        x2, y2 = pt(a2)
        sweep = 0 if a2 > a1 else 1
        large = 1 if abs(a2 - a1) > 180 else 0
        self.add(f'<path d="M {x1:.1f} {y1:.1f} A {r} {r} 0 {large} {sweep} {x2:.1f} {y2:.1f}" '
                 f'fill="none" stroke="{color}" stroke-width="{width}"/>')

    def path(self, d, color=SCHWARZ, width=2.0, fill='none', dash=None):
        ds = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{width}"{ds}/>')

    def circle(self, cx, cy, r, fill='white', stroke=SCHWARZ, width=1.5):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>')

    def text(self, x, y, s, size=17, color=SCHWARZ, anchor='middle', italic=False, weight='normal'):
        st = ' font-style="italic"' if italic else ''
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" fill="{color}" '
                 f'text-anchor="{anchor}" font-weight="{weight}"{st}>{s}</text>')

    def sym(self, x, y, base, sub='', size=18, color=SCHWARZ, anchor='middle', italic=True):
        """Formelzeichen mit Index, z. B. sym(x, y, 'M', 'a')."""
        st = ' font-style="italic"' if italic else ''
        s = base
        if sub:
            s += f'<tspan dy="5" font-size="{0.72 * size:.0f}" font-style="normal">{sub}</tspan>'
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" fill="{color}" '
                 f'text-anchor="{anchor}"{st}>{s}</text>')

    def knoten(self, x, y, name, sub=''):
        self.circle(x, y, 15, fill=KNOTEN, stroke=GRAU, width=1.2)
        self.sym(x, y + 6, name, sub, size=16)

    def dim(self, x1, x2, y, label, sub='', ext_from=None):
        """Horizontale Maßlinie mit Pfeilen an beiden Enden."""
        if ext_from is not None:
            self.line(x1, ext_from, x1, y + 6, GRAU, 0.8)
            self.line(x2, ext_from, x2, y + 6, GRAU, 0.8)
        self.arrow((x1 + x2) / 2, y, x1, y, GRAU, 1.0, head=8)
        self.arrow((x1 + x2) / 2, y, x2, y, GRAU, 1.0, head=8)
        self.sym((x1 + x2) / 2, y - 6, label, sub, size=16)

    def save(self, name):
        body = '\n'.join(self.items)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
               f'viewBox="0 0 {self.w} {self.h}">\n'
               f'<rect width="100%" height="100%" fill="white"/>\n{body}\n</svg>\n')
        with open(os.path.join(HIER, name + '.svg'), 'w', encoding='utf-8') as f:
            f.write(svg)


# ======================================================================================
def bild_stab_uebersicht():
    """Stabelement mit starren Enden und Gelenken."""
    s = Svg(680, 290)
    y = 95
    xa, xA, xE, xe = 70, 170, 510, 610
    # starre Enden
    s.line(xa, y, xA, y, SCHWARZ, 8)
    s.line(xE, y, xe, y, SCHWARZ, 8)
    # elastischer Teil
    s.line(xA, y, xE, y, SCHWARZ, 3)
    s.line(xA + 5, y + 9, xE - 5, y + 9, SCHWARZ, 1, dash='6,4')
    # Gelenke
    s.circle(xA, y, 6)
    s.circle(xE, y, 6)
    # Knoten
    s.knoten(xa, y - 38, 'K', 'a')
    s.knoten(xe, y - 38, 'K', 'e')
    s.sym(xA, y - 16, 'a', size=17)
    s.sym(xE, y - 16, 'e', size=17)
    s.text((xa + xA) / 2, y - 14, 'starr', 13, GRAU)
    s.text((xE + xe) / 2, y - 14, 'starr', 13, GRAU)
    s.text((xA + xE) / 2, y - 14, 'elastisch (Timoshenko)', 13, GRAU)
    s.text(xA + 18, y + 34, 'Gelenk', 13, GRAU, anchor='start')
    s.text(xE - 18, y + 34, 'Gelenk', 13, GRAU, anchor='end')
    # lokale Achsen
    s.arrow(xa + 260, y + 40, xa + 320, y + 40, BLAU, 2)
    s.arrow(xa + 260, y + 40, xa + 260, y + 85, BLAU, 2)
    s.sym(xa + 330, y + 45, 'x', 'L', color=BLAU, anchor='start')
    s.sym(xa + 270, y + 90, 'z', 'L', color=BLAU, anchor='start')
    # Bemaßung
    yd = 225
    s.dim(xa, xA, yd, 'ℓ', 'a', ext_from=y + 8)
    s.dim(xA, xE, yd, 'L', '', ext_from=y + 14)
    s.dim(xE, xe, yd, 'ℓ', 'e', ext_from=y + 8)
    yd2 = 270
    s.dim(xa, xe, yd2, 'L', '0', ext_from=yd + 6)
    s.save('stab_uebersicht')


def bild_stabendgroessen():
    """Stabendgrößen (Konvention II) und Stabendverformungen am elastischen Stab."""
    s = Svg(720, 330)
    y = 110
    xa, xe = 170, 540
    s.line(xa, y, xe, y, SCHWARZ, 5)
    s.line(xa + 5, y + 10, xa + 140, y + 10, SCHWARZ, 1, dash='6,4')
    s.sym(xa - 8, y - 48, 'a', size=18)
    s.sym(xe + 8, y - 48, 'e', size=18)
    # Kräfte links
    s.arrow(xa - 120, y, xa - 30, y, ROT, 4, head=16)
    s.sym(xa - 125, y + 26, 'F', 'a', color=ROT)
    s.arrow(xa - 25, y - 70, xa - 25, y - 4, ROT, 4, head=16)
    s.sym(xa - 40, y - 72, 'V', 'a', color=ROT)
    s.arc_arrow(xa - 75, y + 2, 34, 80, 280, ROT, 4, head=16)
    s.sym(xa - 112, y - 40, 'M', 'a', color=ROT)
    # Kräfte rechts
    s.arrow(xe + 30, y, xe + 120, y, ROT, 4, head=16)
    s.sym(xe + 122, y - 14, 'F', 'e', color=ROT)
    s.arrow(xe + 25, y - 70, xe + 25, y - 4, ROT, 4, head=16)
    s.sym(xe + 40, y - 72, 'V', 'e', color=ROT)
    s.arc_arrow(xe + 75, y + 2, 34, -100, 100, ROT, 4, head=16)
    s.sym(xe + 118, y + 52, 'M', 'e', color=ROT)
    # Verformungen links
    ya2 = y + 70
    s.arrow(xa, y, xa, ya2, SCHWARZ, 1.5)
    s.sym(xa - 18, y + 45, 'w', 'a')
    s.arrow(xa, ya2, xa + 40, ya2, SCHWARZ, 1.5)
    s.sym(xa + 14, ya2 + 26, 'u', 'a')
    # Verformungen rechts
    ye2 = y + 115
    s.arrow(xe, y, xe, ye2, SCHWARZ, 1.5)
    s.sym(xe + 18, y + 60, 'w', 'e')
    s.arrow(xe, ye2, xe + 40, ye2, SCHWARZ, 1.5)
    s.sym(xe + 26, ye2 + 26, 'u', 'e')
    # Biegelinie
    x0, y0 = xa + 40, ya2
    x1, y1 = xe + 40, ye2
    s.path(f'M {x0} {y0} C {x0 + 120} {y0 - 70}, {x1 - 170} {y1 + 90}, {x1} {y1}', ROT, 3)
    # Tangenten und Drehwinkel (positiv entgegen dem Uhrzeigersinn)
    s.line(x0, y0, x0 + 90, y0, SCHWARZ, 1)
    s.line(x0, y0, x0 + 90, y0 - 52, SCHWARZ, 1)
    s.arc_arrow(x0, y0, 70, 0, 30, SCHWARZ, 1.5, head=9)
    s.sym(x0 + 92, y0 - 12, 'φ', 'a', anchor='start')
    s.line(x1, y1, x1 - 90, y1, SCHWARZ, 1)
    s.line(x1, y1, x1 - 90, y1 + 30, SCHWARZ, 1)
    s.arc_arrow(x1, y1, 75, 180, 198, SCHWARZ, 1.5, head=9)
    s.sym(x1 - 100, y1 + 42, 'φ', 'e')
    # lokale Achsen
    s.arrow(600, 285, 680, 285, BLAU, 2)
    s.sym(690, 290, 'x', 'L', color=BLAU, anchor='start')
    s.arrow(40, 210, 40, 290, BLAU, 2)
    s.sym(52, 300, 'z', 'L', color=BLAU, anchor='start')
    s.save('stabendgroessen')


def bild_schnittgroessen():
    """Positive Schnittgrößen (Konvention I) am infinitesimalen Element."""
    s = Svg(560, 270)
    xl, xr, y = 190, 370, 130
    h = 40
    s.add(f'<rect x="{xl}" y="{y - h / 2}" width="{xr - xl}" height="{h}" fill="#eeeeee" stroke="{SCHWARZ}" stroke-width="1.5"/>')
    s.line(xl, y + h / 2 - 6, xr, y + h / 2 - 6, SCHWARZ, 1, dash='6,4')
    # Streckenlast
    for xx in range(xl + 15, xr, 30):
        s.arrow(xx, y - h / 2 - 50, xx, y - h / 2 - 4, BLAU, 1.5, head=8)
    s.line(xl, y - h / 2 - 50, xr, y - h / 2 - 50, BLAU, 1.5)
    s.sym((xl + xr) / 2 + 30, y - h / 2 - 58, 'q(x)', color=BLAU)
    # linke Schnittfläche (negatives Schnittufer)
    s.arrow(xl - 10, y, xl - 90, y, ROT, 3, head=14)
    s.sym(xl - 100, y + 6, 'N', anchor='end', color=ROT)
    s.arrow(xl - 14, y + 50, xl - 14, y - 10, ROT, 3, head=14)
    s.sym(xl - 30, y + 66, 'V', color=ROT)
    s.arc_arrow(xl - 2, y, 50, 240, 120, ROT, 3, head=14)
    s.sym(xl - 50, y - 48, 'M', color=ROT)
    # rechte Schnittfläche (positives Schnittufer)
    s.arrow(xr + 10, y, xr + 90, y, ROT, 3, head=14)
    s.sym(xr + 100, y + 6, 'N + dN', anchor='start', color=ROT)
    s.arrow(xr + 14, y - 50, xr + 14, y + 10, ROT, 3, head=14)
    s.sym(xr + 30, y + 66, 'V + dV', anchor='start', color=ROT)
    s.arc_arrow(xr + 2, y, 50, -60, 60, ROT, 3, head=14)
    s.sym(xr + 50, y - 48, 'M + dM', anchor='start', color=ROT)
    # dx
    s.dim(xl, xr, 225, 'dx', ext_from=y + h / 2 + 4)
    # Achsen
    s.arrow(30, 230, 90, 230, BLAU, 2)
    s.sym(98, 236, 'x', color=BLAU, anchor='start')
    s.arrow(30, 230, 30, 265, BLAU, 2)
    s.sym(42, 266, 'z', color=BLAU, anchor='start')
    s.save('schnittgroessen')


def bild_kinematik():
    """Timoshenko-Kinematik: Querschnittsdrehung β, Neigung w', Gleitung γ."""
    s = Svg(560, 330)
    cx, cy = 280, 160
    tw = math.radians(22)          # Neigung der Stabachse w'
    tb = math.radians(13)          # Querschnittsdrehung β
    # unverformte Achse und Querschnitt
    s.line(60, cy, 500, cy, GRAU, 1.2, dash='6,4')
    s.line(cx, cy - 120, cx, cy + 120, GRAU, 1.2, dash='6,4')
    # verformte Achse (Tangente)
    dx, dy = math.cos(tw), math.sin(tw)
    s.line(cx - 220 * dx, cy - 220 * dy, cx + 220 * dx, cy + 220 * dy, SCHWARZ, 3)
    # Normale zur Achse (gestrichelt)
    nx, ny = -math.sin(tw), math.cos(tw)
    s.line(cx - 120 * nx, cy - 120 * ny, cx + 120 * nx, cy + 120 * ny, SCHWARZ, 1.2, dash='3,3')
    # Querschnitt (um β gedreht)
    qx, qy = -math.sin(tb), math.cos(tb)
    s.line(cx - 115 * qx, cy - 115 * qy, cx + 115 * qx, cy + 115 * qy, ROT, 4)
    # Winkel
    s.arc(cx, cy, 170, 0, -22, SCHWARZ, 1.2)
    s.text(cx + 180, cy + 40, "w′", 18, italic=True, anchor='start')
    s.arc(cx, cy, 95, -90, -90 - 13, ROT, 1.5)
    s.text(cx - 12, cy + 112, 'β', 18, ROT, italic=True, anchor='end')
    s.arc(cx, cy, 60, 90 - 13, 90 - 22, SCHWARZ, 1.2)
    s.text(cx + 22, cy - 66, 'γ', 18, italic=True, anchor='start')
    s.text(cx + 26 + 110 * nx * -1, cy - 110 * ny * 1 - 6, '⊥ Achse', 13, GRAU, anchor='start')
    s.text(cx - 115 * qx - 8, cy - 115 * qy - 8, 'Querschnitt', 13, ROT, anchor='end')
    s.text(cx + 220 * dx - 10, cy + 220 * dy + 24, 'verformte Stabachse', 13, anchor='end')
    # Achsen
    s.arrow(40, 290, 100, 290, BLAU, 2)
    s.sym(108, 296, 'x', color=BLAU, anchor='start')
    s.arrow(40, 290, 40, 325, BLAU, 2)
    s.sym(52, 326, 'z, w', color=BLAU, anchor='start')
    s.text(530, 300, 'γ = w′ − β', 17, anchor='end', italic=True)
    s.save('kinematik')


def bild_drehung():
    """Gedrehter Stab im globalen System."""
    s = Svg(620, 330)
    ox, oy = 50, 45
    s.arrow(ox, oy, 590, oy, BLAU, 2)
    s.sym(598, oy + 6, 'x', color=BLAU, anchor='start')
    s.arrow(ox, oy, ox, 315, BLAU, 2)
    s.sym(ox + 12, 318, 'z', color=BLAU, anchor='start')
    a = math.radians(25)
    xa, ya = 140, 110
    L = 340
    xe, ye = xa + L * math.cos(a), ya + L * math.sin(a)
    s.line(xa, ya, xe, ye, SCHWARZ, 5)
    s.knoten(xa - 5, ya - 35, 'K', 'a')
    s.knoten(xe + 5, ye - 35, 'K', 'e')
    s.line(xa, ya, xa + 160, ya, SCHWARZ, 1)
    s.arc(xa, ya, 130, 0, -25, SCHWARZ, 1.2)
    s.arrow(xa + 129 * math.cos(math.radians(-5)) , ya + 129 * math.sin(math.radians(5)),
            xa + 130 * math.cos(a), ya + 130 * math.sin(a), SCHWARZ, 1.2, head=8)
    s.sym(xa + 145, ya + 32, 'α')
    # lokale Achsen
    bx, by = xa + 200 * math.cos(a) + 45 * math.sin(a), ya + 200 * math.sin(a) - 45 * math.cos(a)
    s.arrow(bx, by, bx + 90 * math.cos(a), by + 90 * math.sin(a), BLAU, 2)
    s.sym(bx + 100 * math.cos(a) + 6, by + 100 * math.sin(a) - 4, 'x', 'L', color=BLAU, anchor='start')
    s.arrow(xa - 10, ya + 30, xa - 10 - 70 * math.sin(a), ya + 30 + 70 * math.cos(a), BLAU, 2)
    s.sym(xa - 10 - 80 * math.sin(a) - 14, ya + 30 + 80 * math.cos(a) + 10, 'z', 'L', color=BLAU)
    s.text(80, 300, 'α > 0 im Uhrzeigersinn (z nach unten)', 13, GRAU, anchor='start')
    s.save('drehung')


def bild_gedrehtes_lager():
    """Knotensystem eines gedrehten Lagers und Stabrichtung."""
    s = Svg(520, 360)
    ox, oy = 150, 200
    # globales System
    s.arrow(ox, oy, ox + 200, oy, BLAU, 2)
    s.sym(ox + 210, oy + 6, 'x', color=BLAU, anchor='start')
    s.arrow(ox, oy, ox, oy + 140, BLAU, 2)
    s.sym(ox + 12, oy + 148, 'z', color=BLAU, anchor='start')
    # Knotensystem, um ϑ entgegen dem Uhrzeigersinn gedreht
    t = math.radians(35)
    s.arrow(ox, oy, ox + 190 * math.cos(t), oy - 190 * math.sin(t), ROT, 2)
    s.sym(ox + 200 * math.cos(t) + 6, oy - 200 * math.sin(t), "x′", color=ROT, anchor='start')
    s.arrow(ox, oy, ox + 140 * math.sin(t), oy + 140 * math.cos(t), ROT, 2)
    s.sym(ox + 150 * math.sin(t) + 8, oy + 150 * math.cos(t) + 6, "z′", color=ROT, anchor='start')
    s.arc(ox, oy, 120, 0, 35, SCHWARZ, 1.2)
    s.sym(ox + 132, oy - 34, 'ϑ', anchor='start')
    # Stab in Richtung x_L, Winkel α im Uhrzeigersinn
    a = math.radians(20)
    s.line(ox, oy, ox + 230 * math.cos(a), oy + 230 * math.sin(a), SCHWARZ, 5)
    s.sym(ox + 240 * math.cos(a) + 4, oy + 240 * math.sin(a) + 16, 'x', 'L', anchor='start')
    s.arc(ox, oy, 75, 0, -20, SCHWARZ, 1.2)
    s.sym(ox + 84, oy + 22, 'α', anchor='start')
    s.arc(ox, oy, 165, 35, -20, GRAU, 1.0)
    s.text(ox + 172, oy - 44, 'α + ϑ', 15, GRAU, italic=True, anchor='start')
    s.knoten(ox - 32, oy - 26, 'K', '')
    s.save('gedrehtes_lager')


def bild_starres_ende():
    """Kinematik des starren Endes."""
    s = Svg(560, 260)
    kx, ky = 110, 150
    l = 300
    t = math.radians(12)
    # unverformt
    s.line(kx, ky, kx + l, ky, GRAU, 7, dash='10,6')
    # verformt (nur Drehung φ_K gezeigt)
    ax, ay = kx + l * math.cos(t), ky - l * math.sin(t)
    s.line(kx, ky, ax, ay, SCHWARZ, 7)
    s.knoten(kx - 40, ky + 10, 'K', 'a')
    s.circle(kx, ky, 4, fill=SCHWARZ)
    s.circle(ax, ay, 4, fill=SCHWARZ)
    s.sym(ax + 16, ay - 4, 'a', anchor='start')
    s.circle(kx + l, ky, 4, fill=GRAU, stroke=GRAU)
    # Drehwinkel
    s.arc_arrow(kx, ky, 150, 0, 12, SCHWARZ, 1.5, head=9)
    s.sym(kx + 165, ky - 14, 'φ', 'K', anchor='start')
    # Verschiebung
    s.arrow(kx + l + 40, ky, kx + l + 40, ay + 2, SCHWARZ, 1.5, head=8)
    s.line(kx + l + 8, ky, kx + l + 48, ky, GRAU, 0.8)
    s.line(ax + 8, ay, kx + l + 48, ay, GRAU, 0.8)
    s.text(kx + l + 52, (ky + ay) / 2 + 6, 'ℓ<tspan dy="5" font-size="12" font-style="normal">a</tspan><tspan dy="-5"> · φ</tspan><tspan dy="5" font-size="12" font-style="normal">K</tspan>',
           17, italic=True, anchor='start')
    s.dim(kx, kx + l, 215, 'ℓ', 'a', ext_from=ky + 10)
    s.save('starres_ende')


def bild_gelenk_starr():
    """Gelenk am Übergang starres Ende / elastischer Stab."""
    s = Svg(600, 220)
    kx, ky = 90, 150
    l = 200
    t = math.radians(12)
    ax, ay = kx + l * math.cos(t), ky - l * math.sin(t)
    s.line(kx, ky, kx + l + 260, ky, GRAU, 2, dash='10,6')
    s.line(kx, ky, ax, ay, SCHWARZ, 7)
    # elastischer Stab mit eigener Drehung (im Uhrzeigersinn)
    s.path(f'M {ax} {ay} C {ax + 70} {ay - 33}, {ax + 170} {ky + 10}, {kx + l + 260} {ky + 18}', SCHWARZ, 3)
    s.circle(ax, ay, 7)
    s.knoten(kx - 40, ky + 10, 'K', 'a')
    s.circle(kx, ky, 4, fill=SCHWARZ)
    s.arc_arrow(kx, ky, 130, 0, 12, SCHWARZ, 1.5, head=9)
    s.sym(kx + 145, ky - 10, 'φ', 'K', anchor='start')
    # Tangente elastischer Stab
    tx, ty = math.cos(math.radians(25)), -math.sin(math.radians(25))
    s.line(ax, ay, ax + 110 * tx, ay + 110 * ty, SCHWARZ, 1)
    s.line(ax, ay, ax + 110, ay, SCHWARZ, 1)
    s.arc_arrow(ax, ay, 95, 0, 25, SCHWARZ, 1.5, head=9)
    s.sym(ax + 112, ay - 22, 'φ', 'a', anchor='start')
    s.sym(ax + 4, ay + 30, 'a')
    s.text(ax - 14, ay - 14, 'Gelenk', 13, GRAU, anchor='end')
    s.save('gelenk_starr')


def bild_kraefte_starr():
    """Gleichgewicht am starren Ende (Konvention II)."""
    s = Svg(640, 230)
    kx, ax, y = 170, 450, 120
    s.line(kx, y, ax, y, SCHWARZ, 8)
    s.circle(kx, y, 4, fill='white')
    s.circle(ax, y, 4, fill='white')
    s.sym(kx - 6, y + 34, 'K', 'a', anchor='end')
    s.sym(ax + 8, y + 34, 'a', anchor='start')
    # am Knoten: Stabendgrößen des Gesamtelements (lokale Richtung)
    s.arrow(kx - 110, y, kx - 20, y, ROT, 3.5, head=14)
    s.sym(kx - 112, y - 10, 'F', 'K', color=ROT, anchor='end')
    s.arrow(kx - 15, y - 75, kx - 15, y - 8, ROT, 3.5, head=14)
    s.sym(kx - 30, y - 80, 'V', 'K', color=ROT)
    s.arc_arrow(kx - 60, y + 2, 32, 80, 280, ROT, 3.5, head=14)
    s.sym(kx - 100, y - 40, 'M', 'K', color=ROT)
    # am Punkt a: Kräfte des elastischen Stabes auf das starre Ende = − f_a
    s.arrow(ax + 110, y, ax + 20, y, ROT, 3.5, head=14)
    s.sym(ax + 114, y - 10, 'F', 'a', color=ROT, anchor='start')
    s.arrow(ax + 15, y - 8, ax + 15, y - 75, ROT, 3.5, head=14)
    s.sym(ax + 32, y - 80, 'V', 'a', color=ROT)
    s.arc_arrow(ax + 60, y + 2, 32, 100, -100, ROT, 3.5, head=14)
    s.sym(ax + 100, y - 40, 'M', 'a', color=ROT)
    s.dim(kx, ax, 205, 'ℓ', 'a', ext_from=y + 10)
    s.save('kraefte_starr')


def bild_lastarten():
    """Die fünf Arten der Trapezstreckenlast am schrägen Stab."""
    s = Svg(1030, 250)
    a = math.radians(28)
    titel = ['0: senkrecht auf Stab', '1: global z, Stablänge', '2: global z, Projektion',
             '3: global x, Stablänge', '4: global x, Projektion']
    for i in range(5):
        ox = 25 + i * 196
        xa, ya = ox + 25, 70
        Ls = 140
        xe, ye = xa + Ls * math.cos(a), ya + Ls * math.sin(a)
        s.line(xa, ya, xe, ye, SCHWARZ, 4)
        s.text(ox + 90, 238, titel[i], 13, SCHWARZ)
        n = 6
        for j in range(n + 1):
            t = j / n
            px, py = xa + t * (xe - xa), ya + t * (ye - ya)
            if i == 0:          # senkrecht auf den Stab (in +z_L)
                nx, ny = -math.sin(a), math.cos(a)
                s.arrow(px - 38 * nx, py - 38 * ny, px - 3 * nx, py - 3 * ny, BLAU, 1.4, head=7)
            elif i in (1, 2):   # vertikal
                s.arrow(px, py - 42, px, py - 3, BLAU, 1.4, head=7)
            else:               # horizontal
                s.arrow(px - 42, py, px - 3, py, BLAU, 1.4, head=7)
        if i == 0:
            nx, ny = -math.sin(a), math.cos(a)
            s.line(xa - 38 * nx, ya - 38 * ny, xe - 38 * nx, ye - 38 * ny, BLAU, 1.2)
        elif i in (1, 2):
            s.line(xa, ya - 42, xe, ye - 42, BLAU, 1.2)
        else:
            s.line(xa - 42, ya, xe - 42, ye, BLAU, 1.2)
        if i == 2:              # Bezugslänge: horizontale Projektion
            s.dim(xa, xe, 200, 'L', 'x', ext_from=ye + 8)
        if i == 4:              # Bezugslänge: vertikale Projektion
            s.line(xe + 8, ya, xe + 26, ya, GRAU, 0.8)
            s.line(xe + 8, ye, xe + 26, ye, GRAU, 0.8)
            s.arrow(xe + 20, (ya + ye) / 2, xe + 20, ya, GRAU, 1.0, head=8)
            s.arrow(xe + 20, (ya + ye) / 2, xe + 20, ye, GRAU, 1.0, head=8)
            s.sym(xe + 30, (ya + ye) / 2 + 6, 'L', 'z', size=16, anchor='start')
    s.save('lastarten')


def bild_einzellast():
    """Beidseitig eingespannter Stab mit Einzellast und Einzelmoment."""
    s = Svg(620, 230)
    xa, xe, y = 90, 530, 110
    s.line(xa, y, xe, y, SCHWARZ, 4)
    for xx, sgn in ((xa, -1), (xe, 1)):
        s.line(xx, y - 40, xx, y + 40, SCHWARZ, 2)
        for k in range(-40, 41, 10):
            s.line(xx, y + k, xx + sgn * 10, y + k - 8, SCHWARZ, 1)
    xp = 300
    s.arrow(xp, y - 80, xp, y - 4, ROT, 3.5, head=14)
    s.sym(xp - 14, y - 82, 'P', color=ROT, anchor='end')
    s.arc_arrow(xp, y, 34, -60, 200, ROT, 3, head=12)
    s.sym(xp + 40, y - 30, 'M', color=ROT, anchor='start')
    s.dim(xa, xp, 190, 'x', 'P', ext_from=y + 45)
    s.dim(xa, xe, 222, 'L', ext_from=y + 45)
    s.sym(xa - 8, y - 50, 'a', anchor='end')
    s.sym(xe + 8, y - 50, 'e', anchor='start')
    s.save('einzellast')


def bild_bettung():
    """Elastisch gebetteter Stab (Winkler)."""
    s = Svg(600, 210)
    xa, xe, y = 70, 530, 80
    s.line(xa, y, xe, y, SCHWARZ, 5)
    for xx in range(xa + 10, xe, 28):
        s.arrow(xx, y - 48, xx, y - 5, BLAU, 1.3, head=7)
    s.line(xa, y - 48, xe, y - 48, BLAU, 1.2)
    s.sym((xa + xe) / 2, y - 56, 'q', color=BLAU)
    yb = 160
    s.line(xa - 10, yb, xe + 10, yb, SCHWARZ, 2)
    for k in range(xa - 10, xe + 10, 12):
        s.line(k, yb, k - 8, yb + 10, SCHWARZ, 1)
    for xx in range(xa + 15, xe, 40):
        pts = []
        n = 6
        for j in range(n + 1):
            yy = y + 5 + (yb - y - 10) * j / n
            dx = 0 if j in (0, n) else (7 if j % 2 else -7)
            pts.append(f'{xx + dx},{yy:.1f}')
        s.add(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{GRAU}" stroke-width="1.5"/>')
    s.sym(xe + 20, (y + yb) / 2 + 6, 'k', '0', anchor='start')
    s.save('bettung')


def bild_starr_momente():
    """Momentenlinie über starre Enden und elastischen Teil."""
    s = Svg(640, 290)
    xK, xa, xe, xKe, y = 80, 180, 480, 580, 60
    s.line(xK, y, xa, y, SCHWARZ, 8)
    s.line(xe, y, xKe, y, SCHWARZ, 8)
    s.line(xa, y, xe, y, SCHWARZ, 3)
    s.knoten(xK, y - 32, 'K', 'a')
    s.knoten(xKe, y - 32, 'K', 'e')
    s.sym(xa, y - 14, 'a')
    s.sym(xe, y - 14, 'e')
    # Momentenlinie (unten positiv): Stützmomente negativ an den Knoten
    f = lambda m: y + 90 + 1.0 * m
    MK, Ma = -60, -20
    Me, MKe = -10, -45
    pts = [(xK, f(MK)), (xa, f(Ma))]
    for j in range(1, 20):
        t = j / 20
        xx = xa + t * (xe - xa)
        m = Ma + (Me - Ma) * t + 4 * 95 * t * (1 - t)
        pts.append((xx, f(m)))
    pts += [(xe, f(Me)), (xKe, f(MKe))]
    s.line(xK, y + 90, xKe, y + 90, SCHWARZ, 1)
    d = 'M ' + ' L '.join(f'{px:.1f} {py:.1f}' for px, py in pts)
    s.path(d + f' L {xKe} {y + 90} L {xK} {y + 90} Z', ROT, 2, fill='#f6d5d5')
    for xx in (xK, xa, xe, xKe):
        s.line(xx, y + 6, xx, y + 200, GRAU, 0.8, dash='4,3')
    s.sym(xK - 6, f(MK) + 4, 'M', 'K', size=15, color=ROT, anchor='end')
    s.sym(xa + 6, f(Ma) - 6, 'M(0)', size=15, color=ROT, anchor='start')
    s.sym(xe - 6, f(Me) - 6, 'M(L)', size=15, color=ROT, anchor='end')
    s.text(xK + 50, 280, 'linear', 13, GRAU)
    s.text(xKe - 50, 280, 'linear', 13, GRAU)
    s.text((xa + xe) / 2, 280, 'aus Zustandslinie des elastischen Stabes', 13, GRAU)
    s.save('starr_momente')


if __name__ == '__main__':
    bild_stab_uebersicht()
    bild_stabendgroessen()
    bild_schnittgroessen()
    bild_kinematik()
    bild_drehung()
    bild_gedrehtes_lager()
    bild_starres_ende()
    bild_gelenk_starr()
    bild_kraefte_starr()
    bild_lastarten()
    bild_einzellast()
    bild_bettung()
    bild_starr_momente()
    print('SVG geschrieben')
