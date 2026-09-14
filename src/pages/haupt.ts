
console.log("Anfang haupt.ts")

import './globals';

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
import '../components/dr-control-panel'

import './locale-picker';

import DetectOS from './detectos';

import { select_loadcase_changed, select_eigenvalue_changed, select_dyn_eigenvalue_changed, copy_svg, drawsystem, click_zurueck_grafik, reset_controlpanel_grafik, click_pan_button_grafik } from './grafik';


import { init_cad } from './cad';


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


//---------------------------------------------------------------------------------------------------------------
export function set_current_filename(name: string) {
  //-------------------------------------------------------------------------------------------------------------
  currentFilename = name;
  console.log('file name', name);

  const elHaupt = document.getElementById('id_haupt');
  let shadow = elHaupt?.shadowRoot;
  if (shadow) {
    const el = shadow.getElementById('id_current_filename') as HTMLSpanElement;
    el.innerHTML = currentFilename;   //'&nbsp;&nbsp;aktueller Dateiname: ' +
  }
}
