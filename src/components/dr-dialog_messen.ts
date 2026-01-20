import { SlButton } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import {msg, localized} from '@lit/localize';

import "../styles/dr-dialog.css";
import { myFormat } from "../pages/utility";

@localized()
@customElement("dr-dialog_messen")
export class drDialogMessen extends LitElement {
  @property({ type: String }) title = "neue Messung";

  @property({ type: Number }) ID = 0;

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
        /*background-color: rgb(207, 217, 21);
        border-radius: 5px; */
      }
      /*
      td.selected {
        color: rgb(13, 13, 13);
      }

      td.highlight {
        background-color: orange;
        color: darkslateblue;
      }
      */
      /* Festlegung im Default-Stylesheet der Browser */
      dialog:not([open]) {
        display: none;
      }

      /* Styling der geöffneten Popup-Box */
      dialog[open] {
        width: 18rem;
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
    return html` <dialog id="dialog_messen">
      <p>
        <b>Abstand zweier Punkte</b>
      </p>

      <table>
        <tbody>
          <tr>
            <td>
              dx =
            </td>
            <td>
              <span id="id_dx"></span>
            </td>
            <td>m</td>
          </tr>
          <tr>
            <td>
              dz =
            </td>
            <td>
              <span id="id_dz"></span>
            </td>
            <td>m</td>
          </tr>
          <tr>
            <td>
              Abstand =
            </td>
            <td>
              <span id="id_sl"></span>
            </td>
            <td>m</td>
          </tr>
           <tr>
            <td>
              Winkel α =
            </td>
            <td>
              <span id="id_alpha"></span>
            </td>
            <td>°</td>
          </tr>
        </tbody>
      </table>


      <form method="dialog">
        <table>
          <tbody>
            <tr>
              <td>
                <sl-button id="ok" value="weiter" @click="${this._dialog_ok}">ok</sl-button>
              </td>
              <td>
                <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </dialog>`;
  }

  _dialog_ok() {
    //console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_messen") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    //console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_messen") as HTMLDialogElement).close("cancel");
  }

  set_dxdz(dx: number, dz: number) {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let el = this.shadowRoot?.getElementById("id_dx") as HTMLSpanElement;
    el.innerHTML = myFormat(dx, 1, 3);
    el = this.shadowRoot?.getElementById("id_dz") as HTMLSpanElement;
    el.innerHTML = myFormat(dz, 1, 3);

    let sl = Math.sqrt(dx * dx + dz * dz)
    el = this.shadowRoot?.getElementById("id_sl") as HTMLSpanElement;
    el.innerHTML = myFormat(sl, 1, 3)

    let alpha = Math.atan2(dz, dx) * 180.0 / Math.PI;
    el = this.shadowRoot?.getElementById("id_alpha") as HTMLSpanElement;
    el.innerHTML = myFormat(alpha, 1, 3)
  }
}
