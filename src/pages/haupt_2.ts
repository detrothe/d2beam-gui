
console.log("Anfang haupt_2.ts")

import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';

import './globals';

import { berechnungErforderlich, set_touch_support_table } from './globals';

import { add_listeners_einstellungen, readLocalStorage, readLocalStorage_cad } from './einstellungen';


import { drButtonPM } from '../components/dr-button-pm';
import { drRechteckQuerSchnitt } from '../components/dr-dialog-rechteckquerschnitt';

import { reset_gui } from '../components/dr-control-panel';

import DetectOS from './detectos';

import { addListener_filesave } from './dateien';
import { select_loadcase_changed, select_eigenvalue_changed, select_dyn_eigenvalue_changed, copy_svg, drawsystem, click_zurueck_grafik, reset_controlpanel_grafik, click_pan_button_grafik } from './grafik';
import { set_info, write } from './utility';

import { my_jspdf } from './mypdf';

//import { init_contextmenu } from '../components/dr-tabelle';

import { rechnen, init_tabellen, show_gleichungssystem, setSystem, System, hideColumnsForFachwerk, stadyn, set_stadyn } from './rechnen';

import { nQuerschnittSets, del_last_querschnittSet, dialog_querschnitt_closed, set_dialog_querschnitt_new, removeAll_def_querschnitt } from './querschnitte';

import { click_pan_button_cad, init_cad, init_two_cad, set_einheit_bemassung, set_raster_dx, set_raster_dz, set_raster_xmax, set_raster_xmin, set_raster_zmax, set_raster_zmin, set_show_bemassung, set_show_elementlasten, set_show_knotenlasten, set_show_knotenmassen, set_show_knotenverformung, set_show_lager, set_show_stab_qname, two_cad_clear } from './cad';
import { cad_buttons, close_drawer_1 } from './cad_buttons';
import { abbruch_property_dialog, delete_element_dialog, show_add_elload_dialog, show_property_dialog } from './cad_contextmenu';
import SlTabPanel from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import { set_max_lastfall, zero_max_lastfall } from './cad_draw_elementlasten';
import { reset_cad_nodes } from './cad_node';
import { info_Eigenwertberechnung, info_Materialeigenschaften } from './infos';
import { app, currentFilename, set_current_filename } from './haupt';
import { drHaupt } from '../components/dr-haupt';
import { drDialogEinstellungen } from '../components/dr-dialog_einstellungen';

console.log("in haupt2>")


//---------------------------------------------------------------------------------------------------------------

export function handleClick_allgemeiner_querschnitt() {
  console.log('handleClick_allgemeiner_querschnitt()');

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

      {
        let ele = shadow?.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
        ele.set_raster_dx(1.0);
        ele.set_raster_dz(1.0);

        ele.set_rasterOffset_x(0.0);
        ele.set_rasterOffset_z(0.0);

        ele.set_raster_xmin(-1.0);
        ele.set_raster_xmax(15.0);
        ele.set_raster_zmin(-10.0);
        ele.set_raster_zmax(10.0);
      }
      set_raster_dx(1.0);
      set_raster_dz(1.0);
      set_raster_xmin(-1.0);
      set_raster_xmax(15.0);
      set_raster_zmin(-10.0);
      set_raster_zmax(10.0);

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
      set_current_filename('empty');

      let element = shadow.getElementById('id_tab_quer'); // id_eingabe
      element?.click();
    }
  }
}



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
export function elem_select_changed() {
  //-------------------------------------------------------------------------------------------------------------
  console.log('elem_select_changed');

  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    const checkbox = shadow.getElementById('id_glsystem_darstellen') as HTMLInputElement;
    console.log('checkbox', checkbox.checked);
    if (checkbox.checked) show_gleichungssystem(true);
  }
}

//---------------------------------------------------------------------------------------------------------------
export function berechnungsart_changed() {
  //---------------------------------------------------------------------------------------------------------------
  // console.log("berechnungsart_changed");
  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    const sel = shadow.getElementById('id_stadyn') as HTMLSelectElement;
    const id_mass = shadow.getElementById('id_tab_mass') as SlSelect;
    const id_btn_mass = shadow.getElementById('id_cad_knotenmasse_button') as HTMLButtonElement;
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
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_gelenke_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_gelenke_anzeigen", check);

  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    if (check) {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 10; i > 4; i--) el?.setAttribute('show_column', String(i));
    } else {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 10; i > 4; i--) el?.setAttribute('hide_column', String(i));
    }
  }
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_starre_enden_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_starre_enden_anzeigen", check);

  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    if (check) {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 12; i > 10; i--) el?.setAttribute('show_column', String(i));
    } else {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 12; i > 10; i--) el?.setAttribute('hide_column', String(i));
    }
  }
}

//---------------------------------------------------------------------------------------------------------------
export function elementTabelle_bettung_anzeigen(check: boolean) {
  //-------------------------------------------------------------------------------------------------------------
  // console.log("in elementTabelle_bettung_anzeigen", check);

  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    if (check) {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 13; i > 12; i--) el?.setAttribute('show_column', String(i));
    } else {
      let el = shadow.getElementById('id_element_tabelle');
      for (let i = 13; i > 12; i--) el?.setAttribute('hide_column', String(i));
    }
  }
}

//---------------------------------------------------------------------------------------------------------------
export function show_video() {
  //-------------------------------------------------------------------------------------------------------------
  if (app.browserLanguage === "de") {
    window.open('https://statikverstehen.de/videos/videos.html', '_blank', 'noopener');
  } else {
    window.open('https://fea-apps.de/videos/videos.html', '_blank', 'noopener');
  }
}

//---------------------------------------------------------------------------------------------------------------
function einheit_bemassung_changed() {
  //-------------------------------------------------------------------------------------------------------------

  const shadow = document.getElementById('id_haupt')?.shadowRoot;
  if (shadow) {
    let el = shadow.getElementById('id_einheit_bemassung') as HTMLSelectElement;
    set_einheit_bemassung(el.value);
    init_cad(2);
  }
}
// @ts-ignore
window.einheit_bemassung_changed = einheit_bemassung_changed;