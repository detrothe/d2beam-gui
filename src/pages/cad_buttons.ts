import { list, undoList, drawStab, Stab_button, Lager_button } from './cad'
import { two } from './cad'

export let pick_element = false

//--------------------------------------------------------------------------------------------------------
export function cad_buttons() {
    //----------------------------------------------------------------------------------------------------

    let div = document.getElementById("id_cad_group") as HTMLDivElement

    const undo_button = document.createElement("button");

    undo_button.value = 'undo';
    undo_button.className = "btn";
    undo_button.innerHTML = '<i class = "fa fa-undo"></i>';
    undo_button.addEventListener("click", unDo_button);
    undo_button.title = "undo";

    const redo_button = document.createElement("button");

    redo_button.value = 'redo';
    redo_button.className = "btn";
    redo_button.innerHTML = '<i class = "fa fa-repeat"></i>';
    redo_button.addEventListener("click", reDo_button);
    redo_button.title = "redo";

    const trash_button = document.createElement("button");

    trash_button.value = 'delete';
    trash_button.className = "btn";
    trash_button.innerHTML = '<i class = "fa fa-trash"></i>';
    trash_button.addEventListener("click", delete_button);
    trash_button.title = "Element löschen";
    trash_button.id = 'id_cad_delete_button'

    const stab_button = document.createElement("button");

    stab_button.value = 'Stab';
    stab_button.className = "btn";
    stab_button.innerHTML = 'Stab';
    stab_button.addEventListener("click", Stab_button);
    // stab_button.addEventListener('keydown', keydown);
    stab_button.title = "Eingabe Stab";
    stab_button.id = 'id_cad_stab_button'
    //stab_button.onmouseover = function () { this.style.backgroundColor = "RoyalBlue"; }


    const lager_button = document.createElement("button");

    lager_button.value = 'Lager';
    lager_button.className = "btn";
    lager_button.innerHTML = 'Lager';
    lager_button.addEventListener("click", Lager_button);
    // stab_button.addEventListener('keydown', keydown);
    lager_button.title = "Eingabe Lager";
    lager_button.id = 'id_cad_lager_button'

    div.appendChild(undo_button);
    div.appendChild(redo_button);
    div.appendChild(trash_button);
    div.appendChild(stab_button);
    div.appendChild(lager_button);

}

//--------------------------------------------------------------------------------------------------------
export function unDo_button() {
    //----------------------------------------------------------------------------------------------------


    if (list.size > 0) {
        let obj = list.getTail().two_obj;
        console.log("two.obj", obj)
        two.remove(obj);
        let data = list.removeTail();
        two.update();

        undoList.append(data);
    }

}

//--------------------------------------------------------------------------------------------------------
export function reDo_button() {
    //----------------------------------------------------------------------------------------------------

    if (undoList.size > 0) {

        let obj = undoList.removeTail();
        console.log("redo", obj)

        let group = drawStab(obj.x1, obj.z1, obj.x2, obj.z2)

        obj.setObj(group);   // alte line zuvor am Anfang dieser Funktion gelöscht
        list.append(obj);

        two.update();
    }
}

//--------------------------------------------------------------------------------------------------------
export function delete_button() {
    //----------------------------------------------------------------------------------------------------

    let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement
    el.style.backgroundColor = 'darkRed'

    pick_element = true

}

//--------------------------------------------------------------------------------------------------------
export function delete_element(index: number, min_abstand: number) {
    //----------------------------------------------------------------------------------------------------

    if (index >= 0 && min_abstand < 0.25) {

        if (list.size > 0) {

            let obj = list.removeAt(index);
            //console.log("two.obj", obj)
            two.remove(obj.two_obj);

            two.update();

            undoList.append(obj);
            pick_element = false
            let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement
            el.style.backgroundColor = 'DodgerBlue'
        }
    }
}

