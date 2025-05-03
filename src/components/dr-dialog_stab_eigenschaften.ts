import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

import "../styles/dr-dialog.css";

@customElement("dr-dialog_stab_eigenschaften")
export class drDialogStabEigenschaften extends LitElement {
  @property({ type: String }) title = "Stab Eigenschaften";

  @property({ type: Number }) xValue = 0;
  @property({ type: Array }) qname: string[];

  nOptions = 0;

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
        background-color: light-dark(var(--table-bgcolor-light), var(--table-bgcolor-dark));
        color: black;
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
        width: 19rem;
        background: light-dark(var(--dialog-open-light), var(--dialog-open-dark));
        border: thin solid #e7c157;
        /*margin: 5rem auto;*/
        font-size: 1rem;
        max-height:90vh;
      }

      dialog::backdrop {
        background: hsl(201 50% 40% /0.5);
      }
    `;
  }

  constructor() {
    super();
    this.qname = [];
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html` <dialog id="dialog_stabeigenschaften">
      <h2>Stab-Eigenschaften</h2>

      <p>
        <b>Querschnitt</b>
      </p>

      <p>
        <select name="querschnitt" id="id_querschnitt"></select>
      </p>
      <table id="stab_table">
        <thead>
          <tr>
            <td>Gelenke</td>
            <td colspan="2" style="text-align: center;">Federkonstante</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <sl-checkbox id="id_Na">N<sub>a</sub></sl-checkbox>
            </td>

            <td>k<sub>x,a</sub>:</td>
            <td>
              <input type="number" id="id_kxa" name="kxa" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kN/m</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Va">V<sub>a</sub></sl-checkbox>
            </td>
            <td>k<sub>z,a</sub>:</td>
            <td>
              <input type="number" id="id_kza" name="kza" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Ma">M<sub>a</sub></sl-checkbox>
            </td>

            <td>k<sub>&phi;,a</sub>:</td>
            <td>
              <input type="number" id="id_kphi_a" name="kphi_a" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kNm/rad</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Ne">N<sub>e</sub></sl-checkbox>
            </td>

            <td>k<sub>x,e</sub>:</td>
            <td>
              <input type="number" id="id_kxe" name="kxe" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kN/m</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Ve">V<sub>e</sub></sl-checkbox>
            </td>
            <td>k<sub>z,e</sub>:</td>
            <td>
              <input type="number" id="id_kze" name="kze" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Me">M<sub>e</sub></sl-checkbox>
            </td>

            <td>k<sub>&phi;,e</sub>:</td>
            <td>
              <input type="number" id="id_kphi_e" name="kphi_e" pattern="[0-9.,eE+-]*" value="" disabled />
            </td>
            <td>kNm/rad</td>
          </tr>
        </tbody>
      </table>

      <p><b>Starre Stabenden</b></p>
      <p>
        starr a:
        <input type="number" id="id_a" name="a" pattern="[0-9.,eE+-]*" value="" />
        [m]
      </p>
      <p>
        starr e:
        <input type="number" id="id_e" name="e" pattern="[0-9.,eE+-]*" value="" />
        [m]
      </p>

      <p><b>Stabbettung</b></p>
      <p>
        k<sub>b</sub>:
        <input type="number" id="id_kb" name="kb" pattern="[0-9.,eE+-]*" value="" />
        [kN/m²]
      </p>

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
      window.dispatchEvent(new Event("draw_cad_knoten"));
    }
  }

  _dialog_ok() {
    console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).close("cancel");
  }

  //---------------------------------------------------------------------------------------------------------------
  getStarrA() {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    console.log("id_a", (shadow?.getElementById("id_a") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_a") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  getStarrE() {
    const shadow = this.shadowRoot;
    console.log("id_e", (shadow?.getElementById("id_e") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_e") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  //---------------------------------------------------------------------------------------------------------------
  setStarrA(wert: number) {
    //-------------------------------------------------------------------------------------------------------------
    (this.shadowRoot?.getElementById("id_a") as HTMLInputElement).value = String(wert);
  }

  //---------------------------------------------------------------------------------------------------------------
  setStarrE(wert: number) {
    //-------------------------------------------------------------------------------------------------------------
    (this.shadowRoot?.getElementById("id_e") as HTMLInputElement).value = String(wert);
  }

  //---------------------------------------------------------------------------------------------------------------
  getBettung() {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_kb") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  //---------------------------------------------------------------------------------------------------------------
  setBettung(wert: number) {
    //-------------------------------------------------------------------------------------------------------------
    (this.shadowRoot?.getElementById("id_kb") as HTMLInputElement).value = String(wert);
  }

  //---------------------------------------------------------------------------------------------------------------
  addQuerschnittName(name: string) {
    //-------------------------------------------------------------------------------------------------------------
    this.qname[this.nOptions] = name;

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_querschnitt") as HTMLSelectElement;
    let option = document.createElement("option");

    option.value = option.textContent = this.qname[this.nOptions];
    el.appendChild(option);

    this.nOptions++;
  }

  //---------------------------------------------------------------------------------------------------------------
  setQuerschnittNames(name: string[]) {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_querschnitt") as HTMLSelectElement;
    //    for (let i = 0; i < this.nOptions; i++) el.removeChild(el.lastChild);
    for (let i = el.children.length - 1; i >= 0; i--) el.remove(i);

    for (let i = 0; i < name.length; i++) {
      this.qname[i] = name[i];

      let option = document.createElement("option");

      option.value = option.textContent = this.qname[i];

      el.appendChild(option);
    }

    this.nOptions = name.length;
  }

  //---------------------------------------------------------------------------------------------------------------
  selectOption(index: number) {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_querschnitt") as HTMLSelectElement;

    el.selectedIndex = index;
  }

  //---------------------------------------------------------------------------------------------------------------
  selectOptionByName(name: string) {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_querschnitt") as HTMLSelectElement;

    for (let i = 0; i < el.children.length; i++) {
      if (el.children.item(i)?.textContent === name) {
        el.selectedIndex = i;
        return;
      }
    }
  }

  //---------------------------------------------------------------------------------------------------------------
  getSelectedOptionByName(): string {
    //-------------------------------------------------------------------------------------------------------------
    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_querschnitt") as HTMLSelectElement;

    let index = el.selectedIndex;
    let name = el.children.item(index)?.textContent;
    //console.log("in getSelectedOptionByName",index,name)

    if (typeof name === "string") return name;
    else return "";
  }

  //---------------------------------------------------------------------------------------------------------------
  getGelenke() {
    //-------------------------------------------------------------------------------------------------------------

    let gelenke: boolean[] = Array(6);

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_Na") as SlCheckbox;
    gelenke[0] = el.checked;
    el = shadow?.getElementById("id_Va") as SlCheckbox;
    gelenke[1] = el.checked;
    el = shadow?.getElementById("id_Ma") as SlCheckbox;
    gelenke[2] = el.checked;
    el = shadow?.getElementById("id_Ne") as SlCheckbox;
    gelenke[3] = el.checked;
    el = shadow?.getElementById("id_Ve") as SlCheckbox;
    gelenke[4] = el.checked;
    el = shadow?.getElementById("id_Me") as SlCheckbox;
    gelenke[5] = el.checked;

    //console.log("id_na", el.checked)
    return gelenke;
  }

  //---------------------------------------------------------------------------------------------------------------
  setGelenke(gelenke: boolean[]) {
    //-------------------------------------------------------------------------------------------------------------

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_Na") as SlCheckbox;
    el.checked = gelenke[0];
    el = shadow?.getElementById("id_Va") as SlCheckbox;
    el.checked = gelenke[1];
    el = shadow?.getElementById("id_Ma") as SlCheckbox;
    el.checked = gelenke[2];
    el = shadow?.getElementById("id_Ne") as SlCheckbox;
    el.checked = gelenke[3];
    el = shadow?.getElementById("id_Ve") as SlCheckbox;
    el.checked = gelenke[4];
    el = shadow?.getElementById("id_Me") as SlCheckbox;
    el.checked = gelenke[5];
  }
}
