import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('dr-rechteckquerschnitt')
export class drRechteckQuerSchnitt extends LitElement {
   @property({ type: String }) title = 'D2Beam RechteckQuerschnitt';

   static get styles() {
      return css`
         input,
         label {
            font-size: 1em;
            width: 6em;
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
            padding: 2px;
            margin: 3px;
            width: 6em;
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
      return html` <dialog id="dialog_rechteck">
         <h2>Eingabe des Querschnitts mit Querschnittswerten</h2>

         <table id="querschnittwerte_table">
            <tbody>
               <tr>
                  <td>Name (wichtig):</td>
                  <td colspan="2">
                     <input id="qname" type="txt" style="width:95%;" value='Rechteck' />
                  </td>
               </tr>
               <tr>
                  <td>E-Modul:</td>
                  <td><input id="emodul" type="number" value='30000'/></td>
                  <td>&nbsp;[MN/m²]</td>
               </tr>
               <tr>
                  <td>I<sub>y</sub>:</td>
                  <td><input id="traeg_y" type="number" value='160000'/></td>
                  <td>&nbsp;[cm<sup>4</sup>]</td>
               </tr>
               <tr>
                  <td>A:</td>
                  <td><input id="area" type="number" value='1200'/></td>
                  <td>&nbsp;[cm²]</td>
               </tr>
               <tr>
                  <td>Querschnittshöhe:</td>
                  <td><input id="height" type="number" value='40'/></td>
                  <td>&nbsp;[cm]</td>
               </tr>
               <tr>
                  <td>Bettung k<sub>s</sub>:</td>
                  <td><input id="bettung" type="number" value='0' /></td>
                  <td>&nbsp;[kN/m²]</td>
               </tr>
               <tr>
                  <td>Wichte:</td>
                  <td><input id="wichte" type="number" value='0'/></td>
                  <td>&nbsp;[kN/m³]</td>
               </tr>
               <tr>
                  <td>Schubfaktor:</td>
                  <td><input id="schubfaktor" type="number" value='0.833'/></td>
                  <td>&nbsp;[-]</td>
               </tr>
               <tr>
                  <td>Querdehnzahl:</td>
                  <td><input id="querdehnzahl" type="number" value='0.3'/></td>
                  <td>&nbsp;[-]</td>
               </tr>
            </tbody>
         </table>

         <form method="dialog">
            <sl-button
               id="Anmeldung"
               value="ok"
               @click="${this._dialog_ok}"
               >ok</sl-button
            >
            <sl-button id="Abbruch" value='cancel' @click="${this._dialog_abbruch}"
               >Abbrechen</sl-button
            >
         </form>
      </dialog>`;
   }

   _dialog_ok() {
      console.log('dialog_ok');
      const shadow = this.shadowRoot;
      if (shadow) {
         //console.log(
         //   'email: ',
         //   (shadow.getElementById('email') as HTMLInputElement).value
         //);


         (
            shadow.getElementById('dialog_rechteck') as HTMLDialogElement
         ).close('ok');
      }
   }

   _dialog_abbruch() {
      console.log('dialog_abbruch');
      const shadow = this.shadowRoot;
      if (shadow)
         (
            shadow.getElementById('dialog_rechteck') as HTMLDialogElement
         ).close('cancel');
   }
}

