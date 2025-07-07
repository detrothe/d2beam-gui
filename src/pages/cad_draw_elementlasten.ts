import Two from "two.js"
import { CTrans } from "./trans"
import { TCAD_Einzellast, TCAD_Element, TCAD_ElLast, TCAD_Knotenlast, TCAD_Knotenverformung, TCAD_Spannschloss, TCAD_Stab, TCAD_Stabvorverformung, TCAD_Streckenlast, TCAD_Temperaturlast, TCAD_Vorspannung } from "./CCAD_element"
import { opacity, style_pfeil, style_pfeil_moment_element, style_txt_knotenlast, style_txt_knotenlast_element } from "./grafik"
import { myFormat } from "./utility"
import { CAD_KNLAST, CAD_KNOTVERFORMUNG, CAD_STAB, list, select_color, slmax_cad, timer, unit_force, unit_moment } from "./cad"
import { draw_arrow, draw_BoundingClientRect_xz, draw_moment_arrow } from "./cad_draw_elemente"
import { get_cad_node_X, get_cad_node_Z } from "./cad_node"
import { buttons_control } from "./cad_buttons"


const style_pfeil_knotenlast_element = {
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#ba0000'
}

export class CMAXVALUESLOAD {
    eload = 0.0
    constructor() {
        this.eload = 0.0
    }

}

export let max_value_lasten = [] as CMAXVALUESLOAD[];

export let max_Lastfall = 0

export function zero_max_lastfall() {
    max_Lastfall = 0;
    max_value_lasten.length = 0;
}

export function set_max_lastfall(lf: number) {
    if (lf > max_Lastfall) {
        for (let i = max_Lastfall; i < lf; i++) {
            max_value_lasten.push(new CMAXVALUESLOAD);
        }
        max_Lastfall = lf;
    }
}

export function new_max_lastfall(lf: number) {
    let div = max_Lastfall - lf
    for (let i = 0; i < div; i++) {
        max_value_lasten.pop();
    }
    max_Lastfall = lf;
}

//---------------------------------------------------------------------------------------------------------------
export function find_max_Lastfall(): boolean {
    //-----------------------------------------------------------------------------------------------------------

    let max_Lastfall_old = max_Lastfall;
    max_Lastfall = 0


    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        if (obj.elTyp === CAD_STAB) {
            let neloads = (obj as TCAD_Stab).elast.length
            if (neloads > 0) {
                for (let j = 0; j < neloads; j++) {
                    let lf = (obj as TCAD_Stab).elast[j].lastfall
                    if (lf > max_Lastfall) max_Lastfall = lf
                }
            }
        }
        else if (obj.elTyp === CAD_KNLAST) {
            let lf = (obj as TCAD_Knotenlast).knlast.lf
            if (lf > max_Lastfall) max_Lastfall = lf
        }
        else if (obj.elTyp === CAD_KNOTVERFORMUNG) {
            let lf = (obj as TCAD_Knotenverformung).nodeDisp.lf
            if (lf > max_Lastfall) max_Lastfall = lf
        }
    }
    console.log("MAX LASTFALL", max_Lastfall)

    if (max_Lastfall !== max_Lastfall_old) return true;    // Änderung der größten Lastfall nummer
    else return false;
}

//---------------------------------------------------------------------------------------------------------------
export function find_maxValues_eloads() {
    //-----------------------------------------------------------------------------------------------------------

    max_value_lasten.length = 0

    console.log("in find_maxValues_eloads, max_Lastfall", max_Lastfall)

    for (let i = 0; i < max_Lastfall; i++) {
        max_value_lasten.push(new CMAXVALUESLOAD);
    }

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Stab;
        if (obj.elTyp === CAD_STAB) {
            let neloads = obj.elast.length
            if (neloads > 0) {
                for (let j = 0; j < neloads; j++) {
                    let typ = (obj.elast[j] as TCAD_ElLast).typ
                    let lf = obj.elast[j].lastfall
                    if (typ === 0) { // Streckenlast
                        if (Math.abs((obj.elast[j] as TCAD_Streckenlast).pL) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs((obj.elast[j] as TCAD_Streckenlast).pL);
                        if (Math.abs((obj.elast[j] as TCAD_Streckenlast).pR) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs((obj.elast[j] as TCAD_Streckenlast).pR);
                    }
                }
            }
        }
    }

    for (let i = 0; i < max_Lastfall; i++) {
        console.log("max_value_lasten", max_value_lasten[i].eload)
    }
}

//--------------------------------------------------------------------------------------------------------
export function draw_elementlasten(tr: CTrans, obj: TCAD_Stab) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_elementlasten", obj)

    let slmax = slmax_cad / 1.5;
    let element_selected = false;

    let x1: number, x2: number, z1: number, z2: number, si: number, co: number, xi: number, zi: number
    let dp: number, pMax: number, pMin: number
    let a: number, ax_projektion: number, az_projektion: number
    let aL: number, aR: number
    let a_spalt: number
    let pL: number, pR: number
    let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)

    let xpix: number, zpix: number, scalefactor = 1.0, nLoop = 0   //  lf_index = 0
    // let iLastfall =(obj.elast[j] as TCAD_Streckenlast).lastfall
    let fact = Array(1)     // nlastfaelle)
    let lf_show = Array(1)  // nlastfaelle)

    const color_load = '#9ba4d0';
    nLoop = 1
    fact[0] = 1.0
    lf_show[0] = 0   //draw_lastfall - 1
    // scalefactor = slmax / 20 / max_value_lasten[iLastfall - 1].eload

    // if (THIIO_flag === 0) {
    //     if (iLastfall <= nlastfaelle) {
    //         //lf_index = iLastfall - 1
    //         nLoop = 1
    //         fact[0] = 1.0
    //         lf_show[0] = draw_lastfall - 1
    //         scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

    //     } else if (iLastfall <= nlastfaelle + nkombinationen) {
    //         //lf_index = iLastfall - 1
    //         let ikomb = iLastfall - 1 - nlastfaelle
    //         console.log("Kombination THIO, ikomb: ", ikomb, maxValue_eload_komb[ikomb])
    //         scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
    //         nLoop = 0

    //         for (let i = 0; i < nlastfaelle; i++) {
    //             if (kombiTabelle[ikomb][i] !== 0.0) {
    //                 console.log("kombitabelle", i, ikomb, kombiTabelle[ikomb][i])
    //                 fact[nLoop] = kombiTabelle[ikomb][i];
    //                 lf_show[nLoop] = i
    //                 nLoop++;
    //             }
    //         }
    //     } else {
    //         nLoop = 0
    //     }
    // }
    // else if (THIIO_flag === 1) {

    //     if (iLastfall <= nkombinationen) {
    //         //lf_index = iLastfall - 1
    //         let ikomb = iLastfall - 1
    //         scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
    //         nLoop = 0

    //         for (let i = 0; i < nlastfaelle; i++) {
    //             if (kombiTabelle[ikomb][i] !== 0.0) {
    //                 fact[nLoop] = kombiTabelle[ikomb][i];
    //                 lf_show[nLoop] = i
    //                 nLoop++;
    //             }
    //         }

    //     } else {
    //         nLoop = 0
    //     }
    // }

    // for (let i = 0; i < nLoop; i++) {
    //     console.log("°°°°°°° lf_show,fact", i, lf_show[i], fact[i])
    // }



    //console.log("++++ in draw_elementlasten", slmax, draw_lastfall)

    let group = new Two.Group();

    if (!obj.isActive) return group

    a = slmax / 100.
    a_spalt = a
    ax_projektion = 0.0
    az_projektion = 0.0


    let ae = slmax / 100.
    let ae_spalt = ae
    let ae_x = [] as number[]
    let base_x = [] as number[]

    aL = obj.aL
    aR = obj.aR

    //console.log("aL,aR", aL, aR)

    let index1 = obj.index1
    let index2 = obj.index2

    si = obj.sinus
    co = obj.cosinus

    x1 = get_cad_node_X(index1) + co * aL;
    z1 = get_cad_node_Z(index1) + si * aL;
    x2 = get_cad_node_X(index2) - co * aR;
    z2 = get_cad_node_Z(index2) - si * aR;


    // überprüfe, ob es mehrere Einzellasten an gleicher Stelle x gibt

    if (obj.elast.length > 0) {

        let anzahl_x = Array(obj.elast.length).fill(0)
        base_x = Array(obj.elast.length).fill(-1)

        ae_x = Array(obj.elast.length).fill(0)

        for (let i = 0; i < obj.elast.length; i++) {
            let typ = obj.elast[i].typ
            if (typ === 1) {       // Einzellast oder/und Moment
                let xi = (obj.elast[i] as TCAD_Einzellast).xe
                for (let j = i + 1; j < obj.elast.length; j++) {
                    let typ = obj.elast[j].typ
                    if (typ === 1) {       // Einzellast oder/und Moment
                        let xj = (obj.elast[j] as TCAD_Einzellast).xe
                        if (Math.abs(xj - xi) < 0.001) {
                            anzahl_x[i]++;
                            base_x[j] = i
                        }
                    }
                }
            }
        }

        // console.log("anzahl_x", anzahl_x)
        // console.log("base_x", base_x)
    }

    for (let iLoop = 0; iLoop < nLoop; iLoop++) {
        //console.log("iLoop: ", iLoop)

        //for (let ieload = 0; ieload < neloads; ieload++) {

        if (obj.elast.length > 0) {

            for (let j = 0; j < obj.elast.length; j++) {
                let typ = obj.elast[j].typ

                let iLastfall = (obj.elast[j] as TCAD_Streckenlast).lastfall
                //console.log("max_value_lasten", iLastfall, slmax, max_value_lasten.length)
                //console.log("eload", max_value_lasten[0].eload)
                scalefactor = slmax / 20 / max_value_lasten[iLastfall - 1].eload
                //console.log("scalefactor", scalefactor)

                if (timer.element_selected && timer.index_ellast === j) {
                    element_selected = true;
                } else {
                    element_selected = false;
                }
                if (typ === 0) { // Streckenlast

                    let p_L = (obj.elast[j] as TCAD_Streckenlast).pL
                    let p_R = (obj.elast[j] as TCAD_Streckenlast).pR

                    // if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === lf_show[iLoop])) {

                    if ((obj.elast[j] as TCAD_Streckenlast).art === 0) {

                        // console.log("in draw_elementlasten", p_L, p_R)

                        pL = p_L * scalefactor * fact[iLoop]
                        pR = p_R * scalefactor * fact[iLoop]

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        a += Math.abs(pMin)

                        x[0] = x1 + si * a; z[0] = z1 - co * a;
                        x[1] = x2 + si * a; z[1] = z2 - co * a;
                        x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                        x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                        //console.log("pL...", pL, pR, x, z)

                        var vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = new Two.Path(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity
                        if (timer.element_selected && timer.index_ellast === j) {
                            flaeche.stroke = select_color;
                            flaeche.linewidth = 3;
                        }
                        group.add(flaeche)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow(tr, x[3], z[3], x[0], z[0], element_selected, style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[2], z[2], x[1], z[1], element_selected, style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        dp = pMax // - pMin
                        a = a + dp + a_spalt
                    }

                    else if ((obj.elast[j] as TCAD_Streckenlast).art === 1) {      // Streckenlast z-Richtung
                        //console.log('Streckenlast in z-Richtung', eload[ieload].pL, eload[ieload].pL, scalefactor, fact[iLoop])

                        pL = p_L * scalefactor * fact[iLoop]
                        pR = p_R * scalefactor * fact[iLoop]

                        //if (!(eload[ieload].lf === 1 && eload[ieload].pL === 0.0 && eload[ieload].pR === 0.0)) {

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        a += Math.abs(pMin)   //* co

                        x[0] = x1 + si * a; z[0] = z1 - a * co;    // /
                        x[1] = x2 + si * a; z[1] = z2 - a * co;
                        x[2] = x[1]; z[2] = z[1] - pR;
                        x[3] = x[0]; z[3] = z[0] - pL;

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                        var vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = new Two.Path(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity
                        group.add(flaeche)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow(tr, x[3], z[3], x[0], z[0], element_selected, style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[2], z[2], x[1], z[1], element_selected, style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)

                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        dp = pMax * co // - pMin
                        a = a + dp + a_spalt

                    }


                    else if ((obj.elast[j] as TCAD_Streckenlast).art === 2) {      // Streckenlast z-Richtung, Projektion

                        pL = p_L * scalefactor * fact[iLoop]
                        pR = p_R * scalefactor * fact[iLoop]

                        let zm = (z1 + z2) / 2

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        az_projektion += Math.abs(pMin)

                        x[0] = x1; z[0] = zm - az_projektion;
                        x[1] = x2; z[1] = zm - az_projektion;
                        x[2] = x[1]; z[2] = z[1] - pR;
                        x[3] = x[0]; z[3] = z[0] - pL;

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                        var vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = new Two.Path(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity
                        group.add(flaeche)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow(tr, x[3], z[3], x[0], z[0], element_selected, style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[2], z[2], x[1], z[1], element_selected, style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            group.add(txt)
                            //txt.rotation = obj.alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        dp = pMax
                        az_projektion += dp + a_spalt
                    }


                    else if ((obj.elast[j] as TCAD_Streckenlast).art === 3) {      // Streckenlast x-Richtung

                        pL = p_L * scalefactor * fact[iLoop]
                        pR = p_R * scalefactor * fact[iLoop]

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        console.log("S I N U S ", si)
                        if (si < 0.0) a += Math.abs(pMax * si);
                        else a += Math.abs(pMin * si);   //  * si

                        x[0] = x1 + a * si; z[0] = z1 - co * a;  // / si
                        x[1] = x2 + a * si; z[1] = z2 - co * a;
                        x[2] = x[1] + pR; z[2] = z[1];
                        x[3] = x[0] + pL; z[3] = z[0];

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                        const vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = new Two.Path(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity
                        group.add(flaeche)

                        let line = new Two.Line(xtr[0], ztr[0], xtr[1], ztr[1]);
                        line.linewidth = 2;
                        group.add(line)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow(tr, x[0], z[0], x[3], z[3], element_selected, style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[1], z[1], x[2], z[2], element_selected, style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        if (si < 0.0) dp = pMin * si;
                        else dp = pMax * si;
                        a = a + dp + a_spalt
                    }


                    else if ((obj.elast[j] as TCAD_Streckenlast).art === 4) {      // Streckenlast x-Richtung, Projektion

                        pL = p_L * scalefactor * fact[iLoop]
                        pR = p_R * scalefactor * fact[iLoop]

                        let xm = (x1 + x2) / 2

                        pMax = Math.max(0.0, pL, pR)
                        pMin = Math.min(0.0, pL, pR)

                        ax_projektion += Math.abs(pMin)

                        x[0] = xm + ax_projektion; z[0] = z1;
                        x[1] = xm + ax_projektion; z[1] = z2;
                        x[2] = x[1] + pR; z[2] = z[1];
                        x[3] = x[0] + pL; z[3] = z[0];

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                        const vertices = [];
                        for (let i = 0; i < 4; i++) {
                            xtr[i] = tr.xPix(x[i])
                            ztr[i] = tr.zPix(z[i])
                            vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                        }

                        let flaeche = new Two.Path(vertices);
                        flaeche.fill = color_load;
                        flaeche.opacity = opacity
                        group.add(flaeche)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow(tr, x[0], z[0], x[3], z[3], element_selected, style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[1], z[1], x[2], z[2], element_selected, style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            group.add(txt)
                            //txt.rotation = obj.alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            if (max_Lastfall > 1) str = iLastfall + '|' + str
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        dp = pMax
                        ax_projektion += dp + a_spalt
                    }
                }

                else if (typ === 2 || typ === 3 || typ === 4) {      // Temperatur, Vorspannung, Spannschloss    /*eload[ieload].art === 5 || eload[ieload].art === 9 || eload[ieload].art === 10*/

                    let To = 0, Tu = 0, sigmaV = 0, delta_s = 0

                    if (typ === 2) {
                        To = (obj.elast[j] as TCAD_Temperaturlast).To
                        Tu = (obj.elast[j] as TCAD_Temperaturlast).Tu
                    } else if (typ === 3) {
                        sigmaV = (obj.elast[j] as TCAD_Vorspannung).sigmaV
                    } else {
                        delta_s = (obj.elast[j] as TCAD_Spannschloss).ds
                    }

                    pL = slmax / 20.
                    pR = slmax / 20.

                    pMax = Math.max(0.0, pL, pR)
                    pMin = Math.min(0.0, pL, pR)

                    a += Math.abs(pMin)

                    x[0] = x1 + si * a; z[0] = z1 - co * a;
                    x[1] = x2 + si * a; z[1] = z2 - co * a;
                    x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                    x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;

                    (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                    const vertices = [];
                    for (let i = 0; i < 4; i++) {
                        xtr[i] = tr.xPix(x[i])
                        ztr[i] = tr.zPix(z[i])
                        vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                    }

                    let flaeche = new Two.Path(vertices);
                    flaeche.fill = color_load;
                    flaeche.opacity = opacity;
                    group.add(flaeche)

                    xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4.
                    zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4.
                    let str: string = '';
                    if (typ === 2) str = "Tu= " + Tu * fact[iLoop] + "°/To= " + To * fact[iLoop] + "°";
                    else if (typ === 3) str = "σv= " + sigmaV * fact[iLoop] + " N/mm²";
                    else str = "Δs= " + delta_s * fact[iLoop] + " mm";
                    if (max_Lastfall > 1) str = iLastfall + '|' + str

                    let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'center'
                    txt.baseline = 'middle'
                    txt.rotation = obj.alpha
                    group.add(txt)

                    dp = pMax // - pMin
                    a = a + dp + a_spalt
                }
                else if (typ === 1) {   //eload[ieload].art === 6) {      // Einzellast oder/und Moment

                    let plength = tr.Pix0(slmax_cad / 70) /*35*/, delta = 12
                    let marker = tr.World0(10 / devicePixelRatio)

                    let x = (obj.elast[j] as TCAD_Einzellast).xe
                    let P = (obj.elast[j] as TCAD_Einzellast).P
                    let M = (obj.elast[j] as TCAD_Einzellast).M

                    let xM1 = x1 + co * x + si * marker;
                    let zM1 = z1 + si * x - co * marker;
                    let xM2 = x1 + co * x - si * marker;
                    let zM2 = z1 + si * x + co * marker;

                    let line1 = new Two.Line(tr.xPix(xM1), tr.zPix(zM1), tr.xPix(xM2), tr.zPix(zM2));
                    line1.linewidth = 3 / devicePixelRatio;
                    group.add(line1);


                    let shift = 0
                    plength = tr.World0(2 * plength / devicePixelRatio)
                    plength = slmax_cad / 25
                    delta = tr.World0(delta / devicePixelRatio)

                    if (base_x[j] > -1) {
                        shift = ae_x[base_x[j]]
                    }
                    if (P != 0.0) {
                        let dpx = si * plength
                        let dpz = co * plength
                        let ddx = si * (delta + shift)
                        let ddz = co * (delta + shift)
                        let wert = P * fact[iLoop]
                        let xl = x1 + co * x
                        let zl = z1 + si * x
                        //console.log("GRAFIK Einzellast", xl, zl, wert)
                        let grp = new Two.Group();

                        if (wert < 0.0) {
                            let gr = draw_arrow(tr, xl + ddx, zl - ddz, xl + ddx + dpx, zl - ddz - dpz, element_selected, style_pfeil_knotenlast_element)
                            grp.add(gr)
                        } else {
                            let gr = draw_arrow(tr, xl + ddx + dpx, zl - ddz - dpz, xl + ddx, zl - ddz, element_selected, style_pfeil_knotenlast_element)
                            grp.add(gr)
                        }

                        xpix = tr.xPix(xl + ddx + dpx) + 5
                        zpix = tr.zPix(zl - ddz - dpz) + 9 / devicePixelRatio;
                        let str = myFormat(Math.abs(wert), 1, 2) + unit_force
                        if (max_Lastfall > 1) str = iLastfall + '|' + str
                        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast_element)
                        txt.alignment = 'left'
                        txt.baseline = 'top'
                        //group.add(txt)
                        grp.add(txt)
                        let rect = grp.getBoundingClientRect()

                        group.add(grp)

                        // const vertices = [];
                        xtr[0] = tr.xWorld(rect.left)
                        ztr[0] = tr.zWorld(rect.top)
                        xtr[1] = tr.xWorld(rect.left)
                        ztr[1] = tr.zWorld(rect.bottom)
                        xtr[2] = tr.xWorld(rect.left + rect.width)
                        ztr[2] = tr.zWorld(rect.bottom)
                        xtr[3] = tr.xWorld(rect.left + rect.width)
                        ztr[3] = tr.zWorld(rect.top);

                        (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(xtr, ztr)   // Koordinaten merken für Picken
                        if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

                    }
                    if (M != 0.0) {
                        let wert = M * fact[iLoop]
                        let vorzeichen = Math.sign(wert)
                        let xl = x1 + co * x + si * (shift + delta + plength / 2)
                        let zl = z1 + si * x - co * (shift + delta + plength / 2)
                        // let radius = style_pfeil_moment_element.radius;
                        let radius = tr.Pix0(slmax_cad / 50 * devicePixelRatio)    //style_pfeil_moment.radius;
                        //console.log("GRAFIK, Moment, radius ", wert, tr.World0(radius))
                        let grp = new Two.Group();

                        if (wert > 0.0) {
                            let gr = draw_moment_arrow(tr, xl, zl, 1.0, radius, element_selected, style_pfeil_moment_element)
                            grp.add(gr)
                            xpix = tr.xPix(xl - Math.sin(Math.PI / 5) * slmax_cad / 50) // - 10 / devicePixelRatio
                            zpix = tr.zPix(zl + Math.cos(Math.PI / 5) * slmax_cad / 50) + 10 * vorzeichen / devicePixelRatio //+ (vorzeichen * radius + 15 * vorzeichen) / devicePixelRatio

                        } else {
                            let gr = draw_moment_arrow(tr, xl, zl, -1.0, radius, element_selected, style_pfeil_moment_element)
                            grp.add(gr)
                            // xpix = tr.xPix(xl) - 10 / devicePixelRatio
                            // zpix = tr.zPix(zl) + (vorzeichen * radius + 12 * vorzeichen) / devicePixelRatio
                            xpix = tr.xPix(xl - Math.sin(Math.PI / 5) * slmax_cad / 50) // - 10 / devicePixelRatio
                            zpix = tr.zPix(zl - Math.cos(Math.PI / 5) * slmax_cad / 50) + 20 * vorzeichen / devicePixelRatio //+ (vorzeichen * radius + 15 * vorzeichen) / devicePixelRatio
                        }

                        let str = myFormat(Math.abs(wert), 1, 2) + unit_moment
                        if (max_Lastfall > 1) str = iLastfall + '|' + str
                        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast_element)
                        txt.alignment = 'right'
                        grp.add(txt)

                        group.add(grp);

                        let rect = grp.getBoundingClientRect()

                        xtr[0] = tr.xWorld(rect.left)
                        ztr[0] = tr.zWorld(rect.top)
                        xtr[1] = tr.xWorld(rect.left)
                        ztr[1] = tr.zWorld(rect.bottom)
                        xtr[2] = tr.xWorld(rect.left + rect.width)
                        ztr[2] = tr.zWorld(rect.bottom)
                        xtr[3] = tr.xWorld(rect.left + rect.width)
                        ztr[3] = tr.zWorld(rect.top);

                        (obj.elast[j] as TCAD_Einzellast).set_drawLast_M_xz(xtr, ztr)   // Koordinaten merken für Picken
                        if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

                    }
                    ae_x[j] += plength + delta + shift

                }
                else if (typ === 5) {      // Stabvorverformung


                    let w0a = (obj.elast[j] as TCAD_Stabvorverformung).w0a
                    let w0m = (obj.elast[j] as TCAD_Stabvorverformung).w0m
                    let w0e = (obj.elast[j] as TCAD_Stabvorverformung).w0e

                    pL = slmax / 20.
                    pR = slmax / 20.

                    pMax = Math.max(0.0, pL, pR)
                    pMin = Math.min(0.0, pL, pR)

                    a += Math.abs(pMin)

                    x[0] = x1 + si * a; z[0] = z1 - co * a;
                    x[1] = x2 + si * a; z[1] = z2 - co * a;
                    x[2] = x[1] + si * pR; z[2] = z[1] - co * pR;
                    x[3] = x[0] + si * pL; z[3] = z[0] - co * pL;

                    (obj.elast[j] as TCAD_Streckenlast).set_drawLast_xz(x, z)   // Koordinaten merken für Picken

                    const vertices = [];
                    for (let i = 0; i < 4; i++) {
                        xtr[i] = tr.xPix(x[i])
                        ztr[i] = tr.zPix(z[i])
                        vertices.push(new Two.Anchor(xtr[i], ztr[i]));
                    }

                    let flaeche = new Two.Path(vertices);
                    flaeche.fill = color_load;
                    flaeche.opacity = opacity;
                    group.add(flaeche)

                    xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4.
                    zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4.
                    let str = 'w0 a,m,e ' + w0a + ',' + w0m + ',' + w0e + 'mm';
                    if (max_Lastfall > 1) str = iLastfall + '|' + str

                    let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'center'
                    txt.baseline = 'middle'
                    txt.rotation = obj.alpha
                    group.add(txt)

                    dp = pMax // - pMin
                    a = a + dp + a_spalt
                }
            }
        }
    }
    return group;
}
