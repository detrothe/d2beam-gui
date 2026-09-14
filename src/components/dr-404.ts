class Dr404 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /* html */ `
      <h1>404 – Seite nicht gefunden</h1>
      <p>Die angeforderte Seite existiert nicht.</p>

    `;
  }
}

customElements.define('dr-404', Dr404);

// class Dr404 extends HTMLElement {
//     connectedCallback() {
//         this.innerHTML = `
//       <style>
//         .wrapper {
//           display: flex;
//           justify-content: center;
//           padding: 40px 20px;
//         }

//         .container {
//           max-width: 1024px;
//           width: 100%;
//           margin: 0 auto;
//           text-align: center;
//           font-family: Arial, sans-serif;
//           color: #333;
//         }

//         .icon {
//           font-size: 90px;
//           color: #cc0000;
//           margin-bottom: 20px;
//         }

//         h1 {
//           font-size: 36px;
//           margin-bottom: 10px;
//         }

//         p {
//           font-size: 20px;
//           margin-bottom: 30px;
//         }

//         a.button {
//           display: inline-block;
//           padding: 14px 24px;
//           background: #0078d4;
//           color: white;
//           text-decoration: none;
//           border-radius: 8px;
//           font-size: 20px;
//           transition: background 0.2s ease;
//         }

//         a.button:hover {
//           background: #005fa3;
//         }

//         /* Mobile Optimierung */
//         @media (max-width: 600px) {
//           .icon {
//             font-size: 70px;
//           }
//           h1 {
//             font-size: 28px;
//           }
//           p {
//             font-size: 18px;
//           }
//           a.button {
//             font-size: 18px;
//             padding: 12px 20px;
//           }
//         }
//       </style>

//       <div class="wrapper">
//         <div class="container">
//           <div class="icon">🚫</div>
//           <h1>404 – Seite nicht gefunden</h1>
//           <p>Die angeforderte Seite existiert nicht oder wurde verschoben.</p>
//           <a class="button" href="/">Zurück zur Startseite</a>
//         </div>
//       </div>
//     `;
//     }
// }

// customElements.define('dr-404', Dr404);

