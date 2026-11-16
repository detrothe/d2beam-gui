// Erzeugt die Icons der Werkzeug-Buttons im Tab System als PNG für die Kurzanleitungen
// (public/assets/gui-icons/*.png), direkt aus der laufenden App.
//
// Aufruf:
//   1. Dev-Server starten:   npm run dev-task          (läuft auf http://localhost:5173)
//   2. in zweitem Terminal:  node scripts/gui-icons.mjs [URL]
//
// Benötigt Node >= 22 (fetch, WebSocket) und Chrome oder Chromium. Der Browser wird headless
// gestartet; ein anderer Pfad kann mit der Umgebungsvariablen CHROME angegeben werden.
// Jeder Button wird einzeln mit 4-facher Auflösung (32 px -> 128 px) und transparenten Ecken
// aufgenommen, im hellen Farbschema mit den Standardfarben.

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ADRESSE = process.argv[2] ?? 'http://localhost:5173/';
const ZIEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/assets/gui-icons');
const PORT = 9399;
const SKALIERUNG = 4;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function findeChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'google-chrome-stable']) {
    try { return execFileSync('which', [name]).toString().trim(); } catch { /* weiter */ }
  }
  throw new Error('Chrome/Chromium nicht gefunden, Pfad mit CHROME=... angeben');
}

// Dateiname -> Element im Shadow-DOM von dr-haupt
const SH = `document.getElementById('id_haupt').shadowRoot`;
const ZIELE = [
  ['undo', `${SH}.querySelector('#id_cad_group button[value="undo"]')`],
  ['redo', `${SH}.querySelector('#id_cad_group button[value="redo"]')`],
  ['loeschen', `${SH}.getElementById('id_cad_delete_button')`],
  ['select', `${SH}.getElementById('id_cad_select_button')`],
  ['knoten', `${SH}.getElementById('id_cad_knoten_button')`],
  ['edit_knoten', `${SH}.getElementById('id_cad_edit_knoten_button')`],
  ['stab', `${SH}.getElementById('id_cad_stab_button')`],
  ['lager', `${SH}.getElementById('id_cad_lager_button')`],
  ['knotenlast', `${SH}.getElementById('id_cad_knotenlast_button')`],
  ['elementlast', `${SH}.getElementById('id_cad_elementlast_button')`],
  ['knotenmasse', `${SH}.getElementById('id_cad_knotenmasse_button')`],
  ['einstellungen', `${SH}.getElementById('id_cad_einstellungen_button')`],
  ['reset', `${SH}.getElementById('id_cad_refresh_button')`],
  ['info', `${SH}.getElementById('id_cad_info_button')`],
  ['drawer', `${SH}.getElementById('id_cad_drawer_button')`],
  ['rechnen', `${SH}.getElementById('id_cad_rechnen_button')`],
  ['esc', `${SH}.getElementById('id_button_ESC_cad')`],
  ['vollbild', `${SH}.getElementById('id_button_zurueck_cad')`],
  ['default_querschnitt', `${SH}.getElementById('id_querschnitt_default')`],
];

const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'gui-icons-'));
const chrome = spawn(findeChrome(), [
  '--headless=new', '--no-sandbox', `--user-data-dir=${profil}`, `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });

try {
  let seite;
  for (let i = 0; i < 50 && !seite; i++) {
    await sleep(200);
    try { seite = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { /* Browser startet noch */ }
  }
  if (!seite) throw new Error('Browser nicht erreichbar');

  const ws = new WebSocket(seite.webSocketDebuggerUrl);
  await new Promise((ok, fehler) => { ws.onopen = ok; ws.onerror = fehler; });
  let id = 0; const offen = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && offen[m.id]) { offen[m.id](m); delete offen[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; offen[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async ausdruck => {
    const r = await send('Runtime.evaluate', { expression: ausdruck, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? ausdruck);
    return r.result?.result?.value;
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: SKALIERUNG, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.navigate', { url: ADRESSE });
  for (let i = 0; i < 60; i++) { await sleep(500); if (await ev(`!!document.getElementById('id_haupt')?.shadowRoot?.getElementById('id_cad_rechnen_button')`)) break; }
  await ev(`${SH}.getElementById('id_panel_CAD').click()`);
  await sleep(1500);

  // alles unsichtbar und transparent außer dem gerade aufgenommenen Element (.__cap);
  // clipPath muss sichtbar bleiben, sonst schneiden Clip-Pfade in SVGs alles weg
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await ev(`(() => {
    const st = document.createElement('style');
    st.textContent = 'html,body{background:transparent!important} body *{visibility:hidden!important}';
    document.head.appendChild(st);
    const st2 = document.createElement('style');
    st2.textContent = '*{visibility:hidden!important} .__cap,.__cap *,clipPath,clipPath *{visibility:visible!important}';
    ${SH}.appendChild(st2);
    document.getElementById('id_haupt').style.background = 'transparent';
    ${SH}.getElementById('id_cad_knotenmasse_button').style.display = 'inline-flex';   // sonst nur bei Dynamik sichtbar
    const sel = ${SH}.getElementById('id_querschnitt_default');
    const o = document.createElement('option'); o.text = 'R 40x30'; sel.add(o); sel.value = 'R 40x30';
    ${SH}.getElementById('id_cad_rechnen_button').classList.remove('btn_cad_rechnen_aktiv');
    document.activeElement?.blur();
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1390, y: 890 });   // kein Hover-Effekt

  fs.mkdirSync(ZIEL, { recursive: true });
  const aufnehmen = async (name, sel) => {
    const r = await ev(`(() => { const e = ${sel}; if (!e) return null; e.classList.add('__cap');
      const b = e.getBoundingClientRect(); const x = Math.floor(b.left), y = Math.floor(b.top);
      return { x, y, w: Math.ceil(b.right) - x, h: Math.ceil(b.bottom) - y }; })()`);
    if (!r) { console.warn('nicht gefunden:', name); return; }
    await sleep(150);
    const bild = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
    fs.writeFileSync(path.join(ZIEL, `${name}.png`), Buffer.from(bild.result.data, 'base64'));
    await ev(`${sel}.classList.remove('__cap')`);
    console.log(`${name}.png  ${r.w * SKALIERUNG}x${r.h * SKALIERUNG}`);
  };

  for (const [name, sel] of ZIELE) await aufnehmen(name, sel);
  // Rechnen-Button zusätzlich in der Akzentfarbe (neue Berechnung erforderlich)
  await ev(`${SH}.getElementById('id_cad_rechnen_button').classList.add('btn_cad_rechnen_aktiv')`);
  await aufnehmen('rechnen_aktiv', `${SH}.getElementById('id_cad_rechnen_button')`);

  ws.close();
  console.log(`fertig: ${ZIEL}`);
} finally {
  const beendet = new Promise(r => chrome.once('exit', r));
  chrome.kill();
  await beendet;   // Profil erst löschen, wenn der Browser nicht mehr hineinschreibt
  await sleep(500);   // Hilfsprozesse von Chrome schreiben kurz nach
  try {
    fs.rmSync(profil, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
    console.warn(`temporäres Browser-Profil konnte nicht gelöscht werden: ${profil}`);
  }
}
