import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("dr-dialog_stab_eigenschaften")
export class drDialogStabEigenschaften extends LitElement {
  @property({ type: String }) title = "Stab Eigenschaften";

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
        width: 19rem;
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
              <input type="number" id="id_kxa" name="kxa" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Va">V<sub>a</sub></sl-checkbox>
            </td>
            <td>k<sub>z,a</sub>:</td>
            <td>
              <input type="number" id="id_kza" name="kza" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Ma">M<sub>a</sub></sl-checkbox>
            </td>

            <td>k<sub>&phi;,a</sub>:</td>
            <td>
              <input type="number" id="id_kphi_a" name="kphi_a" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kNm/rad</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Ne">N<sub>e</sub></sl-checkbox>
            </td>

            <td>k<sub>x,e</sub>:</td>
            <td>
              <input type="number" id="id_kxe" name="kxe" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>

          <tr>
            <td>
              <sl-checkbox id="id_Ve">V<sub>e</sub></sl-checkbox>
            </td>
            <td>k<sub>z,e</sub>:</td>
            <td>
              <input type="number" id="id_kze" name="kze" pattern="[0-9.,eE+-]*" value="" />
            </td>
            <td>kN/m</td>
          </tr>
          <tr>
            <td>
              <sl-checkbox id="id_Me">M<sub>e</sub></sl-checkbox>
            </td>

            <td>k<sub>&phi;,e</sub>:</td>
            <td>
              <input type="number" id="id_kphi_e" name="kphi_e" pattern="[0-9.,eE+-]*" value="" />
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

  getValueX() {
    const shadow = this.shadowRoot;
    console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_x") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  getValueZ() {
    const shadow = this.shadowRoot;
    console.log("id_z", (shadow?.getElementById("id_z") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_z") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
}
