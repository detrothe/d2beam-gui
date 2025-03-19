import { drDialogStabEigenschaften } from "../components/dr-dialog_stab_eigenschaften";
import { keydown, selected_element, tr, two } from "./cad";
import { buttons_control, picked_obj } from "./cad_buttons";
import { draw_stab_gelenke, drawStab } from "./cad_draw_elemente";
import { TCAD_Stab } from "./CCAD_element";
import { default_querschnitt, nQuerschnittSets, querschnittset } from "./querschnitte";

//--------------------------------------------------------------------------------------------------------
export function abbruch_property_dialog() {
    //----------------------------------------------------------------------------------------------------
    buttons_control.reset();

    let divi = document.getElementById("id_context_menu");
    divi!.style.display = 'none';

   // stab unselektiert neu zeichnen
   if (selected_element.group) {
    console.log("selected_element.group",selected_element.group)
    two.remove(selected_element.group);
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

    //console.log("in show_property_dialog")

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
    el.selectOptionByName(default_querschnitt)

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_stabeigenschaften")),
        (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).addEventListener("close", dialog_stab_eigenschaften_closed);

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).showModal();


    // if (selected_element.group) {
    //     two.remove(selected_element.group);
    //     two.update();
    // }


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
        // Element neu zeichnen
        (picked_obj as TCAD_Stab).set_gelenke(gelenke)

    } else {
        // Abbruch

        buttons_control.reset();
        //el.removeEventListener('keydown', keydown);
    }
    // stab unselektiert neu zeichnen
    let group = picked_obj.getTwoObj();
    console.log("two.remove group",two.remove(group));

    group = drawStab(picked_obj as TCAD_Stab, tr);
    two.add(group)
    picked_obj.setTwoObj(group);
    picked_obj.isSelected = false
    two.update();
}