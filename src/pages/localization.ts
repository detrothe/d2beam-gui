/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { msg, configureLocalization } from '@lit/localize';
import { sourceLocale, targetLocales } from './../generated/locale-codes.js';
//import { update_button_language } from './cad_buttons.js';

document.addEventListener("DOMContentLoaded", (_event) => {
  console.log("DOM fully loaded and parsed", getLocale());
  //update_button_language();
});

// lit-localize schreibt <, > und & in reinen Text-Übersetzungen als &lt; &gt; &amp; in die
// generierten Dateien. Für msg('…') und msg(str`…`) wird das nirgends zurückgewandelt, in Tooltips,
// Platzhaltern und im Ausgabefeld stand dann z. B. wörtlich "&amp;". html`…`-Übersetzungen bleiben
// unverändert, dort löst der HTML-Parser die Entities auf.
const decodeEntities = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

async function loadLocaleDecoded(locale: string) {
  const mod = await import(`./../generated/locales/${locale}.ts`);
  const templates: { [id: string]: any } = {};
  for (const [id, t] of Object.entries(mod.templates as { [id: string]: any })) {
    if (typeof t === 'string') templates[id] = decodeEntities(t);
    else if (t && t.strTag) templates[id] = { ...t, strings: t.strings.map(decodeEntities) };
    else templates[id] = t;
  }
  return { templates };
}

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: loadLocaleDecoded,
});

export const setLocaleFromUrl = async () => {
  const url = new URL(window.location.href);
  const locale = url.searchParams.get('locale') || sourceLocale;
  console.log("vor setLocale", msg('Stab'))
  await setLocale(locale);
  console.log("nach setLocale", msg('Stab'))
  console.log('LOCALE',locale)

};

console.log("vor browser language")
let txt = navigator.language;
let txtArray = txt.split("-");

let browserLanguage = txtArray[0];
console.log("your browserLanguage", browserLanguage, txt);


let locale = window.localStorage.getItem('locale');
if (locale) {
  setLocale(locale);
  console.log("Locale from localStorage=", locale)
}
else {
  // Browsersprache übernehmen, wenn es eine Übersetzung gibt, sonst Englisch
  const browserLocales: { [key: string]: string } = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
  if (browserLanguage !== "de") setLocale(browserLocales[browserLanguage] ?? "en-GB");
}
