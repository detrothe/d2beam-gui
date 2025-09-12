import { SlCheckbox } from '@shoelace-style/shoelace';
import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { hide_drawer, Messen_button } from '../pages/cad_buttons';
import { Bemassung_button } from '../pages/cad_bemassung';
import { set_show_bemassung, set_show_elementlasten, set_show_knotenlasten, set_show_knotenmassen, set_show_lager, set_show_lastfall, set_show_raster, set_show_stab_qname } from '../pages/cad';
import { copy_svg_cad } from '../pages/grafik';
import { Knotenverformung_button } from '../pages/cad_knotenverformung';
import { copy_selected_button, edit_selected_button, select_multi_button, select_typ_button, unselect_all_button, unselect_multi_button } from '../pages/cad_select';
import { drMyDrawer } from './dr-my_drawer';

@customElement('dr-drawer_1')
export class drDrawer_1 extends LitElement {
   @property({ type: String }) title = 'Drawer_1';

   @property({ type: Number }) xValue = 0;
   @property({ type: Number }) nLastfaelle = 0;

   static get styles() {
      return css`
         input,
         label {
            font-size: 1rem;
            width: 6rem;
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
            /*background-color: rgb(207, 217, 21);
        border-radius: 5px;*/
         }

         td.selected {
            /*background-color: rgb(206, 196, 46);*/
            color: rgb(13, 13, 13);
         }

         td.highlight {
            background-color: orange;
            color: darkslateblue;
         }

         #id_select_loadcase {
            /*margin: 0;
            padding: 0.3125rem;*/
            font-size: 1rem;
            height: 2rem;
         }

         button {
            color: white;
            background-color: rgb(90, 90, 90);
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
   }

   //----------------------------------------------------------------------------------------------

   render() {
      return html`
         <p>
            <button id="id_knotverform" value="0" @click="${this._knotverform}">Knotenverformung</button>
         </p>

         <p>
            <button id="id_select_multi" value="0" @click="${this._select_multi}">selektiere mehrere Elemente</button>
         </p>

         <p>
            <button id="id_select_typ" value="0" @click="${this._select_typ}">selektiere nach Element-Typ</button>
         </p>

         <p>
            <button id="id_unselect_all" value="0" @click="${this._unselect_all}">deselektiere alle Elemente</button>
         </p>

         <p>
            <button id="id_unselect_multi" value="0" @click="${this._unselect_multi}">deselektiere mehrere Elemente</button>
         </p>

         <p>
            <button id="id_copy_selected" value="0" @click="${this._copy_selected}">Kopiere selektierte Elemente</button>
         </p>

         <p>
            <button id="id_edit_selected" value="0" @click="${this._edit_selected}">Editiere selektierte Elemente</button>
         </p>

         <p>
            <button id="id_messen" value="0" @click="${this._messen}">Messen</button>
         </p>

         <p>
            <button id="id_bemassung_parallel" value="0" @click="${this._bemassung_parallel}">Bemassung parallel</button>
         </p>

         <p>
            <button id="id_bemassung_x" value="0" @click="${this._bemassung_x}">Bemassung horizontal</button>
         </p>

         <p>
            <button id="id_bemassung_z" value="0" @click="${this._bemassung_z}">Bemassung vertikal</button>
         </p>

         <p>
            <b>Ausblenden</b><br />
            <sl-checkbox id="id_show_raster" @click="${this._checkbox_raster}">Rasterlinien </sl-checkbox>
            <br />
            <sl-checkbox id="id_show_stab_name" @click="${this._checkbox_stab_name}">Stab Querschnittsname </sl-checkbox>
            <br />
            <sl-checkbox id="id_show_lager" @click="${this._checkbox_lager}">Lager</sl-checkbox>
            <br />
            <sl-checkbox id="id_show_knotenlasten" @click="${this._checkbox_knotenlasten}">Knotenlasten </sl-checkbox>
            <br />
            <sl-checkbox id="id_show_elementlasten" @click="${this._checkbox_elementlasten}">Elementlasten </sl-checkbox>
            <br />
            <sl-checkbox id="id_show_knotenmassen" @click="${this._checkbox_knotenmassen}">Knotenmassen </sl-checkbox>
            <br />
            <sl-checkbox id="id_show_bemassung" @click="${this._checkbox_bemassung}">Bemaßung </sl-checkbox>
         </p>
         <p>
            <label for="id_select_loadcase">Zeige :</label>
            <select id="id_select_loadcase" @change="${this._select_loadcase_changed}">
               <option value="alle">alle</option>
               <option value="1">Lastfall 1</option>
            </select>
         </p>

         <p>
            <button id="id_svg" value="0" @click="${this._svg}">System als svg-Datei speichern</button>
         </p>
      `;
   }

   _messen() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      console.log('drawer', myDrawer);
      //console.log("Button messen geklickt", drawer)
      //@ts-ignore
      if (drawer) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      Messen_button();
   }

   _select_multi() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      select_multi_button(1);
   }

   _unselect_multi() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      unselect_multi_button(1);
   }

   _select_typ() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      select_typ_button();
   }

   _unselect_all() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      unselect_all_button();
   }

   _copy_selected() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      copy_selected_button();
   }

   _edit_selected() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      edit_selected_button();
   }

   _bemassung_parallel() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      Bemassung_button(1);
   }

   _bemassung_x() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      Bemassung_button(2);
   }

   _bemassung_z() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      Bemassung_button(3);
   }

   _checkbox_raster() {
      let el = this.shadowRoot?.getElementById('id_show_raster') as SlCheckbox;
      if (el.checked) {
         set_show_raster(false);
      } else {
         set_show_raster(true);
      }
   }

   _checkbox_stab_name() {
      let el = this.shadowRoot?.getElementById('id_show_stab_name') as SlCheckbox;
      if (el.checked) {
         set_show_stab_qname(false);
      } else {
         set_show_stab_qname(true);
      }
   }

   _checkbox_knotenlasten() {
      let el = this.shadowRoot?.getElementById('id_show_knotenlasten') as SlCheckbox;
      if (el.checked) {
         set_show_knotenlasten(false);
      } else {
         set_show_knotenlasten(true);
      }
   }

   _checkbox_elementlasten() {
      let el = this.shadowRoot?.getElementById('id_show_elementlasten') as SlCheckbox;
      if (el.checked) {
         set_show_elementlasten(false);
      } else {
         set_show_elementlasten(true);
      }
   }

   _checkbox_knotenmassen() {
      let el = this.shadowRoot?.getElementById('id_show_knotenmassen') as SlCheckbox;
      if (el.checked) {
         set_show_knotenmassen(false);
      } else {
         set_show_knotenmassen(true);
      }
   }

   _checkbox_bemassung() {
      let el = this.shadowRoot?.getElementById('id_show_bemassung') as SlCheckbox;
      if (el.checked) {
         set_show_bemassung(false);
      } else {
         set_show_bemassung(true);
      }
   }

   _checkbox_lager() {
      let el = this.shadowRoot?.getElementById('id_show_lager') as SlCheckbox;
      if (el.checked) {
         set_show_lager(false);
      } else {
         set_show_lager(true);
      }
   }
   _svg() {
      copy_svg_cad();
   }

   _knotverform() {
      const drawer = document.querySelector('.drawer-overview');
      const myDrawer = document.querySelector('.class-my-drawer') as drMyDrawer;
      //@ts-ignore
      if (drawer !== null) drawer.hide();
      if ( myDrawer && hide_drawer) myDrawer.hide();
      Knotenverformung_button();
   }

   init_loadcases(nlastfaelle: number) {
      console.log('init_loadcases', nlastfaelle);

      if (this.nLastfaelle !== nlastfaelle) {
         const el_select = this.shadowRoot?.getElementById('id_select_loadcase') as HTMLSelectElement;

         while (el_select.hasChildNodes()) {
            // alte Optionen entfernen
            // @ts-ignore
            el_select.removeChild(el_select?.lastChild);
         }

         console.log('el_select', el_select);

         let option = document.createElement('option');
         option.value = String('alle');
         option.textContent = 'alle Lastfälle';
         option.selected = true;
         el_select.appendChild(option);

         for (let i = 1; i <= nlastfaelle; i++) {
            option = document.createElement('option');
            option.value = String(i);
            option.textContent = 'Lastfall ' + i;
            el_select.appendChild(option);
         }
         console.log('neu el_select', el_select);
         this.nLastfaelle = nlastfaelle;
      }
   }

   _select_loadcase_changed() {
      let el = this.shadowRoot?.getElementById('id_select_loadcase') as HTMLSelectElement;
      //console.log("loadcase changed", el.value)
      set_show_lastfall(Number(el.value));
   }
}
