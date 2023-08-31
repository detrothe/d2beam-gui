import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('dr-layerquerschnitt')
export class drLayerQuerSchnitt extends LitElement {
   @property({ type: String }) title = 'layered D2Beam Querschnitt';

   static get styles() {
      return css`
         input,
         label {
            font-size: 1em;
         }

         button {
            font-size: 1em;
            border-radius: 3px;
            border-width: 1px;
            border-color: #303030;
            color: #444;
            padding: 0.2em;
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
            width: 3.125em;
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
            padding: 0px;
            margin: 0px;
            width: 10em;
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
            width: 30em;
            background: #fffbf0;
            border: thin solid #e7c157;
            margin: 5em auto;
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
      return html` <dialog id="dialog">
         <h2>Eingabe des Querschnitts</h2>

         <sl-tab-group>
            <sl-tab slot="nav" panel="tab-material">Material</sl-tab>
            <sl-tab slot="nav" panel="tab-querschnitt">Querschnitt</sl-tab>
            <sl-tab slot="nav" panel="tab-stahl">Stahl</sl-tab>

            <sl-tab-panel name="tab-material">
               <table id="querschnittwerte_table">
                  <tbody>
                     <tr>
                        <td>E-Modul:</td>
                        <td><input id="emodul" type="number" /></td>
                        <td>&nbsp;[MN/m²]</td>
                     </tr>
                     <tr>
                        <td>Bettung k<sub>s</sub>:</td>
                        <td><input id="bettung" type="number" /></td>
                        <td>&nbsp;[kN/m²]</td>
                     </tr>
                     <tr>
                        <td>Wichte:</td>
                        <td><input id="wichte" type="number" /></td>
                        <td>&nbsp;[kN/m³]</td>
                     </tr>
                  </tbody>
               </table>
            </sl-tab-panel>

            <sl-tab-panel name="tab-querschnitt">
               <label for="offset">Offset: </label>
               <input id="offset" type="number" /> &nbsp;[cm] <br />
               <label for="nschichten">Anzahl Schichten: </label>
               <input id="nschichten" type="number" /><br />

               <sl-button
                  id="nschichten-dialog"
                  @click="${this._handleClick_schichten_dialog}"
                  >ändere Anzahl Schichten</sl-button
               >
               <dr-tabelle id="nzlayer"></dr-tabelle>
            </sl-tab-panel>

            <sl-tab-panel name="tab-stahl">Tab panel Stahl </sl-tab-panel>
         </sl-tab-group>

         <form method="dialog">
            <sl-button
               id="Anmeldung"
               value="anmelden"
               @click="${this._dialog_ok}"
               >Anmelden</sl-button
            >
            <sl-button id="Abbruch" @click="${this._dialog_abbruch}"
               >Abbrechen</sl-button
            >
         </form>
      </dialog>`;
   }

   _dialog_ok() {
      console.log('dialog_ok');
      const shadow = this.shadowRoot;
      if (shadow) {
         console.log(
            'email: ',
            (shadow.getElementById('email') as HTMLInputElement).value
         );
         (shadow.getElementById('dialog') as HTMLDialogElement).close();
      }
   }

   _dialog_abbruch() {
      console.log('dialog_abbruch');
      const shadow = this.shadowRoot;
      if (shadow)
         (shadow.getElementById('dialog') as HTMLDialogElement).close();
   }

   _handleClick_schichten_dialog() {
      console.log('handleClick_schichten_dialog()');

      const shadow = this.shadowRoot;
      if (shadow) {
         const el = shadow.getElementById('nschichten') as HTMLInputElement;
         console.log("el nschichten",el.value)

         const el1 = shadow.getElementById('nzlayer');
         console.log('EL: >>', el1);
         el1?.setAttribute('nzeilen', el.value);
      }


   }
}

