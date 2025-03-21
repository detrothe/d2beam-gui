import { SlRadioGroup, SlSelect } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("dr-dialog_elementlasten")
export class drDialogElementlasten extends LitElement {
  @property({ type: String }) title = "neuer Knoten";

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
        background-color: rgb(207, 217, 21);
        border-radius: 5px;
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
        width: 20rem;
        background: #fffbf0;
        border: thin solid #e7c157;
        margin: 5rem auto;
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
    return html` <dialog id="dialog_elementlast">
      <h2>Elementlasten</h2>

      <p>
        Lastfall:
        <input type="number" id="id_lf" name="lf" pattern="[0-9.,eE+-]*" value="" />
      </p>

      <sl-radio-group id="id_typ" label="Wähle eine Option" name="a" value="0" @sl-change="${this._handleChange}">
        <sl-radio value="0">Streckenlasten</sl-radio>
        <sl-radio value="1">Einzellasten</sl-radio>
        <sl-radio value="2">Temperatur</sl-radio>
        <sl-radio value="3">Vorspannung</sl-radio>
        <sl-radio value="4">Spannschloss</sl-radio>
      </sl-radio-group>

      <hr>

      <div id="id_streckenlast">
        <p>
          <!-- Art: -->
          <!-- <input type="number" id="id_art" name="art" pattern="[0-9.,eE+-]*" value="" /> -->
          <sl-select id="id_art" label="Art der Trapezstreckenlast :" value='0'>
            <sl-option value="0">senkrecht auf Stab</sl-option>
            <sl-option value="1">in globaler z-Richtung</sl-option>
            <sl-option value="2">in globaler z-Richtung, Projektion</sl-option>
            <sl-option value="3">in globaler x-Richtung</sl-option>
            <sl-option value="4">in globaler x-Richtung, Projektion</sl-option>
          </sl-select>
        </p>
        <p>
          p<sub>a</sub>:
          <input type="number" id="id_pa" name="pa" pattern="[0-9.,eE+-]*" value="" />
          [kN/m]<br />
          p<sub>e</sub>:
          <input type="number" id="id_pe" name="pa" pattern="[0-9.,eE+-]*" value="" />
          [kN/m]
        </p>
      </div>

      <div id="id_temperatur" style="display:none;">
        <p>Temperatur an Unter- und Oberseite</p>
        <p>
          T<sub>u</sub>:
          <input type="number" id="id_Tu" name="Tu" pattern="[0-9.,eE+-]*" value="" />
          [°]<br />
          T<sub>o</sub>:
          <input type="number" id="id_To" name="To" pattern="[0-9.,eE+-]*" value="" />
          [°]
        </p>
      </div>

      <form method="dialog">
        <!-- <sl-button id="Anwenden" value="anwenden" @click="${this._dialog_anwenden}">Anwenden</sl-button> -->
        <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}">ok</sl-button>
        <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
      </form>
    </dialog>`;
  }

  _dialog_anwenden() {
    console.log("dialog_anwenden");
    const shadow = this.shadowRoot;
    if (shadow) {
      window.dispatchEvent(new Event("click_stab_element_elast"));
    }
  }

  _dialog_ok() {
    console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_elementlast") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_elementlast") as HTMLDialogElement).close("cancel");
  }

  get_lastfall() {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    return Number(el.value);
  }
  get_art() {
    let el = this.shadowRoot?.getElementById("id_art") as SlSelect;
    console.log("gewählte Belastungsart = ", el.value)
    return Number(el.value);
  }
  get_typ() {
    let el = this.shadowRoot?.getElementById("id_typ") as SlSelect;
    //console.log("gewählte Belastungsart = ", el.value)
    return Number(el.value);
  }

  get_pa() {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_pa") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_pe() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_pe") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_Tu() {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_Tu") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_To() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_To") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  set_lastfall(wert: number) {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    el.value = String(wert);
  }
  set_art(wert: number) {
    let el = this.shadowRoot?.getElementById("id_art") as HTMLInputElement;
    el.value = String(wert);
  }

  set_pa(wert: number) {
    let el = this.shadowRoot?.getElementById("id_pa") as HTMLInputElement;
    el.value = String(wert);
  }
  set_pe(wert: number) {
    let el = this.shadowRoot?.getElementById("id_pe") as HTMLInputElement;
    el.value = String(wert);
  }

  set_Tu(wert: number) {
    let el = this.shadowRoot?.getElementById("id_Tu") as HTMLInputElement;
    el.value = String(wert);
  }
  set_To(wert: number) {
    let el = this.shadowRoot?.getElementById("id_To") as HTMLInputElement;
    el.value = String(wert);
  }

  _handleChange() {
    console.log("_handleChange");
    let el = this.shadowRoot?.getElementById("id_streckenlast") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_temperatur") as HTMLDivElement;
    el.style.display = "none";

    let wert = (this.shadowRoot?.getElementById("id_typ") as SlRadioGroup).value;
    console.log("id_radio_group ", wert);
    if (wert === "0") {
      el = this.shadowRoot?.getElementById("id_streckenlast") as HTMLDivElement;
      el.style.display = "block";
    } else    if (wert === "2") {
      el = this.shadowRoot?.getElementById("id_temperatur") as HTMLDivElement;
      el.style.display = "block";
    }
  }
}
