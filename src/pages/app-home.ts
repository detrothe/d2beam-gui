import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';

import { styles } from '../styles/shared-styles';

import '../components/dr-button-pm';
import '../components/dr-table';

@customElement('app-home')
export class AppHome extends LitElement {
  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  static get styles() {
    return [
      styles,
      css`
        #welcomeBar {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        #welcomeCard,
        #infoCard {
          padding: 18px;
          padding-top: 0px;
        }

        sl-card::part(footer) {
          display: flex;
          justify-content: flex-end;
        }

        @media (min-width: 750px) {
          sl-card {
            width: 70vw;
          }
        }

        @media (horizontal-viewport-segments: 2) {
          #welcomeBar {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }

          #welcomeCard {
            margin-right: 64px;
          }
        }

        /* Festlegung im Default-Stylesheet der Browser */
        dialog:not([open]) {
          display: none;
        }

        /* Styling der geöffneten Popup-Box */
        dialog[open] {
          width: 30em;
          background: #fffbf0;
          border: thin solid #e7c157;
          margin: 5em auto;
        }

        dialog::backdrop {
          background: hsl(201 50% 40% /0.5);
        }

        sl-tab-panel {
          height: 500px;
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
    /*
        document.getElementById("show-dialog").addEventListener("click", () => {
          document.getElementById("dialog").showModal();
        });

        document.getElementById("close-dialog").addEventListener("click", () => {
          document.getElementById("dialog").close();
        });
        */
    const shadow = this.shadowRoot;
    if (shadow) {
      console.log(shadow.getElementById('Anmeldung'));
    }
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  _handleClick(e) {
    console.log('handleClick()');
    //console.log(this._root.querySelector('#dialog'));
    const shadow = this.shadowRoot;
    if (shadow) {
      console.log(shadow.getElementById('dialog'));
      console.log(shadow.getElementById('Anmeldung'));
      (shadow.getElementById('dialog') as HTMLDialogElement).showModal();
    }
  }

  _dialog_ok(e) {
    console.log('dialog_ok');
    const shadow = this.shadowRoot;
    if (shadow) {
      console.log(
        'email: ',
        (shadow.getElementById('email') as HTMLInputElement).value
      );
      (shadow.getElementById('dialog') as HTMLDialogElement).close();
    }
  }

  _dialog_abbruch(e) {
    console.log('dialog_abbruch');
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById('dialog') as HTMLDialogElement).close();
  }

  render() {
    return html`
      <!-- <app-header></app-header>  -->

      <main>
        <sl-tab-group>
          <sl-tab slot="nav" panel="tab-1">Querschnitte</sl-tab>
          <sl-tab slot="nav" panel="tab-2">Tab 2</sl-tab>
          <sl-tab slot="nav" panel="tab-3">Tab 3</sl-tab>
          <sl-tab slot="nav" panel="tab-4">Tab 4</sl-tab>
          <sl-tab slot="nav" panel="tab-5">Tab 5</sl-tab>
          <sl-tab slot="nav" panel="tab-6">Tab 6</sl-tab>
          <sl-tab slot="nav" panel="tab-7">Tab 7</sl-tab>
          <sl-tab slot="nav" panel="tab-8">Tab 8</sl-tab>
          <sl-tab slot="nav" panel="tab-9">Tab 9</sl-tab>
          <sl-tab slot="nav" panel="tab-10">Tab 10</sl-tab>
          <sl-tab slot="nav" panel="tab-11">Tab 11</sl-tab>
          <sl-tab slot="nav" panel="tab-12">Tab 12</sl-tab>
          <sl-tab slot="nav" panel="tab-13">Tab 13</sl-tab>
          <sl-tab slot="nav" panel="tab-14">Tab 14</sl-tab>
          <sl-tab slot="nav" panel="tab-15">Tab 15</sl-tab>
          <sl-tab slot="nav" panel="tab-16">Tab 16</sl-tab>
          <sl-tab slot="nav" panel="tab-17">Tab 17</sl-tab>
          <sl-tab slot="nav" panel="tab-18">Tab 18</sl-tab>
          <sl-tab slot="nav" panel="tab-19">Tab 19</sl-tab>
          <sl-tab slot="nav" panel="tab-20">Tab 20</sl-tab>

          <sl-tab-panel name="tab-1"
            >Tab panel 1 <br />
            <sl-button id="open-dialog" @click="${this._handleClick}"
              >Zeige die Dialog-Box</sl-button
            >
          </sl-tab-panel>
          <sl-tab-panel name="tab-2">
            Tab panel 22 <br />
            <dr-button-pm nnodes="3" inputid="test"></dr-button-pm>
          </sl-tab-panel>
          <sl-tab-panel name="tab-3"
            >Tab panel 3 <br />
            <dr-table columns='["No", "y&#772; [cm]", "z&#772; [cm]"]' nZeilen ="2"></dr-table>
          </sl-tab-panel>
          <sl-tab-panel name="tab-4">Tab panel 4</sl-tab-panel>
          <sl-tab-panel name="tab-5">Tab panel 5</sl-tab-panel>
          <sl-tab-panel name="tab-6">Tab panel 6</sl-tab-panel>
          <sl-tab-panel name="tab-7">Tab panel 7</sl-tab-panel>
          <sl-tab-panel name="tab-8">Tab panel 8</sl-tab-panel>
          <sl-tab-panel name="tab-9">Tab panel 9</sl-tab-panel>
          <sl-tab-panel name="tab-10">Tab panel 10</sl-tab-panel>
          <sl-tab-panel name="tab-11">Tab panel 11</sl-tab-panel>
          <sl-tab-panel name="tab-12">Tab panel 12</sl-tab-panel>
          <sl-tab-panel name="tab-13">Tab panel 13</sl-tab-panel>
          <sl-tab-panel name="tab-14">Tab panel 14</sl-tab-panel>
          <sl-tab-panel name="tab-15">Tab panel 15</sl-tab-panel>
          <sl-tab-panel name="tab-16">Tab panel 16</sl-tab-panel>
          <sl-tab-panel name="tab-17">Tab panel 17</sl-tab-panel>
          <sl-tab-panel name="tab-18">Tab panel 18</sl-tab-panel>
          <sl-tab-panel name="tab-19">Tab panel 19</sl-tab-panel>
          <sl-tab-panel name="tab-20">Tab panel 20</sl-tab-panel>
        </sl-tab-group>

        <div id="welcomeBar">
          <dialog id="dialog">
            <h2>Anmeldung</h2>

            <sl-tab-group>
              <sl-tab slot="nav" panel="tab-material">Material</sl-tab>
              <sl-tab slot="nav" panel="tab-querschnitt">Querschnitt</sl-tab>
              <sl-tab slot="nav" panel="tab-stahl">Stahl</sl-tab>

              <sl-tab-panel name="tab-material">
                <label for="emodul">E-Modul: </label>
                <input id="emodul" type="number" /> &nbsp;[MN/m²] <br />
                <label for="bettung">Bettung k<sub>s</sub>: </label>
                <input id="bettung" type="number" /> &nbsp;[kN/m²] <br />
                <label for="wichte">Wichte: </label>
                <input id="wichte" type="number" /> &nbsp;[kN/m³] <br />
              </sl-tab-panel>
              <sl-tab-panel name="tab-querschnitt">
                <label for="offset">Offset: </label>
                <input id="offset" type="number" /> &nbsp;[cm] <br />
                <label for="nschichten">Anzahl Schichten: </label>
                <input id="nschichten" type="number" /><br />
              </sl-tab-panel>
              <sl-tab-panel name="tab-stahl">Tab panel 3</sl-tab-panel>
            </sl-tab-group>

            <form method="dialog">
              <sl-button
                id="Anmeldung"
                value="anmelden"
                @click="${this._dialog_ok}"
                >Anmelden</sl-button
              >
              <sl-button id="Abbruch" @click="${this._dialog_abbruch}"
                >Abbrechen</sl-button
              >
            </form>
          </dialog>

          <sl-button
            href="${(import.meta as any).env.BASE_URL}about"
            variant="primary"
            >Navigate to About</sl-button
          >
        </div>
      </main>
    `;
  }
}

