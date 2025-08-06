import { CAD_COPY_SELECTED, CAD_SELECT_MULTI, CAD_STAB, list, tr, two } from "./cad"
import { buttons_control, set_help_text } from "./cad_buttons"
import { drawStab } from "./cad_draw_elemente"
import { add_cad_node, add_element_nodes, get_cad_node_X, get_cad_node_Z } from "./cad_node"
import { TCAD_Element, TCAD_Stab, TCAD_ElLast, TCAD_Streckenlast, TCAD_Einzellast, TCAD_Temperaturlast, TCAD_Vorspannung, TCAD_Spannschloss, TCAD_Stabvorverformung } from "./CCAD_element"








//------------------------------------------------------------------------------------------------------
export function select_multi_button(art: number) {
    //----------------------------------------------------------------------------------------------------

    //console.log("in select_multi_button")

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
export function unselect_all_button() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in unselect_all_button")

    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Element;
        obj.multiSelected = false;
    }

    buttons_control.reset()

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

    }

}


//------------------------------------------------------------------------------------------------------
export function copy_selected(dx0: number, dz0: number) {
    //----------------------------------------------------------------------------------------------------

    console.log("in copy_selected", dx0, dz0)
    let ncopies = 3;

    for (let i = 0; i < list.size; i++) {
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
                    stab_obj.gelenk = (obj as TCAD_Stab).gelenk;
                    stab_obj.sinus = (obj as TCAD_Stab).sinus;
                    stab_obj.cosinus = (obj as TCAD_Stab).cosinus;
                    stab_obj.alpha = (obj as TCAD_Stab).alpha;
                    stab_obj.stabTyp = (obj as TCAD_Stab).stabTyp;

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

                    dx += dx0;
                    dz += dz0;
                }
            }

        }
    }
    two.update();



}