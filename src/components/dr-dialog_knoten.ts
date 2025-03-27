import { SlButton } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("dr-dialog_knoten")
export class drDialogKnoten extends LitElement {
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
        width: 26rem;
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
    return html` <dialog id="dialog_knoten">

      <p>
        <b>Knotenkoordinaten</b>
      </p>

      <p>
        x:
        <input type="number" id="id_x" name="x" pattern="[0-9.,eE+-]*" value="" />
        [m]
      </p>
      <p>
        z:
        <input type="number" id="id_z" name="z" pattern="[0-9.,eE+-]*" value="" />
        [m]
      </p>

      <form method="dialog">
        <table>
          <tbody>
            <tr>
              <td>
                <sl-button id="Anwenden" value="anwenden" @click="${this._dialog_anwenden}">Anwenden</sl-button>
              </td>
              <td>
                <sl-button id="ok" value="ok" @click="${this._dialog_ok}">ok</sl-button>
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

  _dialog_anwenden() {
    //console.log("dialog_anwenden");
    const shadow = this.shadowRoot;
    if (shadow) {
      window.dispatchEvent(new Event("draw_cad_knoten"));
    }
  }

  _dialog_ok() {
    //console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_knoten") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    //console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_knoten") as HTMLDialogElement).close("cancel");
  }

  getValueX() {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_x") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  getValueZ() {
    const shadow = this.shadowRoot;
    //console.log("id_z", (shadow?.getElementById("id_z") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_z") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  set_mode(mode: boolean) {
    if (mode) {
      // Änderung
      let el = this.shadowRoot?.getElementById("Anwenden") as SlButton;
      el.style.display = "none";
      el.style.width = "5rem";
      el = this.shadowRoot?.getElementById("ok") as SlButton;
      el.style.display = "block";
    } else {
      let el = this.shadowRoot?.getElementById("Anwenden") as SlButton;
      el.style.display = "block";
      el = this.shadowRoot?.getElementById("ok") as SlButton;
      el.style.display = "none";
    }
  }
}
