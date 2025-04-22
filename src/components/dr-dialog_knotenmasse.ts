import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("dr-dialog_knotenmasse")
export class drDialogKnotenmasse extends LitElement {
  @property({ type: String }) title = "neue Knotenmasse";

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
        width: 16rem;
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
    return html` <dialog id="dialog_knotenmasse">
      <h2>Neue Knotenmasse</h2>




      <p>
        M:
        <input type="number" id="id_M" name="M" pattern="[0-9.,eE+-]*" value="" />
        [t]
      </p>
      <p id=id_MY>
        θ<sub>y</sub>:
        <input type="number" id="id_thetay" name="thetay" pattern="[0-9.,eE+-]*" value="" />
        [tm²]
      </p>

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
      (shadow.getElementById("dialog_knotenmasse") as HTMLDialogElement).close("ok");
    }
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_knotenmasse") as HTMLDialogElement).close("cancel");
  }

  get_mass() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_M") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_theta_y() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_thetay") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;

  }


  set_mass(mass:number) {
    let el = this.shadowRoot?.getElementById("id_M") as HTMLInputElement;
    el.value = String(mass);
  }

  set_theta_y(theta:number) {
    let el = this.shadowRoot?.getElementById("id_thetay") as HTMLInputElement;
    el.value = String(theta);
  }


  set_system(system: number) {

    if (system === 0) {
      const shadow = this.shadowRoot;
      let el = (shadow?.getElementById("id_MY") as HTMLElement);
      el.style.display = 'block'
    } else {
      const shadow = this.shadowRoot;
      let el = (shadow?.getElementById("id_MY") as HTMLElement);
      el.style.display = 'none'
    }

  }

}
