import { drDialogEdit_selected_elementlasten } from "../components/dr-dialog_edit_selected_elementlasten"
import { drDialogElementlasten } from "../components/dr-dialog_elementlasten"
import { drDialogKnotenlast } from "../components/dr-dialog_knotenlast"
import { drDialogKnotenmasse } from "../components/dr-dialog_knotenmasse"
import { drDialogKopieren } from "../components/dr-dialog_kopieren"
import { drDialogSelektTyp } from "../components/dr-dialog_selekt_typ"
import { drDialogStabEigenschaften } from "../components/dr-dialog_stab_eigenschaften"
import { CAD_COPY_SELECTED, CAD_KNLAST, CAD_KNMASSE, CAD_LAGER, CAD_SELECT_MULTI, CAD_STAB, CAD_UNSELECT_MULTI, init_cad, list, tr, two } from "./cad"
import { buttons_control, drawer_1_control, set_help_text, showDialog_elementlast, showDialog_knotenlast, showDialog_knotenmasse } from "./cad_buttons"
import { draw_knotenlast, draw_knotenmasse, draw_lager, drawStab } from "./cad_draw_elemente"
import { find_max_Lastfall, find_maxValues_eloads, set_max_lastfall } from "./cad_draw_elementlasten"
import { add_cad_node, add_element_nodes, find_nearest_cad_node, get_cad_node_X, get_cad_node_Z } from "./cad_node"
import { TCAD_Element, TCAD_Stab, TCAD_Streckenlast, TCAD_Einzellast, TCAD_Temperaturlast, TCAD_Vorspannung, TCAD_Spannschloss, TCAD_Stabvorverformung, TCAD_Knotenlast, TCAD_Knotenmasse, TCAD_Lager } from "./CCAD_element"
import { berechnungErforderlich } from "./globals"
import { querschnittset } from "./querschnitte"
import { TLoads, TMass, TNode } from "./rechnen"



let ncopies = 1;
let dx_copy = 0;
let dz_copy = 0;
let copy_option = 1;
let copy_eload = false;

export let mode_multi_selected_elementlast_aendern = false;
export let mode_multi_selected_knotenlast_aendern = false;
export let mode_multi_selected_knotenmasse_aendern = false;

//------------------------------------------------------------------------------------------------------
export function select_multi_button(art: number) {
    //----------------------------------------------------------------------------------------------------

    if (buttons_control.select_multi_aktiv) {
        buttons_control.reset()
    } else {
        buttons_control.reset()
        buttons_control.select_multi_aktiv = true
        buttons_control.art = art
        buttons_control.cad_eingabe_aktiv = true
        buttons_control.typ_cad_element = CAD_SELECT_MULTI
        set_help_text('CAD Element picken');
        //el.addEventListener('keydown', keydown);
        buttons_control.n_input_points = 1
        buttons_control.button_pressed = true;

    }
}


//------------------------------------------------------------------------------------------------------
export function unselect_multi_button(art: number) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in select_multi_button")

    if (buttons_control.unselect_multi_aktiv) {
        buttons_control.reset()
    } else {
        buttons_control.reset()
        buttons_control.unselect_multi_aktiv = true
        buttons_control.art = art
        buttons_control.cad_eingabe_aktiv = true
        buttons_control.typ_cad_element = CAD_UNSELECT_MULTI
        set_help_text('CAD Element picken');
        //el.addEventListener('keydown', keydown);
        buttons_control.n_input_points = 1
        buttons_control.button_pressed = true;

    }
}

//------------------------------------------------------------------------------------------------------
export function unselect_all_button() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in unselect_all_button")

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        obj.multiSelected = false;
        if (obj.elTyp === CAD_STAB) {
            for (let j = 0; j < (obj as TCAD_Stab).elast.length; j++) {
                (obj as TCAD_Stab).elast[j].multiSelected = false;
            }
        }

    }

    buttons_control.reset();
    drawer_1_control.reset();


}


//------------------------------------------------------------------------------------------------------
export function copy_selected_button() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in unselect_all_button")

    if (buttons_control.select_multi_aktiv) {
        buttons_control.reset()
    } else {
        buttons_control.reset()
        buttons_control.copy_selected_aktiv = true
        buttons_control.cad_eingabe_aktiv = true
        buttons_control.typ_cad_element = CAD_COPY_SELECTED
        set_help_text('Pfeilende von Kopiervektor picken');
        //el.addEventListener('keydown', keydown);
        buttons_control.n_input_points = 2
        buttons_control.button_pressed = true;

        showDialog_kopieren();
    }

}


//------------------------------------------------------------------------------------------------------
export function select_typ_button() {
    //----------------------------------------------------------------------------------------------------


    buttons_control.reset()


    showDialog_selekt_typ();


}

//------------------------------------------------------------------------------------------------------
export function copy_selected(dx0: number, dz0: number) {
    //----------------------------------------------------------------------------------------------------

    console.log("in copy_selected", dx0, dz0)
    if (ncopies < 1) return;

    let lsize = list.size

    for (let i = 0; i < lsize; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        if (obj.multiSelected) {
            if (obj.elTyp === CAD_STAB) {

                let x1 = get_cad_node_X((obj as TCAD_Stab).index1)
                let z1 = get_cad_node_Z((obj as TCAD_Stab).index1)
                let x2 = get_cad_node_X((obj as TCAD_Stab).index2)
                let z2 = get_cad_node_Z((obj as TCAD_Stab).index2)

                let dx = dx0, dz = dz0;
                for (let i = 0; i < ncopies; i++) {
                    let index1 = add_cad_node(x1 + dx, z1 + dz, 1);
                    let index2 = add_cad_node(x2 + dx, z2 + dz, 1);
                    add_element_nodes(index1);
                    add_element_nodes(index2);

                    let qname = (obj as TCAD_Stab).get_name_querschnitt();
                    let group = null;
                    const stab_obj = new TCAD_Stab(group, index1, index2, qname, CAD_STAB);
                    list.append(stab_obj);

                    group = drawStab(stab_obj, tr);
                    two.add(group);

                    stab_obj.setTwoObj(group)

                    stab_obj.k_0 = (obj as TCAD_Stab).k_0;
                    stab_obj.aL = (obj as TCAD_Stab).aL;
                    stab_obj.aR = (obj as TCAD_Stab).aR;
                    stab_obj.nGelenke = (obj as TCAD_Stab).nGelenke;
                    for (let j = 0; j < 6; j++)  stab_obj.gelenk[j] = (obj as TCAD_Stab).gelenk[j];
                    stab_obj.sinus = (obj as TCAD_Stab).sinus;
                    stab_obj.cosinus = (obj as TCAD_Stab).cosinus;
                    stab_obj.alpha = (obj as TCAD_Stab).alpha;
                    stab_obj.stabTyp = (obj as TCAD_Stab).stabTyp;

                    if (copy_eload) {

                        let neloads = (obj as TCAD_Stab).elast.length;
                        for (let j = 0; j < neloads; j++) {
                            if ((obj as TCAD_Stab).elast[j].className === "TCAD_Streckenlast") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Streckenlast
                                stab_obj.add_streckenlast(ob.lastfall, ob.art, ob.pL, ob.pR);
                            } else if ((obj as TCAD_Stab).elast[j].className === "TCAD_Einzellast") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Einzellast
                                stab_obj.add_einzellast(ob.lastfall, ob.xe, ob.P, ob.M);
                            } else if ((obj as TCAD_Stab).elast[j].className === "TCAD_Temperaturlast") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Temperaturlast
                                stab_obj.add_temperaturlast(ob.lastfall, ob.To, ob.Tu);
                            } else if ((obj as TCAD_Stab).elast[j].className === "TCAD_Vorspannung") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Vorspannung
                                stab_obj.add_vorspannung(ob.lastfall, ob.sigmaV);
                            } else if ((obj as TCAD_Stab).elast[j].className === "TCAD_Spannschloss") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Spannschloss
                                stab_obj.add_spannschloss(ob.lastfall, ob.ds);
                            } else if ((obj as TCAD_Stab).elast[j].className === "TCAD_Stabvorverformung") {
                                let ob = (obj as TCAD_Stab).elast[j] as TCAD_Stabvorverformung
                                stab_obj.add_stabvorverformung(ob.lastfall, ob.w0a, ob.w0m, ob.w0e);
                            }
                        }
                    }

                    dx += dx0;
                    dz += dz0;
                }
            }
        }
    }

    lsize = list.size
    for (let i = 0; i < lsize; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        if (obj.multiSelected) {
            if (obj.elTyp === CAD_KNMASSE) {
                let x1 = get_cad_node_X((obj as TCAD_Knotenmasse).index1)
                let z1 = get_cad_node_Z((obj as TCAD_Knotenmasse).index1)
                let masse = new TMass();
                masse.mass = (obj as TCAD_Knotenmasse).masse.mass;
                masse.theta = (obj as TCAD_Knotenmasse).masse.theta;

                let dx = dx0, dz = dz0;
                for (let i = 0; i < ncopies; i++) {
                    let index = find_nearest_cad_node(x1 + dx, z1 + dz);
                    if (index > -1) {
                        let group = null;
                        const el = new TCAD_Knotenmasse(group, index, masse, CAD_KNMASSE);
                        list.append(el);
                        add_element_nodes(index);

                        group = draw_knotenmasse(tr, el, get_cad_node_X(index), get_cad_node_Z(index));
                        two.add(group);
                        el.setTwoObj(group);
                    }
                    dx += dx0;
                    dz += dz0;
                }
            }
            else if (obj.elTyp === CAD_LAGER) {
                let x1 = get_cad_node_X((obj as TCAD_Lager).index1)
                let z1 = get_cad_node_Z((obj as TCAD_Lager).index1)
                let node = new TNode();
                for (let j = 0; j < 3; j++) node.L_org[j] = (obj as TCAD_Lager).node.L_org[j];
                node.kx = (obj as TCAD_Lager).node.kx;
                node.kz = (obj as TCAD_Lager).node.kz;
                node.kphi = (obj as TCAD_Lager).node.kphi;
                node.phi = (obj as TCAD_Lager).node.phi;

                let dx = dx0, dz = dz0;
                for (let i = 0; i < ncopies; i++) {
                    let index = find_nearest_cad_node(x1 + dx, z1 + dz);
                    if (index > -1) {
                        let group = null;
                        const el = new TCAD_Lager(group, index, node, CAD_LAGER);
                        list.append(el);
                        add_element_nodes(index);

                        group = draw_lager(tr, el);
                        two.add(group);
                        el.setTwoObj(group);
                    }
                    dx += dx0;
                    dz += dz0;
                }
            }
            else if (obj.elTyp === CAD_KNLAST) {
                let x1 = get_cad_node_X((obj as TCAD_Knotenlast).index1)
                let z1 = get_cad_node_Z((obj as TCAD_Knotenlast).index1)
                let knlast = new TLoads();
                for (let j = 0; j < 3; j++) knlast.p[j] = (obj as TCAD_Knotenlast).knlast.p[j];
                knlast.lf = (obj as TCAD_Knotenlast).knlast.lf;
                knlast.Px_org = (obj as TCAD_Knotenlast).knlast.Px_org;
                knlast.Pz_org = (obj as TCAD_Knotenlast).knlast.Pz_org;
                knlast.alpha = (obj as TCAD_Knotenlast).knlast.alpha;
                knlast.Px = (obj as TCAD_Knotenlast).knlast.Px;
                knlast.Pz = (obj as TCAD_Knotenlast).knlast.Pz;

                let dx = dx0, dz = dz0;
                for (let i = 0; i < ncopies; i++) {
                    let index = find_nearest_cad_node(x1 + dx, z1 + dz);
                    if (index > -1) {
                        let group = null;
                        const el = new TCAD_Knotenlast(group, index, knlast, CAD_KNLAST);
                        list.append(el);
                        add_element_nodes(index);

                        group = draw_knotenlast(tr, el, index, 1, 0, true);
                        two.add(group);
                        el.setTwoObj(group);
                    }
                    dx += dx0;
                    dz += dz0;
                }
            }
        }
    }
    two.update();

}


//---------------------------------------------------------------------------------------------------------------

export function showDialog_kopieren() {
    //------------------------------------------------------------------------------------------------------------

    console.log("showDialog_kopieren()");

    const el = document.getElementById("id_dialog_kopieren");
    console.log("id_dialog_kopieren", el);

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_kopieren")),
        (el?.shadowRoot?.getElementById("dialog_kopieren") as HTMLDialogElement).addEventListener("close", dialog_kopieren_closed);

    //set_help_text('Knoten picken');

    (el?.shadowRoot?.getElementById("dialog_kopieren") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_kopieren_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_kopieren_closed", e);
    console.log("this", this);
    const ele = document.getElementById("id_dialog_kopieren") as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    (ele?.shadowRoot?.getElementById("dialog_kopieren") as HTMLDialogElement).removeEventListener("close", dialog_kopieren_closed);

    if (returnValue === "ok") {
        console.log("sieht gut aus");

        const el = document.getElementById("id_dialog_kopieren") as drDialogKopieren;

        ncopies = el.get_ncopies();
        copy_eload = el.get_copy_eload();

        copy_option = el.get_option();

        if (copy_option === 0) {
            dx_copy = el.get_dx();
            dz_copy = el.get_dz();
            copy_selected(dx_copy, dz_copy);
            buttons_control.reset();
            drawer_1_control.reset();
        }
    }
    else {
        buttons_control.reset();
        drawer_1_control.reset();
    }


}



//---------------------------------------------------------------------------------------------------------------

export function showDialog_selekt_typ() {
    //------------------------------------------------------------------------------------------------------------

    console.log("showDialog_selekt_typ()");

    const el = document.getElementById("id_dialog_selekt_typ");

    //console.log("shadow", el?.shadowRoot?.getElementById("dialog_selekt_typ")),
    (el?.shadowRoot?.getElementById("dialog_selekt_typ") as HTMLDialogElement).addEventListener("close", dialog_selekt_typ_closed);

    //set_help_text('Knoten picken');

    (el?.shadowRoot?.getElementById("dialog_selekt_typ") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_selekt_typ_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_selekt_typ_closed", e);
    console.log("this", this);
    const ele = document.getElementById("id_dialog_selekt_typ") as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    (ele?.shadowRoot?.getElementById("dialog_selekt_typ") as HTMLDialogElement).removeEventListener("close", dialog_selekt_typ_closed);

    if (returnValue === "ok") {
        console.log("sieht gut aus");

        const el = document.getElementById("id_dialog_selekt_typ") as drDialogSelektTyp;

        let eltyp = el.get_option();

        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Element;
            if (obj.elTyp === CAD_STAB && eltyp == 0) obj.multiSelected = true;
            else if (obj.elTyp === CAD_KNLAST && eltyp === 2) obj.multiSelected = true;
            else if (obj.elTyp === CAD_LAGER && eltyp === 3) obj.multiSelected = true;
            else if (obj.elTyp === CAD_KNMASSE && eltyp === 4) obj.multiSelected = true;

            else if (obj.elTyp === CAD_STAB && eltyp === 1) {
                for (let j = 0; j < (obj as TCAD_Stab).elast.length; j++) {
                    (obj as TCAD_Stab).elast[j].multiSelected = true;
                }
            }
        }
    }

    buttons_control.reset();
    drawer_1_control.reset();

}


//------------------------------------------------------------------------------------------------------
export function edit_selected_button() {
    //----------------------------------------------------------------------------------------------------

    buttons_control.reset()

    let nStaebe_edit_selected = 0;
    let nStablasten_edit_selected = 0;
    let nKnLast_edit_selected = 0;
    let nLager_edit_selected = 0;
    let nMassen_edit_selected = 0;

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        console.log("obj.elTyp, obj.multiSelected",obj.elTyp, obj.multiSelected)
        if (obj.elTyp === CAD_STAB && obj.multiSelected) nStaebe_edit_selected++;
        else if (obj.elTyp === CAD_KNLAST && obj.multiSelected) nKnLast_edit_selected++;
        else if (obj.elTyp === CAD_LAGER && obj.multiSelected) nLager_edit_selected++;
        else if (obj.elTyp === CAD_KNMASSE && obj.multiSelected) nMassen_edit_selected++;

        else if (obj.elTyp === CAD_STAB) {
            for (let j = 0; j < (obj as TCAD_Stab).elast.length; j++) {
                if ((obj as TCAD_Stab).elast[j].multiSelected) nStablasten_edit_selected++;
            }
        }
    }

    console.log("NSTAEBE...", nMassen_edit_selected)

    if (nStaebe_edit_selected > 0) showDialog_edit_selected_staebe();

    if (nStablasten_edit_selected > 0) showDialog_edit_selected_stablasten();

    if (nKnLast_edit_selected > 0) {
        mode_multi_selected_knotenlast_aendern = true;
        showDialog_knotenlast(true);
    }
    if (nMassen_edit_selected > 0) {
        mode_multi_selected_knotenmasse_aendern = true;
        showDialog_knotenmasse();
    }
    berechnungErforderlich(true);

}



//---------------------------------------------------------------------------------------------------------------
export function showDialog_edit_selected_stablasten() {
    //------------------------------------------------------------------------------------------------------------

    console.log("showDialog_edit_selected()");

    const el = document.getElementById("id_dialog_edit_selected_elementlasten_typ");

    (el?.shadowRoot?.getElementById("dialog_edit_selected_elementloads") as HTMLDialogElement).addEventListener("close", dialog_edit_selected_stablasten_closed);

    (el?.shadowRoot?.getElementById("dialog_edit_selected_elementloads") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_edit_selected_stablasten_closed(this: any, _e: any) {
    //------------------------------------------------------------------------------------------------------------
    //console.log("Event dialog_edit_selected_closed", e);
    //console.log("this", this);
    const ele = document.getElementById("id_dialog_edit_selected_elementlasten_typ") as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    (ele?.shadowRoot?.getElementById("dialog_edit_selected_elementloads") as HTMLDialogElement).removeEventListener("close", dialog_edit_selected_stablasten_closed);

    if (returnValue === "ok") {
        console.log("sieht gut aus");

        const el = document.getElementById("id_dialog_edit_selected_elementlasten_typ") as drDialogEdit_selected_elementlasten;

        let option = el.get_option();
        //console.log("dialog_edit_selected_closed, option", option)

        if (option === 0) {
            let lastfall = el.get_lastfall();
            if (lastfall > 0) {
                for (let i = 0; i < list.size; i++) {
                    let obj = list.getAt(i) as TCAD_Element;

                    if (obj.elTyp === CAD_STAB) {
                        for (let j = 0; j < (obj as TCAD_Stab).elast.length; j++) {
                            if ((obj as TCAD_Stab).elast[j].multiSelected) {
                                (obj as TCAD_Stab).elast[j].lastfall = lastfall;
                            };
                        }
                    }
                }
                find_max_Lastfall();
                find_maxValues_eloads();
            }
        }
        else if (option === 1) {
            let pa = el.get_pa();
            let pe = el.get_pe();

            for (let i = 0; i < list.size; i++) {
                let obj = list.getAt(i) as TCAD_Element;

                if (obj.elTyp === CAD_STAB) {
                    for (let j = 0; j < (obj as TCAD_Stab).elast.length; j++) {
                        if ((obj as TCAD_Stab).elast[j].multiSelected) {
                            if ((obj as TCAD_Stab).elast[j].typ === 0) {
                                ((obj as TCAD_Stab).elast[j] as TCAD_Streckenlast).pL = pa;
                                ((obj as TCAD_Stab).elast[j] as TCAD_Streckenlast).pR = pe;
                            }
                        }
                    }
                }
            }
            find_max_Lastfall();
            find_maxValues_eloads();

        }
        else if (option === 2) {
            mode_multi_selected_elementlast_aendern = true;
            showDialog_elementlast();
        }

    }

    buttons_control.reset();
    drawer_1_control.reset();

}


//------------------------------------------------------------------------------------------------------
export function update_multi_selected_elementlast() {
    //--------------------------------------------------------------------------------------------------

    mode_multi_selected_elementlast_aendern = false;

    const el = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;
    el.set_display_group_typ(true);

    let typ = el.get_typ();
    let lf = el.get_lastfall()

    //console.log("update_multi_selected_elementlast", typ, art, lf, x, P, M)

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Stab;

        if (obj.elTyp === CAD_STAB) {
            for (let j = 0; j < obj.elast.length; j++) {

                if (obj.elast[j].multiSelected) {

                    if (typ === 0 && obj.elast[j].typ === typ) {       // Streckenlast
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Streckenlast).art = el.get_art();
                        (obj.elast[j] as TCAD_Streckenlast).pL = el.get_pa();
                        (obj.elast[j] as TCAD_Streckenlast).pR = el.get_pe();
                    }
                    else if (typ === 1 && obj.elast[j].typ === typ) {  // Einzelllast
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Einzellast).xe = el.get_x();
                        (obj.elast[j] as TCAD_Einzellast).P = el.get_P();
                        (obj.elast[j] as TCAD_Einzellast).M = el.get_M();
                    }
                    else if (typ === 2 && obj.elast[j].typ === typ) {  // Temperatur
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Temperaturlast).To = el.get_To();
                        (obj.elast[j] as TCAD_Temperaturlast).Tu = el.get_Tu();
                    }
                    else if (typ === 3 && obj.elast[j].typ === typ) {  // Vorspannung
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Vorspannung).sigmaV = el.get_sigmaV();
                    }
                    else if (typ === 4 && obj.elast[j].typ === typ) {  // Spannschloss
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Spannschloss).ds = el.get_ds();
                    }
                    else if (typ === 5 && obj.elast[j].typ === typ) {  // Stabvorverformung
                        obj.elast[j].lastfall = lf;
                        set_max_lastfall(lf);
                        (obj.elast[j] as TCAD_Stabvorverformung).w0a = el.get_w0a();
                        (obj.elast[j] as TCAD_Stabvorverformung).w0m = el.get_w0m();
                        (obj.elast[j] as TCAD_Stabvorverformung).w0e = el.get_w0e();
                    }
                }

            }
        }
    }

    find_maxValues_eloads();

    init_cad(2);
}


//------------------------------------------------------------------------------------------------------
export function update_multi_selected_knotenlast() {
    //--------------------------------------------------------------------------------------------------

    mode_multi_selected_knotenlast_aendern = false;

    const el = document.getElementById("id_dialog_knotenlast") as drDialogKnotenlast;


    let lf = el.get_lastfall()

    let nur_lastfall = el.get_nur_lastfall();

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Knotenlast;

        if (obj.multiSelected) {

            obj.knlast.lf = el.get_lastfall();
            set_max_lastfall(obj.knlast.lf);
            if (!nur_lastfall) {
                obj.knlast.Px_org = el.get_Px();
                obj.knlast.Pz_org = el.get_Pz();
                obj.knlast.p[2] = el.get_My();
                obj.knlast.alpha = el.get_alpha();

                // Transformation in x-z Koordinatensystem

                let phi = obj.knlast.alpha * Math.PI / 180

                let si = Math.sin(phi)
                let co = Math.cos(phi)

                obj.knlast.Px = co * obj.knlast.Px_org + si * obj.knlast.Pz_org
                obj.knlast.Pz = -si * obj.knlast.Px_org + co * obj.knlast.Pz_org
            }
        }
    }

    init_cad(2);
}

function showDialog_edit_selected_staebe() {
    //----------------------------------------------------------------------------------------------------


    const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;

    let names = [] as string[]
    for (let i = 0; i < querschnittset.length; i++) {
        names.push(querschnittset[i].name)
    }

    el.setQuerschnittNames(names);
    let gelenke: boolean[] = Array(6).fill(false)
    el.setGelenke(gelenke);

    el.setStarrA(0.0)
    el.setStarrE(0.0)
    el.setBettung(0.0)

    //el.set_stabtyp((picked_obj as TCAD_Stab).get_stabtyp())

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_stabeigenschaften")),
        (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).addEventListener("close", dialog_stab_eigenschaften_closed);

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).showModal();

}

//---------------------------------------------------------------------------------------------------------------
function dialog_stab_eigenschaften_closed(this: any, _e: any) {
    //------------------------------------------------------------------------------------------------------------
    //console.log("Event dialog_stab_eigenschaften_closed", e);
    //console.log("this", this);
    //const ele = document.getElementById("id_dialog_stab_eigenschaften") as HTMLDialogElement;

    const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;
    //console.log("id_dialog_stab_eigenschaften", el);

    // ts-ignore
    const returnValue = this.returnValue;

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).removeEventListener("close", dialog_stab_eigenschaften_closed);

    if (returnValue === "ok") {
        //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
        console.log("dialog_stab_eigenschaften_closed sieht gut aus");

        const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;
        //console.log("Querschnitt : ", el.getSelectedOptionByName());

        // Daten eintragen in Objekt
        const name_querschnitt = el.getSelectedOptionByName();
        //let gelenke = Array(6)
        const gelenke = el.getGelenke();

        // (picked_obj as TCAD_Stab).set_gelenke(gelenke);

        const starr_a = el.getStarrA();
        const starr_e = el.getStarrE();
        const bettung = el.getBettung();

        const stab_typ = el.get_stabtyp();


        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Stab;

            if (obj.multiSelected) {

                obj.set_bettung(bettung);
                obj.set_name_querschnitt(name_querschnitt);
                obj.set_starrA(starr_a);
                obj.set_starrE(starr_e);
                obj.set_stabtyp(stab_typ);
                obj.set_gelenke(gelenke);
            }
        }

        berechnungErforderlich(true);
        init_cad(2);

    } else {
        // Abbruch

        buttons_control.reset();
        //el.removeEventListener('keydown', keydown);
    }
}


//------------------------------------------------------------------------------------------------------
export function update_multi_selected_knotenmasse() {
    //--------------------------------------------------------------------------------------------------

    mode_multi_selected_knotenmasse_aendern = false;

    const el = document.getElementById("id_dialog_knotenmasse") as drDialogKnotenmasse;



    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Knotenmasse;

        if (obj.multiSelected) {

                obj.masse.mass = el.get_mass()
                obj.masse.theta = el.get_theta_y();

        }
    }

    init_cad(2);
}
