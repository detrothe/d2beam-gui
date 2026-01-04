import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { msg, localized, updateWhenLocaleChanges } from '@lit/localize';

import { SlCheckbox } from '@shoelace-style/shoelace';

@localized()
@customElement('dr-control-panel')
export class drControlPanel extends LitElement {

    show_main = true;

    static get styles() {
        return css`
         #control_panel {
            margin: 1;
            padding: 1;
            font-size: 1rem;
            background-color: #fbd603;
            border: 2px;
            color: red;
            z-index: 90;
         }

         .container {
            /* height:100vh; */

            display: grid;
            grid-template-columns: auto auto auto;
         }
         header {
            background: tomato;
            grid-column-start: 1;
            grid-column-end: 4;
            padding: 5px;
         }
         .container div {
            background: gold;
            padding: 5px;
         }
         .item1 {
            grid-column-start: 1;
            grid-column-end: 3;
         }

         .zeile {
            margin: 0px;
         }

         button {
            color: black;
            background-color: transparent;
            border: 0px;
            font-size: 1rem;
         }

         button:hover {
            color: yellow;
         }
      `;
    }

    constructor() {
        super();
        updateWhenLocaleChanges(this);
    }

    //----------------------------------------------------------------------------------------------

    render() {
        return html`
         <div class="container">
            <header><button @click="${this._click_header}">Control</button></header>

            <div class="item1 zeile">Beschriftung</div>
            <div class='zeile'><sl-checkbox id="id_beschriftung" @click="${this._checkbox_beschriftung}"></sl-checkbox></div>
            <div class="item1 zeile">Systemlinien</div>
            <div class='zeile'><sl-checkbox checked id="id_systemlinien" @click="${this._checkbox_systemlinien}"></sl-checkbox></div>
            <div class="item1 zeile">Verformungen</div>
            <div class='zeile'><sl-checkbox id="id_verformungen" @click="${this._checkbox_verformungen}"></sl-checkbox></div>

             <header>Optionen</header>
         </div>
      `;
    }

    _click_header() {
        console.log("_click_header()")
        let elall = this.shadowRoot?.querySelectorAll(".zeile")
        //let el = document.getElementsByClassName('.item1')
        //console.log("selector", elall)
        if (elall) {
            for (let el of elall) {
                //console.log(el);
                if (this.show_main) {
                    (el as HTMLElement).style.display = 'none'
                } else {
                    (el as HTMLElement).style.display = 'block'
                }
            }
            this.show_main = !this.show_main;
        }
    }

    _checkbox_beschriftung() {
        let el = this.shadowRoot?.getElementById('id_beschriftung') as SlCheckbox;
        if (el.checked) {
            window.dispatchEvent(new Event("draw_label_grafik"));
        }
    }

    _checkbox_systemlinien() {
        let el = this.shadowRoot?.getElementById('id_systemlinien') as SlCheckbox;
        if (el.checked) {
            window.dispatchEvent(new Event("draw_systemlinien_grafik"));
        }
    }
    _checkbox_verformungen() {
        let el = this.shadowRoot?.getElementById('id_verformungen') as SlCheckbox;
        if (el.checked) {
            window.dispatchEvent(new Event("draw_verformungen_grafik"));
        }
    }
}

