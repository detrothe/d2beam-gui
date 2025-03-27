import Two from "two.js"
import { CTrans } from "./trans"
import { TCAD_Stab, TCAD_Streckenlast, TCAD_Temperaturlast } from "./CCAD_element"
import { opacity, style_pfeil, style_txt_knotenlast } from "./grafik"
import { myFormat } from "./utility"
import { CAD_STAB, list } from "./cad"
import { draw_arrow } from "./cad_draw_elemente"
import { get_cad_node_X, get_cad_node_Z } from "./cad_node"

//--------------------------------------------------------------------------------------------------------
export function draw_elementlasten( tr: CTrans, obj: TCAD_Stab) {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_elementlasten", obj)

    let slmax = 10;

    let x1: number, x2: number, z1: number, z2: number, si: number, co: number, xi: number, zi: number
    let dp: number, pMax: number, pMin: number
    let a: number, ax_projektion: number, az_projektion: number
    let aL: number, aR: number
    let a_spalt: number
    let pL: number, pR: number
    let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)

    let xpix: number, zpix: number, scalefactor = 1.0, nLoop = 0   //  lf_index = 0
    let iLastfall = 1    //draw_lastfall
    let fact = Array(1)     // nlastfaelle)
    let lf_show = Array(1)  // nlastfaelle)

    const color_load = '#9ba4d0';
    nLoop = 1
    fact[0] = 1.0
    lf_show[0] = 0   //draw_lastfall - 1
    scalefactor = slmax / 20 / 5  //maxValue_eload[draw_lastfall - 1]

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

    for (let iLoop = 0; iLoop < nLoop; iLoop++) {
        //console.log("iLoop: ", iLoop)

        //for (let ieload = 0; ieload < neloads; ieload++) {

        if (obj.elast.length > 0) {

            for (let j = 0; j < obj.elast.length; j++) {
                let typ = obj.elast[j].typ
                if (typ === 0) { // Streckenlast

                    let p_L = (obj.elast[j] as TCAD_Streckenlast).pL
                    let p_R = (obj.elast[j] as TCAD_Streckenlast).pR

                    // if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === lf_show[iLoop])) {

                    if ((obj.elast[j] as TCAD_Streckenlast).art === 0) {

                        console.log("in draw_elementlasten", p_L, p_R)

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
                        group.add(flaeche)

                        if (Math.abs(pL) > 0.0) {
                            let gr = draw_arrow( tr, x[3], z[3], x[0], z[0], style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow(tr, x[2], z[2], x[1], z[1], style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
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
                            let gr = draw_arrow( tr, x[3], z[3], x[0], z[0], style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow( tr, x[2], z[2], x[1], z[1], style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)

                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
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
                            let gr = draw_arrow(tr, x[3], z[3], x[0], z[0], style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow( tr, x[2], z[2], x[1], z[1], style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            group.add(txt)
                            //txt.rotation = obj.alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
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
                            let gr = draw_arrow( tr, x[0], z[0], x[3], z[3], style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow( tr, x[1], z[1], x[2], z[2], style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            txt.rotation = obj.alpha
                            group.add(txt)
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
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
                            let gr = draw_arrow( tr, x[0], z[0], x[3], z[3], style_pfeil)
                            group.add(gr)
                        }
                        if (Math.abs(pR) > 0.0) {
                            let gr = draw_arrow( tr, x[1], z[1], x[2], z[2], style_pfeil)
                            group.add(gr)
                        }

                        if (p_L === p_R) {
                            xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
                            zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'center'
                            txt.baseline = 'middle'
                            group.add(txt)
                            //txt.rotation = obj.alpha
                        } else {
                            xpix = xtr[3] + 5
                            zpix = ztr[3] - 5
                            let str = myFormat(Math.abs(p_L * fact[iLoop]), 1, 2)
                            let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)

                            xpix = xtr[2] + 5
                            zpix = ztr[2] - 5
                            str = myFormat(Math.abs(p_R * fact[iLoop]), 1, 2)
                            txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                            txt.alignment = 'left'
                            txt.baseline = 'top'
                            group.add(txt)
                        }

                        dp = pMax
                        ax_projektion += dp + a_spalt
                    }
                }

                else if (typ === 2 /*eload[ieload].art === 5 || eload[ieload].art === 9 || eload[ieload].art === 10*/) {      // Temperatur, Vorspannung, Spannschloss

                    let To = (obj.elast[j] as TCAD_Temperaturlast).To
                    let Tu = (obj.elast[j] as TCAD_Temperaturlast).Tu

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
                    // else if (eload[ieload].art === 9) str = "σv= " + eload[ieload].sigmaV * fact[iLoop] / 1000 + " N/mm²";
                    // else str = "Δs= " + eload[ieload].delta_s * fact[iLoop] * 1000 + " mm";

                    let txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
                    txt.alignment = 'center'
                    txt.baseline = 'middle'
                    txt.rotation = obj.alpha
                    group.add(txt)

                    dp = pMax // - pMin
                    a = a + dp + a_spalt
                }
                // else if (eload[ieload].art === 6) {      // Einzellast oder/und Moment

                //     let plength = 35, delta = 12

                //     plength = tr.World0(2 * plength / devicePixelRatio)
                //     delta = tr.World0(delta / devicePixelRatio)

                //     if (eload[ieload].P != 0.0) {
                //         let dpx = si * plength, dpz = co * plength
                //         let ddx = si * delta, ddz = co * delta
                //         let wert = eload[ieload].P * fact[iLoop]
                //         let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                //         console.log("GRAFIK Einzellast", xl, zl, wert)
                //         if (wert < 0.0) {
                //             draw_arrow(two, tr, xl + ddx, zl - ddz, xl + ddx + dpx, zl - ddz - dpz, style_pfeil_knotenlast_element)
                //         } else {
                //             draw_arrow(two, tr, xl + ddx + dpx, zl - ddz - dpz, xl + ddx, zl - ddz, style_pfeil_knotenlast_element)
                //         }
                //         xpix = tr.xPix(xl + ddx + dpx) + 4
                //         zpix = tr.zPix(zl - ddz - dpz) - 4
                //         const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
                //         const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast_element)
                //         txt.alignment = 'left'
                //         txt.baseline = 'top'
                //     }
                //     if (eload[ieload].M != 0.0) {
                //         let wert = eload[ieload].M * fact[iLoop]
                //         let vorzeichen = Math.sign(wert)
                //         let xl = x1 + co * eload[ieload].x, zl = z1 + si * eload[ieload].x
                //         let radius = style_pfeil_moment_element.radius;
                //         console.log("GRAFIK, Moment, radius ", wert, tr.World0(radius))
                //         if (wert > 0.0) {
                //             draw_moment_arrow(two, xl, zl, 1.0, radius, style_pfeil_moment_element)
                //         } else {
                //             draw_moment_arrow(two, xl, zl, -1.0, radius, style_pfeil_moment_element)
                //         }

                //         xpix = tr.xPix(xl) - 10 / devicePixelRatio
                //         zpix = tr.zPix(zl) + vorzeichen * radius + 12 * vorzeichen / devicePixelRatio
                //         const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
                //         const txt = two.makeText(str, xpix, zpix, style_txt_knotenlast_element)
                //         txt.alignment = 'right'
                //     }
                // }
            }
        }
    }
    return group;
}
