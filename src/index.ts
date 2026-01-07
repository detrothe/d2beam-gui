console.log("Anfang 0 index.ts")

import {msg} from '@lit/localize';
import {allLocales} from './generated/locale-codes.js';

// import './styles/global.css';
import './styles/contextMenu.css';
import './styles/dr-drawer.css';

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
if (process.env.NODE_ENV !== "development") {
    console.log = () => { };
}


// import {configureTransformLocalization} from '@lit/localize';

// export const {getLocale} = configureTransformLocalization({
//   sourceLocale: 'de',
// });
console.log("Anfang index.ts")
//import './pages/haupt';
import './components/dr-haupt'
//import './pages/haupt3'

import { write } from './pages/utility'
import { str_inputToJSON, read_daten } from './pages/dateien'
// import { rechnen } from './pages/rechnen'
// import { ConfirmDialog } from './pages/confirm_dialog';
import { init_cad, init_two_cad } from './pages/cad';
import { reset_controlpanel_grafik } from './pages/grafik';
import { reset_gui } from './components/dr-control-panel.js';

const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
console.log(msg("isAndroid ="), isAndroid, navigator.userAgent.toLowerCase().indexOf("android"))

console.log("userAgent", navigator.userAgent);
console.log('navigator ', navigator)
//write('navigator: ' + navigator.maxTouchPoints + ' | ' + navigator.platform + ' | ' + navigator.userAgent)

console.log("allLocales",allLocales);
//console.log("getLocale",getLocale());

function getBrowserName(userAgent: string) {
    // The order matters here, and this may report false positives for unlisted browsers.

    if (userAgent.includes("Firefox")) {
        // "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0"
        return "Mozilla Firefox";
    } else if (userAgent.includes("SamsungBrowser")) {
        // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36"
        return "Samsung Internet";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        // "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 OPR/90.0.4480.54"
        return "Opera";
    } else if (userAgent.includes("Edge")) {
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
        return "Microsoft Edge (Legacy)";
    } else if (userAgent.includes("Edg")) {
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Edg/104.0.1293.70"
        return "Microsoft Edge (Chromium)";
    } else if (userAgent.includes("Chrome")) {
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        return "Google Chrome or Chromium";
    } else if (userAgent.includes("Safari")) {
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1"
        return "Apple Safari";
    } else {
        return "unknown";
    }
}

function getOS(): string {
    const userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = 'undefined';

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}

const browserName = getBrowserName(navigator.userAgent);
console.log(`You are using: ${browserName}`);
write('dein Browser: ' + browserName);
const maxTouchPoints = navigator.maxTouchPoints;

let yourOS: string;
if (browserName === 'Apple Safari' && maxTouchPoints > 0) {
    yourOS = 'iOS';
} else {
    yourOS = getOS();
}
write('dein OS: ' + yourOS);


// let dbPromise: any;
let input: string | null;

input = ''


if (isAndroid) {

    window.addEventListener('load', () => {
        input = window.localStorage.getItem('current_input_D2BEAM_GUI');
        //write('Android, LOAD  current input = ' + input.length)
        //console.log('LOAD  current input = ', input.length)
        if (input !== null && input.length > 0) {
            autoEingabeLesen();
            // read_daten(input);
            // rechnen(1)
        }
    });


    //     // window.addEventListener('popstate', function (event) {
    //     //     write('Android popstate')
    //     //     window.history.pushState({}, '')
    //     //     event.preventDefault();
    //     // })

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();
        // Google Chrome < 119 requires returnValue to be set.
        //event.returnValue = true;

        //write("Android, beforeunload")

        window.localStorage.setItem('current_input_D2BEAM_GUI', str_inputToJSON());

    });

    document.addEventListener('visibilitychange', function () {
        //write(navigator.userAgent);
        //write('Android visibilitychange = ' + document.visibilityState)
        // fires when user switches tabs, apps, goes to homescreen, etc.
        if (document.visibilityState === 'hidden') {
            //write('Android hidden')
            window.localStorage.setItem('current_input_D2BEAM_GUI', str_inputToJSON());
        }

        // fires when app transitions from prerender, user returns to the app / tab.
        if (document.visibilityState === 'visible') {
            //write('Android visible');
            //two_cad_update();
            init_cad(2);
        }
    });

    //     window.addEventListener('beforeunload', function (event) {
    //         //window.alert('beforeunload');
    //         event.preventDefault();
    //         // Google Chrome requires returnValue to be set.
    //         event.returnValue = '';
    //         //write("beforeunload " + event)

    //         // if (dbPromise) {
    //         //     dbPromise.then(db => db.close());
    //         //     dbPromise = null;
    //         // }
    //         window.localStorage.setItem('current_input', str_inputToJSON());

    //     });

    //     window.addEventListener('pageshow', (event) => {
    //         if (event.persisted) {
    //             write('This page was restored from the bfcache.');
    //         } else {
    //             write('This page was loaded normally.');
    //             // openDB();
    //             const input = window.localStorage.getItem('current_input');
    //             write('PAGE SHOW  current input = ' + input)
    //         }
    //     });

    //     window.addEventListener('pagehide', (event) => {
    //         if (event.persisted) {
    //             write('This page *might* be entering the bfcache.');
    //             //window.alert('This page *might* be entering the bfcache.');
    //         } else {
    //             write('This page will unload normally and be discarded.');
    //             //window.alert('This page will unload normally and be discarded.');
    //         }
    //     });

    //     // window.addEventListener('load', function () {
    //     //     write('Android load')
    //     //     window.history.pushState({ noBackExitsApp: true }, '')
    //     //     // window.history.back();
    //     //     // window.history.forward();
    //     // })

    //     // window.addEventListener('popstate', function (event) {
    //     //     write('Android popstate'+event.state)
    //     //     if (event.state && event.state.noBackExitsApp) {
    //     //         window.history.pushState({ noBackExitsApp: true }, '')
    //     //         // window.history.back();
    //     //         // window.history.forward();
    //     //     }
    //     // })




}
else if (yourOS === 'iOS') {

    window.addEventListener('load', () => {
        input = window.localStorage.getItem('current_input_D2BEAM_GUI');
        //write('iOS, LOAD  current input = ' + input.length)
        //console.log('LOAD  current input = ', input.length)
        if (input !== null && input.length > 0) {
            autoEingabeLesen();
        }
    });

    document.addEventListener('visibilitychange', function () {
        //write(navigator.userAgent);
        //write('Android visibilitychange = ' + document.visibilityState)
        // fires when user switches tabs, apps, goes to homescreen, etc.
        if (document.visibilityState === 'hidden') {
            //write('visibility changed to hidden')
            window.localStorage.setItem('current_input_D2BEAM_GUI', str_inputToJSON());
        }

        // fires when app transitions from prerender, user returns to the app / tab.
        if (document.visibilityState === 'visible') {
            //write('visibility changed to visible');
            //init_cad(2);
        }
    });

}
else {

    // Damit man nicht versehentlich das Browserfenster löscht und Eingaben verliert

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();
        // Google Chrome < 119 requires returnValue to be set.
        event.returnValue = true;
        console.log("else, beforeunload", navigator.userAgent)

        // if (dbPromise) {
        //     dbPromise.then(db => db.close());
        //     dbPromise = null;
        // }

        let output = str_inputToJSON();
        console.log("inputToJSON", output)
        window.localStorage.setItem('current_input_D2BEAM_GUI', output);

    });

    // document.addEventListener('visibilitychange', function () {
    //     //write(navigator.userAgent);
    //     //write('Android visibilitychange = ' + document.visibilityState)
    //     // fires when user switches tabs, apps, goes to homescreen, etc.
    //     if (document.visibilityState === 'hidden') {
    //         write('visibility changed to hidden')
    //         window.localStorage.setItem('current_input_D2BEAM_GUI', str_inputToJSON());
    //     }

    //     // fires when app transitions from prerender, user returns to the app / tab.
    //     if (document.visibilityState === 'visible') {
    //         write('visibility changed to visible');
    //         //init_cad(2);
    //     }
    // });



    // if ('launchQueue' in window) {
    //     console.log('File Handling API is supported!');

    //     //@ts-ignore
    //     launchQueue.setConsumer(launchParams => {
    //         handleFiles(launchParams.files);
    //     });
    // } else {
    //     console.error('File Handling API is not supported!');
    // }


    // window.addEventListener('pageshow', (event) => {
    //     if (event.persisted) {
    //         //write('This page was restored from the bfcache.');
    //     } else {
    //         //write('This page was loaded normally.');
    //         // openDB();
    //         const input = window.localStorage.getItem('current_input');
    //         //write('current input = ' + input)

    //     }
    // });

    window.addEventListener('load', () => {
        //if (yourOS !== 'iOS') {
        input = window.localStorage.getItem('current_input_D2BEAM_GUI');
        //write('else, LOAD  current input = ' + input.length)
        //console.log('LOAD  current input = ', input.length)
        if (input !== null && input.length > 0) {
            autoEingabeLesen();
        }
        //}
    });

    // document.addEventListener("readystatechange", (event: any) => {
    //     console.log("readystatechange", event.target.readyState, document.readyState)
    //     console.log('LOADED  current input = ', input)
    //     if (event.target.readyState === "complete") {
    //         //if (input) read_daten(input);;
    //     }
    // });

}

// async function handleFiles(files: any) {
//     for (const file of files) {
//         const blob = await file.getFile();
//         blob.handle = file;
//         const text = await blob.text();

//         console.log(`${file.name} handled, content: ${text}`);
//     }
// }

/*async*/ function autoEingabeLesen() {
    // const dialog = new ConfirmDialog({
    //     trueButton_Text: 'ja',
    //     falseButton_Text: 'nein',
    //     question_Text: 'letzte (automatisch) gespeicherte Eingabe einlesen'
    // });
    // const letzteEinlesen = await dialog.confirm();

    //write("letzteEinlesen= " + letzteEinlesen)

    const letzteEinlesen = true

    console.log("autoEingabeLesen, letzteEinlesen",letzteEinlesen)
    if (letzteEinlesen) {
        if (input !== null) read_daten(input);
        init_two_cad();
        init_cad(0);
        reset_gui();
        reset_controlpanel_grafik();
        //rechnen(1)
    }

}

// function openDB() {
//     if (!dbPromise) {
//         dbPromise = new Promise((resolve, reject) => {
//             const req = indexedDB.open('my-db', 1);
//             req.onupgradeneeded = () => req.result.createObjectStore('keyval');
//             req.onerror = () => reject(req.error);
//             req.onsuccess = () => resolve(req.result);
//         });
//     }
//     return dbPromise;
// }
