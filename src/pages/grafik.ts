import Two from 'two.js'

import { CTrans } from './trans';
import { CTimoshenko_beam } from "./timoshenko_beam"
import { xmin, xmax, zmin, zmax, slmax } from "./rechnen";
import { el as element, node, nelem, nnodes } from "./rechnen";
import { maxValue_lf, maxValue_komb, disp_lf } from "./rechnen";

console.log("in grafik")

let tr: CTrans

export function drawsystem() {

    var params = {
        fullscreen: false
    };
    var elem = document.getElementById('id_grafik') as any; //HTMLDivElement;

    while (elem.hasChildNodes()) {  // alte Zeichnungen entfernen
        elem.removeChild(elem?.lastChild);  //   ?.firstChild);
    }

    var two = new Two(params).appendTo(elem);


    console.log("document.documentElement", document.documentElement.clientHeight)

    let el = document.getElementById("id_tab_group") as any
    //let height = el.getBoundingClientRect().height
    console.log("boundingRect", el?.getBoundingClientRect().height)
    let height = document.documentElement.clientHeight //- el?.getBoundingClientRect()?.height;
    two.width = document.documentElement.clientWidth;
    el = document.querySelector('.footer'); //.getElementById("container")
    console.log("container footer boundingRect", el?.getBoundingClientRect())

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

        //two.makeLine(0, 0, two.width, two.height)
    */


    console.log("MAX", slmax, xmin, xmax, zmin, zmax)
    console.log('maxValue_lf(komb)', maxValue_lf, maxValue_komb)

    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xmin, zmin, xmax, zmax, two.width, two.height)
    } else {
        tr.init(xmin, zmin, xmax, zmax, two.width, two.height);
    }

    let x1: number, x2: number, z1: number, z2: number
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

    // Verformungen

    let dx: number, x: number, kappa: number, sl: number, nenner: number
    let N1: number, N2: number, N3: number, N4: number
    let nodi: number
    let w: number, disp = [4]
    let iLastfall = 1
    let scalefactor = 0.1 * slmax / maxValue_lf[iLastfall - 1].disp
    console.log("scalefaktor", scalefactor, slmax, maxValue_lf[iLastfall - 1].disp)

    for (let ielem = 0; ielem < nelem; ielem++) {
        x1 = Math.round(tr.xPix(element[ielem].x1));
        z1 = Math.round(tr.zPix(element[ielem].z1));
        x2 = Math.round(tr.xPix(element[ielem].x2));
        z2 = Math.round(tr.zPix(element[ielem].z2));

        nodi = element[ielem].nod1 + 1
        disp[0] = disp_lf._(nodi, 2, iLastfall);
        disp[1] = disp_lf._(nodi, 3, iLastfall);
        nodi = element[ielem].nod2 + 1
        disp[2] = disp_lf._(nodi, 2, iLastfall);
        disp[3] = disp_lf._(nodi, 3, iLastfall);
        console.log("disp", disp)

        dx = element[ielem].sl / 10.0
        kappa = element[ielem].kappa
        sl = element[ielem].sl
        nenner = sl ** 3 + 12 * kappa * sl

        x = 0.0; x2 = 0.0; z2 = 0.0
        for (let i = 0; i <= 10; i++) {
            N1 = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
            N2 = -((sl * x ^ 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
            N3 = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
            N4 = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
            w = N1 * disp[0] + N2 * disp[1] + N3 * disp[2] + N4 * disp[3];
            console.log("x, w", x, w, w * scalefactor, tr.xPix(x),tr.zPix(w * scalefactor))
            x1 = x2; z1 = z2;
            x2 = tr.xPix(x); z2 = tr.zPix(w * scalefactor)
            if (i > 0) {
                let line = two.makeLine(x1, z1, x2, z2);
                line.linewidth = 2;
            }
            x = x + dx
        }

    }


    // Don’t forget to tell two to draw everything to the screen
    two.update();

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

}