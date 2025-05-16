import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

import "../styles/dr-dialog.css";

@customElement("dr-dialog_lager")
export class drDialogLager extends LitElement {
  @property({ type: String }) title = "neues Lager";

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
        border-radius: 5px;
        color: black;
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
    return html` <dialog id="dialog_lager">
      <h2>Knotenlager</h2>

      <p>
        Drehung des Knotens (Lagers), im Gegenuhrzeigersinn positiv
      </p>
      <p><input type="number" id="id_alpha" name="alpha" pattern="[0-9.,eE+-]*" value="0.0" />°</p>
      <br />
      <p>
        <b>Lagerbedingungen</b>
      </p>

      <table id="lager_table">
        <thead>
          <tr>
            <td style="text-align: center;">Lager starr</td>
            <td style="text-align: center;">&nbsp;&nbsp;oder&nbsp;&nbsp;</td>
            <td colspan="3" style="text-align: center;">Federkonstante</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">
              <sl-checkbox id="id_Lx" @click="${this._checkbox_Lx}">L<sub>x'</sub></sl-checkbox>
            </td>
            <td>&nbsp;</td>
            <td>k<sub>x'</sub>:</td>
            <td>
              <input type="number" id="id_kx" name="kx" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <sl-checkbox id="id_Lz" @click="${this._checkbox_Lz}">L<sub>z'</sub></sl-checkbox>
            </td>
            <td>&nbsp;</td>
            <td>k<sub>z'</sub>:</td>
            <td>
              <input type="number" id="id_kz" name="kz" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>

          <tr id="id_phi">
            <td style="text-align: center;">
              <sl-checkbox id="id_Lphi" @click="${this._checkbox_Lphi}">L<sub>&phi;</sub></sl-checkbox>
            </td>
            <td>&nbsp;</td>
            <td>k<sub>&phi;</sub>:</td>
            <td>
              <input type="number" id="id_kphi" name="kphi" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kNm/rad</td>
          </tr>
        </tbody>
      </table>

      <form method="dialog">
        <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}">ok</sl-button>
        <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
      </form>
    </dialog>`;
  }

  _dialog_ok() {
    console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_lager") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_lager") as HTMLDialogElement).close("cancel");
  }

  set_system(system: number) {
    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_phi") as HTMLTableRowElement;

    if (system === 0) {
      el.style.display = "table-row";
    } else {
      el.style.display = "none";
    }
  }

  _checkbox_Lx() {
    let el = this.shadowRoot?.getElementById("id_Lx") as SlCheckbox;
    if (el.checked) {
      (this.shadowRoot?.getElementById("id_kx") as HTMLInputElement).disabled = true;
    } else {
      (this.shadowRoot?.getElementById("id_kx") as HTMLInputElement).disabled = false;
    }
  }

  _checkbox_Lz() {
    let el = this.shadowRoot?.getElementById("id_Lz") as SlCheckbox;
    if (el.checked) {
      (this.shadowRoot?.getElementById("id_kz") as HTMLInputElement).disabled = true;
    } else {
      (this.shadowRoot?.getElementById("id_kz") as HTMLInputElement).disabled = false;
    }
  }

  _checkbox_Lphi() {
    let el = this.shadowRoot?.getElementById("id_Lphi") as SlCheckbox;
    if (el.checked) {
      (this.shadowRoot?.getElementById("id_kphi") as HTMLInputElement).disabled = true;
    } else {
      (this.shadowRoot?.getElementById("id_kphi") as HTMLInputElement).disabled = false;
    }
  }
}
