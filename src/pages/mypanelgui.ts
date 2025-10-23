import GUI from 'lil-gui';
import { System } from './rechnen'

let gui: GUI;

let scale_factor = 1.0;
let scale_factor_arrows = 1.0;

export const draw_sg = {
    My: true,
    Vz: true,
    N: true
}

export let draw_group = false;

let controller_eigenformen: any
let controller_schief: any
let controller_stabvorverformung: any
let controller_N: any
let controller_V: any
let controller_M: any
let controller_disp: any
let controller_bettung: any

let controller_SG: any

//--------------------------------------------------------------------------------------------------------
export function myPanel() {
    //--------------------------------------------------------------------------------------------------------

    // let controller_M: any, controller_V: any, controller_N: any

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
        show_umriss: false,
        Gesamtverformung: false,
        Gleichgewicht_SG: true,
        dyn_eigenform: false,
        dyn_animate_eigenform: false,
        knotenmassen: false,
        bettung: false,

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
    let eigenformen = 'Knickfigur'
    let lasten_anzeigen = 'Lasten anzeigen'
    // let skalierung_pfeile = '-'
    let lager_kraefte = 'Lagerkräfte anzeigen'
    let umriss_anzeigen = 'Umriss anzeigen'
    let bettung = 'Bodenpressung'

    // @ts-ignore
    gui = new GUI({ container: document.getElementById('panel_gui'), touchStyles: false }); // , touchStyles: true  , width: 230
    //gui.domElement.classList.add('allow-touch-styles');

    gui.add(obj, 'Label').name(beschriftung).onChange(() => {
        window.dispatchEvent(new Event("draw_label_grafik"));
    });

    gui.add(obj, 'systemlinie').name(systemlinien).onChange(() => {
        window.dispatchEvent(new Event("draw_systemlinien_grafik"));
    });

    controller_disp = gui.add(obj, 'verformung').name(verformungen).onChange(() => {
        window.dispatchEvent(new Event("draw_verformungen_grafik"));
    });

    controller_bettung = gui.add(obj, 'bettung').name(bettung).onChange(() => {
        window.dispatchEvent(new Event("draw_bodenpressung_grafik"));
    });

    controller_N = gui.add(obj, 'normalkraft').name(normalkraft).onChange((value: any) => {
        if (draw_group) {
            draw_sg.N = false;
            window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        } else {
            draw_group = true;
            controller_V.setValue(false);   // gui.controllers[4]
            controller_M.setValue(false);   //gui.controllers[5]
            draw_group = false;
            draw_sg.N = value;
            window.dispatchEvent(new Event("draw_normalkraftlinien_grafik"));
        }

    });

    controller_V = gui.add(obj, 'querkraft').name(querkraft).onChange((value: any) => {
        if (draw_group) {
            draw_sg.Vz = false;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        } else {
            draw_group = true;
            controller_N.setValue(false);  // gui.controllers[3]
            controller_M.setValue(false);  // gui.controllers[5]
            draw_group = false;
            draw_sg.Vz = value;
            window.dispatchEvent(new Event("draw_querkraftlinien_grafik"));
        }

        // console.log("in querkraft",gui.controllers)
    });

    controller_M = gui.add(obj, 'moment').name(moment).onChange((value: any) => {
        //console.log("value", value)
        //console.log("Boolean(gui.controllers[5].getValue)", gui.controllers[5])
        if (draw_group) {
            draw_sg.My = false;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        } else {
            draw_group = true;
            controller_N.setValue(false);  //gui.controllers[3]
            controller_V.setValue(false);  //gui.controllers[4]
            draw_group = false;
            draw_sg.My = value;
            window.dispatchEvent(new Event("draw_momentenlinien_grafik"));
        }

    });

    controller_eigenformen = gui.add(obj, 'eigenform').name(eigenformen).onChange(() => {
        window.dispatchEvent(new Event("draw_eigenformen_grafik"));
    });

    controller_schief = gui.add(obj, 'schief').name('Schiefstellung').onChange(() => {
        window.dispatchEvent(new Event("draw_schiefstellung_grafik"));
    });

    controller_stabvorverformung = gui.add(obj, 'stabvorverformung').name('Stabvorverformung').onChange(() => {
        window.dispatchEvent(new Event("draw_stabvorverformung_grafik"));
    });

    gui.add(obj, 'scale', 0, 3, 0.1).name(skalierung).onFinishChange((v: any) => {
        console.log("skalierung", v)
        scale_factor = v;
        window.dispatchEvent(new Event("scale_factor"));
    });

    gui.add(obj, 'show_loads').name(lasten_anzeigen).onChange(() => {
        window.dispatchEvent(new Event("draw_lasten_grafik"));
    });

    // gui.add(obj, 'scale_arrows', 0, 2, 0.1).name(skalierung_pfeile).onFinishChange((v: any) => {
    //     //console.log("skalierung Pfeile", v)
    //     scale_factor_arrows = v;
    //     window.dispatchEvent(new Event("scale_factor_arrows"));
    // });

    gui.add(obj, 'show_support_forces').name(lager_kraefte).onChange(() => {
        window.dispatchEvent(new Event("draw_lagerkraefte_grafik"));
    });


    // nested controllers
    const dyn_folder = gui.addFolder('Dynamik');
    dyn_folder.open(false);

    dyn_folder.add(obj, 'dyn_eigenform').name('Eigenformen').onChange(() => {
        window.dispatchEvent(new Event("draw_dyn_eigenformen_grafik"));
    });

    dyn_folder.add(obj, 'dyn_animate_eigenform').name('animate Eigenformen').onChange(() => {
        window.dispatchEvent(new Event("draw_dyn_animate_eigenformen_grafik"));
    });

    dyn_folder.add(obj, 'knotenmassen').name('Massen anzeigen').onChange(() => {
        window.dispatchEvent(new Event("draw_knotenmassen_grafik"));
    });

    // nested controllers
    const folder = gui.addFolder('Optionen');
    folder.open(false);

    folder.add(obj, 'show_umriss').name(umriss_anzeigen).onChange(() => {
        window.dispatchEvent(new Event("draw_umriss_grafik"));
    });

    folder.add(obj, 'Gesamtverformung').onChange(() => {
        window.dispatchEvent(new Event("draw_gesamtverformung_grafik"));
    });

    controller_SG = folder.add(obj, 'Gleichgewicht_SG')
        .name('Gleichgewicht SG')
        .onChange(() => {
            window.dispatchEvent(new Event("draw_gleichgewicht_SG_grafik"));
        });

    gui.add(obj, 'Reset').name('Reset Grafik')

    gui.close();



}

//--------------------------------------------------------------------------------------------------------
export function get_scale_factor() {
    //----------------------------------------------------------------------------------------------------
    return scale_factor;

}

//--------------------------------------------------------------------------------------------------------
export function get_scale_factor_arrows() {
    //----------------------------------------------------------------------------------------------------
    return scale_factor_arrows;

}

//--------------------------------------------------------------------------------------------------------
export function show_controller_THIIO(wert: boolean) {
    //----------------------------------------------------------------------------------------------------
    controller_eigenformen.show(wert);
    controller_schief.show(wert);
    controller_stabvorverformung.show(wert);
}

//--------------------------------------------------------------------------------------------------------
export function show_controller_results(wert: boolean) {
    //----------------------------------------------------------------------------------------------------
    controller_N.show(wert);
    if (System === 0) {
        controller_V.show(wert);
        controller_M.show(wert);
    }
    controller_disp.show(wert);
}


//--------------------------------------------------------------------------------------------------------
export function show_controller_truss(wert: boolean) {
    //----------------------------------------------------------------------------------------------------
    controller_V.show(wert);
    controller_M.show(wert);
}


//--------------------------------------------------------------------------------------------------------
export function show_controller_bettung(wert: boolean) {
    //----------------------------------------------------------------------------------------------------
    controller_bettung.show(wert);
}

//--------------------------------------------------------------------------------------------------------
export function reset_gui() {
    //----------------------------------------------------------------------------------------------------
    gui.reset();
}