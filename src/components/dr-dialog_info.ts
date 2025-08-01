import { SlCheckbox } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";

import '../styles/dr-dialog.css';

@customElement("dr-dialog_info")
export class drDialogInfo extends LitElement {
  @property({ type: String }) title = "Informationen";

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
      dialog:not([open]) {
        display: none;
      }

      /* Styling der geöffneten Popup-Box */
      dialog[open] {
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
      }
    `;
  }

  constructor() {
    super();
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html` <dialog id="dialog_info">
      <h2>Kurzinformationen GUI</h2>

      <p>
        <b>Eingabe mit dem Finger bei einem Touchscreen</b><br />
        Um exakte Eingaben zu ermöglichen, befindet sich der Eingabecursor neben dem Finger. Platziere den Eingabefinger auf dem Screen und bewege
        den <b>Cursor</b> zu der gewünschten Stelle, und hebe dann den Finger vom Screen ab. Das Anheben des Fingers hat hier die
        gleiche Funktion wie das Drücken der linken Maustaste. Wird, wie bei der Eingabe des Stabendes, eine weitere Eingabe erforderlich, dann ist
        der Finger wieder auf den Bildschirm zu setzen und den Cursor an die gewünschte Stelle zu bewegen. Das erneute
        Anheben beendet die Eingabe. Den Abstand und die Lage (Vorzeichen) des Cursors vom Finger kannst du unter <i>Einstellungen GUI</i> ändern.
      </p>
      <p>
        <b>Knoteneingabe und Rasterlinien</b><br />
        Die Eingabe von Knoten über den Dialog ist nicht zwingend erforderlich. Bei der Eingabe von Stabanfang und -ende wird zuerst nach einem
        vorhandenen Knoten innerhalb der Fangweite (Die Linienlängen des Cursors geben das Fangfenster an.) gesucht. Wird kein
        Knoten gefunden, wird der nächste Rasterpunkt (Schnittpunkt der Rasterlinien) gewählt, sofern er innerhalb des Fangfensters des Cursors liegt.
        Ein gefundener Rasterpunkt wird als blaues Rechteck angezeigt. Andernfalls werden die Koordinaten des Cursors genommen.
        Der Abstand der Rasterlinien kann unter <i>Einstellungen GUI</i> ändert werden.
      </p>
      <p>
        <b>Rasterbereich</b><br />
        Der unter <i>Einstellungen GUI</i> einstellbare Rasterbereich dient nur zur Orientierung bei der Eingabe. Im Normalfall wird er so eingestellt, dass das gesamte System darin dargestellt werden kann.
      </p>
      <p>Weitere Informationen zur grafischen Eingabe findest du im Tab Info.</p>

      <form method="dialog">
        <sl-button id="OK" value="ok" @click="${this._dialog_ok}">ok</sl-button>
      </form>
    </dialog>`;
  }

  _dialog_ok() {
    console.log("dialog_ok");
    const shadow = this.shadowRoot;
    if (shadow) {
      (shadow.getElementById("dialog_info") as HTMLDialogElement).close("ok");
    }
  }
}
