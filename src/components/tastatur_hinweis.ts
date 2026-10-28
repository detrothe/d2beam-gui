import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

console.log("TASTATUR HINWEIS")

const HINWEIS_KEY = 'tastaturHinweisGesehen';

class TastaturHinweis extends LitElement {
    static styles = css`
    .hinweis {
      background: #fff3cd;
      border: 1px solid #e0c36a;
      border-radius: 6px;
      padding: 0.6rem 0.8rem;
      margin: 0.5rem 0;
      display: flex;
      gap: 0.8rem;
      align-items: flex-start;
      color: black;
    }
    button { flex: none; }
  `;

    @state() private sichtbar = false;

    connectedCallback() {
        super.connectedCallback();
        this.sichtbar = this.istTouch() && !this.schonGesehen();
    }

    private istTouch(): boolean {
        return matchMedia('(pointer: coarse)').matches;
    }

    private istIOS(): boolean {
        return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
    }

    private schonGesehen(): boolean {
        try {
            return localStorage.getItem(HINWEIS_KEY) === '1';
        } catch {
            return false; // Speicher gesperrt: Hinweis dann bei jedem Start
        }
    }

    private schliessen() {
        this.sichtbar = false;
        try {
            localStorage.setItem(HINWEIS_KEY, '1');
        } catch { /* ignorieren */ }
    }

    render() {
        if (!this.sichtbar) return html``;
        const text = this.istIOS()
            ? 'Das „e“ für Exponenten (z. B. 1e-5) findest du auf der Buchstaben-Tastatur. Wechsle dafür mit der Taste „ABC“ um.'
            : 'Manche virtuellen Tastaturen (z. B. Samsung) bieten keine Tasten für Minus und Exponent (e). Es wird empfohlen die Gboard-Tastatur von Google zu installieren.';
        return html`
      <div class="hinweis" role="note">
        <span>${text}</span>
        <button type="button" @click=${this.schliessen}>Verstanden</button>
      </div>
    `;
    }
}
customElements.define('tastatur-hinweis', TastaturHinweis);