import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
//import { property, customElement } from 'lit/decorators.js';
import { msg, localized, updateWhenLocaleChanges } from '@lit/localize';

//import '../styles/global-css'
import '../styles/contextMenu-css'
// import '../styles/global.css'
//import styles from '../styles/lil-gui.css?raw'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/divider/divider';
import '@shoelace-style/shoelace/dist/components/drawer/drawer';
import '@shoelace-style/shoelace/dist/components/range/range';
// import '@shoelace-style/shoelace/dist/components/icon/icon';
// import { setBasePath,getBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

import { close_drawer_1 } from '../pages/cad_buttons';
import {
  abbruch_property_dialog,
  delete_element_dialog,
  show_add_elload_dialog,
  show_property_dialog,
} from '../pages/cad_contextmenu';
import {
  berechnungsart_changed,
  button_eingabe_ueberpruefen,
  button_neue_eingabe,
  calculate,
  click_neuer_querschnitt_rechteck,
  create_pdf,
  handleClick_allgeiner_querschnitt,
  resizeTables,
  show_video,
} from '../pages/haupt_2';
import { currentFilename } from '../pages/haupt';
import {
  info_Eigenwertberechnung,
  info_Materialeigenschaften,
} from '../pages/infos';

import { berechnungErforderlich } from '../pages/globals';

import '../pages/locale-picker'
import { init_haupt3 } from '../pages/haupt3';
import { global_css } from '../styles/global-css';
//import { contextMenu_css } from '../styles/contextMenu-css';

console.log('in dr-haupt');

const nnodes_init = '0';
const nelem_init = '0';
const nnodalloads_init = '0';
const nstreckenlasten_init = '0';
const neinzellasten_init = '0';
const ntemperaturlasten_init = '0';
const nlastfaelle_init = '1';
const nkombinationen_init = '0';
const nstabvorverfomungen_init = '0';
const nvorspannungen_init = '0';
const nspannschloesser_init = '0';
const nnodalmass_init = '0';
let column_string_kombitabelle: string;
let typs_string_kombitabelle: string;

const nkombiSpalten_init = '2'; // immer 1 mehr als nlastfaelle_init
const nnodedisps_init = '0';
const dyn_neigv_init = '1';
const nkoppelfedern_init = '0';

let width_lager = 175; // /window.devicePixelRatio;
let width_def_d2beam = 400;

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

// const stylesheet = new CSSStyleSheet();
// stylesheet.replace(styles);

//########################################################################################################################
let theFooter =
  '2D structural analysis of frames and trusses, v1.8.3, 10.Februar-2026, ';
//########################################################################################################################

// console.log("getBasePath()",getBasePath())
// setBasePath('src/shoelace/dist/');

let hostname = window.location.hostname;

@localized()
@customElement('dr-haupt')
export class drHaupt extends LitElement {


  static styles = [global_css];

  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  async firstUpdated() {
    console.log("fertig drHaupt")
    init_haupt3();
  }

  //  const template = () => html`
  render() {
    return html`


      <sl-tab-group id="id_sl_tab_group">
      <sl-tab id="id_tab_group" slot="nav" panel="tab-haupt">${msg('Haupt')}</sl-tab>
      <sl-tab id="id_CAD" slot="nav" panel="tab-cad">${msg('System')}</sl-tab>
      <sl-tab slot="nav" panel="tab-grafik">${msg('Ergebnisse')}</sl-tab>
      <sl-tab id="id_tab_quer" slot="nav" panel="tab-querschnitte">${msg('Querschnitte')}</sl-tab>
      <sl-tab slot="nav" panel="tab-schiefstellung">${msg('Vorverformungen')}</sl-tab>
      <sl-tab id="id_tab_kombi" slot="nav" panel="tab-kombinationen">${msg('Kombinationen')}</sl-tab>
      <sl-tab slot="nav" panel="tab-ergebnisse">${msg('Ausdruck')}</sl-tab>
      <sl-tab id="id_tab_mass" slot="nav" panel="tab-mass" disabled>${msg('Dynamik')}</sl-tab>
      <sl-tab slot="nav" panel="tab-pro">Pro</sl-tab>
      <sl-tab slot="nav" panel="tab-info">Info</sl-tab>
      <sl-tab slot="nav" panel="tab-tabellen">${msg('Tabellen')}</sl-tab>
      <sl-tab slot="nav" panel="tab-einstellungen">ꔷꔷꔷ</sl-tab>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-haupt">

       <!--
          <video  height="150" controls >
          <source src="assets/video/einfuehrung.mp4" type="video/mp4" >
          Einfuehrungsvideo
          </video>  Einfuehrungsvideo
       -->
        <p>
         <sl-button id="intro_video" value="video" variant="primary"  outline @click="${show_video}" style='width:20rem;color:"DodgerBlue";'><b>${msg('zeige Einführungsvideos')}</b></sl-button>
        </p>

        <p>&nbsp;&nbsp;${msg('aktueller Dateiname:')}&nbsp;<span id="id_current_filename"> </span><br />
        </p>
        <p>
          <button type="button" id="saveFile" style="min-width:8em;">
            ${msg('Objektdaten speichern')}
          </button>
          <button type="button" id="readFile" style="min-width:8em;">
            ${msg('Objektdaten einlesen')}
          </button>
        </p>

        <hr />

        <p><span id="lab_freier_text" title="Der eingegebene Text wird auch für die pdf-Ergebnissdatei verwendet">${msg('Projekt (freier Text mit HTML Formatierung für fett):')}</span><br>
          <textarea id="freetext" name="freetext" rows="3" cols="50" placeholder="<b>Hausübung A1, SS 2025</b>
Bearbeitet von: Melis Muster" title="Buchstaben in Fett durch <b> und </b> einrahmen, Zeilenumbruch mit Return-Taste"></textarea>
        </p>

        <br />

        <table id="querschnittwerte_table">
          <tbody>
          <tr>
              <td></td>
              <td>
                <sl-button id="clear" value="clear" @click="${button_neue_eingabe}" style="min-width:100%;">${msg('neue Eingabe beginnen')}</sl-button>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <sl-button id="id_check" value="check" @click="${button_eingabe_ueberpruefen}" style="min-width:100%;">${msg('Eingabe prüfen')}</sl-button>
              </td>
            </tr>
            <tr>
              <td>
               &nbsp;
              </td>
            </tr>
            <tr>
              <td>&nbsp;&nbsp; ${msg('Berechnungsart:')}</td>
              <td>
                <select @change="${berechnungsart_changed}" name="stadyn" id="id_stadyn" style="min-width:100%;">
                  <option value="0" selected>${msg('statisch')}</option>
                  <option value="1">${msg('dynamisch')}</option>
                </select>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp;&nbsp; ${msg('Berechnung nach:')}</td>
              <td>
                <select name="THIIO" id="id_THIIO" style="min-width:100%;" onchange="berechnungErforderlich()">
                  <option value="0" selected>${msg('Th. I. Ordnung')}</option>
                  <option value="1">${msg('Th. II. Ordnung')}</option>
                </select>
              </td>
              <td></td>
            </tr>


            <tr>
              <td title="Option 'nichtlinear' nur bei FW-Stäben, die nur Zug- oder Druckkräfte übertragen können, anwenden">&nbsp;&nbsp; ${msg('Materialeigenschaften:')}</td>
              <td>
                <select name="matprop" id="id_matprop" style="min-width:100%;" onchange="berechnungErforderlich()">
                  <option value="0" selected>${msg('linear')}</option>
                  <option value="1">${msg('nichtlinear')}</option>
                </select>
              </td>
              <td>
                  <button class="btn_small" @click="${info_Materialeigenschaften}">
                  <svg fill="#000000" width="1rem" height="1rem" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1229.93 594.767c36.644 37.975 50.015 91.328 43.72 142.909-9.128 74.877-30.737 144.983-56.093 215.657-27.129 75.623-54.66 151.09-82.332 226.512-44.263 120.685-88.874 241.237-132.65 362.1-10.877 30.018-18.635 62.072-21.732 93.784-3.376 34.532 21.462 51.526 52.648 36.203 24.977-12.278 49.288-28.992 68.845-48.768 31.952-32.31 63.766-64.776 94.805-97.98 15.515-16.605 30.86-33.397 45.912-50.438 11.993-13.583 24.318-34.02 40.779-42.28 31.17-15.642 55.226 22.846 49.582 49.794-5.39 25.773-23.135 48.383-39.462 68.957l-1.123 1.416a1559.53 1559.53 0 0 0-4.43 5.6c-54.87 69.795-115.043 137.088-183.307 193.977-67.103 55.77-141.607 103.216-223.428 133.98-26.65 10.016-53.957 18.253-81.713 24.563-53.585 12.192-112.798 11.283-167.56 3.333-40.151-5.828-76.246-31.44-93.264-68.707-29.544-64.698-8.98-144.595 6.295-210.45 18.712-80.625 46.8-157.388 75.493-234.619l2.18-5.867 1.092-2.934 2.182-5.87 2.182-5.873c33.254-89.517 67.436-178.676 101.727-267.797 31.294-81.296 62.72-162.537 93.69-243.95 2.364-6.216 5.004-12.389 7.669-18.558l1-2.313c6.835-15.806 13.631-31.617 16.176-48.092 6.109-39.537-22.406-74.738-61.985-51.947-68.42 39.4-119.656 97.992-170.437 156.944l-6.175 7.17c-15.78 18.323-31.582 36.607-47.908 54.286-16.089 17.43-35.243 39.04-62.907 19.07-29.521-21.308-20.765-48.637-3.987-71.785 93.18-128.58 205.056-248.86 350.86-316.783 60.932-28.386 146.113-57.285 225.882-58.233 59.802-.707 116.561 14.29 157.774 56.99Zm92.038-579.94c76.703 29.846 118.04 96.533 118.032 190.417-.008 169.189-182.758 284.908-335.53 212.455-78.956-37.446-117.358-126.202-98.219-227.002 26.494-139.598 183.78-227.203 315.717-175.87Z"
        fill-rule="evenodd" />
    </svg>
                  </button>
                  <!-- <button class="btn_small" @click="${info_Materialeigenschaften}"><sl-icon name="info-lg"></sl-icon></button> -->
                  <!-- <button class="btn_small" @click="${info_Materialeigenschaften}"><i class="fa fa-info"></i></button> -->
              </td>
            </tr>

            <tr>
              <td>
               &nbsp;
              </td>
            </tr>

            <tr>
              <td></td>
              <td>
                <sl-button id="rechnen" value="Rechnen" @click="${calculate}" style="min-width:100%;">${msg('Rechnen')}</sl-button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="output_container">
          <textarea id="output" rows="40" readonly spellcheck=false></textarea>
        </div>

        <dr-dialog_neue_eingabe id="id_dialog_neue_eingabe"></dr-dialog_neue_eingabe>

        <div id="id_container" class="footer" >${theFooter}
          <a href="https://statikverstehen.de">&#169; statikverstehen.de</a>
          , ${hostname}
        </div>

      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-cad" id="id_tab-cad">
        <div id="id_cad" style=" background-color:#ffffff;margin:0;padding:0;position:relative;top:0;cursor:none">
          <!-- width:100vw; ;width:300px;height:300px; -->
          <div id="id_cad_group" style="cursor: pointer">
              <div id="id_cad_group2" style="cursor: pointer"></div>
          </div>
          <!-- <button id="id_button_zurueck_cad">Fullscreen</button> -->
          <!-- <select name="querschnitt_default" id="id_querschnitt_default" title="default Querschnitt"></select> -->
          <button id="id_button_pan_cad">Pan</button>


          <div id="id_context_menu" style="position:absolute;top:100;display:none;">
            <sl-menu style="max-width: 200px;">
              <sl-menu-item value="properties" @click="${show_property_dialog}">Eigenschaften</sl-menu-item>
              <sl-menu-item value="add_eload" @click="${show_add_elload_dialog}">add E-Lasten</sl-menu-item>
              <sl-divider></sl-divider>
              <sl-menu-item value="delete"  @click="${delete_element_dialog}">Löschen</sl-menu-item>
              <sl-menu-item value="abbruch"  @click="${abbruch_property_dialog}">Abbruch</sl-menu-item>
            </sl-menu>
          </div>


          <!-- <sl-drawer label="Mehr Aktivitäten" class="drawer-overview" style="cursor:pointer;--size:20rem">
            <dr-drawer_1 id="id_drawer_2"></dr-drawer_1>
            <sl-button slot="footer" variant="primary" @click="${close_drawer_1}">Close</sl-button>
          </sl-drawer> -->

          <dr-my_drawer class="class-my-drawer" >
          </dr-my_drawer>

          <div id="artboard_cad" style="margin:0;padding:0;z-index:100"></div>
          <div id="svg_artboard_cad" style="margin:0;padding:0;display:none"></div>

        </div>

        <dr-dialog_lager id="id_dialog_lager"></dr-dialog_lager>
        <dr-dialog_knoten id="id_dialog_knoten"></dr-dialog_knoten>
        <dr-dialog_knotenlast id="id_dialog_knotenlast"></dr-dialog_knotenlast>
        <dr-dialog_elementlasten id="id_dialog_elementlast"></dr-dialog_elementlasten>
        <dr-dialog_knotenmasse id="id_dialog_knotenmasse"></dr-dialog_knotenmasse>
        <dr-dialog_stab_eigenschaften id="id_dialog_stab_eigenschaften"></dr-dialog_stab_eigenschaften>
        <dr-dialog_einstellungen id="id_dialog_einstellungen"></dr-dialog_einstellungen>
        <dr-dialog_info id="id_dialog_info"></dr-dialog_info>
        <dr-dialog_messen id="id_dialog_messen"></dr-dialog_messen>
        <dr-dialog_bemassung id="id_dialog_bemassung"></dr-dialog_bemassung>
        <dr-dialog_knotenverformung id="id_dialog_knotenverformung"></dr-dialog_knotenverformung>
        <dr-dialog_kopieren id="id_dialog_kopieren"></dr-dialog_kopieren>
        <dr-dialog_selekt_typ id="id_dialog_selekt_typ"></dr-dialog_selekt_typ>
        <dr-dialog_edit_selected_elementlasten id="id_dialog_edit_selected_elementlasten_typ"></dr-dialog_edit_selected_elementlasten>

      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-grafik"  id="id_tab-grafik">
        <div id="id_grafik" style=" background-color:#ffffff;margin:0;padding:0;position:relative;top:0">
          <!-- width:100vw; ;width:300px;height:300px; -->
          <!-- <div id="panel_gui"></div> -->
          <dr-control-panel id="id_control_panel"></dr-control-panel>
          <div id="id_grafik_group">
            <div id="id_div_select_lc">
              <select id="id_select_loadcase" on></select>
              <button id="id_button_copy_svg">save svg</button>
            </div>
            <div id="id_div_select_eigv">
              <select id="id_select_eigenvalue" on></select>
            </div>
            <div id="id_div_select_dyn_eigv">
              <select id="id_select_dyn_eigenvalue" on></select>
            </div>
          </div>
          <button id="id_button_zurueck_grafik">Fullscreen</button>
          <button id="id_button_pan_grafik">Pan</button>

          <div id="artboard" style="margin:0;padding:0;background-color:#ffffff;"></div>
          <div id="svg_artboard" style="margin:0;padding:0;display:none"></div>
        </div>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel id="id_tab_querschnitt" name="tab-querschnitte">
        <!--
        <sl-button id="open-dialog" @click="${handleClick_allgeiner_querschnitt}"
          >neuer allgemeiner Querschnitt</sl-button
        >
        -->

        <p>
          <br />&nbsp;&nbsp;
          <sl-button id="open-dialog_rechteck" @click="${click_neuer_querschnitt_rechteck}">${msg('neuer Querschnitt')}</sl-button>
          <br /><br />
        </p>
        <sl-tree class="custom-icons">
          <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
           -->
          <sl-tree-item id="id_tree_LQ" expanded>
            ${msg('Linear elastisch Querschnittswerte')}
          </sl-tree-item>

          <!--
          <sl-tree-item>
            Linear elastisch allgemein
            <sl-tree-item><button>button 1</button><button>button 2</button></sl-tree-item>
            <sl-tree-item>nix 2</sl-tree-item>
            <sl-tree-item>nix 3</sl-tree-item>
          </sl-tree-item>
          -->

        </sl-tree>

        <!-- <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt> -->
        <dr-rechteckquerschnitt id="id_dialog_rechteck"></dr-rechteckquerschnitt>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->


      <!--------------------------------------------------------------------------------------->

      <sl-tab-panel name="tab-tabellen">

      <h2>&nbsp;&nbsp;&nbsp;${msg('Hier nichts eintragen, Änderungen werden nicht berücksichtigt, nur zur Info')}</h2>

        <table>
          <tbody>
            <tr>
              <td>
                <p>
                  <b>Knotenkoordinaten und Lager</b><br /><br />
                  1 = starre Lagerung<br />
                  0 oder leere Zelle = frei beweglich<br />
                  > 1 = Federsteifigkeit in kN/m bzw. kNm/rad<br />
                  <br />
                  Drehung des Knotens (Lagers) im Gegenuhrzeigersinn positiv<br /><br />
                </p>
                <p>
                  Anzahl Knoten:
                  <dr-button-pm id="id_button_nnodes" nel="${nnodes_init}" inputid="nnodes"></dr-button-pm>
                  <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
                </p>
              </td>
              <td>
                <img
                  src="/assets/gedrehtes_lager.png"
                  name="gedrehtes_lager"
                  title="gedrehtes Lager"
                  style="max-width:80%; width:${width_lager}px; height:auto; border:0px; margin: auto; display: block;"
                />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <dr-tabelle
                  id="id_knoten_tabelle"
                  nzeilen="${nnodes_init}"
                  nspalten="6"
                  columns='["No", "x [m]", "z [m]", "L<sub>x</sub><br>(kN/m)", "L<sub>z</sub><br>(kN/m)", "L<sub>φ</sub><br>(kNm/rad)", "Winkel [°]"]'
                  colwidth='["4","5","5","5","5","5","5"]'
                ></dr-tabelle>
              </td>
            </tr>
          </tbody>
        </table>

        <p><br /><b>Knotenverformungen</b><br /></p>
        <p>zum Beispiel für Stützensenkungen</p>
        <p>
          Die Richtungen stimmen mit den Richtungen des zugehörigen gedrehten Lagerknotens überein.
          <br />
          Es sind nur in den Tabellenzellen Werte einzugeben, für die definierte Verformungen gewünscht werden.<br />
          Die Zahl 0 entspricht einer starren Lagerung!
        </p>
        <p>
          Anzahl Knoten mit<br />vorgebenenen Verformungen:
          <dr-button-pm id="id_button_nnodedisps" nel="${nnodedisps_init}" inputid="nnodedisps"></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>

        <dr-tabelle
          id="id_nnodedisps_tabelle"
          nzeilen="${nnodedisps_init}"
          nspalten="5"
          columns='["No", "Knoten", "Lastfall", "u<sub>x&prime;0</sub> [mm]", "u<sub>z&prime;0</sub> [mm]", "φ<sub>0</sub> [mrad]"]'
        ></dr-tabelle>

        <!--                                                   E l e m e n t e -->
        <p><b>Elemente</b> <br /></p>
        <p>
        <img  src="/assets/def_d2beam.png"
                  name="Definition_d2beam"
                  title="Definition Stabelement d2beam"
                  style="max-width:80%; width:${width_def_d2beam}px; height:auto; border:0px; margin: left; display: block;"
                />
                Timoshenko Stabelement d2beam, Typ 0
        </p>
        <p>
          a = Element<b>a</b>nfang <br />
          e = Element<b>e</b>nde<br />
        </p>
        <p>
          Typ = Elementtyp<br />
          0 = Timoshenko Element mit konstantem Querschnitt, nichts oder 0 eingeben<br />
          1 = Fachwerkstab
        </p>
        <p>
          N = Normalkraftgelenk, V = Querkraftgelenk, M = Momentengelenk,<br />
          für ein Gelenk ist jeweils eine 1 einzugeben
        </p>
        <p>
          nod a = globale Knotennummer am Elementanfang <br />
          nod e = globale Knotennummer am Elementende
        </p>
        <p>
          starr a = starres Stabende am Elementanfang in Meter<br />
          starr e = starres Stabende am Elementende in Meter
        </p>
        <p>
          k<sub>b</sub> = Bettung nach Winkler in kN/m²
        </p>
        <p>
          <sl-checkbox checked id="id_gelenke_anzeigen">Spalten für Gelenke anzeigen</sl-checkbox>
          <br /><br />
          <sl-checkbox checked id="id_starre_enden_anzeigen">Spalten für starre Enden anzeigen</sl-checkbox>
          <br /><br />
          <sl-checkbox checked id="id_bettung_anzeigen">Spalten für Bettung anzeigen</sl-checkbox>
          <br />
        </p>
        <p>
          Anzahl Elemente:

          <dr-button-pm id="id_button_nelem" nel="${nelem_init}" inputid="nelem"></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>

        <table>
          <tbody>
            <tr>
              <td style="background-color:lightgray;">&nbsp;</td>
              <td>
              <dr-tabelle
                id="id_element_tabelle"
                nzeilen="${nelem_init}"
                nspalten="13"
                columns='["No", "Querschnitt", "Typ", "nod a", "nod e", "N<sub>a</sub>", "V<sub>a</sub>", "M<sub>a</sub>", "N<sub>e</sub>", "V<sub>e</sub>", "M<sub>e</sub>", "starr a<br>[m]", "starr e<br>[m]","k<sub>b</sub><br>[kN/m²]"]'
                typs='["-", "select", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]'
                colwidth='["4","8","2","3","3","2","2","2","2","2","2","3","3","4"]'
              ></dr-tabelle>
              </td>
              <td style="background-color:lightgray;">&nbsp;</td>
              </tr>
          </tbody>
        </table>


        <p><br /><b>Koppelfedern</b><br /></p>

        <p>
          Anzahl Koppelfedern:

          <dr-button-pm id="id_button_nkoppelfedern" nel="${nkoppelfedern_init}" inputid="nkoppelfedern"></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>

        <dr-tabelle
                  id="id_koppelfedern_tabelle"
                  nzeilen="${nkoppelfedern_init}"
                  nspalten="9"
                  columns='["No", "nod a", "nod e", "k<sub>x</sub><br>[kN/m]", "f<sub>x.plast</sub><br>[kN]", "k<sub>z</sub><br>[kN/m]", "f<sub>z.plast</sub><br>[kN]", "k<sub>φ</sub><br>[kNm/rad]", "m<sub>φ.plast</sub><br>[kNm]", "Winkel<br>[°]"  ]'
                  colwidth='["4","3","3","5","5","5","5","5","5","5"]'
                  typs='["-", "number", "number", "text", "text", "text", "text", "text", "text"]'
        ></dr-tabelle>

        <!--                                                   K n o t e n l a s t e n -->

        <p><b>Knotenlasten</b><br /><br /></p>
        <p>
          Anzahl Knotenlasten:

          <dr-button-pm id="id_button_nnodalloads" nel="${nnodalloads_init}" inputid="nnodalloads"></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
          <br /><br />
        </p>
        <dr-tabelle
          id="id_knotenlasten_tabelle"
          nzeilen="${nnodalloads_init}"
          nspalten="5"
          columns='["No", "Knoten", "Lastfall", "P<sub>x</sub> [kN]", "P<sub>z</sub> [kN]", "M<sub>y</sub> [kNm]"]'
        ></dr-tabelle>

         <!--                                                   E l e m e n t l a s t e n -->

        <p>
          <b>Eingabe der Streckenlasten</b><br /><br />
          Lastarten<br /><br />
          0 = Trapezstreckenlast senkrecht auf Stab<br />
          1 = Trapezstreckenlast in globaler z-Richtung<br />
          2 = Trapezstreckenlast in globaler z-Richtung, Projektion<br />
          3 = Trapezstreckenlast in globaler x-Richtung<br />
          4 = Trapezstreckenlast in globaler x-Richtung, Projektion<br />
        </p>
        <p>
          p<sub>a</sub> = Streckenlast am Stabanfang<br />
          p<sub>e</sub> = Streckenlast am Stabende
        </p>
        <p>
          Anzahl Streckenlasten:
          <dr-button-pm
            id="id_button_nstreckenlasten"
            nel="${nstreckenlasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>
        <dr-tabelle
          id="id_streckenlasten_tabelle"
          nzeilen="${nstreckenlasten_init}"
          nspalten="5"
          columns='["No", "Element", "Lastfall", "Art", "p<sub>a</sub><br> [kN/m]", "p<sub>e</sub><br> [kN/m]"]'
        ></dr-tabelle>

        <p>
          <br />
          <b>Eingabe der Einzellasten</b><br /><br />
          Einzellast P wirkt senkrecht auf Stab!<br />
        </p>
        <p>
          <br />
          Anzahl Einzellasten:
          <dr-button-pm
            id="id_button_neinzellasten"
            nel="${neinzellasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
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
          T<sub>u</sub> Temperatur Unterseite (gestrichelte Faser)<br />
          T<sub>o</sub> Temperatur Oberseite<br />
        </p>
        <p>
          Anzahl Temperaturlasten:
          <dr-button-pm
            id="id_button_ntemperaturlasten"
            nel="${ntemperaturlasten_init}"
            inputid="nelemloads"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>

        <dr-tabelle
          id="id_temperaturlasten_tabelle"
          nzeilen="${ntemperaturlasten_init}"
          nspalten="4"
          columns='["No", "Element", "Lastfall", "T<sub>u</sub> [°]", "T<sub>o</sub> [°]"]'
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
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
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
          Anzahl Spannschlösser:
          <dr-button-pm
            id="id_button_nspannschloesser"
            nel="${nspannschloesser_init}"
            inputid="nspannschloesser"
            @change=${berechnungErforderlich}
          ></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>

        <dr-tabelle
          id="id_spannschloesser_tabelle"
          nzeilen="${nspannschloesser_init}"
          nspalten="3"
          columns='["No", "Element", "Lastfall", "&Delta;s [mm]"]'
        ></dr-tabelle>


        <p>
          <br />
          <b>Stabvorverfomungen</b>
        </p>
        <p>
          w<sub>0a</sub> = Vorverformung am Stabanfang, senkrecht zur Stabachse<br />
          w<sub>0e</sub> = Vorverformung am Stabende, senkrecht zur Stabachse<br />
          w<sub>0m</sub> = Stich in Stabmitte, w<sub>0m,gesamt</sub> =w<sub>0m</sub>
          +(w<sub>0a</sub>+w<sub>0e</sub>)/2  &nbsp;(nicht bei Fachwerk)
        </p>

        <p>
          Anzahl Stabvorverformungen:
          <dr-button-pm id="id_button_nstabvorverformungen" nel="${nstabvorverfomungen_init}" inputid="nstabvorverformungen"></dr-button-pm>
          <!-- <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button> -->
        </p>
        <dr-tabelle
          id="id_stabvorverfomungen_tabelle"
          nzeilen="${nstabvorverfomungen_init}"
          nspalten="5"
          columns='["No", "Element", "Lastfall", "w<sub>0a</sub> [mm]", "w<sub>0e</sub> [mm]", "w<sub>0m</sub> [mm]"]'
        ></dr-tabelle>



      <p><b>Knotenmassen</b><br /><br /></p>

      <p> M = Masse<br>
        Θ<sub>y</sub> = Massenträgheitsmoment um y-Achse<br>
      </p>

      <p>
          Anzahl Knotenmassen:

          <dr-button-pm id="id_button_nnodalmass" nel="${nnodalmass_init}" inputid="nnodalmass"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">Tabelle anpassen</sl-button>
          <br /><br />
        </p>
        <dr-tabelle
          id="id_knotenmassen_tabelle"
          nzeilen="${nnodalmass_init}"
          nspalten="3"
          columns='["No", "Knoten", "M [t]", "Θ<sub>y</sub> [tm²]"]'
        ></dr-tabelle>


      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->



      <!--------------------------------------------------------------------------------------->


      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-kombinationen">

        <p>
          <b>${msg('Eingabe der Lastfälle')}</b>
        </p>
        <p>
          ${msg('Anzahl Lastfälle :')}
          <dr-button-pm id="id_button_nlastfaelle" nel="${nlastfaelle_init}" inputid="nlastfaelle"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">${msg('Tabelle anpassen')}</sl-button>
        </p>
        <dr-tabelle
          id="id_lastfaelle_tabelle"
          nzeilen="${nlastfaelle_init}"
          nspalten="1"
          columns='["Lastfall", "Bezeichnung (optional)"]'
          colwidth='["10","20"]'
          typs='["-", "text"]'
        ></dr-tabelle>

        <br>

        <p>
          <b>${msg('Eingabe der Kombinationen')}</b>
        </p>
        <p>
          <b>${msg('und der Multiplikatoren (Lastfaktoren), mit denen die einzelnen Lastfälle multipliziert werden sollen.')}</b>
        </p>
        <p>
          ${msg('Eine leere Zelle oder null bedeutet, dass der Lastfall nicht an der Kombination beteiligt ist.')}<br>
          ${msg('Ein Kommentar ist optional.')}
        </p>
        <p>
          ${msg('Bei Theorie I.Ordnung und linearen Materialeigenschaften sind Kombinationen optional. Bei Theorie II. Ordnung und/oder nichtlinearen Materialeigenschaften muss mindestens eine Kombination definiert sein.')}
        </p>

        <p>
          ${msg('Anzahl Kombinationen:')}
          <dr-button-pm id="id_button_nkombinationen" nel="${nkombinationen_init}" inputid="nkombinationen"></dr-button-pm>
          <sl-button id="resize" value="resize" @click="${resizeTables}">${msg('Tabelle anpassen')}</sl-button>
        </p>

        <dr-tabelle
          id="id_kombinationen_tabelle"
          nzeilen="${nkombinationen_init}"
          nspalten="${nkombiSpalten_init}"
          columns="${column_string_kombitabelle}"
          typs="${typs_string_kombitabelle}"
          coltext="Lf"
          colwidth='["4","8","3"]'
        ></dr-tabelle>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-schiefstellung">
        <p>
          <b>${msg('Die Schiefstellung des Systems wird nur bei Berechnungen nach Theorie II. Ordnung berücksichtigt')}</b>
        </p>

        <p> <b>${msg('Hinweise:')}</b>${msg('Die Knoten-ID wird im Knotendialog im Tab System angezeigt, wenn du den Button <Knoten bearbeiten> wählst und danach einen Knoten anklickst.')}
            <img src="/assets/gui-icons/edit_knoten.png" name="edit_knoten" title=${msg('edit-knoten button')}
            style="max-width:100%; width:auto; height:25px; border:0px; margin: auto;" >
          </p>
          <p>
            ${msg('Wenn das Eingabefeld für Δ leer ist, wird keine Schiefstellung berücksichtigt.')}
          </p>
          <p>
            ${msg('Wenn das Eingabefeld für Knoten-ID leer ist, wird der Freiheitsgrad mit dem größten Wert aus der Knickfigur-Berechnung mit dem Wert von Δ skaliert.')}
          </p>
          <br />
          <p>
          <b>${msg('Schiefstellung des gesamten Systems mithilfe der ersten Eigenform')}</b>
        </p>

        <table id="schiefstellung_table">
          <tbody>
            <tr>
              <td title=${msg('0 oder leer = automatische Skalierung auf den Größtwert aus der Eigenwertberechnung')}>
                ${msg('Knoten-ID:')}
              </td>
              <td>
                <input
                  type="number"
                  step="1"
                  id="id_maxu_node_ID"
                  name="maxu_node_ID"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value=""
                  @change=${berechnungErforderlich}
                />
              </td>
            </tr>
            <tr>
              <td>${msg('Richtung :')}</td>
              <td>
                <select name="maxu_dir" id="id_maxu_dir" style="min-width: 100%;"  onchange="berechnungErforderlich()">
                  <option value="0">x (u)</option>
                  <option value="1" selected>z (w)</option>
                  <option value="2">φ</option>
                </select>
              </td>
            </tr>
            <tr>
              <td title=${msg('Vorverformung am Knoten in gewählter Richtung')}>
                Δ [mm, mrad] :
              </td>
              <td>
                <input
                  type="number"
                  step="any"
                  id="id_maxu_schief"
                  name="maxu_schief"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value=""
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

          </tbody>
        </table>

      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-ergebnisse"
        ><p><sl-button id="id_create_pdf" @click="${create_pdf}">${msg('erstelle pdf-Datei')}</sl-button></p>
        <p><b>${msg('Eingabeprotokoll')}</b></p>
        <div id="id_results"></div>
      </sl-tab-panel>

      <!--------------------------------------------  P R O  ------------------------------------------->
      <!--------------------------------------------  P R O  ------------------------------------------->
      <!--------------------------------------------  P R O  ------------------------------------------->

      <sl-tab-panel name="tab-pro">
        <p><b>${msg('Einstellungen')}</b><br /><br /></p>

        <table>
          <tbody>
            <tr>
              <td id="id_nteilungen" title=${msg('Stabteilungen für Ausgabe der Schnittgrößen')}>&nbsp;${msg('Stabteilungen Ausgabe:')}</td>
              <td>
                <dr-button-pm id="id_button_nteilungen" nel="10" inputid="nteilungen"  @change=${berechnungErforderlich}></dr-button-pm>
              </td>
            </tr>


            <tr>
              <td id="id_einheit_kraft" title=${msg('Einheit für Kraft in Ausgabe')}>&nbsp;${msg('Einheit für Kraft in Ausgabe:')}</td>
              <td>
              <select  value="kN" id="id_einheit_kraft_option" onchange="berechnungErforderlich()" style="width:6rem;">
                 <option value='kN' >kN</option>
                 <option value='N'  >N</option>
              </select>
              </td>
            </tr>

            <tr>
              <td title=${msg('Einheit für Bemaßung')}>&nbsp;${msg('Einheit für Bemaßung:')}</td>
              <td>
              <select  value="m" id="id_einheit_bemassung" style="width:6rem;" onchange="einheit_bemassung_changed()">
                 <option value='m'  >m</option>
                 <option value='cm' >cm</option>
                 <option value='mm' >mm</option>
              </select>
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>
            <tr><td>&nbsp;<b>${msg('Allgemein:')}</b></td></tr>

            <tr>
              <td id="id_eps_disp" title=${msg('max. Euklidische Fehlertoleranz eps für Verformungen')}>&nbsp;${msg('eps tol Verformung:')}</td>
              <td>
              <input
                  type="number"
                  step="any"
                  id="id_eps_disp_tol"
                  name="eps_disp_tol"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1e-5"
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

            <tr>
              <td id="id_eps_force" title=${msg('max. Euklidische Fehlertoleranz eps für Kräfte')}>&nbsp;${msg('eps tol Kraft:')}</td>
              <td>
              <input
                  type="number"
                  step="any"
                  id="id_eps_force_tol"
                  name="eps_force_tol"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1e-8"
                  onchange="berechnungErforderlich()"
                />
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>

            <tr><td>&nbsp;<b>${msg('für Theorie II. Ordnung:')}</b></td></tr>
            <tr>
              <td id="id_niter" title=${msg('max. Anzahl Iterationen bei Th. II. Ordnung')}>&nbsp;${msg('max. Anzahl Gleichgewichts-Iterationen:')}</td>
              <td>
                <dr-button-pm id="id_button_niter" nel="10" inputid="niter"  @change=${berechnungErforderlich}></dr-button-pm>
              </td>
            </tr>


            <tr>
              <td title=${msg('Anzahl der zu berechnenden Eigenwerte, für die Schiefstellung wird immer die erste Eigenform verwendet')}>
              &nbsp;${msg('Anzahl Knickfiguren :')}
              </td>
              <td>
              <dr-button-pm id="id_neigv" nel="1" minValue="0" inputid="neigv"  @change=${berechnungErforderlich}></dr-button-pm>
                <!-- <input
                  type="number"
                  step="1"
                  min="1"
                  id="id_neigv"
                  name="neigv"
                  class="input_tab"
                  pattern="[0-9.,eE+-]*"
                  value="1"
                  @change=${berechnungErforderlich}
                /> -->
              </td>
            </tr>

            <tr>
              <td id="id_P_delta" title=${msg('Art der geometrischen Steifigkeitsmatrix')}>&nbsp;${msg('Geom. Steifigkeitsmatrix:')}</td>
              <td>
              <select  id="id_P_delta_option" style="min-width:100%;">
                 <option value='false' @click=${berechnungErforderlich} selected >${msg('vollständiger Ansatz')}</option>
                 <option value='true' @click=${berechnungErforderlich} >${msg('nur P-Δ Effekt')}</option>
              </select>
              </td>
            </tr>
            <tr>
              <td id="id_ausgabe_SG" title=${msg('Ausgabe Schnittgrößen in Tab Ergebnisse und pdf-Datei, Neuberechnung erforderlich')}>&nbsp;${msg('Ausgabe Schnittgrößen:')}</td>
              <td>
              <select  id="id_ausgabe_SG_option" style="min-width:100%;">
                 <option value='true' @click=${berechnungErforderlich} selected >${msg('Gleichgewichtsschnittgrößen')}</option>
                 <option value='false' @click=${berechnungErforderlich} >${msg('Nachweisschnittgrößen')}</option>
              </select>
              </td>
            </tr>

            <tr>
              <td>&nbsp; </td>
            </tr>

            <tr><td>&nbsp;<b>${msg('für Theorie II. Ordnung und Dynamik:')}</b></td></tr>
            <tr>
              <td id="id_eig_solver" title=${msg('Auswahl des Eigenwert solvers, Neuberechnung erforderlich')}>&nbsp;${msg('Eigenwertberechnung:')}</td>
              <td>
              <select  id="id_eig_solver_option" style="min-width:100%;">
                 <option value='0' @click=${berechnungErforderlich} >${msg('GNU GSL QR Methode')}</option>
                 <option value='1' @click=${berechnungErforderlich} >${msg('simultane Vektoriteration')}</option>
                 <option value='2' @click=${berechnungErforderlich} selected >${msg('ARPACK Lanczos Iteration')}</option>
              </select>
              </td>
              <td>
                <button class="btn_small" @click="${info_Eigenwertberechnung}">
                    <svg fill="#000000" width="1rem" height="1rem" viewBox="0 0 1920 1920"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                        d="M1229.93 594.767c36.644 37.975 50.015 91.328 43.72 142.909-9.128 74.877-30.737 144.983-56.093 215.657-27.129 75.623-54.66 151.09-82.332 226.512-44.263 120.685-88.874 241.237-132.65 362.1-10.877 30.018-18.635 62.072-21.732 93.784-3.376 34.532 21.462 51.526 52.648 36.203 24.977-12.278 49.288-28.992 68.845-48.768 31.952-32.31 63.766-64.776 94.805-97.98 15.515-16.605 30.86-33.397 45.912-50.438 11.993-13.583 24.318-34.02 40.779-42.28 31.17-15.642 55.226 22.846 49.582 49.794-5.39 25.773-23.135 48.383-39.462 68.957l-1.123 1.416a1559.53 1559.53 0 0 0-4.43 5.6c-54.87 69.795-115.043 137.088-183.307 193.977-67.103 55.77-141.607 103.216-223.428 133.98-26.65 10.016-53.957 18.253-81.713 24.563-53.585 12.192-112.798 11.283-167.56 3.333-40.151-5.828-76.246-31.44-93.264-68.707-29.544-64.698-8.98-144.595 6.295-210.45 18.712-80.625 46.8-157.388 75.493-234.619l2.18-5.867 1.092-2.934 2.182-5.87 2.182-5.873c33.254-89.517 67.436-178.676 101.727-267.797 31.294-81.296 62.72-162.537 93.69-243.95 2.364-6.216 5.004-12.389 7.669-18.558l1-2.313c6.835-15.806 13.631-31.617 16.176-48.092 6.109-39.537-22.406-74.738-61.985-51.947-68.42 39.4-119.656 97.992-170.437 156.944l-6.175 7.17c-15.78 18.323-31.582 36.607-47.908 54.286-16.089 17.43-35.243 39.04-62.907 19.07-29.521-21.308-20.765-48.637-3.987-71.785 93.18-128.58 205.056-248.86 350.86-316.783 60.932-28.386 146.113-57.285 225.882-58.233 59.802-.707 116.561 14.29 157.774 56.99Zm92.038-579.94c76.703 29.846 118.04 96.533 118.032 190.417-.008 169.189-182.758 284.908-335.53 212.455-78.956-37.446-117.358-126.202-98.219-227.002 26.494-139.598 183.78-227.203 315.717-175.87Z"
                        fill-rule="evenodd" />
                    </svg>
                </button>
              </td>
            </tr>


            <tr>
              <td title=${msg('max. Anzahl der Iterationen für die Vektoriterationen')}>
              &nbsp;${msg('max. Anzahl Iterationen für Vektoriteration :')}
              </td>
              <td>
                <input
                  type="number"
                  step="1"
                  min="1"
                  id="id_iter_neigv"
                  name="iter_neigv"
                  class="input_tab"
                  pattern="[0-9]*"
                  value="500"
                  @change=${berechnungErforderlich}
                />
              </td>
            </tr>

          </tbody>
        </table>

        <hr />
        <p>

          <sl-checkbox id="id_glsystem_darstellen"><b>${msg('Gleichungssystem darstellen')}</b></sl-checkbox>
          <br /><br />
          &nbsp;&nbsp;${msg('Zeige :')}
          <select id="id_element_darstellen" on></select>
        </p>

        <div id="id_elementsteifigkeit"></div>
        <div id="id_gleichungssystem"></div>


      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-mass">


        <p>
          ${msg('Anzahl Eigenwerte:')}

          <dr-button-pm id="id_button_dyn_neigv" nel="${dyn_neigv_init}" inputid="dyn_neigv"></dr-button-pm>
          <br /><br />
        </p>
        <p>${msg('Zur Verbesserung der Konvergenz bei der Iteration der Eigenwerte:')}<br>
           ${msg('Mindestwert auf der Diagonalen der Massenmatrix :')}
           <input type="number" id="id_minMass" name="minmass" class="input_tab" pattern="[0-9.,eE+-]*" value="0.0" /> kg
        </p>




    </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-info">
        <div id="id_hilfe" class="c_hilfe">
          <div id="id_doc_frame" style="position: relative; width: 760px; left:50%;">
            <iframe
              id="id_doc_de"
              src="src/info/Kurzdokumentation_deutsch.html"
              width="100%"
              height="1500px"
              style="border: none; overflow: scroll; background-color: white;"
            >
            </iframe>
            <iframe
              id="id_doc_en"
              src="src/info/Kurzdokumentation_english.html"
              width="100%"
              height="1500px"
              style="border: none; overflow: scroll; background-color: white; display: none;"
            >
            </iframe>
            <iframe
              id="id_doc_es"
              src="src/info/Kurzdokumentation_spanish.html"
              width="100%"
              height="1500px"
              style="border: none; overflow: scroll; background-color: white; display: none;"
            >
            </iframe>
          </div>
        </div>
      </sl-tab-panel>

      <!--------------------------------------------------------------------------------------->
      <sl-tab-panel name="tab-einstellungen"
        ><p><b>${msg('Einstellungen')}</b><br /><br /></p>

        <div id="id_einstellungen">
          <br />
          <table>
            <tbody>
              <tr>
                <td>Language:</td>
                <td><locale-picker id="id_locale-picker"></locale-picker></td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td id="lab_font_size">${msg('Schriftgröße:')}</td>
                <td>
                  <select name="fontSize" id="id_fontsize">
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
                    <option value="1.25em">20</option>
                    <option value="1.375em">22</option>
                    <option value="1.5em">24</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td title='Selektion von Zellen mit Finger'>${msg('nur für Touchscreens:')}</td>
                <td><sl-checkbox id="id_touch_support_tables">${msg('Selektion von Zellen mit Finger erlauben')}</sl-checkbox></td>
              </tr>
              <tr>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td style="white-space:nowrap">
                  Tabellenfarbe außen: &nbsp;
                </td>
                <td>
                  <input
                    id="id_color_table_out"
                    value="#CFD915"
                  />
                </td>
              </tr>
              <tr>
                <td style="white-space:nowrap">
                  Tabellenfarbe innen: &nbsp;
                </td>
                <td>
                  <input
                    id="id_color_table_in"
                    value="#b3ae00"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <br /><br />
          <p>
            <button type="button" id="id_cb_saveLocalStorage">
              ${msg('Auswahl als Standardwerte im Browser speichern')}
            </button>
          </p>
          <p>
            <button type="button" id="id_cb_deleteLocalStorage">
              ${msg('Standardwerte im Speicher des Browsers löschen')}
            </button>
          </p>
        </div>
      </sl-tab-panel>
    </sl-tab-group>

  `;

    // const container = document.getElementById('container') as HTMLDivElement;
    // const renderBefore = container?.querySelector('footer');
    // render(template(), container, { renderBefore });

    // setTimeout(function(){
    //   console.log("in setTimeout document.readyState",document.readyState)
    //            console.log("Executed after 1 second");
    //        }, 500);

    // ?? render(template(), document.body);
  }

  test() {
    console.log('in test von drHaupt');
    const shadow = this.shadowRoot;
    if (shadow) {
      console.log("readFile", shadow);
    }
  }
}

