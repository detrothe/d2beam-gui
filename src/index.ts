
import './styles/global.css';
import './styles/contextMenu.css';


import './pages/haupt';


// Damit man nicht versehentlich das Browserfenster löscht und Eingaben verliert

window.addEventListener('beforeunload', function(event) {
    event.preventDefault();
    // Google Chrome requires returnValue to be set.
    event.returnValue = '';
    console.log("beforeunload", event)
  });
