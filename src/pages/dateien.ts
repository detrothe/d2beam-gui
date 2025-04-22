//import './listener.js';

import "@shoelace-style/shoelace/dist/components/select/select.js";

import { drButtonPM } from "../components/dr-button-pm";
import { app, clearTables, currentFilename, set_current_filename } from "./haupt";
//import { testeZahl } from "./utility";
import { resizeTables } from "./haupt";
import { saveAs } from 'file-saver';
import { write } from './utility'
import { reset_gui } from './mypanelgui'
import { reset_controlpanel_grafik } from './grafik'

import { get_querschnittRechteck, get_querschnitt_classname, get_querschnitt_length } from "./querschnitte"
import { nQuerschnittSets, set_querschnittszaehler, add_rechteck_querschnitt } from "./querschnitte"
import { setSystem, System } from './rechnen'
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import { CADNodes, TCADNode } from "./cad_node";
import { TCAD_Element, TCAD_Knotenlast, TCAD_Lager, TCAD_Stab } from "./CCAD_element";
import {
    init_cad, init_two_cad, list, raster_dx, raster_dz, raster_xmax, raster_xmin, raster_zmax, raster_zmin,
    set_raster_dx, set_raster_dz, two_cad_clear, set_raster_xmin, set_raster_xmax, set_raster_zmin, set_raster_zmax
} from "./cad";
import { CMAXVALUESLOAD, max_Lastfall, max_value_lasten, set_max_lastfall } from "./cad_draw_elementlasten";
import { drDialogEinstellungen } from "../components/dr-dialog_einstellungen";

//import { current_unit_length, set_current_unit_length } from "./einstellungen"

let lastFileHandle = 'documents';

//------------------------------------------------------------------------------------------------
export function read_daten(eingabedaten: string) {
    //------------------------------------------------------------------------------------------------

    let i, j;
    let startTime: any
    let endTime: any
    write('start read_daten')
    startTime = performance.now();

    //console.log("in result", eingabedaten);
    let jobj = JSON.parse(eingabedaten);
    //console.log("und zurück", jobj);

    let version = jobj.version;

    // in Tabelle schreiben
    {

        let ele = document.getElementById('id_dialog_neue_eingabe') as HTMLElement;
        if (jobj.system === undefined) {
            (ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value = String(0);
            setSystem(Number(0));
        } else {
            (ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value = jobj.system;
            setSystem(Number(jobj.system));
        }

        let el = document.getElementById('id_button_nkombinationen') as drButtonPM;
        el.setValue(jobj.ncombinations);

        el = document.getElementById('id_button_nnodes') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nelem') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nkoppelfedern') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nnodalloads') as drButtonPM;
        el.setValue(0);
        el = document.getElementById('id_button_nstreckenlasten') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_neinzellasten') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_ntemperaturlasten') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nvorspannungen') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nspannschloesser') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nlastfaelle') as drButtonPM;
        el.setValue(1);

        el = document.getElementById('id_button_nstabvorverformungen') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_nnodalmass') as drButtonPM;
        el.setValue(0);

        el = document.getElementById('id_button_dyn_neigv') as drButtonPM;
        el.setValue(1);



        el = document.getElementById('id_button_nteilungen') as drButtonPM;
        console.log("jobj.nelteilungen", jobj.nelteilungen)
        if (jobj.nelteilungen === undefined) el.setValue(10);
        else el.setValue(Math.max(jobj.nelteilungen, 1));

        el = document.getElementById('id_button_niter') as drButtonPM;
        if (jobj.n_iter === undefined) el.setValue(5);
        else el.setValue(Math.max(jobj.n_iter, 2));

        let slel = document.getElementById('id_P_delta_option') as SlSelect;
        if (jobj.P_delta === undefined) slel.setAttribute("value", 'false')   //.setValue(false);
        else slel.setAttribute("value", jobj.P_delta)   //.setValue(jobj.P_delta);

        slel = document.getElementById('id_ausgabe_SG_option') as SlSelect;
        if (jobj.ausgabe_SG === undefined) slel.setAttribute("value", 'true')
        else slel.setAttribute("value", jobj.ausgabe_SG)

        slel = document.getElementById('id_eig_solver_option') as SlSelect;
        if (jobj.eig_solver === undefined) slel.setAttribute("value", '1')
        else slel.setAttribute("value", jobj.eig_solver)


        el = document.getElementById('id_button_nnodedisps') as drButtonPM;
        if (jobj.nNodeDisps === undefined) el.setValue(0);
        else el.setValue(jobj.nNodeDisps);


        let els = document.getElementById('id_stadyn') as HTMLSelectElement;
        if (jobj.stadyn == undefined) els.value = '0';
        else els.value = jobj.stadyn;
        if (jobj.stadyn === '1') { // Dynamik : tab clickbar machen
            (document.getElementById("id_tab_mass") as SlSelect).disabled = false;
        } else {
            (document.getElementById("id_tab_mass") as SlSelect).disabled = true;
        }

        els = document.getElementById('id_THIIO') as HTMLSelectElement;
        if (jobj.THIIO_flag === undefined) {
            els.options[0].selected = true;
        } else {
            els.options[jobj.THIIO_flag].selected = true;
        }

        // els = document.getElementById('id_matprop') as HTMLSelectElement;
        // if (jobj.matprop_flag === undefined) {
        //     els.options[0].selected = true;
        // } else {
        //     els.options[jobj.matprop_flag].selected = true;
        // }

        els = document.getElementById('id_maxu_dir') as HTMLSelectElement;
        if (jobj.maxU_dir !== undefined) {
            els.options[jobj.maxU_dir].selected = true;
        }

        let eli = document.getElementById('id_maxu_node') as HTMLInputElement;
        if (jobj.maxU_node !== undefined) eli.value = jobj.maxU_node;

        eli = document.getElementById('id_maxu_schief') as HTMLInputElement;
        if (jobj.maxU_schief !== undefined) eli.value = jobj.maxU_schief;

        el = document.getElementById('id_neigv') as drButtonPM;
        if (jobj.neigv !== undefined) el.setValue(Number(jobj.neigv));
        console.log("neigv", jobj.neigv)

        eli = document.getElementById('id_eps_disp_tol') as HTMLInputElement;
        if (jobj.epsDisp_tol === undefined) eli.value = '1e-5';
        else eli.value = jobj.epsDisp_tol;

        eli = document.getElementById('id_eps_force_tol') as HTMLInputElement;
        if (jobj.epsForce_tol === undefined) eli.value = '1e-8';
        else eli.value = jobj.epsForce_tol;

        eli = document.getElementById('id_iter_neigv') as HTMLInputElement;
        if (jobj.niter_neigv === undefined) eli.value = '500';
        else eli.value = jobj.niter_neigv;

        const txtarea = document.getElementById("freetext") as HTMLTextAreaElement
        console.log("textarea", txtarea.value);
        if (jobj.freetxt !== undefined) txtarea.value = jobj.freetxt;

        set_max_lastfall(jobj.max_Lastfall);
    }

    endTime = performance.now();
    write('vor resizeTables ' + String(endTime - startTime))
    startTime = performance.now();
    resizeTables();
    endTime = performance.now();
    write('time used for resizeTables ' + String(endTime - startTime))
    startTime = performance.now();
    clearTables();
    endTime = performance.now();
    write("time used for clearTables " + String(endTime - startTime))
    startTime = performance.now();

    //if (jobj.system === 1) {
    //hideColumnsForFachwerk();
    // let el = document.getElementById("id_knoten_tabelle");
    // el?.setAttribute("hide_column", String(5));
    // el = document.getElementById("id_element_tabelle");
    // for (let i = 5; i <= 12; i++)el?.setAttribute("hide_column", String(i));
    // el?.setAttribute("hide_column", String(2));
    // el = document.getElementById("id_knotenlasten_tabelle");
    // el?.setAttribute("hide_column", String(5));
    //}

    set_raster_dx(jobj.raster_dx)
    set_raster_dz(jobj.raster_dz)
    set_raster_xmin(jobj.raster_xmin)
    set_raster_xmax(jobj.raster_xmax)
    set_raster_zmin(jobj.raster_zmin)
    set_raster_zmax(jobj.raster_zmax)

    let ele = document.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
    ele.set_raster_dx(jobj.raster_dx)
    ele.set_raster_dz(jobj.raster_dz)

    ele.set_raster_xmin(jobj.raster_xmin)
    ele.set_raster_xmax(jobj.raster_xmax)
    ele.set_raster_zmin(jobj.raster_zmin)
    ele.set_raster_zmax(jobj.raster_zmax)


    let nQuerschnittSets = jobj.nquerschnittsets
    console.log('nQuerschnittSets', nQuerschnittSets)
    for (i = 0; i < nQuerschnittSets; i++) {
        let className = jobj.qsclassname[i]
        if (className === 'QuerschnittRechteck') {
            console.log('classname von Querschnitt ' + i + ' ist QuerschnittRechteck')
            //let wert = new Array(11)
            //for(j=0;j<11;j++)wert[i]=jobj.qswerte[i]
            //console.log('wert',jobj.qswerte[i])
            add_rechteck_querschnitt(jobj.qswerte[i])
        }
    }
    set_querschnittszaehler();

    // console.log("CADNotes length", jobj.cadNodes.length)
    // console.log("CADNotes", jobj.cadNodes)

    for (let i = 0; i < jobj.cadNodes.length; i++) {
        let node = (jobj.cadNodes[i] as TCADNode)
        CADNodes.push(node)
    }

    list.size = 0
    for (let i = 0; i < jobj.elements.length; i++) {
        let element = (jobj.elements[i] as TCAD_Element)
        if (element.className === 'TCAD_Stab') {
            const obj = new TCAD_Stab(null, jobj.elements[i].index1, jobj.elements[i].index2, jobj.elements[i].name_querschnitt, jobj.elements[i].elTyp);
            list.append(obj);
            let neloads = jobj.elements[i].elast.length
            for (let j = 0; j < neloads; j++) {
                if (jobj.elements[i].elast[j].className === 'TCAD_Streckenlast') {
                    obj.add_streckenlast(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].art,
                        jobj.elements[i].elast[j].pL, jobj.elements[i].elast[j].pR)
                }
                else if (jobj.elements[i].elast[j].className === 'TCAD_Einzellast') {
                    obj.add_einzellast(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].xe,
                        jobj.elements[i].elast[j].P, jobj.elements[i].elast[j].M)
                }
                else if (jobj.elements[i].elast[j].className === 'TCAD_Temperaturlast') {
                    obj.add_temperaturlast(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].To,
                        jobj.elements[i].elast[j].Tu)
                }
                else if (jobj.elements[i].elast[j].className === 'TCAD_Vorspannung') {
                    obj.add_vorspannung(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].sigmaV)
                }
                else if (jobj.elements[i].elast[j].className === 'TCAD_Spannschloss') {
                    obj.add_spannschloss(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].ds)
                }
                else if (jobj.elements[i].elast[j].className === 'TCAD_Stabvorverformung') {
                    obj.add_stabvorverformung(jobj.elements[i].elast[j].lastfall, jobj.elements[i].elast[j].w0a,
                        jobj.elements[i].elast[j].w0m, jobj.elements[i].elast[j].w0e)
                }
            }
        }
        else if (element.className === 'TCAD_Lager') {
            const obj = new TCAD_Lager(null,                 jobj.elements[i].index1, jobj.elements[i].node, jobj.elements[i].elTyp);
            list.append(obj);
        }
        else if (element.className === 'TCAD_Knotenlast') {
            const obj = new TCAD_Knotenlast(null,                 jobj.elements[i].index1, jobj.elements[i].knlast, jobj.elements[i].elTyp);
            list.append(obj);
        }
    }

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i)
        console.log("eingelesen", obj)
    };

    max_value_lasten.length = 0
    for (let i = 0; i < jobj.max_value_lasten.length; i++) {
        max_value_lasten.push(new CMAXVALUESLOAD);
        max_value_lasten[i].eload = jobj.max_value_lasten[i].eload;
    }

    for (let i = 0; i < jobj.max_value_lasten.length; i++) {
        console.log("max_value_lasten[i].eload", max_value_lasten[i].eload)
    }

    /*
        let el = document.getElementById('id_knoten_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        let nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.node[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_element_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.elem[i - 1][j - 1];
                //console.log("Element Table ", jobj.elem[i - 1][j - 1])
            }
        }

        el = document.getElementById('id_koppelfedern_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.koppelfedern[i - 1][j - 1];
                //console.log("Element Table ", jobj.elem[i - 1][j - 1])
            }
        }


        el = document.getElementById('id_knotenlasten_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.nodalLoad[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_streckenlasten_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.streckenlasten[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_einzellasten_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.einzellasten[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_temperaturlasten_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.tempLoad[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_vorspannungen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.sigvload[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_spannschloesser_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.spannload[i - 1][j - 1];
            }
        }

        el = document.getElementById('id_stabvorverfomungen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        if (version < 2) {            // ohne Lastfall
            for (i = 1; i < tabelle.rows.length; i++) {
                let child = tabelle.rows[i].cells[1].firstElementChild as HTMLInputElement;
                child.value = jobj.stabvorverformung[i - 1][0];
                child = tabelle.rows[i].cells[2].firstElementChild as HTMLInputElement;
                child.value = '1';

                for (j = 3; j < 6; j++) {
                    child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                    child.value = jobj.stabvorverformung[i - 1][j - 2];
                }
            }
        } else {
            for (i = 1; i < tabelle.rows.length; i++) {
                for (j = 1; j < nSpalten; j++) {
                    let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                    child.value = jobj.stabvorverformung[i - 1][j - 1];
                }
            }
        }

        el = document.getElementById('id_nnodedisps_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.nodeDisp0[i - 1][j - 1];
            }
        }

        console.log("loadcases", jobj.loadcases)
        if (jobj.loadcases !== undefined) {
            console.log("in loadcases")
            el = document.getElementById('id_lastfaelle_tabelle') as HTMLElement;
            tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

            nSpalten = tabelle.rows[0].cells.length;

            for (i = 1; i < tabelle.rows.length; i++) {
                for (j = 1; j < nSpalten; j++) {
                    let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                    child.value = jobj.loadcases[i - 1][j - 1];
                }
            }
        }
    */
    let el = document.getElementById('id_kombinationen_tabelle') as HTMLElement;
    let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    let nSpalten = tabelle.rows[0].cells.length;

    for (i = 1; i < tabelle.rows.length; i++) {
        for (j = 1; j < nSpalten; j++) {
            let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
            child.value = jobj.combination[i - 1][j - 1];
        }
    }

    /*
        el = document.getElementById('id_knotenmassen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nSpalten = tabelle.rows[0].cells.length;

        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                child.value = jobj.nodalmass[i - 1][j - 1];
            }
        }
    */

    endTime = performance.now();
    write('done read_daten ' + String(endTime - startTime))
}

//------------------------------------------------------------------------------------------------
function handleFileSelect_read() {
    //--------------------------------------------------------------------------------------------

    let i, j;

    let input = document.createElement('input') as any;
    input.type = 'file';
    // @ts-ignore
    input.onchange = _ => {
        // you can use this method to get file and perform respective operations
        //let files =   Array.from(input.files);
        //console.log(files);

        //function handleFileSelect_read() {     // evt

        two_cad_clear();

        let files: any
        files = Array.from(input.files);
        //    const files = evt.target.files; // FileList object
        console.log("in select read", files);
        let filename;

        // Loop through the FileList and render image files as thumbnails.
        for (let ii = 0, f; f = files[ii]; ii++) {

            filename = files[0].name;
            console.log("filename: ", files[0].name);

            const reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                console.log("theFile", theFile)
                return function (e: any) {
                    // Render thumbnail.

                    //let jobj = JSON.parse(e.target.result);
                    read_daten(e.target.result)

                    init_two_cad();
                    init_cad(0);
                    reset_controlpanel_grafik();
                    reset_gui();
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsText(f);
            //console.log("f", reader);

            set_current_filename(files[0].name);

            // reset_gui();
            // reset_controlpanel_grafik();

        }
    }

    input.click();
    console.log("nach click in handleFileSelect_read")


}


//------------------------------------------------------------------------------------------------
async function handleFileSelect_save() {
    //--------------------------------------------------------------------------------------------

    //const filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert");
    console.log("in select save");
    //console.log("filename", filename);

    // const elem = document.getElementById("id_button_nnodes");

    // if (elem) {

    let jsonse = str_inputToJSON();

    console.log("stringify", jsonse);

    let filename: any

    if (app.hasFSAccess) {

        //window.alert("showSaveFilePicker bekannt")

        try {
            // (A) CREATE BLOB OBJECT
            const myBlob = new Blob([jsonse], { type: "text/plain" });

            // (B) FILE HANDLER & FILE STREAM
            // @ts-ignore
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: currentFilename,
                startIn: lastFileHandle,
                types: [{
                    description: "Text file",
                    accept: { "text/plain": [".d2beam"] }
                }]
            });
            console.log("fileHandle", fileHandle)
            lastFileHandle = fileHandle

            const fileStream = await fileHandle.createWritable();
            //console.log("fileStream=",fileStream);

            // (C) WRITE FILE
            await fileStream.write(myBlob);
            await fileStream.close();

            set_current_filename(fileHandle.name);

        } catch (error: any) {
            //alert(error.name);
            alert(error.message);
        }

        // } else if (app.isMac) {
        //     filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert", currentFilename);
        //     download(filename, jsonse);
        //     set_current_filename(filename);
    } else {

        //window.alert("showSaveFilePicker UNBEKANNT");
        filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert", currentFilename);
        const myFile = new File([jsonse], filename, { type: "text/plain;charset=utf-8" });
        try {
            saveAs(myFile);
            set_current_filename(filename);
        } catch (error: any) {
            //alert(error.name);
            alert(error.message);
        }

    }


    //}

    //  }
}

export function str_inputToJSON() {


    let i, j, nelTeilungen, n_iterationen, THIIO_flag, maxU_node, maxU_dir, maxU_schief, neigv, P_delta, ausgabe_SG, epsDisp_tol, epsForce_tol, stadyn, dyn_neigv;
    let eig_solver, niter_neigv, nelem_koppelfedern, matprop_flag;

    let el = document.getElementById('id_button_nteilungen') as any;
    nelTeilungen = el.nel;

    el = document.getElementById('id_button_niter') as any;
    n_iterationen = el.nel;

    el = document.getElementById('id_THIIO') as HTMLSelectElement;
    THIIO_flag = el.value;

    el = document.getElementById('id_matprop') as HTMLSelectElement;
    matprop_flag = '0'  //el.value;

    el = document.getElementById('id_stadyn') as HTMLSelectElement;
    stadyn = el.value;

    el = document.getElementById('id_button_dyn_neigv') as any;
    dyn_neigv = el.nel

    el = document.getElementById('id_maxu_node') as HTMLSelectElement;
    maxU_node = el.value;

    el = document.getElementById('id_maxu_dir') as HTMLSelectElement;
    maxU_dir = el.value;

    el = document.getElementById('id_maxu_schief') as HTMLElement;
    maxU_schief = el.value

    el = document.getElementById('id_neigv') as drButtonPM;
    neigv = el.nel;

    el = document.getElementById('id_P_delta_option') as HTMLSelectElement;
    P_delta = el.value;

    el = document.getElementById('id_ausgabe_SG_option') as HTMLSelectElement;
    ausgabe_SG = el.value;

    el = document.getElementById('id_eig_solver_option') as HTMLSelectElement;
    eig_solver = el.value;

    el = document.getElementById('id_eps_disp_tol') as HTMLInputElement;
    epsDisp_tol = el.value;

    el = document.getElementById('id_eps_force_tol') as HTMLInputElement;
    epsForce_tol = el.value;

    el = document.getElementById('id_iter_neigv') as HTMLInputElement;
    niter_neigv = el.value;

    //el = document.getElementById('id_dialog_neue_eingabe') as HTMLElement;
    let system = System; //Number((el.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);

    const txtarea = document.getElementById("freetext") as HTMLTextAreaElement
    console.log("textarea", txtarea.value);
    const freetxt = txtarea.value;

    /*
    el = document.getElementById('id_knoten_tabelle') as HTMLElement;
    let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    console.log("knotentabelle", tabelle)
    let n_nodes = tabelle.rows.length - 1;
    let nSpalten = tabelle.rows[0].cells.length - 1;

    const node = Array.from(Array(n_nodes), () => new Array(nSpalten));

    for (i = 0; i < n_nodes; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            node[i][j] = child.value;
            //console.log(i,j,c[i][j]);
        }
    }

    el = document.getElementById('id_koppelfedern_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nelem_koppelfedern = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;

    const koppelfedern = Array.from(Array(nelem_koppelfedern), () => new Array(nSpalten));

    for (i = 0; i < nelem_koppelfedern; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            koppelfedern[i][j] = child.value
            //console.log(i,j,a[i][j]);
        }
    }

    el = document.getElementById('id_element_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    let n_elem = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;

    const elem = Array.from(Array(n_elem), () => new Array(nSpalten));

    for (i = 0; i < n_elem; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            elem[i][j] = child.value
            //console.log(i,j,a[i][j]);
        }
    }

    el = document.getElementById('id_knotenlasten_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    let nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nloads = nZeilen
    const nodalload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            nodalload[i][j] = child.value
        }
    }

    el = document.getElementById('id_streckenlasten_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nstreckenlasten = nZeilen
    const linload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            linload[i][j] = child.value
        }
    }

    el = document.getElementById('id_einzellasten_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const neinzellasten = nZeilen
    const pointload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            pointload[i][j] = child.value
        }
    }

    el = document.getElementById('id_temperaturlasten_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const ntemperaturlasten = nZeilen
    const tempload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            tempload[i][j] = child.value
        }
    }

    el = document.getElementById('id_vorspannungen_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nvorspannungen = nZeilen
    const sigvload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            sigvload[i][j] = child.value
        }
    }

    el = document.getElementById('id_spannschloesser_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nspannschloesser = nZeilen
    const spannload = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            spannload[i][j] = child.value
        }
    }

    el = document.getElementById('id_stabvorverfomungen_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nStabvorverfomungen = nZeilen
    const stabvorverformung = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            stabvorverformung[i][j] = child.value
        }
    }

    el = document.getElementById('id_lastfaelle_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    nZeilen = tabelle.rows.length - 1;
    nSpalten = tabelle.rows[0].cells.length - 1;
    const nlastfaelle = nZeilen
    const lastfaelle = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            lastfaelle[i][j] = child.value
        }
    }
*/
    el = document.getElementById('id_kombinationen_tabelle') as HTMLElement;
    let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    let nZeilen = tabelle.rows.length - 1;
    let nSpalten = tabelle.rows[0].cells.length - 1;
    const nkombinationen = nZeilen
    const kombination = Array.from(Array(nZeilen), () => new Array(nSpalten));

    for (i = 0; i < nZeilen; i++) {
        for (j = 0; j < nSpalten; j++) {
            let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
            kombination[i][j] = child.value
        }
    }
    /*
        el = document.getElementById('id_nnodedisps_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nZeilen = tabelle.rows.length - 1;
        nSpalten = tabelle.rows[0].cells.length - 1;
        const nNodeDisps = nZeilen
        const nodeDisp0 = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
                nodeDisp0[i][j] = child.value
            }
        }


        el = document.getElementById('id_knotenmassen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nZeilen = tabelle.rows.length - 1;
        nSpalten = tabelle.rows[0].cells.length - 1;
        const nnodalmass = nZeilen
        const nodalmass = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
                nodalmass[i][j] = child.value
            }
        }
    */
    let qsClassName = new Array(nQuerschnittSets)
    let qsWerte = Array.from(Array(nQuerschnittSets), () => new Array(12));

    for (i = 0; i < nQuerschnittSets; i++) {
        console.log('get_querschnitt_length', get_querschnitt_length(i))
        qsWerte[i] = get_querschnittRechteck(i)
        qsClassName[i] = get_querschnitt_classname(i)
    }

    let elements = [] as TCAD_Element[];
    let zuruec: TCAD_Element;
    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Element
        obj.two_obj = null;
        elements.push(obj);
        zuruec = elements[i]
        console.log("zuruec", zuruec)
    };



    let polyData = {

        'created_by': 'd2beam-gui',
        'version': 0,

        // 'unit_length': current_unit_length,
        'system': system,
        // 'nnodes': n_nodes,
        // 'nelem': n_elem,
        // 'nloads': nloads,
        // 'nstreckenlasten': nstreckenlasten,
        // 'neinzellasten': neinzellasten,
        // 'ntempload': ntemperaturlasten,
        // 'nvorspannungen': nvorspannungen,
        // 'nspannschloesser': nspannschloesser,
        // 'nloadcases': nlastfaelle,
        'ncombinations': nkombinationen,
        'nquerschnittsets': nQuerschnittSets,
        // 'nstabvorverfomungen': nStabvorverfomungen,
        'nelteilungen': nelTeilungen,
        'n_iter': n_iterationen,
        'THIIO_flag': THIIO_flag,
        'matprop_flag': matprop_flag,
        'maxU_node': maxU_node,
        'maxU_dir': maxU_dir,
        'maxU_schief': maxU_schief,
        'neigv': neigv,
        // 'nNodeDisps': nNodeDisps,
        'P_delta': P_delta,
        'ausgabe_SG': ausgabe_SG,
        'epsDisp_tol': epsDisp_tol,
        'epsForce_tol': epsForce_tol,
        'stadyn': stadyn,
        // 'nnodalmass': nnodalmass,
        'dyn_neigv': dyn_neigv,
        'eig_solver': eig_solver,
        'niter_neigv': niter_neigv,
        'nelem_koppelfedern': nelem_koppelfedern,
        'freetxt': freetxt,
        'max_Lastfall': max_Lastfall,

        'raster_dx': raster_dx,
        'raster_dz': raster_dz,
        'raster_xmin': raster_xmin,
        'raster_xmax': raster_xmax,
        'raster_zmin': raster_zmin,
        'raster_zmax': raster_zmax,



        // 'elem': elem,
        // 'koppelfedern': koppelfedern,
        // 'node': node,
        // 'nodalLoad': nodalload,
        // 'streckenlasten': linload,
        // 'einzellasten': pointload,
        // 'tempLoad': tempload,
        // 'sigvload': sigvload,
        // 'spannload': spannload,
        // 'stabvorverformung': stabvorverformung,
        // 'loadcases': lastfaelle,
        'combination': kombination,
        'qsclassname': qsClassName,
        'qswerte': qsWerte,
        'cadNodes': CADNodes,
        'elements': elements,
        'max_value_lasten': max_value_lasten,
        // 'nodeDisp0': nodeDisp0,
        // 'nodalmass': nodalmass
    };



    return JSON.stringify(polyData);

}

//document.getElementById('readFile').addEventListener('click', initFileSelect_read, false);

export function addListener_filesave() {
    document.getElementById('readFile')?.addEventListener('click', handleFileSelect_read, false);
    document.getElementById('saveFile')?.addEventListener('click', handleFileSelect_save, false);
}
console.log("ende dateien.ts")

//------------------------------------------------------------------------------------------------
function download(filename: any, text: any) {
    //--------------------------------------------------------------------------------------------
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
