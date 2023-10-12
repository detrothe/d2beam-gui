import GUI from 'lil-gui';
//import { app } from "./index.js";

let scale_factor = 1.0;
let scale_factor_arrows = 1.0;

export const draw_sg = {
    My: true,
    Vz: true,
    N: true
}

export let draw_group = false;


//--------------------------------------------------------------------------------------------------------
export function myPanel() {
    //--------------------------------------------------------------------------------------------------------

    let obj = {
        Label: false,
        systemlinie: true,
        verformung: false,
        normalkraft: false,
        querkraft: false,
        moment: false,
        schief: false,
        stabvorverformung: false,
        scale: 1.0,
        eigenform: false,
        show_loads: true,
        scale_arrows: 1.0,
        show_support_forces: true,
        show_LR: false,
        Reset: function () {
            window.dispatchEvent(new Event("reset_webgl"));
        }
    }
    let beschriftung = 'Beschriftung'
    let systemlinien = 'Systemlinien'
    let verformungen = 'Verformungen'
    let normalkraft = 'Normalkraft'
    let querkraft = 'Querkraft'
    let moment = 'Moment'
    let skalierung = 'Skalierung'
    let eigenformen = 'Eigenformen'
    let lasten_anzeigen = 'Lasten anzeigen'
    let skalierung_pfeile = 'Skalierung Pfeile'
    let lager_kraefte = 'Lagerkräfte anzeigen'
    let rechts_links_anzeigen = 'rechts/links anzeigen'
    /*
        if (app.browserLanguage != 'de') {
            beschriftung = 'Label'
            schubspannung = 'Shear stress'
            normalspannung = 'Normal stress'
            vergleichsspannung = 'Equivalent stress'
            fyRd_anzeigen = 'display fyRd'
            verformung_u = 'displacement u'
            skalierung = 'Scaling'
            seiten_anzeigen = 'Show sides'
            pfeile_anzeigen = 'Show arrows'
            skalierung_pfeile = 'Scale arrows'
            sigma_flaeche = 'sigma area'
            rechts_links_anzeigen = 'show right/left'
        }
    */
    // @ts-ignore
    const gui = new GUI({ container: document.getElementById('panel_gui'), width: 230 }); // , touchStyles: true
    //gui.domElement.classList.add('allow-touch-styles');

    gui.add(obj, 'Label').name(beschriftung).onChange(() => {
        window.dispatchEvent(new Event("draw_label_grafik"));
    });

    gui.add(obj, 'systemlinie').name(systemlinien).onChange(() => {
        window.dispatchEvent(new Event("draw_systemlinien_grafik"));
    });

    gui.add(obj, 'verformung').name(verformungen).onChange(() => {
        window.dispatchEvent(new Event("draw_verformungen_grafik"));
    });

    gui.add(obj, 'normalkraft').name(normalkraft).onChange((value: any) => {
        if (draw_group) {
            draw_sg.N = false;
             window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        } else {
            draw_group = true;
            gui.controllers[4].setValue(false);
            gui.controllers[5].setValue(false);
            draw_group = false;
            draw_sg.N = value;
            window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        }

    });

    gui.add(obj, 'querkraft').name(querkraft).onChange((value: any) => {
        if (draw_group) {
            draw_sg.Vz = false;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        } else {
            draw_group = true;
            gui.controllers[3].setValue(false);
            gui.controllers[5].setValue(false);
            draw_group = false;
            draw_sg.Vz = value;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        }

        // console.log("in querkraft",gui.controllers)
    });

    let controller_M = gui.add(obj, 'moment').name(moment).onChange((value: any) => {
        console.log("value", value)
        console.log("Boolean(gui.controllers[5].getValue)", gui.controllers[5])
        if (draw_group) {
            draw_sg.My = false;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        } else {
            draw_group = true;
            gui.controllers[3].setValue(false);
            gui.controllers[4].setValue(false);
            draw_group = false;
            draw_sg.My = value;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        }

        // draw_sg.My = true; draw_sg.Vz = false; draw_sg.N = false;
        // draw_sg.My = true; draw_sg.Vz = true; draw_sg.N = true;
    });

    gui.add(obj, 'eigenform').name(eigenformen).onChange(() => {
        window.dispatchEvent(new Event("draw_eigenformen_grafik"));
    });

    gui.add(obj, 'schief').name('Schiefstellung').onChange(() => {
        window.dispatchEvent(new Event("draw_schiefstellung_grafik"));
    });

    gui.add(obj, 'stabvorverformung').name('Stabvorverformung').onChange(() => {
        window.dispatchEvent(new Event("draw_stabvorverformung_grafik"));
    });

    gui.add(obj, 'scale', 0, 2, 0.1).name(skalierung).onFinishChange((v: any) => {
        console.log("skalierung", v)
        scale_factor = v;
        window.dispatchEvent(new Event("scale_factor"));
    });

    gui.add(obj, 'show_loads').name(lasten_anzeigen).onChange(() => {
        window.dispatchEvent(new Event("draw_lasten_grafik"));
    });

    gui.add(obj, 'scale_arrows', 0, 2, 0.1).name(skalierung_pfeile).onFinishChange((v: any) => {
        //console.log("skalierung Pfeile", v)
        scale_factor_arrows = v;
        window.dispatchEvent(new Event("scale_factor_arrows"));
    });

    gui.add(obj, 'show_support_forces').name(lager_kraefte).onChange(() => {
        window.dispatchEvent(new Event("draw_lagerkraefte_grafik"));
    });

    gui.add(obj, 'show_LR').name(rechts_links_anzeigen).onChange(() => {
        window.dispatchEvent(new Event("show_LR_webgl"));
    });
    gui.add(obj, 'Reset')

    gui.close();

}

//--------------------------------------------------------------------------------------------------------
export function get_scale_factor() {
    //--------------------------------------------------------------------------------------------------------
    return scale_factor;

}

//--------------------------------------------------------------------------------------------------------
export function get_scale_factor_arrows() {
    //--------------------------------------------------------------------------------------------------------
    return scale_factor_arrows;

}