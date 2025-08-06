import { CAD_COPY_SELECTED, CAD_SELECT_MULTI, CAD_STAB, list, tr, two } from "./cad"
import { buttons_control, set_help_text } from "./cad_buttons"
import { drawStab } from "./cad_draw_elemente"
import { add_cad_node, add_element_nodes, get_cad_node_X, get_cad_node_Z } from "./cad_node"
import { TCAD_Element, TCAD_Stab } from "./CCAD_element"








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
                    dx += dx0;
                    dz += dz0;
                }
            }

        }
    }
    two.update();



}