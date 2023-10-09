import { html, render } from 'lit';
//import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';

//import { styles } from '../styles/shared-styles';
import './globals';

import { add_listeners_einstellungen, readLocalStorage } from './einstellungen';

import '../components/dr-button-pm';
//import '../components/dr-table';
import '../components/dr-tabelle';
import '../components/dr-dialog-layerquerschnitt';
import '../components/dr-dialog-rechteckquerschnitt';

//import { testclass } from './element';

import DetectOS from './detectos';

import { addListener_filesave } from './dateien';
import {
   select_loadcase_changed,
   select_eigenvalue_changed,
   copy_svg,
} from './grafik';
import { set_info } from './utility';
//import { init_contextmenu } from '../components/dr-tabelle';

import {
   rechnen,
   nQuerschnittSets,
   incr_querschnittSets,
   set_querschnittRechteck,
   get_querschnittRechteck,
   update_querschnittRechteck,
   init_tabellen,
   del_last_querschnittSet,
} from './rechnen';

let dialog_querschnitt_new = true;
let dialog_querschnitt_index = 0;
let dialog_querschnitt_item_id = '';

export const nnodes_init = '2';
export const nelem_init = '1';
export const nnodalloads_init = '1';
export const nstreckenlasten_init = '1';
export const neinzellasten_init = '0';
export const ntemperaturlasten_init = '0';
export const nlastfaelle_init = '2';
export const nkombinationen_init = '2';
export const nstabvorverfomungen_init = '0';
export const nvorspannungen_init = '0';
export const nspannschloesser_init = '0';
export let column_string_kombitabelle: string;
export let typs_string_kombitabelle: string;
//export let column_width_elementtabelle: string;
const nkombiSpalten_init = '3'; // immer 1 mehr als nlastfaelle_init
const nnodedisps_init = '0';

export const app = {
   appName: 'd2beam',
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
   hasFSAccess:
      'chooseFileSystemEntries' in window ||
      'showOpenFilePicker' in window ||
      'showSaveFilePicker' in window,
   isMac: navigator.userAgent.includes('Mac OS X'),
};

export const Detect = new DetectOS();
{
   let txt = navigator.language;
   let txtArray = txt.split('-');

   app.browserLanguage = txtArray[0];
   console.log('app.browserLanguage', app.browserLanguage);
}

column_string_kombitabelle = '["Kombi", "Kommentar"';
for (let i = 1; i <= Number(nlastfaelle_init); i++) {
   column_string_kombitabelle = column_string_kombitabelle + ', "Lf ' + i + '"';
}
column_string_kombitabelle = column_string_kombitabelle + ']';
console.log('column_string_kombitabelle', column_string_kombitabelle);

typs_string_kombitabelle = '["-", "text"';
for (let i = 1; i <= Number(nlastfaelle_init); i++) {
   typs_string_kombitabelle = typs_string_kombitabelle + ', "number"';
}
typs_string_kombitabelle = typs_string_kombitabelle + ']';
console.log('typs_string_kombitabelle', typs_string_kombitabelle);

{
   //const template = html`  // verwenden, wenn ohne renderbefore, siehe unten

   const template = () => html`
      <style>
         .custom-icons sl-tree-item::part(expand-button) {
            /* Disable the expand/collapse animation */
            rotate: none;
         }
      </style>

      <sl-tab-group>
         <sl-tab id="id_tab_group" slot="nav" panel="tab-haupt">Haupt</sl-tab>
         <sl-tab slot="nav" panel="tab-grafik">Grafik</sl-tab>
         <sl-tab slot="nav" panel="tab-querschnitte">Querschnitte</sl-tab>
         <sl-tab slot="nav" panel="tab-knoten">Knoten</sl-tab>
         <sl-tab slot="nav" panel="tab-elemente">Elemente</sl-tab>
         <sl-tab slot="nav" panel="tab-knotenlasten">Knotenlasten</sl-tab>
         <sl-tab slot="nav" panel="tab-elementlasten">Elementlasten</sl-tab>
         <sl-tab slot="nav" panel="tab-stabvorverfomungen"
            >Vorverformungen</sl-tab
         >
         <sl-tab slot="nav" panel="tab-kombinationen">Kombinationen</sl-tab>
         <sl-tab slot="nav" panel="tab-ergebnisse">Ergebnisse</sl-tab>
         <sl-tab slot="nav" panel="tab-pro">Pro</sl-tab>
         <sl-tab slot="nav" panel="tab-info">Info</sl-tab>
         <sl-tab slot="nav" panel="tab-menue3">ꔷꔷꔷ</sl-tab>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-haupt">
            <p>
               <br />
               <button type="button" id="saveFile" style="min-width:8em;">
                  Daten speichern
               </button>
               <button type="button" id="readFile" style="min-width:8em;">
                  Daten einlesen
               </button>
            </p>

            <hr />
            <br />

            <table id="querschnittwerte_table">
               <tbody>
                  <tr>
                     <td>
                        <sl-button
                           id="clear"
                           value="clear"
                           @click="${clearTables}"
                           >neue Eingabe beginnen</sl-button
                        >
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>

                     <td>
                        <select name="THIIO" id="id_THIIO">
                           <option value="0" selected>Th. I. Ordnung</option>
                           <option value="1">Th. II. Ordnung</option>
                        </select>
                     </td>
                     <td></td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>
                     <td
                        colspan="2"
                        style="text-align:center"
                        title="Schiefstellung mit erste Eigenform"
                     >
                        Schiefstellung
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>
                     <td
                        title="0=automatische Skalierung auf den Größtwert aus der Eigenwertberechnung"
                     >
                        Knoten :
                     </td>
                     <td>
                        <input
                           type="number"
                           step="1"
                           id="id_maxu_node"
                           name="maxu_node"
                           class="input_tab"
                           pattern="[0-9.,eE+-]*"
                           value=""
                           onchange="berechnungErforderlich()"
                        />
                     </td>
                  </tr>

                  <tr>
                     <td></td>
                     <td></td>
                     <td>Richtung :</td>
                     <td>
                        <select
                           name="maxu_dir"
                           id="id_maxu_dir"
                           style="min-width: 100%;"
                        >
                           <option value="0">x (u)</option>
                           <option value="1" selected>z (w)</option>
                           <option value="2">&phi;</option>
                        </select>
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>
                     <td title="Vorverformung am Knoten in gewählter Richtung">
                        &Delta; [mm, mrad] :
                     </td>
                     <td>
                        <input
                           type="number"
                           step="any"
                           id="id_maxu_schief"
                           name="maxu_schief"
                           class="input_tab"
                           pattern="[0-9.,eE+-]*"
                           value="20"
                           onchange="berechnungErforderlich()"
                        />
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>
                     <td
                        title="Anzahl der zu berechnenden Eigenwerte, für die Schiefstellung wird immer die erste Eigenform verwendet"
                     >
                        Anzahl Eigenwerte :
                     </td>
                     <td>
                        <input
                           type="number"
                           step="1"
                           min="1"
                           id="id_neigv"
                           name="neigv"
                           class="input_tab"
                           pattern="[0-9.,eE+-]*"
                           value="2"
                           onchange="berechnungErforderlich()"
                        />
                     </td>
                  </tr>

                  <tr>
                     <td></td>
                     <td></td>
                  </tr>
                  <tr>
                     <td></td>
                     <td></td>
                  </tr>
                  <tr>


                     <td>
                        <sl-button
                           id="rechnen"
                           value="Rechnen"
                           @click="${calculate}"
                           >Rechnen</sl-button
                        >
                     </td>
                  </tr>
               </tbody>
            </table>

            <div class="output_container">
            <textarea id="output" rows="40" ></textarea>  <!-- rows="40" cols="8"  -->
            </div>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-grafik">
            <div
               id="id_grafik"
               style=" background-color:#fffaed;margin:0;padding:0"
            >
               <!-- width:100vw; ;width:300px;height:300px; -->
               <div id="panel_gui"></div>
               <div id="id_div_select_lc">
                  <select id="id_select_loadcase" on></select>
               </div>
               <div id="id_div_select_eigv">
                  <select id="id_select_eigenvalue" on></select>
               </div>
               <button id="id_button_copy_svg">copy</button>
               <div id="artboard"></div>
            </div>
            <!--  height: 100%; -->
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-querschnitte">
            <!--
        <sl-button id="open-dialog" @click="${handleClick}"
          >neuer allgemeiner Querschnitt</sl-button
        >
        -->
            <br />
            <sl-button
               id="open-dialog_rechteck"
               @click="${handleClick_rechteck}"
               >neuer Querschnitt</sl-button
            >
            <br /><br />
            <sl-tree class="custom-icons">
               <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
           -->
               <sl-tree-item
                  id="id_tree_LQ"
                  @click="${handleClick_rechteck_dialog}"
                  expanded
               >
                  Linear elastisch Querschnittswerte
                  <!-- <sl-tree-item>Birch</sl-tree-item>

                  <sl-tree-item>Oak</sl-tree-item> -->
               </sl-tree-item>

               <sl-tree-item>
                  Linear elastisch allgemein
                  <sl-tree-item>nix 1</sl-tree-item>
                  <sl-tree-item>nix 2</sl-tree-item>
                  <sl-tree-item>nix 3</sl-tree-item>
               </sl-tree-item>
            </sl-tree>

            <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt>
            <dr-rechteckquerschnitt
               id="id_dialog_rechteck"
            ></dr-rechteckquerschnitt>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-elemente">
            <p><b>Eingabe der Elemente</b> <br /></p>

            <p>
               Anzahl Elemente:

               <dr-button-pm
                  id="id_button_nelem"
                  nel="${nelem_init}"
                  inputid="nelem"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>
            <dr-tabelle
               id="id_element_tabelle"
               nzeilen="${nelem_init}"
               nspalten="10"
               columns='["No", "Querschnitt", "Typ", "nod a", "nod e", "N<sub>L</sub>", "V<sub>L</sub>", "M<sub>L</sub>", "N<sub>R</sub>", "V<sub>R</sub>", "M<sub>R</sub>"]'
               typs='["-", "select", "number", "number", "number", "number", "number", "number", "number", "number", "number"]'
               colwidth='["4","8","3","3","3","3","3","3","3","3","3"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-knoten"
            ><p>
               <b>Eingabe der Knotenkoordinaten und Lager</b><br /><br />
               1 = starre Lagerung<br />
               0 oder leere Zelle = frei beweglich<br />
               > 1 = Federsteifigkeit in kN/m bzw. kNm/rad<br />
               <br />
               Drehung des Lagers im Gegenuhrzeigersinn positiv<br /><br />
            </p>
            <p>
               Anzahl Knoten:
               <dr-button-pm
                  id="id_button_nnodes"
                  nel="${nnodes_init}"
                  inputid="nnodes"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>
            <dr-tabelle
               id="id_knoten_tabelle"
               nzeilen="${nnodes_init}"
               nspalten="6"
               columns='["No", "x [m]", "z [m]", "L<sub>x</sub>&nbsp;(kN/m)", "L<sub>z</sub>&nbsp;(kN/m)", "L<sub>&phi;</sub>&nbsp;(kNm/rad)", "Winkel [°]"]'
            ></dr-tabelle>

            <p><br /><b>Knotenverformungen</b><br /></p>
            <p>zum Beispiel für Stützensenkungen</p>
            <p>
               Die Richtungen stimmen mit den Richtungen des zugehörigen
               gedrehten Lagerknotens überein.
               <br />
               Es sind nur die
               Werte in den Tabellenzellen einzugeben, für die definierte
               Verformungen gewünscht werden.<br />
               Nur Werte ungleich 0 werden berücksichtigt.
            </p>
            <p>
               Anzahl Knoten mit<br />vorgebenenen Verformungen:
               <dr-button-pm
                  id="id_button_nnodedisps"
                  nel="${nnodedisps_init}"
                  inputid="nnodedisps"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>
            <dr-tabelle
               id="id_nnodedisps_tabelle"
               nzeilen="${nnodedisps_init}"
               nspalten="5"
               columns='["No", "Knoten", "Lastfall", "u<sub>x&prime;0</sub> [mm]", "u<sub>z&prime;0</sub> [mm]", "&phi;<sub>0</sub> [mrad]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-knotenlasten"
            ><p><b>Eingabe der Knotenlasten</b><br /><br /></p>
            <p>
               Anzahl Knotenlasten:

               <dr-button-pm
                  id="id_button_nnodalloads"
                  nel="${nnodalloads_init}"
                  inputid="nnodalloads"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
               <br /><br />
            </p>
            <dr-tabelle
               id="id_knotenlasten_tabelle"
               nzeilen="${nnodalloads_init}"
               nspalten="5"
               columns='["No", "Knoten", "Lastfall", "P<sub>x</sub> [kN]", "P<sub>z</sub> [kN]", "M<sub>y</sub> [kNm]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-elementlasten"
            ><p>
               <b>Eingabe der Streckenlasten</b><br /><br />
               Lastarten<br /><br />
               0 = Trapezstreckenlast senkrecht auf Stab<br />
               1 = Trapezstreckenlast in globaler z-Richtung<br />
               2 = Trapezstreckenlast in globaler z-Richtung, Projektion<br />
               3 = Trapezstreckenlast in globaler x-Richtung, TODO<br />
               4 = Trapezstreckenlast in globaler x-Richtung, Projektion,
               TODO<br />
            </p>
            <p>
               Anzahl Streckenlasten:
               <dr-button-pm
                  id="id_button_nstreckenlasten"
                  nel="${nstreckenlasten_init}"
                  inputid="nelemloads"
                  onchange="berechnungErforderlich()"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>
            <dr-tabelle
               id="id_streckenlasten_tabelle"
               nzeilen="${nstreckenlasten_init}"
               nspalten="5"
               columns='["No", "Element", "Lastfall", "Art", "p<sub>links</sub><br> [kN/m]", "p<sub>rechts</sub><br> [kN/m]"]'
            ></dr-tabelle>

            <p>
               <br />
               <b>Eingabe der Einzellasten</b><br /><br />
               Einzellast P wirkt senkrecht auf Stab<br />
            </p>
            <p>
               <br />
               Anzahl Einzellasten:
               <dr-button-pm
                  id="id_button_neinzellasten"
                  nel="${neinzellasten_init}"
                  inputid="nelemloads"
                  onchange="berechnungErforderlich()"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>

            <dr-tabelle
               id="id_einzellasten_tabelle"
               nzeilen="${neinzellasten_init}"
               nspalten="5"
               columns='["No", "Element", "Lastfall", "x [m]", "P [kN]", "M [kNm]"]'
            ></dr-tabelle>

            <p>
               <br />
               <b>Eingabe der Temperaturlasten</b><br /><br />
               t<sub>u</sub> Temperatur Unterseite (gestrichelte Faser)<br />
               t<sub>o</sub> Temperatur Oberseite<br />
            </p>
            <p>
               Anzahl Temperaturlasten:
               <dr-button-pm
                  id="id_button_ntemperaturlasten"
                  nel="${ntemperaturlasten_init}"
                  inputid="nelemloads"
                  onchange="berechnungErforderlich()"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>

            <dr-tabelle
               id="id_temperaturlasten_tabelle"
               nzeilen="${ntemperaturlasten_init}"
               nspalten="4"
               columns='["No", "Element", "Lastfall", "t<sub>u</sub> [°]", "t<sub>o</sub> [°]"]'
            ></dr-tabelle>
            <!-- neu -->

            <p>
               <br />
               <b>Eingabe der zentrischen Vorspannung</b><br /><br />
            </p>
            <p>
               Anzahl der Vorspannungen:
               <dr-button-pm
                  id="id_button_nvorspannungen"
                  nel="${nvorspannungen_init}"
                  inputid="nvorspannungen"
                  onchange="berechnungErforderlich()"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>

            <dr-tabelle
               id="id_vorspannungen_tabelle"
               nzeilen="${nvorspannungen_init}"
               nspalten="3"
               columns='["No", "Element", "Lastfall", "&sigma;<sub>v</sub> [N/mm²]"]'
            ></dr-tabelle>
            <!-- neu -->

            <p>
               <br />
               <b>Eingabe der Spannschlösser</b><br /><br />
            </p>
            <p>
               Anzahl Temperaturlasten:
               <dr-button-pm
                  id="id_button_nspannschloesser"
                  nel="${nspannschloesser_init}"
                  inputid="nspannschloesser"
                  onchange="berechnungErforderlich()"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>

            <dr-tabelle
               id="id_spannschloesser_tabelle"
               nzeilen="${nspannschloesser_init}"
               nspalten="3"
               columns='["No", "Element", "Lastfall", "&Delta;s [mm]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-kombinationen">
            <p>
               <b> Eingabe der Kombinationen</b>
            </p>

            <table>
               <tbody>
                  <tr>
                     <td>Anzahl Lastfälle:</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nlastfaelle"
                           nel="${nlastfaelle_init}"
                           inputid="nlastfaelle"
                        ></dr-button-pm>
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Kombinationen:</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nkombinationen"
                           nel="${nkombinationen_init}"
                           inputid="nkombinationen"
                        ></dr-button-pm>
                     </td>
                     <td>
                        <sl-button
                           id="resize"
                           value="resize"
                           @click="${resizeTables}"
                           >Resize Tabelle</sl-button
                        >
                     </td>
                  </tr>
               </tbody>
            </table>

            <dr-tabelle
               id="id_kombinationen_tabelle"
               nzeilen="${nkombinationen_init}"
               nspalten="${nkombiSpalten_init}"
               columns="${column_string_kombitabelle}"
               typs="${typs_string_kombitabelle}"
               coltext="Lf"
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-stabvorverfomungen">
            <p>
               <b> Eingabe der Stabvorverfomungen für Theorie II. Ordnung</b>
            </p>
            <p>
               Anzahl Stabvorverformungen:
               <dr-button-pm
                  id="id_button_nstabvorverformungen"
                  nel="${nstabvorverfomungen_init}"
                  inputid="nstabvorverformungen"
               ></dr-button-pm>
               <sl-button id="resize" value="resize" @click="${resizeTables}"
                  >Resize Tabelle</sl-button
               >
            </p>
            <dr-tabelle
               id="id_stabvorverfomungen_tabelle"
               nzeilen="${nstabvorverfomungen_init}"
               nspalten="4"
               columns='["No", "Element", "w<sub>0a</sub> [cm]", "w<sub>0e</sub> [cm]", "w<sub>0m</sub> [cm]"]'
            ></dr-tabelle>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-ergebnisse"
            >Ergebnisse
            <div id="id_results"></div>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-pro"
            ><b>Einstellungen D2beam Element</b><br /><br /><br />

            <table>
               <tbody>
                  <tr>
                     <td id="id_nteilungen">Teilungen Ausgabe:</td>
                     <td>
                        <dr-button-pm
                           id="id_button_nteilungen"
                           nel="10"
                           inputid="nteilungen"
                        ></dr-button-pm>
                     </td>
                  </tr>
                  <tr>
                     <td id="id_niter">Anzahl Iterationen:</td>
                     <td>
                        <dr-button-pm
                           id="id_button_niter"
                           nel="5"
                           inputid="niter"
                        ></dr-button-pm>
                     </td>
                  </tr>
               </tbody>
            </table>

            <!--
        <table id="querschnittwerte_table">
          <tbody>
            <tr>
              <td>Anzahl Integrationspunkte :</td>
              <td>
                <input
                  type="number"
                  step="any"
                  id="id_ndivsl"
                  name="ndivsl"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="7"
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>
            <tr>
              <td>Art der Integration :</td>
              <td>
                <select name="intart" id="id_intart">
                  <option value="0">Gauss-Legendre</option>
                  <option value="1" selected>Newton Codes</option>
                  <option value="2">Lobatto</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Art innere Knoten :</td>
              <td>
                <select name="art" id="id_art">
                  <option value="0">u, w</option>
                  <option value="1" selected>u, w, φ</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
    -->
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-info">
            <div id="id_hilfe" class="c_hilfe">
               <div
                  id="id_doc_frame"
                  style="position: relative; width: 760px; left:50%;"
               >
                  <iframe
                     id="id_doc"
                     src="src/info/Kurzdokumentation_deutsch.html"
                     width="100%"
                     height="1500px"
                     style="border: none; overflow: scroll; background-color: white;"
                  >
                  </iframe>
               </div>
            </div>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-menue3"
            ><p><b>Einstellungen</b><br /><br /></p>
            <div id="id_einstellungen">
               <br />
               <table>
                  <tbody>
                     <tr>
                        <td id="lab_font_size">Schriftgröße:</td>
                        <td>
                           <select
                              name="fontSize"
                              id="id_fontsize"
                              style="width: 150px;"
                           >
                              <option value="0.5em">8</option>
                              <option value="0.5625em">9</option>
                              <option value="0.625em">10</option>
                              <option value="0.7em">11</option>
                              <option value="0.75em">12</option>
                              <option value="0.8em">13</option>
                              <option value="0.875em">14</option>
                              <option value="0.95em">15</option>
                              <option value="1em" selected>16</option>
                              <option value="1.125em">18</option>
                           </select>
                        </td>
                     </tr>
                     <tr>
                        <td>&nbsp;</td>
                     </tr>
                     <tr>
                        <td
                           style="white-space:nowrap"
                           id="lab_tableColor_outside"
                        >
                           Tabellenfarbe außen: &nbsp;
                        </td>
                        <td>
                           <input
                              id="id_color_table_out"
                              value="#CFD915"
                              style="width: 150px; border-radius: 3px; border-width: 1px;"
                              data-jscolor="{ preset: 'dark', closeButton: true, closeText: 'OK' }"
                           />
                        </td>
                     </tr>
                     <tr>
                        <td
                           style="white-space:nowrap"
                           id="lab_tableColor_inside"
                        >
                           Tabellenfarbe innen: &nbsp;
                        </td>
                        <td>
                           <input
                              id="id_color_table_in"
                              value="#b3ae00"
                              style="width: 150px; border-radius: 3px; border-width: 1px;"
                              data-jscolor="{ preset: 'dark', closeButton: true, closeText: 'OK' }"
                           />
                        </td>
                     </tr>
                  </tbody>
               </table>

               <br /><br />
               <p>
                  <button type="button" id="id_cb_saveLocalStorage">
                     Auswahl als Standardwerte im Browser speichern
                  </button>
               </p>
               <p>
                  <button type="button" id="id_cb_deleteLocalStorage">
                     Standardwerte im Speicher des Browsers löschen
                  </button>
               </p>
            </div>
         </sl-tab-panel>
      </sl-tab-group>

      <!-- <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt> -->
      <!--
      <div id="container">
         <footer  class="footer">
            2D structural analysis of frames using the d2beam element,
            29-Juli-2023,
            <a href="https://statikverstehen.de">&#169; statikverstehen.de</a>
         </footer>
      </div>
      -->
   `;

   const container = document.getElementById('container') as HTMLDivElement;
   const renderBefore = container?.querySelector('footer');
   render(template(), container, { renderBefore });
   //render( template, document.body);

   // Tabellen sin jetzt da, Tabellen mit Voreinstellungen füllen

   init_tabellen();
   //init_contextmenu();

   addListener_filesave();
   add_listeners_einstellungen();
   readLocalStorage();
   set_info();

   const el_select_loadcase = document.getElementById('id_select_loadcase');
   el_select_loadcase?.addEventListener('change', select_loadcase_changed);
   const el_select_eigenvalue = document.getElementById('id_select_eigenvalue');
   el_select_eigenvalue?.addEventListener('change', select_eigenvalue_changed);

   document
      ?.getElementById('id_button_copy_svg')
      ?.addEventListener('click', copy_svg, false);
}

//---------------------------------------------------------------------------------------------------------------

function handleClick() {
   console.log('handleClick()');
   //console.log(this._root.querySelector('#dialog'));
   //const shadow = this.shadowRoot;
   //if (shadow) {
   //console.log(shadow.getElementById('dialog'));
   //console.log(shadow.getElementById('Anmeldung'));
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
}
//---------------------------------------------------------------------------------------------------------------

function handleClick_rechteck() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_rechteck()');

   const el = document.getElementById('id_dialog_rechteck');
   console.log('id_dialog_rechteck', el);
   console.log(
      'QUERY Dialog',
      el?.shadowRoot?.getElementById('dialog_rechteck')
   );

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = true;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
   /*
 console.log('NAME', el?.shadowRoot?.getElementById('qname'));
 var tag = document.createElement('sl-tree-item');
 var text = document.createTextNode(
    'Tutorix is the best e-learning platform'
 );
 tag.appendChild(text);
 var element = document.getElementById('id_tree_LQ');
 element?.appendChild(tag);
 */
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
//---------------------------------------------------------------------------------------------------------------
function handleClick_rechteck_dialog(ev: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_LD()', ev);
   /*
 const el = document.getElementById('id_dialog');
 console.log('id_dialog', el);
 console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
 (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
*/
}

//---------------------------------------------------------------------------------------------------------------
function calculate() {
   //---------------------------------------------------------------------------------------------------------------
   //console.log('calculate');
   rechnen();

   //testclass();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_closed(e: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('Event dialog closed', e);
   const el = document.getElementById(
      'id_dialog_rechteck'
   ) as HTMLDialogElement;

   // @ts-ignore
   const returnValue = this.returnValue;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).removeEventListener('close', dialog_closed);

   if (returnValue === 'ok') {
      let id: string;
      if (dialog_querschnitt_new) {
         id = 'mat-' + nQuerschnittSets;
      } else {
         id = 'mat-' + dialog_querschnitt_index;
      }
      {
         let elem = el?.shadowRoot?.getElementById(
            'emodul'
         ) as HTMLInputElement;
         console.log('emodul=', elem.value);
         const emodul = +elem.value;
         elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
         const Iy = +elem.value;
         elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
         const area = +elem.value;
         elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
         const qname = elem.value;
         elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
         const height = +elem.value;
         elem = el?.shadowRoot?.getElementById('width') as HTMLInputElement;
         const width = +elem.value;
         //         elem = el?.shadowRoot?.querySelector('.radio-group-querschnitt') as any;
         elem = el?.shadowRoot?.getElementById('id_defquerschnitt') as any;
         //console.log("defquerschnitt", elem)
         const defquerschnitt = +elem.value;
         //console.log("defquerschnitt", defquerschnitt)
         elem = el?.shadowRoot?.getElementById(
            'schubfaktor'
         ) as HTMLInputElement;
         const schubfaktor = +elem.value;
         elem = el?.shadowRoot?.getElementById(
            'querdehnzahl'
         ) as HTMLInputElement;
         const querdehnzahl = +elem.value;
         elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
         const wichte = +elem.value;
         elem = el?.shadowRoot?.getElementById('zso') as HTMLInputElement;
         const zso = +elem.value;
         elem = el?.shadowRoot?.getElementById('alpha_t') as HTMLInputElement;
         const alphaT = +elem.value;

         console.log('ALPHA T = ', alphaT);

         if (dialog_querschnitt_new) {
            incr_querschnittSets();

            set_querschnittRechteck(
               qname,
               id,
               emodul,
               Iy,
               area,
               height,
               width,
               defquerschnitt,
               wichte,
               schubfaktor,
               querdehnzahl,
               zso,
               alphaT
            );
         } else {
            update_querschnittRechteck(
               dialog_querschnitt_index,
               qname,
               id,
               emodul,
               Iy,
               area,
               height,
               width,
               defquerschnitt,
               wichte,
               schubfaktor,
               querdehnzahl,
               zso,
               alphaT
            );

            //console.log("UPDATE", this)
            const el = document.getElementById(
               dialog_querschnitt_item_id
            ) as HTMLElement;
            console.log(
               'dialog_querschnitt_item_id',
               dialog_querschnitt_index,
               qname,
               el.innerHTML
            );
            if (el.innerHTML !== qname) {
               el.innerHTML = qname;
               const ele = document.getElementById('id_element_tabelle');
               //console.log('ELE: >>', ele);
               ele?.setAttribute(
                  'namechanged',
                  String(dialog_querschnitt_index)
               );
            }
         }
      }

      if (dialog_querschnitt_new) {
         const qName = (
            el?.shadowRoot?.getElementById('qname') as HTMLInputElement
         ).value;
         console.log('NAME', qName);
         var tag = document.createElement('sl-tree-item');
         var text = document.createTextNode(qName);
         tag.appendChild(text);
         tag.addEventListener('click', opendialog);

         tag.id = id;
         var element = document.getElementById('id_tree_LQ');
         element?.appendChild(tag);
         console.log('child appendchild', element);

         const ele = document.getElementById('id_element_tabelle');
         //console.log("ELE: >>", ele);
         ele?.setAttribute('newselect', '4');
      }
   }
}

//---------------------------------------------------------------------------------------------------------------
export function opendialog(ev: any) {
   //---------------------------------------------------------------------------------------------------------------

   // @ts-ignore
   console.log('opendialog geht', this);
   ev.preventDefault;

   // @ts-ignore
   const id = this.id;

   console.log('id', document.getElementById(id));

   const myArray = id.split('-');
   console.log('Array', myArray.length, myArray[0], myArray[1]);

   const index = Number(myArray[1]);
   {
      //let qname: string = '', id0: string = ''
      //let emodul: number = 0, Iy: number = 0, area: number = 0, height: number = 0, bettung: number = 0, wichte: number = 0;

      const [
         qname,
         id0,
         emodul,
         Iy,
         area,
         height,
         width,
         definedQuerschnitt,
         wichte,
         schubfaktor,
         querdehnzahl,
         zso,
         alphaT,
      ] = get_querschnittRechteck(index);

      if (id0 !== id) console.log('BIG Problem in opendialog');

      const el = document.getElementById(
         'id_dialog_rechteck'
      ) as HTMLDialogElement;

      let elem = el?.shadowRoot?.getElementById('emodul') as HTMLInputElement;
      console.log('set emodul=', elem.value, emodul);
      elem.value = String(emodul);
      elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
      elem.value = String(Iy);
      elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
      elem.value = String(area);
      elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
      elem.value = String(qname);
      elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
      elem.value = String(height);
      elem = el?.shadowRoot?.getElementById('width') as HTMLInputElement;
      elem.value = String(width);
      elem = el?.shadowRoot?.getElementById(
         'id_defquerschnitt'
      ) as HTMLInputElement;
      elem.value = String(definedQuerschnitt);
      elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
      elem.value = String(wichte);
      elem = el?.shadowRoot?.getElementById('schubfaktor') as HTMLInputElement;
      elem.value = String(schubfaktor);
      elem = el?.shadowRoot?.getElementById('querdehnzahl') as HTMLInputElement;
      elem.value = String(querdehnzahl);
      elem = el?.shadowRoot?.getElementById('zso') as HTMLInputElement;
      elem.value = String(zso);
      elem = el?.shadowRoot?.getElementById('alpha_t') as HTMLInputElement;
      elem.value = String(alphaT);
   }

   //const el=document.getElementById(id);
   const el = document.getElementById('id_dialog_rechteck');

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = false;
   dialog_querschnitt_index = index;
   dialog_querschnitt_item_id = id;

   //console.log('id_dialog', el);
   //console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
}

//---------------------------------------------------------------------------------------------------------------
export function resizeTables() {
   //---------------------------------------------------------------------------------------------------------------
   {
      const el_knoten = document.getElementById('id_button_nnodes');
      const nnodes = (
         el_knoten?.shadowRoot?.getElementById('nnodes') as HTMLInputElement
      ).value;

      const el = document.getElementById('id_knoten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nnodes);
   }
   {
      const el_knoten = document.getElementById('id_button_nnodedisps');
      const nnodes = (
         el_knoten?.shadowRoot?.getElementById('nnodedisps') as HTMLInputElement
      ).value;

      const el = document.getElementById('id_nnodedisps_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nnodes);
   }
   {
      const el_elemente = document.getElementById('id_button_nelem');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById('nelem') as HTMLInputElement
      ).value;

      const el = document.getElementById('id_element_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nnodalloads');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nnodalloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_knotenlasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nstreckenlasten');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nelemloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_streckenlasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_neinzellasten');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nelemloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_einzellasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById(
         'id_button_ntemperaturlasten'
      );
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nelemloads'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_temperaturlasten_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById(
         'id_button_nstabvorverformungen'
      );
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nstabvorverformungen'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_stabvorverfomungen_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nvorspannungen');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nvorspannungen'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_vorspannungen_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      const el_elemente = document.getElementById('id_button_nspannschloesser');
      const nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nspannschloesser'
         ) as HTMLInputElement
      ).value;

      const el = document.getElementById('id_spannschloesser_tabelle');
      console.log('EL: >>', el);
      el?.setAttribute('nzeilen', nelem);
   }

   {
      let el_elemente = document.getElementById('id_button_nkombinationen');
      let nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nkombinationen'
         ) as HTMLInputElement
      ).value;

      let el = document.getElementById('id_kombinationen_tabelle');
      console.log('EL nzeilen: >>', nelem);
      el?.setAttribute('nzeilen', nelem);
      //---------------------------------------
      el_elemente = document.getElementById('id_button_nlastfaelle');
      nelem = (
         el_elemente?.shadowRoot?.getElementById(
            'nlastfaelle'
         ) as HTMLInputElement
      ).value;

      el = document.getElementById('id_kombinationen_tabelle');
      console.log('EL nspalten: >>', nelem);
      el?.setAttribute('nspalten', String(Number(nelem) + 1)); // +1 wegen Kommentarspalte
   }
}

//---------------------------------------------------------------------------------------------------------------
export function clearTables() {
   //------------------------------------------------------------------------------------------------------------

   let el = document.getElementById('id_knoten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_nnodedisps_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_element_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_knotenlasten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_streckenlasten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_einzellasten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_temperaturlasten_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_stabvorverfomungen_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_vorspannungen_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_spannschloesser_tabelle');
   el?.setAttribute('clear', '0');

   el = document.getElementById('id_kombinationen_tabelle');
   el?.setAttribute('clear', '0');

   while (nQuerschnittSets > 0) {
      del_last_querschnittSet();
      let element = document.getElementById('id_tree_LQ') as any;
      element?.removeChild(element?.lastChild);
   }
}

