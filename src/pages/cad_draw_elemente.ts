import Two from 'two.js'

import { System, STABWERK, TNode, TLoads } from './rechnen'

import { CTrans } from './trans';
import { myFormat } from './utility';


const style_pfeil_knotenlast = {
    a: 35,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#dc0000'
}


const style_pfeil_moment = {
    radius: 50,
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#dc0000'
}

const style_txt_knotenlast = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#dc0000',
    weight: 'bold'
};

//--------------------------------------------------------------------------------------------------------
export function draw_lager(two: Two, tr: CTrans, node: TNode) {
    //----------------------------------------------------------------------------------------------------

    let x1 = Math.round(tr.xPix(node.x));
    let z1 = Math.round(tr.zPix(node.z));
    let phi = -node.phi * Math.PI / 180

    let group: any

    if (System === STABWERK) {
        if (((node.L_org[0] === 1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) ||
            ((node.kx > 0.0) && (node.kz > 0.0) && (node.L[2] === -1))) {  // Volleinspannung oder mit zwei Translkationsfedern
            group = two.makeRectangle(x1, z1, 20, 20)
            group.fill = '#dddddd';
            group.scale = 1.0 / devicePixelRatio
            group.rotation = phi
        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in x-Richtung

            group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in z-Richtung

            group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio
            group.rotation = 1.5708 + phi
            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in x-, z-Richtung

            group = two.makeGroup();
            let rechteck = two.makeRectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = two.makeLine(-16, 15, 12, 15);
            line.linewidth = 2;
            group.add(line)

            let line2 = two.makeLine(15, -16, 15, 12);
            line2.linewidth = 2;
            group.add(line2)

            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L_org[1] === 1) && (node.L_org[2] === -1 || node.L[2] >= 0)) { // zweiwertiges Lager
            group = two.makeGroup();
            //console.log("in zweiwertiges Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L_org[1] === 1) && (node.L[2] >= 0 || node.L_org[2] === -1)) { // einwertiges horizontal verschieblisches Lager
            group = two.makeGroup();
            //console.log("in einwertiges horizontal verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L[2] >= 0 || node.L_org[2] === -1)) { // einwertiges vertikal verschieblisches Lager
            group = two.makeGroup();
            //console.log("in einwertiges vertikales verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio


            group.rotation = -1.5708 + phi
            group.translation.set(x1, z1)

        }
    } else {                     // Fachwerk
        if ((node.L[0] === -1) && (node.L[1] === -1)) { // zweiwertiges Lager
            group = two.makeGroup();
            //console.log("in zweiwertiges Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0) && (node.L[1] === -1)) { // einwertiges horizontal verschieblisches Lager
            group = two.makeGroup();
            //console.log("in einwertiges horizontal verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] === -1) && (node.L[1] >= 0)) { // einwertiges vertikal verschieblisches Lager
            group = two.makeGroup();
            //console.log("in einwertiges vertikales Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = two.makePath(vertices);
            flaeche.fill = '#dddddd';
            group.add(flaeche)

            let line = two.makeLine(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio


            group.rotation = -1.5708 + phi
            group.translation.set(x1, z1)

        }

    }

    // if (node.kx > 0.0) {
    //     draw_feder(two, node.x, node.z, -1.5707963 + phi)
    // }

    // if (node.kz > 0.0) {
    //     draw_feder(two, node.x, node.z, phi)
    // }

    // if (System === STABWERK) {
    //     if (node.kphi > 0.0) {
    //         draw_drehfeder(two, node.x, node.z)
    //     }
    // }

    return group

}

//--------------------------------------------------------------------------------------------------------
export function draw_knotenlast(two: Two, tr: CTrans, load: TLoads, x: number, z: number, fact: number, lf_show: number) {
    //----------------------------------------------------------------------------------------------------

    let slmax = 10
    let plength = 35 /*slmax / 20.*/, delta = 12 //slmax / 200.0
    let xpix: number, zpix: number
    let wert: number
    let nLoop = 0


    plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    let group = new Two.Group();

    console.log("draw_knotenlast", x, z, plength, delta, load)
    // let iLastfall = draw_lastfall

    // if (THIIO_flag === 0 && matprop_flag === 0) {
    //     if (iLastfall <= nlastfaelle) {
    //         //lf_index = iLastfall - 1
    //         nLoop = 1
    //         fact[0] = 1.0
    //         lf_show[0] = draw_lastfall - 1
    //         //scalefactor = slmax / 20 / maxValue_eload[draw_lastfall - 1]

    //     } else if (iLastfall <= nlastfaelle + nkombinationen) {
    //         //lf_index = iLastfall - 1
    //         let ikomb = iLastfall - 1 - nlastfaelle
    //         console.log("Kombination THIO, ikomb: ", ikomb, maxValue_eload_komb[ikomb])
    //         //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
    //         nLoop = 0

    //         for (let i = 0; i < nlastfaelle; i++) {
    //             if (kombiTabelle[ikomb][i] !== 0.0) {
    //                 //console.log("kombitabelle", i, ikomb, kombiTabelle[ikomb][i])
    //                 fact[nLoop] = kombiTabelle[ikomb][i];
    //                 lf_show[nLoop] = i
    //                 nLoop++;
    //             }
    //         }
    //     } else {
    //         nLoop = 0
    //     }
    // }
    // else if (THIIO_flag === 1 || matprop_flag > 0) {

    //     if (iLastfall <= nkombinationen) {
    //         //lf_index = iLastfall - 1
    //         let ikomb = iLastfall - 1
    //         //scalefactor = slmax / 20 / maxValue_eload_komb[ikomb]
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



    // let inode = load.node
    // let x = node[inode].x;
    // let z = node[inode].z;
    //console.log("load[i]", i, load)

    if (load.Px != 0.0 && load.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

        wert = load.Px * fact
        if (wert > 0.0) {
            let gr = draw_arrow(two, tr, x + delta, z, x + delta + plength, z, style_pfeil_knotenlast)
            group.add(gr)
        } else {
            let gr = draw_arrow(two, tr, x + delta + plength, z, x + delta, z, style_pfeil_knotenlast)
            group.add(gr)
        }
        xpix = tr.xPix(x + delta + plength) + 5
        zpix = tr.zPix(z) - 5
        const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'left'
        txt.baseline = 'top'
        group.add(txt)
    }
    if (load.Pz != 0.0 && load.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)

        wert = load.Pz * fact
        if (wert > 0.0) {
            let gr = draw_arrow(two, tr, x, z - delta - plength, x, z - delta, style_pfeil_knotenlast)
            group.add(gr)
        } else {
            let gr = draw_arrow(two, tr, x, z - delta, x, z - delta - plength, style_pfeil_knotenlast)
            group.add(gr)
        }

        xpix = tr.xPix(x) + 5
        zpix = tr.zPix(z - delta - plength) + 5
        const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'left'
        txt.baseline = 'top'
        group.add(txt)
    }
    if (load.p[2] != 0.0 && load.lf - 1 === lf_show) {

        wert = load.p[2] * fact
        let vorzeichen = Math.sign(wert)
        let radius = style_pfeil_moment.radius;
        //console.log("Moment ", +inode + 1, wert)
        if (wert > 0.0) {
            let gr=draw_moment_arrow(two, tr, x, z, 1.0, slmax / 50, style_pfeil_moment)
            group.add(gr)
        } else {
            let gr=draw_moment_arrow(two, tr, x, z, -1.0, slmax / 50, style_pfeil_moment)
            group.add(gr)
        }

        xpix = tr.xPix(x) - 10 / devicePixelRatio
        zpix = tr.zPix(z) + vorzeichen * radius + 15 * vorzeichen / devicePixelRatio
        //zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
        const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'right'
        //txt.baseline = 'bottom'
        group.add(txt)
    }

    return group;

}


//--------------------------------------------------------------------------------------------------------
function draw_arrow(_two: Two, tr: CTrans, x1: number, z1: number, x2: number, z2: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------

    let b = 20, h = 10, linewidth = 2, color = '#000000'
    let a = 0.0, calc_a = true

    if (styles) {
        //console.log("styles", styles)
        if (styles.linewidth) linewidth = styles.linewidth
        if (styles.a) {
            a = styles.a / devicePixelRatio;
            calc_a = false
        }
        if (styles.b) b = styles.b
        if (styles.h) h = styles.h
        if (styles.color) color = styles.color
    }

    b = b / devicePixelRatio
    h = h / devicePixelRatio
    //b = slmax / 50.
    //h = slmax / 100.
    //linewidth = slmax / 400.

    //b = tr.Pix0(b)
    //h = tr.Pix0(h)
    //linewidth = tr.Pix0(linewidth)
    //write('linewidth: ', linewidth)
    linewidth = linewidth / devicePixelRatio

    let dx = x2 - x1, dz = z2 - z1
    let alpha = Math.atan2(dz, dx)

    let sl = Math.sqrt(dx * dx + dz * dz)
    //console.log("sl", Math.round(tr.xPix(sl)));
    //console.log("0.0", Math.round(tr.xPix(0.0)));

    if (calc_a) a = Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)) - b;
    // write('sl : ', sl)
    // write('tr.Pix0 : ', tr.Pix0(sl))
    // write('div', Math.round(tr.xPix(sl)) - Math.round(tr.xPix(0.0)))
    // write('a: ', a)
    // write('b: ', b)

    let x0 = Math.round(tr.xPix(x1));
    let z0 = Math.round(tr.zPix(z1));

    console.log("sl,a", sl, a, b, x0, z0, x1, z1)

    let group = new Two.Group();
    let line = new Two.Line(0, 0, a, 0);
    line.linewidth = linewidth;
    line.stroke = color;

    group.add(line)

    var vertices = [];
    vertices.push(new Two.Vector(a, -h / 2));
    vertices.push(new Two.Vector(a + b, 0));
    vertices.push(new Two.Vector(a, h / 2));
    // @ts-ignore
    let dreieck = new Two.Path(vertices);
    dreieck.fill = color;
    dreieck.stroke = color;
    dreieck.linewidth = 1;

    group.add(dreieck)
    group.rotation = alpha
    group.translation.set(x0, z0)

    return group;

}


//--------------------------------------------------------------------------------------------------------
function draw_moment_arrow(_two: Two, tr: CTrans, x0: number, z0: number, vorzeichen: number, radius: number, styles?: any) {
    //----------------------------------------------------------------------------------------------------
    let b = 20, h = 10
    let x = 0.0, z = 0.0, linewidth = 2, color = '#000000'
    let alpha: number, dalpha: number, teilung = 12

    if (styles) {
        //console.log("styles", styles)
        if (styles.linewidth) linewidth = styles.linewidth
        if (styles.radius) radius = styles.radius
        if (styles.b) b = styles.b
        if (styles.h) h = styles.h
        if (styles.color) color = styles.color
    }
    b /= devicePixelRatio
    h /= devicePixelRatio
    linewidth /= devicePixelRatio
    radius /= devicePixelRatio

    radius = tr.World0(radius)
    //console.log('draw_moment_arrow, radius', radius, tr.Pix0(radius))

    let group = new Two.Group();

    var vertices = [];

    if (vorzeichen > 0) {

        dalpha = Math.PI / (teilung + 1)
        alpha = 0.0
        for (let i = 0; i < teilung - 2; i++) {
            x = tr.Pix0(-radius * Math.sin(alpha))
            z = tr.Pix0(radius * Math.cos(alpha))
            vertices.push(new Two.Anchor(x, z));
            alpha += dalpha
        }


        let curve = new Two.Path(vertices, false, true)
        curve.linewidth = linewidth;
        curve.stroke = color;
        //curve.fill = '#00ffffff';
        //curve.opacity = 0;
        //curve.noFill()
        //curve.fillOpacity=0.25
        curve.fill = "none"
        //curve.fill="rgba(0,0,0,0)"


        group.add(curve)

        vertices.length = 0;
        vertices.push(new Two.Vector(0, -h / 2 + tr.Pix0(radius)));
        vertices.push(new Two.Vector(0 + b, tr.Pix0(radius)));
        vertices.push(new Two.Vector(0, h / 2 + tr.Pix0(radius)));
        // @ts-ignore
        let dreieck = new Two.Path(vertices);
        dreieck.fill = color;
        dreieck.stroke = color;
        dreieck.linewidth = 1;
        //    dreieck.translation.set(0.0,0.0) //tr.Pix0(radius))

        group.add(dreieck)
        group.rotation = Math.PI / 5
        group.translation.set(tr.xPix(x0), tr.zPix(z0))

    } else {

        dalpha = Math.PI / (teilung + 1)
        alpha = 0.0
        for (let i = 0; i < teilung - 2; i++) {
            x = tr.Pix0(-radius * Math.sin(alpha))
            z = tr.Pix0(-radius * Math.cos(alpha))
            vertices.push(new Two.Anchor(x, z));
            alpha += dalpha
        }


        let curve = new Two.Path(vertices, false, true)
        curve.linewidth = linewidth;
        curve.stroke = color;
        curve.noFill()

        group.add(curve)

        vertices.length = 0;
        vertices.push(new Two.Vector(0, -h / 2 - tr.Pix0(radius)));
        vertices.push(new Two.Vector(0 + b, -tr.Pix0(radius)));
        vertices.push(new Two.Vector(0, h / 2 - tr.Pix0(radius)));
        // @ts-ignore
        let dreieck = new Two.Path(vertices);
        dreieck.fill = color;
        dreieck.stroke = color;
        dreieck.linewidth = 1;

        group.add(dreieck)
        group.rotation = -Math.PI / 5
        group.translation.set(tr.xPix(x0), tr.zPix(z0))
    }

    return group;
}
