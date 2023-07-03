
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

    wert = wert.replace(/,/g, '.');
    //console.log('Komma entfernt',wert);
    if (isNaN(wert)) {
        //window.alert("Das ist keine Zahl ");

        console.log("ss", zeile + spalte + id);

        //document.getElementById(id).rows.item(zeile).cells.item(spalte).classList.add("selected");
        return 0;
    }
    return wert;
}

//------------------------------------------------------------------------------------------------
export function myFormat(wert: any, minDecimal: any, maxDecimal: any) {
    //--------------------------------------------------------------------------------------------

    return new Intl.NumberFormat(navigator.language, { minimumFractionDigits: minDecimal, maximumFractionDigits: maxDecimal }).format(wert);
}
