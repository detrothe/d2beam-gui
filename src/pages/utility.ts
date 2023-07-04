
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
export function myFormat(wert: any, minDecimal: any, maxDecimal: any) {
    //--------------------------------------------------------------------------------------------

    return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert);
}
