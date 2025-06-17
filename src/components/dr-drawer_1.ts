import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { Messen_button, set_help_text } from "../pages/cad_buttons";
import { Bemassung_button } from "../pages/cad_bemassung";

@customElement("dr-drawer_1")
export class drDrawer_1 extends LitElement {
  @property({ type: String }) title = "Drawer_1";

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
      /*  dialog:not([open]) {
        display: none;
      } */

      /* Styling der geöffneten Popup-Box */
      /*  dialog[open] {
        min-width: 25rem;
        max-width: 40rem;
        max-height:100%;
        background: light-dark(var(--dialog-open-light), var(--dialog-open-dark));
        border: thin solid #e7c157;
        margin: auto;
        overflow-y: auto;
        font-size:1rem;
        max-height:90vh;

      }

      dialog::backdrop {
        background: hsl(201 50% 40% /0.5);
      } */
    `;
  }

  constructor() {
    super();
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html`
      <p>
        <sl-button id="id_messen" value="0" @click="${this._messen}">Messen</sl-button>
      </p>
      <p>
        <sl-button id="id_bemassung_parallel" value="0" @click="${this._bemassung_parallel}">Bemassung parallel</sl-button>
      </p>
      <p>
        <sl-button id="id_bemassung_x" value="0" @click="${this._bemassung_x}">Bemassung horizontal</sl-button>
      </p>
      <p>
        <sl-button id="id_bemassung_z" value="0" @click="${this._bemassung_z}">Bemassung vertikal</sl-button>
      </p>
    `;
  }

  _messen() {
    const drawer = document.querySelector(".drawer-overview");
    //console.log("Button messen geklickt", drawer)
    //@ts-ignore
    if (drawer !== null) drawer.hide();
    console.log("drawer", drawer);
    Messen_button();
  }

  _bemassung_parallel() {
    const drawer = document.querySelector(".drawer-overview");
    //@ts-ignore
    if (drawer !== null) drawer.hide();
    Bemassung_button(1);
  }

  _bemassung_x() {
    const drawer = document.querySelector(".drawer-overview");
    //@ts-ignore
    if (drawer !== null) drawer.hide();
    Bemassung_button(2);
  }

  _bemassung_z() {
    const drawer = document.querySelector(".drawer-overview");
    //@ts-ignore
    if (drawer !== null) drawer.hide();
    Bemassung_button(3);
  }

}
