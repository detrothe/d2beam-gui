
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
export function testNumber(wert: any, zeile: number, spalte: number, id: any) {
    //--------------------------------------------------------------------------------------------

    //console.log("id", id.rows.item(zeile).cells.item(spalte).firstElementChild)
    //id.rows.item(zeile).cells.item(spalte).firstElementChild.classList.add("input_select");

    wert = wert.replace(/,/g, '.');
    //console.log('Komma entfernt',wert);
    if (isNaN(wert)) {
        //window.alert("Das ist keine Zahl ");

        //console.log("ss", zeile + spalte + id);

        id.rows.item(zeile).cells.item(spalte).firstElementChild.classList.add("input_select");
        return 0;
    }
    return wert;
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

//------------------------------------------------------------------------------------------------
export function set_info() {
    //--------------------------------------------------------------------------------------------

    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    let breite = Math.min(clientWidth, 760);
    document.getElementById("id_doc")?.setAttribute("width", breite + "px");
    document.getElementById("id_doc")?.setAttribute("height", clientHeight + "px");
    let left = (clientWidth - breite) / 2
    if (left < 0) left = 0;
    (document.getElementById("id_doc_frame") as HTMLDivElement).style.left = left + 'px';
    //console.log("id_doc_frame", (clientWidth - breite) / 2)
}


//--------------------------------------------------------------------------------------------------------
export function write(str: string, wert?: number) {
    //----------------------------------------------------------------------------------------------------

    const out = document.getElementById('output') as HTMLTextAreaElement;
    if (out) {
        if (wert) out.value += str + wert + "\n";
        else out.value += str + "\n";

        out.scrollTop = out.scrollHeight; // focus on bottom
    }
}
