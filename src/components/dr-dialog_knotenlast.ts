import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

import '../styles/dr-dialog.css';
import { SlCheckbox } from '@shoelace-style/shoelace';

@localized()
@customElement('dr-dialog_knotenlast')
export class drDialogKnotenlast extends LitElement {
   @property({ type: String }) title = 'neue Knotenlast';

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
            width: 16rem;
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
      return html` <dialog id="dialog_knotenlast">
         <h2>${msg('Knotenlast')}</h2>

         <div id="id_div_nur_lastfall">
            <p>
               <sl-checkbox id="id_nur_lastfall" @sl-change="${this._handleChange}">${msg('nur Lastfall ändern')}</sl-checkbox>
            </p>
         </div>

         <table>
            <tbody>
               <tr>
                  <td>${msg('Lastfall :')}</td>
                  <td><input type="number" id="id_lf" name="lf" pattern="[0-9.,eE+-]*" value="1" /></td>
               </tr>
            </tbody>
         </table>

         <table id="id_einstellungen_table">
            <tbody>
               <tr>
                  <td title=${msg('Winkel im Gegenuhrzeigersinn positiv')}>alpha :</td>
                  <td><input type="number" id="id_alpha" name="alpha" pattern="[0-9.,eE+-]*" value="0.0" />[°]</td>
               </tr>
               <tr>
                  <td>P<sub>x'</sub> :</td>
                  <td><input type="number" id="id_px" name="px" pattern="[0-9.,eE+-]*" value="" /> [kN]</td>
               </tr>
               <tr>
                  <td>P<sub>z'</sub> :</td>
                  <td><input type="number" id="id_pz" name="pz" pattern="[0-9.,eE+-]*" value="" /> [kN]</td>
               </tr>

               <tr id="id_MY">
                  <td>M<sub>y</sub> :</td>
                  <td><input type="number" id="id_my" name="my" pattern="[0-9.,eE+-]*" value="" /> [kNm]</td>
               </tr>
            </tbody>
         </table>
         <form method="dialog">
            <!--<sl-button id="Anwenden" value="anwenden" @click="${this._dialog_anwenden}">Anwenden</sl-button> -->
            <sl-button id="Anmeldung" value="ok" @click="${this._dialog_ok}">${msg('ok')}</sl-button>
            <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">${msg('Abbrechen')}</sl-button>
         </form>
      </dialog>`;
   }

   _dialog_anwenden() {
      console.log('dialog_anwenden');
      const shadow = this.shadowRoot;
      if (shadow) {
         window.dispatchEvent(new Event('draw_cad_knoten'));
      }
   }

   _dialog_ok() {
      console.log('dialog_ok');
      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow.getElementById('dialog_knotenlast') as HTMLDialogElement).close('ok');
      }
   }

   _dialog_abbruch() {
      console.log('dialog_abbruch');
      const shadow = this.shadowRoot;
      if (shadow) (shadow.getElementById('dialog_knotenlast') as HTMLDialogElement).close('cancel');
   }

   get_lastfall() {
      let el = this.shadowRoot?.getElementById('id_lf') as HTMLInputElement;
      return Number(el.value);
   }

   set_lastfall(wert: number) {
      let el = this.shadowRoot?.getElementById('id_lf') as HTMLInputElement;
      el.value = String(wert);
   }

   get_Px() {
      const shadow = this.shadowRoot;
      //console.log("id_px", (shadow?.getElementById("id_px") as HTMLInputElement).value);
      let wert = Number((shadow?.getElementById('id_px') as HTMLInputElement).value.replace(/,/g, '.'));
      return wert;
   }

   get_Pz() {
      const shadow = this.shadowRoot;
      // console.log("id_pz", (shadow?.getElementById("id_pz") as HTMLInputElement).value);
      let wert = Number((shadow?.getElementById('id_pz') as HTMLInputElement).value.replace(/,/g, '.'));
      return wert;
   }
   get_My() {
      const shadow = this.shadowRoot;
      // console.log("id_my", (shadow?.getElementById("id_my") as HTMLInputElement).value);
      let wert = Number((shadow?.getElementById('id_my') as HTMLInputElement).value.replace(/,/g, '.'));
      return wert;
   }

   set_Px(Px: number) {
      let el = this.shadowRoot?.getElementById('id_px') as HTMLInputElement;
      el.value = String(Px);
   }

   set_Pz(Pz: number) {
      let el = this.shadowRoot?.getElementById('id_pz') as HTMLInputElement;
      el.value = String(Pz);
   }

   set_My(My: number) {
      let el = this.shadowRoot?.getElementById('id_my') as HTMLInputElement;
      el.value = String(My);
   }

   set_alpha(alpha: number) {
      let el = this.shadowRoot?.getElementById('id_alpha') as HTMLInputElement;
      el.value = String(alpha);
   }

   get_alpha() {
      const shadow = this.shadowRoot;
      let wert = Number((shadow?.getElementById('id_alpha') as HTMLInputElement).value.replace(/,/g, '.'));
      return wert;
   }

   set_system(system: number) {
      const shadow = this.shadowRoot;
      let el = shadow?.getElementById('id_MY') as HTMLTableRowElement;

      if (system === 0) {
         el.style.display = 'table-row';
      } else {
         el.style.display = 'none';
      }
   }

   set_nur_lastfall(show_div_nur_lastfall: boolean) {
      let elt = this.shadowRoot?.getElementById('id_einstellungen_table') as HTMLTableElement;
      elt.style.display = 'block';

      let el = this.shadowRoot?.getElementById('id_div_nur_lastfall') as HTMLDivElement;
      if (show_div_nur_lastfall) {
         el.style.display = 'block';
         (this.shadowRoot?.getElementById('id_nur_lastfall') as SlCheckbox).checked = false;
      } else {
         el.style.display = 'none';
      }
   }

   get_nur_lastfall() {
      let el = this.shadowRoot?.getElementById('id_nur_lastfall') as SlCheckbox;
      return el.checked;
   }

   _handleChange() {
      let el = this.shadowRoot?.getElementById('id_einstellungen_table') as HTMLTableElement;

      let wert = (this.shadowRoot?.getElementById('id_nur_lastfall') as SlCheckbox).checked;
      //console.log('checked changed ', wert);
      if (wert) {
         el.style.display = 'none';
      } else {
         el.style.display = 'block';
      }
   }
}
