//import { set_myScreen, app } from "./index.js";
//console.log("enter einstellungen")
// import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

import { testeZahl } from "./utility.js";
import { touch_support_table, set_touch_support_table } from './globals';
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import { drDialogEinstellungen } from "../components/dr-dialog_einstellungen.js";
import { set_dx_offset_touch_factor, set_dz_offset_touch_factor, set_fangweite_cursor, set_raster_dx, set_raster_dz, set_raster_xmax, set_raster_xmin, set_raster_zmax, set_raster_zmin, set_touch_support } from "./cad.js";
//console.log("vor getElementId")
//document.getElementById("unitLength")?.addEventListener('change', einstellungen);
//document.getElementById("id_body_width")?.addEventListener('change', set_body_width);

export let current_unit_length = 'm'
export let current_unit_stress = 'kN/cm²'
export let unit_length_factor = 1               // Multiplikator von cm nach neuer Einheit
export let unit_stress_factor = 1               // Multiplikator von kN/cm² nach neuer Einheit
export let my_fontsize = '1em'
export let color_table_out = '#CFD915'
export let color_table_in = '#b3ae00'

let old_unit_length = 'cm'
//console.log("vor readLocalStorage")

//readLocalStorage();

// document.documentElement.style.setProperty('--your-variable', '#YOURCOLOR');
// document.querySelector(":root")

//----------------------------------------------------------------------------------------------
export function add_listeners_einstellungen() {
    //----------------------------------------------------------------------------------------------

    document.getElementById("id_cb_saveLocalStorage")?.addEventListener('click', saveLocalStorage);
    document.getElementById("id_cb_deleteLocalStorage")?.addEventListener('click', deleteLocalStorage);

    document.getElementById("id_fontsize")?.addEventListener('change', set_font_size);
    document.getElementById("id_color_table_out")?.addEventListener('change', set_color_table_out);
    document.getElementById("id_color_table_in")?.addEventListener('change', set_color_table_in);

}

/*
//----------------------------------------------------------------------------------------------
function set_body_width() {
    //------------------------------------------------------------------------------------------
    const el = document.getElementById("id_body_width") as HTMLInputElement;
    let wert = Number(testeZahl(el.value))
    //if (wert > document.documentElement.clientWidth) wert = document.documentElement.clientWidth
    if (wert > 200) {  // Mindestbreite, sonst kann man nichts mehr eingeben
        body_width = wert
        set_myScreen()
    }
}
*/
//----------------------------------------------------------------------------------------------
function set_font_size() {
    //------------------------------------------------------------------------------------------

    const el = document.getElementById("id_fontsize") as HTMLInputElement;
    my_fontsize = el.value
    //console.log("my_fontsize", my_fontsize)
    document.body.style.fontSize = my_fontsize
    set_font_size_root(my_fontsize);

    let elements: any
    elements = document.getElementsByClassName("allow-touch-styles");
    for (let i = 0; i < elements.length; i++) {
        console.log("allow-touch-styles", i, elements[i])
    }

    elements = document.getElementsByClassName("lil-gui");
    for (let i = 0; i < elements.length; i++) {
        console.log("lil-gui", i, elements[i])
    }
    /*
    const gui = document.getElementById("panel_gui") as HTMLInputElement;
    console.log("fs gui", gui.style.fontSize)
    */
}

//----------------------------------------------------------------------------------------------
function set_color_table_out() {
    //------------------------------------------------------------------------------------------

    const el = document.getElementById("id_color_table_out") as HTMLInputElement;
    color_table_out = el.value
    //console.log("color_table_out", color_table_out)

    const ntabelle = document.getElementById("nodeTable") as HTMLTableElement;
    ntabelle.style.backgroundColor = color_table_out

    const etabelle = document.getElementById("elemTable") as HTMLTableElement;
    etabelle.style.backgroundColor = color_table_out


}

//----------------------------------------------------------------------------------------------
function set_color_table_in() {
    //------------------------------------------------------------------------------------------

    const el = document.getElementById("id_color_table_in") as HTMLInputElement;
    color_table_in = el.value
    //console.log("color_table_in", color_table_in)


    const ntabelle = document.getElementById("nodeTable") as HTMLTableElement;
    for (let i = 1; i < ntabelle.rows.length; i++) {
        ntabelle.rows[i].cells[0].style.backgroundColor = color_table_in
    }
    const etabelle = document.getElementById("elemTable") as HTMLTableElement;
    for (let i = 1; i < etabelle.rows.length; i++) {
        etabelle.rows[i].cells[0].style.backgroundColor = color_table_in
    }
}

//----------------------------------------------------------------------------------------------
export function set_current_unit_length(unitLength: string) {
    //------------------------------------------------------------------------------------------
    // wird nur beim Einlesen einer Datei verwendet

    current_unit_length = unitLength;
    old_unit_length = unitLength;


    const auswahl = document.getElementById("unitLength") as HTMLInputElement
    auswahl.value = unitLength

    set_unit_factors(unitLength)
    //setNewUnits()


}
/*
//----------------------------------------------------------------------------------------------
function einstellungen() {
    //------------------------------------------------------------------------------------------
    //setNewUnits()

    // vorhandene Tabellen neu ausgeben

    let factor_length: number = 1.0    // Multiplikatoren
    let factor_stress: number = 1.0    // Multiplikatoren

    if (old_unit_length === 'cm' && current_unit_length === 'mm') {
        factor_length = 10.0
        factor_stress = 10.0
    } else if (old_unit_length === 'cm' && current_unit_length === 'm') {
        factor_length = 0.01
        factor_stress = 10.0
    } else if (old_unit_length === 'mm' && current_unit_length === 'cm') {
        factor_length = 0.1
        factor_stress = 0.1
    } else if (old_unit_length === 'mm' && current_unit_length === 'm') {
        factor_length = 0.001
        factor_stress = 1.0
    } else if (old_unit_length === 'm' && current_unit_length === 'mm') {
        factor_length = 1000.0
        factor_stress = 1.0
    } else if (old_unit_length === 'm' && current_unit_length === 'cm') {
        factor_length = 100.0
        factor_stress = 0.1
    }

    let child: HTMLInputElement
    const ntabelle = document.getElementById("nodeTable") as HTMLTableElement;
    let nSpalten = ntabelle.rows[0].cells.length;
    for (let i = 1; i < ntabelle.rows.length; i++) {
        for (let j = 1; j < nSpalten; j++) {
            child = ntabelle.rows[i].cells[j].firstElementChild as HTMLInputElement
            let zahl = Number((parseFloat(child.value) * factor_length).toPrecision(12)) * 1  // Rundungsfehler beseitigen
            child.value = zahl.toString()
        }
    }

    const etabelle = document.getElementById("elemTable") as HTMLTableElement;
    nSpalten = etabelle.rows[0].cells.length;
    for (let i = 1; i < etabelle.rows.length; i++) {
        child = etabelle.rows[i].cells[1].firstElementChild as HTMLInputElement  // Emodul
        //child.value = (parseFloat(child.value) * factor_stress).toString()
        let zahl = Number((parseFloat(child.value) * factor_stress).toPrecision(12)) * 1  // Rundungsfehler beseitigen
        child.value = zahl.toString()

        child = etabelle.rows[i].cells[3].firstElementChild as HTMLInputElement   // Dicke
        //child.value = (parseFloat(child.value) * factor_length).toString()
        zahl = Number((parseFloat(child.value) * factor_length).toPrecision(12)) * 1  // Rundungsfehler beseitigen
        child.value = zahl.toString()
    }

    let el = document.getElementById("EMod_ref") as HTMLInputElement;
    el.value = (parseFloat(el.value) * factor_stress).toString()

    el = document.getElementById("fyRd") as HTMLInputElement;
    el.value = (parseFloat(el.value) * factor_stress).toString()


    old_unit_length = current_unit_length

    set_unit_factors(current_unit_length)

    //setNewUnits()

}
*/
/*
//----------------------------------------------------------------------------------------------
export function setNewUnits() {
    //------------------------------------------------------------------------------------------
    const auswahl = document.getElementById("unitLength") as HTMLInputElement
    const unit = auswahl.value
    console.log("in setNewUnits : ", unit)

    const nTabelle = document.getElementById("nodeTable") as HTMLTableElement;
    let objCells: any
    objCells = nTabelle.rows.item(0).cells;  // Überschrift Punkt zentrieren

    if (unit === 'mm') {
        objCells.item(1).innerHTML = 'y&#772; [mm]'
        objCells.item(2).innerHTML = 'z&#772; [mm]'
    }
    else if (unit === 'cm') {
        objCells.item(1).innerHTML = 'y&#772; [cm]'
        objCells.item(2).innerHTML = 'z&#772; [cm]'
    }
    if (unit === 'm') {
        objCells.item(1).innerHTML = 'y&#772; [m]'
        objCells.item(2).innerHTML = 'z&#772; [m]'
    }

    let dicke: string
    if (app.browserLanguage == 'de') {
        dicke = 'Dicke'
    } else {
        dicke = 'width'
    }
    const eTabelle = document.getElementById("elemTable") as HTMLTableElement;
    objCells = eTabelle.rows.item(0).cells;  // Überschrift Punkt zentrieren

    if (unit === 'mm') {
        objCells.item(1).innerHTML = 'E-Modul [N/mm²]'
        objCells.item(3).innerHTML = dicke + ' t [mm]'
    }
    else if (unit === 'cm') {
        objCells.item(1).innerHTML = 'E-Modul [kN/cm²]'
        objCells.item(3).innerHTML = dicke + ' t [cm]'
    }
    if (unit === 'm') {
        objCells.item(1).innerHTML = 'E-Modul [MN/m²]'
        objCells.item(3).innerHTML = dicke + ' t [m]'
    }

    const el = document.getElementsByClassName("unit_stress")
    console.log("el stress", el)
    for (let i = 0; i < el.length; i++) {
        console.log("innerhtml", el[i].innerHTML, el[i].textContent);
        if (unit === 'mm') {
            el[i].innerHTML = 'N/mm²'
        } else if (unit === 'cm') {
            el[i].innerHTML = 'kN/cm²'
        } else if (unit === 'm') {
            el[i].innerHTML = 'MN/m²'
        }
    }

    current_unit_length = unit

    if (unit === 'mm') {
        current_unit_stress = 'N/mm²'
    } else if (unit === 'cm') {
        current_unit_stress = 'kN/cm²'
    } else if (unit === 'm') {
        current_unit_stress = 'MN/m²'
    }

}
*/

//----------------------------------------------------------------------------------------------
function saveLocalStorage() {
    //------------------------------------------------------------------------------------------

    //    const input = document.getElementById('id_cb_saveLocalStorage') as HTMLInputElement | null;
    console.log("in saveLocalStorage : ")

    let el = document.getElementById("id_fontsize") as HTMLInputElement;
    my_fontsize = el.value

    el = document.getElementById("id_color_table_out") as HTMLInputElement;
    color_table_out = el.value

    el = document.getElementById("id_color_table_in") as HTMLInputElement;
    color_table_in = el.value

    //window.localStorage.setItem('current_unit_length', current_unit_length);
    window.localStorage.setItem('my_fontsize', my_fontsize);
    window.localStorage.setItem('color_table_out', color_table_out);
    window.localStorage.setItem('color_table_in', color_table_in);

    window.localStorage.setItem('touch_support_tables', String(touch_support_table));

    console.log("saveLocalStorage, my_fontsize", my_fontsize)
}


//----------------------------------------------------------------------------------------------
export function readLocalStorage() {
    //------------------------------------------------------------------------------------------

    console.log("enter readLocalStorage")
    /*
    let unitLength = window.localStorage.getItem('current_unit_length');
    //console.log("unit of length found in local storage", unitLength)

    if (unitLength) {
        current_unit_length = unitLength
        old_unit_length = unitLength

        const auswahl = document.getElementById("unitLength") as HTMLInputElement
        auswahl.value = unitLength

        set_unit_factors(unitLength)
    } else {
        console.log("nix gemacht")
    }
*/
    const default_fontsize = window.localStorage.getItem('my_fontsize');
    console.log("fontsize", default_fontsize)
    if (default_fontsize) {
        const el = document.getElementById("id_fontsize") as HTMLInputElement
        console.log("fontsize", el.value, default_fontsize)
        if (el.value !== default_fontsize) {
            el.value = default_fontsize
            my_fontsize = default_fontsize
            document.body.style.fontSize = my_fontsize
            // set css variable
            const root = document.querySelector(':root') as HTMLElement;
            root?.style.setProperty('size-size', my_fontsize);
            set_font_size_root(my_fontsize);
        }
    } else {
        const width = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight)
        const el = document.getElementById("id_fontsize") as HTMLInputElement
        console.log("$$$$", width, el)
        if (width < 380) {
            let size = '0.625em'    // 10
            el.value = size
            my_fontsize = size
            document.body.style.fontSize = size
        }
        else if (width < 420) {
            let size = '0.7em'    // 11
            el.value = size
            my_fontsize = size
            document.body.style.fontSize = size
        } else if (width < 450) {
            let size = '0.75em'    // 12
            el.value = size
            my_fontsize = size
            document.body.style.fontSize = size
        }
        else if (width < 535) {
            let size = '0.875em'  // 14
            el.value = size
            my_fontsize = size
            document.body.style.fontSize = size
        }
    }

    let color = window.localStorage.getItem('color_table_out');
    if (color) {
        const el = document.getElementById("id_color_table_out") as HTMLInputElement
        el.value = color
        color_table_out = color
    }

    color = window.localStorage.getItem('color_table_in');
    if (color) {
        const el = document.getElementById("id_color_table_in") as HTMLInputElement
        el.value = color
        color_table_in = color
    }


    let touch_support = window.localStorage.getItem('touch_support_tables');
    //console.log('touch_support',touch_support)
    if (touch_support) {
        const el = document.getElementById("id_touch_support_tables") as SlCheckbox
        const isTrueSet = (touch_support?.toLowerCase?.() === 'true');
        el.checked = isTrueSet
        set_touch_support_table(isTrueSet)
    } else {
        const el = document.getElementById("id_touch_support_tables") as SlCheckbox
        el.checked = false
        set_touch_support_table(false)
    }


    console.log("exit readLocalStorage")
    console.log("readLocalStorage", my_fontsize, color_table_out, color_table_in)

}

//----------------------------------------------------------------------------------------------
function set_unit_factors(unitLength: string) {
    //------------------------------------------------------------------------------------------

    // Umrechnung von cm in ... , kN/cm² in ...

    if (unitLength === 'mm') {
        unit_length_factor = 10.0
        unit_stress_factor = 10.0   // N/mm²
    } else if (unitLength === 'cm') {
        unit_length_factor = 1.0
        unit_stress_factor = 1.0    // kN/cm²
    } else if (unitLength === 'm') {
        unit_length_factor = 0.01
        unit_stress_factor = 10.0  // MN/m²
    }

}

/*
//----------------------------------------------------------------------------------------------
export function set_table_colors() {
    //------------------------------------------------------------------------------------------

    const ntabelle = document.getElementById("nodeTable") as HTMLTableElement;
    ntabelle.style.backgroundColor = color_table_out
    for (let i = 1; i < ntabelle.rows.length; i++) {
        ntabelle.rows[i].cells[0].style.backgroundColor = color_table_in
    }

    const etabelle = document.getElementById("elemTable") as HTMLTableElement;
    etabelle.style.backgroundColor = color_table_out
    for (let i = 1; i < etabelle.rows.length; i++) {
        etabelle.rows[i].cells[0].style.backgroundColor = color_table_in
    }

}
*/

//----------------------------------------------------------------------------------------------
export function deleteLocalStorage() {
    //------------------------------------------------------------------------------------------
    window.localStorage.clear()
}




// Create a function for getting a variable value
function get_font_size_root() {
    // Get the root element
    let r = document.querySelector(':root');
    // Get the styles (properties and values) for the root
    //@ts-ignore
    var rs = getComputedStyle(r);
    // Alert the value of the --blue variable
    alert("The value of --blue is: " + rs.getPropertyValue('--fsize'));
}

// Create a function for setting a variable value
function set_font_size_root(em: string) {
    // Get the root element
    let r = document.querySelector(':root');
    //@ts-ignore
    r.style.setProperty('--fsize', em);
    //@ts-ignore
    //r.style.setProperty('--sl-line-height-normal', '14px');
}


//----------------------------------------------------------------------------------------------
export function readLocalStorage_cad() {
    //------------------------------------------------------------------------------------------


    let ele = document.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;

    let valueb = window.localStorage.getItem('cad_NO_touch_support')
    console.log("cad_NO_touch_support", valueb)
    if (valueb !== null) {
        if (valueb === 'true') {
            ele.set_NO_touch_support(true)
            set_touch_support(false)
        } else {
            ele.set_NO_touch_support(false)
            set_touch_support(true)
        }
    }

    let value = window.localStorage.getItem('cad_id_fangweite_cursor')
    if (value !== null) {
        ele.set_fangweite_cursor(Number(value))
        set_fangweite_cursor(Number(value));
    }
    value = window.localStorage.getItem('cad_id_fact_lager')
    if (value !== null) ele.set_faktor_lagersymbol(Number(value))

    value = window.localStorage.getItem('cad_id_dx_offset_factor')
    if (value !== null) {
        ele.set_dx_offset(Number(value))
        set_dx_offset_touch_factor(Number(value))
    }
    value = window.localStorage.getItem('cad_id_dz_offset_factor')
    if (value !== null) {
        ele.set_dz_offset(Number(value))
        set_dz_offset_touch_factor(Number(value))
    }

    value = window.localStorage.getItem('cad_id_dx')
    if (value !== null) {
        ele.set_raster_dx(Number(value))
        set_raster_dx(Number(value));
    }
    value = window.localStorage.getItem('cad_id_dz')
    if (value !== null) {
        ele.set_raster_dz(Number(value))
        set_raster_dz(Number(value));
    }
    value = window.localStorage.getItem('cad_id_xmin')
    if (value !== null) {
        ele.set_raster_xmin(Number(value))
        set_raster_xmin(Number(value));
    }
    value = window.localStorage.getItem('cad_id_xmax')
    if (value !== null) {
        ele.set_raster_xmax(Number(value))
        set_raster_xmax(Number(value));
    }
    value = window.localStorage.getItem('cad_id_zmin')
    if (value !== null) {
        ele.set_raster_zmin(Number(value))
        set_raster_zmin(Number(value));
    }
    value = window.localStorage.getItem('cad_id_zmax')
    if (value !== null) {
        ele.set_raster_zmax(Number(value))
        set_raster_zmax(Number(value));
    }



}

console.log("exit einstellungen")

