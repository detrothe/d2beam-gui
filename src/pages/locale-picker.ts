/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getLocale, setLocaleFromUrl } from './localization';
import { allLocales } from './../generated/locale-codes.js';
import { localized } from '@lit/localize';

const localeNames: {
    [L in typeof allLocales[number]]: string;
} = {
    de: 'Deutsch',
    "en-GB": 'English',
    'es-ES': 'Español'
};

// Note we use updateWhenLocaleChanges here so that we're always up to date with
// the active locale (the result of getLocale()) when the locale changes via a
// history navigation.
@localized()
@customElement('locale-picker')
export class LocalePicker extends LitElement {
    render() {
        return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map(
            (locale) =>
                html`<option value=${locale} ?selected=${locale === getLocale()}>
              ${localeNames[locale]}
            </option>`
        )}
      </select>
    `;
    }

    localeChanged(event: Event) {
        const newLocale = (event.target as HTMLSelectElement).value;
        if (newLocale !== getLocale()) {
            const url = new URL(window.location.href);
            url.searchParams.set('locale', newLocale);
            window.history.pushState(null, '', url.toString());
            setLocaleFromUrl();
        }
    }
}