import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

import "../styles/dr-dialog.css";

@customElement("dr-dialog_einstellungen")
export class drDialogEinstellungen extends LitElement {
  @property({ type: String }) title = "Einstellungen";

  @property({ type: Number }) xValue = 0;

  static get styles() {
    return css`
      input,
      label {
        font-size: 1rem;
        width: 6rem;
      }

      p,
      h2 {
        color: black;
      }

      button,
      select {
        font-size: 0.875rem;
        border-radius: 4px;
        border-width: 1px;
        padding: 0.4rem;
      }

      @media (prefers-color-scheme: dark) {
        button,
        select {
          border-color: #43434a;
          color: #b6b6be;
          background-color: #1a1a1e;
        }
      }

      @media (prefers-color-scheme: light) {
        button,
        select {
          border-color: #303030;
          color: #444;
        }
      }

      button:active {
        background-color: darkorange;
      }

      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type="number"] {
        -moz-appearance: textfield;
      }

      .input_int {
        width: 3.125rem;
        margin: 0;
        padding: 1px;
        border-top: 1px solid #444;
        border-bottom: 1px solid #444;
        border-left: 0;
        border-right: 0;
        border-radius: 0;
        text-align: center;
      }

      td,
      th {
        padding: 2px;
        margin: 3px;
        /*width: 10em;*/
      }

      table {
        border: none;
        border-spacing: 0px;
        padding: 5px;
        margin: 5px;
        color: black;
        /*background-color: rgb(207, 217, 21);
        border-radius: 5px;*/
      }

      td.selected {
        /*background-color: rgb(206, 196, 46);*/
        color: rgb(13, 13, 13);
      }

      td.highlight {
        background-color: orange;
        color: darkslateblue;
      }

      /* Festlegung im Default-Stylesheet der Browser */
      dialog:not([open]) {
        display: none;
      }

      /* Styling der geöffneten Popup-Box */
      dialog[open] {
        width: 25rem;
        background: light-dark(var(--dialog-open-light), var(--dialog-open-dark));
        border: thin solid #e7c157;
        /*margin: 5rem auto;*/
        font-size: 1rem;
        max-height: 90vh;
        overflow-y: auto;
      }

      dialog::backdrop {
        background: hsl(201 50% 40% /0.5);
      }
    `;
  }

  constructor() {
    super();
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html` <dialog id="dialog_einstellungen">
      <h2>Einstellungen GUI</h2>

      <table id="einstellungen_table">
        <tbody>
          <tr>
            <td >
              <sl-checkbox id="id_NO_touch_support">Keine Fingererkennung bei Stiftbenutzung für Systemeingabe </sl-checkbox>
            </td>
          </tr>
          <tr>
            <td >
              <sl-checkbox id="id_NO_units">keine Einheiten anzeigen in Grafik </sl-checkbox>
            </td>
          </tr>
          <tr>
            <td >
              <sl-checkbox id="id_penLikeTouch">Stifteingabe wie Fingereingabe </sl-checkbox>
            </td>
          </tr>
        </tbody>
      </table>

      <table >
        <tbody>
          <tr>
            <td>
              Fangweite Cursor:
            </td>
            <td><input type="number" id="id_fangweite_cursor" name="fang_cursor" pattern="[0-9.,eE+-]*" value="0.25" /> [m]</td>
          </tr>
          <tr>
            <td>
              Faktor für Lagersymbole:
            </td>
            <td>
              <input type="number" id="id_fact_lager" name="fact_lager" pattern="[0-9.,eE+-]*" value="1" />
              [-]
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        Cursor Offset Faktor bei Touch (Finger) Eingabe (bei 0 befindet sich der Cursor direkt unter dem Finger):
      </p>
      <p>
        Faktor für dx:
        <input type="number" id="id_dx_offset_factor" name="dx_offset" pattern="[0-9.,eE+-]*" value="0" />
        [-]
      </p>
      <p>
        Faktor für dz:
        <input type="number" id="id_dz_offset_factor" name="dz_offset" pattern="[0-9.,eE+-]*" value="-1" />
        [-]
      </p>

      <p>
        Raster:
      </p>
      <p>
        dx:
        <input type="number" id="id_dx" name="dx" pattern="[0-9.,eE+-]*" value="0.5" />
        [m]
      </p>
      <p>
        dz:
        <input type="number" id="id_dz" name="dz" pattern="[0-9.,eE+-]*" value="0.5" />
        [m]
      </p>

      <p>Darzustellender Rasterbereich</p>

      <table>
        <tbody>
          <tr>
            <td>x<sub>min</sub></td>
            <td><input type="number" id="id_xmin" name="xmin" pattern="[0-9.,eE+-]*" value="-1.0" /></td>
            <td>[m]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td>x<sub>max</sub></td>
            <td><input type="number" id="id_xmax" name="xmax" pattern="[0-9.,eE+-]*" value="10.0" /></td>
            <td>[m]</td>
          </tr>
          <tr>
            <td>z<sub>min</sub></td>
            <td><input type="number" id="id_zmin" name="zmin" pattern="[0-9.,eE+-]*" value="-1.0" /></td>
            <td>[m]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td>z<sub>max</sub></td>
            <td><input type="number" id="id_zmax" name="zmax" pattern="[0-9.,eE+-]*" value="9.0" /></td>
            <td>[m]</td>
          </tr>
        </tbody>
      </table>

      <sl-button id="id_cad_saveLocalStorage" @click="${this._saveLocalStorage}">
        Auswahl als Standardwerte im Browser speichern
      </sl-button>

      <form method="dialog">
        <!--<sl-button id="Anwenden" value="anwenden" @click="${this._dialog_anwenden}">Anwenden</sl-button> -->
        <sl-button id="OK" value="ok" @click="${this._dialog_ok}">ok</sl-button>
        <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
      </form>
    </dialog>`;
  }

  _dialog_anwenden() {
    console.log("dialog_anwenden");
    const shadow = this.shadowRoot;
    if (shadow) {
      window.dispatchEvent(new Event("draw_cad_knoten"));
    }
  }

  _dialog_ok() {
    console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_einstellungen") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_einstellungen") as HTMLDialogElement).close("cancel");
  }

  getValue_dx() {
    const shadow = this.shadowRoot;
    //console.log("id_dx", (shadow?.getElementById("id_dx") as HTMLInputElement).value);
    let wert = Math.abs(+(shadow?.getElementById("id_dx") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  getValue_dz() {
    const shadow = this.shadowRoot;
    //console.log("id_dz", (shadow?.getElementById("id_dz") as HTMLInputElement).value);
    let wert = Math.abs(+(shadow?.getElementById("id_dz") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_dx_offset() {
    const shadow = this.shadowRoot;
    let wert = +(shadow?.getElementById("id_dx_offset_factor") as HTMLInputElement).value.replace(/,/g, ".");
    return wert;
  }

  get_dz_offset() {
    const shadow = this.shadowRoot;
    let wert = +(shadow?.getElementById("id_dz_offset_factor") as HTMLInputElement).value.replace(/,/g, ".");
    return wert;
  }

  get_NO_touch_support() {
    const shadow = this.shadowRoot;
    let wert = (shadow?.getElementById("id_NO_touch_support") as SlCheckbox).checked;
    return wert;
  }

  get_show_units() {
    const shadow = this.shadowRoot;
    let wert = (shadow?.getElementById("id_NO_units") as SlCheckbox).checked;
    return wert;
  }

  get_penLikeTouch() {
    const shadow = this.shadowRoot;
    let wert = (shadow?.getElementById("id_penLikeTouch") as SlCheckbox).checked;
    return wert;
  }

  get_raster_xmin() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_xmin") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_raster_xmax() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_xmax") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_raster_zmin() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_zmin") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_raster_zmax() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_zmax") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_faktor_lagersymbol() {
    const shadow = this.shadowRoot;
    let wert = Math.abs(+(shadow?.getElementById("id_fact_lager") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  set_raster_dx(dx: number) {
    let el = this.shadowRoot?.getElementById("id_dx") as HTMLInputElement;
    console.log("set_raster_dx", dx, String(dx), el);
    el.value = String(dx);
  }

  set_raster_dz(dz: number) {
    let el = this.shadowRoot?.getElementById("id_dz") as HTMLInputElement;
    el.value = String(dz);
  }

  set_raster_xmin(xmin: number) {
    let el = this.shadowRoot?.getElementById("id_xmin") as HTMLInputElement;
    el.value = String(xmin);
  }

  set_raster_xmax(xmax: number) {
    let el = this.shadowRoot?.getElementById("id_xmax") as HTMLInputElement;
    el.value = String(xmax);
  }

  set_raster_zmin(zmin: number) {
    let el = this.shadowRoot?.getElementById("id_zmin") as HTMLInputElement;
    el.value = String(zmin);
  }

  set_raster_zmax(zmax: number) {
    let el = this.shadowRoot?.getElementById("id_zmax") as HTMLInputElement;
    el.value = String(zmax);
  }

  set_fangweite_cursor(fw: number) {
    let el = this.shadowRoot?.getElementById("id_fangweite_cursor") as HTMLInputElement;
    el.value = String(fw);
  }

  get_fangweite_cursor(): number {
    let wert = Math.abs(+(this.shadowRoot?.getElementById("id_fangweite_cursor") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  set_faktor_lagersymbol(fw: number) {
    let el = this.shadowRoot?.getElementById("id_fact_lager") as HTMLInputElement;
    el.value = String(fw);
  }

  set_dx_offset(fw: number) {
    let el = this.shadowRoot?.getElementById("id_dx_offset_factor") as HTMLInputElement;
    el.value = String(fw);
  }

  set_dz_offset(fw: number) {
    let el = this.shadowRoot?.getElementById("id_dz_offset_factor") as HTMLInputElement;
    el.value = String(fw);
  }

  set_NO_touch_support(value: boolean) {
    let el = this.shadowRoot?.getElementById("id_NO_touch_support") as SlCheckbox;
    el.checked = value;
    // const shadow = this.shadowRoot;
    // let wert = (shadow?.getElementById("id_NO_touch_support") as SlCheckbox).checked;
    // return wert;
  }

  set_show_units(value: boolean) {
    let el = this.shadowRoot?.getElementById("id_NO_units") as SlCheckbox;
    el.checked = value;
  }

  set_penLikeTouch(value: boolean) {
    let el = this.shadowRoot?.getElementById("id_penLikeTouch") as SlCheckbox;
    el.checked = value;
  }

  //----------------------------------------------------------------------------------------------
  _saveLocalStorage() {
    //------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    if (shadow) {
      let bwert = (shadow?.getElementById("id_NO_touch_support") as SlCheckbox).checked;
      window.localStorage.setItem("cad_NO_touch_support", String(bwert));

      bwert = (shadow?.getElementById("id_NO_units") as SlCheckbox).checked;
      window.localStorage.setItem("cad_NO_units", String(bwert));

      bwert = (shadow?.getElementById("id_penLikeTouch") as SlCheckbox).checked;
      window.localStorage.setItem("cad_penLikeTouch", String(bwert));

      let wert = Math.abs(+(shadow?.getElementById("id_fangweite_cursor") as HTMLInputElement).value.replace(/,/g, "."));
      window.localStorage.setItem("cad_id_fangweite_cursor", String(wert));

      wert = Math.abs(+(shadow?.getElementById("id_fact_lager") as HTMLInputElement).value.replace(/,/g, "."));
      window.localStorage.setItem("cad_id_fact_lager", String(wert));

      let swert = (shadow?.getElementById("id_dx_offset_factor") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_dx_offset_factor", swert);

      swert = (shadow?.getElementById("id_dz_offset_factor") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_dz_offset_factor", swert);

      wert = Math.abs(+(shadow?.getElementById("id_dx") as HTMLInputElement).value.replace(/,/g, "."));
      window.localStorage.setItem("cad_id_dx", String(wert));

      wert = Math.abs(+(shadow?.getElementById("id_dz") as HTMLInputElement).value.replace(/,/g, "."));
      window.localStorage.setItem("cad_id_dz", String(wert));

      swert = (shadow?.getElementById("id_xmin") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_xmin", swert);

      swert = (shadow?.getElementById("id_xmax") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_xmax", swert);

      swert = (shadow?.getElementById("id_zmin") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_zmin", swert);

      swert = (shadow?.getElementById("id_zmax") as HTMLInputElement).value.replace(/,/g, ".");
      window.localStorage.setItem("cad_id_zmax", swert);
    }
  }
}
