import Two from 'two.js'

import { CTrans } from './trans';
import { draw_arrow_alpha } from './grafik';
import { myFormat, write } from './utility';
import { LinkedList } from '../components/linkedlist';

let two: any = null;
let domElement: any = null
let tr: CTrans

let devicePixelRatio = 1

let fullscreen = false;
let grafik_top = 0

let mouseOffsetX = 0.0
let mouseOffsetY = 0.0
let mouseDx = 0.0
let mouseDz = 0.0

let zoomIsActive = false

let isPen = false

let centerX = 0.0
let centerY = 0.0
let centerX_last = 0.0
let centerY_last = 0.0

let rubberband: any = null
let input_active = false
let rubberband_drawn = false
let input_x = 0
let input_y = 0
let start_x = 0, end_x = 0
let start_y = 0, end_y = 0
let touchstart_x = 0, touchend_x = 0
let touchstart_y = 0, touchend_y = 0
let input_started = 0
let start_x_wc = 0, end_x_wc = 0  // x-z im Weltkoordinatensystem
let start_z_wc = 0, end_z_wc = 0

let cursorLineh = 0
let cursorLinev = 0
let txt_mouseCoord: any = null

let xminv = 0.0, xmaxv = 0.0, zminv = 0.0, zmaxv = 0.0

let raster_xmin = -1.0, raster_xmax = 10.0, raster_zmin = -1.0, raster_zmax = 9.0
let raster_dx = 0.5, raster_dz = 0.5
let xRasterPoint = 0.0, zRasterPoint = 0.0
let rasterPoint: any = null
let foundRasterPoint = false

const style_txt = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: 'black',
    //opacity: 0.5,
    //leading: 50
    weight: 'normal'
};

class TCADElement {
    qname: string = ''
    isActive = true;
    elTyp: number = 0           // 0 = 2 Knoten, 1 = Fachwerkstab, 3 = 3 Knoten, 3 = 4 Knoten
    x1: number = 0.0
    x2: number = 0.0
    z1: number = 0.0
    z2: number = 0.0

    constructor(x1: number, z1: number, x2: number, z2: number, elTyp: number) {
        this.x1 = x1
        this.z1 = z1
        this.x2 = x2
        this.z2 = z2
        this.elTyp = elTyp
    }
}

let list: LinkedList = new LinkedList(); // Empty list


// list.append(1);                           // 1
// list.prepend('Hello');                    // Hello <-> 1
// list.prepend(2);                          // 2 <-> Hello <-> 1
// list.append('Here I am');                 // 2 <-> Hello <-> 1 <-> Here I am
// list.insertAt('x', 2);                    // 2 <-> Hello <-> x <-> 1 <-> Here I am
// list.insertAt(5, 0);                      // 5 <-> 2 <-> Hello <-> x <-> 1 <-> Here I am
// console.log(list.getHead());              // would prompt 5
// console.log(list.getAt(0));               // would prompt 5
// console.log(list.getTail());              // would prompt Here I am
// console.log(list.getAt(4))                // would prompt 1
// console.log(list.removeHead());           // would prompt 5
//                                           // then 2 <-> Hello <-> x <-> 1 <-> Here I am
// console.log(list.removeTail());           // would pompt Here I am
//                                           // then 2 <-> Hello <-> x <-> 1
// console.log(list.removeAt(3));            // would prompt 1
//                                           // then 2 <-> Hello <-> x
// console.log(list.removeAt(1));            // would prompt Hello
//                                           // then 2 <-> x
// list.log();                               // would prompt 2 <-> Hello


function getFangweite() { return 0.2; }

//--------------------------------------------------------------------------------------------------------
export function click_zurueck_cad() {
    //----------------------------------------------------------------------------------------------------

    let elb = document.getElementById("id_button_zurueck_cad") as HTMLButtonElement
    let ele = document.getElementById("id_cad") as HTMLDivElement

    if (fullscreen) {
        console.log("click_zurueck_grafik_cad")
        let ele1 = document.getElementById("id_tab_group") as any
        console.log("HEIGHT id_tab_group boundingRect", ele1.getBoundingClientRect(), '|', ele1);

        ele.style.position = 'relative'
        fullscreen = false

        elb.innerHTML = "Fullscreen"
    }
    else {
        console.log("fullscreen")
        ele.style.position = 'absolute'
        fullscreen = true

        elb.innerHTML = "zurück"
    }

    elb.style.width = 'fit-content'

    //drawsystem();
    init_cad(0);

}


//--------------------------------------------------------------------------------------------------- i n i t _ t w o _ c a d

export function init_two_cad(svg_id = 'artboard_cad') {

    devicePixelRatio = window.devicePixelRatio

    if (two !== null) {
        // let parent = two.renderer.domElement.parentElement
        // console.log("Parent ", parent)

        two.unbind('update')
        two.pause()
        two.removeEventListener()
        two.clear()

        //two.bind('update')
        //        let parent = two.renderer.domElement.parentelement;
        //console.log("Parent ", parent)
        //if (parent) parent.removeChild(two.renderer.domElement);
    }

    if (domElement != null) {
        // domElement.removeEventListener('wheel', wheel, { passive: false });
        // domElement.removeEventListener('mousedown', mousedown, false);
        // domElement.removeEventListener('mouseup', mousemove, false);

        //console.log('domElement',domElement)
        let parent = domElement.parentElement
        //console.log("Parent ", parent)
        if (parent) parent.removeChild(domElement);
        const id_cad = document.getElementById('id_CAD') as any;
        id_cad.removeEventListener('keydown', keydown);
    }

    // const tab_group = document.getElementById('container') as any;
    // tab_group.hidden=true

    // for (let i = 0; i < two.scene.children.length; i++) {
    //     let child = two.scene.children[i];
    //     two.scene.remove(child);
    //     Two.Utils.dispose(child);
    // }

    console.log("__________________________________  C  A  D  ___________")
    if (svg_id === 'svg_artboard_cad') {
        const elem = document.getElementById(svg_id) as any; //HTMLDivElement;
        //console.log("childElementCount", elem.childElementCount)

        if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild);   // war > 2
    }

    var params = {
        fullscreen: false,
        type: Two.Types.canvas
    };

    if (svg_id === 'svg_artboard_cad') params.type = Two.Types.svg

    two = null;
    const artboard = document.getElementById(svg_id) as any;

    two = new Two(params).appendTo(artboard);

    if (svg_id === 'artboard_cad') {
        domElement = two.renderer.domElement;


        //     domElement.addEventListener('wheel', wheel, { passive: false });
        domElement.addEventListener('mousedown', mousedown, false);
        domElement.addEventListener('mouseup', mouseup, false);
        domElement.addEventListener('pointermove', pointermove, false);
        const id_cad = document.getElementById('id_CAD') as any;
        id_cad.addEventListener('keydown', keydown);
        domElement.addEventListener("contextmenu", (e: { preventDefault: () => any; }) => e.preventDefault());

        domElement.addEventListener('touchstart', touchstart, { passive: false });
        domElement.addEventListener('touchmove', touchmove, { passive: false });

        domElement.addEventListener('touchend', touchend, { passive: false });

    }

}


//--------------------------------------------------------------------------------------------------- i n i t _ c a d

export function init_cad(_flag: number) {
    let show_selection = true;
    let height = 0

    if (two) two.clear();

    let ele = document.getElementById("id_cad") as any
    if (fullscreen) {
        grafik_top = 0
        ele.style.position = 'absolute'
        height = document.documentElement.clientHeight - 4;
    } else {
        grafik_top = ele.getBoundingClientRect().top
        //console.log("HEIGHT id_grafik boundingRect", ele.getBoundingClientRect(), '|', ele);
        //write("grafik top: " + grafik_top)
        if (grafik_top === 0) grafik_top = 69
        height = document.documentElement.clientHeight - grafik_top - 4 - 17//- el?.getBoundingClientRect()?.height;
    }

    let breite: number
    let hoehe: number
    if (show_selection) {
        two.width = document.documentElement.clientWidth;
        two.height = height
        breite = two.width;
        hoehe = two.height;
    } else {
        two.width = breite = 1500;
        two.height = hoehe = 1500;
    }

    xminv = -1.0, xmaxv = 10.0, zminv = -1.0, zmaxv = 10.0

    if (tr === undefined) {
        console.log("in undefined")
        tr = new CTrans(xminv, zminv, xmaxv, zmaxv, breite, hoehe)
    } else {
        //if (init) {
        tr.init(xminv, zminv, xmaxv, zmaxv, breite, hoehe);

        //}
    }

    {

        // Koordinatenursprung darstellen

        draw_arrow_alpha(two, tr, 0.0, 0.0, 0.0, -1.0, { a: 55, b: 25, h: 12, linewidth: 4, color: '#bb0000' })
        let txt = two.makeText('x', tr.xPix(0.0) + 80 / devicePixelRatio, tr.zPix(0.0) - 10 / devicePixelRatio, style_txt)
        txt.fill = '#bb0000'
        draw_arrow_alpha(two, tr, 0.0, 0.0, Math.PI / 2.0, -1.0, { a: 55, b: 25, h: 12, linewidth: 4, color: '#0000bb' })
        txt = two.makeText('z', tr.xPix(0.0) + 10 / devicePixelRatio, tr.zPix(0.0) + 80 / devicePixelRatio, style_txt)
        txt.fill = '#0000bb'
    }
    {
        const [x_min, x_max, z_min, z_max] = tr.getMinMax();

        let dx = x_max - x_min
        let dz = z_max - z_min
        //console.log("min max", x_min, x_max, z_min, z_max, dx, dz)
        //console.log("LINKS", tr.xPix(x_min + dx * 0.1), tr.zPix(z_min + dz * 0.1), tr.xPix(x_min + dx * 0.1), tr.zPix(z_max - dz * 0.1))

        // linke Linie
        let rand = tr.World0(20 / devicePixelRatio)
        let xl = x_min + rand //dx * 0.05
        let zl = z_max - rand
        let line1 = two.makeLine(tr.xPix(xl), tr.zPix(z_min + dz * 0.05), tr.xPix(xl), tr.zPix(z_max - dz * 0.05));
        line1.linewidth = 1;

        let line2 = two.makeLine(tr.xPix(x_min), tr.zPix(0.0), tr.xPix(x_min + rand), tr.zPix(0.0));
        line2.linewidth = 1;
        let txt = two.makeText('0', tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(0.0), style_txt)
        txt.fill = '#000000'
        txt.baseline = 'middle'
        txt.alignment = 'left'

        //unten

        let line3 = two.makeLine(tr.xPix(x_min + dx * 0.05), tr.zPix(zl), tr.xPix(x_max - dx * 0.05), tr.zPix(zl));
        line3.linewidth = 1;
        let line4 = two.makeLine(tr.xPix(0.0), tr.zPix(z_max), tr.xPix(0.0), tr.zPix(z_max - rand));
        line4.linewidth = 1;
        let txt1 = two.makeText('0', tr.xPix(0.0), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
        txt1.fill = '#000000'
        txt1.baseline = 'baseline'
        txt1.alignment = 'center'

    }
    drawRaster();

    // Zeichne vorhandenes System

    console.log("list.size", list.size);
    for (let i = 0; i < list.size; i++) {
        let obj: TCADElement = list.getAt(i)
        //console.log("obj",obj)
        let line1 = two.makeLine(tr.xPix(obj.x1), tr.zPix(obj.z1), tr.xPix(obj.x2), tr.zPix(obj.z2));
        line1.linewidth = 3 /// devicePixelRatio;
    }

    two.update();
}


//--------------------------------------------------------------------------------------------------------
function pointermove(ev: PointerEvent) {
    //----------------------------------------------------------------------------------------------------
    //console.log("in pointermove", ev);

    ev.preventDefault();

    switch (ev.pointerType) {
        case "mouse":
            isPen = false
            mousemove(ev);
            break;
        case "pen":
            isPen = true
            //mousemove(ev);
            break;
        // case "touch":
        //     touchmove(ev);
        //     break;
    }
}

//--------------------------------------------------------------------------------------------------------
function mousedown(ev: any) {
    //----------------------------------------------------------------------------------------------------

    //console.log('in mousedown', ev)
    ev.preventDefault()

    // if (!mouseMoveIsActive) {
    //domElement.addEventListener('mousemove', mousemove, false);
    //     mouseMoveIsActive = true
    // }
    zoomIsActive = true

    mouseOffsetX = ev.offsetX
    mouseOffsetY = ev.offsetY

    mouseDx = 0.0
    mouseDz = 0.0

    //console.log("mouse_DownWX", mouse_DownWX, mouse_DownWY)

    //input_active = true
    // input_x = ev.offsetX
    // input_y = ev.offsetY
    // console.log("input mouse", input_x, input_y)
    // if (input_started === 0) {
    //     input_started = 1;
    // }
}


//--------------------------------------------------------------------------------------------------------
function mousemove(ev: MouseEvent) {
    //----------------------------------------------------------------------------------------------------

    // console.log('**********************************')
    //console.log('in mousemove', ev.movementX, ev.movementY, ev.offsetX, ev.offsetY)
    // console.log('**********************************')

    ev.preventDefault()

    two.remove(cursorLineh);
    two.remove(cursorLinev);
    let len = 10
    cursorLineh = two.makeLine(ev.offsetX - len, ev.offsetY, ev.offsetX + len, ev.offsetY);
    cursorLinev = two.makeLine(ev.offsetX, ev.offsetY - len, ev.offsetX, ev.offsetY + len);

    if (rubberband_drawn) {
        two.remove(rubberband);
    }
    if (foundRasterPoint) {
        two.remove(rasterPoint);
        foundRasterPoint = false;
    }

    if (input_started === 1) {
        rubberband = two.makeLine(start_x, start_y, ev.offsetX, ev.offsetY);
        rubberband.linewidth = 1 /// devicePixelRatio;
        rubberband.dashes = [2, 2]

        rubberband_drawn = true
    }

    if (txt_mouseCoord) {
        two.remove(txt_mouseCoord)
    }
    let xc = tr.xWorld(ev.offsetX)
    let zc = tr.zWorld(ev.offsetY)
    let txt = myFormat(xc, 2, 2) + '|' + myFormat(zc, 2, 2)
    txt_mouseCoord = two.makeText(txt, two.width - 100, two.height - 20, style_txt)
    txt_mouseCoord.fill = '#000000'
    txt_mouseCoord.baseline = 'middle'
    txt_mouseCoord.alignment = 'left'

    if (rubberband_drawn) {
        let gefunden = findNextRasterPoint(xc, zc)
        if (gefunden) {
            rasterPoint = two.makeRectangle(tr.xPix(xRasterPoint), tr.zPix(zRasterPoint), 5, 5);
            rasterPoint.fill = '#0000ff';
            rasterPoint.stroke = "#0000ff";
            foundRasterPoint = true;
        }
    }

    two.update();
}

//--------------------------------------------------------------------------------------------------------
function mouseup(ev: any) {
    //----------------------------------------------------------------------------------------------------

    console.log('in mouseup', ev.button)
    ev.preventDefault()

    //if (!needMouseMoveForInfo) {
    //domElement.removeEventListener('mousemove', mousemove, false);
    //    mouseMoveIsActive = false
    // }
    zoomIsActive = false

    centerX_last = centerX
    centerY_last = centerY

    if (ev.button === 0) {   // Linker Mausbutton
        if (input_started === 0) {
            input_active = true
            input_started = 1

            let xc = tr.xWorld(ev.offsetX)
            let zc = tr.zWorld(ev.offsetY)
            let gefunden = findNextRasterPoint(xc, zc)
            if (gefunden) {
                rasterPoint = two.makeRectangle(tr.xPix(xRasterPoint), tr.zPix(zRasterPoint), 5, 5);
                rasterPoint.fill = '#0000ff';
                rasterPoint.stroke = "#0000ff";
                foundRasterPoint = true;
                start_x = tr.xPix(xRasterPoint)
                start_y = tr.zPix(zRasterPoint)
                start_x_wc = xRasterPoint
                start_z_wc = zRasterPoint
            } else {
                start_x = ev.offsetX
                start_y = ev.offsetY
                start_x_wc = xc
                start_z_wc = zc
            }
        } else if (input_started === 1) {
            two.remove(rubberband);
            if (foundRasterPoint) {
                end_x = tr.xPix(xRasterPoint)
                end_y = tr.zPix(zRasterPoint)
                end_x_wc = xRasterPoint
                end_z_wc = zRasterPoint
            } else {
                end_x = ev.offsetX
                end_y = ev.offsetY
                end_x_wc = tr.xWorld(ev.offsetX)
                end_z_wc = tr.zWorld(ev.offsetY)
            }
            input_started = 0
            let line1 = two.makeLine(start_x, start_y, end_x, end_y);
            line1.linewidth = 3 /// devicePixelRatio;

            two.update();
            input_active = false
            rubberband_drawn = false

            const el = new TCADElement(start_x_wc, start_z_wc, end_x_wc, end_z_wc, 0)
            list.append(el)
            //list.log()
        }
    }
}

//------------------------------------------------------------------------------------------------
function keydown(ev: any) {
    //--------------------------------------------------------------------------------------------

    //write('KEYDOWN ' + ev.target.type + ' | ' + ev)

    console.log(
        'KEYDOWN, keycode, key, code: ',
        ev.keyCode,
        ev.key,
        ev.code
        //ev.target.id,
        //ev.target.offsetParent.offsetParent.id,
        //ev.target.type
    );

    if (ev.key === 'Escape') {
        if (rubberband_drawn) {
            two.remove(rubberband);
            two.update();
        }
        input_active = false
        rubberband_drawn = false
        input_started = 0
    }
}

// --------------------------  T O U C H  T O U C H  T O U C H  T O U C H  T O U C H  --------------------
//--------------------------------------------------------------------------------------------------------
function touchstart(ev: TouchEvent) {
    //----------------------------------------------------------------------------------------------------
    ev.preventDefault();

    write("in touchstart " + ev.touches.length + " | " + input_started)
    if (ev.touches.length === 1) {
        if (input_started === 0) {
            input_active = true
            input_started = 1
            touchstart_x = ev.touches[0].clientX
            touchstart_y = ev.touches[0].clientY - grafik_top
        }
    }
}


//--------------------------------------------------------------------------------------------------------
function touchend(ev: TouchEvent) {
    //----------------------------------------------------------------------------------------------------
    // console.log("in touchend", ev.touches.length);
    write("in touchend " + ev.touches.length + " | " + input_started);

    ev.preventDefault();

    // if (ev.touches.length === 0) {
    //     if (input_started === 1) {
    input_active = false
    input_started = 0
    write("touchstart_x_y " + touchstart_x + " | " + touchstart_y);

    write("touchend_x_y " + touchend_x + " | " + touchend_y);
    let line1 = two.makeLine(touchstart_x, touchstart_y, touchend_x, touchend_y);
    line1.linewidth = 2 /// devicePixelRatio;

    two.update();
    //     }
    // }
}

//--------------------------------------------------------------------------------------------------------
function touchmove(ev: TouchEvent) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in touchmove", ev);
    ev.preventDefault();

    touchend_x = ev.touches[0].clientX;
    touchend_y = ev.touches[0].clientY - grafik_top;
}

//------------------------------------------------------------------------------------------------
function drawRaster() {
    //--------------------------------------------------------------------------------------------

    let xp = 0.0, zp = 0.0, xg = 0.0, zg = 0.0

    let size = 5 / devicePixelRatio

    let nx = Math.abs(raster_xmax - raster_xmin) / raster_dx;
    let nz = Math.abs(raster_zmax - raster_zmin) / raster_dz;
    //qDebug() << "nx, ny : " << nx << ny << m_xRaster << m_yRaster;
    if (nx > 1000 || nz > 1000) return;

    while (zp <= raster_zmax) {
        xp = 0.0;
        while (xp <= raster_xmax) {
            xg = xp; zg = zp;
            let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
            rechteck.fill = '#ff0000';
            rechteck.stroke = "#ff0000";
            xp += raster_dx;
        }
        zp += raster_dz;
    }


    zp = -raster_dz;
    while (zp >= raster_zmin) {
        xp = -raster_dx;
        while (xp >= raster_xmin) {
            xg = xp; zg = zp;
            let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
            rechteck.fill = '#ff0000';
            rechteck.stroke = "#ff0000";
            xp -= raster_dx;
        }
        zp -= raster_dz;
    }

    zp = 0.0;
    while (zp <= raster_zmax) {
        xp = -raster_dx;
        while (xp >= raster_xmin) {
            xg = xp; zg = zp;
            let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
            rechteck.fill = '#ff0000';
            rechteck.stroke = "#ff0000";
            xp -= raster_dx;
        }
        zp += raster_dz;
    }

    zp = -raster_dz;
    while (zp >= raster_zmin) {
        xp = 0.0;
        while (xp <= raster_xmax) {
            xg = xp; zg = zp;
            let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
            rechteck.fill = '#ff0000';
            rechteck.stroke = "#ff0000";
            xp += raster_dx;
        }
        zp -= raster_dz;
    }
}


//-------------------------------------------------------------------------------------------------------
function findNextRasterPoint(xl: number, yl: number)
//-------------------------------------------------------------------------------------------------------
// xl, yl : lokale Koordinaten des Cursors
{
    let sl2: number, slmin: number, rahm: number, fangweite2: number;
    let x1: number, x2: number, y1: number, y2: number;
    let gefunden = false;

    slmin = 1.e30;
    rahm = getFangweite();
    fangweite2 = rahm * rahm;

    if (xl >= 0.0) {
        x1 = Math.trunc(xl / raster_dx) * raster_dx;
        x2 = x1 + raster_dx;
    } else {
        x2 = Math.trunc(xl / raster_dx) * raster_dx;
        x1 = x2 - raster_dx;
    }
    if (yl >= 0.0) {
        y1 = Math.trunc(yl / raster_dz) * raster_dz;
        y2 = y1 + raster_dz;
    } else {
        y2 = Math.trunc(yl / raster_dz) * raster_dz;
        y1 = y2 - raster_dz;
    }

    sl2 = (x1 - xl) * (x1 - xl) + (y1 - yl) * (y1 - yl);
    if (sl2 < fangweite2) {
        if (sl2 < slmin) {
            slmin = sl2;
            xRasterPoint = x1;
            zRasterPoint = y1;
            gefunden = true;
        }
    }
    sl2 = (x2 - xl) * (x2 - xl) + (y1 - yl) * (y1 - yl);
    if (sl2 < fangweite2) {
        if (sl2 < slmin) {
            slmin = sl2;
            xRasterPoint = x2;
            zRasterPoint = y1;
            gefunden = true;
        }
    }
    sl2 = (x2 - xl) * (x2 - xl) + (y2 - yl) * (y2 - yl);
    if (sl2 < fangweite2) {
        if (sl2 < slmin) {
            slmin = sl2;
            xRasterPoint = x2;
            zRasterPoint = y2;
            gefunden = true;
        }
    }
    sl2 = (x1 - xl) * (x1 - xl) + (y2 - yl) * (y2 - yl);
    if (sl2 < fangweite2) {
        if (sl2 < slmin) {
            slmin = sl2;
            xRasterPoint = x1;
            zRasterPoint = y2;
            gefunden = true;
        }
    }

    return gefunden;

}