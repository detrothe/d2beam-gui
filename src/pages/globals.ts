export let berechnung_erfolgreich = false;
export let berechnung_erforderlich = true;

let txt_berechnung = "Neue Berechnung erforderlich"

export function berechnungErfolgreich(wert:any) {
    berechnung_erfolgreich = wert;
    //document.getElementById("resize")?.setAttribute('disabled', 'true')
//    document.getElementById("rechnen")!.style.color = "#000000"
    document.getElementById("rechnen")!.setAttribute("variant","default")
}
export function berechnungErforderlich(ev=true) { // ev:any
    //console.log("in berechnungErforderlich",ev)
    berechnung_erforderlich = ev;
    //document.getElementById("resize")?.setAttribute('disabled', 'true')
    document.getElementById("rechnen")!.setAttribute("variant","primary")   //style.color = "#dd0000"
    //document.getElementById("rechnen")!.disabled = false
    //document.getElementById("info_berechnung").innerText = txt_berechnung
}

export function set_text_berechnung_erforderlich(txt:string) {
    txt_berechnung = txt
    //document.getElementById("info_berechnung").innerText = txt_berechnung
}

// @ts-ignore
window.berechnungErforderlich = berechnungErforderlich;   // jetzt auch in html sichtbar
