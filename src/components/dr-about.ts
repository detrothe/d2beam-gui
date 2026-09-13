class DrAbout extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <h1>Über D2Beam</h1>
      <p>D2Beam ist eine Web‑Anwendung zur Analyse von 2D‑Rahmenstrukturen.</p>
      <p>Die Berechnung erfolgt vollständig im Browser über WebAssembly.</p>

      <h2>Dokumentation</h2>
      <ul>
        <li><a href="/src/info/Kurzdokumentation_deutsch.html">Deutsch</a></li>
        <li><a href="/src/info/Kurzdokumentation_english.html">English</a></li>
        <li><a href="/src/info/Kurzdokumentation_spanish.html">Español</a></li>
      </ul>
    `;
    }
}

customElements.define('dr-about', DrAbout);
