
import { list, undoList, Stab_button, Lager_button, lager_eingabe_beenden, CAD_KNOTEN, CAD_KNLAST, keydown, CAD_STAB, CAD_LAGER, selected_element } from "./cad";

import { two, tr } from "./cad";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

import "../components/dr-dialog_lager";
import "../components/dr-dialog_knoten";
import "../components/dr-dialog_knotenlast";

import { TLoads, TNode } from "./rechnen";
import { abstandPunktGerade_2D } from "./lib";
import { drawStab, draw_knotenlast, draw_lager } from "./cad_draw_elemente";
import { TCADElement } from "./CCAD_element";

//export let pick_element = false

export let picked_obj: TCADElement;

class Cbuttons_control {
  pick_element = false;
  select_element = false;
  cad_eingabe_aktiv = false;
  knoten_eingabe_aktiv = false;
  stab_eingabe_aktiv = false;
  lager_eingabe_aktiv = false;
  knotenlast_eingabe_aktiv = false;
  typ_cad_element = 0;
  n_input_points = 0;

  reset() {
    this.pick_element = false;
    this.select_element = false;
    this.cad_eingabe_aktiv = false;
    this.knoten_eingabe_aktiv = false;
    this.stab_eingabe_aktiv = false;
    this.lager_eingabe_aktiv = false;
    this.knotenlast_eingabe_aktiv = false;
    this.typ_cad_element = 0;
    this.n_input_points = 0;

    let el = document.getElementById("id_cad_stab_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_lager_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_select_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_knoten_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";

    // if ( selected_element.group !== null) {
    //   two.remove (selected_element.group)
    //   two.update()
    // }
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

  const select_button = document.createElement("button");

  select_button.value = "select";
  select_button.className = "btn";
  select_button.innerHTML = '<i class = "fa fa-hand-pointer-o"></i>';
  select_button.addEventListener("click", Select_button);
  select_button.title = "Element auswählen/selektieren";
  select_button.id = "id_cad_select_button";

  const knoten_button = document.createElement("button");

  knoten_button.value = "Knoten";
  knoten_button.className = "btn";
  knoten_button.innerHTML = "Knoten";
  knoten_button.addEventListener("click", Knoten_button);
  // stab_button.addEventListener('keydown', keydown);
  knoten_button.title = "Eingabe Knoten";
  knoten_button.id = "id_cad_knoten_button";

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


  const knotlast_button = document.createElement("button");

  knotlast_button.value = "Knotenlast";
  knotlast_button.className = "btn";
  knotlast_button.innerHTML = "KnLast";
  knotlast_button.addEventListener("click", Knotenlast_button);
  // stab_button.addEventListener('keydown', keydown);
  knotlast_button.title = "Eingabe Knotenlasten";
  knotlast_button.id = "id_cad_knotenlast_button";

  div.appendChild(undo_button);
  div.appendChild(redo_button);
  div.appendChild(trash_button);
  div.appendChild(select_button);
  div.appendChild(knoten_button);
  div.appendChild(stab_button);
  div.appendChild(lager_button);
  div.appendChild(knotlast_button);
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

    let group: any
    if (obj.elTyp === CAD_STAB) {
      group = drawStab(obj, tr);
      two.add(group);
    }
    else if (obj.elTyp === CAD_LAGER) {
      let node = new TNode();
      // node.x = obj.x1;
      // node.z = obj.z1;
      node = obj.node
      group = draw_lager(two, tr, node)
    }
    else if (obj.elTyp === CAD_KNLAST) {
      let load = new TLoads();
      load = obj.knlast
      console.log("load", obj.x1, obj.z1, load)
      group = draw_knotenlast(two, tr, load, obj.x1, obj.z1, 1.0, 0)
      two.add(group);
    }
    obj.setTwoObj(group); // alte line zuvor am Anfang dieser Funktion gelöscht
    list.append(obj);

    two.update();
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_button() {
  //----------------------------------------------------------------------------------------------------

  if (buttons_control.pick_element) {
    buttons_control.reset();
  } else {
    let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.pick_element = true;
  }
}

//--------------------------------------------------------------------------------------------------------
export function Select_button() {
  //----------------------------------------------------------------------------------------------------

  if (buttons_control.select_element) {
    buttons_control.reset();
  } else {
    let el = document.getElementById("id_cad_select_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.select_element = true;
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_element(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("delete_element")
  if (list.size === 0) return;

  let min_abstand = 1e30;
  let index = -1;
  let stab_gefunden = false
  let lager_gefunden = false
  let index_lager = -1
  let knotenlast_gefunden = false
  let index_knlast = -1

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(obj.x1, obj.z1, obj.x2, obj.z2, xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index = i;
          stab_gefunden = true
        }
      }
    }
    else if (obj.elTyp === CAD_LAGER) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Lager", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          lager_gefunden = true
          index_lager = i;
        }
      }
    }
    else if (obj.elTyp === CAD_KNLAST) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Knotenlast", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knotenlast_gefunden = true
          index_knlast = i;
        }
      }
    }
  }

  console.log('ABSTAND', min_abstand, index, lager_gefunden);

  if (lager_gefunden) {
    let obj = list.removeAt(index_lager);
    two.remove(obj.two_obj);
    two.update();
    undoList.append(obj);
    buttons_control.reset();
  }
  else if (knotenlast_gefunden) {
    let obj = list.removeAt(index_knlast);
    two.remove(obj.two_obj);
    two.update();
    undoList.append(obj);
    buttons_control.reset();
  }
  else if (index >= 0 && min_abstand < 0.25) {
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


//--------------------------------------------------------------------------------------------------------
export function select_element(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("select_element")
  if (list.size === 0) return;

  let min_abstand = 1e30;
  let index = -1;
  let stab_gefunden = false
  let lager_gefunden = false
  let index_lager = -1
  let knotenlast_gefunden = false
  let index_knlast = -1

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  let gefunden = false
  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(obj.x1, obj.z1, obj.x2, obj.z2, xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index = i;
          stab_gefunden = true
        }
      }
    }
    else if (obj.elTyp === CAD_LAGER) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Lager", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          lager_gefunden = true
          index_lager = i;
        }
      }
    }
    else if (obj.elTyp === CAD_KNLAST) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Knotenlast", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knotenlast_gefunden = true
          index_knlast = i;
        }
      }
    }
  }

  console.log('ABSTAND', min_abstand, index, lager_gefunden);

  if (lager_gefunden) {
    gefunden = true
    let obj = list.getAt(index_lager);
    picked_obj = obj
    // two.remove(obj.two_obj);
    // two.update();
    // undoList.append(obj);
    buttons_control.reset();
  }
  else if (knotenlast_gefunden) {
    gefunden = true

    let obj = list.getAt(index_knlast);
    picked_obj = obj
    // two.remove(obj.two_obj);
    // two.update();
    // undoList.append(obj);
    buttons_control.reset();
  }
  else if (index >= 0 && min_abstand < 0.25) {
    if (list.size > 0) {
      gefunden = true

      let obj = list.getAt(index);
      let group = drawStab(obj, tr, true);
      two.add(group);
      selected_element.group = group
      obj.isSelected = true

      two.update();

      // undoList.append(obj);
      buttons_control.reset();
      gefunden = true
      picked_obj = obj;
    }
  }

  if (gefunden) {
    let divi = document.getElementById("id_context_menu");

    divi!.style.left = xpix + 'px';
    divi!.style.top = zpix + 'px';
    divi!.style.display = 'block';
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


export function showDialog_knoten() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_knoten()");

  const el = document.getElementById("id_dialog_knoten");
  console.log("id_dialog_knoten", el);

  console.log("shadow showDialog_knoten", el?.shadowRoot?.getElementById("dialog_knoten")),
    (el?.shadowRoot?.getElementById("dialog_knoten") as HTMLDialogElement).addEventListener("close", dialog_knoten_closed);

  (el?.shadowRoot?.getElementById("dialog_knoten") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_knoten_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_knoten_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_knoten") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");
  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_knoten") as HTMLDialogElement).removeEventListener("close", dialog_knoten_closed);

    // knoten_eingabe_beenden();
    buttons_control.reset()
  }
}


//--------------------------------------------------------------------------------------------------------
export function Knoten_button(ev: Event) {
  //----------------------------------------------------------------------------------------------------

  console.log("in Knoten_button", ev)

  let el = document.getElementById("id_cad_knoten_button") as HTMLButtonElement

  if (buttons_control.knoten_eingabe_aktiv) {
    //        knoten_eingabe_beenden()
    buttons_control.reset()

  } else {
    buttons_control.reset()
    el.style.backgroundColor = 'darkRed'
    buttons_control.knoten_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_KNOTEN
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0

    showDialog_knoten();

  }

}

// //--------------------------------------------------------------------------------------------------------
// export function knoten_eingabe_beenden() {
//   //----------------------------------------------------------------------------------------------------

//   let el = document.getElementById("id_cad_knoten_button") as HTMLButtonElement

//   buttons_control.reset()

// }


//--------------------------------------------------------------------------------------------------------
export function Knotenlast_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  //console.log("in Knotenlast_button", buttons_control.knotenlast_eingabe_aktiv,ev)

  let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement

  if (buttons_control.knotenlast_eingabe_aktiv) {

    let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement
    buttons_control.reset()
    el.removeEventListener('keydown', keydown);
  } else {
    buttons_control.reset()
    el.style.backgroundColor = 'darkRed'
    buttons_control.knotenlast_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_KNLAST
    el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 1

    showDialog_knotenlast();

    // jetzt auf Pointer eingabe warten

  }

}


//---------------------------------------------------------------------------------------------------------------

export function showDialog_knotenlast() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_knotenlast()");

  const el = document.getElementById("id_dialog_knotenlast");
  console.log("id_dialog_knotenlast", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_knotenlast")),
    (el?.shadowRoot?.getElementById("dialog_knotenlast") as HTMLDialogElement).addEventListener("close", dialog_knotenlast_closed);

  (el?.shadowRoot?.getElementById("dialog_knotenlast") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_knotenlast_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_knotenlast_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_knotenlast") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");
  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_knotenlast") as HTMLDialogElement).removeEventListener("close", dialog_knotenlast_closed);

    // knoten_eingabe_beenden();
    buttons_control.reset()
  }
}


//---------------------------------------------------------------------------------------------------------------
export function read_knotenlast_dialog(knlast: TLoads) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knotenlast") as HTMLDialogElement;

  console.log("read_knotenlast_dialog, el=", el);
  let elem = el?.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
  console.log("lf=", elem.value);
  knlast.lf = +elem.value

  elem = el?.shadowRoot?.getElementById("id_px") as HTMLInputElement;
  knlast.Px = +elem.value

  elem = el?.shadowRoot?.getElementById("id_pz") as HTMLInputElement;
  knlast.Pz = +elem.value

  elem = el?.shadowRoot?.getElementById("id_my") as HTMLInputElement;
  knlast.p[2] = +elem.value

}
