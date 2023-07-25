//import './listener.js';

import { drButtonPM } from "../components/dr-button-pm";
import { app } from "./haupt";
//import { testeZahl } from "./utility";
import { resizeTables } from "./haupt";
import { saveAs } from 'file-saver';
//import { current_unit_length, set_current_unit_length } from "./einstellungen"


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
        for ( let ii = 0, f; f = files[ii]; ii++) {

            filename = files[0].name;
            console.log("filename: ", files[0].name);

            const reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                console.log("theFile",theFile)
                return function (e: any) {
                    // Render thumbnail.


                    console.log("in result", e.target.result);
                    let jobj = JSON.parse(e.target.result);
                    console.log("und zurück", jobj);
                    /*
                                            if (jobj.unit_length === undefined) {
                                                console.log("#### jobj.unit_length ####", jobj.unit_length)
                                                set_current_unit_length("cm")
                                            } else {
                                                set_current_unit_length(jobj.unit_length)
                                            }
                    */

                    // in Tabelle schreiben
                    {
                        let el = document.getElementById('id_button_nnodes') as drButtonPM;
                        el.setValue(jobj.nnodes);
                        //let elem = el?.shadowRoot?.getElementById('nnodes') as HTMLInputElement;   // geht auch
                        //elem.value = jobj.nnodes;

                        el = document.getElementById('id_button_nelem') as drButtonPM;
                        el.setValue(jobj.nelem);
                        el = document.getElementById('id_button_nnodalloads') as drButtonPM;
                        el.setValue(jobj.nloads);
                        el = document.getElementById('id_button_nelemloads') as drButtonPM;
                        el.setValue(jobj.neloads);
                    }
                    resizeTables();

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

                    el = document.getElementById('id_elementlasten_tabelle') as HTMLElement;
                    tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

                    nSpalten = tabelle.rows[0].cells.length;

                    for (i = 1; i < tabelle.rows.length; i++) {
                        for (j = 1; j < nSpalten; j++) {
                            let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                            child.value = jobj.elemLoad[i - 1][j - 1];
                        }
                    }

                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsText(f);
            //console.log("f", reader);


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

        let i, j;

        let el = document.getElementById('id_knoten_tabelle') as HTMLElement;
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

        el = document.getElementById('id_elementlasten_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nZeilen = tabelle.rows.length - 1;
        nSpalten = tabelle.rows[0].cells.length - 1;
        const neloads = nZeilen
        const elemload = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1].firstElementChild as HTMLInputElement;
                elemload[i][j] = child.value
            }
        }

        let polyData = {

            'version': 0,

            // 'unit_length': current_unit_length,
            'nnodes': n_nodes,
            'nelem': n_elem,
            'nloads': nloads,
            'neloads': neloads,
            /*
            'Vy': document.getElementById('Vy').value,
            'Vz': document.getElementById('Vz').value,
            'Nx': document.getElementById('Nx').value,
            'Mxp': document.getElementById('Mxp').value,
            'Mxs': document.getElementById('Mxs').value,
            'Momega': document.getElementById('Momega').value,
            'My': document.getElementById('My').value,
            'Mz': document.getElementById('Mz').value,

            'fyRd': document.getElementById('fyRd').value,
            'EMod_ref': document.getElementById('EMod_ref').value,
            'mue_ref': document.getElementById('mue_ref').value,
*/
            'elem': elem,
            'node': node,
            'nodalLoad': nodalload,
            'elemLoad': elemload

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
                    types: [{
                        description: "Text file",
                        accept: { "text/plain": [".txt"] }
                    }]
                });
                //console.log("fileHandle",fileHandle)

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
