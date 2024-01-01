//import './listener.js';

import { drButtonPM } from "../components/dr-button-pm";
import { app, clearTables, currentFilename, set_current_filename } from "./haupt";
//import { testeZahl } from "./utility";
import { resizeTables } from "./haupt";
import { saveAs } from 'file-saver';

import { nQuerschnittSets, get_querschnittRechteck, get_querschnitt_classname, get_querschnitt_length, set_querschnittszaehler } from "./rechnen"
import { add_rechteck_querschnitt, setSystem } from './rechnen'

//import { current_unit_length, set_current_unit_length } from "./einstellungen"

let lastFileHandle = 'documents';

//------------------------------------------------------------------------------------------------
export function read_daten(eingabedaten: string) {
    //------------------------------------------------------------------------------------------------

    let i, j;

    //console.log("in result", eingabedaten);
    let jobj = JSON.parse(eingabedaten);
    //console.log("und zurück", jobj);


    // in Tabelle schreiben
    {

        let ele = document.getElementById('id_dialog_neue_eingabe') as HTMLElement;
        (ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value = jobj.system;
        setSystem(Number(jobj.system));

        let el = document.getElementById('id_button_nnodes') as drButtonPM;
        //console.log("el",el)
        //console.log("nnodes",jobj.nnodes)
        el.setValue(jobj.nnodes);

        el = document.getElementById('id_button_nelem') as drButtonPM;
        el.setValue(jobj.nelem);
        el = document.getElementById('id_button_nnodalloads') as drButtonPM;
        el.setValue(jobj.nloads);
        el = document.getElementById('id_button_nstreckenlasten') as drButtonPM;
        el.setValue(jobj.nstreckenlasten);

        el = document.getElementById('id_button_neinzellasten') as drButtonPM;
        if (jobj.neinzellasten === undefined) el.setValue(0);
        else el.setValue(jobj.neinzellasten);

        el = document.getElementById('id_button_ntemperaturlasten') as drButtonPM;
        el.setValue(jobj.ntempload);

        el = document.getElementById('id_button_nvorspannungen') as drButtonPM;
        el.setValue(jobj.nvorspannungen);

        el = document.getElementById('id_button_nspannschloesser') as drButtonPM;
        el.setValue(jobj.nspannschloesser);

        el = document.getElementById('id_button_nlastfaelle') as drButtonPM;
        el.setValue(jobj.nloadcases);
        el = document.getElementById('id_button_nkombinationen') as drButtonPM;
        el.setValue(jobj.ncombinations);
        el = document.getElementById('id_button_nstabvorverformungen') as drButtonPM;
        el.setValue(jobj.nstabvorverfomungen);

        el = document.getElementById('id_button_nteilungen') as drButtonPM;
        console.log("jobj.nelteilungen", jobj.nelteilungen)
        if (jobj.nelteilungen === undefined) el.setValue(10);
        else el.setValue(Math.max(jobj.nelteilungen, 1));

        el = document.getElementById('id_button_niter') as drButtonPM;
        if (jobj.n_iter === undefined) el.setValue(5);
        else el.setValue(Math.max(jobj.n_iter, 2));

        el = document.getElementById('id_button_nnodedisps') as drButtonPM;
        if (jobj.nNodeDisps === undefined) el.setValue(0);
        else el.setValue(jobj.nNodeDisps);

        let els = document.getElementById('id_THIIO') as HTMLSelectElement;
        if (jobj.THIIO_flag !== undefined) {
            els.options[jobj.THIIO_flag].selected = true;
        }

        els = document.getElementById('id_maxu_dir') as HTMLSelectElement;
        if (jobj.maxU_dir !== undefined) {
            els.options[jobj.maxU_dir].selected = true;
        }

        let eli = document.getElementById('id_maxu_node') as HTMLInputElement;
        if (jobj.maxU_node !== undefined) eli.value = jobj.maxU_node

        eli = document.getElementById('id_maxu_schief') as HTMLInputElement;
        if (jobj.maxU_schief !== undefined) eli.value = jobj.maxU_schief

        eli = document.getElementById('id_neigv') as HTMLInputElement;
        if (jobj.neigv !== undefined) eli.value = jobj.neigv
    }

    resizeTables();
    clearTables();

    console.log("nach resize")

    if (jobj.system === 1) {
        let el = document.getElementById("id_knoten_tabelle");
        el?.setAttribute("hide_column", String(5));
        el = document.getElementById("id_element_tabelle");
        for (let i = 5; i <= 12; i++)el?.setAttribute("hide_column", String(i));
        el?.setAttribute("hide_column", String(2));
        el = document.getElementById("id_knotenlasten_tabelle");
        el?.setAttribute("hide_column", String(5));
      }


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

    // el?.setAttribute("hide_column", String(9));  // N und V Gelenke entfernen
    // el?.setAttribute("hide_column", String(8));
    // el?.setAttribute("hide_column", String(6));
    // el?.setAttribute("hide_column", String(5));

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

    for (i = 1; i < tabelle.rows.length; i++) {
        for (j = 1; j < nSpalten; j++) {
            let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
            child.value = jobj.stabvorverformung[i - 1][j - 1];
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

    el = document.getElementById('id_kombinationen_tabelle') as HTMLElement;
    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nSpalten = tabelle.rows[0].cells.length;

    for (i = 1; i < tabelle.rows.length; i++) {
        for (j = 1; j < nSpalten; j++) {
            let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
            child.value = jobj.combination[i - 1][j - 1];
        }
    }

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
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsText(f);
            //console.log("f", reader);

            set_current_filename(files[0].name);

        }
    }

    input.click();


}


//------------------------------------------------------------------------------------------------
async function handleFileSelect_save() {
    //--------------------------------------------------------------------------------------------

    //const filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert");
    console.log("in select save");
    //console.log("filename", filename);

    const elem = document.getElementById("id_button_nnodes");

    if (elem) {

        let i, j, nelTeilungen, n_iterationen, THIIO_flag, maxU_node, maxU_dir, maxU_schief, neigv;

        let el = document.getElementById('id_button_nteilungen') as any;
        nelTeilungen = el.nel;

        el = document.getElementById('id_button_niter') as any;
        n_iterationen = el.nel;

        el = document.getElementById('id_THIIO') as HTMLSelectElement;
        THIIO_flag = el.value;

        el = document.getElementById('id_maxu_node') as HTMLSelectElement;
        maxU_node = el.value;

        el = document.getElementById('id_maxu_dir') as HTMLSelectElement;
        maxU_dir = el.value;

        el = document.getElementById('id_maxu_schief') as HTMLElement;
        maxU_schief = el.value

        el = document.getElementById('id_neigv') as HTMLSelectElement;
        neigv = el.value;

        el = document.getElementById('id_dialog_neue_eingabe') as HTMLElement;
        let system = Number((el.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);

        el = document.getElementById('id_knoten_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        console.log("knotentabelle", tabelle)
        let n_nodes = tabelle.rows.length - 1;
        let nSpalten = tabelle.rows[0].cells.length - 1;
        //const neq = nZeilen;
        //const nlf = nSpalten;

        const node = Array.from(Array(n_nodes), () => new Array(nSpalten));

        for (i = 0; i < n_nodes; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
                node[i][j] = child.value;
                //console.log(i,j,c[i][j]);
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

        el = document.getElementById('id_kombinationen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nZeilen = tabelle.rows.length - 1;
        nSpalten = tabelle.rows[0].cells.length - 1;
        const nkombinationen = nZeilen
        const kombination = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
                kombination[i][j] = child.value
            }
        }

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


        let qsClassName = new Array(nQuerschnittSets)
        let qsWerte = Array.from(Array(nQuerschnittSets), () => new Array(12));

        for (i = 0; i < nQuerschnittSets; i++) {
            console.log('get_querschnitt_length', get_querschnitt_length(i))
            qsWerte[i] = get_querschnittRechteck(i)
            qsClassName[i] = get_querschnitt_classname(i)
        }

        let polyData = {

            'version': 1,

            // 'unit_length': current_unit_length,
            'system': system,
            'nnodes': n_nodes,
            'nelem': n_elem,
            'nloads': nloads,
            'nstreckenlasten': nstreckenlasten,
            'neinzellasten': neinzellasten,
            'ntempload': ntemperaturlasten,
            'nvorspannungen': nvorspannungen,
            'nspannschloesser': nspannschloesser,
            'nloadcases': nlastfaelle,
            'ncombinations': nkombinationen,
            'nquerschnittsets': nQuerschnittSets,
            'nstabvorverfomungen': nStabvorverfomungen,
            'nelteilungen': nelTeilungen,
            'n_iter': n_iterationen,
            'THIIO_flag': THIIO_flag,
            'maxU_node': maxU_node,
            'maxU_dir': maxU_dir,
            'maxU_schief': maxU_schief,
            'neigv': neigv,
            'nNodeDisps': nNodeDisps,


            'elem': elem,
            'node': node,
            'nodalLoad': nodalload,
            'streckenlasten': linload,
            'einzellasten': pointload,
            'tempLoad': tempload,
            'sigvload': sigvload,
            'spannload': spannload,
            'stabvorverformung': stabvorverformung,
            'loadcases': lastfaelle,
            'combination': kombination,
            'qsclassname': qsClassName,
            'qswerte': qsWerte,
            'nodeDisp0': nodeDisp0
        };



        let jsonse = JSON.stringify(polyData);

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
                        accept: { "text/plain": [".txt"] }
                    }]
                });
                console.log("fileHandle", fileHandle)
                lastFileHandle = fileHandle

                const fileStream = await fileHandle.createWritable();
                //console.log("fileStream=",fileStream);

                // (C) WRITE FILE
                await fileStream.write(myBlob);
                await fileStream.close();

            } catch (error: any) {
                //alert(error.name);
                alert(error.message);
            }

        } else if (app.isMac) {
            filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert");
            download(filename, jsonse);
        } else {

            //window.alert("showSaveFilePicker UNBEKANNT");
            filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert");
            const myFile = new File([jsonse], filename, { type: "text/plain;charset=utf-8" });
            try {
                saveAs(myFile);
            } catch (error: any) {
                //alert(error.name);
                alert(error.message);
            }

        }

    }

    //  }
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
