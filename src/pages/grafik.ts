import Two from 'two.js'

import { CTrans } from './trans';
import { myFormat } from './utility'
//import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax, nlastfaelle, nkombinationen, neigv, nelTeilungen } from "./rechnen";
import { el as element, node, nelem, nnodes } from "./rechnen";
import { maxValue_lf, maxValue_komb, maxValue_eigv, maxValue_u0, THIIO_flag } from "./rechnen";
//import { Pane } from 'tweakpane';
import { myPanel } from './mypanelgui'
//import { colorToRgbNumber } from '@tweakpane/core';

console.log("in grafik")

let tr: CTrans
let drawPanel = 0
let draw_lastfall = 1
let draw_eigenform = 1


let show_labels = false;
let show_systemlinien = true;
let show_verformungen = false;
let show_eigenformen = false;
let show_momentenlinien = false;
let show_querkraftlinien = false;
let show_normalkraftlinien = false;
let show_schiefstellung = false;

export function select_loadcase_changed() {

    //console.log("################################################ select_loadcase_changed")
    const el_select_loadcase = document.getElementById("id_select_loadcase") as HTMLSelectElement
    //console.log("option", el_select_loadcase.value)
    draw_lastfall = Number(el_select_loadcase.value)
    drawsystem();
}

export function select_eigenvalue_changed() {

    //console.log("################################################ select_eigenvalue_changed")
    const el_select_eigenvalue = document.getElementById("id_select_eigenvalue") as HTMLSelectElement
    //console.log("option", el_select_eigenvalue.value)
    draw_eigenform = Number(el_select_eigenvalue.value)
    drawsystem();
}

//--------------------------------------------------------------------------------------------------- i n i t _ g r a f i k

export function init_grafik() {

    if (drawPanel === 0) {
        myPanel();
        drawPanel = 1;
    }

    const el_select = document.getElementById('id_select_loadcase') as HTMLSelectElement;

    while (el_select.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select.removeChild(el_select?.lastChild);
    }
    //el.style.width = '100%';   // 100px
    console.log('CREATE SELECT', nlastfaelle, el_select);

    const el_select_eigv = document.getElementById('id_select_eigenvalue') as HTMLSelectElement;

    while (el_select_eigv.hasChildNodes()) {  // alte Optionen entfernen
        // @ts-ignore
        el_select_eigv.removeChild(el_select_eigv?.lastChild);
    }

    if (THIIO_flag === 0) {

        for (let i = 0; i < nlastfaelle; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Lastfall ' + (+i + 1);

            el_select.appendChild(option);
        }

    } else if (THIIO_flag === 1) {

        for (let i = 0; i < nkombinationen; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Kombination ' + (+i + 1);

            el_select.appendChild(option);
        }


        for (let i = 0; i < neigv; i++) {
            let option = document.createElement('option');

            option.value = String(+i + 1)
            option.textContent = 'Eigenform ' + (+i + 1);

            el_select_eigv.appendChild(option);
        }
    }

}

//--------------------------------------------------------------------------------------------------- d r a w s y s t e m

export function drawsystem() {

    var params = {
        fullscreen: false
    };
    const elem = document.getElementById('id_grafik') as any; //HTMLDivElement;
    console.log("childElementCount", elem.childElementCount)

    if (elem.childElementCount > 2) elem.removeChild(elem?.lastChild);
    /*
        while (elem.hasChildNodes()) {  // alte Zeichnungen entfernen
            elem.removeChild(elem?.lastChild);  //   ?.firstChild);
        }
    */
    /*
        const el_container = document.getElementById('panel_gui') as any; //HTMLDivElement;


        const pane = new Pane({ container: el_container});  // document.querySelector('#id_grafik')

        const PARAMS = {
            speed: 0.5,
        };

        pane.addInput(PARAMS, 'speed');

        //return;
    */

    const style_txt = {
        family: 'system-ui, sans-serif',
        size: 14,
        fill: 'red',
        //opacity: 0.5,
        //leading: 50
        weight: 'bold'
    };

    let onlyLabels = !(show_normalkraftlinien || show_querkraftlinien || show_momentenlinien || show_schiefstellung || show_eigenformen || show_verformungen);

    const two = new Two(params).appendTo(elem);


    console.log("document.documentElement", document.documentElement.clientHeight)

    let ele = document.getElementById("id_tab_group") as any
    //let height = el.getBoundingClientRect().height
    console.log("boundingRect", ele?.getBoundingClientRect().height)
    let height = document.documentElement.clientHeight //- el?.getBoundingClientRect()?.height;
    two.width = document.documentElement.clientWidth;
    ele = document.querySelector('.footer'); //.getElementById("container")
    console.log("container footer boundingRect", ele?.getBoundingClientRect())

    //height= height - el?.getBoundingClientRect().height;
    two.height = height
    /*
        // Two.js has convenient methods to make shapes and insert them into the scene.
        var radius = 50;
        var x = two.width * 0.5;
        var y = two.height * 0.5 - radius * 1.25;
        var circle = two.makeCircle(x, y, radius);

        y = two.height * 0.5 + radius * 1.25;
        var width = 100;
        height = 100;
        var rect = two.makeRectangle(x, y, width, height);

        // The object returned has many stylable properties:
        circle.fill = '#FF8000';
        // And accepts all valid CSS color:
        circle.stroke = 'orangered';
        circle.linewidth = 5;

        rect.fill = 'rgb(0, 200, 255)';
        rect.opacity = 0.75;
        rect.noStroke();
*/
    //two.makeLine(0, 0, two.width, two.height)



    console.log("MAX", slmax, xmin, xmax, zmin, zmax)
    console.log('maxValue_lf(komb)', maxValue_lf, maxValue_komb)

    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xmin, zmin, xmax, zmax, two.width, two.height)
    } else {
        tr.init(xmin, zmin, xmax, zmax, two.width, two.height);
    }

    let x1: number, x2: number, z1: number, z2: number


    // Verformungen

    if (show_verformungen) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number
        let Nu: number[] = Array(2), Nw: number[] = Array(4)
        let u: number, w: number, uG: number, wG: number
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        let edispL: number[] = new Array(6)
        let iLastfall = draw_lastfall
        let scalefactor = 0
        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].disp * 1000.
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].disp * 1000.
        }
        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL(edispL, iLastfall - 1)

            dx = element[ielem].sl / nelTeilungen
            kappa = element[ielem].kappa
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * kappa * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
                u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                uG = element[ielem].cosinus * u - element[ielem].sinus * w
                wG = element[ielem].sinus * u + element[ielem].cosinus * w

                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)

                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                }

                dispG = Math.sqrt(uG * uG + wG * wG)
                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)
                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {
                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'
            }
        }
    }


    // Eigenformen

    if (show_eigenformen && (maxValue_eigv[draw_lastfall - 1][draw_eigenform - 1] > 0.0)) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

        let u: number, w: number, uG: number, wG: number
        let edispL: number[] = new Array(6)
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0


        let scalefactor = 0.1 * slmax / maxValue_eigv[ikomb - 1][draw_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[draw_eigenform - 1].disp)
        console.log("draw_eigenform", draw_eigenform, ikomb)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL_eigenform(edispL, ikomb, draw_eigenform)

            dx = element[ielem].sl / nelTeilungen
            kappa = element[ielem].kappa
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * kappa * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
                u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                uG = element[ielem].cosinus * u - element[ielem].sinus * w
                wG = element[ielem].sinus * u + element[ielem].cosinus * w

                //console.log("x, w", x, uG, wG, tr.xPix(uG * scalefactor), tr.zPix(wG * scalefactor))
                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                }

                dispG = Math.sqrt(uG * uG + wG * wG)

                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)
                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {
                const str = myFormat(maxU, 1, 2)
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'

            }

        }
    }


    // Schiefstellung

    if (show_schiefstellung && (maxValue_u0[draw_lastfall - 1].u0 > 0.0)) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)

        let u: number, w: number, uG: number, wG: number
        let edispL: number[] = new Array(6)
        let ikomb = draw_lastfall
        let maxU = 0.0, x_max = 0.0, z_max = 0.0, dispG: number
        let xmem = 0.0, zmem = 0.0

        let scalefactor = 0.1 * slmax / maxValue_u0[ikomb - 1].u0

        console.log("scalefaktor", scalefactor, slmax, maxValue_u0[ikomb - 1].u0)
        console.log("draw_schiefstellung", ikomb)

        for (let ielem = 0; ielem < nelem; ielem++) {
            maxU = 0.0

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            element[ielem].get_edispL_schiefstellung(edispL, ikomb - 1)

            dx = element[ielem].sl / nelTeilungen
            kappa = element[ielem].kappa
            sl = element[ielem].sl
            nenner = sl ** 3 + 12 * kappa * sl

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {
                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
                u = Nu[0] * edispL[0] + Nu[1] * edispL[3]
                w = Nw[0] * edispL[1] + Nw[1] * edispL[2] + Nw[2] * edispL[4] + Nw[3] * edispL[5];

                uG = element[ielem].cosinus * u - element[ielem].sinus * w
                wG = element[ielem].sinus * u + element[ielem].cosinus * w


                //console.log("x, w", x, uG, wG, tr.xPix(uG * scalefactor), tr.zPix(wG * scalefactor))
                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus + uG * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + wG * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                }

                dispG = Math.sqrt(uG * uG + wG * wG)

                if (dispG > maxU) {
                    maxU = dispG
                    x_max = xx2
                    z_max = zz2
                    xmem = tr.xPix(element[ielem].x1 + x * element[ielem].cosinus)
                    zmem = tr.zPix(element[ielem].z1 + x * element[ielem].sinus)

                }

                x = x + dx
            }

            if (show_labels && maxU > 0.0) {
                const str = myFormat(maxU * 1000, 1, 1) + 'mm'
                const txt = two.makeText(str, x_max, z_max, style_txt)
                txt.alignment = 'left'
                txt.baseline = 'top'

                const pfeil = two.makeArrow(xmem, zmem, x_max, z_max, 10)
                pfeil.stroke = '#D3D3D3'

            }

        }
    }

    // Momentenlinien

    if (show_momentenlinien) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number

        let iLastfall = draw_lastfall
        let scalefactor = 0
        let Mx: number[] = new Array(nelTeilungen + 1)
        let poly: number[] = new Array(8)  // 2*(nelTeilungen+1+2)
        let maxM = 0.0, x_max = 0.0, z_max = 0.0, x0 = 0.0, z0 = 0.0, xn = 0.0, zn = 0.0


        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].My
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].My
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].My)
        }



        for (let ielem = 0; ielem < nelem; ielem++) {
            maxM = 0.0

            element[ielem].get_elementSchnittgroesse_Moment(Mx, draw_lastfall - 1)
            console.log("GRAFIK  Mx", Mx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));


            dx = element[ielem].sl / nelTeilungen
            sl = element[ielem].sl

            //let group = two.makeGroup();
            var vertices = [];
            vertices.push(new Two.Vector(x1, z1));

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {

                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Mx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Mx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                //console.log("x+x", x1, x * element[ielem].cosinus, z1, x * element[ielem].sinus)
                vertices.push(new Two.Anchor(xx2, zz2));
                /*
                if (i > 0) {
                    //console.log("line", xx1, zz1, xx2, zz2)
                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                    line.linewidth = 2;
                    //group.add(line)
                }
                */
                if (i === 0) {
                    maxM = Math.abs(Mx[i])
                    x0 = xx2
                    z0 = zz2
                }
                else if (Math.abs(Mx[i]) > maxM) {
                    maxM = Math.abs(Mx[i])
                    x_max = xx2
                    z_max = zz2
                }

                if (i === nelTeilungen) {
                    xn = xx2
                    zn = zz2
                }

                x = x + dx
            }
            vertices.push(new Two.Anchor(x2, z2));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#00AEFF';

            //group.fill='#00AEFF'
            //group.closed=true

            if (show_labels) {
                if (maxM > 0.0) {
                    const str = myFormat(maxM, 1, 2) + 'kNm'
                    const txt = two.makeText(str, x_max, z_max, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Mx[0]) > 0.000001) {
                    const str = myFormat(Math.abs(Mx[0]), 1, 2) + 'kNm'
                    const txt = two.makeText(str, x0, z0, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }
                if (Math.abs(Mx[nelTeilungen]) > 0.000001) {
                    const str = myFormat(Math.abs(Mx[nelTeilungen]), 1, 2) + 'kNm'
                    const txt = two.makeText(str, xn, zn, style_txt)
                    txt.alignment = 'left'
                    txt.baseline = 'top'
                }

            }


        }
    }


    // Querkraftlinien

    if (show_querkraftlinien) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number

        let iLastfall = draw_lastfall
        let scalefactor = 0
        let Vx: number[] = new Array(nelTeilungen + 1)

        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].Vz
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].Vz
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].Vz)
        }



        for (let ielem = 0; ielem < nelem; ielem++) {

            element[ielem].get_elementSchnittgroesse_Querkraft(Vx, draw_lastfall - 1)
            console.log("GRAFIK  Vx", Vx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));


            dx = element[ielem].sl / nelTeilungen
            sl = element[ielem].sl

            var vertices = [];
            vertices.push(new Two.Vector(x1, z1));

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {

                //console.log("x, w", x, uG, wG, tr.xPix(uG * scalefactor), tr.zPix(wG * scalefactor))
                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Vx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Vx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                vertices.push(new Two.Anchor(xx2, zz2));
                /*
                                if (i > 0) {
                                    //console.log("line", xx1, zz1, xx2, zz2)
                                    let line = two.makeLine(xx1, zz1, xx2, zz2);
                                    line.linewidth = 2;
                                }
                                */
                x = x + dx
            }
            vertices.push(new Two.Vector(x2, z2));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#00AEFF';

        }
    }


    // Normalkraftlinien

    if (show_normalkraftlinien) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number

        let iLastfall = draw_lastfall
        let scalefactor = 0
        let Nx: number[] = new Array(nelTeilungen + 1)

        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].N
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].N
            //console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].N)
        }



        for (let ielem = 0; ielem < nelem; ielem++) {

            element[ielem].get_elementSchnittgroesse_Normalkraft(Nx, draw_lastfall - 1)
            console.log("GRAFIK  Nx", Nx)

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));


            dx = element[ielem].sl / nelTeilungen
            sl = element[ielem].sl

            var vertices = [];
            vertices.push(new Two.Vector(x1, z1));

            x = 0.0; xx2 = 0.0; zz2 = 0.0
            for (let i = 0; i <= nelTeilungen; i++) {

                xx1 = xx2; zz1 = zz2;
                xx2 = element[ielem].x1 + x * element[ielem].cosinus - element[ielem].sinus * Nx[i] * scalefactor
                zz2 = element[ielem].z1 + x * element[ielem].sinus + element[ielem].cosinus * Nx[i] * scalefactor
                xx2 = tr.xPix(xx2); zz2 = tr.zPix(zz2)
                vertices.push(new Two.Vector(xx2, zz2));

                x = x + dx
            }
            vertices.push(new Two.Anchor(x2, z2));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#00AEDD';

        }
    }


    if (show_systemlinien) {

        for (let ielem = 0; ielem < nelem; ielem++) {
            //console.log("element",ielem,element)
            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));
            //console.log("x..", element[ielem].x1, element[ielem].z1, element[ielem].x2, element[ielem].z2)
            //console.log("elem", ielem, x1, z1, x2, z2)
            let line = two.makeLine(x1, z1, x2, z2);
            if (onlyLabels) line.linewidth = 10;
            else line.linewidth = 5;

            if (show_labels && onlyLabels) {

                let xm = (x1 + x2) / 2. + element[ielem].sinus * 7
                let zm = (z1 + z2) / 2. - element[ielem].cosinus * 7

                let circle = two.makeCircle(xm, zm, 14, 20)
                circle.fill = '#ffffff'

                let str = String(+ielem + 1)
                const txt = two.makeText(str, xm, zm, style_txt)
                txt.fill = '#000000'
                //txt.alignment = 'left'
                //txt.baseline = 'top'
            }
        }

        if (show_labels && onlyLabels) {

            for (let i = 0; i < nnodes; i++) {
                x1 = Math.round(tr.xPix(node[i].x)) + 20;
                z1 = Math.round(tr.zPix(node[i].z)) + 20;

                let rect = two.makeRoundedRectangle(x1, z1, 25, 25, 4)
                rect.fill = '#ffffff'
                rect.stroke = '#0000ff'

                let str = String(+i + 1)
                const txt = two.makeText(str, x1, z1, style_txt)
                txt.fill = '#000000'
            }
        }

    }

    draw_lager(two);
    draw_gelenke(two);

    const styles = {
        family: 'system-ui, sans-serif',
        size: 50,
        fill: 'red',
        opacity: 0.33,
        //leading: 50
        weight: 'bold'
    };

    //const directions = two.makeText('Hallo welt', two.width / 2, two.height / 2, styles)
    //directions.rotation = 1.5708

    // Don’t forget to tell two to draw everything to the screen
    two.update();

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

}

//--------------------------------------------------------------------------------------------------------
function draw_lager(two: Two) {
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < nnodes; i++) {
        let x1 = Math.round(tr.xPix(node[i].x));
        let z1 = Math.round(tr.zPix(node[i].z));

        if ((node[i].L[0] === -1) && (node[i].L[1] === -1) && (node[i].L[2] === -1)) {  // Volleinspannung
            let rechteck = two.makeRectangle(x1, z1, 20, 20)
            rechteck.fill = '#dddddd';
        }
        else if ((node[i].L[0] >= 0) && (node[i].L[1] === -1) && (node[i].L[2] === -1)) {  // Einspannung, verschieblich in x-Richtung

            let group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] >= 0) && (node[i].L[2] === -1)) {  // Einspannung, verschieblich in z-Richtung

            let group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.rotation = 1.5708
            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] === -1) && (node[i].L[2] >= 0)) { // zweiwertiges Lager
            let group = two.makeGroup();
            console.log("in zweiwertig")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] >= 0) && (node[i].L[1] === -1) && (node[i].L[2] >= 0)) { // einwertiges horizintales Lager
            let group = two.makeGroup();
            console.log("in zweiwertig")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.translation.set(x1, z1)

        }
        else if ((node[i].L[0] === -1) && (node[i].L[1] >= 0) && (node[i].L[2] >= 0)) { // einwertiges vertikales Lager
            let group = two.makeGroup();
            console.log("in zweiwertig")
            var vertices = [];
            vertices.push(new Two.Vector(0, 0));
            vertices.push(new Two.Vector(-12, 20));
            vertices.push(new Two.Vector(12, 20));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.rotation = -1.5708
            group.translation.set(x1, z1)

        }

    }
}


//--------------------------------------------------------------------------------------------------------
function draw_gelenke(two: Two) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number
    let radius = 10, a = 10

    for (let ielem = 0; ielem < nelem; ielem++) {

        if (element[ielem].nGelenke > 0) {

            x1 = Math.round(tr.xPix(element[ielem].x1));
            z1 = Math.round(tr.zPix(element[ielem].z1));
            x2 = Math.round(tr.xPix(element[ielem].x2));
            z2 = Math.round(tr.zPix(element[ielem].z2));

            if (element[ielem].gelenk[2] > 0) {                         // Momentengelenk links
                dx = element[ielem].cosinus * (a + radius)
                dz = element[ielem].sinus * (a + radius)
                let kreis = two.makeCircle(x1 + dx, z1 + dz, radius, 10)
                kreis.fill = '#ffffff';

            }
            if (element[ielem].gelenk[5] > 0) {                         // Momentengelenk rechts
                dx = element[ielem].cosinus * (a + radius)
                dz = element[ielem].sinus * (a + radius)
                let kreis = two.makeCircle(x2 - dx, z2 - dz, radius, 10)
                kreis.fill = '#ffffff';

            }
        }
    }
}

//--------------------------------------------------------------------------------------------------------
function draw_label_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_label_grafik");
    show_labels = !show_labels;

    drawsystem();
}
//--------------------------------------------------------------------------------------------------------
function draw_systemlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_systemlinien_grafik");
    show_systemlinien = !show_systemlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_verformungen_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_verformungen = !show_verformungen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_momentenlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_momentenlinien = !show_momentenlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_querkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_querkraftlinien_grafik");
    show_querkraftlinien = !show_querkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_normalkraftlinien_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_normalkraftlinien_grafik");
    show_normalkraftlinien = !show_normalkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_eigenformen_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_eigenformen = !show_eigenformen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_schiefstellung_grafik() {
    //----------------------------------------------------------------------------------------------------

    console.log("in draw_schiefstellung_grafik");
    show_schiefstellung = !show_schiefstellung;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//---------------------------------------------------------------------------------- a d d E v e n t L i s t e n e r

window.addEventListener('draw_label_grafik', draw_label_grafik);
window.addEventListener('draw_systemlinien_grafik', draw_systemlinien_grafik);
window.addEventListener('draw_verformungen_grafik', draw_verformungen_grafik);
window.addEventListener('draw_eigenformen_grafik', draw_eigenformen_grafik);
window.addEventListener('draw_momentenlinien_grafik', draw_momentenlinien_grafik);
window.addEventListener('draw_querkraftlinien_grafik', draw_querkraftlinien_grafik);
window.addEventListener('draw_normalkraftlinien_grafik', draw_normalkraftlinien_grafik);
window.addEventListener('draw_schiefstellung_grafik', draw_schiefstellung_grafik);
