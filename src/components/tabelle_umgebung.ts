/*
 * Umgebung für dr-tabelle.ts: alles, was die Tabelle vom Projekt braucht.
 *
 * dr-tabelle.ts, dr-tabelle.css und confirm_dialog.ts werden aus ~/git-code/dr-tabelle verteilt
 * (dr-tabelle-verteilen.sh) und hier nicht geändert. Projektspezifisches gehört in diese Datei.
 * Re-Exporte behalten die lebendige Bindung (nQuerschnittSets, touch_support_table ändern sich zur Laufzeit).
 */

export { nQuerschnittSets, get_querschnittRechteck_name } from '../pages/querschnitte';
export { Detect } from '../pages/haupt';
export { berechnungErforderlich, touch_support_table } from '../pages/globals';
export { write } from '../pages/utility';
export { msg, str } from '@lit/localize';
export { ConfirmDialog } from '../pages/confirm_dialog';
