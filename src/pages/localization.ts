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

const alleSprachen: readonly string[] = [sourceLocale, ...targetLocales];

/** Sprache aus dem URL-Parameter ?lang=de|en|es|fr|it (Sprachversionen für Suchmaschinen, hreflang) */
function urlSprache(): string | null {
  const lang = new URLSearchParams(window.location.search).get('lang')?.toLowerCase().split('-')[0];
  return alleSprachen.find(l => l.toLowerCase().split('-')[0] === lang) ?? null;
}

/**
 * Sprache beim Start: ?lang= in der URL, sonst gespeicherte Auswahl, sonst auf fea-apps.de Englisch und auf
 * statikverstehen.de Deutsch (auch für Suchmaschinen, die mit englischer Browsersprache rendern),
 * sonst Browsersprache, wenn es eine Übersetzung gibt, sonst Englisch.
 */
function startSprache(): string {
  const ausUrl = urlSprache();
  if (ausUrl) return ausUrl;

  let gespeichert: string | null = null;
  try {
    gespeichert = window.localStorage.getItem('locale');
  } catch { /* kein localStorage */ }
  if (gespeichert && alleSprachen.includes(gespeichert)) {
    console.log("Locale from localStorage=", gespeichert)
    return gespeichert;
  }

  if (/(^|\.)fea-apps\.de$/.test(window.location.hostname)) return 'en-GB';
  if (/(^|\.)statikverstehen\.de$/.test(window.location.hostname)) return 'de';

  if (browserLanguage === 'de') return 'de';
  const browserLocales: { [key: string]: string } = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
  return browserLocales[browserLanguage] ?? 'en-GB';
}

/** Adressen der veröffentlichten Ausgaben (Deutsch auf statikverstehen.de, die anderen Sprachen auf fea-apps.de) */
const URL_DE = 'https://d2beam-gui.statikverstehen.de/';
const URL_INTL = 'https://d2beam.fea-apps.de/';

/** kanonische Adresse je Sprache, passend zu den hreflang-Links in index.html */
function kanonischeUrl(locale: string): string {
  if (locale === 'de') return URL_DE;
  if (locale === 'en-GB') return URL_INTL;
  return `${URL_INTL}?lang=${locale.split('-')[0]}`;
}

/** Seitentitel und Beschreibung je Sprache (für Suchmaschinen und den Browser-Tab) */
const SEITEN_META: { [locale: string]: { titel: string; beschreibung: string } } = {
  'de': {
    titel: 'd2beam – Ebene Stabwerke und Fachwerke berechnen | FEM, Theorie I. und II. Ordnung, Knicklast',
    beschreibung: 'Kostenloses Stabwerkprogramm im Browser: ebene Rahmen und Fachwerke mit der FEM, Theorie I. und ' +
      'II. Ordnung, Vorverformungen und Imperfektionen, Knickeigenwerte und alpha_cr, Lastfälle und Kombinationen. ' +
      'Grafische Eingabe mit Maus, Stift oder Finger, offline als App.',
  },
  'en-GB': {
    titel: 'd2beam – 2D frame and truss analysis | FEM, first and second order, buckling load',
    beschreibung: 'Free structural analysis web app for plane frames and trusses (FEM): first and second order ' +
      'analysis, Timoshenko and Bernoulli beams, imperfections, buckling eigenvalues and alpha_cr, load cases ' +
      'and combinations. Graphical input with mouse, pen or finger, works offline.',
  },
  'es-ES': {
    titel: 'd2beam – Cálculo de pórticos y celosías planas | MEF, primer y segundo orden, carga crítica',
    beschreibung: 'Aplicación web gratuita de cálculo estructural de pórticos y celosías planas (MEF): análisis de ' +
      'primer y segundo orden, imperfecciones, carga crítica de pandeo y alpha_cr, casos de carga y ' +
      'combinaciones. Entrada gráfica con ratón, lápiz o dedo, funciona sin conexión.',
  },
  'fr-FR': {
    titel: 'd2beam – Calcul de portiques et treillis plans | MEF, premier et second ordre, charge critique',
    beschreibung: 'Application web gratuite de calcul de structures pour portiques et treillis plans (MEF) : ' +
      'analyse au premier et second ordre, imperfections, charge critique de flambement et alpha_cr, cas de ' +
      'charge et combinaisons. Saisie graphique à la souris, au stylet ou au doigt, fonctionne hors ligne.',
  },
  'it-IT': {
    titel: 'd2beam – Calcolo di telai e travature reticolari piane | FEM, primo e secondo ordine, carico critico',
    beschreibung: 'App web gratuita di calcolo strutturale per telai e travature reticolari piane (FEM): analisi ' +
      'del primo e secondo ordine, imperfezioni, carico critico di instabilità e alpha_cr, casi di carico e ' +
      'combinazioni. Input grafico con mouse, penna o dito, funziona offline.',
  },
};

/** Sprache des Dokuments, Titel, Beschreibung und kanonische Adresse an die aktuelle Sprache anpassen */
function seitenMetaAktualisieren(locale: string): void {
  const meta = SEITEN_META[locale] ?? SEITEN_META['en-GB'];
  document.documentElement.lang = locale.split('-')[0];
  document.title = meta.titel;
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.beschreibung);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = kanonischeUrl(locale);
}

window.addEventListener('lit-localize-status', (event) => {
  if (event.detail.status === 'ready') seitenMetaAktualisieren(event.detail.readyLocale);
});

const locale = startSprache();
seitenMetaAktualisieren(locale);
setLocale(locale);
