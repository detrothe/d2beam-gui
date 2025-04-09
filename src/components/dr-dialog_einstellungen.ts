import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

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
    return html` <dialog id="dialog_einstellungen">
      <h2>Einstellungen GUI</h2>

      <table id="einstellungen_table">
        <tbody>
          <tr>
            <td>
              <sl-checkbox id="id_NO_touch_support">Keine Fingereingabe für System </sl-checkbox>
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        Cursor Offset bei Touch (Finger) Eingabe (bei 0 befindet sich der Cursor direkt unter dem Finger):
      </p>
      <p>
        dx:
        <input type="number" id="id_dx_offset" name="dx_offset" pattern="[0-9.,eE+-]*" value="-100" />
        [-]
      </p>
      <p>
        dz:
        <input type="number" id="id_dz_offset" name="dz_offset" pattern="[0-9.,eE+-]*" value="-100" />
      [-]
      </p>


      <p>
        Raster:
      </p>
      <p>
        dx:
        <input type="number" id="id_dx" name="dx" pattern="[0-9.,eE+-]*" value="0.25" />
        [m]
      </p>
      <p>
        dz:
        <input type="number" id="id_dz" name="dz" pattern="[0-9.,eE+-]*" value="0.25" />
        [m]
      </p>

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
    let wert = Number((shadow?.getElementById("id_dx") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  getValue_dz() {
    const shadow = this.shadowRoot;
    //console.log("id_dz", (shadow?.getElementById("id_dz") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_dz") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_dx_offset() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_dx_offset") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_dz_offset() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_dz_offset") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_NO_touch_support() {
    const shadow = this.shadowRoot;
    let wert = (shadow?.getElementById("id_NO_touch_support") as SlCheckbox).checked;
    return wert;
  }
}
