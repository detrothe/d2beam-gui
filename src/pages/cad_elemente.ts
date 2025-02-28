import Two from 'two.js'

import { System, STABWERK, TNode } from './rechnen'

import { CTrans } from './trans';


//--------------------------------------------------------------------------------------------------------
export function draw_lager(two: Two, tr:CTrans, node: TNode) {
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

