import Two from 'two.js'

import { CTrans } from './trans';
import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax, nlastfaelle, nkombinationen, neigv, nelTeilungen } from "./rechnen";
import { el as element, node, nelem, nnodes } from "./rechnen";
import { maxValue_lf, maxValue_komb, maxValue_eigv, THIIO_flag } from "./rechnen";
//import { Pane } from 'tweakpane';
import { myPanel } from './mypanelgui'
import { colorToRgbNumber } from '@tweakpane/core';

console.log("in grafik")

let tr: CTrans
let drawPanel = 0
let draw_lastfall = 1
let draw_eigenform = 1


let show_webgl_label = false;
let show_systemlinien = true;
let show_verformungen = false;
let show_eigenformen = false;
let show_momentenlinien = false;
let show_querkraftlinien = false;
let show_normalkraftlinien = false;

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
    var elem = document.getElementById('id_grafik') as any; //HTMLDivElement;
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


    var two = new Two(params).appendTo(elem);


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
            line.linewidth = 10;
        }
    }

    // Verformungen

    if (show_verformungen) {

        let xx1, xx2, zz1, zz2
        let dx: number, x: number, kappa: number, sl: number, nenner: number
        let Nu: number[] = Array(2), Nw: number[] = Array(4)
        let u: number, w: number, uG: number, wG: number

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
                x = x + dx
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
        let scalefactor = 0

        scalefactor = 0.1 * slmax / maxValue_eigv[ikomb - 1][draw_eigenform - 1]    //maxValue_komb[iLastfall - 1].disp

        console.log("scalefaktor", scalefactor, slmax, maxValue_lf[draw_eigenform - 1].disp)
        console.log("draw_eigenform", draw_eigenform, ikomb)

        for (let ielem = 0; ielem < nelem; ielem++) {
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
                x = x + dx
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

        //if (maxValue_eigv[ikomb - 1][draw_eigenform - 1] === 0.0) return

        if (THIIO_flag === 0) {
            scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].My
        }
        else if (THIIO_flag === 1) {
            scalefactor = 0.1 * slmax / maxValue_komb[iLastfall - 1].My
        }
        console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].My)



        for (let ielem = 0; ielem < nelem; ielem++) {

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
                x = x + dx
            }
            vertices.push(new Two.Vector(x2, z2));

            // @ts-ignore
            let flaeche = two.makePath(vertices);
            flaeche.fill = '#00AEFF';

            //group.fill='#00AEFF'
            //group.closed=true
            /*
                        poly[0]=x1;poly[1]=z1
                        poly[2]=x2;poly[3]=z2
                        poly[4]=x2;poly[5]=z2 + Mx[nelTeilungen] * scalefactor
                        poly[6]=x1;poly[7]=z1 + Mx[0] * scalefactor
                        //let polygon =two.makePolygon(poly[0],poly[1],poly[0],5)
                        //let a= new Two.Anchor(x1,z1)
                        let polygon = two.makePoints(x1,z1,x2,z2,x2,z2 + Mx[nelTeilungen] * scalefactor)
                        console.log("polygon",polygon)
                        polygon.fill= '#00AEFF';

                        var points;

                        var vertices = [];
                        for (var i = 0; i < 100; i++) {
                            var xxx = Math.random() * two.width;
                          var yyy = Math.random() * two.height;
                            vertices.push(new Two.Vector(xxx, yyy));
                        }

                        points = two.makePath(vertices);
                        points.size = 5;

            let points = two.makePoints(
                two.width / 2,
                two.height / 2,
                two.width / 2 + 20,
                two.height / 2,
                two.width / 2 + 40,
                two.height / 2
            );

            //points.stroke()
            points.fill = '#00AEFF';
            points.size = 10;
*/

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
        }
        console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].Vz)



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
        }
        console.log("scalefaktor", scalefactor, slmax, maxValue_komb[iLastfall - 1].N)



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

    draw_lager(two);

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
    //--------------------------------------------------------------------------------------------------------

    console.log("in draw_querkraftlinien_grafik");
    show_querkraftlinien = !show_querkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_normalkraftlinien_grafik() {
    //--------------------------------------------------------------------------------------------------------

    console.log("in draw_normalkraftlinien_grafik");
    show_normalkraftlinien = !show_normalkraftlinien;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}

//--------------------------------------------------------------------------------------------------------
function draw_eigenformen_grafik() {
    //--------------------------------------------------------------------------------------------------------

    console.log("in draw_verformungen_grafik");
    show_eigenformen = !show_eigenformen;

    //if (Gesamt_ys === undefined || isNaN(yM)) return;

    drawsystem();
}
//---------------------------------------------------------------------------------- a d d E v e n t L i s t e n e r

window.addEventListener('draw_systemlinien_grafik', draw_systemlinien_grafik);
window.addEventListener('draw_verformungen_grafik', draw_verformungen_grafik);
window.addEventListener('draw_eigenformen_grafik', draw_eigenformen_grafik);
window.addEventListener('draw_momentenlinien_grafik', draw_momentenlinien_grafik);
window.addEventListener('draw_querkraftlinien_grafik', draw_querkraftlinien_grafik);
window.addEventListener('draw_normalkraftlinien_grafik', draw_normalkraftlinien_grafik);
