
import './styles/global.css';
import './styles/contextMenu.css';


import './pages/haupt';

const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

if ( isAndroid) {
    // window.addEventListener('load', function() {
    //     window.history.pushState({}, '')
    //   })

    //   window.addEventListener('popstate', function() {
    //     window.history.pushState({}, '')
    //   })

      window.addEventListener('load', function() {
        window.history.pushState({ noBackExitsApp: true }, '')
      })

      window.addEventListener('popstate', function(event) {
        if (event.state && event.state.noBackExitsApp) {
          window.history.pushState({ noBackExitsApp: true }, '')
        }
      })
}

// Damit man nicht versehentlich das Browserfenster löscht und Eingaben verliert

window.addEventListener('beforeunload', function(event) {
    event.preventDefault();
    // Google Chrome requires returnValue to be set.
    event.returnValue = '';
    console.log("beforeunload", event)
  });

  if ('launchQueue' in window) {
    console.log('File Handling API is supported!');

    //@ts-ignore
    launchQueue.setConsumer(launchParams => {
        handleFiles(launchParams.files);
    });
} else {
    console.error('File Handling API is not supported!');
}

async function handleFiles(files:any) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        const text = await blob.text();

        console.log(`${file.name} handled, content: ${text}`);
    }
}