import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg, localized } from '@lit/localize';

import { button_neue_eingabe, show_video } from '../pages/haupt_2';
import { standard_querschnitt_anlegen } from '../pages/querschnitte';
import { list } from '../pages/cad';
import { showDialog_info } from '../pages/cad_buttons';

// Willkommensdialog beim Start der App.
// Erscheint bei jedem Start, bis "nicht mehr anzeigen" angehakt wird (Einstellung auch im Tab ꔷꔷꔷ).

export const WILLKOMMEN_HIDDEN_KEY = 'd2beam_willkommen_hidden';

// Marker im sessionStorage: wird beim ersten Laden gesetzt. Der sessionStorage bleibt bei
// Reload und beim Wiederherstellen eines Tabs aus dem Hintergrund erhalten und ist erst nach
// dem Schließen von Tab/App leer. Nur dann ist es ein neuer Start mit Willkommensdialog.
const SESSION_MARKER_KEY = 'd2beam_session_gestartet';

// prüft den Marker und setzt ihn; true, wenn er schon vorhanden war
function session_laeuft_schon(): boolean {
   try {
      if (window.sessionStorage.getItem(SESSION_MARKER_KEY) === '1') {
         return true;
      }
      window.sessionStorage.setItem(SESSION_MARKER_KEY, '1');
   } catch {
      /* Speicher gesperrt: Dialog wie bei einem neuen Start zeigen */
   }
   return false;
}

// Zeitstempel der früheren 30-Minuten-Regel aufräumen
try {
   window.localStorage.removeItem('d2beam_zuletzt_aktiv');
} catch {
   /* Speicher gesperrt */
}

export function willkommen_ist_ausgeblendet(): boolean {
   try {
      if (window.localStorage.getItem(WILLKOMMEN_HIDDEN_KEY) === '1') {
         return true;
      }
      return false;
   } catch {
      return false;
   }
}

export function willkommen_ausblenden(ausblenden: boolean) {
   try {
      if (ausblenden) {
         window.localStorage.setItem(WILLKOMMEN_HIDDEN_KEY, '1');
      } else {
         window.localStorage.removeItem(WILLKOMMEN_HIDDEN_KEY);
      }
   } catch {
      /* Speicher gesperrt: Einstellung gilt nur bis zum Neuladen */
   }
}

function get_haupt_shadow(): ShadowRoot | null {
   const elHaupt = document.getElementById('id_haupt');
   if (elHaupt === null) {
      return null;
   }
   return elHaupt.shadowRoot;
}

// Erste Zeile des Projekt-Freitexts ohne HTML, für den Button "Letztes System öffnen"
function get_projekt_titel(): string {
   const shadow = get_haupt_shadow();
   if (shadow === null) {
      return '';
   }
   const el = shadow.getElementById('freetext') as HTMLTextAreaElement | null;
   if (el === null) {
      return '';
   }
   const zeilen = el.value.split('\n');
   for (const zeile of zeilen) {
      const div = document.createElement('div');
      div.innerHTML = zeile;
      const text = div.textContent;
      if (text !== null && text.trim().length > 0) {
         return text.trim();
      }
   }
   return '';
}

// Aufruf beim Start (index.ts), nachdem die letzte Eingabe automatisch gelesen wurde
export function zeige_willkommen_beim_start() {
   if (session_laeuft_schon()) {
      return;
   }
   if (willkommen_ist_ausgeblendet()) {
      return;
   }
   const shadow = get_haupt_shadow();
   if (shadow === null) {
      return;
   }
   const el = shadow.getElementById('id_dialog_willkommen') as drDialogWillkommen | null;
   if (el === null) {
      return;
   }
   const letztesVorhanden = list.size > 0;
   el.oeffnen(letztesVorhanden, get_projekt_titel());
}

function zeige_tab(tabId: string) {
   const shadow = get_haupt_shadow();
   if (shadow === null) {
      return;
   }
   const tab = shadow.getElementById(tabId);
   if (tab !== null) {
      tab.click();
   }
}

// Nach "ok" im Dialog Stabwerk/Fachwerk: Standard-Querschnitt anlegen und in den Tab System wechseln.
// Läuft nach dialog_neue_eingabe_closed (haupt_2.ts), weil der Listener danach registriert wird.
function neue_eingabe_geschlossen(this: HTMLDialogElement) {
   if (this.returnValue !== 'ok') {
      return;
   }
   standard_querschnitt_anlegen(msg('Rechteck'));
   zeige_tab('id_panel_CAD');
}

@localized()
@customElement('dr-dialog_willkommen')
export class drDialogWillkommen extends LitElement {
   @state() private letztesVorhanden = false;
   @state() private projektTitel = '';

   static styles = css`
      dialog {
         box-sizing: border-box;
         width: min(760px, calc(100vw - 32px));
         max-width: none;
         max-height: calc(100dvh - 32px);
         padding: 0;
         border: 0;
         border-radius: 14px;
         background: transparent;
         overflow: auto;
      }
      dialog::backdrop {
         background: hsl(201 50% 40% / 0.5);
      }

      .d2-start {
         --d2-accent: #0b5fa5;
         --d2-accent-text: #e6f0fa;
         --d2-text: #1a1a1a;
         --d2-muted: #555555;
         --d2-border: #d5d5d5;
         --d2-bg: #ffffff;
         --d2-tile-bg: #fafafa;
         --d2-line: #ececec;
         position: relative;
         box-sizing: border-box;
         padding: 40px 44px 28px;
         background: var(--d2-bg);
         border-radius: 14px;
         font-family: Inter, system-ui, sans-serif;
         color: var(--d2-text);
         display: flex;
         flex-direction: column;
         gap: 28px;
      }
      @media (prefers-color-scheme: dark) {
         .d2-start {
            --d2-accent: #4da3ff;
            --d2-accent-text: #0d2238;
            --d2-text: #e8e8ec;
            --d2-muted: #b6b6be;
            --d2-border: #43434a;
            --d2-bg: #1f1f23;
            --d2-tile-bg: #26262b;
            --d2-line: #34343a;
         }
         .d2-start-tile.d2-primary {
            color: #0d1520;
         }
      }
      .d2-start *,
      .d2-start *::before,
      .d2-start *::after {
         box-sizing: border-box;
      }
      .d2-start h1 {
         margin: 0;
         padding-right: 40px;
         font-size: 28px;
         font-weight: 700;
      }
      .d2-start p {
         margin: 6px 0 0;
         font-size: 15px;
         color: var(--d2-muted);
      }

      .d2-close {
         position: absolute;
         top: 14px;
         right: 14px;
         width: 40px;
         height: 40px;
         border: 0;
         border-radius: 8px;
         background: transparent;
         color: var(--d2-muted);
         font-size: 26px;
         line-height: 1;
         cursor: pointer;
      }
      .d2-close:hover {
         color: var(--d2-text);
      }

      .d2-start-grid {
         display: grid;
         grid-template-columns: repeat(2, minmax(0, 1fr));
         gap: 16px;
      }
      .d2-start-grid.d2-drei {
         grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .d2-start-tile {
         display: flex;
         flex-direction: column;
         align-items: flex-start;
         gap: 10px;
         min-height: 180px;
         padding: 20px;
         border-radius: 12px;
         border: 1px solid var(--d2-border);
         background: var(--d2-tile-bg);
         color: var(--d2-text);
         font: inherit;
         text-align: left;
         cursor: pointer;
      }
      .d2-start-tile:hover {
         border-color: var(--d2-accent);
      }
      .d2-start-tile svg {
         stroke: var(--d2-accent);
      }
      .d2-start-tile .d2-title {
         font-size: 18px;
         font-weight: 700;
      }
      .d2-start-tile .d2-desc {
         font-size: 13px;
         line-height: 1.45;
         color: var(--d2-muted);
         overflow-wrap: anywhere;
      }

      .d2-start-tile.d2-primary {
         border: 2px solid var(--d2-accent);
         background: var(--d2-accent);
         color: #ffffff;
      }
      .d2-start-tile.d2-primary svg {
         stroke: currentColor;
      }
      .d2-start-tile.d2-primary .d2-desc {
         color: var(--d2-accent-text);
      }
      .d2-start-tile.d2-primary:hover {
         filter: brightness(1.08);
      }

      .d2-start p.d2-start-tipp {
         margin: 0;
         font-size: 13px;
         line-height: 1.5;
      }
      .d2-inline-link {
         display: inline;
         min-height: 0;
         padding: 0;
         border: 0;
         background: transparent;
         font: inherit;
         font-weight: 700;
         color: var(--d2-accent);
         text-decoration: underline;
         cursor: pointer;
      }
      .d2-start-footer {
         display: flex;
         flex-wrap: wrap;
         justify-content: space-between;
         align-items: center;
         gap: 12px;
         padding-top: 18px;
         border-top: 1px solid var(--d2-line);
         font-size: 13px;
         color: var(--d2-muted);
      }
      .d2-start-links {
         display: flex;
         flex-wrap: wrap;
         column-gap: 20px;
      }
      .d2-start-links button {
         display: flex;
         align-items: center;
         gap: 6px;
         min-height: 36px;
         padding: 8px 0;
         border: 0;
         background: transparent;
         font: inherit;
         font-size: 13px;
         color: var(--d2-accent);
         cursor: pointer;
      }
      .d2-start-links button.d2-fett {
         font-weight: 700;
      }
      .d2-start-nicht-mehr {
         display: flex;
         align-items: center;
         gap: 8px;
         min-height: 36px;
         cursor: pointer;
      }
      .d2-start-nicht-mehr input {
         width: 18px;
         height: 18px;
         margin: 0;
         accent-color: var(--d2-accent);
      }
      .d2-start button:focus-visible,
      .d2-start input:focus-visible {
         outline: 3px solid #f2a33a;
         outline-offset: 2px;
      }

      /* Smartphone / schmales Fenster */
      @media (max-width: 700px) {
         dialog {
            width: calc(100vw - 16px);
            max-height: calc(100dvh - 16px);
         }
         .d2-start {
            padding: 20px 16px;
            gap: 16px;
         }
         .d2-start h1 {
            font-size: 24px;
         }
         .d2-start-grid,
         .d2-start-grid.d2-drei {
            grid-template-columns: minmax(0, 1fr);
         }
         .d2-start-tile {
            min-height: 0;
         }
         .d2-start-links button,
         .d2-start-nicht-mehr {
            min-height: 44px;
            font-size: 14px;
         }
      }
   `;

   //----------------------------------------------------------------------------------------------
   oeffnen(letztesVorhanden: boolean, projektTitel: string) {
      this.letztesVorhanden = letztesVorhanden;
      this.projektTitel = projektTitel;
      const checkbox = this.get_checkbox();
      if (checkbox !== null) {
         checkbox.checked = false;
      }
      const dlg = this.get_dialog();
      if (dlg !== null && !dlg.open) {
         dlg.showModal();
      }
   }

   // nach "Zu den Einstellungen": Dialog im selben Zustand wieder zeigen (Checkbox bleibt, wie sie war)
   wieder_oeffnen() {
      const dlg = this.get_dialog();
      if (dlg !== null && !dlg.open) {
         dlg.showModal();
      }
   }

   //----------------------------------------------------------------------------------------------
   private get_dialog(): HTMLDialogElement | null {
      if (this.shadowRoot === null) {
         return null;
      }
      return this.shadowRoot.getElementById('dialog_willkommen') as HTMLDialogElement | null;
   }

   private get_checkbox(): HTMLInputElement | null {
      if (this.shadowRoot === null) {
         return null;
      }
      return this.shadowRoot.getElementById('id_nicht_mehr_anzeigen') as HTMLInputElement | null;
   }

   private schliessen() {
      const dlg = this.get_dialog();
      if (dlg !== null && dlg.open) {
         dlg.close();
      }
   }

   // bei jedem Schließen (Button, ×, Esc): Checkbox merken
   private _closed() {
      const checkbox = this.get_checkbox();
      if (checkbox !== null && checkbox.checked) {
         willkommen_ausblenden(true);
         this.dispatchEvent(new CustomEvent('willkommen-ausgeblendet', { bubbles: true, composed: true }));
      }
   }

   //----------------------------------------------------------------------------------------------
   private _neues_system() {
      this.schliessen();
      button_neue_eingabe();
      const shadow = get_haupt_shadow();
      if (shadow === null) {
         return;
      }
      const el = shadow.getElementById('id_dialog_neue_eingabe');
      if (el === null || el.shadowRoot === null) {
         return;
      }
      const dlg = el.shadowRoot.getElementById('dialog_neue_eingabe') as HTMLDialogElement | null;
      if (dlg !== null) {
         dlg.addEventListener('close', neue_eingabe_geschlossen, { once: true });
      }
   }

   private _letztes_system() {
      this.schliessen();
      zeige_tab('id_panel_CAD');
   }

   private _einstellungen() {
      // dr-haupt zeigt daraufhin im Tab ꔷꔷꔷ den Button "Zurück zum Willkommensdialog"
      this.dispatchEvent(new CustomEvent('willkommen-zu-einstellungen', { bubbles: true, composed: true }));
      this.schliessen();
      const shadow = get_haupt_shadow();
      if (shadow === null) {
         return;
      }
      const tab = shadow.querySelector('sl-tab[panel="tab-einstellungen"]') as HTMLElement | null;
      if (tab !== null) {
         tab.click();
      }
   }

   private _videos() {
      show_video(); // neuer Browser-Tab, Dialog bleibt offen
   }

   private _kurzinfo() {
      showDialog_info(); // legt sich über den Willkommensdialog, der bleibt offen
   }

   private _datei_oeffnen() {
      this.schliessen();
      const shadow = get_haupt_shadow();
      if (shadow === null) {
         return;
      }
      const btn = shadow.getElementById('readFile');
      if (btn !== null) {
         btn.click();
      }
   }

   //----------------------------------------------------------------------------------------------
   private render_letztes() {
      if (!this.letztesVorhanden) {
         return '';
      }
      let beschreibung: string;
      if (this.projektTitel.length > 0) {
         beschreibung = this.projektTitel;
      } else {
         beschreibung = msg('Dort weitermachen, wo du aufgehört hast.');
      }
      return html`
         <button type="button" class="d2-start-tile" @click="${this._letztes_system}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <span class="d2-title">${msg('Letztes System öffnen')}</span>
            <span class="d2-desc">${beschreibung}</span>
         </button>`;
   }

   render() {
      let gridKlasse = 'd2-start-grid';
      if (this.letztesVorhanden) {
         gridKlasse = 'd2-start-grid d2-drei';
      }

      return html`
         <dialog id="dialog_willkommen" aria-labelledby="d2-start-title" @close="${this._closed}">
            <section class="d2-start">
               <button type="button" class="d2-close" @click="${this.schliessen}"
                  title="${msg('Schließen')}" aria-label="${msg('Schließen')}">×</button>

               <div>
                  <h1 id="d2-start-title">${msg('Willkommen bei D2Beam')}</h1>
                  <p>${msg('Ebene Stab- und Fachwerke nach Theorie I. und II. Ordnung. Wie möchtest du beginnen?')}</p>
               </div>

               <div class="${gridKlasse}">
                  <button type="button" class="d2-start-tile d2-primary" @click="${this._neues_system}">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18 L9 7 L15 7 L20 18"/><path d="M2.5 18h3M18.5 18h3"/><path d="M12 3v4"/><path d="M10 5l2 2 2-2"/></svg>
                     <span class="d2-title">${msg('Neues System')}</span>
                     <span class="d2-desc">${msg('Stabwerk oder Fachwerk anlegen. Ein Standard-Querschnitt ist schon dabei, du startest direkt im Tab System.')}</span>
                  </button>

                  ${this.render_letztes()}

                  <button type="button" class="d2-start-tile" @click="${this._videos}">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/></svg>
                     <span class="d2-title">${msg('Einführungsvideos')}</span>
                     <span class="d2-desc">${msg('In wenigen Minuten vom ersten Stab bis zur Momentenlinie. Öffnet sich in einem neuen Browser-Tab.')}</span>
                  </button>
               </div>

               <p class="d2-start-tipp">
                  ${msg('Tipp: Schriftgröße, Größe der Buttons im Tab System und Farben kannst du im Tab ꔷꔷꔷ (ganz rechts) einstellen. Damit sie beim nächsten Start noch gelten, dort auf „Auswahl als Standardwerte im Browser speichern“ drücken.')}
                  <button type="button" class="d2-inline-link" @click="${this._einstellungen}">${msg('Zu den Einstellungen')}</button>
               </p>

               <div class="d2-start-footer">
                  <div class="d2-start-links">
                     <button type="button" @click="${this._datei_oeffnen}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h6l2 2h10v10H3z"/></svg>
                        ${msg('Datei öffnen')}
                     </button>
                     <button type="button" class="d2-fett" @click="${this._kurzinfo}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.01"/></svg>
                        ${msg('Kurzinformationen zur grafischen Eingabe')}
                     </button>
                  </div>
                  <label class="d2-start-nicht-mehr">
                     <input type="checkbox" id="id_nicht_mehr_anzeigen" />
                     ${msg('Diesen Dialog nicht mehr anzeigen')}
                  </label>
               </div>
            </section>
         </dialog>`;
   }
}
