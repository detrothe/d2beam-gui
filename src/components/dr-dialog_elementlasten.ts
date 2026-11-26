import { SlRadioButton, SlRadioGroup, SlSelect } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { msg, localized } from '@lit/localize';

import { alertdialog } from "../pages/confirm_dialog";

@localized()
@customElement("dr-dialog_elementlasten")
export class drDialogElementlasten extends LitElement {
  @property({ type: String }) title = "neuer Knoten";

  @property({ type: Number }) xValue = 0;

  static get styles() {
    return css`
      input,
      label {
        font-size: 1rem;
        width: 6rem;
      }

      p,
      h2,
      sl-radio-group {
        color: black;
      }

      button,
      select {
        font-size: 0.875rem;
        border-radius: 4px;
        border-width: 1px;
        padding: 0.4rem;
      }

      sl-radio {
        color: black;
      }

      .hinweis {
        font-size: 0.875rem;
        color: #555;
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

      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type="number"] {
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
        color: black;
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

      /* Festlegung im Default-Stylesheet der Browser */
      dialog:not([open]) {
        display: none;
      }

      /* Styling der geöffneten Popup-Box */
      dialog[open] {
        width: 20rem;
        background: light-dark(var(--dialog-open-light), var(--dialog-open-dark));
        border: thin solid #e7c157;
        font-size: 1rem;
        max-height: 90vh;
        overflow-y: auto;
      }

      dialog::backdrop {
        background: hsl(201 50% 40% /0.5);
      }
    `;
  }

  constructor() {
    super();
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html` <dialog id="dialog_elementlast">
      <h2>${msg('Elementlasten')}</h2>

      <sl-radio-group id="id_typ" label=${msg('Wähle eine Option')} name="a" value="0" @sl-change="${this._handleChange}">
        <sl-radio value="0">${msg('Streckenlasten')}</sl-radio>
        <sl-radio id="id_typ_einzellasten" value="1">${msg('Einzellasten')}</sl-radio>
        <sl-radio value="2">${msg('Temperatur')}</sl-radio>
        <sl-radio value="3">${msg('Vorspannung')}</sl-radio>
        <sl-radio value="4">${msg('Spannschloss')}</sl-radio>
        <sl-radio value="5">${msg('Vorverformungen')}</sl-radio>
      </sl-radio-group>

      <hr />

      <p>
        ${msg('Lastfall :')}
        <input type="number" id="id_lf" name="lf" pattern="[0-9.,eE+-]*" value="1" />
      </p>

      <div id="id_streckenlast">
        <p>
          <!-- Art: -->
          <!-- <input type="number" step="any" id="id_art" name="art" pattern="[0-9.,eE+-]*" value="" /> -->
          <sl-select id="id_art" label=${msg('Art der Trapezstreckenlast :')} value="0">
            <sl-option value="0">${msg('senkrecht auf Stab')}</sl-option>
            <sl-option value="1">${msg('in globaler z-Richtung')}</sl-option>
            <sl-option value="2">${msg('in globaler z-Richtung, Projektion')}</sl-option>
            <sl-option value="3">${msg('in globaler x-Richtung')}</sl-option>
            <sl-option value="4">${msg('in globaler x-Richtung, Projektion')}</sl-option>
          </sl-select>
        </p>
        <p>
          p<sub>a</sub>
          <input type="number" step="any" id="id_pa" name="pa" pattern="[0-9.,eE+-]*" value="" />
          [kN/m]<br />
          p<sub>e</sub>
          <input type="number" step="any" id="id_pe" name="pa" pattern="[0-9.,eE+-]*" value="" />
          [kN/m]
        </p>
        <p>
          x<sub>a</sub>
          <input type="number" step="any" id="id_xa" name="xa" pattern="[0-9.,eE+-]*" value="0" />
          [m]<br />
          x<sub>e</sub>
          <input type="number" step="any" id="id_xb" name="xb" pattern="[0-9.,eE+-]*" value="-1" />
          [m]
        </p>
        <p class="hinweis">${msg('Lastanfang und -ende ab Beginn des elastischen Stabteils, xe = −1: bis Stabende')}</p>
      </div>

      <div id="id_einzellast" style="display:none;">
        <p>${msg('Einzellasten')}</p>
        <table id="einstellungen_table">
          <tbody>
            <tr>
              <td>x</td>
              <td><input type="number" step="any" id="id_x" name="x" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[m]</td>
            </tr>
            <tr>
              <td>${msg('Bezug')}</td>
              <td colspan="2">
                <select id="id_bezug">
                  <option value="1" selected>${msg('Stabachse')}</option>
                  <option value="0">${msg('global x, z')}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td title=${msg('Winkel im Gegenuhrzeigersinn positiv')}>&alpha;</td>
              <td><input type="number" step="any" id="id_alpha" name="alpha" pattern="[0-9.,eE+-]*" value="0" /></td>
              <td>[°]</td>
            </tr>
            <tr>
              <td>P<sub>x</sub></td>
              <td><input type="number" step="any" id="id_Px" name="Px" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[kN]</td>
            </tr>
            <tr>
              <td>P<sub>z</sub></td>
              <td><input type="number" step="any" id="id_P" name="P" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[kN]</td>
            </tr>
            <tr>
              <td>M</td>
              <td><input type="number" step="any" id="id_M" name="M" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[kNm]</td>
            </tr>
          </tbody>
        </table>
        <p class="hinweis">${msg('x ab Beginn des elastischen Stabteils. Bezug Stabachse mit α = 0: Px längs, Pz senkrecht zum Stab.')}</p>
      </div>

      <div id="id_temperatur" style="display:none;">
        <p>${msg('Temperatur an Unter- und Oberseite')}</p>
        <p>
          T<sub>u</sub>
          <input type="number" step="any" id="id_Tu" name="Tu" pattern="[0-9.,eE+-]*" value="" />
          [°]<br />
          T<sub>o</sub>
          <input type="number" step="any" id="id_To" name="To" pattern="[0-9.,eE+-]*" value="" />
          [°]
        </p>
      </div>

      <div id="id_vorspannung" style="display:none;">
        <p>${msg('Zentrische Vorspannung')}</p>
        <p>
          σ<sub>v</sub>
          <input type="number" step="any" id="id_sigmaV" name="sigmaV" pattern="[0-9.,eE+-]*" value="" />
          [N/mm²]
        </p>
      </div>

      <div id="id_spannschloss" style="display:none;">
        <p>${msg('Spannschloss')}</p>
        <p>
          &Delta;s
          <input type="number" step="any" id="id_ds" name="ds" pattern="[0-9.,eE+-]*" value="" />
          [mm]
        </p>
      </div>

      <div id="id_vorverformungen" style="display:none;">
        <p>${msg('Stabvorverformungen (nur bei Th.II.O.)')}</p>
        <p>
          <select id="id_w0_eingabeart" @change="${this._w0_eingabeart_changed}">
            <option value="0" selected>${msg('Anfang, Stich, Ende')}</option>
            <option value="1">${msg('Ordinaten Anfang, Mitte, Ende')}</option>
          </select>
        </p>
        <table id="einstellungen_table">
          <tbody>
            <tr>
              <td>w<sub>0a</sub></td>
              <td><input type="number" step="any" id="id_w0a" name="w0a" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[mm]</td>
            </tr>
            <tr>
              <td><span id="id_w0m_stich">w<sub>0m</sub> (${msg('Stich')})</span><span id="id_w0m_mitte" style="display:none;">w<sub>0</sub> (${msg('Mitte')})</span></td>
              <td><input type="number" step="any" id="id_w0m" name="w0m" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[mm]</td>
            </tr>
            <tr>
              <td>w<sub>0e</sub></td>
              <td><input type="number" step="any" id="id_w0e" name="w0e" pattern="[0-9.,eE+-]*" value="" /></td>
              <td>[mm]</td>
            </tr>
          </tbody>
        </table>
      </div>

      <form method="dialog">
        <!-- <sl-button id="Anwenden" value="anwenden" @click="${this._dialog_anwenden}">Anwenden</sl-button> -->
        <sl-button id="OK" value="ok" @click="${this._dialog_ok}">${msg('ok')}</sl-button>
        <sl-button id="Abbruch" value="cancel" @click="${this._dialog_abbruch}">${msg('Abbrechen')}</sl-button>
      </form>
    </dialog>`;
  }

  _dialog_anwenden() {
    console.log("dialog_anwenden");
    const shadow = this.shadowRoot;
    if (shadow) {
      window.dispatchEvent(new Event("click_stab_element_elast"));
    }
  }

  _dialog_ok() {
    console.log("dialog_ok");
    let el = this.shadowRoot?.getElementById("id_typ") as SlSelect;
    console.log("gewählte Belastungsart = ", el.value);
    let typ = Number(el.value);
    if (typ === 0) {
      if (this.get_pa() === 0 && this.get_pe() === 0) {
        alertdialog("ok", msg('Streckenlast darf nicht null sein'));
        return;
      }
      const xa = this.get_xa(), xb = this.get_xb();
      if (!isFinite(xa) || !isFinite(xb) || xa < 0 || (xb !== -1 && xb <= xa)) {
        alertdialog("ok", msg('Lastanfang xa muss >= 0 sein und Lastende xe größer als xa (oder −1 für bis Stabende)'));
        return;
      }
    } else if (typ === 1) {
      if (this.get_Px() === 0 && this.get_P() === 0 && this.get_M() === 0) {
        alertdialog("ok", msg('Einzellasten dürfen nicht null sein'));
        return;
      }
    }

    (this.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).close("ok");
  }

  _dialog_abbruch() {
    console.log("dialog_abbruch");
    const shadow = this.shadowRoot;
    if (shadow) (shadow.getElementById("dialog_elementlast") as HTMLDialogElement).close("cancel");
  }

  get_lastfall() {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    return Number(el.value);
  }
  get_art() {
    let el = this.shadowRoot?.getElementById("id_art") as SlSelect;
    console.log("gewählte Belastungsart = ", el.value);
    return Number(el.value);
  }
  get_typ() {
    let el = this.shadowRoot?.getElementById("id_typ") as SlSelect;
    //console.log("gewählte Belastungsart = ", el.value)
    return Number(el.value);
  }
  set_typ(typ: string) {
    let el = this.shadowRoot?.getElementById("id_typ") as SlSelect;
    el.value = typ;
    this._handleChange();
  }

  get_pa() {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_pa") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_pe() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_pe") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  get_xa() {
    return Number((this.shadowRoot?.getElementById("id_xa") as HTMLInputElement).value.replace(/,/g, "."));
  }
  get_xb() {
    const wert = (this.shadowRoot?.getElementById("id_xb") as HTMLInputElement).value.trim();
    if (wert === '') return -1;   // leer = bis Stabende
    return Number(wert.replace(/,/g, "."));
  }
  set_xa(wert: number) {
    (this.shadowRoot?.getElementById("id_xa") as HTMLInputElement).value = String(wert);
  }
  set_xb(wert: number) {
    (this.shadowRoot?.getElementById("id_xb") as HTMLInputElement).value = String(wert);
  }

  // Einzellast: P = Pz, dazu Px, alpha [°] und Bezug (true = Stabachse, false = global)
  get_Px() {
    return Number((this.shadowRoot?.getElementById("id_Px") as HTMLInputElement).value.replace(/,/g, "."));
  }
  set_Px(wert: number) {
    (this.shadowRoot?.getElementById("id_Px") as HTMLInputElement).value = String(wert);
  }
  get_alpha() {
    return Number((this.shadowRoot?.getElementById("id_alpha") as HTMLInputElement).value.replace(/,/g, "."));
  }
  set_alpha(wert: number) {
    (this.shadowRoot?.getElementById("id_alpha") as HTMLInputElement).value = String(wert);
  }
  get_stabbezug() {
    return (this.shadowRoot?.getElementById("id_bezug") as HTMLSelectElement).value === "1";
  }
  set_stabbezug(wert: boolean) {
    (this.shadowRoot?.getElementById("id_bezug") as HTMLSelectElement).value = wert ? "1" : "0";
  }

  // Stabvorverformung: 0 = Anfang, Stich, Ende; 1 = Ordinaten Anfang, Mitte, Ende
  get_w0_eingabeart() {
    return Number((this.shadowRoot?.getElementById("id_w0_eingabeart") as HTMLSelectElement).value);
  }
  set_w0_eingabeart(wert: number) {
    (this.shadowRoot?.getElementById("id_w0_eingabeart") as HTMLSelectElement).value = String(wert);
    this._w0_eingabeart_changed();
  }
  _w0_eingabeart_changed() {
    const stich = this.shadowRoot?.getElementById("id_w0m_stich") as HTMLElement;
    const mitte = this.shadowRoot?.getElementById("id_w0m_mitte") as HTMLElement;
    if (!stich || !mitte) return;
    const ordinaten = this.get_w0_eingabeart() === 1;
    stich.style.display = ordinaten ? "none" : "inline";
    mitte.style.display = ordinaten ? "inline" : "none";
  }

  get_Tu() {
    const shadow = this.shadowRoot;
    //console.log("id_x", (shadow?.getElementById("id_x") as HTMLInputElement).value);
    let wert = Number((shadow?.getElementById("id_Tu") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_To() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_To") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_x() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_x") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_P() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_P") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_M() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_M") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_sigmaV() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_sigmaV") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_ds() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_ds") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_w0a() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_w0a") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_w0m() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_w0m") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }
  get_w0e() {
    const shadow = this.shadowRoot;
    let wert = Number((shadow?.getElementById("id_w0e") as HTMLInputElement).value.replace(/,/g, "."));
    return wert;
  }

  set_lastfall(wert: number) {
    let el = this.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
    el.value = String(wert);
  }
  set_art(wert: number) {
    let el = this.shadowRoot?.getElementById("id_art") as HTMLInputElement;
    el.value = String(wert);
  }

  set_pa(wert: number) {
    let el = this.shadowRoot?.getElementById("id_pa") as HTMLInputElement;
    el.value = String(wert);
  }
  set_pe(wert: number) {
    let el = this.shadowRoot?.getElementById("id_pe") as HTMLInputElement;
    el.value = String(wert);
  }

  set_Tu(wert: number) {
    let el = this.shadowRoot?.getElementById("id_Tu") as HTMLInputElement;
    el.value = String(wert);
  }
  set_To(wert: number) {
    let el = this.shadowRoot?.getElementById("id_To") as HTMLInputElement;
    el.value = String(wert);
  }

  set_x(wert: number) {
    let el = this.shadowRoot?.getElementById("id_x") as HTMLInputElement;
    el.value = String(wert);
  }
  set_P(wert: number) {
    let el = this.shadowRoot?.getElementById("id_P") as HTMLInputElement;
    el.value = String(wert);
  }
  set_M(wert: number) {
    let el = this.shadowRoot?.getElementById("id_M") as HTMLInputElement;
    el.value = String(wert);
  }
  set_sigmaV(wert: number) {
    let el = this.shadowRoot?.getElementById("id_sigmaV") as HTMLInputElement;
    el.value = String(wert);
  }
  set_ds(wert: number) {
    let el = this.shadowRoot?.getElementById("id_ds") as HTMLInputElement;
    el.value = String(wert);
  }
  set_w0a(wert: number) {
    let el = this.shadowRoot?.getElementById("id_w0a") as HTMLInputElement;
    el.value = String(wert);
  }
  set_w0m(wert: number) {
    let el = this.shadowRoot?.getElementById("id_w0m") as HTMLInputElement;
    el.value = String(wert);
  }
  set_w0e(wert: number) {
    let el = this.shadowRoot?.getElementById("id_w0e") as HTMLInputElement;
    el.value = String(wert);
  }

  _handleChange() {
    console.log("_handleChange");
    let el = this.shadowRoot?.getElementById("id_streckenlast") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_einzellast") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_temperatur") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_vorspannung") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_spannschloss") as HTMLDivElement;
    el.style.display = "none";
    el = this.shadowRoot?.getElementById("id_vorverformungen") as HTMLDivElement;
    el.style.display = "none";

    let wert = (this.shadowRoot?.getElementById("id_typ") as SlRadioGroup).value;
    console.log("id_radio_group ", wert);

    if (wert === "0") {
      el = this.shadowRoot?.getElementById("id_streckenlast") as HTMLDivElement;
      el.style.display = "block";
    } else if (wert === "1") {
      el = this.shadowRoot?.getElementById("id_einzellast") as HTMLDivElement;
      el.style.display = "block";
    } else if (wert === "2") {
      el = this.shadowRoot?.getElementById("id_temperatur") as HTMLDivElement;
      el.style.display = "block";
    } else if (wert === "3") {
      el = this.shadowRoot?.getElementById("id_vorspannung") as HTMLDivElement;
      el.style.display = "block";
    } else if (wert === "4") {
      el = this.shadowRoot?.getElementById("id_spannschloss") as HTMLDivElement;
      el.style.display = "block";
    } else if (wert === "5") {
      el = this.shadowRoot?.getElementById("id_vorverformungen") as HTMLDivElement;
      el.style.display = "block";
    }

    this.shadowRoot?.getElementById("OK")?.focus();
  }


  set_system(system: number) {
    console.log("ßßßßßßßßßß ßßßßßß set_system", system)
    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_typ_einzellasten") as SlRadioButton;

    if (system === 0) {
      el.disabled = false;

    } else {
      el.disabled = true;
    }
  }

  set_display_group_typ(value: boolean) {

    const shadow = this.shadowRoot;
    let el = shadow?.getElementById("id_typ") as SlRadioGroup;

    if (value) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }
}
