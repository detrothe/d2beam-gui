import '@shoelace-style/shoelace/dist/components/button/button.js';
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg, localized } from '@lit/localize';

import '../components/dr-drawer_1';
import { set_hide_drawer } from '../pages/cad_buttons';

@localized()
@customElement('dr-my_drawer')
export class drMyDrawer extends LitElement {
   /** angepinnt: Drawer bleibt beim Wählen eines Werkzeugs offen */
   @state() private sticky = false;

   private anim?: Animation;

   private get reduceMotion() {
      return matchMedia('(prefers-reduced-motion: reduce)').matches;
   }

   static styles = css`
      :host {
         --drawer-button-bg: rgb(90, 90, 90);
      }

      header {
         display: flex;
         justify-content: space-between;
         margin: 0.3rem;
      }

      p {
         color: white;
         margin-left: 0.5rem;
      }

      button {
         font-size: 0.875rem;
         border: 0;
         border-radius: 4px;
         padding: 0.4rem;
         color: #b6b6be;
         background-color: var(--drawer-button-bg);
         cursor: pointer;
      }

      button:active {
         background-color: darkorange;
      }

      svg {
         fill: white;
         display: block;
      }

      svg.sticky {
         fill: #ffc000;
      }

      .class_div_drawer {
         margin: 0.3rem;
      }
   `;

   render() {
      return html`
         <header>
            <button title=${msg('Pin')} aria-label=${msg('Pin')} aria-pressed=${String(this.sticky)} @click=${this._sticky}>
               <svg class=${this.sticky ? 'sticky' : ''} width="1.5rem" height="1.5rem" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path
                     d="M 706.38024,191.18987 600.16641,280.8547 V 424.34178 A 212.42765,179.32966 0 0 1 706.38024,579.62072 H 529.35719 v 179.32966 l -35.4046,29.88827 -35.40461,-29.88827 V 579.62072 H 281.52493 A 212.24786,179.17788 0 0 1 387.73876,424.34178 V 280.8547 L 281.52493,191.18987"
                  />
               </svg>
            </button>
            <button aria-label=${msg('Schließen')} @click=${this._div_ok}>
               <svg width="1rem" height="1rem" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                     d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z"
                  />
               </svg>
            </button>
         </header>

         <p><b>${msg('Weitere Aktivitäten')}</b></p>
         <div class="class_div_drawer" @hide-drawer=${this._onHideDrawer}>
            <dr-drawer_1 id="id_drawer_1"></dr-drawer_1>
         </div>

         <p>
            <sl-button @click=${this._div_ok}>${msg('Schließen')}</sl-button>
         </p>
      `;
   }

   /** Event von dr-drawer_1: nur schließen, wenn nicht angepinnt */
   private _onHideDrawer(e: Event) {
      e.stopPropagation();
      if (!this.sticky) this.hide();
   }

   private _div_ok() {
      this.sticky = false;
      set_hide_drawer(true);
      this.hide();
   }

   private _sticky() {
      this.sticky = !this.sticky;
      set_hide_drawer(!this.sticky);
   }

   // --- öffentliche API ---

   show() {
      // schon offen und keine Animation aktiv: nichts tun
      const visible = getComputedStyle(this).display !== 'none';
      if (visible && this.anim?.playState !== 'running') return;

      this.anim?.cancel(); // läuft gerade ein Ausblenden, abbrechen
      this.style.display = 'block';
      if (this.reduceMotion) return;

      this.anim = this.animate(
         [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
         { duration: 300, easing: 'ease-out' }
      );
   }

   async hide() {
      if (getComputedStyle(this).display === 'none') return;

      if (!this.reduceMotion) {
         this.anim?.cancel();
         this.anim = this.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
            { duration: 200, easing: 'ease-in' }
         );
         try {
            await this.anim.finished;
         } catch {
            return; // durch show() abgebrochen
         }
      }
      this.style.display = 'none';
   }

}
