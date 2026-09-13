class Dr404 extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <h1>404 – Seite nicht gefunden</h1>
      <p>Die angeforderte Seite existiert nicht.</p>
      <p><a href="/">Zurück zur Startseite</a></p>
    `;
    }
}

customElements.define('dr-404', Dr404);
