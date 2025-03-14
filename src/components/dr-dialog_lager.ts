import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

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
        width: 32rem;
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
    return html` <dialog id="dialog_lager">
      <h2>Neues Knotenlager</h2>

      <p>
        Drehung des Knotens (Lagers), im Gegenuhrzeigersinn positiv
      </p>
      <p><input type="number" id="id_alpha" name="alpha" pattern="[0-9.,eE+-]*" value="0.0" />°</p>
      <br /><br />
      <p>
        <b>Lagerbedingungen</b>
      </p>

      <table id="lager_table">
        <thead>
          <tr>
            <td>Lager starr</td>
            <td colspan="3" style="text-align: center;">Federkonstante</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <sl-checkbox id="id_Lx">L<sub>x'</sub></sl-checkbox>
            </td>

            <td>k<sub>x'</sub>:</td>
            <td>
              <input type="number" id="id_kx" name="kx" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Lz">L<sub>z'</sub></sl-checkbox>
            </td>
            <td>k<sub>z'</sub>:</td>
            <td>
              <input type="number" id="id_kz" name="kz" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Lphi">L<sub>&phi;</sub></sl-checkbox>
            </td>

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
}
