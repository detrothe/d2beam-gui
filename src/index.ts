
import './styles/global.css';
import './styles/contextMenu.css';


import './pages/haupt';
import { write } from './pages/utility'

const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
console.log("isAndroid =", isAndroid)

let dbPromise: any;

if (isAndroid) {



    window.addEventListener('load', function () {
        write('Android load')
        window.history.pushState({}, '')
        const input = window.localStorage.getItem('current_input');
        write('LOAD  current input = ' + input)
    })

    // window.addEventListener('popstate', function (event) {
    //     write('Android popstate')
    //     window.history.pushState({}, '')
    //     event.preventDefault();
    // })

    document.addEventListener('visibilitychange', function () {
        write('Android visibilitychange = ' + document.visibilityState)
        // fires when user switches tabs, apps, goes to homescreen, etc.
        if (document.visibilityState === 'hidden') { write('Android hidden') }

        // fires when app transitions from prerender, user returns to the app / tab.
        if (document.visibilityState === 'visible') { write('Android visible') }
    });

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();
        // Google Chrome requires returnValue to be set.
        event.returnValue = 'hallo';
        write("beforeunload " + event)

        // if (dbPromise) {
        //     dbPromise.then(db => db.close());
        //     dbPromise = null;
        // }
        window.localStorage.setItem('current_input', 'i-n-p-u-t');

    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            write('This page was restored from the bfcache.');
        } else {
            write('This page was loaded normally.');
            // openDB();
            const input = window.localStorage.getItem('current_input');
            write('PAGE SHOW  current input = ' + input)
        }
    });

    window.addEventListener('pagehide', (event) => {
        if (event.persisted) {
            write('This page *might* be entering the bfcache.');
            window.alert('This page *might* be entering the bfcache.');
        } else {
            write('This page will unload normally and be discarded.');
            window.alert('This page will unload normally and be discarded.');
        }
    });

    // window.addEventListener('load', function () {
    //     write('Android load')
    //     window.history.pushState({ noBackExitsApp: true }, '')
    //     // window.history.back();
    //     // window.history.forward();
    // })

    // window.addEventListener('popstate', function (event) {
    //     write('Android popstate'+event.state)
    //     if (event.state && event.state.noBackExitsApp) {
    //         window.history.pushState({ noBackExitsApp: true }, '')
    //         // window.history.back();
    //         // window.history.forward();
    //     }
    // })




} else {

    // Damit man nicht versehentlich das Browserfenster löscht und Eingaben verliert

    window.addEventListener('beforeunload', function (event) {
        event.preventDefault();
        // Google Chrome requires returnValue to be set.
        event.returnValue = '';
        console.log("beforeunload", event)


        // if (dbPromise) {
        //     dbPromise.then(db => db.close());
        //     dbPromise = null;
        // }

        window.localStorage.setItem('current_input', 'input');

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


    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            write('This page was restored from the bfcache.');
        } else {
            write('This page was loaded normally.');
            // openDB();
            const input = window.localStorage.getItem('current_input');
            write('current input = ' + input)

        }
    });

    window.addEventListener('load', () => {
        const input = window.localStorage.getItem('current_input');
        write('LOAD  current input = ' + input)

    });
}

async function handleFiles(files: any) {
    for (const file of files) {
        const blob = await file.getFile();
        blob.handle = file;
        const text = await blob.text();

        console.log(`${file.name} handled, content: ${text}`);
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
