// App-Test d2beam-gui: lädt .d2beam-Dateien per simuliertem Drop (headless Chrome, CDP), rechnet und
// speichert Protokoll und Ergebnistabellen als Text. Aufruf über lauf.sh.
import fs from 'node:fs';
const [,, port, outdir, ...files] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ver = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) return 'EXC: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
for (const f of files) {
  await send('Page.navigate', { url: 'http://localhost:5199/' });
  await sleep(3000);
  await ev('Storage.prototype.setItem = function () {}; localStorage.clear(); true');
  await send('Page.navigate', { url: 'http://localhost:5199/' });
  await sleep(5000);
  const inhalt = fs.readFileSync(f, 'utf8');
  const res = await ev(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const haupt = document.getElementById('id_haupt');
    const walk = (root) => { for (const d of root.querySelectorAll('dialog[open]')) d.close(); for (const e of root.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot); };
    walk(document);
    haupt.shadowRoot.querySelector('sl-tab[panel="tab-haupt"]').click();
    await sleep(500);
    const file = new File([${JSON.stringify(inhalt)}], ${JSON.stringify(f.split('/').pop())}, { type: 'application/json' });
    const dt = new DataTransfer(); dt.items.add(file);
    window.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    await sleep(2500);
    walk(document);
    haupt.shadowRoot.getElementById('rechnen').click();
    await sleep(6000);
    walk(document);
    const out = haupt.shadowRoot.getElementById('output').value;
    const resEl = haupt.shadowRoot.getElementById('id_results');
    const tab = String.fromCharCode(9), nl = String.fromCharCode(10);
    let txt = '';
    for (const node of resEl.querySelectorAll('p, table')) {
      if (node.tagName === 'P') txt += '## ' + node.innerText + nl;
      else for (const row of node.rows) txt += Array.from(row.cells).map(c => c.innerText.trim()).join(tab) + nl;
    }
    return out + nl + '=====RESULTS=====' + nl + txt;
  })()`);
  const name = f.split('/').pop().replace('.d2beam', '.txt');
  fs.writeFileSync(`${outdir}/${name}`, String(res));
  console.log('fertig', name, String(res).length);
}
ws.close(); process.exit(0);
