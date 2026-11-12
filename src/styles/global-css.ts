// Styles im Shadow-DOM von dr-haupt (und damit für alles, was dort gerendert wird).
// Regeln für das normale Dokument (html, body, :root-Variablen, Hinweisfenster) stehen in global.css,
// denn Selektoren wie :root, html, body greifen im Shadow-DOM nicht.

import { css } from 'lit';

export const global_css = css`

   sl-tree {
      width: fit-content;
      min-width: 1rem;
      max-width: 100%;
   }

   sl-tree-item::part(item--selected) {
      background-color: transparent;
      border-inline-start-color: var(--sl-color-primary-600);
   }

   sl-tree-item::part(item):hover {
      background-color: transparent;
   }

   sl-tree-item:focus-visible::part(item) {
      background-color: transparent;
      outline: 2px solid var(--sl-color-primary-600);
      outline-offset: -2px;
   }

   @media (prefers-color-scheme: dark) {
      button {
         font-size: 0.875rem;
         border-radius: 4px;
         border-width: 1px;
         border-color: #43434a;
         color: #b6b6be;
         background-color: #1a1a1e;
         padding: 0.4rem;
      }

      select {
         height: 2rem;
         font-size: 0.875rem;
         border-radius: 4px;
         border-width: 1px;
         padding: 0.4rem;
         border-color: #43434a;
         color: #b6b6be;
         background-color: #1a1a1e;
      }

      button:active {
         background-color: hsl(198.4 93.2% 59.6%);
      }

      #id_color_table_text,
      #id_color_table_out,
      #id_accent_color,
      #id_fontsize,
      .input_tab {
         border-color: #43434a;
         color: #b6b6be;
         background-color: #1a1a1e;
      }
   }

   @media (prefers-color-scheme: light) {
      button,
      select {
         font-size: 0.875rem;
         border-radius: 4px;
         border-width: 1px;
         background-color: #ffffff;
         border-color: #d4d4d8;
         color: #444444;
         padding: 0.4rem;
      }

      button:active {
         background-color: hsl(198.4 93.2% 59.6%);
      }

      #id_color_table_text,
      #id_color_table_out,
      #id_accent_color,
      #id_fontsize,
      .input_tab {
         border-color: #d4d4d8;
         color: #444444;
         background-color: #ffffff;
      }
   }

   p {
      padding-left: 5px;
      font-size: 1rem;
   }

   div {
      font-size: 1rem;
   }

   #id_color_table_text,
   #id_color_table_out,
   #id_fontsize {
      font-size: 0.875rem;
      border-radius: 4px;
      border-width: 1px;
      padding: 0.4rem;
      min-width: 100%;
   }

   /* Akzentfarbe + Button "Standard" zusammen so breit wie die Farbfelder darüber */
   .accent_row {
      display: flex;
      gap: 0.25rem;
      align-items: stretch;
   }

   #id_accent_color {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.875rem;
      border-radius: 4px;
      border-width: 1px;
      padding: 0.4rem;
   }

   #id_accent_color_reset {
      flex: none;
   }

   table {
      border: none;
      border-spacing: 1px;
      padding: 0.3125rem;
      margin: 0.3125rem;
      font-size: 1rem;
   }

   .footer {
      color: #181818;
      background-color: #f1f1f1;
      margin: 0;
      padding: 0;
      text-align: center;
      font-size: 0.7rem;
   }

   input {
      font-size: 1rem;
      width: 3.125rem;
      margin: 0;
      padding: 1px;
   }

   .input_tab {
      width: 5rem;
      font-size: 0.875rem;
      border-radius: 4px;
      border-width: 1px;
      padding: 0.4rem;
   }

   input[type='number']::-webkit-inner-spin-button,
   input[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
   }

   /* Firefox */
   input[type='number'] {
      -moz-appearance: textfield;
   }

   .output_container {
      width: 96%;
      border: 0px solid #ffffff;
      margin: 0px;
      padding: 0px;
      margin-left: 2%;
   }

   #output {
      width: 100%;
      height: 100%;
      font-size: 0.875rem;
      font-family:
         system-ui,
         -apple-system,
         BlinkMacSystemFont,
         'Segoe UI',
         Roboto,
         Oxygen,
         Ubuntu,
         'Open Sans',
         'Helvetica Neue',
         sans-serif,
         Verdana,
         Arial,
         Helvetica,
         sans-serif;
      margin: 0px;
      padding: 0px;
      border-width: 0;
   }

   .output_table td,
   .output_table th {
      padding: 0px;
      padding-top: 3px;
      padding-bottom: 3px;
      margin: 0px;
      width: 6rem;
   }

   .table_cell_center {
      text-align: center;
      background-color: #ff7f50;
   }
   .table_cell_center_kombi {
      text-align: center;
      background-color: #ffa000;
   }

   .table_cell_right {
      text-align: right;
      padding-right: 1rem;
      background-color: #cbcbcf80;
   }

   .table_cell_mitte {
      text-align: center;
      padding-right: 1rem;
      background-color: #cbcbcf80;
   }

   /* Bedienfeld und Lastfall-Auswahl nebeneinander: die Auswahl rückt mit, wenn das Bedienfeld
      in einer Sprache mit längeren Texten breiter wird (vorher feste Position, Überlappung in fr/it) */
   #id_grafik_oben {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      right: 0.125rem;
      z-index: 90;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      pointer-events: none;      /* freie Fläche gibt Maus/Touch an die Grafik weiter */
   }
   #id_grafik_oben > * {
      pointer-events: auto;
   }

   #id_grafik_group {
      position: relative;
      flex: 0 1 auto;
      min-width: 0;
      margin: 0;
      padding: 0;
      font-size: 1rem;
   }

   #id_cad_group {
      position: absolute;
      top: 0px;
      left: 0px;
      margin: 0;
      padding: 0;
      font-size: 1rem;
      background-color: var(--group_cad);
   }

   #id_cad_group2 {
      position: absolute;
      top: 20px;
      left: 0px;
      z-index: 90;
      margin: 0;
      padding: 0;
      font-size: 1rem;
      background-color: var(--group_cad);
   }

   #id_div_select_lc {
      z-index: 90;
      margin: 0;
      padding: 0;
      font-size: 1rem;
   }

   #id_select_loadcase {
      font-size: 1rem;
      width: 9.375rem;
      max-width: 100%;
      background-color: #181818;
      color: #f1f1f1;
      margin: 0;
      padding: 4px;
      height: 2rem;
   }

   #id_div_select_eigv {
      z-index: 90;
      margin: 0;
      padding: 0;
      font-size: 1rem;
   }

   #id_div_select_dyn_eigv {
      z-index: 90;
      margin: 0;
      padding: 0;
      font-size: 1rem;
   }

   #id_button_copy_svg {
      z-index: 90;
      margin: 0;
      padding: 4px;
      font-size: 1rem;
      width: 5rem;
      background-color: #181818;
      color: #f1f1f1;
      height: 2rem;
   }

   #id_select_eigenvalue,
   #id_select_dyn_eigenvalue {
      font-size: 1rem;
      width: 9.375rem;
      max-width: 100%;
      background-color: #181818;
      color: #f1f1f1;
      margin: 0;
      padding: 4px;
      height: 2rem;
   }
   #id_einstellungen {
      padding: 0;
      margin: 0;
      padding-left: 5px;
      background-color: light-dark(#d8d8d8, rgb(55, 55, 55));
   }

   #id_button_zurueck_grafik {
      position: absolute;
      top: 3.125rem;
      left: 0.25rem;
      z-index: 5;
      margin: 0;
      padding: 0.3125rem;
      font-size: 1rem;
      width: 5.3rem;
      background-color: #181818;
      color: #f1f1f1;
   }

   #id_button_pan_grafik {
      position: absolute;
      bottom: 1rem;
      left: 0.5rem;
      z-index: 5;
      margin: 0;
      padding: 0.4375rem 0.75rem;
      border: none;
      font-size: 1rem;
      background-color: #181818;
      color: #f1f1f1;
   }

   #id_button_pan_cad {
      position: absolute;
      bottom: 1rem;
      left: 0.5rem;
      z-index: 5;
      margin: 0;
      padding: 0.4375rem 0.75rem;
      font-size: 1rem;
      border: none;
      background-color: light-dark(var(--button_cad), rgb(64, 64, 64));
      color: #f1f1f1;
   }
   .btn {
      height: 2rem;
      background-color: light-dark(var(--button_cad), rgb(64, 64, 64));
      border: none;
      color: white;
      padding: 0.4375rem 0.75rem;
      font-size: 1rem;
      cursor: pointer;
      margin-left: 0.25rem;
      margin-bottom: 0.1875rem;
      margin-top: 0.1875rem;
      border-radius: 3px;
      -webkit-user-select: none;
      user-select: none;
   }

   .btn_small {
      background-color: light-dark(#f8f8f8, rgb(64, 64, 64));
      border: none;
      color: light-dark(rgb(64, 64, 64), white);
      padding: 0.3rem 0.6rem;
      font-size: 1rem;
      cursor: pointer;
      margin-left: 0.25rem;
      margin-right: 0rem;
      margin-bottom: 0rem;
      margin-top: 0rem;
      border-radius: 3px;
   }

   .btn_small:hover {
      background-color: var(--user_accent, RoyalBlue);   /* Akzentfarbe aus Tab ꔷꔷꔷ */
      color: white;
   }

   .file_toolbar {
      display: flex;
      gap: 0.5rem;
      margin: 0.5rem 0 1rem 0.5rem;
   }

   .btn_file {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.5rem;
      padding: 0;
      cursor: pointer;
   }

   .btn_file:hover {
      background-color: var(--user_accent, RoyalBlue);   /* Akzentfarbe aus Tab ꔷꔷꔷ */
      color: white;
   }

   /* Werkzeug-Buttons im Tab System (undo … A): alle gleich groß, Inhalt zentriert.
      Größe über --cad_btn_size, einstellbar im Tab ꔷꔷꔷ */
   .btn_cad {
      --cad_btn_size_eff: var(--cad_btn_size, 2rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      box-sizing: border-box;
      width: var(--cad_btn_size_eff);
      height: var(--cad_btn_size_eff);
      padding: 0;
      margin: 0.1875rem 0 0.1875rem 0.25rem;
      background-color: light-dark(var(--button_cad), rgb(64, 64, 64));
      border: 1px solid #5a5a62;
      border-radius: 4px;
      color: white;
      font-size: calc(var(--cad_btn_size_eff) * 0.5);
      line-height: 1;
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
   }

   .btn_cad svg {
      width: calc(var(--cad_btn_size_eff) * 0.55);
      height: calc(var(--cad_btn_size_eff) * 0.55);
      flex-shrink: 0;
   }

   .helptext {
      background-color: var(--group_cad);
      border: none;
      color: white;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: 1rem;
      margin-bottom: 0.1875rem;
      margin-top: 0.1875rem;
   }

   .output_table_ein td,
   .output_table_ein th {
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 3px;
      padding-bottom: 3px;
      margin: 0px;
      min-width: 2rem;
      line-height: 1.3;
      vertical-align: middle;
   }

   .table_ein_cell_center {
      text-align: center;
      background-color: #ffc966;
   }

   .class-my-drawer {
      display: none;
      margin: 0px;
      position: absolute;
      top: 0px;
      right: 0px;
      width: 16rem;
      height: 100%;
      z-index: 200;
      color: white;
      background-color: rgb(90, 90, 90);
      pointer-events: all;
      cursor: pointer;
      overflow-y: auto;
   }

   #id_control_panel {
      position: relative;
      flex: none;
      z-index: 90;
      font-size: 1rem;
      border-radius: 5px;
      overflow: hidden;
   }

   sl-tab-panel#id_tab-cad::part(base) {
      padding: 0;
   }

   sl-tab-panel#id_tab-grafik::part(base) {
      padding: 0;
   }

`;

