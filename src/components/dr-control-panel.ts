import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { msg, localized, updateWhenLocaleChanges } from '@lit/localize';

import { SlCheckbox, SlRange } from '@shoelace-style/shoelace';
import { boolFromUnknown } from '@tweakpane/core';


let scale_factor = 1.0;
let scale_factor_arrows = 1.0;

export const draw_sg = {
    My: true,
    Vz: true,
    N: true
}

export let draw_group = false;

let controller_N: any
let controller_V: any
let controller_M: any
@localized()
@customElement('dr-control-panel')
export class drControlPanel extends LitElement {
    show_main = true;
    show_dynamik = true;
    show_optionen = true;

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
            grid-template-columns: auto auto 5rem;
         }
         header {
            background: tomato;
            grid-column-start: 1;
            grid-column-end: 4;
            padding: 5px;
            text-align:left;
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

         .zeile_optionen {
            margin: 0px;
         }

         .zeile_dynamik {
            margin: 0px;
         }

         button {
            width: 100%;
            color: black;
            background-color: transparent;
            border: 0px;
            font-size: 1rem;
            text-align:left;
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
            <header>
               <button @click="${this._click_header}" id="id_header_button">
                  <svg
                     version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                     x="0px" y="0px" width="1rem" height="1rem" viewBox="0 0 100 100"
                     style="enable-background:new 0 0 100 100;"
                     xml:space="preserve"
                  >
                     <g>
                        <polygon
                           points="38,83 5,50 11.9,43 38,69.1 64.1,43 71,50 	"
                        />
                     </g>
                  </svg>
                  Control
               </button>
            </header>

            <div class="item1 zeile">Beschriftung</div>
            <div class="zeile">
               <sl-checkbox
                  id="id_beschriftung"
                  @sl-change="${this._checkbox_beschriftung}"
               ></sl-checkbox>
            </div>

            <div class="item1 zeile">Systemlinien</div>
            <div class="zeile">
               <sl-checkbox
                  checked
                  id="id_systemlinien"
                  @sl-change="${this._checkbox_systemlinien}"
               ></sl-checkbox>
            </div>

            <div class="item1 zeile">Verformungen</div>
            <div class="zeile">
               <sl-checkbox
                  id="id_verformungen"
                  @sl-change="${this._checkbox_verformungen}"
               ></sl-checkbox>
            </div>

            <div class="item1 zeile">Normalkraft</div>
            <div class="zeile">
               <sl-checkbox
                  id="id_normalkraft"
                  @sl-change="${this._checkbox_normalkraft}"
               ></sl-checkbox>
            </div>

            <div class="item1 zeile">Querkraft</div>
            <div class="zeile">
               <sl-checkbox
                  id="id_querkraft"
                  @sl-change="${this._checkbox_querkraft}"
               ></sl-checkbox>
            </div>

            <div class="item1 zeile">Moment</div>
            <div class="zeile">
               <sl-checkbox id="id_moment" @sl-change="${this._checkbox_moment}"></sl-checkbox>
            </div>

            <div class="item1 zeile">Knickfigur</div>
            <div class="zeile">
               <sl-checkbox id="id_knickfigur" @sl-change="${this._checkbox_knickfigur}"></sl-checkbox>
            </div>

            <div class="item1 zeile">Schiefstellung</div>
            <div class="zeile">
               <sl-checkbox id="id_schiefstellung" @sl-change="${this._checkbox_schiefstellung}"></sl-checkbox>
            </div>

            <div class="item1 zeile">Stabvorverformung</div>
            <div class="zeile">
               <sl-checkbox id="id_stabvorverformung" @sl-change="${this._checkbox_stabvorverformung}"></sl-checkbox>
            </div>

            <div class="item1 zeile">Skalierung</div>
            <div class="zeile">
               <sl-range min="0.1" max="2.5" step="0.1" value="1.0" id="id_skalierung" @sl-change="${this._range_skalierung}"></sl-range>
            </div>

            <div class="item1 zeile">Lasten anzeigen</div>
            <div class="zeile">
               <sl-checkbox id="id_lasten" checked @sl-change="${this._checkbox_lasten}"></sl-checkbox>
            </div>

            <div class="item1 zeile">Lagerkräfte anzeigen</div>
            <div class="zeile">
               <sl-checkbox id="id_lager" checked @sl-change="${this._checkbox_lager}"></sl-checkbox>
            </div>


            <header>
             <button @click="${this._click_dynamik}" id="id_dynamik_button">
                  <svg
                     version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                     x="0px" y="0px" width="1rem" height="1rem" viewBox="0 0 100 100"
                     style="enable-background:new 0 0 100 100;"
                     xml:space="preserve"
                  >
                     <g>
                        <polygon
                           points="38,83 5,50 11.9,43 38,69.1 64.1,43 71,50 	"
                        />
                     </g>
                  </svg>
                  Dynamik
               </button>
            </header>


            <div class="item1 zeile_dynamik">Eigenformen</div>
            <div class="zeile_dynamik">
               <sl-checkbox id="id_eigenformen" @sl-change="${this._checkbox_eigenformen}"></sl-checkbox>
            </div>

            <div class="item1 zeile_dynamik">animate Eigenformen</div>
            <div class="zeile_dynamik">
               <sl-checkbox id="id_animate_eigenformen" @sl-change="${this._checkbox_animate_eigenformen}"></sl-checkbox>
            </div>

            <div class="item1 zeile_dynamik">Massen anzeigen</div>
            <div class="zeile_dynamik">
               <sl-checkbox id="id_knotenmassen" @sl-change="${this._checkbox_knotenmassen}"></sl-checkbox>
            </div>

            <header>
             <button @click="${this._click_optionen}" id="id_optionen_button">
                  <svg
                     version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                     x="0px" y="0px" width="1rem" height="1rem" viewBox="0 0 100 100"
                     style="enable-background:new 0 0 100 100;"
                     xml:space="preserve"
                  >
                     <g>
                        <polygon
                           points="38,83 5,50 11.9,43 38,69.1 64.1,43 71,50 	"
                        />
                     </g>
                  </svg>
                  Optionen
               </button>
            </header>


            <div class="item1 zeile_optionen">Umriss anzeigen</div>
            <div class="zeile_optionen">
               <sl-checkbox id="id_umriss" @sl-change="${this._checkbox_umriss}"></sl-checkbox>
            </div>


            <div class="item1 zeile_optionen">Gesamtverformung</div>
            <div class="zeile_optionen">
                <sl-checkbox id="id_gesamtverformung" @sl-change="${this._checkbox_gesamtverformung}"></sl-checkbox>
            </div>

            <div class="item1 zeile_optionen">Gleichgewicht SG</div>
            <div class="zeile_optionen">
                <sl-checkbox id="id_gleichgewicht_SG" checked @sl-change="${this._checkbox_gleichgewicht_SG}"></sl-checkbox>
            </div>

      `;
    }

    _click_header() {
        console.log('_click_header()');
        let elall = this.shadowRoot?.querySelectorAll('.zeile');
        //let el = document.getElementsByClassName('.item1')
        //console.log("selector", elall)
        if (elall) {
            for (let el of elall) {
                //console.log(el);
                if (this.show_main) {
                    (el as HTMLElement).style.display = 'none';
                } else {
                    (el as HTMLElement).style.display = 'block';
                }
            }
            this.show_main = !this.show_main;
        }
    }


    _click_optionen() {
        console.log('_click_header()');
        let elall = this.shadowRoot?.querySelectorAll('.zeile_optionen');
        //let el = document.getElementsByClassName('.item1')
        //console.log("selector", elall)
        if (elall) {
            for (let el of elall) {
                //console.log(el);
                if (this.show_optionen) {
                    (el as HTMLElement).style.display = 'none';
                } else {
                    (el as HTMLElement).style.display = 'block';
                }
            }
            this.show_optionen = !this.show_optionen;
        }
    }


    _click_dynamik() {
        console.log('_click_header()');
        let elall = this.shadowRoot?.querySelectorAll('.zeile_dynamik');
        //let el = document.getElementsByClassName('.item1')
        //console.log("selector", elall)
        if (elall) {
            for (let el of elall) {
                //console.log(el);
                if (this.show_dynamik) {
                    (el as HTMLElement).style.display = 'none';
                } else {
                    (el as HTMLElement).style.display = 'block';
                }
            }
            this.show_dynamik = !this.show_dynamik;
        }
    }

    _checkbox_beschriftung() {
        let el = this.shadowRoot?.getElementById('id_beschriftung') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event('draw_label_grafik'));
        }
    }

    _checkbox_systemlinien() {
        let el = this.shadowRoot?.getElementById('id_systemlinien') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event('draw_systemlinien_grafik'));
        }
    }

    _checkbox_verformungen() {
        let el = this.shadowRoot?.getElementById('id_verformungen') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event('draw_verformungen_grafik'));
        }
    }

    _checkbox_normalkraft() {
        let el = this.shadowRoot?.getElementById('id_normalkraft') as SlCheckbox;
        console.log("Normalkraft el.checked", el.checked)
        //if (el.checked) {
        if (draw_group) {
            draw_sg.N = false;
            window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        } else {
            draw_group = true;
            this._setController_V(false);
            this._setController_M(false);
            // controller_V.setValue(false);   // gui.controllers[4]
            // controller_M.setValue(false);   //gui.controllers[5]
            draw_group = false;

            draw_sg.N = el.checked;
            window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        }
        //}
    }

    _checkbox_querkraft() {
        let el = this.shadowRoot?.getElementById('id_querkraft') as SlCheckbox;
        if (draw_group) {
            draw_sg.Vz = false;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        } else {
            draw_group = true;
            this._setController_N(false);
            this._setController_M(false);
            // controller_N.setValue(false);  // gui.controllers[3]
            // controller_M.setValue(false);  // gui.controllers[5]
            draw_group = false;
            draw_sg.Vz = el.checked;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        }
    }

    _checkbox_moment() {
        let el = this.shadowRoot?.getElementById('id_moment') as SlCheckbox;
        if (draw_group) {
            draw_sg.My = false;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        } else {
            draw_group = true;
            this._setController_N(false);
            this._setController_V(false);
            // controller_N.setValue(false);  //gui.controllers[3]
            // controller_V.setValue(false);  //gui.controllers[4]
            draw_group = false;
            draw_sg.My = el.checked;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        }

    }

    _checkbox_lasten() {
        let el = this.shadowRoot?.getElementById('id_lasten') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_lasten_grafik"));
        }
    }

    _checkbox_lager() {
        let el = this.shadowRoot?.getElementById('id_lager') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_lagerkraefte_grafik"));
        }
    }

    _checkbox_umriss() {
        let el = this.shadowRoot?.getElementById('id_umriss') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_umriss_grafik"));
        }
    }

    _checkbox_gesamtverformung() {
        let el = this.shadowRoot?.getElementById('id_gesamtverformung') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_gesamtverformung_grafik"));
        }
    }

    _checkbox_gleichgewicht_SG() {
        let el = this.shadowRoot?.getElementById('id_gleichgewicht_SG') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_gleichgewicht_SG_grafik"));
        }
    }

    _checkbox_knickfigur() {
        let el = this.shadowRoot?.getElementById('id_knickfigur') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_eigenformen_grafik"));
        }
    }

    _checkbox_schiefstellung() {
        let el = this.shadowRoot?.getElementById('id_schiefstellung') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_schiefstellung_grafik"));
        }
    }

    _checkbox_stabvorverformung() {
        let el = this.shadowRoot?.getElementById('id_stabvorverformung') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_stabvorverformung_grafik"));
        }
    }

    _checkbox_eigenformen() {
        let el = this.shadowRoot?.getElementById('id_eigenformen') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_dyn_eigenformen_grafik"));
        }
    }

    _checkbox_animate_eigenformen() {
        let el = this.shadowRoot?.getElementById('id_animate_eigenformen') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_dyn_animate_eigenformen_grafik"));
        }
    }

    _checkbox_knotenmassen() {
        let el = this.shadowRoot?.getElementById('id_knotenmassen') as SlCheckbox;
        if (el) {
            window.dispatchEvent(new Event("draw_knotenmassen_grafik"));
        }
    }

    _range_skalierung() {
        let el = this.shadowRoot?.getElementById('id_skalierung') as SlRange;
        console.log("skalierung", el.value)
        scale_factor = el.value;
        window.dispatchEvent(new Event("scale_factor"));
        // if (el) {
        //     window.dispatchEvent(new Event("draw_gleichgewicht_SG_grafik"));
        // }
    }

    _setController_N(_wert: Boolean) {
        let el = this.shadowRoot?.getElementById('id_normalkraft') as SlCheckbox;
        el.removeAttribute('checked')
        draw_sg.N = false;
    }

    _setController_V(_wert: Boolean) {
        let el = this.shadowRoot?.getElementById('id_querkraft') as SlCheckbox;
        el.removeAttribute('checked')
        draw_sg.Vz = false;
    }
    _setController_M(_wert: Boolean) {
        let el = this.shadowRoot?.getElementById('id_moment') as SlCheckbox;
        el.removeAttribute('checked')
        draw_sg.My = false;
    }

}


//--------------------------------------------------------------------------------------------------------
export function get_scale_factor() {
    //----------------------------------------------------------------------------------------------------
    return scale_factor;

}

//--------------------------------------------------------------------------------------------------------
export function get_scale_factor_arrows() {
    //----------------------------------------------------------------------------------------------------
    return scale_factor_arrows;

}



