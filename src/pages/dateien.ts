//import './listener.js';

import '@shoelace-style/shoelace/dist/components/select/select.js';

import { alertdialog, confirmdialog } from "./confirm_dialog"
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
    alte_ergebnisse_loeschen,
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
import { spaltenbreiten_lesen, spaltenbreiten_setzen } from '../components/dr-tabelle';
import type { drDialogWillkommen } from '../components/dr-dialog_willkommen';

// Version des Dateiformats der Eingabedateien (Änderungen siehe Kommentar bei polyData.version)
const DATEI_VERSION = 6;

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

    if (typeof version === 'number' && version > DATEI_VERSION) {
        alertdialog(
            'ok',
            msg('Die Datei wurde mit einer neueren Programmversion erstellt. Neue Eingaben (z. B. Teilstreckenlasten) können fehlen oder falsch gelesen werden. Bitte die App aktualisieren.')
        );
    }

    // Datei ist gültig: Ergebnisse des bisherigen Systems verwerfen
    alte_ergebnisse_loeschen();

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
            (shadow.getElementById('id_drehmasse_option') as HTMLSelectElement).value = String(jobj.drehmasse ?? 'false');

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
            txtarea.value = jobj.freetxt ?? '';   // ohne Freitext in der Datei nicht den des alten Projekts behalten

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
                obj.nTeil = jobj.elements[i].nTeil ?? 1;      // ab Version 6
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
                            jobj.elements[i].elast[j].pR,
                            jobj.elements[i].elast[j].xa ?? 0.0,     // ab Version 6, vorher immer ganze Stablänge
                            jobj.elements[i].elast[j].xb ?? -1.0
                        );
                    } else if (
                        jobj.elements[i].elast[j].className === 'TCAD_Einzellast'
                    ) {
                        obj.add_einzellast(
                            jobj.elements[i].elast[j].lastfall,
                            jobj.elements[i].elast[j].xe,
                            jobj.elements[i].elast[j].Pz ?? jobj.elements[i].elast[j].P,   // bis Version 5 nur P senkrecht zum Stab
                            jobj.elements[i].elast[j].M,
                            jobj.elements[i].elast[j].Px ?? 0.0,
                            jobj.elements[i].elast[j].alpha ?? 0.0,
                            jobj.elements[i].elast[j].stabbezug ?? true
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
                            jobj.elements[i].elast[j].w0e,
                            jobj.elements[i].elast[j].eingabeart ?? 0     // ab Version 6
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

        // vom Benutzer gezogene Spaltenbreiten (ältere Dateien ohne Eintrag: Standardbreiten)
        if (shadow) spaltenbreiten_setzen(shadow, jobj.spaltenbreiten);
    }
    else {
        return false;
    }
    endTime = performance.now();
    write('done read_daten: ' + myFormat(endTime - startTime, 2, 3) + ' msec');
    return true;
}

//------------------------------------------------------------------------------------------------
// Ungespeicherte Änderungen erkennen
//------------------------------------------------------------------------------------------------
// Nach dem Öffnen und Speichern einer Datei wird ein Hash der Eingabe gemerkt (im localStorage,
// damit er auch nach einem Neustart mit der automatisch wiederhergestellten Eingabe passt).
// Weicht die aktuelle Eingabe davon ab, gibt es ungespeicherte Änderungen.

const GESPEICHERT_KEY = 'd2beam_gespeicherter_stand';

function stand_hash(s: string): string {
    // cyrb53, ein schneller 53-Bit-Hash
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < s.length; i++) {
        const ch = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function als_gespeichert_merken() {
    try {
        window.localStorage.setItem(GESPEICHERT_KEY, stand_hash(str_inputToJSON()));
    } catch (error) {
        console.error('als_gespeichert_merken: localStorage nicht verfügbar', error);
    }
}

function hat_ungespeicherte_aenderungen(): boolean {
    if (CADNodes.length === 0 && list.size === 0) return false;   // leeres System, nichts zu verlieren
    let gemerkt: string | null = null;
    try {
        gemerkt = window.localStorage.getItem(GESPEICHERT_KEY);
    } catch (error) {
        console.error('hat_ungespeicherte_aenderungen: localStorage nicht verfügbar', error);
    }
    return gemerkt !== stand_hash(str_inputToJSON());
}

// true = die aktuelle Eingabe darf ersetzt werden (andere Datei öffnen bzw. neue Eingabe)
export async function verwerfen_bestaetigt(neue_eingabe = false): Promise<boolean> {
    if (!hat_ungespeicherte_aenderungen()) return true;
    return (await confirmdialog(
        neue_eingabe ? msg('Trotzdem neu beginnen') : msg('Trotzdem öffnen'),
        msg('Abbrechen'),
        neue_eingabe
            ? msg('Die aktuelle Eingabe hat Änderungen, die noch nicht in einer Datei gespeichert sind. Sie gehen bei einer neuen Eingabe verloren.')
            : msg('Die aktuelle Eingabe hat Änderungen, die noch nicht in einer Datei gespeichert sind. Sie gehen beim Öffnen einer anderen Datei verloren.')
    )) as boolean;
}

//------------------------------------------------------------------------------------------------
function datei_einlesen(f: File) {
    //--------------------------------------------------------------------------------------------
    // Das bestehende Modell wird erst gelöscht, wenn die Datei geprüft ist (das macht read_daten
    // selbst über clearTables()). Scheitert das Einlesen mittendrin, wird die bisherige Eingabe
    // wiederhergestellt.

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
            console.error('datei_einlesen: Fehler beim Einlesen', error);
            geaendert = true;
        }

        if (!ok && !geaendert) return;         // Datei abgelehnt, Modell unverändert

        if (!ok) {
            try {
                read_daten(sicherung);
            } catch (error) {
                console.error('datei_einlesen: Wiederherstellen fehlgeschlagen', error);
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
        if (ok) {
            set_current_filename(filename);
            als_gespeichert_merken();
        }
    };

    reader.onerror = () => {
        console.error('datei_einlesen: Datei konnte nicht gelesen werden', reader.error);
        alertdialog('ok', msg('Die Datei konnte nicht gelesen werden.'));
    };

    reader.readAsText(f);
}

//------------------------------------------------------------------------------------------------
async function filedialog_read() {
    //--------------------------------------------------------------------------------------------

    if (!(await verwerfen_bestaetigt())) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
        const f = input.files?.[0];
        if (f) datei_einlesen(f);
    };

    input.click();
    console.log('nach click in filedialog_read');
}

//------------------------------------------------------------------------------------------------
// Drag & Drop einer Eingabedatei, nur im Tab Haupt, Ablegen auf dem ganzen Fenster
//------------------------------------------------------------------------------------------------

let drag_zaehler = 0;          // dragenter/dragleave feuern auch für jedes Kind-Element
let drop_overlay: HTMLDivElement | null = null;
let drop_laeuft = false;       // Rückfrage oder Einlesen noch nicht fertig

function ist_tab_haupt(): boolean {
    const el = document.getElementById('id_haupt') as drHaupt | null;
    const tab = el?.shadowRoot?.querySelector('sl-tab[panel="tab-haupt"]');
    return !!tab?.hasAttribute('active');
}

function zieht_dateien(e: DragEvent): boolean {
    return !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
}

function zeige_drop_overlay(sichtbar: boolean) {
    if (!drop_overlay) {
        drop_overlay = document.createElement('div');
        drop_overlay.style.cssText =
            'position:fixed; inset:0; z-index:100000; display:none; align-items:center; justify-content:center;' +
            'background:rgba(0,0,0,0.45); pointer-events:none;';
        const box = document.createElement('div');
        box.style.cssText =
            'padding:2rem 3rem; border:3px dashed #fff; border-radius:12px; color:#fff;' +
            'font-size:1.5rem; font-weight:600; text-align:center; max-width:80vw;';
        drop_overlay.appendChild(box);
        // Als Popover liegt das Overlay in der obersten Ebene des Browsers und damit auch über
        // modalen Dialogen (z.B. dem Willkommensdialog), die jeden z-index überdecken.
        if (popover_moeglich) {
            drop_overlay.popover = 'manual';
            drop_overlay.style.cssText +=
                'width:100%; height:100%; max-width:none; max-height:none; margin:0; border:0; padding:0;';
        }
        document.body.appendChild(drop_overlay);
    }
    if (sichtbar) (drop_overlay.firstElementChild as HTMLElement).textContent = msg('Datei hier ablegen, um sie zu öffnen');
    drop_overlay.style.display = sichtbar ? 'flex' : 'none';
    if (popover_moeglich) {
        const offen = drop_overlay.matches(':popover-open');
        if (sichtbar && !offen) drop_overlay.showPopover();
        else if (!sichtbar && offen) drop_overlay.hidePopover();
    }
}

const popover_moeglich = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

// Willkommensdialog schließen, sonst wird die Datei unsichtbar hinter ihm geladen
function willkommen_schliessen() {
    const el = document.getElementById('id_haupt') as drHaupt | null;
    const w = el?.shadowRoot?.querySelector('dr-dialog_willkommen') as drDialogWillkommen | null;
    w?.schliessen();
}

async function datei_abgelegt(e: DragEvent) {
    const dt = e.dataTransfer;
    if (!dt || dt.files.length === 0) return;
    if (dt.files.length > 1) {
        alertdialog('ok', msg('Bitte nur eine Datei ablegen.'));
        return;
    }
    const eintrag = dt.items?.[0]?.webkitGetAsEntry?.();
    if (eintrag?.isDirectory) {
        alertdialog('ok', msg('Ein Ordner kann nicht geöffnet werden. Bitte eine Datei ablegen.'));
        return;
    }
    const f = dt.files[0];   // vor dem ersten await holen, danach ist dataTransfer leer
    willkommen_schliessen();

    drop_laeuft = true;
    try {
        if (await verwerfen_bestaetigt()) datei_einlesen(f);
    } finally {
        drop_laeuft = false;
    }
}

function addListener_drop() {
    // dragover/drop für Dateien immer abfangen, sonst öffnet der Browser die Datei selbst
    // anstelle der App. Außerhalb des Tabs Haupt wird das Ablegen nur verweigert.
    window.addEventListener('dragenter', (e) => {
        if (!zieht_dateien(e)) return;
        e.preventDefault();
        drag_zaehler++;
        if (ist_tab_haupt() && !drop_laeuft) zeige_drop_overlay(true);
    });
    window.addEventListener('dragleave', (e) => {
        if (!zieht_dateien(e)) return;
        drag_zaehler = Math.max(0, drag_zaehler - 1);
        if (drag_zaehler === 0) zeige_drop_overlay(false);
    });
    window.addEventListener('dragover', (e) => {
        if (!zieht_dateien(e)) return;
        e.preventDefault();
        e.dataTransfer!.dropEffect = ist_tab_haupt() && !drop_laeuft ? 'copy' : 'none';
    });
    window.addEventListener('drop', (e) => {
        if (!zieht_dateien(e)) return;
        e.preventDefault();
        drag_zaehler = 0;
        zeige_drop_overlay(false);
        if (!ist_tab_haupt() || drop_laeuft) return;
        datei_abgelegt(e);
    });
}

let hinweis_ueberschreiben_gezeigt = false;

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
            als_gespeichert_merken();

            // Android legt bei vorhandenem Namen über "Speichern" eine neue Datei "name (1).json" an.
            // Überschreiben geht nur durch Antippen der Datei in der Liste – darauf hinweisen
            // (höchstens einmal pro Sitzung).
            if (isAndroid && !hinweis_ueberschreiben_gezeigt && /\s\(\d+\)\.json$/i.test(fileHandle.name)) {
                hinweis_ueberschreiben_gezeigt = true;
                const name_html = String(fileHandle.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                alertdialog('ok', msg('Die Datei war schon vorhanden. Android hat deshalb eine neue Datei angelegt:') + '<br>' + name_html + '<br><br>' +
                    msg('Zum Überschreiben im Speichern-Dialog nicht auf „Speichern“ tippen, sondern die vorhandene Datei in der Liste antippen und das Ersetzen bestätigen.'));
            }
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
            als_gespeichert_merken();
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
        drehmasse,
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

        el = shadow.getElementById('id_drehmasse_option') as HTMLSelectElement;
        drehmasse = el.value;

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
            version: DATEI_VERSION, // 4: Elemente und Elementlasten enthalten seq (Eingabereihenfolge für Undo)
                                    // 5: spaltenbreiten (gezogene Spaltenbreiten der Tabellen)
                                    // 6: Stab.nTeil (Elementteilung), Streckenlast.xa/xb (Teilstreckenlast),
                                    //    Einzellast.Px/Pz/alpha/stabbezug statt P
                                    //    Stabvorverformung.eingabeart (0: Stich, 1: drei Ordinaten)
                                    //    drehmasse ('true'/'false', Drehträgheit in der Massenmatrix; fehlt = 'false')

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
            drehmasse: drehmasse,

            loadcases: lastfaelle,
            combination: kombination,
            qsclassname: qsClassName,
            qswerte: qsWerte,
            cadNodes: CADNodes,
            elements: elements,
            max_value_lasten: max_value_lasten,
            spaltenbreiten: spaltenbreiten_lesen(shadow),
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
    addListener_drop();
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

