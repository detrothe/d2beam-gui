// import { LitElement, html, render } from 'lit';
// import { property, customElement } from 'lit/decorators.js';
// //import { property, customElement } from 'lit/decorators.js';
// import { msg, localized } from '@lit/localize';
//import { styles } from '../styles/shared-styles';
console.log("Anfang haupt.ts")

// import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';

import './globals';

// import { berechnungErforderlich, set_touch_support_table } from './globals';

// import { add_listeners_einstellungen, readLocalStorage, readLocalStorage_cad } from './einstellungen';

import '../components/dr-button-pm';

import '../components/dr-tabelle';
import '../components/dr-dialog-layerquerschnitt';
import '../components/dr-dialog-rechteckquerschnitt';
import '../components/dr-dialog_neue_eingabe';
import '../components/dr-dialog_lager';
import '../components/dr-dialog_knoten';
import '../components/dr-dialog_knotenlast';
import '../components/dr-dialog_knotenmasse';
import '../components/dr-dialog_elementlasten';
import '../components/dr-dialog_stab_eigenschaften';
import '../components/dr-dialog_einstellungen';
import '../components/dr-dialog_info';
import '../components/dr-drawer_1';
import '../components/dr-dialog_messen';
import '../components/dr-dialog_bemassung';
import '../components/dr-dialog_knotenverformung';
import '../components/dr-dialog_kopieren';
import '../components/dr-dialog_selekt_typ';
import '../components/dr-dialog_edit_selected_elementlasten';
import '../components/dr-my_drawer';

import './locale-picker';

import { drButtonPM } from '../components/dr-button-pm';
import { drRechteckQuerSchnitt } from '../components/dr-dialog-rechteckquerschnitt';
//import { drMyDrawer } from '../components/dr-my_drawer';

// import { reset_gui } from './mypanelgui';

import DetectOS from './detectos';

// import { addListener_filesave } from './dateien';
import { select_loadcase_changed, select_eigenvalue_changed, select_dyn_eigenvalue_changed, copy_svg, drawsystem, click_zurueck_grafik, reset_controlpanel_grafik, click_pan_button_grafik } from './grafik';
// import { set_info, write } from './utility';

// import { my_jspdf } from './mypdf';

//import { init_contextmenu } from '../components/dr-tabelle';

//import { rechnen, init_tabellen, show_gleichungssystem, setSystem, System, hideColumnsForFachwerk, stadyn, set_stadyn } from './rechnen';

//import { nQuerschnittSets, del_last_querschnittSet, dialog_querschnitt_closed, set_dialog_querschnitt_new, removeAll_def_querschnitt } from './querschnitte';

import { click_pan_button_cad, init_cad, init_two_cad, set_einheit_bemassung, set_show_bemassung, set_show_elementlasten, set_show_knotenlasten, set_show_knotenmassen, set_show_knotenverformung, set_show_lager, set_show_stab_qname, two_cad_clear } from './cad';
// import { cad_buttons, close_drawer_1 } from './cad_buttons';
// import { abbruch_property_dialog, delete_element_dialog, show_add_elload_dialog, show_property_dialog } from './cad_contextmenu';
// import SlTabPanel from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
// import SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
// import { set_max_lastfall, zero_max_lastfall } from './cad_draw_elementlasten';
// import { reset_cad_nodes } from './cad_node';
// import { info_Eigenwertberechnung, info_Materialeigenschaften } from './infos';

console.log("in haupt")
//import '../components/dr-haupt'
//console.log("nach dr-haupt")
// const nnodes_init = '0';
// const nelem_init = '0';
// const nnodalloads_init = '0';
// const nstreckenlasten_init = '0';
// const neinzellasten_init = '0';
// const ntemperaturlasten_init = '0';
const nlastfaelle_init = '1';
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

export let currentFilename = 'empty';

export const app = {
  appName: 'd2beam-gui',
  browserLanguage: 'de',
  file: {
    handle: null,
    name: null,
    isModified: false,
  },
  options: {
    captureTabs: true,
    fontSize: 16,
    monoSpace: false,
    wordWrap: true,
  },
  hasFSAccess: 'chooseFileSystemEntries' in window || 'showOpenFilePicker' in window || 'showSaveFilePicker' in window,
  isMac: navigator.userAgent.includes('Mac OS X'),
};

export const Detect = new DetectOS();
{
  let txt = navigator.language;
  let txtArray = txt.split('-');

  app.browserLanguage = txtArray[0];
  console.log('app.browserLanguage', app.browserLanguage);
}

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

const portrait = window.matchMedia('(orientation: portrait)');

portrait.addEventListener('change', function (e) {
  if (e.matches) {
    // Portrait mode
    //write("portrait mode")
    init_cad(0);
    drawsystem();
  } else {
    // Landscape
    // write("landscape mode")
    init_cad(0);
    drawsystem();
  }
});

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
export function set_current_filename(name: string) {
  //-------------------------------------------------------------------------------------------------------------
  currentFilename = name;
  console.log('file name', name);

  const elHaupt = document.getElementById('id_haupt');
  let shadow = elHaupt?.shadowRoot;
  if (shadow) {
    const el = shadow.getElementById('id_current_filename') as HTMLElement;
    el.innerHTML = '&nbsp;&nbsp;aktueller Dateiname: ' + currentFilename;
  }
}
