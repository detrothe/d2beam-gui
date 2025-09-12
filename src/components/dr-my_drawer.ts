import { SlCheckbox } from '@shoelace-style/shoelace';
import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '../styles/dr-dialog.css';
import '../components/dr-drawer_1';
import { set_hide_drawer } from '../pages/cad_buttons';

@customElement('dr-my_drawer')
export class drMyDrawer extends LitElement {
   @property({ type: String }) title = 'Drawer';

   @property({ type: Number }) xValue = 0;

   sticky = false;

   static get styles() {
      return css`
         /* :host {
            --svg-color: red;
         } */
         input,
         label {
            font-size: 1rem;
            width: 6rem;
         }

         p,
         h2 {
            color: white;
            margin-left: 0.5rem;
         }

         button,
         select {
            font-size: 0.875rem;
            border-radius: 4px;
            border-width: 0px;
            padding: 0.4rem;
         }

         /* @media (prefers-color-scheme: dark) {
            svg {
               fill: white;
            }

            button,
            select {
               border-color: #43434a;
               color: #b6b6be;
               background-color: #1a1a1e;
            }
         }

         @media (prefers-color-scheme: light) {
            svg {
               fill: black;
            }

            button,
            select {
               border-color: #303030;
               color: #444;
            }
         } */

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

         /* Festlegung im Default-Stylesheet der Browser */
         dialog:not([open]) {
            display: none;
         }

         /* Styling der geöffneten Popup-Box */
         dialog[open] {
            min-width: 25rem;
            max-width: 40rem;
            max-height: 100%;
            background: light-dark(var(--dialog-open-light), var(--dialog-open-dark));
            border: thin solid #e7c157;
            margin: auto;
            overflow-y: auto;
            font-size: 1rem;
            max-height: 90vh;
         }

         dialog::backdrop {
            background: hsl(201 50% 40% /0.5);
         }

         .class_div_drawer {
            margin: 0.3rem;
            /* overflow-y: auto; */
         }

         svg {
            fill: white;
         }
         button {
               border-color: #43434a;
               color: #b6b6be;
               background-color:rgb(90, 90, 90);
            }
      `;
   }

   constructor() {
      super();
   }

   //----------------------------------------------------------------------------------------------

   render() {
      return html`

      <button   @click="${this._sticky}">
            <svg width="1rem" height="1rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 3c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm2 2v12h16V5H2zm8 3l4 5H6l4-5z"/></svg>
      </button>
      <button style="float: right;" @click="${this._div_ok}">
         <svg  width="1rem" height="1rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z"/></svg>
      </button>

      <p><b>Mehr Aktivitäten</b></p>
      <div class='class_div_drawer' id="div_drawer">
          <dr-drawer_1 id="id_drawer_1"></dr-drawer_1>
      </div>
      <footer>
         <sl-button id="OK" value="ok" @click="${this._div_ok}">close</sl-button>
      </footer>
      `;
   }

   _div_ok() {
      console.log('div_drawer_ok');
      const shadow = this.shadowRoot;
      const el = document.querySelector('.class-my-drawer') as HTMLElement;
      console.log('class-my-drawer', el);
      el.style.display = 'none';
      this.sticky = false;
      set_hide_drawer(true);
      // if (shadow) {
      //    (shadow.getElementById('div_drawer') as HTMLDialogElement).close('ok');
      // }
   }

   _sticky() {
      this.sticky = true;
      set_hide_drawer(false);
   }

   hide() {
      this.style.display = 'none';
   }
}
