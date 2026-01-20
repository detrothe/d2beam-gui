import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import {msg, localized} from '@lit/localize';

import "../styles/dr-dialog.css";

@localized()
@customElement("dr-dialog_knotenverformung")
export class drDialogKnotenverformung extends LitElement {
  @property({ type: String }) title = "neue Knotenverformung";

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
        width: 16rem;
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
    return html` <dialog id="dialog_knotenverformung">
      <h2>Knotenverformung</h2>

      <p>zum Beispiel für Stützensenkungen (Th.I.O. und Th.II.O.)</p>
      <p>
        Die Richtungen stimmen mit den Richtungen des zugehörigen gedrehten Lagerknotens überein.
        <br />
        Es sind nur in den Zellen Werte einzugeben, für die definierte Verformungen gewünscht werden.<br />
        Die Zahl 0 entspricht einer starren Lagerung!
      </p>

      <table>
        <tbody>
          <tr>
            <td>Lastfall :</td>
            <td><input type="number" id="id_lf" name="lf" pattern="[0-9.,eE+-]*" value="1" /></td>
          </tr>

          <tr>
            <td>u<sub>x&prime;0</sub> :</td>
            <td><input type="number" id="id_ux0" name="ux0" pattern="[0-9.,eE+-]*" value="" /> [mm]</td>
          </tr>
          <tr>
            <td>u<sub>z&prime;0</sub> :</td>
            <td><input type="number" id="id_uz0" name="uz0" pattern="[0-9.,eE+-]*" value="" /> [mm]</td>
          </tr>

          <tr id="id_PHI">
            <td>φ<sub>0</sub> :</td>
            <td><input type="number" id="id_phi0" name="phi0" pattern="[0-9.,eE+-]*" value="" /> [mrad]</td>
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
      (shadow.getElementById("dialog_knotenverformung") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_knotenverformung") as HTMLDialogElement).close("cancel");
  }

  get_lastfall() {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    return Number(el.value);
  }

  set_lastfall(wert: number) {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    el.value = String(wert);
  }

  get_ux0(): string {
    const shadow = this.shadowRoot;
    //console.log("id_px", (shadow?.getElementById("id_px") as HTMLInputElement).value);
    let wert = (shadow?.getElementById("id_ux0") as HTMLInputElement).value;
    return wert;
  }

  get_uz0(): string {
    const shadow = this.shadowRoot;
    // console.log("id_pz", (shadow?.getElementById("id_pz") as HTMLInputElement).value);
    let wert = (shadow?.getElementById("id_uz0") as HTMLInputElement).value;
    return wert;
  }
  get_phi0(): string {
    const shadow = this.shadowRoot;
    // console.log("id_my", (shadow?.getElementById("id_my") as HTMLInputElement).value);
    let wert = (shadow?.getElementById("id_phi0") as HTMLInputElement).value;
    return wert;
  }

  set_ux0(ux0: string) {
    let el = this.shadowRoot?.getElementById("id_ux0") as HTMLInputElement;
    el.value = ux0;
  }

  set_uz0(uz0: string) {
    let el = this.shadowRoot?.getElementById("id_uz0") as HTMLInputElement;
    el.value = uz0;
  }

  set_phi0(phi0: string) {
    let el = this.shadowRoot?.getElementById("id_phi0") as HTMLInputElement;
    el.value = phi0;
  }

  set_system(system: number) {
    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_PHI") as HTMLTableRowElement;

    if (system === 0) {
      el.style.display = "table-row";
    } else {
      el.style.display = "none";
    }
  }

}
