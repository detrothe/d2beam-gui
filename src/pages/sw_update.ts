/// <reference types="vite-plugin-pwa/client" />
/*
  Service Worker und Prüfung auf neue Versionen.

  registerType "prompt" (vite.config.mts): Eine neue Version wird im Hintergrund geladen, übernimmt
  aber erst, wenn der Nutzer im Dialog zustimmt. Vor dem Neuladen wird die aktuelle Eingabe
  gespeichert (current_input_D2BEAM_GUI, beim Start von autoEingabeLesen() in index.ts gelesen).

  Geprüft wird beim Start (macht der Browser selbst), beim Zurückkehren in die App und per Timer,
  jeweils höchstens einmal in 24 Stunden. Eine geschlossene oder im Hintergrund eingefrorene App
  prüft nicht – nachts zu prüfen geht deshalb nicht.
*/
import { registerSW } from 'virtual:pwa-register';
import { msg } from '@lit/localize';
import { confirmdialog } from './confirm_dialog';
import { str_inputToJSON } from './dateien';

const PRUEF_ABSTAND_MS = 24 * 60 * 60 * 1000;
const LETZTE_PRUEFUNG_KEY = 'sw_letzte_pruefung_D2BEAM_GUI';

let dialog_offen = false;

function letzte_pruefung(): number {
    try {
        return Number(localStorage.getItem(LETZTE_PRUEFUNG_KEY)) || 0;
    } catch {
        return 0;
    }
}

function merke_pruefung() {
    try {
        localStorage.setItem(LETZTE_PRUEFUNG_KEY, String(Date.now()));
    } catch { /* localStorage nicht verfügbar */ }
}

export function starte_versionspruefung() {
    if (!('serviceWorker' in navigator)) return;

    const updateSW = registerSW({
        immediate: true,

        async onNeedRefresh() {
            if (dialog_offen) return;
            dialog_offen = true;
            try {
                const ok = await confirmdialog(msg('Jetzt neu laden'), msg('Später'),
                    msg('Es gibt eine neue Version. Jetzt neu laden? Die aktuelle Eingabe bleibt erhalten.'));
                if (ok) {
                    // vor dem load-Event ist die gespeicherte Eingabe noch nicht eingelesen (index.ts),
                    // dann nicht mit der leeren Eingabe überschreiben
                    if (document.readyState === 'complete') try {
                        localStorage.setItem('current_input_D2BEAM_GUI', str_inputToJSON());
                    } catch (e) {
                        console.error('Versionsprüfung: Eingabe konnte nicht gespeichert werden', e);
                    }
                    await updateSW(true);   // neuen Service Worker aktivieren und Seite neu laden
                }
            } finally {
                dialog_offen = false;
            }
        },

        onRegisteredSW(swUrl, registration) {
            if (!registration) return;
            merke_pruefung();   // beim Registrieren prüft der Browser selbst

            const pruefen = async () => {
                if (Date.now() - letzte_pruefung() < PRUEF_ABSTAND_MS) return;
                if (registration.installing || !navigator.onLine) return;
                merke_pruefung();
                try {
                    const resp = await fetch(swUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
                    if (resp.status === 200) await registration.update();
                } catch (e) {
                    console.log('Versionsprüfung fehlgeschlagen', e);
                }
            };

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') pruefen();
            });
            setInterval(pruefen, 60 * 60 * 1000);   // stündlich nachsehen, ob 24 h um sind
        },

        onRegisterError(error) {
            console.log('Service Worker Registrierung fehlgeschlagen', error);
        },
    });
}
