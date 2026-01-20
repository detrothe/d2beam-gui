import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

import '../styles/dr-dialog.css';
import { SlCheckbox, SlRadioGroup, SlSelect } from '@shoelace-style/shoelace';

import '../components/dr-dialog_kopieren';

@localized()
@customElement('dr-dialog_kopieren')
export class drDialogKopieren extends LitElement {
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
    return html` <dialog id="dialog_kopieren">
         <h2>selektierte Elemente kopieren</h2>

         <p>
            Anzahl der Kopien :
            <input type="number" id="id_ncopies" name="copy" pattern="[0-9.,eE+-]*" value="1" />
         </p>

         <sl-radio-group id="id_typ" label="Wähle eine Option für Kopiervektor" name="a" value="1" @sl-change="${this._handleChange}">
            <sl-radio value="0">Eingabe von dx,dz</sl-radio>
            <sl-radio id="id_typ_einzellasten" value="1">grafische Eingabe des Vektors</sl-radio>
         </sl-radio-group>

         <div id="id_div" style="display: none;">
            <p>
               dx :
               <input type="number" id="id_dx" name="dx" pattern="[0-9.,eE+-]*" value="" /> &nbsp;m
            </p>
            <p>
               dz :
               <input type="number" id="id_dz" name="dz" pattern="[0-9.,eE+-]*" value="" /> &nbsp;m
            </p>
         </div>
         <p>
            <sl-checkbox id="id_copy_eload">Elementlasten mitkopieren</sl-checkbox>
         </p>

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
      (shadow.getElementById('dialog_kopieren') as HTMLDialogElement).close('ok');
    }
  }

  _dialog_abbruch() {
    console.log('dialog_abbruch');
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById('dialog_kopieren') as HTMLDialogElement).close('cancel');
  }

  get_copy_eload(): boolean {
    let el = this.shadowRoot?.getElementById('id_copy_eload') as SlCheckbox;
    return el.checked;
  }

  set_copy_eload(wert: boolean) {
    let el = this.shadowRoot?.getElementById('id_copy_eload') as SlCheckbox;
    el.checked = wert;
  }

  get_ncopies() {
    let el = this.shadowRoot?.getElementById('id_ncopies') as HTMLInputElement;
    return Number(el.value);
  }

  set_ncopies(wert: number) {
    let el = this.shadowRoot?.getElementById('id_ncopies') as HTMLInputElement;
    el.value = String(wert);
  }

  get_dx() {
    let el = this.shadowRoot?.getElementById('id_dx') as HTMLInputElement;
    return Number(el.value);
  }

  set_dx(wert: number) {
    let el = this.shadowRoot?.getElementById('id_dx') as HTMLInputElement;
    el.value = String(wert);
  }

  get_dz() {
    let el = this.shadowRoot?.getElementById('id_dz') as HTMLInputElement;
    return Number(el.value);
  }

  set_dz(wert: number) {
    let el = this.shadowRoot?.getElementById('id_dz') as HTMLInputElement;
    el.value = String(wert);
  }

  get_option() {
    let el = this.shadowRoot?.getElementById('id_typ') as SlRadioGroup;
    return Number(el.value);
  }

  set_option(wert: number) {
    let el = this.shadowRoot?.getElementById('id_typ') as SlRadioGroup;
    el.value = String(wert);
  }

  _handleChange() {
    console.log('_handleChange');

    let wert = (this.shadowRoot?.getElementById('id_typ') as SlRadioGroup).value;
    console.log('id_radio_group ', wert);

    if (wert === '0') {
      let el = this.shadowRoot?.getElementById('id_div') as HTMLDivElement;
      el.style.display = 'block';
    } else if (wert === '1') {
      let el = this.shadowRoot?.getElementById('id_div') as HTMLDivElement;
      el.style.display = 'none';
    }

    this.shadowRoot?.getElementById('OK')?.focus();
  }
}
