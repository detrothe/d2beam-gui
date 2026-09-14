
class DrAbout extends HTMLElement {
    connectedCallback() {
        this.innerHTML =  /* html */ `
      <h1>Über d2beam</h1>
      <p>d2beam ist eine Web‑Anwendung zur Analyse von 2D‑Rahmenstrukturen.</p>
      <p> Die Berechnung erfolgt vollständig im Browser und nutzt WebAssembly, ohne Server
          und ohne Installation. Die App ist als Progressive Web App (PWA) verfügbar
          und kann auf allen Geräten offline genutzt werden.</p>

      <h2>Dokumentation</h2>
      <ul>
        <li><a href="/Kurzdokumentation_deutsch0.html">Deutsch</a></li>
        <li><a href="/Kurzdokumentation_english.html">English</a></li>
        <li><a href="/Kurzdokumentation_spanish.html">Español</a></li>
      </ul>
    `;
    }
}

customElements.define('dr-about', DrAbout);



// // --- CSS separat, damit VS Code es farbig darstellt ---
// const styles = /* css */ `
//   .wrapper {
//     display: flex;
//     justify-content: center;
//     padding: 40px 20px;
//   }

//   .container {
//     max-width: 1024px;
//     width: 100%;
//     margin: 0 auto;
//     font-family: Arial, sans-serif;
//     color: #333;
//     line-height: 1.6;
//   }

//   h1 {
//     font-size: 36px;
//     margin-bottom: 20px;
//     text-align: center;
//   }

//   h2 {
//     font-size: 26px;
//     margin-top: 40px;
//     margin-bottom: 10px;
//   }

//   p {
//     font-size: 20px;
//     margin-bottom: 20px;
//   }

//   ul {
//     list-style: none;
//     padding: 0;
//   }

//   ul li {
//     margin-bottom: 12px;
//   }

//   a.doc-link {
//     font-size: 20px;
//     color: #0078d4;
//     text-decoration: none;
//     padding: 8px 0;
//     display: inline-block;
//   }

//   a.doc-link:hover {
//     text-decoration: underline;
//   }

//   @media (max-width: 600px) {
//     h1 { font-size: 28px; }
//     h2 { font-size: 22px; }
//     p, a.doc-link { font-size: 18px; }
//   }
// `;

// class DrAbout extends HTMLElement {
//     connectedCallback() {
//         this.innerHTML = /* html */ `
//       <style>${styles}</style>

//       <div class="wrapper">
//         <div class="container">
//           <h1>Über D2Beam</h1>

//           <p>
//             D2Beam ist eine moderne Web‑Anwendung zur Analyse von 2D‑Rahmenstrukturen.
//             Die Berechnung erfolgt vollständig im Browser über WebAssembly, ohne Server
//             und ohne Installation. Die App ist als Progressive Web App (PWA) verfügbar
//             und kann auf allen Geräten offline genutzt werden.
//           </p>

//           <h2>Kurzdokumentationen</h2>
//           <p>Die folgenden Dokumentationen erklären die Bedienung und die mathematischen Grundlagen:</p>

//           <ul>
//             <li><a class="doc-link" href="/Kurzdokumentation_deutsch.html">📘 Deutsch</a></li>
//             <li><a class="doc-link" href="/Kurzdokumentation_english.html">📗 English</a></li>
//             <li><a class="doc-link" href="/Kurzdokumentation_spanish.html">📙 Español</a></li>
//           </ul>

//           <h2>Technische Hinweise</h2>
//           <p>
//             D2Beam nutzt Web Components, Vite, WebAssembly und ein leichtes SPA‑Routing,
//             um eine schnelle und stabile Benutzererfahrung zu gewährleisten. Die Anwendung
//             ist vollständig offlinefähig, wenn sie als PWA installiert wurde.
//           </p>
//         </div>
//       </div>
//     `;
//     }
// }

// customElements.define('dr-about', DrAbout);
