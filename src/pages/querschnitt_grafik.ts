// Grafische Darstellung von Querschnitten (Polygon) mit Bemaßung, gezeichnet mit two.js (SVG)
// Koordinaten: y nach rechts, z nach unten, Ursprung Oberkante Mitte, Einheit cm

import Two from 'two.js';
import { saveAs } from 'file-saver';
import { myFormat } from './utility';

/** Bemaßung zwischen zwei Querschnittspunkten p1, p2 (Weltkoordinaten [y, z]) */
export interface TMass {
   richtung: 'h' | 'v';      // h = horizontale Maßlinie (misst y), v = vertikale Maßlinie (misst z)
   p1: [number, number];
   p2: [number, number];
   bezug: number;            // Weltkoordinate (z bei 'h', y bei 'v'), von der aus abstand_px gemessen wird
   abstand_px: number;       // Lage der Maßlinie in Pixel relativ zu bezug (+ = nach unten/rechts)
   hilfslinien?: [boolean, boolean];   // Maßhilfslinien an p1, p2 zeichnen (Default beide)
   text?: string;            // Default: Länge formatiert
   text_neben?: boolean;     // nur 'h': Text rechts neben der Maßlinie statt darüber/darunter
}

export interface TQuerschnittGrafik {
   y: number[];              // Polygonpunkte
   z: number[];
   ys: number;               // Schwerpunkt
   zs: number;
   masse: TMass[];
}

const FARBE_MASS = '#1a4fa0';
const FARBE_UMRISS = '#000000';
const FARBE_FLAECHE = '#d9d9d9';
const FARBE_SCHWERPUNKT = '#c00000';
const FARBE_ACHSE = '#606060';
const FONT = 'system-ui, Arial, sans-serif';
const FONT_SIZE = 13;

// Ränder für Maßketten in Pixel
const RAND_LINKS = 55;
const RAND_RECHTS = 85;
const RAND_OBEN = 40;
const RAND_UNTEN = 40;

const MAX_HOEHE_PX = 280;

//------------------------------------------------------------------------------------------------
function text_breite(str: string) {
   return str.length * FONT_SIZE * 0.6;
}

//------------------------------------------------------------------------------------------------
/**
 * Zeichnet den Querschnitt in container (vorheriger Inhalt wird ersetzt).
 * Gibt das erzeugte SVG-Element zurück.
 */
export function draw_querschnitt(container: HTMLElement, q: TQuerschnittGrafik): SVGSVGElement {
   //---------------------------------------------------------------------------------------------

   container.replaceChildren();

   const ymin = Math.min(...q.y), ymax = Math.max(...q.y);
   const zmin = Math.min(...q.z), zmax = Math.max(...q.z);
   const breite = ymax - ymin;
   const hoehe = zmax - zmin;

   const W = Math.max(260, Math.min(container.clientWidth || 360, 500));
   const verfuegbar_b = W - RAND_LINKS - RAND_RECHTS;

   let s = verfuegbar_b / breite;
   if (hoehe * s > MAX_HOEHE_PX) s = MAX_HOEHE_PX / hoehe;

   const H = Math.ceil(hoehe * s + RAND_OBEN + RAND_UNTEN);

   // Querschnitt horizontal zentrieren innerhalb der Zeichenfläche (ohne Ränder)
   const x0 = RAND_LINKS + (verfuegbar_b - breite * s) / 2 - ymin * s;
   const z0 = RAND_OBEN - zmin * s;
   const px = (y: number) => x0 + y * s;
   const pz = (z: number) => z0 + z * s;

   const two = new Two({ type: Two.Types.svg, width: W, height: H, autostart: false });
   two.appendTo(container);

   // --- Fläche
   const anchors = q.y.map((y, i) => new Two.Anchor(px(y), pz(q.z[i])));
   const poly = new Two.Path(anchors, true, false);
   poly.fill = FARBE_FLAECHE;
   poly.stroke = FARBE_UMRISS;
   poly.linewidth = 1.5;
   poly.join = 'miter';
   two.add(poly);

   // --- Schwerachsen
   const yAchse = two.makeLine(px(ymin) - 25, pz(q.zs), px(ymax) + 12, pz(q.zs));
   yAchse.stroke = FARBE_ACHSE; yAchse.linewidth = 0.8; yAchse.dashes = [8, 3, 2, 3];
   const zAchse = two.makeLine(px(q.ys), pz(zmin) - 8, px(q.ys), pz(zmax) + 12);
   zAchse.stroke = FARBE_ACHSE; zAchse.linewidth = 0.8; zAchse.dashes = [8, 3, 2, 3];

   const ty = new Two.Text('y', px(ymax) + 4, pz(q.zs) - 2, { family: FONT, size: FONT_SIZE, style: 'italic' });
   ty.fill = FARBE_ACHSE; ty.alignment = 'left'; ty.baseline = 'bottom';
   two.add(ty);
   const tz = new Two.Text('z', px(q.ys) + 3, pz(zmax) + 8, { family: FONT, size: FONT_SIZE, style: 'italic' });
   tz.fill = FARBE_ACHSE; tz.alignment = 'left'; tz.baseline = 'middle';
   two.add(tz);

   // --- Schwerpunkt
   const sp = two.makeCircle(px(q.ys), pz(q.zs), 3.5);
   sp.fill = FARBE_SCHWERPUNKT; sp.noStroke();
   const ts = new Two.Text('S', px(q.ys) + 6, pz(q.zs) - 8, { family: FONT, size: FONT_SIZE, weight: 'bold' });
   ts.fill = FARBE_SCHWERPUNKT; ts.alignment = 'left'; ts.baseline = 'middle';
   two.add(ts);

   // --- Bemaßung
   for (const m of q.masse) draw_mass(two, m, px, pz);

   two.update();

   const svg = two.renderer.domElement as SVGSVGElement;
   svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
   svg.style.display = 'block';
   svg.style.maxWidth = '100%';
   svg.style.height = 'auto';
   return svg;
}

//------------------------------------------------------------------------------------------------
function draw_mass(two: Two, m: TMass, px: (y: number) => number, pz: (z: number) => number) {
   //---------------------------------------------------------------------------------------------

   const ext = m.hilfslinien ?? [true, true];
   const UEBERSTAND = 3;   // Hilfslinie über Maßlinie hinaus
   const LUECKE = 2;       // Abstand Hilfslinie vom Bauteil
   const TICK = 4;         // halbe Länge Schrägstrich

   const linie = (x1: number, y1: number, x2: number, y2: number, lw = 0.8) => {
      const l = two.makeLine(x1, y1, x2, y2);
      l.stroke = FARBE_MASS; l.linewidth = lw;
   };

   let laenge: number;
   let a1: number, a2: number;   // Pixelposition der Endpunkte entlang der Maßlinie
   let lage: number;             // Pixelposition der Maßlinie quer dazu

   if (m.richtung === 'h') {
      laenge = Math.abs(m.p2[0] - m.p1[0]);
      a1 = px(m.p1[0]); a2 = px(m.p2[0]);
      lage = pz(m.bezug) + m.abstand_px;
      const pts = [m.p1, m.p2];
      pts.forEach((p, i) => {
         if (!ext[i]) return;
         const zp = pz(p[1]);
         const dir = Math.sign(lage - zp) || 1;
         linie(px(p[0]), zp + dir * LUECKE, px(p[0]), lage + dir * UEBERSTAND, 0.6);
      });
      linie(a1, lage, a2, lage);
      for (const a of [a1, a2]) linie(a - TICK, lage + TICK, a + TICK, lage - TICK, 1.4);
   } else {
      laenge = Math.abs(m.p2[1] - m.p1[1]);
      a1 = pz(m.p1[1]); a2 = pz(m.p2[1]);
      lage = px(m.bezug) + m.abstand_px;
      const pts = [m.p1, m.p2];
      pts.forEach((p, i) => {
         if (!ext[i]) return;
         const yp = px(p[0]);
         const dir = Math.sign(lage - yp) || 1;
         linie(yp + dir * LUECKE, pz(p[1]), lage + dir * UEBERSTAND, pz(p[1]), 0.6);
      });
      linie(lage, a1, lage, a2);
      for (const a of [a1, a2]) linie(lage - TICK, a + TICK, lage + TICK, a - TICK, 1.4);
   }

   const str = m.text ?? myFormat(laenge, 0, 2);
   const tb = text_breite(str);
   const amin = Math.min(a1, a2), amax = Math.max(a1, a2);

   const txt = new Two.Text(str, 0, 0, { family: FONT, size: FONT_SIZE });
   txt.fill = FARBE_MASS;

   if (m.richtung === 'h' && m.text_neben) {
      txt.alignment = 'left';
      txt.baseline = 'middle';
      txt.position.set(amax + TICK + 3, lage);
   } else {
      // Text mittig; wenn er nicht zwischen die Schrägstriche passt, vor den Anfang,
      // und falls dort kein Platz bis zum Rand ist, hinter das Ende
      let am = (amin + amax) / 2;
      if (amax - amin < tb + 6) {
         am = amin - 6 - tb / 2;
         if (am - tb / 2 < 2) am = amax + 6 + tb / 2;
      }

      // Text auf der vom Querschnitt abgewandten Seite der Maßlinie
      const aussen = m.abstand_px < 0 ? -1 : 1;
      txt.alignment = 'center';
      if (m.richtung === 'h') {
         txt.baseline = aussen < 0 ? 'bottom' : 'top';
         txt.position.set(am, lage + aussen * 3);
      } else {
         // nach Drehung um -90° zeigt die Oberseite des Textes nach links
         txt.baseline = aussen < 0 ? 'bottom' : 'top';
         txt.position.set(lage + aussen * 3, am);
         txt.rotation = -Math.PI / 2;
      }
   }
   two.add(txt);
}

//------------------------------------------------------------------------------------------------
/** SVG als Datei speichern */
export async function export_svg(svg: SVGSVGElement, dateiname: string) {
   //---------------------------------------------------------------------------------------------

   const quelle = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + new XMLSerializer().serializeToString(svg);
   const blob = new Blob([quelle], { type: 'image/svg+xml;charset=utf-8' });

   const name = (dateiname.trim().replace(/[\\/:*?"<>|\s]+/g, '_') || 'querschnitt') + '.svg';

   // @ts-ignore
   if (typeof window.showSaveFilePicker === 'function') {
      try {
         // @ts-ignore
         const handle = await window.showSaveFilePicker({
            suggestedName: name,
            types: [{ description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } }],
         });
         const stream = await handle.createWritable();
         await stream.write(blob);
         await stream.close();
      } catch (error: any) {
         if (error?.name !== 'AbortError') alert(error.message);
      }
      return;
   }

   try {
      saveAs(blob, name);
   } catch (error: any) {
      alert(error.message);
   }
}

//------------------------------------------------------------------------------------------------
/** Bemaßung für T-Querschnitt (auch Rechteck mit Flanschbreite = Stegbreite) */
export function grafik_TQ(bf: number, hf: number, bw_o: number, bw_u: number, hw: number, y: number[], z: number[], zs: number): TQuerschnittGrafik {
   //---------------------------------------------------------------------------------------------

   const h = hf + hw;
   const bmax = Math.max(bf, bw_o, bw_u);
   const r_oben = bf / 2;          // rechter Rand Flansch
   const r_unten = bw_u / 2;       // rechter Rand Stegunterkante

   const masse: TMass[] = [
      // Flanschbreite oben
      { richtung: 'h', p1: [-bf / 2, 0], p2: [bf / 2, 0], bezug: 0, abstand_px: -18 },
      // Stegbreite unten
      { richtung: 'h', p1: [-bw_u / 2, h], p2: [bw_u / 2, h], bezug: h, abstand_px: 18 },
      // Stegbreite oben, innen unter dem Flansch
      { richtung: 'h', p1: [-bw_o / 2, hf], p2: [bw_o / 2, hf], bezug: hf, abstand_px: 20, hilfslinien: [false, false], text_neben: true },
      // Kettenmaß rechts: Flanschhöhe, Steghöhe
      { richtung: 'v', p1: [r_oben, 0], p2: [r_oben, hf], bezug: bmax / 2, abstand_px: 18 },
      { richtung: 'v', p1: [bw_o / 2, hf], p2: [r_unten, h], bezug: bmax / 2, abstand_px: 18, hilfslinien: [false, true] },
      // Gesamthöhe
      { richtung: 'v', p1: [r_oben, 0], p2: [r_unten, h], bezug: bmax / 2, abstand_px: 50 },
      // zso links
      { richtung: 'v', p1: [-bf / 2, 0], p2: [-bmax / 2, zs], bezug: -bmax / 2, abstand_px: -22, hilfslinien: [true, false] },
   ];

   return { y, z, ys: 0, zs, masse };
}

//------------------------------------------------------------------------------------------------
/** Bemaßung für Rechteck */
export function grafik_rechteck(b: number, h: number): TQuerschnittGrafik {
   //---------------------------------------------------------------------------------------------

   const y = [-b / 2, b / 2, b / 2, -b / 2];
   const z = [0, 0, h, h];
   const masse: TMass[] = [
      { richtung: 'h', p1: [-b / 2, h], p2: [b / 2, h], bezug: h, abstand_px: 18 },
      { richtung: 'v', p1: [b / 2, 0], p2: [b / 2, h], bezug: b / 2, abstand_px: 18 },
      { richtung: 'v', p1: [-b / 2, 0], p2: [-b / 2, h / 2], bezug: -b / 2, abstand_px: -22, hilfslinien: [true, false] },
   ];
   return { y, z, ys: 0, zs: h / 2, masse };
}
