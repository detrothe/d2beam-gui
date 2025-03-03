import { list, undoList, drawStab, Stab_button, Lager_button, lager_eingabe_beenden } from "./cad";
import { two } from "./cad";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

import "../components/dr-dialog_lager";
import { TNode } from "./rechnen";

//export let pick_element = false

class Cbuttons_control {
  pick_element = false;
  cad_eingabe_aktiv = false;
  stab_eingabe_aktiv = false;
  lager_eingabe_aktiv = false;
  typ_cad_element = 0;
  n_input_points = 0;

  reset() {
    this.pick_element = false;
    this.cad_eingabe_aktiv = false;
    this.stab_eingabe_aktiv = false;
    this.lager_eingabe_aktiv = false;
    this.typ_cad_element = 0;
    this.n_input_points = 0;

    let el = document.getElementById("id_cad_stab_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_lager_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
  }
}

export const buttons_control = new Cbuttons_control();

//--------------------------------------------------------------------------------------------------------
export function cad_buttons() {
  //----------------------------------------------------------------------------------------------------

  let div = document.getElementById("id_cad_group") as HTMLDivElement;

  const undo_button = document.createElement("button");

  undo_button.value = "undo";
  undo_button.className = "btn";
  undo_button.innerHTML = '<i class = "fa fa-undo"></i>';
  undo_button.addEventListener("click", unDo_button);
  undo_button.title = "undo";

  const redo_button = document.createElement("button");

  redo_button.value = "redo";
  redo_button.className = "btn";
  redo_button.innerHTML = '<i class = "fa fa-repeat"></i>';
  redo_button.addEventListener("click", reDo_button);
  redo_button.title = "redo";

  const trash_button = document.createElement("button");

  trash_button.value = "delete";
  trash_button.className = "btn";
  trash_button.innerHTML = '<i class = "fa fa-trash"></i>';
  trash_button.addEventListener("click", delete_button);
  trash_button.title = "Element löschen";
  trash_button.id = "id_cad_delete_button";

  const stab_button = document.createElement("button");

  stab_button.value = "Stab";
  stab_button.className = "btn";
  stab_button.innerHTML = "Stab";
  stab_button.addEventListener("click", Stab_button);
  // stab_button.addEventListener('keydown', keydown);
  stab_button.title = "Eingabe Stab";
  stab_button.id = "id_cad_stab_button";
  //stab_button.onmouseover = function () { this.style.backgroundColor = "RoyalBlue"; }

  const lager_button = document.createElement("button");

  lager_button.value = "Lager";
  lager_button.className = "btn";
  lager_button.innerHTML = "Lager";
  lager_button.addEventListener("click", Lager_button);
  // stab_button.addEventListener('keydown', keydown);
  lager_button.title = "Eingabe Lager";
  lager_button.id = "id_cad_lager_button";

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
    console.log("two.obj", obj);
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
    console.log("redo", obj);

    let group = drawStab(obj.x1, obj.z1, obj.x2, obj.z2);

    obj.setObj(group); // alte line zuvor am Anfang dieser Funktion gelöscht
    list.append(obj);

    two.update();
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_button() {
  //----------------------------------------------------------------------------------------------------

  let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
  el.style.backgroundColor = "darkRed";

  buttons_control.pick_element = true;
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
      buttons_control.reset();
    }
  }
}

//---------------------------------------------------------------------------------------------------------------

export function showDialog_lager() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_lager()");

  const el = document.getElementById("id_dialog_lager");
  console.log("id_dialog_lager", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_lager")),
    (el?.shadowRoot?.getElementById("dialog_lager") as HTMLDialogElement).addEventListener("close", dialog_lager_closed);

  (el?.shadowRoot?.getElementById("dialog_lager") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_lager_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_lager_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_lager") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  (ele?.shadowRoot?.getElementById("dialog_lager") as HTMLDialogElement).removeEventListener("close", dialog_lager_closed);

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");
  } else {
    // Abbruch
    lager_eingabe_beenden();
  }
}

//---------------------------------------------------------------------------------------------------------------
export function read_lager_dialog(node: TNode) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_lager") as HTMLDialogElement;

  console.log("read_lager_dialog, el=", el);
  let elem = el?.shadowRoot?.getElementById("id_Lx") as SlCheckbox;
  console.log("Lx=", elem.checked, elem.value);
  const lx = elem.checked;
  if (lx) node.L_org[0] = 1;
  else node.L_org[0] = 0;

  elem = el?.shadowRoot?.getElementById("id_Lz") as SlCheckbox;
  const lz = elem.checked;
  if (lz) node.L_org[1] = 1;
  else node.L_org[1] = 0;

  elem = el?.shadowRoot?.getElementById("id_Lphi") as SlCheckbox;
  const lphi = elem.checked;
  if (lphi) node.L_org[2] = 1;
  else node.L_org[2] = 0;
}
