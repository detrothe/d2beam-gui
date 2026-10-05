import type { SlCheckbox } from '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { msg, str, localized } from '@lit/localize';

import { Messen_button } from '../pages/cad_buttons';
import { Bemassung_button } from '../pages/cad_bemassung';
import {
   set_show_bemassung,
   set_show_elementlasten,
   set_show_knotenlasten,
   set_show_knotenmassen,
   set_show_knotenverformung,
   set_show_lager,
   set_show_lastfall,
   set_show_raster,
   set_show_stab_qname,
} from '../pages/cad';
import { copy_svg_cad } from '../pages/grafik';
import { Knotenverformung_button } from '../pages/cad_knotenverformung';
import {
   copy_selected_button,
   edit_selected_button,
   select_multi_button,
   select_typ_button,
   unselect_all_button,
   unselect_multi_button,
} from '../pages/cad_select';

interface Tool {
   id: string;
   label: () => string;
   run: () => void;
   /** true: Werkzeug bleibt aktiv (rot), bis es erneut geklickt wird */
   modal: boolean;
}

const TOOLS: Tool[] = [
   { id: 'knotverform', label: () => msg('Knotenverformung'), run: () => Knotenverformung_button(), modal: true },
   { id: 'select_multi', label: () => msg('selektiere mehrere Elemente'), run: () => select_multi_button(1), modal: true },
   { id: 'select_typ', label: () => msg('selektiere nach Element-Typ'), run: () => select_typ_button(), modal: false },
   { id: 'unselect_all', label: () => msg('deselektiere alle Elemente'), run: () => unselect_all_button(), modal: false },
   { id: 'unselect_multi', label: () => msg('deselektiere mehrere Elemente'), run: () => unselect_multi_button(1), modal: true },
   { id: 'copy_selected', label: () => msg('Kopiere selektierte Elemente'), run: () => copy_selected_button(), modal: false },
   { id: 'edit_selected', label: () => msg('Editiere selektierte Elemente'), run: () => edit_selected_button(), modal: false },
   { id: 'messen', label: () => msg('Messen'), run: () => Messen_button(), modal: true },
   { id: 'bemassung_parallel', label: () => msg('Bemaßung parallel'), run: () => Bemassung_button(1), modal: true },
   { id: 'bemassung_x', label: () => msg('Bemaßung horizontal'), run: () => Bemassung_button(2), modal: true },
   { id: 'bemassung_z', label: () => msg('Bemaßung vertikal'), run: () => Bemassung_button(3), modal: true },
];

interface Toggle {
   id: string;
   label: () => string;
   set: (show: boolean) => void;
}

const TOGGLES: Toggle[] = [
   { id: 'raster', label: () => msg('Rasterlinien'), set: set_show_raster },
   { id: 'stab_name', label: () => msg('Stab Querschnittsname'), set: set_show_stab_qname },
   { id: 'lager', label: () => msg('Lager'), set: set_show_lager },
   { id: 'knotenlasten', label: () => msg('Knotenlasten'), set: set_show_knotenlasten },
   { id: 'elementlasten', label: () => msg('Elementlasten'), set: set_show_elementlasten },
   { id: 'knotenmassen', label: () => msg('Knotenmassen'), set: set_show_knotenmassen },
   { id: 'knotenverformungen', label: () => msg('Knotenverformungen'), set: set_show_knotenverformung },
   { id: 'bemassung', label: () => msg('Bemaßung'), set: set_show_bemassung },
];

@localized()
@customElement('dr-drawer_1')
export class drDrawer_1 extends LitElement {
   @property({ type: Number }) nLastfaelle = 0;

   /** id des aktuell aktiven (roten) Werkzeugs */
   @state() private activeTool: string | null = null;

   static styles = css`
      :host {
         display: block;
      }

      .tools,
      .toggles {
         display: flex;
         flex-direction: column;
         gap: 0.5rem;
      }

      .toggles {
         gap: 0.25rem;
         margin-top: 1rem;
      }

      button {
         font-size: 1rem;
         padding: 0.4rem;
         border: 0;
         border-radius: 4px;
         color: white;
         background-color: var(--drawer-button-bg, rgb(90, 90, 90));
         text-align: left;
         cursor: pointer;
      }

      button.active {
         background-color: var(--drawer-button-active-bg, darkred);
      }

      button:active {
         background-color: darkorange;
      }

      @media (hover: hover) {
         button:hover {
            color: yellow;
         }
      }

      label {
         font-size: 1rem;
      }

      select {
         font-size: 1rem;
         height: 2rem;
         border-radius: 4px;
         padding: 0 0.4rem;
      }

      .section-title {
         display: block;
         margin: 1rem 0 0.25rem;
         font-weight: bold;
      }

      .lastfall {
         margin-top: 1rem;
         display: flex;
         align-items: center;
         gap: 0.5rem;
      }
   `;

   render() {
      return html`
         <div class="tools">
            ${TOOLS.map(
         (t) => html`
                  <button
                     id="id_${t.id}"
                     class=${classMap({ active: this.activeTool === t.id })}
                     aria-pressed=${t.modal ? String(this.activeTool === t.id) : 'false'}
                     @click=${() => this.onTool(t)}
                  >
                     ${t.label()}
                  </button>
               `,
      )}
         </div>

         <span class="section-title">${msg('Ausblenden')}</span>
         <div class="toggles">
            ${TOGGLES.map(
         (t) => html`
                  <sl-checkbox id="id_show_${t.id}" @sl-change=${(e: Event) => t.set(!(e.target as SlCheckbox).checked)}>
                     ${t.label()}
                  </sl-checkbox>
               `,
      )}
         </div>

         <div class="lastfall">
            <label for="id_select_loadcase">${msg('Zeige :')}</label>
            <select id="id_select_loadcase" @change=${this.onLoadcaseChanged}>
               <option value="alle" selected>${msg('alle Lastfälle')}</option>
               ${Array.from({ length: this.nLastfaelle }, (_, i) => html`<option value=${i + 1}>${msg(str`Lastfall ${i + 1}`)}</option>`)}
            </select>
         </div>

         <p>
            <button @click=${() => copy_svg_cad()}>${msg('System als svg-Datei speichern')}</button>
         </p>
      `;
   }

   private onTool(tool: Tool) {
      if (tool.modal) {
         this.activeTool = this.activeTool === tool.id ? null : tool.id;
      } else {
         // Einmal-Aktionen beenden ein evtl. aktives Werkzeug
         this.activeTool = null;
      }
      this.dispatchEvent(new CustomEvent('hide-drawer', { bubbles: true, composed: true }));
      tool.run();
   }

   private onLoadcaseChanged(e: Event) {
      set_show_lastfall(Number((e.target as HTMLSelectElement).value));
   }

   // --- öffentliche API (wird von außen aufgerufen) ---

   init_loadcases(nlastfaelle: number) {
      this.nLastfaelle = nlastfaelle;
   }

   reset_buttons() {
      this.activeTool = null;
   }
}
