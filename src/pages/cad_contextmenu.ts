import { keydown, selected_element, two } from "./cad";
import { buttons_control } from "./cad_buttons";

//--------------------------------------------------------------------------------------------------------
export function show_property_dialog() {
    //----------------------------------------------------------------------------------------------------

    console.log("in show_property_dialog")

    let divi = document.getElementById("id_context_menu");

    divi!.style.display = 'none';

    const el = document.getElementById("id_dialog_stab_eigenschaften");
    console.log("id_dialog_stab_eigenschaften", el);

    console.log("shadow", el?.shadowRoot?.getElementById("dialog_stabeigenschaften")),
        (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).addEventListener("close", dialog_stab_eigenschaften_closed);

    (el?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).showModal();


    if (selected_element.group) {
        two.remove(selected_element.group);
        two.update();
    }


}
//---------------------------------------------------------------------------------------------------------------
function dialog_stab_eigenschaften_closed(this: any, e: any) {
    //------------------------------------------------------------------------------------------------------------
    console.log("Event dialog_stab_eigenschaften_closed", e);
    console.log("this", this);
    const ele = document.getElementById("id_dialog_stab_eigenschaften") as HTMLDialogElement;

    // ts-ignore
    const returnValue = this.returnValue;

    (ele?.shadowRoot?.getElementById("dialog_stabeigenschaften") as HTMLDialogElement).removeEventListener("close", dialog_stab_eigenschaften_closed);

    if (returnValue === "ok") {
        //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
        console.log("sieht gut aus");
    } else {
        // Abbruch
        //let el = document.getElementById('id_cad_lager_button') as HTMLButtonElement;

        buttons_control.reset();
        //el.removeEventListener('keydown', keydown);
    }
}