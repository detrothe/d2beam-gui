import { drDialogElementlasten } from "../components/dr-dialog_elementlasten";
import { drDialogStabEigenschaften } from "../components/dr-dialog_stab_eigenschaften";
import { CAD_ELLAST, keydown, list, reset_pointer_length, selected_element, set_zoomIsActive, tr, two, undoList } from "./cad";
import { buttons_control, index_stab, picked_obj } from "./cad_buttons";
import { draw_stab_gelenke, drawStab } from "./cad_draw_elemente";
import { max_value_lasten, set_max_lastfall } from "./cad_draw_elementlasten";
import { remove_element_nodes } from "./cad_node";
import { TCAD_Stab } from "./CCAD_element";
import { berechnungErforderlich } from "./globals";
import { default_querschnitt, nQuerschnittSets, querschnittset } from "./querschnitte";

//--------------------------------------------------------------------------------------------------------
export function abbruch_property_dialog() {
    //----------------------------------------------------------------------------------------------------
    buttons_control.reset();

    let divi = document.getElementById("id_context_menu");
    divi!.style.display = 'none';

    // stab unselektiert neu zeichnen
    if (selected_element.group) {
        //console.log("selected_element.group", selected_element.group)
        two.remove(selected_element.group);
        selected_element.group = null;
        //    two.update();
    }
    // let group = picked_obj.getTwoObj();
    // console.log("group picked_obj",group)
    // two.remove(group);

    let group = drawStab(picked_obj as TCAD_Stab, tr);
    two.add(group)
    picked_obj.setTwoObj(group);
    picked_obj.isSelected = false
    two.update();
}

//--------------------------------------------------------------------------------------------------------
export function show_property_dialog() {
    //----------------------------------------------------------------------------------------------------

    console.log("in show_property_dialog", picked_obj)

    let divi = document.getElementById("id_context_menu");
    divi!.style.display = 'none';

    const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;
    // console.log("id_dialog_stab_eigenschaften", el);

    // el.addQuerschnittName('hallo1');
    // el.addQuerschnittName('hallo2');


    let names = [] as string[]
    for (let i = 0; i < querschnittset.length; i++) {
        names.push(querschnittset[i].name)
    }

    el.setQuerschnittNames(names);
    //el.selectOption(1)
    el.selectOptionByName((picked_obj as TCAD_Stab).get_name_querschnitt());
    let gelenke: boolean[] = Array(6)
    gelenke = (picked_obj as TCAD_Stab).get_gelenke()
    el.setGelenke(gelenke);

    el.setStarrA((picked_obj as TCAD_Stab).get_starrA())
    el.setStarrE((picked_obj as TCAD_Stab).get_starrE())
    el.setBettung((picked_obj as TCAD_Stab).get_bettung())

    el.set_stabtyp((picked_obj as TCAD_Stab).get_stabtyp())

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_stabeigenschaften")),
        (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).addEventListener("close", dialog_stab_eigenschaften_closed);

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).showModal();

}
//---------------------------------------------------------------------------------------------------------------
function dialog_stab_eigenschaften_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_stab_eigenschaften_closed", e);
    console.log("this", this);
    //const ele = document.getElementById("id_dialog_stab_eigenschaften") as HTMLDialogElement;

    const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;
    console.log("id_dialog_stab_eigenschaften", el);

    // ts-ignore
    const returnValue = this.returnValue;

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).removeEventListener("close", dialog_stab_eigenschaften_closed);

    if (returnValue === "ok") {
        //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
        console.log("sieht gut aus");

        const el = document.getElementById("id_dialog_stab_eigenschaften") as drDialogStabEigenschaften;
        //console.log("Querschnitt : ", el.getSelectedOptionByName());

        // Daten eintragen in Objekt
        (picked_obj as TCAD_Stab).set_name_querschnitt(el.getSelectedOptionByName())
        let gelenke = Array(6)
        gelenke = el.getGelenke();

        (picked_obj as TCAD_Stab).set_gelenke(gelenke);

        (picked_obj as TCAD_Stab).set_starrA(el.getStarrA());
        (picked_obj as TCAD_Stab).set_starrE(el.getStarrE());
        (picked_obj as TCAD_Stab).set_bettung(el.getBettung());

        (picked_obj as TCAD_Stab).set_stabtyp(el.get_stabtyp());

        berechnungErforderlich(true);
    } else {
        // Abbruch

        buttons_control.reset();
        //el.removeEventListener('keydown', keydown);
    }
    if (selected_element.group) {
        two.remove(selected_element.group);
        selected_element.group = null;
    }


    // stab unselektiert neu zeichnen

    // let group = picked_obj.getTwoObj();
    // two.remove(group);

    // group = drawStab(picked_obj as TCAD_Stab, tr);
    // two.add(group)
    // picked_obj.setTwoObj(group);
    // picked_obj.isSelected = false
    // two.update();
}


//--------------------------------------------------------------------------------------------------------
export function show_add_elload_dialog() {
    //----------------------------------------------------------------------------------------------------

    //console.log("in show_property_dialog")

    let divi = document.getElementById("id_context_menu");
    divi!.style.display = 'none';

    buttons_control.reset()

    buttons_control.elementlast_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_ELLAST
    buttons_control.n_input_points = 1
    buttons_control.button_pressed = true;
    set_zoomIsActive(false);
    reset_pointer_length();

    const el = document.getElementById("id_dialog_elementlast");
    console.log("id_dialog_elementlast", el);

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_elementlast"));
    (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).addEventListener("close", dialog_addElementlast_closed);

    (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_addElementlast_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_stab_eigenschaften_closed", e);
    console.log("this", this);
    //const ele = document.getElementById("id_dialog_stab_eigenschaften") as HTMLDialogElement;

    const el = document.getElementById("id_dialog_elementlast") as HTMLDialogElement;
    console.log("id_dialog_stab_eigenschaften", el);

    // ts-ignore
    const returnValue = this.returnValue;

    (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).removeEventListener("close", dialog_addElementlast_closed);

    if (returnValue === "ok") {
        console.log("bisher ok")

        const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

        let lf = ele.get_lastfall()
        set_max_lastfall(lf);

        let typ = ele.get_typ();

        if (typ === 0) {   // Streckenlast
            let pa = ele.get_pa()
            let pe = ele.get_pe()
            let art = ele.get_art();

            //console.log("in add_elementlast ", index, lf, art, pa, pe)
            (picked_obj as TCAD_Stab).add_streckenlast(lf, art, pa, pe)

            if (Math.abs(pa) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pa);
            if (Math.abs(pe) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pe);
        }
        else if (typ === 1) {
            (picked_obj as TCAD_Stab).add_einzellast(lf, ele.get_x(), ele.get_P(), ele.get_M());
        }
        else if (typ === 2) {
            (picked_obj as TCAD_Stab).add_temperaturlast(lf, ele.get_To(), ele.get_Tu());
        }
        else if (typ === 3) {
            (picked_obj as TCAD_Stab).add_vorspannung(lf, ele.get_sigmaV());
        }
        else if (typ === 4) {
            (picked_obj as TCAD_Stab).add_spannschloss(lf, ele.get_ds());
        }
        else if (typ === 5) {
            (picked_obj as TCAD_Stab).add_stabvorverformung(lf, ele.get_w0a(), ele.get_w0m(), ele.get_w0e());
        }

        if (selected_element.group) {
            two.remove(selected_element.group);
            selected_element.group = null;
        }

        let group = picked_obj.getTwoObj();
        two.remove(group);
        //two.update();

        group = drawStab(picked_obj as TCAD_Stab, tr);
        picked_obj.setTwoObj(group);
        picked_obj.isSelected = false
        two.add(group)
        two.update();

        buttons_control.reset()

        //picked_obj = obj;

    }
}


//--------------------------------------------------------------------------------------------------------
export function delete_element_dialog() {
    //----------------------------------------------------------------------------------------------------

    let divi = document.getElementById("id_context_menu");
    divi!.style.display = 'none';

    buttons_control.reset()

    let obj = list.removeAt(index_stab);
    two.remove(obj.two_obj);
    two.update();

    remove_element_nodes((obj as TCAD_Stab).index1)
    remove_element_nodes((obj as TCAD_Stab).index2)

    undoList.append(obj);

    if (selected_element.group) {
        two.remove(selected_element.group);
        selected_element.group = null;
        two.update();
    }

}