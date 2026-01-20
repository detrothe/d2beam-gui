import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

import '../styles/dr-dialog.css';
import { SlCheckbox, SlRadioGroup, SlSelect } from '@shoelace-style/shoelace';

@localized()
@customElement('dr-dialog_edit_selected_elementlasten')
export class drDialogEdit_selected_elementlasten extends LitElement {
   @property({ type: String }) title = 'Kopieren';

   /* @property({ type: Number }) xValue = 0; */

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
            color: black;
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
      return html` <dialog id="dialog_edit_selected_elementloads">
         <h2>editiere selektierte Elementlasten</h2>

         <sl-radio-group id="id_option" label="Wähle eine Option" name="a" value="0" @sl-change="${this._handleChange}">
            <sl-radio value="0">nur Lastfall ändern</sl-radio>
            <sl-radio value="1">Streckenlasten ändern</sl-radio>
            <sl-radio value="2">alles ändern</sl-radio>
         </sl-radio-group>

         <div id="id_div" style="display: none;">
            <p>
               neuer Lastfall :
               <input type="number" id="id_lf" name="lf" pattern="[0-9]*" value="1" /> &nbsp;
            </p>
         </div>

         <div id="id_div_p" style="display: none;">
            <p>
               p<sub>a</sub>
               <input type="number" id="id_pa" name="pa" pattern="[0-9.,eE+-]*" value="" />
               [kN/m]<br />
               p<sub>e</sub>
               <input type="number" id="id_pe" name="pa" pattern="[0-9.,eE+-]*" value="" />
               [kN/m]
            </p>
         </div>
         <br />

         <form method="dialog">
            <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}">ok</sl-button>
            <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">Abbrechen</sl-button>
         </form>
      </dialog>`;
   }

   _dialog_ok() {
      console.log('dialog_ok');
      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow.getElementById('dialog_edit_selected_elementloads') as HTMLDialogElement).close('ok');
      }
   }

   _dialog_abbruch() {
      console.log('dialog_abbruch');
      const shadow = this.shadowRoot;
      if (shadow) (shadow.getElementById('dialog_edit_selected_elementloads') as HTMLDialogElement).close('cancel');
   }

   get_lastfall(): number {
      let el = this.shadowRoot?.getElementById('id_lf') as HTMLInputElement;
      return Number(el.value);
   }

   set_lastfall(wert: number) {
      let el = this.shadowRoot?.getElementById('id_lf') as HTMLInputElement;
      el.value = String(wert);
   }

   get_option() {
      let el = this.shadowRoot?.getElementById('id_option') as SlRadioGroup;
      return Number(el.value);
   }

   set_option(wert: number) {
      let el = this.shadowRoot?.getElementById('id_option') as SlRadioGroup;
      el.value = String(wert);
   }


   get_pa() {
      const shadow = this.shadowRoot;
      //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
      let wert = Number((shadow?.getElementById("id_pa") as HTMLInputElement).value.replace(/,/g, "."));
      return wert;
   }
   get_pe() {
      const shadow = this.shadowRoot;
      let wert = Number((shadow?.getElementById("id_pe") as HTMLInputElement).value.replace(/,/g, "."));
      return wert;
   }

   set_pa(wert: number) {
      let el = this.shadowRoot?.getElementById("id_pa") as HTMLInputElement;
      el.value = String(wert);
   }
   set_pe(wert: number) {
      let el = this.shadowRoot?.getElementById("id_pe") as HTMLInputElement;
      el.value = String(wert);
   }

   _handleChange() {
      //console.log('_handleChange');

      let wert = (this.shadowRoot?.getElementById('id_option') as SlRadioGroup).value;
      //console.log('id_radio_group ', wert);

      let el = this.shadowRoot?.getElementById('id_div') as HTMLDivElement;
      el.style.display = 'none';
      el = this.shadowRoot?.getElementById('id_div_p') as HTMLDivElement;
      el.style.display = 'none';

      if (wert === '0') {
         let el = this.shadowRoot?.getElementById('id_div') as HTMLDivElement;
         el.style.display = 'block';
      } else if (wert === '1') {
         let el = this.shadowRoot?.getElementById('id_div_p') as HTMLDivElement;
         el.style.display = 'block';
      }

      this.shadowRoot?.getElementById('OK')?.focus();
   }
}
