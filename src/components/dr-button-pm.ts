import { LitElement, css, html } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

/**
 * Numeric input mit +/- Spinner-Buttons.
 *
 * Feuert ein `change`-Event (bubbles + composed), sobald sich der Wert
 * über einen der Buttons oder direkte Eingabe ändert. `event.detail.value`
 * enthält den neuen Wert.
 */
@customElement('dr-button-pm')
export class drButtonPM extends LitElement {
   /** Sichtbares Label vor dem Spinner. */
   @property({ type: String }) txt = '';

   /** id des internen <input>, z.B. für ein externes <label for="..."> */
   @property({ type: String }) inputID = '';

   @property({ type: Number }) nel = 0;
   @property({ type: Number }) minValue = 0;

   /** Optionales Maximum. `undefined` = keine Obergrenze. */
   @property({ type: Number }) maxValue?: number;

   @query('input') private _input!: HTMLInputElement;

   static override styles = css`
      :host {
         --dr-pad: 0;
         --dr-border-color-light: #d4d4d8;
         --dr-border-color-dark: #43434a;
         --dr-text-color-light: #444;
         --dr-text-color-dark: #b6b6be;
         --dr-bg-color-dark: #1a1a1e;

         --dr-border-color: var(--dr-border-color-light);
         --dr-text-color: var(--dr-text-color-light);
         --dr-bg-color: transparent;

         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol';
      }

      @media (prefers-color-scheme: dark) {
         :host {
            --dr-border-color: var(--dr-border-color-dark);
            --dr-text-color: var(--dr-text-color-dark);
            --dr-bg-color: var(--dr-bg-color-dark);
         }
      }

      .spinner {
         border: solid 1px var(--dr-border-color);
         margin: 0;
         padding: var(--dr-pad);
         width: 1.25rem;
         line-height: calc(var(--sl-input-height-medium) - 2px);
         vertical-align: middle;
      }

      .spinner:hover {
         background: lightgrey;
      }

      .spinner:disabled {
         opacity: 0.4;
         cursor: not-allowed;
         background: none;
      }

      .input_int {
         width: 3.125em;
         margin: 0;
         padding: 0;
         border-top: 1px solid var(--dr-border-color);
         border-bottom: 1px solid var(--dr-border-color);
         border-left: 0;
         border-right: 0;
         border-radius: 0;
         text-align: center;
         line-height: calc(var(--sl-input-height-medium) - 2px);
         vertical-align: middle;
         color: var(--dr-text-color);
      }

      input,
      label {
         font-size: 0.875rem;
      }

      button {
         font-size: 1em;
         border-radius: 3px;
         border-width: 1px;
         border-color: var(--dr-border-color);
         color: var(--dr-text-color);
         background-color: var(--dr-bg-color);
         padding: 0;
      }

      button:active {
         background-color: darkorange;
      }

      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
         -webkit-appearance: none;
         margin: 0;
      }

      input[type='number'] {
         -moz-appearance: textfield;
      }

      .decrement {
         border-radius: 4px 0px 0px 4px;
      }

      .increment {
         border-radius: 0px 4px 4px 0px;
      }
   `;

   /** Setzt den Wert programmatisch von außen (z.B. durch den Parent). */
   setValue(wert: number) {
      this.nel = typeof wert === 'number' && !Number.isNaN(wert) ? wert : 0;
   }

   private _clamp(value: number): number {
      let v = value;
      if (v < this.minValue) v = this.minValue;
      if (this.maxValue !== undefined && v > this.maxValue) v = this.maxValue;
      return v;
   }

   private _notifyChange() {
      this.dispatchEvent(
         new CustomEvent('change', {
            detail: { value: this.nel },
            bubbles: true,
            composed: true,
         }),
      );
   }

   private _increment() {
      const next = this._clamp(this.nel + 1);
      if (next === this.nel) return;
      this.nel = next;
      this._notifyChange();
   }

   private _decrement() {
      const next = this._clamp(this.nel - 1);
      if (next === this.nel) return;
      this.nel = next;
      this._notifyChange();
   }

   private _onInputChange() {
      this.nel = this._clamp(Number(this._input.value));
      // Falls geclampt wurde, muss das Feld synchron zum internen Wert bleiben.
      this._input.value = String(this.nel);
      this._notifyChange();
   }

   private get _atMin() {
      return this.nel <= this.minValue;
   }

   private get _atMax() {
      return this.maxValue !== undefined && this.nel >= this.maxValue;
   }

   override render() {
      return html`
         <label id="lab_nnodes" for="${this.inputID}">${this.txt}</label>

         <button
            class="spinner decrement"
            aria-label="Wert verringern"
            ?disabled="${this._atMin}"
            @click="${this._decrement}"
         >
            -
         </button
         ><input
            type="number"
            step="1"
            id="${this.inputID}"
            name="nnodes"
            class="input_int"
            .value="${String(this.nel)}"
            @change="${this._onInputChange}"
         /><button
            class="spinner increment"
            aria-label="Wert erhöhen"
            ?disabled="${this._atMax}"
            @click="${this._increment}"
         >
            +
         </button>
      `;
   }
}

declare global {
   interface HTMLElementTagNameMap {
      'dr-button-pm': drButtonPM;
   }
}
