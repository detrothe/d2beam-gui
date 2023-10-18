import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('dr-button-pm')
export class drButtonPM extends LitElement {
   @property({ type: String }) title = 'Button with counter';

   @property({ type: Boolean }) enableBack: boolean = false;
   @property({
      // only update for odd values of newVal.
      // @ts-ignore
      hasChanged(newVal: number, oldVal: number) {
         //console.log(`nel has changed ${newVal}, ${oldVal}`);
         return true;
      },
   })
   nel = 0;
   @property({ type: String }) inputID = '';
   @property({ type: String }) txt = '';
   @property({ type: Number }) minValue = 0;

   static get styles() {
      return css`
         :host {
            --dr-pad: 0;
            --color-border: #d4d4d8;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
         }

         input,
         label {
            font-size: 0.875rem;       }

         button {
            font-size: 1em;
            border-radius: 3px;
            border-width: 1px;
            border-color: #303030;
            color: #444;
            padding: 0em; /* 0.2em;*/
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
            padding: 0; /*1px;*/
            border-top: 1px solid var(--color-border);
            border-bottom: 1px solid var(--color-border);
            border-left: 0;
            border-right: 0;
            border-radius: 0;
            text-align: center;
            line-height: calc(var(--sl-input-height-medium) - 2px);
            vertical-align: middle;
         }

         .spinner {
            border: solid 1px var(--color-border);
            margin: 0;
            padding: var(--dr-pad); /*1px;*/
            width: 1.25rem; /* 1em;*/
            line-height: calc(var(--sl-input-height-medium) - 2px);
            vertical-align: middle;
         }

         .spinner:hover {
            background: lightgrey;
         }

         .decrement {
            /*.decrement*/
            border-radius: 4px 0px 0px 4px;
            color: #000000;
         }

         .increment {
            /*.increment*/
            border-radius: 0px 4px 4px 0px;
            color: #000000;
         }
      `;
   }

   constructor() {
      super();
   }

   setValue(wert: number) {
      //console.log("in setValue", wert)
      if (typeof wert == 'number') this.nel = wert;
      else this.nel = 0;

      const shadow = this.shadowRoot;
      if (shadow) {
         (shadow.getElementById(this.inputID) as HTMLInputElement).value =
            String(this.nel);
      }
   }

   async firstUpdated() {
      console.log('inputID', this.inputID);
      //document.getElementById('id_input_node_incr').addEventListener('click', increment_nnodes, false);
      //document.getElementById('id_input_node_dec').addEventListener('click', decrement_nnodes, false);
   }

   //----------------------------------------------------------------------------------------------

   _increment_nnodes() {
      this.nel++;
      console.log('_increment_nnodes', this.nel);
      const shadow = this.shadowRoot;
      if (shadow)
         (shadow.getElementById(this.inputID) as HTMLInputElement).value =
            String(this.nel);
      //input_nodes.value = this.nel;
      //set_InfosNeueBerechnungErforderlich()
   }

   //----------------------------------------------------------------------------------------------
   _decrement_nnodes() {
      if (this.nel > this.minValue) {
         this.nel--;
         //console.log('_decrement_nnodes', this.nel);
         const shadow = this.shadowRoot;
         if (shadow) {
            //console.log("id:",shadow.getElementById(this.inputID));
            (shadow.getElementById(this.inputID) as HTMLInputElement).value =
               String(this.nel);
         }
      }
      //input_nodes.value = this.nel;
      //set_InfosNeueBerechnungErforderlich()
   }

   //----------------------------------------------------------------------------------------------
   _valueChanged() {
      const shadow = this.shadowRoot;
      if (shadow) {
         let value = (shadow.getElementById(this.inputID) as HTMLInputElement)
            .value;
         console.log('VALUE  CHANGED', value);
         this.nel = Number(value);
      }

      //set_InfosNeueBerechnungErforderlich()
   }
   //----------------------------------------------------------------------------------------------

   render() {
      return html`
         <label id="lab_nnodes">${this.txt}</label>

         <button
            id="id_input_node_dec"
            class="spinner decrement"
            @click="${this._decrement_nnodes}"
         >
            -</button
         ><input
            type="number"
            step="1"
            id="${this.inputID}"
            name="nnodes"
            class="input_int"
            value="${this.nel}"
            @change="${this._valueChanged}"
         /><button
            id="id_input_node_incr"
            class="spinner increment"
            @click="${this._increment_nnodes}"
         >
            +
         </button>
      `;
   }
}

