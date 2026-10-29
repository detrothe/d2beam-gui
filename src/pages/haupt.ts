
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
import '../components/tastatur_hinweis'

import './locale-picker';

import DetectOS from './detectos';

import { drawsystem } from './grafik';

import { init_cad } from './cad';


console.log("in haupt")
const nlastfaelle_init = '1';

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
