import Two from 'two.js'

import { System, STABWERK, TNode, TLoads, alertdialog, TMass, maxBettung, set_maxBettung } from './rechnen'

import { CTrans } from './trans';
import { myFormat, write } from './utility';
import { TCAD_Knoten, TCAD_Knotenlast, TCAD_Lager, TCAD_Stab } from './CCAD_element';
import { draw_elementlasten } from './cad_draw_elementlasten';
//import { two } from './cad';
import { CADNodes, get_cad_node_X, get_cad_node_Z } from './cad_node';
import { drDialogEinstellungen } from '../components/dr-dialog_einstellungen';
import { opacity } from './grafik';
import { slmax_cad } from './cad';


const style_pfeil_knotenlast = {
    a: 50,
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

    // Knoten zeichnen

    let knSize = 9 / devicePixelRatio;
    let kn1 = new Two.Rectangle(tr.xPix(x1), tr.zPix(z1), knSize, knSize)
    kn1.fill = 'black'
    group.add(kn1);
    let kn2 = new Two.Rectangle(tr.xPix(x2), tr.zPix(z2), knSize, knSize)
    kn2.fill = 'black'
    group.add(kn2);

    if (obj.nGelenke > 0) {
        let gr = draw_stab_gelenke(obj as TCAD_Stab, tr);
        group.add(gr)
    }

    if (obj.k_0 !== 0.0) {
        if (Math.abs(obj.k_0) > maxBettung) set_maxBettung(Math.abs(obj.k_0))
        let gr = draw_bettungsmodul(obj, tr)  // Bettung darstellen
        group.add(gr)
    }
    //console.log("in drawStab, Anzahl Elementlasten:", obj.elast.length)

    if (obj.elast.length > 0) {
        let gr = draw_elementlasten(tr, obj)
        group.add(gr)
    }

    return group;
}


//--------------------------------------------------------------------------------------------------------
function draw_bettungsmodul(obj: TCAD_Stab, tr: CTrans) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in draw_bettungsmodul")

    let slmax = slmax_cad;

    let group = new Two.Group();

    let x = Array(4), z = Array(4), xtr = Array(4), ztr = Array(4)
    let si = obj.sinus
    let co = obj.cosinus
    let a = -slmax / 150.
    let p = obj.k_0 * slmax / 40 / maxBettung
    const color_load = '#ffc680';

    let index1 = obj.index1
    let index2 = obj.index2
    let x1 = get_cad_node_X(index1);
    let z1 = get_cad_node_Z(index1);
    let x2 = get_cad_node_X(index2);
    let z2 = get_cad_node_Z(index2);
    x[0] = x1 + si * a; z[0] = z1 - co * a;
    x[1] = x2 + si * a; z[1] = z2 - co * a;
    x[2] = x[1] - si * p; z[2] = z[1] + co * p;
    x[3] = x[0] - si * p; z[3] = z[0] + co * p;

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

    let xpix = (xtr[0] + xtr[1] + xtr[2] + xtr[3]) / 4
    let zpix = (ztr[0] + ztr[1] + ztr[2] + ztr[3]) / 4
    let str = myFormat(Math.abs(obj.k_0), 1, 2) + ' kN/m²'
    let txt = new Two.Text(str, xpix, zpix, style_txt)
    txt.alignment = 'center'
    txt.baseline = 'middle'
    txt.rotation = obj.alpha
    group.add(txt)

    return group;
}



//--------------------------------------------------------------------------------------------------------
export function draw_lager(tr: CTrans, obj: TCAD_Lager) {
    //----------------------------------------------------------------------------------------------------

    let node = obj.node;
    //console.log("in draw_lager", System, node)

    let index1 = obj.index1

    let x1 = Math.round(tr.xPix(get_cad_node_X(index1)));
    let z1 = Math.round(tr.zPix(get_cad_node_Z(index1)));
    let phi = -node.phi * Math.PI / 180

    let ele = document.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
    let faktor = ele.get_faktor_lagersymbol() / Math.min(devicePixelRatio, 1.5)

    let group = new Two.Group();

    if (System === STABWERK) {
        if (((node.L_org[0] === 1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) ||
            ((node.kx > 0.0) && (node.kz > 0.0) && (node.L[2] === -1))) {  // Volleinspannung oder mit zwei Translkationsfedern
            let rect = new Two.Rectangle(0.0, 0.0, 20, 20)
            rect.fill = '#dddddd';

            group.add(rect);
        }
        else if ((node.L[0] >= 0 || node.L_org[0] === -1) && (node.L_org[1] === 1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in x-Richtung

            let rechteck = new Two.Rectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = new Two.Line(-16, 15, 16, 15);
            line.linewidth = 2;

            group.add(line)

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L_org[2] === 1)) {  // Einspannung, verschieblich in z-Richtung

            let rechteck = new Two.Rectangle(0, 0, 20, 20)
            rechteck.fill = '#dddddd';
            group.add(rechteck)

            let line = new Two.Line(15, -16, 16, 15);
            line.linewidth = 2;

            group.add(line)

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

        }
        else if ((node.L_org[0] === 1) && (node.L[1] >= 0 || node.L_org[1] === -1) && (node.L[2] >= 0 || node.L_org[2] === -1)) { // einwertiges vertikal verschieblisches Lager

            //console.log("in einwertiges vertikales verschieblisches Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(20, -12));
            vertices.push(new Two.Anchor(20, 12));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(25, -18, 25, 18);
            line.linewidth = 2;

            group.add(line)

        }
    } else {                     // Fachwerk
        console.log("node", node)
        if ((node.L_org[0] === 1) && (node.L_org[1] === 1)) { // zweiwertiges Lager

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

        }
        else if ((node.L_org[0] >= 0) && (node.L_org[1] === 1)) { // einwertiges horizontal verschieblisches Lager

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

        }
        else if ((node.L_org[0] === 1) && (node.L_org[1] >= 0)) { // einwertiges vertikal verschieblisches Lager

            //console.log("in einwertiges vertikales Lager")
            var vertices = [];
            vertices.push(new Two.Anchor(0, 0));
            vertices.push(new Two.Anchor(20, -12));
            vertices.push(new Two.Anchor(20, 12));

            let flaeche = new Two.Path(vertices);
            flaeche.fill = '#dddddd';
            flaeche.closed = true;
            group.add(flaeche)

            let line = new Two.Line(25, -18, 25, 18);
            line.linewidth = 2;

            group.add(line)

        }

    }

    if (node.kx > 0.0 && node.L_org[0] === 0) {
        let gr = draw_feder('x')    // -1.5707963 +
        group.add(gr)
    }

    if (node.kz > 0.0 && node.L_org[1] === 0) {
        let gr = draw_feder('z')
        group.add(gr)
    }

    if (System === STABWERK) {
        if (node.kphi > 0.0 && node.L_org[2] === 0) {
            let gr = draw_drehfeder(tr)
            group.add(gr)
        }
    }

    group.scale = faktor
    group.rotation = phi
    group.translation.set(x1, z1)

    return group

}

//--------------------------------------------------------------------------------------------------------
export function draw_knotenlast(tr: CTrans, obj: TCAD_Knotenlast, index1: number, fact: number, lf_show: number, new_flag = false) {
    //----------------------------------------------------------------------------------------------------

    let slmax = 2 * slmax_cad;

    let plength = 50 /*35 slmax / 20.*/, delta = 12 //slmax / 200.0
    let xpix: number, zpix: number
    let wert: number
    let nLoop = 0

    let xtr = Array(4), ztr = Array(4)

    plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    let pLength_My = 0.8 * tr.World0(70 / devicePixelRatio)

    let load = obj.knlast

    let group = new Two.Group();

    //console.log("draw_knotenlast", x, z, plength, delta, load)

    lf_show = load.lf - 1    // noch überarbeiten


    if (load.Px != 0.0 && load.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)
        let x = get_cad_node_X(index1) + CADNodes[index1].offset_Px
        let z = get_cad_node_Z(index1)
        let grp = new Two.Group();

        wert = load.Px * fact
        if (wert > 0.0) {
            let gr = draw_arrow(tr, x + delta, z, x + delta + plength, z, style_pfeil_knotenlast)
            grp.add(gr)
        } else {
            let gr = draw_arrow(tr, x + delta + plength, z, x + delta, z, style_pfeil_knotenlast)
            grp.add(gr)
        }

        xpix = tr.xPix(x + delta)  //  + plength/2
        zpix = tr.zPix(z) + 9
        const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'left'
        txt.baseline = 'top'
        grp.add(txt)

        group.add(grp)

        let rect = grp.getBoundingClientRect()

        xtr[0] = tr.xWorld(rect.left)
        ztr[0] = tr.zWorld(rect.top)
        xtr[1] = tr.xWorld(rect.left)
        ztr[1] = tr.zWorld(rect.bottom)
        xtr[2] = tr.xWorld(rect.left + rect.width)
        ztr[2] = tr.zWorld(rect.bottom)
        xtr[3] = tr.xWorld(rect.left + rect.width)
        ztr[3] = tr.zWorld(rect.top);

        obj.set_drawLast_Px(xtr, ztr)   // Koordinaten merken für Picken



        if (new_flag) {
            CADNodes[index1].offset_Px += plength
        }
    }
    if (load.Pz != 0.0 && load.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)
        let x = get_cad_node_X(index1)
        let z = get_cad_node_Z(index1) - CADNodes[index1].offset_Pz
        let grp = new Two.Group();

        wert = load.Pz * fact
        if (wert > 0.0) {
            let gr = draw_arrow(tr, x, z - delta - plength, x, z - delta, style_pfeil_knotenlast)
            grp.add(gr)
        } else {
            let gr = draw_arrow(tr, x, z - delta, x, z - delta - plength, style_pfeil_knotenlast)
            grp.add(gr)
        }

        xpix = tr.xPix(x) + 5
        zpix = tr.zPix(z - delta - plength) + 5
        const str = myFormat(Math.abs(wert), 1, 2) + 'kN'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'left'
        txt.baseline = 'top'
        grp.add(txt)

        group.add(grp)

        let rect = grp.getBoundingClientRect()

        xtr[0] = tr.xWorld(rect.left)
        ztr[0] = tr.zWorld(rect.top)
        xtr[1] = tr.xWorld(rect.left)
        ztr[1] = tr.zWorld(rect.bottom)
        xtr[2] = tr.xWorld(rect.left + rect.width)
        ztr[2] = tr.zWorld(rect.bottom)
        xtr[3] = tr.xWorld(rect.left + rect.width)
        ztr[3] = tr.zWorld(rect.top);

        obj.set_drawLast_Pz(xtr, ztr)   // Koordinaten merken für Picken

        if (new_flag) {
            CADNodes[index1].offset_Pz += plength
        }
    }
    if (load.p[2] != 0.0 && load.lf - 1 === lf_show) {

        let x = get_cad_node_X(index1) - CADNodes[index1].offset_My
        let z = get_cad_node_Z(index1)
        let grp = new Two.Group();

        wert = load.p[2] * fact
        let vorzeichen = Math.sign(wert)
        let radius = style_pfeil_moment.radius;
        console.log("Moment radius", radius)
        if (wert > 0.0) {
            let gr = draw_moment_arrow(tr, x, z, 1.0, slmax / 50, style_pfeil_moment)
            grp.add(gr)
        } else {
            let gr = draw_moment_arrow(tr, x, z, -1.0, slmax / 50, style_pfeil_moment)
            grp.add(gr)
        }

        xpix = tr.xPix(x) - 10 / devicePixelRatio
        zpix = tr.zPix(z) + (vorzeichen * radius + 15 * vorzeichen) / devicePixelRatio
        //zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
        const str = myFormat(Math.abs(wert), 1, 2) + 'kNm'
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'right'
        //txt.baseline = 'bottom'
        grp.add(txt)

        group.add(grp)

        let rect = grp.getBoundingClientRect()

        xtr[0] = tr.xWorld(rect.left)
        ztr[0] = tr.zWorld(rect.top)
        xtr[1] = tr.xWorld(rect.left)
        ztr[1] = tr.zWorld(rect.bottom)
        xtr[2] = tr.xWorld(rect.left + rect.width)
        ztr[2] = tr.zWorld(rect.bottom)
        xtr[3] = tr.xWorld(rect.left + rect.width)
        ztr[3] = tr.zWorld(rect.top);

        obj.set_drawLast_My(xtr, ztr)   // Koordinaten merken für Picken

        if (new_flag) {
            CADNodes[index1].offset_My += pLength_My
        }
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
    //console.log("aaaaaaa",a,b,calc_a,sl,tr.xPix(sl),tr.xPix(0.0),tr.Pix0(sl))
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
        tr.xPix(get_cad_node_X(obj.index1)),
        tr.zPix(get_cad_node_Z(obj.index1)),
        11 / devicePixelRatio,
        11 / devicePixelRatio,
        4
    );
    makeRoundedRectangle.fill = 'black';

    group.add(makeRoundedRectangle)

    return group;
}


//--------------------------------------------------------------------------------------------------------
export function draw_knotenmasse(tr: CTrans, _mass: TMass, xm: number, zm: number) {
    //----------------------------------------------------------------------------------------------------

    let group = new Two.Group();

    let x = Math.round(tr.xPix(xm));
    let z = Math.round(tr.zPix(zm));
    let circle = new Two.Circle(x, z, 14, 20)
    circle.fill = '#ff3333'

    group.add(circle);

    return group;
}


//--------------------------------------------------------------------------------------------------------
function draw_feder(dir: string) {
    //----------------------------------------------------------------------------------------------------

    let x = Array(7)
    let z = Array(7)
    let x8, z8, x9, z9

    let a = 6
    let b = 4
    let c = 6
    let d = 10

    if (dir === 'x') {
        x[0] = 0.0
        z[0] = 0.0
        x[1] = x[0] + d
        z[1] = z[0]
        x[2] = x[1] + b
        z[2] = z[1] + c
        x[3] = x[2] + b
        z[3] = z[2] + -2 * c
        x[4] = x[3] + b
        z[4] = z[3] + 2 * c
        x[5] = x[4] + b
        z[5] = z[4] - c
        x[6] = x[5] + a
        z[6] = z[5]
        x8 = x[6]
        z8 = z[6] + 2 * c
        x9 = x[6]
        z9 = z[6] - 2 * c
    }
    else if (dir === 'z') {
        x[0] = 0.0
        z[0] = 0.0
        x[1] = x[0]
        z[1] = z[0] + d
        x[2] = x[1] + c
        z[2] = z[1] + b
        x[3] = x[2] + -2 * c
        z[3] = z[2] + b
        x[4] = x[3] + 2 * c
        z[4] = z[3] + b
        x[5] = x[4] - c
        z[5] = z[4] + b
        x[6] = x[5]
        z[6] = z[5] + a
        x8 = x[6] + 2 * c
        z8 = z[6]
        x9 = x[6] - 2 * c
        z9 = z[6]
    }

    let group = new Two.Group();

    var vertices = [];
    for (let i = 0; i < 7; i++) {
        vertices.push(new Two.Vector(x[i], z[i]));
    }
    // @ts-ignore
    let spring = new Two.Path(vertices);
    spring.closed = false
    //dreieck.fill = color;
    //dreieck.stroke = color;
    spring.linewidth = 2;

    group.add(spring)

    let line = new Two.Line(x8, z8, x9, z9);
    line.linewidth = 2;

    group.add(line)
    //line.scale = 1.0 / devicePixelRatio
    // line.rotation = alpha
    // line.translation.set(tr.xPix(x0), tr.zPix(z0))

    return group;

}


//--------------------------------------------------------------------------------------------------------
function draw_drehfeder(tr: CTrans) {
    //----------------------------------------------------------------------------------------------------

    let alpha: number, dalpha: number, teilung = 12
    let linewidth = 2
    let radius = 25 // devicePixelRatio
    let x: number, z: number

    let radiusW = tr.World0(radius)

    let group = new Two.Group();

    var vertices = [];

    //console.log("in draw_drehfeder", radius, x0, z0)

    dalpha = Math.PI / (teilung)
    alpha = 0.0   // -1.5707963
    for (let i = 0; i <= teilung; i++) {
        x = tr.Pix0(-radiusW * Math.sin(alpha))
        z = tr.Pix0(radiusW * Math.cos(alpha)) + radius
        //console.log("DREHFEDER x,z ", x, z)
        vertices.push(new Two.Anchor(x, z));
        alpha += dalpha
    }


    let curve = new Two.Path(vertices, false, true)
    curve.linewidth = linewidth;
    //curve.stroke = color;
    curve.noFill()
    //curve.fill="rgba(255,0,0,50);"
    //curve.translation.set(tr.xPix(x0), tr.zPix(z0 + radiusW / devicePixelRatio))

    group.add(curve)

    let z1 = (25 - 8) + radius // devicePixelRatio
    let z2 = (25 + 8) + radius  // devicePixelRatio
    let line = new Two.Line(0, z1, 0, z2);
    line.linewidth = linewidth;
    //line.translation.set(tr.xPix(x0), tr.zPix(z0 + radiusW / devicePixelRatio))

    group.add(line)

    //group.scale = 1.0 / devicePixelRatio

    return group;
}
