// import { LitElement, html, render } from 'lit';
// import { property, customElement } from 'lit/decorators.js';
// //import { property, customElement } from 'lit/decorators.js';
// import { msg, localized } from '@lit/localize';
//import { styles } from '../styles/shared-styles';
console.log("Anfang haupt_2.ts")

import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';

import './globals';

import { berechnungErforderlich, set_touch_support_table } from './globals';

import { add_listeners_einstellungen, readLocalStorage, readLocalStorage_cad } from './einstellungen';

// import '../components/dr-button-pm';

// import '../components/dr-tabelle';
// import '../components/dr-dialog-layerquerschnitt';
// import '../components/dr-dialog-rechteckquerschnitt';
// import '../components/dr-dialog_neue_eingabe';
// import '../components/dr-dialog_lager';
// import '../components/dr-dialog_knoten';
// import '../components/dr-dialog_knotenlast';
// import '../components/dr-dialog_knotenmasse';
// import '../components/dr-dialog_elementlasten';
// import '../components/dr-dialog_stab_eigenschaften';
// import '../components/dr-dialog_einstellungen';
// import '../components/dr-dialog_info';
// import '../components/dr-drawer_1';
// import '../components/dr-dialog_messen';
// import '../components/dr-dialog_bemassung';
// import '../components/dr-dialog_knotenverformung';
// import '../components/dr-dialog_kopieren';
// import '../components/dr-dialog_selekt_typ';
// import '../components/dr-dialog_edit_selected_elementlasten';
// import '../components/dr-my_drawer';

// import './locale-picker';

import { drButtonPM } from '../components/dr-button-pm';
import { drRechteckQuerSchnitt } from '../components/dr-dialog-rechteckquerschnitt';
//import { drMyDrawer } from '../components/dr-my_drawer';

import { reset_gui } from '../components/dr-control-panel';

import DetectOS from './detectos';

import { addListener_filesave } from './dateien';
import { select_loadcase_changed, select_eigenvalue_changed, select_dyn_eigenvalue_changed, copy_svg, drawsystem, click_zurueck_grafik, reset_controlpanel_grafik, click_pan_button_grafik } from './grafik';
import { set_info, write } from './utility';

import { my_jspdf } from './mypdf';

//import { init_contextmenu } from '../components/dr-tabelle';

import { rechnen, init_tabellen, show_gleichungssystem, setSystem, System, hideColumnsForFachwerk, stadyn, set_stadyn } from './rechnen';

import { nQuerschnittSets, del_last_querschnittSet, dialog_querschnitt_closed, set_dialog_querschnitt_new, removeAll_def_querschnitt } from './querschnitte';

import { click_pan_button_cad, init_cad, init_two_cad, set_einheit_bemassung, set_show_bemassung, set_show_elementlasten, set_show_knotenlasten, set_show_knotenmassen, set_show_knotenverformung, set_show_lager, set_show_stab_qname, two_cad_clear } from './cad';
import { cad_buttons, close_drawer_1 } from './cad_buttons';
import { abbruch_property_dialog, delete_element_dialog, show_add_elload_dialog, show_property_dialog } from './cad_contextmenu';
import SlTabPanel from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import { set_max_lastfall, zero_max_lastfall } from './cad_draw_elementlasten';
import { reset_cad_nodes } from './cad_node';
import { info_Eigenwertberechnung, info_Materialeigenschaften } from './infos';
import { currentFilename } from './haupt';
import { drHaupt } from '../components/dr-haupt';

console.log("in haupt2>")
//import '../components/dr-haupt'
//console.log("nach dr-haupt")
// const nnodes_init = '0';
// const nelem_init = '0';
// const nnodalloads_init = '0';
// const nstreckenlasten_init = '0';
// const neinzellasten_init = '0';
// const ntemperaturlasten_init = '0';
// const nlastfaelle_init = '1';
// const nkombinationen_init = '0';
// const nstabvorverfomungen_init = '0';
// const nvorspannungen_init = '0';
// const nspannschloesser_init = '0';
// const nnodalmass_init = '0';

// let column_string_kombitabelle: string;
// let typs_string_kombitabelle: string;

// const nkombiSpalten_init = '2'; // immer 1 mehr als nlastfaelle_init
// const nnodedisps_init = '0';
// const dyn_neigv_init = '1';
// const nkoppelfedern_init = '0';

// let width_lager = 175; // /window.devicePixelRatio;
// let width_def_d2beam = 400;

// column_string_kombitabelle = '["Kombi", "Kommentar"';
// for (let i = 1; i <= Number(nlastfaelle_init); i++) {
//   column_string_kombitabelle = column_string_kombitabelle + ', "Lf ' + i + '"';
// }
// column_string_kombitabelle = column_string_kombitabelle + ']';
// console.log('column_string_kombitabelle', column_string_kombitabelle);

// typs_string_kombitabelle = '["-", "text"';
// for (let i = 1; i <= Number(nlastfaelle_init); i++) {
//   typs_string_kombitabelle = typs_string_kombitabelle + ', "number"';
// }
// typs_string_kombitabelle = typs_string_kombitabelle + ']';
// console.log('typs_string_kombitabelle', typs_string_kombitabelle);

// const sleepNow = (delay: any) => new Promise((resolve) => setTimeout(resolve, delay));

// async function initTabellenLoop() {
//   for (let i = 1; i <= 25; i++) {
//     await sleepNow(50);
//     if (document.readyState === "complete") {
//       init_tabellen();
//       rechnen(1);

//       write(`document.readyState = complete after ${i * 50} msec`);
//       break;
//     }
//     console.log(`Hello #${i * 50}`);
//   }
// }
/**

{
  //const template = html`  // verwenden, wenn ohne renderbefore, siehe unten

  // console.log("vor template");



  //  <style>
  //     .custom-icons sl-tree-item::part(expand-button) {
  //       // Disable the expand/collapse animation
  //       rotate: none;
  //     }
  //   </style>
  // Tabellen sin jetzt da, Tabellen mit Voreinstellungen füllen

  // init_tabellen();

  //init_contextmenu();

  addListener_filesave();
  add_listeners_einstellungen();
  readLocalStorage();
  set_info();

  const el_select_loadcase = document.getElementById('id_select_loadcase');
  el_select_loadcase?.addEventListener('change', select_loadcase_changed);
  const el_select_eigenvalue = document.getElementById('id_select_eigenvalue');
  el_select_eigenvalue?.addEventListener('change', select_eigenvalue_changed);
  const el_select_dyn_eigenvalue = document.getElementById('id_select_dyn_eigenvalue');
  el_select_dyn_eigenvalue?.addEventListener('change', select_dyn_eigenvalue_changed);
  const el_zurueck_grafik = document.getElementById('id_button_zurueck_grafik');
  el_zurueck_grafik?.addEventListener('click', click_zurueck_grafik);
  const el_pan_button_grafik = document.getElementById('id_button_pan_grafik') as HTMLButtonElement;
  el_pan_button_grafik?.addEventListener('click', click_pan_button_grafik);
  el_pan_button_grafik.innerHTML = '<i class = "fa fa-arrows"></i>';
  const el_pan_button_cad = document.getElementById('id_button_pan_cad') as HTMLButtonElement;
  el_pan_button_cad?.addEventListener('click', click_pan_button_cad);
  el_pan_button_cad.innerHTML = '<i class = "fa fa-arrows"></i>';

  // const el_zurueck_cad = document.getElementById("id_button_zurueck_cad");
  // el_zurueck_cad?.addEventListener("click", click_zurueck_cad);

  // const el_def_quer = document.getElementById("id_querschnitt_default");
  // el_def_quer?.addEventListener("change", change_def_querschnitt);

  document?.getElementById('id_button_copy_svg')?.addEventListener('click', copy_svg, false);

  const checkbox = document.getElementById('id_glsystem_darstellen');
  checkbox!.addEventListener('sl-change', (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      gleichungssystem_darstellen(true);
    } else {
      gleichungssystem_darstellen(false);
    }
  });

  const elem_select = document.getElementById('id_element_darstellen');
  elem_select!.addEventListener('change', () => {
    // @ts-ignore
    elem_select_changed();
  });

  const checkbox_gelenk = document.getElementById('id_gelenke_anzeigen');
  checkbox_gelenk!.addEventListener('sl-change', (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_gelenke_anzeigen(true);
    } else {
      elementTabelle_gelenke_anzeigen(false);
    }
  });

  const checkbox_starr = document.getElementById('id_starre_enden_anzeigen');
  checkbox_starr!.addEventListener('sl-change', (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_starre_enden_anzeigen(true);
    } else {
      elementTabelle_starre_enden_anzeigen(false);
    }
  });

  const touch_support_tables = document.getElementById('id_touch_support_tables');
  touch_support_tables!.addEventListener('sl-change', (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      set_touch_support_table(true);
    } else {
      set_touch_support_table(false);
    }
  });

  const checkbox_bettung = document.getElementById('id_bettung_anzeigen');
  checkbox_bettung!.addEventListener('sl-change', (event) => {
    // @ts-ignore
    if (event.currentTarget.checked) {
      elementTabelle_bettung_anzeigen(true);
    } else {
      elementTabelle_bettung_anzeigen(false);
    }
  });

  let tt = document.getElementById('id_tab-cad') as SlTabPanel;
  tt.updateComplete.then(() => {
    console.log('Tab CAD is complete'); // true
    let div = document.getElementById('id_cad_group') as HTMLDivElement;

    let h = div!.getBoundingClientRect();
    console.log('update complete Höhe des div', h);
    readLocalStorage_cad();
    init_two_cad();
    init_cad(0);
  });
  let ttt = document.getElementById('id_tab-grafik') as SlTabPanel;
  ttt.updateComplete.then(() => {
    console.log('Tab GRAFIK is complete'); // true
    //init_two('artboard', false);
  });

  // let div_cad_group = document.getElementById("id_tab-cad") as HTMLDivElement
  // div_cad_group!.addEventListener("load", (event) => {
  //   // @ts-ignore
  //   console.log("load", event)
  //   let hoehe = div_cad_group!.getBoundingClientRect()
  //   console.log("hoehe div id_cad_group", hoehe)
  // });

  let ttt1 = document.getElementById('id_sl_tab_group') as SlTabGroup;
  ttt1!.addEventListener('sl-tab-show', (event) => {
    // @ts-ignore
    console.log('sl-tab-show', event);
    //  let hoehe = div_cad_group!.getBoundingClientRect()
    //  console.log("hoehe div id_cad_group", hoehe)
    let div = document.getElementById('id_cad_group2') as HTMLDivElement;
    let h = div!.getBoundingClientRect();
    console.log('Rect des div id_cad_group2', h);
  });

  // let ttt1 = document.getElementById("id_cad_group") as SlTabGroup;
  // ttt1!.addEventListener("resize", (event) => {
  //   // @ts-ignore
  //   console.log("sl-tab-show", event)
  //   //  let hoehe = div_cad_group!.getBoundingClientRect()
  //   //  console.log("hoehe div id_cad_group", hoehe)
  //   let div = document.getElementById("id_cad_group") as HTMLDivElement
  //   let h = div!.getBoundingClientRect()
  //   console.log("Rect des div", h)
  // });

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // console.log("entry.borderBoxSize", entry.borderBoxSize)
      // console.log("entry.contentRect", entry.contentRect)
      // console.log("entry.contentBoxSize", entry.contentBoxSize)

      let t2 = document.getElementById('id_cad_group2') as SlTabGroup;
      let bottom = entry.contentRect.bottom;
      console.log('bottom', bottom);
      t2.style.top = String(bottom) + 'px';
    }
  });

  let ob_t1 = document.getElementById('id_cad_group') as SlTabGroup;
  resizeObserver.observe(ob_t1);

  // addEventListener("resize", function () {
  //   ("RESIZE")
  //   write ("resize " + this.window.innerHeight)
  //   init_cad(0);
  // });

  // console.log("id_button_copy_svg", getComputedStyle(document?.getElementById("id_button_copy_svg")!).height);
  // console.log("rechnen", getComputedStyle(document?.getElementById("rechnen")!).width);

  // let ELEMENT = document?.querySelector(".output_container");
  // console.log("ELEMENT", ELEMENT);
  // console.log("ELEMENT", getComputedStyle(ELEMENT!).width);

  console.log('document.readyState', document.readyState);

  // let time = 0
  // //while (document.readyState != 'complete') {
  // setTimeout(function () {
  //   write("in setTimeout document.readyState " + document.readyState)
  //   if (document.readyState === 'complete') init_tabellen();
  //   console.log("Executed after 0.1 second");
  // }, 500);
  // time = time + 500
  // console.log("time used ", time)
  // write('document.readyState ' + document.readyState)
  //}

  // initTabellenLoop();
  console.log('vor init_tabellen in haupt');

  cad_buttons();

  init_tabellen();

  // init_two_cad();
  // init_cad(0);

  //  readLocalStorage_cad();

  //init_grafik(0);
  //init_two('artboard', false);

  // let divi = document.getElementById("id_context_menu");

  // divi.style.left = '100px';
  // divi.style.top = '500px';

  //rechnen(1);
  //const openButton = drawer?.nextElementSibling;
  //const closeButton = drawer?.querySelector('sl-button[variant="primary"]');

  //openButton?.addEventListener('click', () => drawer.show());
  //closeButton?.addEventListener('click', () => drawer.hide());
}
**/

//---------------------------------------------------------------------------------------------------------------

export function handleClick_allgeiner_querschnitt() {
  console.log('handleClick_allgeiner_querschnitt()');

  const el = document.getElementById('id_dialog');
  console.log('id_dialog', el);
  console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
  (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------

export function click_neuer_querschnitt_rechteck() {
  //---------------------------------------------------------------------------------------------------------------
  console.log('click_neuer_querschnitt_rechteck()');

  const elHaupt = document.getElementById('id_haupt') as drHaupt;
  let shadow = elHaupt.shadowRoot;
  if (shadow) {
    const el = shadow.getElementById('id_dialog_rechteck') as drRechteckQuerSchnitt;

    el.init_name_changed(true);

    // console.log("id_dialog_rechteck", el);
    // console.log("QUERY Dialog", el?.shadowRoot?.getElementById("dialog_rechteck"));

    (el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement).addEventListener('close', dialog_querschnitt_closed);

    set_dialog_querschnitt_new(true);

    (el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement).showModal();
  }
}
/*
//---------------------------------------------------------------------------------------------------------------
function neuZeilen() {
   //---------------------------------------------------------------------------------------------------------------
   const el = document.getElementById('id_knoten_tabelle');
   console.log('EL: >>', el);
   el?.setAttribute('nzeilen', '4');
   console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));
   const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
   console.log('nZeilen', table.rows.length);
   console.log('nSpalten', table.rows[0].cells.length);

   let nnodes = table.rows.length - 1;
   let wert: any;

   for (let i = 0; i < nnodes; i++) {
      let child = table.rows[i + 1].cells[1]
         .firstElementChild as HTMLInputElement;
      wert = child.value;
      child.value = '21';
      console.log('NODE i:1', i, wert);
      child = table.rows[i + 1].cells[2].firstElementChild as HTMLInputElement;
      console.log('NODE i:2', i, wert);
      wert = child.value;
   }
}
*/
/*
//---------------------------------------------------------------------------------------------------------------
function handleClick_rechteck_dialog(ev: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("handleClick_LD()", ev);

 const el = document.getElementById('id_dialog');
 console.log('id_dialog', el);
 console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
 (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
}
*/

// //---------------------------------------------------------------------------------------------------------------
// function calculate_alt() {
//   //------------------------------------------------------------------------------------------------------------
//   //console.log('calculate');

//   resizeTables();
//   rechnen(1);

// }

//---------------------------------------------------------------------------------------------------------------
export function calculate() {
  //------------------------------------------------------------------------------------------------------------
  //console.log('calculate');

  //resizeTables();
  rechnen(1);
}

//---------------------------------------------------------------------------------------------------------------
export function resizeTables() {
  //---------------------------------------------------------------------------------------------------------------
  const elHaupt = document.getElementById('id_haupt') as drHaupt;
  let shadow = elHaupt.shadowRoot;
  if (shadow) {
    {
      const el_knoten = shadow.getElementById('id_button_nnodes');
      const nnodes = (el_knoten?.shadowRoot?.getElementById('nnodes') as HTMLInputElement).value;

      const el = shadow.getElementById('id_knoten_tabelle');
      el?.setAttribute('nzeilen', nnodes);
    }
    {
      const el_knoten = shadow.getElementById('id_button_nnodedisps');
      const nnodes = (el_knoten?.shadowRoot?.getElementById('nnodedisps') as HTMLInputElement).value;

      const el = shadow.getElementById('id_nnodedisps_tabelle');
      el?.setAttribute('nzeilen', nnodes);
    }
    {
      const el_elemente = shadow.getElementById('id_button_nelem');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nelem') as HTMLInputElement).value;

      const el = shadow.getElementById('id_element_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nnodalloads');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nnodalloads') as HTMLInputElement).value;

      const el = shadow.getElementById('id_knotenlasten_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nstreckenlasten');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nelemloads') as HTMLInputElement).value;

      const el = shadow.getElementById('id_streckenlasten_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_neinzellasten');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nelemloads') as HTMLInputElement).value;

      const el = shadow.getElementById('id_einzellasten_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_ntemperaturlasten');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nelemloads') as HTMLInputElement).value;

      const el = shadow.getElementById('id_temperaturlasten_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nstabvorverformungen');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nstabvorverformungen') as HTMLInputElement).value;

      const el = shadow.getElementById('id_stabvorverfomungen_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nvorspannungen');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nvorspannungen') as HTMLInputElement).value;

      const el = shadow.getElementById('id_vorspannungen_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nspannschloesser');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nspannschloesser') as HTMLInputElement).value;

      const el = shadow.getElementById('id_spannschloesser_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nlastfaelle');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nlastfaelle') as HTMLInputElement).value;

      const el = shadow.getElementById('id_lastfaelle_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      let el_elemente = shadow.getElementById('id_button_nkombinationen');
      let nelem = (el_elemente?.shadowRoot?.getElementById('nkombinationen') as HTMLInputElement).value;

      let el = shadow.getElementById('id_kombinationen_tabelle');
      el?.setAttribute('nzeilen', nelem);
      //---------------------------------------
      el_elemente = shadow.getElementById('id_button_nlastfaelle');
      nelem = (el_elemente?.shadowRoot?.getElementById('nlastfaelle') as HTMLInputElement).value;

      el = shadow.getElementById('id_kombinationen_tabelle');
      el?.setAttribute('nspalten', String(Number(nelem) + 1)); // +1 wegen Kommentarspalte
    }

    {
      const el_elemente = shadow.getElementById('id_button_nnodalmass');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nnodalmass') as HTMLInputElement).value;

      const el = shadow.getElementById('id_knotenmassen_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    {
      const el_elemente = shadow.getElementById('id_button_nkoppelfedern');
      const nelem = (el_elemente?.shadowRoot?.getElementById('nkoppelfedern') as HTMLInputElement).value;

      const el = shadow.getElementById('id_koppelfedern_tabelle');
      el?.setAttribute('nzeilen', nelem);
    }

    // if (System === 0) showColumnsForStabwerk();
    // else hideColumnsForFachwerk();
    if (System === 1) hideColumnsForFachwerk();
  }
}

//---------------------------------------------------------------------------------------------------------------
export function clearTables() {
  //------------------------------------------------------------------------------------------------------------
  const elHaupt = document.getElementById('id_haupt') as drHaupt;
  let shadow = elHaupt.shadowRoot;
  if (shadow) {

    let el = shadow.getElementById('id_knoten_tabelle');
    el?.setAttribute('clear', '0');

    // el = shadow.getElementById("id_nnodedisps_tabelle_gui");
    // el?.setAttribute("clear", "0");

    el = shadow.getElementById('id_element_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_knotenlasten_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_streckenlasten_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_einzellasten_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_temperaturlasten_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_stabvorverfomungen_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_vorspannungen_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_spannschloesser_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_lastfaelle_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_kombinationen_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_knotenmassen_tabelle');
    el?.setAttribute('clear', '0');

    el = shadow.getElementById('id_koppelfedern_tabelle');
    el?.setAttribute('clear', '0');

    while (nQuerschnittSets > 0) {
      del_last_querschnittSet();
      let element = shadow.getElementById('id_tree_LQ') as any;
      element?.removeChild(element?.lastChild);
    }

    removeAll_def_querschnitt(); // lösche Querschnitte in Button in Tab System
    two_cad_clear();
  }
}

//---------------------------------------------------------------------------------------------------------------

export function button_neue_eingabe() {
  //------------------------------------------------------------------------------------------------------------
  console.log('button_neue_eingabe()');

  const elHaupt = document.getElementById('id_haupt') as drHaupt;
  let shadow = elHaupt.shadowRoot;
  if (shadow) {

    const el = shadow.getElementById('id_dialog_neue_eingabe');
    // console.log('id_dialog_neue_eingabe', el);
    // console.log(
    //   'QUERY Dialog',
    //   el?.shadowRoot?.getElementById('dialog_neue_eingabe')
    // );

    (el?.shadowRoot?.getElementById('dialog_neue_eingabe') as HTMLDialogElement).addEventListener('close', dialog_neue_eingabe_closed);

    (el?.shadowRoot?.getElementById('dialog_neue_eingabe') as HTMLDialogElement).showModal();
  }
}

//---------------------------------------------------------------------------------------------------------------
function dialog_neue_eingabe_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log('Event dialog closed', e);
  console.log('this', this);

  const elHaupt = document.getElementById('id_haupt') as drHaupt;
  let shadow = elHaupt.shadowRoot;
  if (shadow) {

    const ele = shadow.getElementById('id_dialog_neue_eingabe') as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    (ele?.shadowRoot?.getElementById('dialog_neue_eingabe') as HTMLDialogElement).removeEventListener('close', dialog_querschnitt_closed);

    if (returnValue === 'ok') {
      let system = Number((ele.shadowRoot?.getElementById('id_system') as HTMLSelectElement).value);

      setSystem(system);

      console.log('Dialog neue Eingabe mit ok geschlossen', system);

      let el = shadow.getElementById('id_button_nnodes') as drButtonPM;
      console.log('el id_button_nnodes', el);
      el.setValue(0);
      // el = shadow.getElementById("id_button_nnodedisps_gui") as drButtonPM;
      // el.setValue(0);
      el = shadow.getElementById('id_button_nelem') as drButtonPM;
      el.setValue(0);
      el = shadow.getElementById('id_button_nnodalloads') as drButtonPM;
      el.setValue(0);
      el = shadow.getElementById('id_button_nstreckenlasten') as drButtonPM;
      el.setValue(0);

      el = shadow.getElementById('id_button_neinzellasten') as drButtonPM;
      el.setValue(0);

      el = shadow.getElementById('id_button_ntemperaturlasten') as drButtonPM;
      el.setValue(0);

      el = shadow.getElementById('id_button_nlastfaelle') as drButtonPM;
      el.setValue(1);
      zero_max_lastfall();
      set_max_lastfall(1);
      el = shadow.getElementById('id_button_nkombinationen') as drButtonPM;
      el.setValue(0);
      el = shadow.getElementById('id_button_nstabvorverformungen') as drButtonPM;
      el.setValue(0);

      el = shadow.getElementById('id_button_niter') as drButtonPM;
      el.setValue(10);

      el = shadow.getElementById('id_button_nnodalmass') as drButtonPM;
      el.setValue(0);

      el = shadow.getElementById('id_button_dyn_neigv') as drButtonPM;
      el.setValue(1);

      let eli = shadow.getElementById('id_eps_disp_tol') as HTMLInputElement;
      eli.value = '1e-5';

      let els = shadow.getElementById('id_P_delta_option') as SlSelect;
      els.setAttribute('value', 'false');

      els = shadow.getElementById('id_ausgabe_SG_option') as SlSelect;
      els.setAttribute('value', 'true');

      els = shadow.getElementById('id_eig_solver_option') as SlSelect;
      els.setAttribute('value', '1');

      eli = shadow.getElementById('id_maxu_node_ID') as HTMLInputElement;
      eli.value = '';

      let elSel = shadow.getElementById('id_maxu_dir') as HTMLSelectElement;
      elSel.options[1].selected = true;

      eli = shadow.getElementById('id_maxu_schief') as HTMLInputElement;
      eli.value = '';

      el = shadow.getElementById('id_neigv') as drButtonPM;
      el.setValue(1);

      el = shadow.getElementById('id_button_nkoppelfedern') as drButtonPM;
      el.setValue(0);

      elSel = shadow.getElementById('id_stadyn') as HTMLSelectElement;
      elSel.value = '0';
      (shadow.getElementById('id_cad_knotenmasse_button') as HTMLButtonElement).style.display = 'none';

      const id_mass = shadow.getElementById('id_tab_mass') as SlSelect;
      id_mass.disabled = true;

      elSel = shadow.getElementById('id_THIIO') as HTMLSelectElement;
      elSel.options[0].selected = true;

      elSel = shadow.getElementById('id_matprop') as HTMLSelectElement;
      elSel.options[0].selected = true;

      elSel = shadow.getElementById('id_einheit_kraft_option') as HTMLSelectElement;
      elSel.options[0].selected = true;

      readLocalStorage_cad();

      resizeTables();
      clearTables();
      reset_gui();
      reset_controlpanel_grafik();

      reset_cad_nodes();

      if (system === 1) {
        el = shadow.getElementById('id_button_nteilungen') as drButtonPM;
        el.setValue(1);
      } else {
        el = shadow.getElementById('id_button_nteilungen') as drButtonPM;
        el.setValue(10);
      }

      set_show_stab_qname(true);
      set_show_knotenlasten(true);
      set_show_elementlasten(true);
      set_show_bemassung(true);
      set_show_lager(true);
      set_show_knotenverformung(true);
      set_show_knotenmassen(true);

      berechnungErforderlich(true);

      let element = shadow.getElementById('id_tab_quer'); // id_eingabe
      element?.click();
    }
  }
}

// //---------------------------------------------------------------------------------------------------------------
// export function set_current_filename(name: string) {
//   //-------------------------------------------------------------------------------------------------------------
//   currentFilename = name;
//   console.log('file name', name);
//   const el = document.getElementById('id_current_filename') as HTMLElement;
//   el.innerHTML = '&nbsp;&nbsp;aktueller Dateiname: ' + currentFilename;
// }

//---------------------------------------------------------------------------------------------------------------
export function button_eingabe_ueberpruefen() {
  //-------------------------------------------------------------------------------------------------------------
  console.log('button_eingabe_ueberpruefen()');

  resizeTables();
  rechnen(0);
}

//---------------------------------------------------------------------------------------------------------------
export function create_pdf() {
  //-------------------------------------------------------------------------------------------------------------
  my_jspdf();
}

//---------------------------------------------------------------------------------------------------------------
export function gleichungssystem_darstellen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  console.log('in gleichungssystem_darstellen', check);
  show_gleichungssystem(check);
  //myFunction_get();
  //myFunction_set();
}

//---------------------------------------------------------------------------------------------------------------
function elem_select_changed() {
  //-------------------------------------------------------------------------------------------------------------
  console.log('elem_select_changed');
  const checkbox = document.getElementById('id_glsystem_darstellen') as HTMLInputElement;
  console.log('checkbox', checkbox.checked);
  if (checkbox.checked) show_gleichungssystem(true);
}

//---------------------------------------------------------------------------------------------------------------
export function berechnungsart_changed() {
  //---------------------------------------------------------------------------------------------------------------
  // console.log("berechnungsart_changed");
  const sel = document.getElementById('id_stadyn') as HTMLSelectElement;
  const id_mass = document.getElementById('id_tab_mass') as SlSelect;
  const id_btn_mass = document.getElementById('id_cad_knotenmasse_button') as HTMLButtonElement;
  //let ele = document.getElementById('id_dialog_knotenmasse') as drDialogKnotenmasse;

  if (sel.value === '0') {
    id_mass.disabled = true;
    id_btn_mass.style.display = 'none';
    set_stadyn(0);
    //ele.set_system(0);
  } else {
    id_mass.disabled = false;
    id_btn_mass.style.display = 'inline-block';
    set_stadyn(1);
    //ele.set_system(1);
  }
  init_cad(2);
  berechnungErforderlich();
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_gelenke_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_gelenke_anzeigen", check);

  if (check) {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 10; i > 4; i--) el?.setAttribute('show_column', String(i));
  } else {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 10; i > 4; i--) el?.setAttribute('hide_column', String(i));
  }
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_starre_enden_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_starre_enden_anzeigen", check);

  if (check) {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 12; i > 10; i--) el?.setAttribute('show_column', String(i));
  } else {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 12; i > 10; i--) el?.setAttribute('hide_column', String(i));
  }
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_bettung_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_bettung_anzeigen", check);

  if (check) {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 13; i > 12; i--) el?.setAttribute('show_column', String(i));
  } else {
    let el = document.getElementById('id_element_tabelle');
    for (let i = 13; i > 12; i--) el?.setAttribute('hide_column', String(i));
  }
}

//---------------------------------------------------------------------------------------------------------------
export function show_video() {
  //-------------------------------------------------------------------------------------------------------------

  window.open('https://d2beam-gui.statikverstehen.de/videos/videos.html', '_blank', 'noopener');
}

//---------------------------------------------------------------------------------------------------------------
function einheit_bemassung_changed() {
  //-------------------------------------------------------------------------------------------------------------
  let el = document.getElementById('id_einheit_bemassung') as HTMLSelectElement;
  set_einheit_bemassung(el.value);
  init_cad(2);
}
// @ts-ignore
window.einheit_bemassung_changed = einheit_bemassung_changed;