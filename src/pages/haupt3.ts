import { cad_buttons } from './cad_buttons';
import { addListener_filesave } from './dateien';
import { add_listeners_einstellungen, readLocalStorage, readLocalStorage_cad } from './einstellungen';
import { elem_select_changed, elementTabelle_bettung_anzeigen, elementTabelle_gelenke_anzeigen, elementTabelle_starre_enden_anzeigen, gleichungssystem_darstellen } from './haupt_2';
import { init_tabellen } from './rechnen';
import { set_info } from './utility';

// import '@shoelace-style/shoelace/dist/components/tab/tab.js';
// import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
// import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';

import SlTabPanel from '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import { set_touch_support_table } from './globals';
import { click_pan_button_cad, init_cad, init_two_cad } from './cad';
import { click_pan_button_grafik, click_zurueck_grafik, copy_svg, init_panel, select_dyn_eigenvalue_changed, select_eigenvalue_changed, select_loadcase_changed } from './grafik';
import { drHaupt } from '../components/dr-haupt';

console.log('in haupt3');




export function init_haupt3() {


    addListener_filesave();
    add_listeners_einstellungen();
    readLocalStorage();
    set_info();
    init_panel();

    const elHaupt = document.getElementById('id_haupt') as drHaupt;
    let shadow = elHaupt.shadowRoot;
    if (shadow) {
        const el_select_loadcase = shadow.getElementById('id_select_loadcase');
        el_select_loadcase?.addEventListener('change', select_loadcase_changed);
        const el_select_eigenvalue = shadow.getElementById('id_select_eigenvalue');
        el_select_eigenvalue?.addEventListener('change', select_eigenvalue_changed);
        const el_select_dyn_eigenvalue = shadow.getElementById('id_select_dyn_eigenvalue');
        el_select_dyn_eigenvalue?.addEventListener('change', select_dyn_eigenvalue_changed);
        const el_zurueck_grafik = shadow.getElementById('id_button_zurueck_grafik');
        el_zurueck_grafik?.addEventListener('click', click_zurueck_grafik);
        const el_pan_button_grafik = shadow.getElementById('id_button_pan_grafik') as HTMLButtonElement;
        el_pan_button_grafik?.addEventListener('click', click_pan_button_grafik);
        el_pan_button_grafik.innerHTML = `<svg width="1rem" height="1rem" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path fill="#ffffff" d="M16 8l-3-3v2h-4v-4h2l-3-3-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2z"></path>
</svg>`;
        // el_pan_button_grafik.innerHTML = '<i class = "fa fa-arrows"></i>';
        const el_pan_button_cad = shadow.getElementById('id_button_pan_cad') as HTMLButtonElement;
        el_pan_button_cad?.addEventListener('click', click_pan_button_cad);
        el_pan_button_cad.innerHTML = `<svg width="1rem" height="1rem" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path fill="#ffffff" d="M16 8l-3-3v2h-4v-4h2l-3-3-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2z"></path>
</svg>`;
        // el_pan_button_cad.innerHTML = '<i class = "fa fa-arrows"></i>';

        // const el_zurueck_cad = shadow.getElementById("id_button_zurueck_cad");
        // el_zurueck_cad?.addEventListener("click", click_zurueck_cad);

        // const el_def_quer = shadow.getElementById("id_querschnitt_default");
        // el_def_quer?.addEventListener("change", change_def_querschnitt);

        document?.getElementById('id_button_copy_svg')?.addEventListener('click', copy_svg, false);

        const checkbox = shadow.getElementById('id_glsystem_darstellen');
        checkbox!.addEventListener('sl-change', (event) => {
            // @ts-ignore
            if (event.currentTarget.checked) {
                gleichungssystem_darstellen(true);
            } else {
                gleichungssystem_darstellen(false);
            }
        });

        const elem_select = shadow.getElementById('id_element_darstellen');
        elem_select!.addEventListener('change', () => {
            //// @ts-ignore
            elem_select_changed();
        });

        const checkbox_gelenk = shadow.getElementById('id_gelenke_anzeigen');
        checkbox_gelenk!.addEventListener('sl-change', (event) => {
            // @ts-ignore
            if (event.currentTarget.checked) {
                elementTabelle_gelenke_anzeigen(true);
            } else {
                elementTabelle_gelenke_anzeigen(false);
            }
        });

        const checkbox_starr = shadow.getElementById('id_starre_enden_anzeigen');
        checkbox_starr!.addEventListener('sl-change', (event) => {
            // @ts-ignore
            if (event.currentTarget.checked) {
                elementTabelle_starre_enden_anzeigen(true);
            } else {
                elementTabelle_starre_enden_anzeigen(false);
            }
        });

        const touch_support_tables = shadow.getElementById('id_touch_support_tables');
        touch_support_tables!.addEventListener('sl-change', (event) => {
            // @ts-ignore
            if (event.currentTarget.checked) {
                set_touch_support_table(true);
            } else {
                set_touch_support_table(false);
            }
        });

        const checkbox_bettung = shadow.getElementById('id_bettung_anzeigen');
        checkbox_bettung!.addEventListener('sl-change', (event) => {
            // @ts-ignore
            if (event.currentTarget.checked) {
                elementTabelle_bettung_anzeigen(true);
            } else {
                elementTabelle_bettung_anzeigen(false);
            }
        });

        let tt = shadow.getElementById('id_tab-cad') as SlTabPanel;
        tt.updateComplete.then(() => {
            console.log('Tab CAD is complete'); // true
            let div = shadow.getElementById('id_cad_group') as HTMLDivElement;

            let h = div!.getBoundingClientRect();
            console.log('update complete Höhe des div', h);
            readLocalStorage_cad();
            init_two_cad();
            init_cad(0);
        });
        let ttt = shadow.getElementById('id_tab-grafik') as SlTabPanel;
        ttt.updateComplete.then(() => {
            console.log('Tab GRAFIK is complete'); // true
            //init_two('artboard', false);
        });

        // let div_cad_group = shadow.getElementById("id_tab-cad") as HTMLDivElement
        // div_cad_group!.addEventListener("load", (event) => {
        //   // @ts-ignore
        //   console.log("load", event)
        //   let hoehe = div_cad_group!.getBoundingClientRect()
        //   console.log("hoehe div id_cad_group", hoehe)
        // });

        let ttt1 = shadow.getElementById('id_sl_tab_group') as SlTabGroup;
        ttt1!.addEventListener('sl-tab-show', (event) => {
            // @ts-ignore
            console.log('sl-tab-show', event);
            //  let hoehe = div_cad_group!.getBoundingClientRect()
            //  console.log("hoehe div id_cad_group", hoehe)
            let div = shadow.getElementById('id_cad_group2') as HTMLDivElement;
            let h = div!.getBoundingClientRect();
            console.log('Rect des div id_cad_group2', h);
        });

        // let ttt1 = shadow.getElementById("id_cad_group") as SlTabGroup;
        // ttt1!.addEventListener("resize", (event) => {
        //   // @ts-ignore
        //   console.log("sl-tab-show", event)
        //   //  let hoehe = div_cad_group!.getBoundingClientRect()
        //   //  console.log("hoehe div id_cad_group", hoehe)
        //   let div = shadow.getElementById("id_cad_group") as HTMLDivElement
        //   let h = div!.getBoundingClientRect()
        //   console.log("Rect des div", h)
        // });

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // console.log("entry.borderBoxSize", entry.borderBoxSize)
                // console.log("entry.contentRect", entry.contentRect)
                // console.log("entry.contentBoxSize", entry.contentBoxSize)

                let t2 = shadow.getElementById('id_cad_group2') as SlTabGroup;
                let bottom = entry.contentRect.bottom;
                console.log('bottom', bottom);
                t2.style.top = String(bottom) + 'px';
            }
        });

        let ob_t1 = shadow.getElementById('id_cad_group') as SlTabGroup;
        resizeObserver.observe(ob_t1);

        // addEventListener("resize", function () {
        //   ("RESIZE")
        //   write ("resize " + this.window.innerHeight)
        //   init_cad(0);
        // });

        // console.log("id_button_copy_svg", getComputedStyle(document?.getElementById("id_button_copy_svg")!).height);
        // console.log("rechnen", getComputedStyle(document?.getElementById("rechnen")!).width);

        // let ELEMENT = document?.querySelector(".output_container");
        // console.log("ELEMENT", ELEMENT);
        // console.log("ELEMENT", getComputedStyle(ELEMENT!).width);

        console.log('document.readyState', document.readyState);

        // let time = 0
        // //while (document.readyState != 'complete') {
        // setTimeout(function () {
        //   write("in setTimeout document.readyState " + document.readyState)
        //   if (document.readyState === 'complete') init_tabellen();
        //   console.log("Executed after 0.1 second");
        // }, 500);
        // time = time + 500
        // console.log("time used ", time)
        // write('document.readyState ' + document.readyState)
        //}
    }

    // initTabellenLoop();
    console.log('vor init_tabellen in haupt');

    cad_buttons();

    init_tabellen();

    //update_button_language();

    console.log("FERTIG  init_haupt3")

}

