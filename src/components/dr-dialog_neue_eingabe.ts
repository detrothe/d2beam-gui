import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('dr-dialog_neue_eingabe')
export class drDialogNeueEingabe extends LitElement {
   @property({ type: String }) title = 'neue Eingabe';


   static get styles() {
      return css`
         input,
         label {
            font-size: 1rem;
            width: 6rem;
         }

         button {
            font-size: 1rem;
            border-radius: 3px;
            border-width: 1px;
            border-color: #303030;
            color: #444;
            padding: 1rem;  /*0.2em;*/
         }

         button:active {
            background-color: darkorange;
         }
         input[type='number']::-webkit-inner-spin-button,
         input[type='number']::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
         }

         /* Firefox */
         input[type='number'] {
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
            width: 30rem;
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
      return html` <dialog id="dialog_neue_eingabe">
         <h2>neue Eingabe</h2>

         <p>Hinweis: Alle Eingaben werden gelöscht.</p>
         <p>Die Tabellengrößen können später jederzeit mit den Buttons, die sich oberhalb der Tabellen befinden, geändert werden.<br>
         Nach den Änderungen ist eine Neuberechnung erforderlich</p>

         <form method="dialog">
            <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}"
               >ok</sl-button
            >
            <sl-button
               id="Abbruch"
               value="cancel"
               @click="${this._dialog_abbruch}"
               >Abbrechen</sl-button
            >
         </form>
      </dialog>`;
   }

   _dialog_ok() {
      console.log('dialog_ok');
      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow.getElementById('dialog_neue_eingabe') as HTMLDialogElement).close(
            'ok'
         );
      }
   }

   _dialog_abbruch() {
      console.log('dialog_abbruch');
      const shadow = this.shadowRoot;
      if (shadow)
         (shadow.getElementById('dialog_neue_eingabe') as HTMLDialogElement).close(
            'cancel'
         );
   }
}

