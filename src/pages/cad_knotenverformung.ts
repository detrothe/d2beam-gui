import Two from "two.js";
import { drDialogKnotenverformung } from "../components/dr-dialog_knotenverformung";
import { CAD_KNOTVERFORMUNG, init_cad, multiselect_color, reset_pointer_length, select_color, set_zoomIsActive, show_lastfall, slmax_cad, timer, tr, two } from "./cad";
import { buttons_control, mode_knotenverformung_aendern, obj_knotverform, set_help_text, set_mode_knotenverformung_aendern } from "./cad_buttons";
import { find_max_Lastfall, max_Lastfall, set_max_lastfall } from "./cad_draw_elementlasten";
import { TCAD_Knotenverformung } from "./CCAD_element";
import { CTrans } from "./trans";
import { CADNodes, get_cad_node_X, get_cad_node_Z } from "./cad_node";
import { draw_arrow, draw_BoundingClientRect_xz, draw_moment_arrow, style_pfeil_moment } from "./cad_draw_elemente";
import { myFormat } from "./utility";
import { berechnungErforderlich } from "./globals";
import { alertdialog } from "./rechnen";
import { mode_multi_selected_knotenverformung_aendern, update_multi_selected_knotenverformung } from "./cad_select";


const style_pfeil = {
    b: 25,
    h: 16,
    linewidth: 7,
    color: '#0000ba'
}

const style_txt_knotenlast = {
    family: 'system-ui, sans-serif',
    size: 14,
    fill: '#0000ba',
    weight: 'bold'
};

export class CNodeDisp {                                   // Knotenzwangsverformungen, analog zu Knotenkräften
    node = 0                                        // werden aber mit TElDisp0 wie Elementlasten verarbeitet
    lf = 0
    dispx0 = ''                                    // Knotenvorverformungen gedreht in Richtung eines gedrehten Lagers
    dispz0 = ''
    phi0 = ''
}

//--------------------------------------------------------------------------------------------------------
export function Knotenverformung_button() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in Knotenlast_button", buttons_control.knotenlast_eingabe_aktiv,ev)

    //let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement

    if (buttons_control.knotenverformung_eingabe_aktiv) {
        buttons_control.reset(0)

        // let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement
        // el.removeEventListener('keydown', keydown);
    } else {
        buttons_control.reset(0);
        //drawer_1_control.reset();
        //el.style.backgroundColor = 'darkRed'
        buttons_control.knotenverformung_eingabe_aktiv = true
        buttons_control.cad_eingabe_aktiv = true
        buttons_control.typ_cad_element = CAD_KNOTVERFORMUNG
        //el.addEventListener('keydown', keydown);
        buttons_control.n_input_points = 1
        buttons_control.button_pressed = true;
        set_zoomIsActive(false);
        reset_pointer_length();

        showDialog_knotenverformung();

        // jetzt auf Pointer eingabe warten

    }

}

//--------------------------------------------------------------------------------------------------------------

export function showDialog_knotenverformung(/* show_nur_lastfall = false */) {
    //------------------------------------------------------------------------------------------------------------
    console.log("dialog_knotenverformung_closed()");

    const el = document.getElementById("id_dialog_knotenverformung");
    console.log("id_dialog_knotenverformung", el);

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_knotenverformung")),
        (el?.shadowRoot?.getElementById("dialog_knotenverformung") as HTMLDialogElement).addEventListener("close", dialog_knotenverformung_closed);

    set_help_text('Knoten picken');

    (el?.shadowRoot?.getElementById("dialog_knotenverformung") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_knotenverformung_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_knotenverformung_closed", e);
    console.log("this", this);
    const ele = document.getElementById("id_dialog_knotenverformung") as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    if (returnValue === "ok") {
        //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
        console.log("sieht gut aus");
        if (mode_knotenverformung_aendern) update_knotenverformung();
        else if (mode_multi_selected_knotenverformung_aendern) update_multi_selected_knotenverformung();
    } else {
        // Abbruch
        (ele?.shadowRoot?.getElementById("dialog_knotenverformung") as HTMLDialogElement).removeEventListener("close", dialog_knotenverformung_closed);

        // knoten_eingabe_beenden();
        buttons_control.reset()
    }
}



//---------------------------------------------------------------------------------------------------------------
export function read_knotenverformung_dialog(nodeDisp: CNodeDisp): boolean {
    //-----------------------------------------------------------------------------------------------------------

    let ok = true;

    const el = document.getElementById("id_dialog_knotenverformung") as drDialogKnotenverformung;

    nodeDisp.lf = el.get_lastfall();
    if (nodeDisp.lf <= 0) {
        ok = false;
        alertdialog('ok', 'Lastfall muss größer 0 sein');
        return ok;
    }

    set_max_lastfall(nodeDisp.lf)

    nodeDisp.dispx0 = el.get_ux0();
    nodeDisp.dispz0 = el.get_uz0();
    nodeDisp.phi0 = el.get_phi0();

    if (Number(nodeDisp.dispx0) === 0 && Number(nodeDisp.dispz0) === 0 && Number(nodeDisp.phi0) === 0) {
        ok = false;
        alertdialog('ok', 'mindestens ein Verformungskomponente muss ungleich null sein');
        return ok;
    }

    return ok;

}


//---------------------------------------------------------------------------------------------------------------
export function write_knotenverformung_dialog(nodeDisp: CNodeDisp) {
    //-----------------------------------------------------------------------------------------------------------

    const el = document.getElementById("id_dialog_knotenverformung") as drDialogKnotenverformung;

    el.set_lastfall(nodeDisp.lf)
    el.set_ux0(nodeDisp.dispx0)
    el.set_uz0(nodeDisp.dispz0)
    el.set_phi0(nodeDisp.phi0)

}

//--------------------------------------------------------------------------------------------------------
export function draw_knotenverformung(tr: CTrans, obj: TCAD_Knotenverformung, fact: number, lf_show: number, new_flag = false) {
    //----------------------------------------------------------------------------------------------------

    let slmax = 2 * slmax_cad;

    let plength = slmax / 50 /*35 slmax / 20.*/, delta = 12 //slmax / 200.0
    let xpix: number, zpix: number
    let wert: number
    let nLoop = 0

    let xtr = Array(4), ztr = Array(4)
    let x = 0, z = 0, x0 = 0, z0 = 0, x1 = 0, z1 = 0

    //plength = tr.World0(2 * plength / devicePixelRatio)
    delta = tr.World0(delta / devicePixelRatio)

    let pLength_My = 0.8 * tr.World0(70 / devicePixelRatio)
    let txt_abstand = 9 / devicePixelRatio + 8

    let nodeDisp = obj.nodeDisp;
    let iLastfall = nodeDisp.lf

    let index1 = obj.index1;

    let phi = 0
    let si = 0
    let co = 1

    let group = new Two.Group();

    if (show_lastfall > 0) if (show_lastfall !== iLastfall) return group;

    lf_show = nodeDisp.lf - 1    // noch überarbeiten


    if (obj.multiSelected) {
        style_pfeil.color = multiselect_color;
        style_pfeil_moment.color = multiselect_color;
    } else {
        style_pfeil.color = '#0000ba';
        style_pfeil_moment.color = '#0000ba';
    }

    if (nodeDisp.dispx0.length > 0 && nodeDisp.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)
        if (timer.element_selected) {
            x = obj.posX_dispx0
            z = obj.posZ_dispx0
        } else {
            x = obj.posX_dispx0 = get_cad_node_X(index1) + CADNodes[index1].offset_Px
            z = obj.posZ_dispx0 = get_cad_node_Z(index1)
        }
        x0 = x + co * delta
        z0 = z - si * delta
        x1 = x + co * (delta + plength)
        z1 = z - si * (delta + plength)

        let grp = new Two.Group();

        wert = Number(nodeDisp.dispx0.replace(/,/g, ".")) * fact
        if (wert > 0.0) {
            let gr = draw_arrow(tr, x0, z0, x1, z1, timer.element_selected, style_pfeil)
            grp.add(gr)
        } else {
            let gr = draw_arrow(tr, x1, z1, x0, z0, timer.element_selected, style_pfeil)
            grp.add(gr)
        }

        // xpix = tr.xPix(x + delta)  //  + plength/2
        // zpix = tr.zPix(z) + 9
        xpix = tr.xPix((x0 + x1) / 2) + txt_abstand * si
        zpix = tr.zPix((z0 + z1) / 2) + txt_abstand * co
        let str = myFormat(Math.abs(wert), 1, 2) + 'mm'
        if (max_Lastfall > 1) str = iLastfall + '|' + str
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'center'
        txt.baseline = 'middle'
        txt.rotation = -phi
        if (timer.element_selected) txt.stroke = select_color;

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

        obj.set_drawLast_ux0(xtr, ztr)   // Koordinaten merken für Picken
        if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

        if (new_flag) {
            CADNodes[index1].offset_Px += plength
        }
    }

    if (nodeDisp.dispz0.length > 0 && nodeDisp.lf - 1 === lf_show) {
        //console.log("Knotenlast zu zeichnen am Knoten ", +inode + 1)
        if (timer.element_selected) {
            x = obj.posX_dispz0
            z = obj.posZ_dispz0
        } else {
            x = obj.posX_dispz0 = get_cad_node_X(index1)
            z = obj.posZ_dispz0 = get_cad_node_Z(index1) - CADNodes[index1].offset_Pz
        }
        let grp = new Two.Group();

        x0 = x - si * (delta + plength)
        z0 = z - co * (delta + plength)
        x1 = x - si * delta
        z1 = z - co * delta


        wert = Number(nodeDisp.dispz0.replace(/,/g, ".")) * fact
        if (wert > 0.0) {
            let gr = draw_arrow(tr, x0, z0, x1, z1, timer.element_selected, style_pfeil)
            grp.add(gr)
        } else {
            let gr = draw_arrow(tr, x1, z1, x0, z0, timer.element_selected, style_pfeil)
            grp.add(gr)
        }

        // xpix = tr.xPix(x) + 5
        // zpix = tr.zPix(z - delta - plength) + 5
        xpix = tr.xPix((x0 + x1) / 2) - txt_abstand * co
        zpix = tr.zPix((z0 + z1) / 2) + txt_abstand * si
        let str = myFormat(Math.abs(wert), 1, 2) + 'mm'
        if (max_Lastfall > 1) str = iLastfall + '|' + str
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'center'
        txt.baseline = 'middle'
        txt.rotation = Math.PI / 2 - phi
        if (timer.element_selected) txt.stroke = select_color;

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

        obj.set_drawLast_uz0(xtr, ztr)   // Koordinaten merken für Picken
        if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

        if (new_flag) {
            CADNodes[index1].offset_Pz += plength
        }
    }

    if (nodeDisp.phi0.length > 0 && nodeDisp.lf - 1 === lf_show) {

        if (timer.element_selected) {
            x = obj.posX_phi0
            z = obj.posZ_phi0
        } else {
            x = obj.posX_phi0 = get_cad_node_X(index1) - CADNodes[index1].offset_My
            z = obj.posZ_phi0 = get_cad_node_Z(index1)
        }
        let grp = new Two.Group();

        wert = Number(nodeDisp.phi0.replace(/,/g, ".")) * fact
        let vorzeichen = Math.sign(wert)
        let radius = tr.Pix0(slmax / 90 * devicePixelRatio)    //style_pfeil_moment.radius;
        //console.log("Moment radius", radius)
        if (wert > 0.0) {
            let gr = draw_moment_arrow(tr, x, z, 1.0, radius, timer.element_selected, style_pfeil_moment)
            grp.add(gr)
            xpix = tr.xPix(x - Math.sin(Math.PI / 5) * slmax / 90) // - 10 / devicePixelRatio
            zpix = tr.zPix(z + Math.cos(Math.PI / 5) * slmax / 90) + 10 * vorzeichen / devicePixelRatio + 8 * vorzeichen   // 8*vorzeichen = halbe Zeichehöhe
        } else {
            let gr = draw_moment_arrow(tr, x, z, -1.0, radius, timer.element_selected, style_pfeil_moment)
            grp.add(gr)
            xpix = tr.xPix(x - Math.sin(Math.PI / 5) * slmax / 90) // - 10 / devicePixelRatio
            zpix = tr.zPix(z - Math.cos(Math.PI / 5) * slmax / 90) + 20 * vorzeichen / devicePixelRatio //+ (vorzeichen * radius + 15 * vorzeichen) / devicePixelRatio
        }

        //zpix = tr.zPix(z + vorzeichen * slmax / 50) + 15 * vorzeichen / devicePixelRatio
        let str = myFormat(Math.abs(wert), 1, 2) + 'mrad'  //unit_moment
        if (max_Lastfall > 1) str = iLastfall + '|' + str
        const txt = new Two.Text(str, xpix, zpix, style_txt_knotenlast)
        txt.alignment = 'right'
        txt.baseline = 'middle'
        if (timer.element_selected) txt.stroke = select_color;
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

        obj.set_drawLast_phi0(xtr, ztr)   // Koordinaten merken für Picken
        if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

        if (new_flag) {
            CADNodes[index1].offset_My += pLength_My
        }
    }

    return group;

}


//---------------------------------------------------------------------------------------------------------------
function update_knotenverformung() {
    //-----------------------------------------------------------------------------------------------------------

    set_mode_knotenverformung_aendern(false);

    obj_knotverform.zero_drawLasten();

    let nodeDisp = new CNodeDisp();
    let ok = read_knotenverformung_dialog(nodeDisp)
    if (ok) {
        obj_knotverform.nodeDisp = nodeDisp

        find_max_Lastfall();

        let group = obj_knotverform.getTwoObj();
        two.remove(group)
        let index1 = obj_knotverform.index1
        group = draw_knotenverformung(tr, obj_knotverform, 1, 0);
        two.add(group);

        obj_knotverform.setTwoObj(group);
        two.update();

        init_cad(2);

        berechnungErforderlich(true);
    }

}

