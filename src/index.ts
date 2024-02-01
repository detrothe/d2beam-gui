//import { LitElement, css } from 'lit';
//import { customElement } from 'lit/decorators.js';

//import {html,render} from 'lit'

import './styles/global.css';
import './styles/contextMenu.css';


import './pages/haupt';

// import {
//     init_tabellen  } from "./pages/rechnen";

//     setTimeout(function(){
//         console.log("Executed after 1 second");
//     }, 1000);
// init_tabellen();

window.addEventListener('beforeunload', function(event) {
    console.log("beforeunload", event)
    //event.returnValue = "Nicht gespeicherte Eingabedaten gehen gehen beim Verlassen der Seite verloren"
    event.preventDefault();
  });

