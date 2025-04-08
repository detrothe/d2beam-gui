import Two from 'two.js'

import { System, STABWERK, TNode, TLoads, alertdialog } from './rechnen'

import { CTrans } from './trans';
import { myFormat } from './utility';
import { TCAD_Knoten, TCAD_Lager, TCAD_Stab } from './CCAD_element';
import { draw_elementlasten } from './cad_draw_elementlasten';
import { two } from './cad';
import { get_cad_node_X, get_cad_node_Z } from './cad_node';



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


const style_txt = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: 'black',
    //opacity: 0.5,
    //leading: 50
    weight: 'normal'
};


//-------------------------------------------------------------------------------------------------------
export function drawStab(obj: TCAD_Stab, tr: CTrans, select = false) {
    //-------------------------------------------------------------------------------------------------------

    let x1 = get_cad_node_X(obj.index1)
    let z1 = get_cad_node_Z(obj.index1)
    let x2 = get_cad_node_X(obj.index2)
    let z2 = get_cad_node_Z(obj.index2)

    let group = new Two.Group();

    let line1 = new Two.Line(tr.xPix(x1), tr.zPix(z1), tr.xPix(x2), tr.zPix(z2));
    line1.linewidth = 7 / devicePixelRatio;
    if (select) line1.stroke = '#ffd700'
    group.add(line1);

    // gestrichelte Faser

    let dx = x2 - x1;
    let dz = z2 - z1;
    let dsl = Math.sqrt(dx * dx + dz * dz);
    let sinus = dz / dsl;
    let cosinus = dx / dsl;
    let alpha = Math.atan2(dz, dx)

    obj.sinus = sinus
    obj.cosinus = cosinus
    obj.alpha = alpha

    let abstand = 10 / devicePixelRatio;
    let tmpX1 = tr.xPix(x1 + dx / 3) - sinus * abstand;
    let tmpZ1 = tr.zPix(z1 + dz / 3) + cosinus * abstand;
    let tmpX2 = tr.xPix(x2 - dx / 3) - sinus * abstand;
    let tmpZ2 = tr.zPix(z2 - dz / 3) + cosinus * abstand;
    //console.log("tmp", tmpX1, tmpZ1, tmpX2, tmpZ2)

    let line2 = new Two.Line(tmpX1, tmpZ1, tmpX2, tmpZ2);
    line2.linewidth = 1 / devicePixelRatio;
    line2.dashes = [10, 4];
    group.add(line2);


    let xm = (tr.xPix(x1) + tr.xPix(x2)) / 2. + (sinus * 11 + cosinus * 1) // devicePixelRatio  war 17
    let zm = (tr.zPix(z1) + tr.zPix(z2)) / 2. - (cosinus * 11 - sinus * 1) // devicePixelRatio

    //console.log("qname", obj.name_querschnitt, xm, zm)
    let str = obj.name_querschnitt
    const txt1 = new Two.Text(str, xm, zm, style_txt)
    txt1.fill = '#000000'
    txt1.alignment = 'center'
    txt1.baseline = 'middle'
    txt1.rotation = alpha
    group.add(txt1);

    if (obj.nGelenke > 0) {
        let gr = draw_stab_gelenke(obj as TCAD_Stab, tr);
        group.add(gr)
    }

    if (obj.elast.length > 0) {
        let gr = draw_elementlasten(tr, obj)
        group.add(gr)
    }

    return group;
}



//--------------------------------------------------------------------------------------------------------
export function draw_lager(tr: CTrans, obj: TCAD_Lager) {
    //----------------------------------------------------------------------------------------------------

    let node = obj.node;

    let index1 = obj.index1

    let x1 = Math.round(tr.xPix(get_cad_node_X(index1)));
    let z1 = Math.round(tr.zPix(get_cad_node_Z(index1)));
    let phi = -node.phi * Math.PI / 180

    let group = new Two.Group();

    if (System === STABWERK) {
        if (((node.L_org[0] === 1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) ||
            ((node.kx > 0.0) && (node.kz > 0.0) && (node.L[2] === -1))) {  // Volleinspannung oder mit zwei Translkationsfedern
            let rect = new Two.Rectangle(x1, z1, 20, 20)
            rect.fill = '#dddddd';
            rect.scale = 1.0 / devicePixelRatio
            rect.rotation = phi
            group.add(rect);
        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in x-Richtung

            let rechteck = new Two.Rectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = new Two.Line(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in z-Richtung

            let rechteck = new Two.Rectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = new Two.Line(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio
            group.rotation = 1.5708 + phi
            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in x-, z-Richtung

            let rechteck = new Two.Rectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = new Two.Line(-16, 15, 12, 15);
            line.linewidth = 2;
            group.add(line)

            let line2 = new Two.Line(15, -16, 15, 12);
            line2.linewidth = 2;
            group.add(line2)

            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L_org[1] === 1) && (node.L_org[2] === -1 || node.L[2] >= 0)) { // zweiwertiges Lager

            //console.log("in zweiwertiges Lager")
            let vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L_org[1] === 1) && (node.L[2] >= 0 || node.L_org[2] === -1)) { // einwertiges horizontal verschieblisches Lager

            //console.log("in einwertiges horizontal verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L[2] >= 0 || node.L_org[2] === -1)) { // einwertiges vertikal verschieblisches Lager

            //console.log("in einwertiges vertikales verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio


            group.rotation = -1.5708 + phi
            group.translation.set(x1, z1)

        }
    } else {                     // Fachwerk
        if ((node.L[0] === -1) && (node.L[1] === -1)) { // zweiwertiges Lager

            //console.log("in zweiwertiges Lager")
            let vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 20, 18, 20);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] >= 0) && (node.L[1] === -1)) { // einwertiges horizontal verschieblisches Lager

            //console.log("in einwertiges horizontal verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 25, 18, 25);
            line.linewidth = 2;

            group.add(line)
            group.scale = 1.0 / devicePixelRatio

            group.rotation = phi

            group.translation.set(x1, z1)

        }
        else if ((node.L[0] === -1) && (node.L[1] >= 0)) { // einwertiges vertikal verschieblisches Lager

            //console.log("in einwertiges vertikales Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(-12, 20));
            vertices.push(new Two.Anchor(12, 20));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(-18, 25, 18, 25);
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
export function draw_knotenlast(tr: CTrans, load: TLoads, x: number, z: number, fact: number, lf_show: number) {
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

    lf_show = load.lf - 1    // noch überarbeiten


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
            let gr = draw_arrow(tr, x + delta, z, x + delta + plength, z, style_pfeil_knotenlast)
            group.add(gr)
        } else {
            let gr = draw_arrow(tr, x + delta + plength, z, x + delta, z, style_pfeil_knotenlast)
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
            let gr = draw_arrow(tr, x, z - delta - plength, x, z - delta, style_pfeil_knotenlast)
            group.add(gr)
        } else {
            let gr = draw_arrow(tr, x, z - delta, x, z - delta - plength, style_pfeil_knotenlast)
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
            let gr = draw_moment_arrow(tr, x, z, 1.0, slmax / 50, style_pfeil_moment)
            group.add(gr)
        } else {
            let gr = draw_moment_arrow(tr, x, z, -1.0, slmax / 50, style_pfeil_moment)
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
export function draw_arrow(tr: CTrans, x1: number, z1: number, x2: number, z2: number, styles?: any) {
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

    //console.log("sl,a", sl, a, b, x0, z0, x1, z1)

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
export function draw_moment_arrow(tr: CTrans, x0: number, z0: number, vorzeichen: number, radius: number, styles?: any) {
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


//--------------------------------------------------------------------------------------------------------
export function draw_stab_gelenke(obj: TCAD_Stab, tr: CTrans) {
    //----------------------------------------------------------------------------------------------------

    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number, si: number, co: number
    let xp1: number, zp1: number, xp2: number, zp2: number, dist: number, aa: number, distL: number, distR: number
    let radius = 8 / devicePixelRatio, a = 10 / devicePixelRatio, l_n = 20 / devicePixelRatio

    let group = new Two.Group();

    let aL = obj.aL
    let aR = obj.aR

    if (aL > 0.0) distL = radius;
    else distL = a + radius;
    if (aR > 0.0) distR = radius;
    else distR = a + radius;


    si = obj.sinus
    co = obj.cosinus

    let index1 = obj.index1
    let index2 = obj.index2

    x1 = Math.round(tr.xPix(get_cad_node_X(index1) + co * aL));
    z1 = Math.round(tr.zPix(get_cad_node_Z(index1) + si * aL));
    x2 = Math.round(tr.xPix(get_cad_node_X(index2) - co * aR));
    z2 = Math.round(tr.zPix(get_cad_node_Z(index2) - si * aR));

    if (obj.gelenk[2] > 0) {                         // Momentengelenk links
        dx = co * distL; //(a + radius)
        dz = si * distL; //(a + radius)
        let kreis = new Two.Circle(x1 + dx, z1 + dz, radius, 10)
        kreis.fill = '#ffffff';
        kreis.linewidth = 2 / devicePixelRatio;
        distL += radius
        group.add(kreis)

    }
    if (obj.gelenk[5] > 0) {                         // Momentengelenk rechts
        dx = co * distR; //(a + radius)
        dz = si * distR; //(a + radius)
        let kreis = new Two.Circle(x2 - dx, z2 - dz, radius, 10)
        kreis.fill = '#ffffff';
        kreis.linewidth = 2 / devicePixelRatio;
        distR += radius
        group.add(kreis)

    }
    if (obj.gelenk[1] > 0) {                  // Querkraftgelenk links
        dist = distL + 3 / devicePixelRatio
        dx = co * dist
        dz = si * dist

        aa = 16 / devicePixelRatio
        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 - aa * si + dx
        zp2 = z1 + aa * co + dz
        let line = new Two.Line(xp1, zp1, xp2, zp2);
        line.linewidth = 4 / devicePixelRatio;
        line.stroke = '#ffffff';               // weißer Strich Mitte
        group.add(line)

        dist = distL
        dx = co * dist
        dz = si * dist

        //aa = 16 / devicePixelRatio
        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 - aa * si + dx
        zp2 = z1 + aa * co + dz
        let line2 = new Two.Line(xp1, zp1, xp2, zp2);
        line2.linewidth = 2 / devicePixelRatio;
        line2.stroke = '#000000';         // schwarzer Strich links
        group.add(line2)

        dist = distL + 4 / devicePixelRatio
        dx = co * dist
        dz = si * dist

        //aa = 16 / devicePixelRatio
        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 - aa * si + dx
        zp2 = z1 + aa * co + dz
        let line3 = new Two.Line(xp1, zp1, xp2, zp2);
        line3.linewidth = 2 / devicePixelRatio;
        line3.stroke = '#000000';        // schwarzer Strich rechts
        group.add(line3)

        distL += 6 / devicePixelRatio
    }
    if (obj.gelenk[4] > 0) {                  // Querkraftgelenk rechts
        dist = distR + 3 / devicePixelRatio
        dx = co * dist
        dz = si * dist

        aa = 16 / devicePixelRatio
        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 - aa * si - dx
        zp2 = z2 + aa * co - dz
        let line = new Two.Line(xp1, zp1, xp2, zp2);
        line.linewidth = 4 / devicePixelRatio;
        line.stroke = '#ffffff';
        group.add(line)

        dist = distR
        dx = co * dist
        dz = si * dist

        aa = 16 / devicePixelRatio
        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 - aa * si - dx
        zp2 = z2 + aa * co - dz
        let line2 = new Two.Line(xp1, zp1, xp2, zp2);
        line2.linewidth = 2 / devicePixelRatio;
        line2.stroke = '#000000';
        group.add(line2)

        dist = distR + 4 / devicePixelRatio
        dx = co * dist
        dz = si * dist

        aa = 16 / devicePixelRatio
        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 - aa * si - dx
        zp2 = z2 + aa * co - dz
        let line3 = new Two.Line(xp1, zp1, xp2, zp2);
        line3.linewidth = 2 / devicePixelRatio;
        line3.stroke = '#000000';
        group.add(line3)

        distR += 6 / devicePixelRatio

    }
    if (obj.gelenk[0] > 0) {                  // Normalkraftgelenk links

        dist = distL
        dx = co * dist
        dz = si * dist

        aa = 0
        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 + aa * si + dx + l_n * co
        zp2 = z1 - aa * co + dz + l_n * si
        let line0 = new Two.Line(xp1, zp1, xp2, zp2);
        line0.linewidth = 10 / devicePixelRatio;
        line0.stroke = '#000000';    //schwarz
        group.add(line0)

        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 + aa * si + dx + 0.8 * l_n * co
        zp2 = z1 - aa * co + dz + 0.8 * l_n * si
        let line = new Two.Line(xp1, zp1, xp2, zp2);
        line.linewidth = 10 / devicePixelRatio;
        line.stroke = '#ffffff';    //weiss
        group.add(line)

        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 + aa * si + dx + 0.5 * l_n * co
        zp2 = z1 - aa * co + dz + 0.5 * l_n * si
        let line4 = new Two.Line(xp1, zp1, xp2, zp2);
        line4.linewidth = 5 / devicePixelRatio;
        line4.stroke = '#000000';    //schwarz
        group.add(line4)

        //dist = 2 * radius + a
        // dx = co * dist
        // dz = si * dist

        aa = 8 / devicePixelRatio
        xp1 = x1 + aa * si + dx
        zp1 = z1 - aa * co + dz
        xp2 = x1 + aa * si + dx + l_n * co
        zp2 = z1 - aa * co + dz + l_n * si
        let line2 = new Two.Line(xp1, zp1, xp2, zp2);
        line2.linewidth = 6 / devicePixelRatio;
        line2.stroke = '#000000';
        group.add(line2)

        //dist = 2 * radius + a
        // dx = co * dist
        // dz = si * dist

        //aa = 16
        xp1 = x1 - aa * si + dx
        zp1 = z1 + aa * co + dz
        xp2 = x1 - aa * si + dx + l_n * co
        zp2 = z1 + aa * co + dz + l_n * si
        let line3 = new Two.Line(xp1, zp1, xp2, zp2);
        line3.linewidth = 6 / devicePixelRatio;
        line3.stroke = '#000000';
        group.add(line3)
    }
    if (obj.gelenk[3] > 0) {                  // Normalkraftgelenk rechts

        dist = distR
        dx = co * dist
        dz = si * dist

        aa = 0
        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 + aa * si - dx - l_n * co
        zp2 = z2 - aa * co - dz - l_n * si
        let line0 = new Two.Line(xp1, zp1, xp2, zp2);
        line0.linewidth = 10 / devicePixelRatio;
        line0.stroke = '#000000';    //schwarz
        group.add(line0)

        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 + aa * si - dx - 0.8 * l_n * co
        zp2 = z2 - aa * co - dz - 0.8 * l_n * si
        let line = new Two.Line(xp1, zp1, xp2, zp2);
        line.linewidth = 10 / devicePixelRatio;
        line.stroke = '#ffffff';    //weiss
        group.add(line)

        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 + aa * si - dx - 0.5 * l_n * co
        zp2 = z2 - aa * co - dz - 0.5 * l_n * si
        let line4 = new Two.Line(xp1, zp1, xp2, zp2);
        line4.linewidth = 5 / devicePixelRatio;
        line4.stroke = '#000000';    //schwarz
        group.add(line4)

        //dist = 2 * radius + a
        // dx = co * dist
        // dz = si * dist

        aa = 8 / devicePixelRatio
        xp1 = x2 + aa * si - dx
        zp1 = z2 - aa * co - dz
        xp2 = x2 + aa * si - dx - l_n * co
        zp2 = z2 - aa * co - dz - l_n * si
        let line2 = new Two.Line(xp1, zp1, xp2, zp2);
        line2.linewidth = 6 / devicePixelRatio;
        line2.stroke = '#000000';
        group.add(line2)

        //dist = 2 * radius + a
        // dx = co * dist
        // dz = si * dist

        //aa = 16
        xp1 = x2 - aa * si - dx
        zp1 = z2 + aa * co - dz
        xp2 = x2 - aa * si - dx - l_n * co
        zp2 = z2 + aa * co - dz - l_n * si
        let line3 = new Two.Line(xp1, zp1, xp2, zp2);
        line3.linewidth = 6 / devicePixelRatio;
        line3.stroke = '#000000';
        group.add(line3)
    }

    return group;
}



//-------------------------------------------------------------------------------------------------------
export function draw_knoten(obj: TCAD_Knoten, tr: CTrans) {
    //---------------------------------------------------------------------------------------------------

    let group = new Two.Group();

    let makeRoundedRectangle = new Two.RoundedRectangle(
        tr.xPix(obj.x1),
        tr.zPix(obj.z1),
        15 / devicePixelRatio,
        15 / devicePixelRatio,
        4
    );
    makeRoundedRectangle.fill = '#dd1100';

    group.add(makeRoundedRectangle)

    return group;
}