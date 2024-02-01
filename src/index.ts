//import { LitElement, css } from 'lit';
//import { customElement } from 'lit/decorators.js';

//import {html,render} from 'lit'

import './styles/global.css';
import './styles/contextMenu.css';


import './pages/haupt';


//import { ConfirmDialog, AlertDialog } from "./pages/confirm_dialog";



window.addEventListener('beforeunload', function(event) {
    event.preventDefault();
    console.log("beforeunload", event)
    //ttt();
    //event.returnValue = "Nicht gespeicherte Eingabedaten gehen gehen beim Verlassen der Seite verloren"
  });

//   async function ttt() {
//     const dialog = new ConfirmDialog({
//         trueButton_Text: "ja",
//         falseButton_Text: "nein",
//         question_Text: "Lösche Querschnitt: " ,
//       });
//       const loesche = await dialog.confirm();
//   }