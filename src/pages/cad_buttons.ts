
import {
  list, undoList, Stab_button, Lager_button, lager_eingabe_beenden, CAD_KNOTEN, CAD_KNLAST,
  keydown, CAD_STAB, CAD_LAGER, selected_element, CAD_ELLAST,
  click_zurueck_cad,
  redraw_stab,
  redraw_knotenlast,
  redraw_lager,
  reset_cad,
  CAD_EINSTELLUNGEN,
  set_raster_dx,
  set_raster_dz,
  init_cad,
  set_dx_offset_touch,
  set_dz_offset_touch,
  set_touch_support,
  set_raster_xmin,
  set_raster_xmax,
  set_raster_zmin,
  set_raster_zmax,
  rubberband_drawn,
  rubberband,
  set_rubberband_drawn
} from "./cad";

import { two, tr } from "./cad";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";

import "../components/dr-dialog_lager";
import "../components/dr-dialog_knoten";
import "../components/dr-dialog_knotenlast";
import "../components/dr-dialog_elementlasten";

import { alertdialog, TLoads, TNode } from "./rechnen";
import { abstandPunktGerade_2D, test_point_inside_area_2D } from "./lib";
import { drawStab, draw_knoten, draw_knotenlast, draw_lager } from "./cad_draw_elemente";
import { TCAD_Knoten, TCAD_Knotenlast, TCAD_Lager, TCAD_Stab, TCAD_Streckenlast, TCAD_Temperaturlast, TCAD_Element, TCAD_ElLast, TCAD_Vorspannung, TCAD_Spannschloss } from "./CCAD_element";
import { drDialogElementlasten } from "../components/dr-dialog_elementlasten";
import { change_def_querschnitt } from "./querschnitte";
import { drDialogKnoten } from "../components/dr-dialog_knoten";
import { CTrans } from "./trans";
import Two from "two.js";
import { add_element_nodes, CADNodes, get_cad_node_X, get_cad_node_Z, remove_element_nodes } from "./cad_node";
import { find_max_Lastfall, find_maxValues_eloads, max_Lastfall, max_value_lasten, set_max_lastfall } from "./cad_draw_elementlasten";
import { drDialogEinstellungen } from "../components/dr-dialog_einstellungen";

//export let pick_element = false

export let picked_obj: TCAD_Element;

let mode_elementlast_aendern = false;
let index_ellast = -1
let obj_ellast: any

let mode_knotenlast_aendern = false;
let obj_knlast: any

let mode_knotenlager_aendern = false;
let obj_knlager: any

let mode_knoten_aendern = false;
let obj_knoten: TCAD_Element;
let index_obj_knoten = -1

class Cbuttons_control {
  pick_element = false;
  select_element = false;
  cad_eingabe_aktiv = false;
  knoten_eingabe_aktiv = false;
  stab_eingabe_aktiv = false;
  lager_eingabe_aktiv = false;
  knotenlast_eingabe_aktiv = false;
  elementlast_eingabe_aktiv = false;
  einstellungen_eingabe_aktiv = false;
  typ_cad_element = 0;
  n_input_points = 0;
  button_pressed = false;
  input_started = 0

  reset() {
    this.pick_element = false;
    this.select_element = false;
    this.cad_eingabe_aktiv = false;
    this.knoten_eingabe_aktiv = false;
    this.stab_eingabe_aktiv = false;
    this.lager_eingabe_aktiv = false;
    this.knotenlast_eingabe_aktiv = false;
    this.elementlast_eingabe_aktiv = false;
    this.einstellungen_eingabe_aktiv = false;
    this.typ_cad_element = 0;
    this.n_input_points = 0;
    this.button_pressed = false;
    this.input_started = 0;

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
    el = document.getElementById("id_cad_elementlast_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";
    el = document.getElementById("id_cad_einstellungen_button") as HTMLButtonElement;
    el.style.backgroundColor = "DodgerBlue";


    if (rubberband_drawn) {
      two.remove(rubberband);
      set_rubberband_drawn(false);
    }

    set_help_text('    ');
  }
}

class CDelElLast {
  ellast = true;
  obj_element: TCAD_Stab;
  obj_elast: TCAD_ElLast
  constructor(obj_element: TCAD_Stab, obj_elast: TCAD_ElLast) {
    this.obj_element = obj_element
    this.obj_elast = obj_elast
  }
}

export const buttons_control = new Cbuttons_control();

//--------------------------------------------------------------------------------------------------------
export function cad_buttons() {
  //----------------------------------------------------------------------------------------------------

  let div = document.getElementById("id_cad_group") as HTMLDivElement;


  const zurueck_button = document.createElement("button");

  zurueck_button.value = "zurueck";
  zurueck_button.className = "btn";
  zurueck_button.innerHTML = 'Fullscreen';
  zurueck_button.addEventListener("click", click_zurueck_cad);
  zurueck_button.title = "zurück";
  zurueck_button.id = "id_button_zurueck_cad"

  const querschnitt_default_select = document.createElement("select");

  //querschnitt_default_select.value = "";
  querschnitt_default_select.className = "btn";
  //querschnitt_default_select.innerHTML = 'Fullscreen';
  querschnitt_default_select.addEventListener("click", change_def_querschnitt);
  querschnitt_default_select.title = "aktiver Querschnitt";
  querschnitt_default_select.id = "id_querschnitt_default"

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
  knoten_button.innerHTML = '<i class = "fa fa-square"></i>';
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

  const ellast_button = document.createElement("button");

  ellast_button.value = "Elementlast";
  ellast_button.className = "btn";
  ellast_button.innerHTML = "ElLast";
  ellast_button.addEventListener("click", Elementlast_button);
  // stab_button.addEventListener('keydown', keydown);
  ellast_button.title = "Eingabe Elementlasten";
  ellast_button.id = "id_cad_elementlast_button";


  const cog_button = document.createElement("button");

  cog_button.value = "Einstellungen";
  cog_button.className = "btn";
  cog_button.innerHTML = '<i class = "fa fa-cog"></i>';
  cog_button.addEventListener("click", Einstellungen_button);
  // stab_button.addEventListener('keydown', keydown);
  cog_button.title = "Einstellungen";
  cog_button.id = "id_cad_einstellungen_button";


  const refresh_button = document.createElement("button");

  refresh_button.value = "refresh";
  refresh_button.className = "btn";
  refresh_button.innerHTML = '<i class = "fa fa-refresh"></i>';
  refresh_button.addEventListener("click", reset_cad);
  // stab_button.addEventListener('keydown', keydown);
  refresh_button.title = "Reset Screen";
  refresh_button.id = "id_cad_refresh_button";

  const help_text = document.createElement("span");
  help_text.innerHTML = "eine Hilfe"
  help_text.className = "helptext";
  help_text.id = "id_cad_helptext";

  div.appendChild(undo_button);
  div.appendChild(redo_button);
  div.appendChild(trash_button);
  div.appendChild(select_button);
  div.appendChild(knoten_button);
  div.appendChild(stab_button);
  div.appendChild(lager_button);
  div.appendChild(knotlast_button);
  div.appendChild(ellast_button);
  div.appendChild(cog_button);
  div.appendChild(refresh_button);
  let br = document.createElement("br");
  div.appendChild(br);
  div.appendChild(zurueck_button);
  div.appendChild(querschnitt_default_select);
  div.appendChild(help_text);

  //let div_cad_group = document.getElementById("id_cad_group") as HTMLDivElement
  undo_button!.addEventListener("focus", (_event) => {
    // @ts-ignore
    //console.log("focus", event)
    let hoehe = undo_button!.getBoundingClientRect()
    //console.log("hoehe div undo_button", hoehe)
  });

  // let hoehe = div.getBoundingClientRect().height
  // console.log("hoehe", hoehe)

  // let querschnitt_default = document.getElementById("id_querschnitt_default") as HTMLSelectElement;
  // querschnitt_default.style.top = String(hoehe)
}

//--------------------------------------------------------------------------------------------------------
export function set_help_text(txt: string) {
  //------------------------------------------------------------------------------------------------------
  let el = document.getElementById("id_cad_helptext") as HTMLSpanElement
  el.innerHTML = txt;
}

//--------------------------------------------------------------------------------------------------------
export function delete_help_text() {
  //------------------------------------------------------------------------------------------------------
  let el = document.getElementById("id_cad_helptext") as HTMLSpanElement
  el.innerHTML = ' ';
}

//--------------------------------------------------------------------------------------------------------
export function unDo_button() {
  //----------------------------------------------------------------------------------------------------
  console.log("unDo", list.size)

  if (list.size > 0) {
    let obj = list.getTail();
    console.log("obj eltyp", obj.elTyp);

    if ((obj as TCAD_Element).elTyp === CAD_STAB) {
      remove_element_nodes((obj as TCAD_Stab).index1)
      remove_element_nodes((obj as TCAD_Stab).index2)
      find_max_Lastfall();
      find_maxValues_eloads();
    }
    else if ((obj as TCAD_Element).elTyp === CAD_LAGER) {
      remove_element_nodes((obj as TCAD_Lager).index1)
    }
    else if ((obj as TCAD_Element).elTyp === CAD_KNLAST) {
      remove_element_nodes((obj as TCAD_Knotenlast).index1)
      find_max_Lastfall();
    }
    else if ((obj as TCAD_Element).elTyp === CAD_KNOTEN) {
      let index = (obj as TCAD_Knoten).index1
      if (CADNodes[index].nel != 0) {
        alertdialog("ok", "An dem Knoten hängen noch andere Elemente, erst diese löschen");
        return;
      }
    }

    two.remove(obj.two_obj);
    two.update();

    obj = list.removeTail();

    undoList.append(obj);
  }
}

//--------------------------------------------------------------------------------------------------------
export function reDo_button() {
  //----------------------------------------------------------------------------------------------------
  console.log("reDo", undoList.size)

  if (undoList.size > 0) {
    let obj = undoList.removeTail();
    //console.log("redo", obj);

    let group: any

    if (obj.ellast) {
      console.log("Es handelt sich um eine Elementlast")
      obj.obj_element.elast.push(obj.obj_elast)
      //obj.obj_element.nStreckenlasten++;
      console.log("neuer Stab", obj.obj_element)
      two.remove(obj.obj_element.two_obj);
      group = drawStab(obj.obj_element, tr);
      two.add(group);
      obj.obj_element.setTwoObj(group); // alte line zuvor am Anfang dieser Funktion gelöscht

      find_max_Lastfall();
      find_maxValues_eloads();
    }
    else {
      if (obj.elTyp === CAD_STAB) {
        group = drawStab(obj, tr);
        two.add(group);
        add_element_nodes(obj.index1);
        add_element_nodes(obj.index2);
      }
      else if (obj.elTyp === CAD_LAGER) {

        group = draw_lager(tr, obj)
        two.add(group);
        add_element_nodes(obj.index1);
      }
      else if (obj.elTyp === CAD_KNLAST) {
        let load = new TLoads();
        load = obj.knlast
        let index1 = obj.index1
        group = draw_knotenlast(tr, load, get_cad_node_X(index1), get_cad_node_Z(index1), 1.0, 0)
        two.add(group);
        add_element_nodes(obj.index1);

        find_max_Lastfall();
      }
      else if (obj.elTyp === CAD_KNOTEN) {
        //console.log("KNOTEN reDo", obj.x1, obj.z1)

        group = draw_knoten(obj, tr)
        two.add(group);
      }
      obj.setTwoObj(group); // alte line zuvor am Anfang dieser Funktion gelöscht
      list.append(obj);
    }

    two.update();
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_button() {
  //----------------------------------------------------------------------------------------------------

  if (buttons_control.pick_element) {
    buttons_control.reset();
    delete_help_text();
  } else {
    let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.pick_element = true;
    set_help_text('Pick ein Element');
    buttons_control.button_pressed = true;
  }
}

//--------------------------------------------------------------------------------------------------------
export function Select_button() {
  //----------------------------------------------------------------------------------------------------

  if (buttons_control.select_element) {
    buttons_control.reset();
    delete_help_text();
  } else {
    let el = document.getElementById("id_cad_select_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.select_element = true;
    set_help_text('Pick ein Element');
    buttons_control.button_pressed = true;
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
  let elementlast_gefunden = false
  let index_knlast = -1
  let knoten_gefunden = false
  let index_knoten = -1


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

      // Schleife über alle Elementlasten

      for (let j = 0; j < obj.elast.length; j++) {
        let typ = obj.elast[j].typ
        if (typ === 0 || typ === 2 || typ === 3 || typ === 4) { // Streckenlast, Temperatur, Vorspannung, Spannschloss

          let x = Array(4)
          let z = Array(4);
          (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);

          let inside = test_point_inside_area_2D(x, z, xc, zc)
          console.log("select_element, inside ", inside)
          if (inside) {
            elementlast_gefunden = true
            obj_ellast = obj
            index_ellast = j
          }
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

    else if (obj.elTyp === CAD_KNOTEN) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Knotenlast", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knoten_gefunden = true
          index_knoten = i;
        }
      }
    }
  }

  console.log('ABSTAND', min_abstand, index, lager_gefunden);

  if (elementlast_gefunden) {
    //(obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pL = 1.0;

    let obj_strLast = obj_ellast.elast[index_ellast]
    console.log("obj_strLast", obj_strLast)
    let undo_obj = new CDelElLast(obj_ellast, obj_strLast);

    obj_ellast.elast.splice(index_ellast, 1);
    //obj_ellast.nStreckenlasten--;
    let group = obj_ellast.getTwoObj();
    console.log("two.remove group", two.remove(group));

    group = drawStab(obj_ellast as TCAD_Stab, tr);
    two.add(group)
    obj_ellast.setTwoObj(group);
    two.update();
    undoList.append(undo_obj);

    find_max_Lastfall();
    find_maxValues_eloads();
  }
  else if (lager_gefunden) {
    let obj = list.removeAt(index_lager);
    two.remove(obj.two_obj);
    two.update();
    remove_element_nodes((obj as TCAD_Lager).index1)
    undoList.append(obj);
    buttons_control.reset();
  }
  else if (knoten_gefunden) {
    let obj = list.getAt(index_knoten);
    let index = (obj as TCAD_Knoten).index1
    if (CADNodes[index].nel === 0) {
      obj = list.removeAt(index_knoten);
      two.remove(obj.two_obj);
      two.update();
      undoList.append(obj);
      buttons_control.reset();
    } else {
      alertdialog("ok", "An dem Knoten hängen noch andere Elemente, erst diese löschen");
    }
  }
  else if (knotenlast_gefunden) {
    let obj = list.removeAt(index_knlast);
    two.remove(obj.two_obj);
    two.update();
    remove_element_nodes((obj as TCAD_Knotenlast).index1)
    undoList.append(obj);
    buttons_control.reset();

    find_max_Lastfall();
  }
  else if (index >= 0 && min_abstand < 0.25) {          // Stab
    if (list.size > 0) {
      let obj = list.removeAt(index);
      two.remove(obj.two_obj);
      two.update();

      remove_element_nodes((obj as TCAD_Stab).index1)
      remove_element_nodes((obj as TCAD_Stab).index2)

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
  let elementlast_gefunden = false
  let knoten_gefunden = false

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  let gefunden = false
  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    console.log("eltyp", obj.elTyp)

    if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(obj.x1, obj.z1, obj.x2, obj.z2, xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index = i;
          stab_gefunden = true
        }
      }

      // Schleife über alle Elementlasten

      for (let j = 0; j < obj.elast.length; j++) {
        let typ = obj.elast[j].typ

        if (typ === 0 || typ === 2 || typ === 3 || typ === 4) { // Streckenlast, Temperatur, Vorspannung, Spannschloss

          let x = Array(4)
          let z = Array(4);

          (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);
          //console.log("xz", x, z)
          let inside = test_point_inside_area_2D(x, z, xc, zc)
          console.log("select_element, inside ", i, inside)
          if (inside) {
            elementlast_gefunden = true
            obj_ellast = obj
            index_ellast = j
          }
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
          index_lager = (obj as TCAD_Lager).index1;
          obj_knlager = obj
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
          //index_knlast = i;
          obj_knlast = obj
        }
      }
    }
    else if (obj.elTyp === CAD_KNOTEN) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Knoten", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knoten_gefunden = true
          obj_knoten = obj
          index_obj_knoten = (obj as TCAD_Knoten).index1
          console.log("index_obj_knoten", index_obj_knoten)

        }
      }
    }
  }

  console.log('ABSTAND', min_abstand, index, lager_gefunden);

  if (elementlast_gefunden) {

    const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

    let lf = (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).lastfall
    ele.set_lastfall(lf)

    let typ = (obj_ellast.elast[index_ellast] as TCAD_ElLast).typ

    if (typ === 0) {
      let art = (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).art
      let pa = (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pL
      let pe = (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pR
      ele.set_pa(pa)
      ele.set_pe(pe)
      ele.set_art(art)
    }
    else if (typ === 2) {
      let To = (obj_ellast.elast[index_ellast] as TCAD_Temperaturlast).To
      let Tu = (obj_ellast.elast[index_ellast] as TCAD_Temperaturlast).Tu
      ele.set_To(To)
      ele.set_Tu(Tu)
    }
    else if (typ === 3) {
      let sigmaV = (obj_ellast.elast[index_ellast] as TCAD_Vorspannung).sigmaV
      ele.set_sigmaV(sigmaV)
    }
    else if (typ === 4) {
      let ds = (obj_ellast.elast[index_ellast] as TCAD_Spannschloss).ds
      ele.set_sigmaV(ds)
    }

    mode_elementlast_aendern = true

    showDialog_elementlast()
  }
  else if (lager_gefunden) {
    console.log("Knotenlager gefunden")
    gefunden = true
    picked_obj = obj_knlager
    mode_knotenlager_aendern = true;

    let node = (obj_knlager as TCAD_Lager).node
    //console.log("Lager node", node)
    write_lager_dialog(node);
    //   const el = document.getElementById("id_dialog_lager");
    // console.log("id_dialog_lager", el);

    // (el?.shadowRoot?.getElementById("dialog_lager") as HTMLDialogElement).n

    showDialog_lager()

    buttons_control.reset();
  }
  else if (knoten_gefunden) {
    gefunden = true
    console.log("Knoten gefunden")

    write_knoten_dialog((obj_knoten as TCAD_Knoten));

    (document.getElementById('id_dialog_knoten') as drDialogKnoten).set_mode(true);
    showDialog_knoten();

    picked_obj = obj_knoten
    mode_knoten_aendern = true
    buttons_control.reset();

  }
  else if (knotenlast_gefunden) {
    gefunden = true
    console.log("Knotenlast gefunden")

    // let knlast = new TLoads();
    // let lf = (obj_knlast as TCAD_Knotenlast).knlast

    write_knotenlast_dialog((obj_knlast as TCAD_Knotenlast).knlast)
    showDialog_knotenlast()

    picked_obj = obj_knlast
    mode_knotenlast_aendern = true
    // two.remove(obj.two_obj);
    // two.update();
    // undoList.append(obj);
    buttons_control.reset();
  }
  else if (index >= 0 && min_abstand < 0.25) {
    if (list.size > 0) {

      //console.log("two.obj", obj)
      let obj = list.getAt(index);
      two.remove(obj.two_obj);
      let group = drawStab(obj, tr, true);
      two.add(group);
      selected_element.group = group
      obj.isSelected = true

      two.update();

      // undoList.append(obj);
      buttons_control.reset();
      gefunden = true
      picked_obj = obj;

      let divi = document.getElementById("id_context_menu");

      divi!.style.left = xpix + 'px';
      divi!.style.top = zpix + 'px';
      divi!.style.display = 'block';

    }
  }

  // if (gefunden) {
  //   let divi = document.getElementById("id_context_menu");

  //   divi!.style.left = xpix + 'px';
  //   divi!.style.top = zpix + 'px';
  //   divi!.style.display = 'block';
  // }

}


//--------------------------------------------------------------------------------------------------------
export function add_elementlast(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("add_elementlast")
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

  }

  console.log('ABSTAND', min_abstand, index, lager_gefunden);

  if (index >= 0 && min_abstand < 0.25) {
    if (list.size > 0) {
      gefunden = true

      let obj = list.getAt(index) as TCAD_Stab;
      const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

      let lf = ele.get_lastfall()
      set_max_lastfall(lf);

      let typ = ele.get_typ();

      if (typ === 0) {   // Streckenlast
        let pa = ele.get_pa()
        let pe = ele.get_pe()
        let art = ele.get_art()

        console.log("in add_elementlast ", index, lf, art, pa, pe)
        obj.add_streckenlast(lf, art, pa, pe)

        if (Math.abs(pa) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pa);
        if (Math.abs(pe) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pe);
      }
      else if (typ === 1) {
        obj.add_einzellast(lf, ele.get_x(), ele.get_P(), ele.get_M())
      }
      else if (typ === 2) {
        obj.add_temperaturlast(lf, ele.get_To(), ele.get_Tu())
      }
      else if (typ === 3) {
        obj.add_vorspannung(lf, ele.get_sigmaV())
      }
      else if (typ === 4) {
        obj.add_spannschloss(lf, ele.get_ds())
      }
      else if (typ === 5) {
        obj.add_stabvorverformung(lf, ele.get_w0a(), ele.get_w0m(), ele.get_w0e())
      }

      two.remove(obj.two_obj);
      let group = drawStab(obj, tr);
      two.add(group);

      obj.setTwoObj(group)

      selected_element.group = group
      obj.isSelected = false

      two.update();


      // buttons_control.reset();
      gefunden = true
      picked_obj = obj;
    }
  }

  // if (gefunden) {
  //   let divi = document.getElementById("id_context_menu");

  //   divi!.style.left = xpix + 'px';
  //   divi!.style.top = zpix + 'px';
  //   divi!.style.display = 'block';
  // }

}


//---------------------------------------------------------------------------------------------------------------

export function showDialog_lager() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_lager()");

  const el = document.getElementById("id_dialog_lager");
  console.log("id_dialog_lager", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_lager")),
    (el?.shadowRoot?.getElementById("dialog_lager") as HTMLDialogElement).addEventListener("close", dialog_lager_closed);

  set_help_text('Knoten picken');

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
    console.log("sieht gut aus", mode_knotenlager_aendern);
    if (mode_knotenlager_aendern) update_knotenlager();

  } else {
    // Abbruch
    lager_eingabe_beenden();
  }
}

//---------------------------------------------------------------------------------------------------------------
export function read_lager_dialog(node: TNode) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_lager") as HTMLDialogElement;

  //console.log("read_lager_dialog, el=", el);
  let elem = el?.shadowRoot?.getElementById("id_Lx") as SlCheckbox;
  //console.log("Lx=", elem.checked, elem.value);
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

  let elemi = el?.shadowRoot?.getElementById("id_alpha") as HTMLInputElement;
  node.phi = +elemi.value
}


//---------------------------------------------------------------------------------------------------------------
export function write_lager_dialog(node: TNode) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_lager") as HTMLDialogElement;

  console.log("write_lager_dialog, node.L_org=", node.L_org);

  let elem = el?.shadowRoot?.getElementById("id_Lx") as SlCheckbox;
  if (node.L_org[0] === 1) {
    elem.checked = true
  } else {
    elem.checked = false
  }

  elem = el?.shadowRoot?.getElementById("id_Lz") as SlCheckbox;
  if (node.L_org[1] === 1) {
    elem.checked = true
  } else {
    elem.checked = false
  }

  elem = el?.shadowRoot?.getElementById("id_Lphi") as SlCheckbox;
  if (node.L_org[2] === 1) {
    elem.checked = true
  } else {
    elem.checked = false
  }

  let elemi = el?.shadowRoot?.getElementById("id_alpha") as HTMLInputElement;
  elemi.value = String(node.phi)
}

export function showDialog_knoten() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_knoten()");

  const el = document.getElementById("id_dialog_knoten");
  console.log("id_dialog_knoten", el);

  console.log("shadow showDialog_knoten", el?.shadowRoot?.getElementById("dialog_knoten"));

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
    if (mode_knoten_aendern) update_knoten();
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
    (document.getElementById('id_dialog_knoten') as drDialogKnoten).set_mode(false); // Dialog mit 'Anwenden' Button

    buttons_control.reset()
    el.style.backgroundColor = 'darkRed'
    buttons_control.knoten_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_KNOTEN
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0
    buttons_control.button_pressed = true;

    showDialog_knoten();

  }

}


//--------------------------------------------------------------------------------------------------------
export function Einstellungen_button(ev: Event) {
  //----------------------------------------------------------------------------------------------------

  console.log("in Einstellungen_button", ev)

  let el = document.getElementById("id_cad_einstellungen_button") as HTMLButtonElement

  if (buttons_control.einstellungen_eingabe_aktiv) {
    buttons_control.reset()
  } else {

    el.style.backgroundColor = 'darkRed'
    buttons_control.einstellungen_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_EINSTELLUNGEN
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0
    buttons_control.button_pressed = true;

    showDialog_einstellungen();
    buttons_control.reset()

  }

}

//---------------------------------------------------------------------------------------------------------------

export function showDialog_einstellungen() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_einstellungen()");

  const el = document.getElementById("id_dialog_einstellungen");
  console.log("id_dialog_einstellungen", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_einstellungen")),
    (el?.shadowRoot?.getElementById("dialog_einstellungen") as HTMLDialogElement).addEventListener("close", dialog_einstellungen_closed);

  (el?.shadowRoot?.getElementById("dialog_einstellungen") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_einstellungen_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_einstellungen_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_einstellungen") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");
    // if (mode_knotenlast_aendern) update_knotenlast();
    let el = document.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
    console.log("dx drDialogEinstellungen", el.getValue_dx())

    set_raster_dx(el.getValue_dx());
    set_raster_dz(el.getValue_dz());
    set_dx_offset_touch(el.get_dx_offset())
    set_dz_offset_touch(el.get_dz_offset())
    set_touch_support(!el.get_NO_touch_support())

    set_raster_xmin(el.get_raster_xmin());
    set_raster_xmax(el.get_raster_xmax());
    set_raster_zmin(el.get_raster_zmin());
    set_raster_zmax(el.get_raster_zmax());

    init_cad(2);
  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_einstellungen") as HTMLDialogElement).removeEventListener("close", dialog_einstellungen_closed);

    // knoten_eingabe_beenden();
    buttons_control.reset()
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
    buttons_control.button_pressed = true;

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

  set_help_text('Knoten picken');

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
    if (mode_knotenlast_aendern) update_knotenlast();
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

  set_max_lastfall(knlast.lf)

  elem = el?.shadowRoot?.getElementById("id_px") as HTMLInputElement;
  knlast.Px = +elem.value

  elem = el?.shadowRoot?.getElementById("id_pz") as HTMLInputElement;
  knlast.Pz = +elem.value

  elem = el?.shadowRoot?.getElementById("id_my") as HTMLInputElement;
  knlast.p[2] = +elem.value

}


//---------------------------------------------------------------------------------------------------------------
export function write_knotenlast_dialog(knlast: TLoads) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knotenlast") as HTMLDialogElement;

  //console.log("read_knotenlast_dialog, el=", el);
  let elem = el?.shadowRoot?.getElementById("id_lf") as HTMLInputElement;
  //console.log("lf=", elem.value);
  elem.value = String(knlast.lf)

  elem = el?.shadowRoot?.getElementById("id_px") as HTMLInputElement;
  elem.value = String(knlast.Px)

  elem = el?.shadowRoot?.getElementById("id_pz") as HTMLInputElement;
  elem.value = String(knlast.Pz)

  elem = el?.shadowRoot?.getElementById("id_my") as HTMLInputElement;
  elem.value = String(knlast.p[2])

}

//---------------------------------------------------------------------------------------------------------------
export function write_knoten_dialog(obj: TCAD_Knoten) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knoten") as HTMLDialogElement;

  let elem = el?.shadowRoot?.getElementById("id_x") as HTMLInputElement;
  elem.value = String(obj.x1)

  elem = el?.shadowRoot?.getElementById("id_z") as HTMLInputElement;
  elem.value = String(obj.z1)

}

//--------------------------------------------------------------------------------------------------------
export function Elementlast_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  //console.log("in Knotenlast_button", buttons_control.knotenlast_eingabe_aktiv,ev)

  let el = document.getElementById("id_cad_elementlast_button") as HTMLButtonElement

  if (buttons_control.elementlast_eingabe_aktiv) {

    //let el = document.getElementById("id_cad_elementlast_button") as HTMLButtonElement
    buttons_control.reset()
    el.removeEventListener('keydown', keydown);
  } else {
    buttons_control.reset()
    el.style.backgroundColor = 'darkRed'
    buttons_control.elementlast_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_ELLAST
    el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 1
    buttons_control.button_pressed = true;

    showDialog_elementlast();

    // jetzt auf Pointer eingabe warten

  }

}

//---------------------------------------------------------------------------------------------------------------

export function showDialog_elementlast() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_elementlast()");

  const el = document.getElementById("id_dialog_elementlast");
  console.log("id_dialog_elementlast", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_elementlast"));
  (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).addEventListener("close", dialog_elementlast_closed);

  set_help_text('Element picken');

  (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_elementlast_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_elementlast_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_elementlast") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");

    if (mode_elementlast_aendern) update_elementlast();
  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).removeEventListener("close", dialog_elementlast_closed);

    // knoten_eingabe_beenden();
    buttons_control.reset()
  }
}

//---------------------------------------------------------------------------------------------------------------
function update_elementlast() {
  //-------------------------------------------------------------------------------------------------------------

  mode_elementlast_aendern = false

  const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

  let lf = ele.get_lastfall()

  let typ = (obj_ellast.elast[index_ellast] as TCAD_ElLast).typ

  if (typ === 0) {   // Streckenlasten
    let pa = ele.get_pa()
    let pe = ele.get_pe()
    let art = ele.get_art();

    (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pL = pa;
    (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pR = pe;
    (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).lastfall = lf;
    (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).art = art;
  }
  else if (typ === 2) {    // Temperatur
    let To = ele.get_To();
    let Tu = ele.get_Tu();

    (obj_ellast.elast[index_ellast] as TCAD_Temperaturlast).To = To;
    (obj_ellast.elast[index_ellast] as TCAD_Temperaturlast).Tu = Tu;
    (obj_ellast.elast[index_ellast] as TCAD_Temperaturlast).lastfall = lf;
  }
  else if (typ === 3) {    // Vorspannung
    let sigmaV = ele.get_sigmaV();

    (obj_ellast.elast[index_ellast] as TCAD_Vorspannung).sigmaV = sigmaV;
    (obj_ellast.elast[index_ellast] as TCAD_Vorspannung).lastfall = lf;
  }
  else if (typ === 4) {    // Spannschloss
    let ds = ele.get_ds();

    (obj_ellast.elast[index_ellast] as TCAD_Spannschloss).ds = ds;
    (obj_ellast.elast[index_ellast] as TCAD_Spannschloss).lastfall = lf;
  }

  find_max_Lastfall();
  find_maxValues_eloads();

  let group = obj_ellast.getTwoObj();
  two.remove(group)
  group = drawStab(obj_ellast as TCAD_Stab, tr);
  two.add(group)
  obj_ellast.setTwoObj(group);

  two.update();

  buttons_control.reset();

}

//---------------------------------------------------------------------------------------------------------------
function update_knotenlast() {
  //-------------------------------------------------------------------------------------------------------------

  mode_elementlast_aendern = false

  //const ele = document.getElementById("id_dialog_knotenlast") as drDialogElementlasten;

  let knlast = new TLoads();
  read_knotenlast_dialog(knlast)
  obj_knlast.knlast = knlast

  find_max_Lastfall();

  let group = obj_knlast.getTwoObj();
  two.remove(group)
  let index1 = obj_knlast.index1
  group = draw_knotenlast(tr, knlast, get_cad_node_X(index1), get_cad_node_Z(index1), 1, 0);
  two.add(group);

  obj_knlast.setTwoObj(group);
  two.update();

  buttons_control.reset();

}


//---------------------------------------------------------------------------------------------------------------
function update_knotenlager() {
  //-------------------------------------------------------------------------------------------------------------

  mode_knotenlager_aendern = false

  //const ele = document.getElementById("id_dialog_lager") as drDialogElementlasten;

  read_lager_dialog((obj_knlager as TCAD_Lager).node)

  console.log("update_knotenlager", (obj_knlager as TCAD_Lager).node)
  let group = obj_knlager.getTwoObj();
  two.remove(group)
  group = draw_lager(tr, obj_knlager as TCAD_Lager)
  two.add(group);

  obj_knlager.setTwoObj(group);
  two.update();

  buttons_control.reset();

}


//---------------------------------------------------------------------------------------------------------------
export function update_knoten() {
  //-------------------------------------------------------------------------------------------------------------

  mode_knoten_aendern = false

  //const ele = document.getElementById("id_dialog_lager") as drDialogElementlasten;

  let ele = document.getElementById('id_dialog_knoten') as drDialogKnoten;
  console.log('drDialogKnoten', ele.getValueX());
  console.log('drDialogKnoten', ele.getValueZ());

  (obj_knoten as TCAD_Lager).x1 = ele.getValueX();
  (obj_knoten as TCAD_Lager).z1 = ele.getValueZ();


  CADNodes[(obj_knoten as TCAD_Lager).index1].x = ele.getValueX();
  CADNodes[(obj_knoten as TCAD_Lager).index1].z = ele.getValueZ();

  let group = obj_knoten.getTwoObj();
  two.remove(group)

  group = new Two.RoundedRectangle(
    tr.xPix(obj_knoten.x1),
    tr.zPix(obj_knoten.z1),
    15 / devicePixelRatio,
    15 / devicePixelRatio,
    4
  );
  group.fill = '#dd1100';

  two.add(group);

  obj_knoten.setTwoObj(group);

  // Verschiebe alle Elemente an dem Knoten

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as TCAD_Element;
    if (obj.elTyp === CAD_STAB) {
      console.log("update_knoten", index_obj_knoten, (obj as TCAD_Stab).index1, (obj as TCAD_Stab).index2)
      if (index_obj_knoten === (obj as TCAD_Stab).index1) redraw_stab(obj as TCAD_Stab);
      if (index_obj_knoten === (obj as TCAD_Stab).index2) redraw_stab(obj as TCAD_Stab);
    }
    else if (obj.elTyp === CAD_KNLAST) {
      if (index_obj_knoten === obj.index1) {
        redraw_knotenlast(obj as TCAD_Knotenlast);
      }
    }
    else if (obj.elTyp === CAD_LAGER) {
      if (index_obj_knoten === obj.index1) {
        redraw_lager(obj as TCAD_Lager);
      }
    }
  }
  two.update();

  buttons_control.reset();

}


