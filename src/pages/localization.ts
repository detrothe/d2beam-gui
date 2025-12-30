/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {configureLocalization} from '@lit/localize';
import {sourceLocale, targetLocales} from './../generated/locale-codes.js';

document.addEventListener("DOMContentLoaded", (_event) => {
  console.log("DOM fully loaded and parsed");
});

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import(`./../generated/locales/${locale}.ts`),
});

export const setLocaleFromUrl = async () => {
  const url = new URL(window.location.href);
  const locale = url.searchParams.get('locale') || sourceLocale;
  await setLocale(locale);
};

console.log("vor browser language")
let txt = navigator.language;
let txtArray = txt.split("-");

let browserLanguage = txtArray[0];
console.log("your browserLanguage", browserLanguage, txt);
if (browserLanguage !== "de") setLocale("en-GB");
