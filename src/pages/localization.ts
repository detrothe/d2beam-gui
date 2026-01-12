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

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import(`./../generated/locales/${locale}.ts`),
});

export const setLocaleFromUrl = async () => {
  const url = new URL(window.location.href);
  const locale = url.searchParams.get('locale') || sourceLocale;
  console.log("vor setLocale", msg('Stab'))
  await setLocale(locale);
  console.log("nach setLocale", msg('Stab'))
  //update_button_language();
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
  if (browserLanguage !== "de") setLocale("en-GB");
}
