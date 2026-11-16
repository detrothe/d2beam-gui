import { msg } from '@lit/localize';

//------------------------------------------------------------------------------------------------
export function testeZahl(wert: any) {
    //--------------------------------------------------------------------------------------------
    wert = wert.replace(/,/g, '.');
    //console.log('Komma entfernt',wert);
    if (isNaN(wert)) {
        //window.alert("Das ist keine Zahl ");

        return 0;
    }
    return wert;
}

//------------------------------------------------------------------------------------------------
export function testNumber(wert: string, zeile: number, spalte: number, id: any) {
    //--------------------------------------------------------------------------------------------

    //console.log("id", id.rows.item(zeile).cells.item(spalte).firstElementChild)
    //id.rows.item(zeile).cells.item(spalte).firstElementChild.classList.add("input_select");

    wert = wert.replace(/,/g, '.');
    //console.log('Komma entfernt',wert);
    // let np = 0, ne = 0;
    // for (let i = 0; i < wert.length; i++) {
    //     if (wert[i] === '.') np++;
    //     if (wert[i] === 'e') ne++;
    //     if (wert[i] === 'E') ne++;
    // }
    // console.log("np,ne", wert, np, ne)
    // //@ts-ignore
    // if (np > 1 || ne > 1) {
    //     write("Das ist keine zulässige Zahl in Zeile " + zeile + ", spalte " + spalte);
    //     return NaN;
    // }

    let nwert = Number(wert)
    if (isNaN(nwert)) {
        write(msg('Das ist keine zulässige Zahl in Zeile')+" " + zeile + ", spalte " + spalte);

        console.log("FEHLER TABELLE", id);

        id.rows.item(zeile).cells.item(spalte).firstElementChild.classList.add("input_select");
        return 0;
    }
    return nwert;
}

//------------------------------------------------------------------------------------------------
export function myFormat(wert: any, minDecimal: any, maxDecimal: any, notation = 0) {
    //--------------------------------------------------------------------------------------------
    if (notation === 0) {
        return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert);
    } else {
        return new Intl.NumberFormat(navigator.language, { notation: "scientific", minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert);

    }
}

// mit Dezimalpunkt , Tausendertrennzeichen entfernt, Anwendung für input-Felder
//------------------------------------------------------------------------------------------------
export function myFormat_en(wert: any, minDecimal: any, maxDecimal: any, notation = 0) {
    //--------------------------------------------------------------------------------------------
    if (notation === 0) {
        return (new Intl.NumberFormat('en', { minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert)).replace(/,/g, '');
    } else {
        wert = wert.replace(/,/g, '.');
        return (new Intl.NumberFormat('en', { notation: "scientific", minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert)).replace(/,/g, '');

    }
}

//------------------------------------------------------------------------------------------------
export function set_info() {
    //--------------------------------------------------------------------------------------------
    // Größe der iframes mit den Kurzdokumentationen im Tab Info: Breite max. 760px, Höhe bis zum
    // unteren Fensterrand, damit nur das iframe scrollt und kein äußerer Scrollbalken entsteht

    const DOC_IDS = ['id_doc_de', 'id_doc_en', 'id_doc_es', 'id_doc_fr', 'id_doc_it'];

    const shadow = document.getElementById('id_haupt')?.shadowRoot;
    if (!shadow) return;

    const frames = DOC_IDS.map(id => shadow.getElementById(id) as HTMLIFrameElement | null)
        .filter((f): f is HTMLIFrameElement => f !== null);
    const sichtbar = frames.find(f => f.offsetParent !== null);

    // erst verkleinern, damit von der alten Größe verursachte Scrollbalken verschwinden,
    // sonst halten sich vertikaler und horizontaler Scrollbalken gegenseitig
    if (sichtbar) for (const f of frames) f.setAttribute('height', '200px');

    const clientWidth = document.documentElement.clientWidth;      // erzwingt Layout mit kleiner Höhe
    const clientHeight = document.documentElement.clientHeight;
    const breite = Math.min(clientWidth, 760);

    for (const f of frames) f.setAttribute('width', breite + 'px');

    const left = Math.max(0, (clientWidth - breite) / 2);
    (shadow.getElementById("id_doc_frame") as HTMLDivElement).style.left = left + 'px';

    // Höhe nur messbar, wenn der Tab Info sichtbar ist (sonst top = 0)
    if (!sichtbar) return;

    let hoehe = clientHeight - sichtbar.getBoundingClientRect().top;
    for (const f of frames) f.setAttribute('height', Math.max(200, hoehe) + 'px');

    // was danach noch übersteht (Innenabstand des Tab-Panels, Footer, ...) abziehen
    const ueberstand = document.documentElement.scrollHeight - clientHeight;
    if (ueberstand > 0) {
        hoehe -= ueberstand;
        for (const f of frames) f.setAttribute('height', Math.max(200, hoehe) + 'px');
    }
}


//--------------------------------------------------------------------------------------------------------
export function write(str: string, wert?: number) {
    //----------------------------------------------------------------------------------------------------

    const elHaupt = document.getElementById('id_haupt');
    let shadow = elHaupt?.shadowRoot;
    if (shadow) {
        const out = shadow.getElementById('output') as HTMLTextAreaElement;
        if (out) {
            if (wert) out.value += str + wert + "\n";
            else out.value += str + "\n";

            out.scrollTop = out.scrollHeight; // focus on bottom
        }
    }
}
