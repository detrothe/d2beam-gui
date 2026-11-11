//import './listener.js';

import '@shoelace-style/shoelace/dist/components/select/select.js';

import { alertdialog } from "./confirm_dialog"
import { msg } from '@lit/localize';

import { drButtonPM } from '../components/dr-button-pm';
import { app, currentFilename, set_current_filename } from './haupt';
//import { testeZahl } from "./utility";
import {
    resizeTables,
    clearTables,
    button_eingabe_ueberpruefen,
} from './haupt_2';
import { saveAs } from 'file-saver';
import { myFormat, write } from './utility';
import { reset_gui } from '../components/dr-control-panel';
import { reset_controlpanel_grafik } from './grafik';

import {
    get_querschnittRechteck,
    get_querschnitt_classname,
    get_querschnitt_length,
} from './querschnitte';
import {
    nQuerschnittSets,
    get_max_querschnittszaehler,
    add_rechteck_querschnitt,
} from './querschnitte';
import {
    maxBettung,
    set_maxBettung,
    set_stadyn,
    setSystem,
    stadyn,
    System,
    TLoads,
} from './rechnen';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';
import { CADNodes, reset_ID_counter, TCADNode } from './cad_node';
import {
    TCAD_Element,
    TCAD_Knotenlast,
    TCAD_Knotenmasse,
    TCAD_Knotenverformung,
    TCAD_Lager,
    TCAD_Stab,
    take_cad_seq,
} from './CCAD_element';
import {
    init_cad,
    init_two_cad,
    list,
    undoList,
    raster_dx,
    raster_dz,
    raster_xmax,
    raster_xmin,
    raster_zmax,
    raster_zmin,
    set_raster_dx,
    set_raster_dz,
    set_raster_xmin,
    set_raster_xmax,
    set_raster_zmin,
    set_raster_zmax,
    set_fangweite_cursor,
    get_fangweite_cursor_org,
    set_faktor_lagersymbol,
    set_raster_offset_x,
    set_raster_offset_z,
    raster_offset_x,
    raster_offset_z,
    set_einheit_bemassung,
} from './cad';
import {
    CMAXVALUESLOAD,
    max_Lastfall,
    max_value_lasten,
    set_max_lastfall,
    zero_max_lastfall,
} from './cad_draw_elementlasten';
import { drDialogEinstellungen } from '../components/dr-dialog_einstellungen';
import { drDialogKnotenmasse } from '../components/dr-dialog_knotenmasse';
import { TCAD_Bemassung } from './cad_bemassung';
import { drHaupt } from '../components/dr-haupt';

// import { capabilities, isAbortError } from './saveFile'

//import { current_unit_length, set_current_unit_length } from "./einstellungen"

let lastFileHandle = 'documents';

//------------------------------------------------------------------------------------------------
export function read_daten(eingabedaten: string): boolean {
    //------------------------------------------------------------------------------------------------
    // Rückgabe: true  = Daten eingelesen
    //           false = Datei abgelehnt, es wurde NICHTS verändert
    // Wirft eine Exception, wenn die Datei formal gültig ist, das Einlesen aber mittendrin scheitert
    // (dann ist der Zustand teilweise überschrieben und der Aufrufer muss zurücksetzen).

    console.log('in read_daten()');

    let i, j;
    let startTime: any;
    let endTime: any;
    //write("start read_daten");
    startTime = performance.now();

    // console.log("eingabedaten", eingabedaten);
    let jobj: any;
    try {
        jobj = JSON.parse(eingabedaten);
    } catch (error) {
        console.error('read_daten: kein gültiges JSON', error);
        alertdialog(
            'ok',
            msg('Die gewählte Datei hat kein gültiges Format und kann nicht gelesen werden.')
        );
        return false;
    }
    //console.log("und zurück", jobj);

    let version = jobj?.version;
    let creator = jobj?.created_by;
    if (creator !== 'd2beam-gui') {
        alertdialog(
            'ok',
            msg('Die gewählte Datei ist NICHT für dieses Programm erstellt worden')
        );
        return false;
    }

    // in Tabelle schreiben

    const elHaupt = document.getElementById('id_haupt');
    let shadow = elHaupt?.shadowRoot;
    //console.log("shadow",shadow)
    if (shadow) {
        {
            let ele = shadow?.getElementById(
                'id_dialog_neue_eingabe'
            ) as HTMLElement;
            if (jobj.system === undefined) {
                (
                    ele.shadowRoot?.getElementById('id_system') as HTMLSelectElement
                ).value = String(0);
                setSystem(Number(0));
            } else {
                (
                    ele.shadowRoot?.getElementById('id_system') as HTMLSelectElement
                ).value = jobj.system;
                setSystem(Number(jobj.system));
            }

            if (jobj.dateiname !== undefined) {
                set_current_filename(jobj.dateiname);
            }

            let el = shadow?.getElementById(
                'id_button_nkombinationen'
            ) as drButtonPM;
            el.setValue(jobj.ncombinations);

            el = shadow?.getElementById('id_button_nnodes') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nelem') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nkoppelfedern') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nnodalloads') as drButtonPM;
            el.setValue(0);
            el = shadow?.getElementById('id_button_nstreckenlasten') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_neinzellasten') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_ntemperaturlasten') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nvorspannungen') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nspannschloesser') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nlastfaelle') as drButtonPM;
            el.setValue(jobj.nloadcases);

            el = shadow?.getElementById('id_button_nkombinationen') as drButtonPM;
            el.setValue(jobj.ncombinations);

            el = shadow?.getElementById(
                'id_button_nstabvorverformungen'
            ) as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_nnodalmass') as drButtonPM;
            el.setValue(0);

            el = shadow?.getElementById('id_button_dyn_neigv') as drButtonPM;
            el.setValue(jobj.dyn_neigv);

            el = shadow?.getElementById('id_button_nteilungen') as drButtonPM;
            console.log('jobj.nelteilungen', jobj.nelteilungen);
            if (jobj.nelteilungen === undefined) el.setValue(10);
            else el.setValue(Math.max(jobj.nelteilungen, 1));

            let sel = shadow?.getElementById(
                'id_einheit_kraft_option'
            ) as HTMLSelectElement;
            if (jobj.einheit_kraft === undefined) sel.value = 'kN';
            else sel.value = jobj.einheit_kraft;

            sel = shadow?.getElementById(
                'id_einheit_bemassung'
            ) as HTMLSelectElement;
            if (jobj.einheit_bemassung === undefined) {
                sel.value = 'm';
                set_einheit_bemassung('m');
            } else {
                sel.value = jobj.einheit_bemassung;
                set_einheit_bemassung(jobj.einheit_bemassung);
            }

            el = shadow?.getElementById('id_button_niter') as drButtonPM;
            if (jobj.n_iter === undefined) el.setValue(10);
            else el.setValue(Math.max(jobj.n_iter, 2));

            // let slel = shadow?.getElementById('id_P_delta_option') as SlSelect;
            // if (jobj.P_delta === undefined) slel.setAttribute('value', 'false');
            // //.setValue(false);
            // else slel.setAttribute('value', jobj.P_delta); //.setValue(jobj.P_delta);

            (shadow.getElementById('id_P_delta_option') as HTMLSelectElement).value = String(jobj.P_delta ?? 'false');

            let slel = shadow?.getElementById('id_ausgabe_SG_option') as HTMLSelectElement;
            if (jobj.ausgabe_SG === undefined) slel.value = 'true';
            else slel.value = jobj.ausgabe_SG;

            slel = shadow?.getElementById('id_eig_solver_option') as HTMLSelectElement;
            if (jobj.eig_solver === undefined) slel.value = '1';
            else slel.value = jobj.eig_solver;

            // el = shadow?.getElementById('id_button_nnodedisps_gui') as drButtonPM;
            // if (jobj.nNodeDisps === undefined) el.setValue(0);
            // else el.setValue(jobj.nNodeDisps);

            let els = shadow?.getElementById('id_stadyn') as HTMLSelectElement;
            if (jobj.stadyn == undefined) {
                els.value = '0';
                set_stadyn(0);
            } else {
                els.value = jobj.stadyn;
                set_stadyn(Number(jobj.stadyn));
            }
            if (jobj.stadyn === '1') {
                // Dynamik : tab clickbar machen
                (shadow?.getElementById('id_tab_mass') as SlSelect).disabled = false;
                (
                    shadow?.getElementById(
                        'id_cad_knotenmasse_button'
                    ) as HTMLButtonElement
                ).style.display = 'inline-block';
                //            (shadow?.getElementById('id_dialog_knotenmasse') as drDialogKnotenmasse).set_system(1);
            } else {
                (shadow?.getElementById('id_tab_mass') as SlSelect).disabled = true;
                (
                    shadow?.getElementById(
                        'id_cad_knotenmasse_button'
                    ) as HTMLButtonElement
                ).style.display = 'none';
                //            (shadow?.getElementById('id_dialog_knotenmasse') as drDialogKnotenmasse).set_system(0);
            }

            els = shadow?.getElementById('id_THIIO') as HTMLSelectElement;
            if (jobj.THIIO_flag === undefined) {
                els.options[0].selected = true;
            } else {
                els.options[jobj.THIIO_flag].selected = true;
            }

            els = shadow?.getElementById('id_matprop') as HTMLSelectElement;
            if (jobj.matprop_flag === undefined) {
                els.options[0].selected = true;
            } else {
                els.options[jobj.matprop_flag].selected = true;
            }

            els = shadow?.getElementById('id_maxu_dir') as HTMLSelectElement;
            if (jobj.maxU_dir !== undefined) {
                els.options[jobj.maxU_dir].selected = true;
            }

            let eli = shadow?.getElementById('id_maxu_node_ID') as HTMLInputElement;
            if (jobj.maxU_node_ID !== undefined) eli.value = jobj.maxU_node_ID;

            eli = shadow?.getElementById('id_maxu_schief') as HTMLInputElement;
            if (jobj.maxU_schief !== undefined) eli.value = jobj.maxU_schief;

            el = shadow?.getElementById('id_neigv') as drButtonPM;
            if (jobj.neigv !== undefined) el.setValue(Number(jobj.neigv));
            console.log('neigv', jobj.neigv);

            eli = shadow?.getElementById('id_eps_disp_tol') as HTMLInputElement;
            if (jobj.epsDisp_tol === undefined) eli.value = '1e-5';
            else eli.value = jobj.epsDisp_tol;

            eli = shadow?.getElementById('id_eps_force_tol') as HTMLInputElement;
            if (jobj.epsForce_tol === undefined) eli.value = '1e-8';
            else eli.value = jobj.epsForce_tol;

            eli = shadow?.getElementById('id_iter_neigv') as HTMLInputElement;
            if (jobj.niter_neigv === undefined) eli.value = '500';
            else eli.value = jobj.niter_neigv;

            eli = shadow?.getElementById('id_minMass') as HTMLInputElement;
            if (jobj.minMass === undefined) eli.value = '0.0';
            else eli.value = jobj.minMass;

            const txtarea = shadow?.getElementById(
                'freetext'
            ) as HTMLTextAreaElement;
            console.log('textarea', txtarea.value);
            if (jobj.freetxt !== undefined) txtarea.value = jobj.freetxt;

            zero_max_lastfall();                    // Werte des alten Projekts verwerfen, set_max_lastfall kann nur erhöhen
            set_max_lastfall(jobj.max_Lastfall);
        }

        // endTime = performance.now();

        // write("vor resizeTables: " + myFormat(endTime - startTime, 2, 3) + " msec");
        // startTime = performance.now();

        resizeTables();
        // endTime = performance.now();
        // write("time used for resizeTables: " + myFormat(endTime - startTime, 2, 3) + " msec");
        // startTime = performance.now();

        clearTables();

        // endTime = performance.now();
        // write("time used for clearTables: " + myFormat(endTime - startTime, 2, 3) + " msec");
        // startTime = performance.now();

        //if (jobj.system === 1) {
        //hideColumnsForFachwerk();
        // let el = shadow?.getElementById("id_knoten_tabelle");
        // el?.setAttribute("hide_column", String(5));
        // el = shadow?.getElementById("id_element_tabelle");
        // for (let i = 5; i <= 12; i++)el?.setAttribute("hide_column", String(i));
        // el?.setAttribute("hide_column", String(2));
        // el = shadow?.getElementById("id_knotenlasten_tabelle");
        // el?.setAttribute("hide_column", String(5));
        //}

        set_raster_dx(jobj.raster_dx);
        set_raster_dz(jobj.raster_dz);
        set_raster_xmin(jobj.raster_xmin);
        set_raster_xmax(jobj.raster_xmax);
        set_raster_zmin(jobj.raster_zmin);
        set_raster_zmax(jobj.raster_zmax);
        if (jobj.faktor_lagersymbol === undefined) set_faktor_lagersymbol(1.0);
        else set_faktor_lagersymbol(jobj.faktor_lagersymbol);

        if (jobj.raster_offset_x === undefined) {
            set_raster_offset_x(0.0);
            set_raster_offset_z(0.0);
        } else {
            set_raster_offset_x(jobj.raster_offset_x);
            set_raster_offset_z(jobj.raster_offset_z);
        }

        let ele = shadow?.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
        ele.set_raster_dx(jobj.raster_dx);
        ele.set_raster_dz(jobj.raster_dz);

        ele.set_rasterOffset_x(jobj.raster_offset_x);
        ele.set_rasterOffset_z(jobj.raster_offset_z);

        ele.set_raster_xmin(jobj.raster_xmin);
        ele.set_raster_xmax(jobj.raster_xmax);
        ele.set_raster_zmin(jobj.raster_zmin);
        ele.set_raster_zmax(jobj.raster_zmax);

        if (jobj.fangweite_cursor === undefined || version < 3) {
            set_fangweite_cursor(20);
            ele.set_fangweite_cursor(20);
        } else {
            set_fangweite_cursor(jobj.fangweite_cursor);
            ele.set_fangweite_cursor(jobj.fangweite_cursor);
        }

        if (jobj.maxBettung === undefined) set_maxBettung(0.0);
        else set_maxBettung(jobj.maxBettung);

        let nQuerschnittSets = jobj.nquerschnittsets;
        //console.log('nQuerschnittSets', nQuerschnittSets);
        for (i = 0; i < nQuerschnittSets; i++) {
            let className = jobj.qsclassname[i];
            if (className === 'QuerschnittRechteck') {
                console.log(
                    'classname von Querschnitt ' + i + ' ist QuerschnittRechteck'
                );
                //let wert = new Array(11)
                //for(j=0;j<11;j++)wert[i]=jobj.qswerte[i]
                //console.log('wert',jobj.qswerte[i])
                add_rechteck_querschnitt(jobj.qswerte[i]);
            }
        }
        get_max_querschnittszaehler();

        // {
        //     let el = document.getElementById('id_nnodedisps_tabelle_gui') as HTMLElement;
        //     let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        //     let nSpalten = tabelle.rows[0].cells.length;

        //     for (i = 1; i < tabelle.rows.length; i++) {
        //         for (j = 1; j < nSpalten; j++) {
        //             let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
        //             child.value = jobj.nodeDisp0[i - 1][j - 1];
        //         }
        //     }
        // }
        {
            {
                if (jobj.loadcases !== undefined) {
                    console.log('in loadcases');
                    let el = shadow?.getElementById(
                        'id_lastfaelle_tabelle'
                    ) as HTMLElement;
                    let tabelle = el?.shadowRoot?.getElementById(
                        'mytable'
                    ) as HTMLTableElement;

                    let nSpalten = tabelle.rows[0].cells.length;

                    for (i = 1; i < tabelle.rows.length; i++) {
                        for (j = 1; j < nSpalten; j++) {
                            let child = tabelle.rows[i].cells[j]
                                .firstElementChild as HTMLInputElement;
                            child.value = jobj.loadcases[i - 1][j - 1];
                        }
                    }
                }

                let el = shadow?.getElementById(
                    'id_kombinationen_tabelle'
                ) as HTMLElement;
                let tabelle = el?.shadowRoot?.getElementById(
                    'mytable'
                ) as HTMLTableElement;

                let nSpalten = tabelle.rows[0].cells.length;

                (el as any)?.clear_undo?.();   // Undo der gelöschten Kombinationen gehört zum alten Projekt
                for (i = 1; i < tabelle.rows.length; i++) {
                    for (j = 1; j < nSpalten; j++) {
                        let child = tabelle.rows[i].cells[j]
                            .firstElementChild as HTMLInputElement;
                        child.value = jobj.combination[i - 1][j - 1];
                    }
                }
            }
        }

        // console.log("CADNotes length", jobj.cadNodes.length)
        // console.log("CADNotes", jobj.cadNodes)

        for (let i = 0; i < jobj.cadNodes.length; i++) {
            let node = jobj.cadNodes[i] as TCADNode;
            CADNodes.push(node);
        }
        reset_ID_counter();

        list.clear();          // ist nach clearTables() schon leer, zur Sicherheit
        undoList.clear();      // Redo darf nicht auf Objekte des alten Projekts zugreifen
        const mit_seq = version >= 4;     // ab Version 4 ist die Eingabereihenfolge gespeichert
        for (let i = 0; i < jobj.elements.length; i++) {
            let element = jobj.elements[i] as TCAD_Element;
            const anzahl_vorher = list.size;
            if (element.className === 'TCAD_Stab') {
                const obj = new TCAD_Stab(
                    null,
                    jobj.elements[i].index1,
                    jobj.elements[i].index2,
                    jobj.elements[i].name_querschnitt,
                    jobj.elements[i].elTyp
                );
                obj.k_0 = jobj.elements[i].k_0;
                obj.aL = jobj.elements[i].aL;
                obj.aR = jobj.elements[i].aR;
                obj.nGelenke = jobj.elements[i].nGelenke;
                obj.gelenk = jobj.elements[i].gelenk;
                obj.sinus = jobj.elements[i].sinus;
                obj.cosinus = jobj.elements[i].cosinus;
                obj.alpha = jobj.elements[i].alpha;
                if (jobj.elements[i].stabTyp === undefined) {
                    if (System === 0) obj.stabTyp = 0;
                    else obj.stabTyp = 1;
                } else obj.stabTyp = jobj.elements[i].stabTyp;

                list.append(obj);
                let neloads = jobj.elements[i].elast.length;
                for (let j = 0; j < neloads; j++) {
                    const nlasten_vorher = obj.elast.length;
                    if (jobj.elements[i].elast[j].className === 'TCAD_Streckenlast') {
                        obj.add_streckenlast(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].art,
                            jobj.elements[i].elast[j].pL,
                            jobj.elements[i].elast[j].pR
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Einzellast'
                    ) {
                        obj.add_einzellast(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].xe,
                            jobj.elements[i].elast[j].P,
                            jobj.elements[i].elast[j].M
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Temperaturlast'
                    ) {
                        obj.add_temperaturlast(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].To,
                            jobj.elements[i].elast[j].Tu
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Vorspannung'
                    ) {
                        obj.add_vorspannung(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].sigmaV
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Spannschloss'
                    ) {
                        obj.add_spannschloss(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].ds
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Stabvorverformung'
                    ) {
                        obj.add_stabvorverformung(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].w0a,
                            jobj.elements[i].elast[j].w0m,
                            jobj.elements[i].elast[j].w0e
                        );
                    }
                    // Eingabereihenfolge (für Undo) aus der Datei übernehmen, falls gespeichert
                    if (mit_seq && obj.elast.length > nlasten_vorher) take_cad_seq(obj.elast[obj.elast.length - 1], jobj.elements[i].elast[j].seq);
                }
            } else if (element.className === 'TCAD_Lager') {
                const obj = new TCAD_Lager(
                    null,
                    jobj.elements[i].index1,
                    jobj.elements[i].node,
                    jobj.elements[i].elTyp
                );
                list.append(obj);
            } else if (element.className === 'TCAD_Knotenlast') {
                if (jobj.elements[i].knlast.alpha === undefined) {
                    let knlast = new TLoads();
                    knlast.Px_org = knlast.Px = jobj.elements[i].knlast.Px;
                    knlast.Pz_org = knlast.Pz = jobj.elements[i].knlast.Pz;
                    knlast.node = jobj.elements[i].knlast.node;
                    knlast.lf = jobj.elements[i].knlast.lf;
                    knlast.p[2] = jobj.elements[i].knlast.p[2];
                    knlast.alpha = 0.0;

                    const obj = new TCAD_Knotenlast(
                        null,
                        jobj.elements[i].index1,
                        knlast,
                        jobj.elements[i].elTyp
                    );
                    list.append(obj);
                } else {
                    const obj = new TCAD_Knotenlast(
                        null,
                        jobj.elements[i].index1,
                        jobj.elements[i].knlast,
                        jobj.elements[i].elTyp
                    );
                    list.append(obj);
                }
            } else if (element.className === 'TCAD_Knotenmasse') {
                const obj = new TCAD_Knotenmasse(
                    null,
                    jobj.elements[i].index1,
                    jobj.elements[i].masse,
                    jobj.elements[i].elTyp
                );
                list.append(obj);
            } else if (element.className === 'TCAD_Bemassung') {
                console.log('jobj.elements[i].b', jobj.elements[i].b);
                const obj = new TCAD_Bemassung(
                    null,
                    jobj.elements[i].index1,
                    jobj.elements[i].index2,
                    jobj.elements[i].b,
                    jobj.elements[i].elTyp
                );
                obj.set_art(jobj.elements[i].art);
                obj.set_index3(jobj.elements[i].index3);
                obj.set_index4(jobj.elements[i].index4);
                if (jobj.elements[i].hilfslinie === undefined) obj.set_hilfsline(1);
                else obj.set_hilfsline(jobj.elements[i].hilfslinie);
                list.append(obj);
            } else if (element.className === 'TCAD_Knotenverformung') {
                const obj = new TCAD_Knotenverformung(
                    null,
                    jobj.elements[i].index1,
                    jobj.elements[i].nodeDisp,
                    jobj.elements[i].elTyp
                );
                list.append(obj);
            }
            // Eingabereihenfolge (für Undo) aus der Datei übernehmen, falls gespeichert
            if (mit_seq && list.size > anzahl_vorher) take_cad_seq(list.getTail(), jobj.elements[i].seq);
        }

        // for (let i = 0; i < list.size; i++) {
        //     let obj = list.getNext(i);
        //     console.log("eingelesen", obj);
        // }

        // Skalierung der Streckenlasten aus der Datei übernehmen.
        // max_value_lasten hat nach set_max_lastfall() oben genau max_Lastfall Einträge,
        // set_max_lastfall(i + 1) hält Länge und max_Lastfall gleich, falls die Datei mehr Einträge hat.
        const file_max_values = (jobj.max_value_lasten ?? []) as CMAXVALUESLOAD[];
        for (let i = 0; i < file_max_values.length; i++) {
            set_max_lastfall(i + 1);
            max_value_lasten[i].eload = file_max_values[i].eload;
        }

        let el = shadow?.getElementById('id_kombinationen_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        let nSpalten = tabelle.rows[0].cells.length;

        (el as any)?.clear_undo?.();   // Undo der gelöschten Kombinationen gehört zum alten Projekt
        for (i = 1; i < tabelle.rows.length; i++) {
            for (j = 1; j < nSpalten; j++) {
                let child = tabelle.rows[i].cells[j]
                    .firstElementChild as HTMLInputElement;
                child.value = jobj.combination[i - 1][j - 1];
            }
        }
    }
    else {
        return false;
    }
    endTime = performance.now();
    write('done read_daten: ' + myFormat(endTime - startTime, 2, 3) + ' msec');
    return true;
}

//------------------------------------------------------------------------------------------------
function filedialog_read() {
    //--------------------------------------------------------------------------------------------

    let i, j;

    let input = document.createElement('input') as any;
    input.type = 'file';
    // @ts-ignore
    input.onchange = (_) => {
        // Das bestehende Modell wird erst gelöscht, wenn die Datei geprüft ist (das macht read_daten
        // selbst über clearTables()). Scheitert das Einlesen mittendrin, wird die bisherige Eingabe
        // wiederhergestellt.

        const f: File | undefined = input.files?.[0];
        if (!f) return;
        const filename = f.name;
        console.log('filename: ', filename);

        const reader = new FileReader();

        reader.onload = (e: any) => {
            const sicherung = str_inputToJSON();   // aktuelles Modell merken

            let ok = false;
            let geaendert = false;                 // wurde der Zustand schon (teilweise) überschrieben?
            try {
                ok = read_daten(e.target.result as string);
            } catch (error) {
                console.error('filedialog_read: Fehler beim Einlesen', error);
                geaendert = true;
            }

            if (!ok && !geaendert) return;         // Datei abgelehnt, Modell unverändert

            if (!ok) {
                try {
                    read_daten(sicherung);
                } catch (error) {
                    console.error('filedialog_read: Wiederherstellen fehlgeschlagen', error);
                    clearTables();
                }
                alertdialog(
                    'ok',
                    msg('Die Datei konnte nicht vollständig gelesen werden. Die bisherige Eingabe wurde wiederhergestellt.')
                );
            }

            init_two_cad();
            init_cad(0);
            reset_gui();
            reset_controlpanel_grafik();
            if (ok) set_current_filename(filename);
        };

        reader.onerror = () => {
            console.error('filedialog_read: Datei konnte nicht gelesen werden', reader.error);
            alertdialog('ok', msg('Die Datei konnte nicht gelesen werden.'));
        };

        reader.readAsText(f);
    };

    input.click();
    console.log('nach click in filedialog_read');
}

//------------------------------------------------------------------------------------------------
function basisname(name: string) {
    //--------------------------------------------------------------------------------------------
    // Dateiname ohne Endungen und Zähler früherer Speicherungen,
    // z.B. "test.d2beam (4).txt" -> "test", "test.d2beam.json" -> "test"
    let basis = String(name).trim();
    let alt = '';
    while (alt !== basis) {
        alt = basis;
        basis = basis.replace(/\.(txt|json|d2beam)$/i, '').replace(/\s*\(\d+\)$/, '');
    }
    return basis === '' ? 'empty' : basis;
}

//------------------------------------------------------------------------------------------------
async function handleFileSelect_save() {
    //--------------------------------------------------------------------------------------------

    //const filename = window.prompt("Name der Datei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert");
    console.log('in select save');
    //console.log("filename", filename);

    // const elem = document.getElementById("id_button_nnodes");

    // if (elem) {

    let jsonse = str_inputToJSON();

    console.log('stringify', jsonse);

    let filename: any;

    // Android: der Speichern-Dialog (Chrome) kennt die Endung .d2beam nicht und hängt ".txt" an.
    // Dort wird deshalb als .d2beam.json (application/json) gespeichert; für Android zählt nur die
    // letzte Endung .json, die es kennt. Desktop: unverändert .d2beam.
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (app.hasSaveFS_Access) {
        //window.alert("showSaveFilePicker bekannt")

        try {
            // (A) CREATE BLOB OBJECT
            const myBlob = new Blob([jsonse], { type: isAndroid ? 'application/json' : 'text/plain' });

            // (B) FILE HANDLER & FILE STREAM
            // @ts-ignore
            const fileHandle = await window.showSaveFilePicker(isAndroid
                ? {
                    suggestedName: basisname(currentFilename) + '.d2beam.json',
                    startIn: lastFileHandle,
                    types: [
                        {
                            description: 'd2beam (JSON)',
                            accept: { 'application/json': ['.json'] },
                        },
                    ],
                }
                : {
                    suggestedName: currentFilename,
                    startIn: lastFileHandle,
                    types: [
                        {
                            description: 'Text file',
                            accept: { 'text/plain': ['.d2beam'] },
                        },
                    ],
                });
            console.log('fileHandle', fileHandle);
            lastFileHandle = fileHandle;

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

        // filename = window.prompt(
        //     'Name der Ausgabedatei mit Extension, z.B. test.txt\nDie Datei wird im Default Download Ordner gespeichert',
        //     currentFilename
        // );

        // const mimeType = 'application/json'; //opts.mimeType ?? 'application/octet-stream';
        // const blob = new Blob([jsonse], { type: 'text/plain' });
        // const file = new File([blob], currentFilename, { type: blob.type || mimeType });
        // write("test can share " + capabilities.canShareFile(file))
        // if (capabilities.canShareFile(file)) {
        //     write('in share')
        //     try {
        //         await navigator.share({ files: [file], title: currentFilename });
        //         //return { ok: true, method: 'share' };
        //     } catch (err) {
        //         // if (isAbortError(err)) return { ok: false, reason: 'cancelled' };
        //         write('navigator.share fehlgeschlagen, nutze Download: ' + err);
        //     }
        // } else {


        //window.alert("showSaveFilePicker UNBEKANNT");
        // Vorschlag ohne angehängtes ".txt" früherer Speicherungen (z.B. "test.d2beam (4).txt")
        const vorschlag = String(currentFilename).replace(/\.txt$/i, '');
        filename = window.prompt(
            msg('Name der Datei mit Extension, z.B. test.d2beam\nDie Datei wird im Default Download Ordner gespeichert'),
            vorschlag
        );
        if (filename === null) return;          // Abbruch
        filename = filename.trim();
        if (filename === '') return;
        if (!/\.[^./\\]+$/.test(filename)) filename += '.d2beam';   // ohne Endung: .d2beam anhängen

        // Nicht text/plain, sonst hängen Android und iPadOS ".txt" an.
        // iPadOS: application/octet-stream genügt.
        // Android: Chrome erkennt bei octet-stream den Inhalt als Text und Android hängt dann
        // trotzdem ".txt" an; ein eigener, unbekannter Typ wird nicht umgedeutet.
        const myFile = new File([jsonse], filename, {
            type: isAndroid ? 'application/x-d2beam' : 'application/octet-stream',
        });
        try {
            saveAs(myFile, filename);
            set_current_filename(filename);
        } catch (error: any) {
            //alert(error.name);
            alert(error.message);
        }

    }
}


export function str_inputToJSON() {
    let i,
        j,
        nelTeilungen,
        n_iterationen,
        THIIO_flag,
        maxU_node_ID,
        maxU_dir,
        maxU_schief,
        neigv,
        P_delta,
        ausgabe_SG,
        epsDisp_tol,
        epsForce_tol,
        stadyn,
        dyn_neigv;
    let eig_solver,
        niter_neigv,
        nelem_koppelfedern,
        matprop_flag,
        min_mass,
        einheit_kraft,
        einheit_bemassung;

    const elHaupt = document.getElementById('id_haupt') as drHaupt;
    let shadow = elHaupt.shadowRoot;
    if (shadow) {
        let el = shadow.getElementById('id_button_nteilungen') as any;
        nelTeilungen = el.nel;

        el = shadow.getElementById(
            'id_einheit_kraft_option'
        ) as HTMLSelectElement;
        einheit_kraft = el.value;

        el = shadow.getElementById('id_einheit_bemassung') as HTMLSelectElement;
        einheit_bemassung = el.value;

        el = shadow.getElementById('id_button_niter') as any;
        n_iterationen = el.nel;

        el = shadow.getElementById('id_THIIO') as HTMLSelectElement;
        THIIO_flag = el.value;

        el = shadow.getElementById('id_matprop') as HTMLSelectElement;
        matprop_flag = el.value;

        el = shadow.getElementById('id_stadyn') as HTMLSelectElement;
        stadyn = el.value;

        el = shadow.getElementById('id_button_dyn_neigv') as any;
        dyn_neigv = el.nel;

        el = shadow.getElementById('id_maxu_node_ID') as HTMLSelectElement;
        maxU_node_ID = el.value;

        el = shadow.getElementById('id_maxu_dir') as HTMLSelectElement;
        maxU_dir = el.value;

        el = shadow.getElementById('id_maxu_schief') as HTMLElement;
        maxU_schief = el.value;

        el = shadow.getElementById('id_neigv') as drButtonPM;
        neigv = el.nel;

        el = shadow.getElementById('id_P_delta_option') as HTMLSelectElement;
        P_delta = el.value;

        el = shadow.getElementById('id_ausgabe_SG_option') as HTMLSelectElement;
        ausgabe_SG = el.value;

        el = shadow.getElementById('id_eig_solver_option') as HTMLSelectElement;
        eig_solver = el.value;

        el = shadow.getElementById('id_eps_disp_tol') as HTMLInputElement;
        epsDisp_tol = el.value;

        el = shadow.getElementById('id_eps_force_tol') as HTMLInputElement;
        epsForce_tol = el.value;

        el = shadow.getElementById('id_iter_neigv') as HTMLInputElement;
        niter_neigv = el.value;

        el = shadow.getElementById('id_minMass') as HTMLInputElement;
        min_mass = el.value;

        //el = shadow.getElementById('id_dialog_neue_eingabe') as HTMLElement;
        let system = System; //Number((el.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);

        const txtarea = shadow.getElementById(
            'freetext'
        ) as HTMLTextAreaElement;
        console.log('textarea', txtarea.value);
        const freetxt = txtarea.value;

        el = shadow.getElementById('id_lastfaelle_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById(
            'mytable'
        ) as HTMLTableElement;
        let nZeilen = tabelle.rows.length - 1;
        let nSpalten = tabelle.rows[0].cells.length - 1;
        const nlastfaelle = nZeilen;
        const lastfaelle = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1]
                    .firstElementChild as HTMLInputElement;
                lastfaelle[i][j] = child.value;
            }
        }

        el = shadow.getElementById('id_kombinationen_tabelle') as HTMLElement;
        tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        nZeilen = tabelle.rows.length - 1;
        nSpalten = tabelle.rows[0].cells.length - 1;
        const nkombinationen = nZeilen;
        const kombination = Array.from(Array(nZeilen), () => new Array(nSpalten));

        for (i = 0; i < nZeilen; i++) {
            for (j = 0; j < nSpalten; j++) {
                let child = tabelle.rows[i + 1].cells[j + 1]
                    .firstElementChild as HTMLInputElement;
                kombination[i][j] = child.value;
            }
        }

        let qsClassName = new Array(nQuerschnittSets);
        let qsWerte = Array.from(Array(nQuerschnittSets), () => new Array(19));

        for (i = 0; i < nQuerschnittSets; i++) {
            console.log('get_querschnitt_length', get_querschnitt_length(i));
            qsWerte[i] = get_querschnittRechteck(i);
            qsClassName[i] = get_querschnitt_classname(i);
        }

        // flache Kopie speichern: two_obj am echten Objekt NICHT löschen, sonst kann Undo/Löschen
        // die Grafik nach einem Speichern (auch automatisch bei visibilitychange) nicht mehr entfernen
        let elements = [] as TCAD_Element[];
        for (const obj of list) {
            elements.push({ ...obj, two_obj: null } as TCAD_Element);
        }

        if (max_Lastfall === 0) set_max_lastfall(1);

        let polyData = {
            created_by: 'd2beam-gui',
            version: 4,             // 4: Elemente und Elementlasten enthalten seq (Eingabereihenfolge für Undo)

            system: system,
            dateiname: currentFilename,

            nloadcases: nlastfaelle,
            ncombinations: nkombinationen,
            nquerschnittsets: nQuerschnittSets,
            nelteilungen: nelTeilungen,
            einheit_kraft: einheit_kraft,
            einheit_bemassung: einheit_bemassung,
            n_iter: n_iterationen,
            THIIO_flag: THIIO_flag,
            matprop_flag: matprop_flag,
            maxU_node_ID: maxU_node_ID,
            maxU_dir: maxU_dir,
            maxU_schief: maxU_schief,
            neigv: neigv,
            P_delta: P_delta,
            ausgabe_SG: ausgabe_SG,
            epsDisp_tol: epsDisp_tol,
            epsForce_tol: epsForce_tol,
            stadyn: stadyn,
            dyn_neigv: dyn_neigv,
            eig_solver: eig_solver,
            niter_neigv: niter_neigv,
            nelem_koppelfedern: nelem_koppelfedern,
            freetxt: freetxt,
            max_Lastfall: max_Lastfall,

            raster_dx: raster_dx,
            raster_dz: raster_dz,
            raster_offset_x: raster_offset_x,
            raster_offset_z: raster_offset_z,
            raster_xmin: raster_xmin,
            raster_xmax: raster_xmax,
            raster_zmin: raster_zmin,
            raster_zmax: raster_zmax,
            fangweite_cursor: get_fangweite_cursor_org(),

            maxBettung: maxBettung,
            minMass: min_mass,

            loadcases: lastfaelle,
            combination: kombination,
            qsclassname: qsClassName,
            qswerte: qsWerte,
            cadNodes: CADNodes,
            elements: elements,
            max_value_lasten: max_value_lasten,
        };

        return JSON.stringify(polyData);
    } else {
        let polyData = {
            created_by: 'd2beam-gui',
            version: 2,
        };
        return JSON.stringify(polyData);
    }
}

export function addListener_filesave() {
    const el = document.getElementById('id_haupt') as drHaupt;
    console.log(
        'in addListener_filesave',
        el.test(),
        el.shadowRoot?.getElementById('readFile')
    );
    el.shadowRoot
        ?.getElementById('readFile')
        ?.addEventListener('click', filedialog_read, false);
    //    document.getElementById("readFile")?.addEventListener("click", filedialog_read, false);
    el.shadowRoot
        ?.getElementById('saveFile')
        ?.addEventListener('click', handleFileSelect_save, false);
}
console.log('ende dateien.ts');

//------------------------------------------------------------------------------------------------
function download(filename: any, text: any) {
    //--------------------------------------------------------------------------------------------
    let element = document.createElement('a');
    element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

