import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { msg, localized, updateWhenLocaleChanges } from '@lit/localize';

@localized()
@customElement('dr-control-panel')
export class drControlPanel extends LitElement {

    static get styles() {
        return css`
            div {
            margin: 1;
            padding: 1;
            font-size: 1rem;
            background-color:'#ff0000';
            border:2px;
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
         <div id="control_panel">
             <h2>${msg('Control Panel')}</h2>
<br> noch ne Zeile
         </div>`;
    }

}