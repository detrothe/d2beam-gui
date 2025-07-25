


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
  set_touch_support,
  set_raster_xmin,
  set_raster_xmax,
  set_raster_zmin,
  set_raster_zmax,
  rubberband_drawn,
  rubberband,
  set_rubberband_drawn,
  set_dx_offset_touch_factor,
  set_dz_offset_touch_factor,
  CAD_INFO,
  set_zoomIsActive,
  reset_pointer_length,
  CAD_KNMASSE,
  redraw_knotenmasse,
  set_fangweite_cursor,
  get_fangweite_cursor,
  set_show_units,
  set_penLikeTouch,
  CAD_DRAWER,
  CAD_MESSEN,
  CAD_BEMASSUNG,
  redraw_bemassung,
  show_elementlasten,
  show_knotenlasten,
  show_bemassung,
  CAD_KNOTVERFORMUNG,
  show_knotenverformung,
  set_faktor_lagersymbol,
  show_knotenmassen,
  show_lager,
  timer,
  set_raster_offset_x,
  set_raster_offset_z
} from "./cad";

import { two, tr } from "./cad";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/drawer/drawer";

import "../components/dr-dialog_lager";
import "../components/dr-dialog_knoten";
import "../components/dr-dialog_knotenlast";
import "../components/dr-dialog_elementlasten";
import "../components/dr-dialog_messen";
import "../components/dr-dialog_bemassung";
import "../components/dr-dialog_knotenverformung";

import { alertdialog, TLoads, TMass, TNode, TNodeDisp } from "./rechnen";
import { abstandPunktGerade_2D, test_point_inside_area_2D } from "./lib";
import { drawStab, draw_knoten, draw_knotenlast, draw_knotenmasse, draw_lager } from "./cad_draw_elemente";
import { TCAD_Knoten, TCAD_Knotenlast, TCAD_Lager, TCAD_Stab, TCAD_Streckenlast, TCAD_Temperaturlast, TCAD_Element, TCAD_ElLast, TCAD_Vorspannung, TCAD_Spannschloss, TCAD_Stabvorverformung, TCAD_Einzellast, TCAD_Knotenmasse, TCAD_Knotenverformung } from "./CCAD_element";
import { drDialogElementlasten } from "../components/dr-dialog_elementlasten";
import { change_def_querschnitt } from "./querschnitte";
import { drDialogKnoten } from "../components/dr-dialog_knoten";
import { CTrans } from "./trans";
import Two from "two.js";
import { add_element_nodes, CADNodes, get_cad_node_X, get_cad_node_Z, get_ID, remove_element_nodes } from "./cad_node";
import { draw_elementlasten, find_max_Lastfall, find_maxValues_eloads, max_Lastfall, max_value_lasten, set_max_lastfall } from "./cad_draw_elementlasten";
import { drDialogEinstellungen } from "../components/dr-dialog_einstellungen";
import { drDialogKnotenmasse } from "../components/dr-dialog_knotenmasse";
import { drDialogKnotenlast } from "../components/dr-dialog_knotenlast";
import { berechnungErforderlich } from "./globals";
import { drawBemassung, TCAD_Bemassung } from "./cad_bemassung";
import { drDialogBemassung } from "../components/dr-dialog_bemassung";
import { drDialogKnotenverformung } from "../components/dr-dialog_knotenverformung";
import { draw_knotenverformung, showDialog_knotenverformung, write_knotenverformung_dialog } from "./cad_knotenverformung";
import { drDrawer_1 } from "../components/dr-drawer_1";

let backgroundColor_button = 'rgb(64, 64, 64)';
let backgroundColor_button_light = 'rgb(64, 64, 64)';

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  backgroundColor_button = backgroundColor_button_light;
}

export let picked_obj: TCAD_Element;
export let index_stab = -1

let mode_elementlast_aendern = false;
let element_einzellast_gefunden = false

let index_ellast = -1
let obj_ellast: any
let index_eleinzellast = -1
let obj_eleinzellast: any

let mode_knotenlast_aendern = false;
let obj_knlast: any

let mode_knotenmasse_aendern = false;
let obj_knmasse: any

let mode_knotenlager_aendern = false;
let obj_knlager: any

let mode_knoten_aendern = false;
let obj_knoten: TCAD_Element;
let index_obj_knoten = -1

let CADPunkt_gefunden = false
let index_CADPunkt = -1

export let mode_knotenverformung_aendern = false;
export function set_mode_knotenverformung_aendern(wert: boolean) { mode_knotenverformung_aendern = wert; }
export let obj_knotverform: any

let obj_bemassung: any = null;

let right_mousebutton_pressed = false;
export function set_right_mousebutton_pressed(wert: boolean) { right_mousebutton_pressed = wert; }

class CDrawer_1_control {
  drawer_eingabe_aktiv = false;

  reset() {
    this.drawer_eingabe_aktiv = false;
    let el = document.getElementById("id_cad_drawer_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor_button;
  }
}

class Cbuttons_control {
  delete_element = false;
  select_element = false;
  select_node = false;
  cad_eingabe_aktiv = false;
  knoten_eingabe_aktiv = false;
  stab_eingabe_aktiv = false;
  lager_eingabe_aktiv = false;
  knotenlast_eingabe_aktiv = false;
  elementlast_eingabe_aktiv = false;
  knotenmasse_eingabe_aktiv = false;
  einstellungen_eingabe_aktiv = false;
  knotenverformung_eingabe_aktiv = false;
  messen_aktiv = false;
  bemassung_aktiv = false;
  info_eingabe_aktiv = false;
  typ_cad_element = 0;
  n_input_points = 0;
  button_pressed = false;
  input_started = 0;
  art = -1;
  show_boundingRect = false;

  reset() {
    this.delete_element = false;
    this.select_element = false;
    this.select_node = false;
    this.cad_eingabe_aktiv = false;
    this.knoten_eingabe_aktiv = false;
    this.stab_eingabe_aktiv = false;
    this.lager_eingabe_aktiv = false;
    this.knotenlast_eingabe_aktiv = false;
    this.elementlast_eingabe_aktiv = false;
    this.knotenmasse_eingabe_aktiv = false;
    this.einstellungen_eingabe_aktiv = false;
    this.knotenverformung_eingabe_aktiv = false;
    this.typ_cad_element = 0;
    this.n_input_points = 0;
    this.button_pressed = false;
    this.input_started = 0;
    this.info_eingabe_aktiv = false;
    this.messen_aktiv = false;
    this.bemassung_aktiv = false;
    this.art = -1;
    this.show_boundingRect = false;

    let backgroundColor = backgroundColor_button
    let el = document.getElementById("id_cad_stab_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_lager_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_select_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_knoten_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_knotenmasse_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_elementlast_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_einstellungen_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_info_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;
    el = document.getElementById("id_cad_edit_knoten_button") as HTMLButtonElement;
    el.style.backgroundColor = backgroundColor;

    if (rubberband_drawn) {
      two.remove(rubberband);
      set_rubberband_drawn(false);
    }

    timer.element_selected = false;
    timer.index_ellast = -1;

    set_help_text('    ');

    init_obj_mode();

    init_cad(2);
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
export const drawer_1_control = new CDrawer_1_control();


//--------------------------------------------------------------------------------------------------------
function init_obj_mode() {
  //--------------------------------------------------------------------------------------------------------

  (picked_obj as any) = null;
  index_stab = -1

  mode_elementlast_aendern = false;
  element_einzellast_gefunden = false

  index_ellast = -1
  obj_ellast = null;
  index_eleinzellast = -1
  obj_eleinzellast = null;

  mode_knotenlast_aendern = false;
  obj_knlast = null;

  mode_knotenmasse_aendern = false;
  obj_knmasse = null;

  mode_knotenlager_aendern = false;
  obj_knlager = null;

  mode_knoten_aendern = false;
  (obj_knoten as any) = null;
  index_obj_knoten = -1

  CADPunkt_gefunden = false
  index_CADPunkt = -1

  obj_knotverform = null;

  obj_bemassung = null;

  mode_knotenverformung_aendern = false;
}

//--------------------------------------------------------------------------------------------------------
export function cad_buttons() {
  //----------------------------------------------------------------------------------------------------

  let div = document.getElementById("id_cad_group") as HTMLDivElement;
  let div2 = document.getElementById("id_cad_group2") as HTMLDivElement;


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
  querschnitt_default_select.addEventListener("change", change_def_querschnitt);
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

  const edit_knoten_button = document.createElement("button");

  edit_knoten_button.value = "Knoten bearbeiten";
  edit_knoten_button.className = "btn";
  edit_knoten_button.innerHTML = '<i class = "fa fa-file-text-o"></i>';
  edit_knoten_button.addEventListener("click", Edit_Knoten_button);
  // stab_button.addEventListener('keydown', keydown);
  edit_knoten_button.title = "Knoten bearbeiten";
  edit_knoten_button.id = "id_cad_edit_knoten_button";

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
  lager_button.innerHTML = "Δ";
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


  const knotmass_button = document.createElement("button");

  knotmass_button.value = "Knotenmasse";
  knotmass_button.className = "btn";
  knotmass_button.innerHTML = '<i class = "fa fa-circle"></i>';;
  knotmass_button.addEventListener("click", Knotenmasse_button);
  // stab_button.addEventListener('keydown', keydown);
  knotmass_button.title = "Eingabe Knotenmassen";
  knotmass_button.id = "id_cad_knotenmasse_button";
  knotmass_button.style.display = 'none'


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

  const info_button = document.createElement("button");

  info_button.value = "info";
  info_button.className = "btn";
  info_button.innerHTML = '<i class = "fa fa-info"></i>';
  info_button.addEventListener("click", Info_button);
  // stab_button.addEventListener('keydown', keydown);
  info_button.title = "Kurzanleitung & Information";
  info_button.id = "id_cad_info_button";



  const drawer_button = document.createElement("button");

  drawer_button.value = "drawer";
  drawer_button.className = "btn";
  drawer_button.innerHTML = 'A';
  drawer_button.addEventListener("click", Drawer_button);
  // stab_button.addEventListener('keydown', keydown);
  drawer_button.title = "Mehr Aktivitäten";
  drawer_button.id = "id_cad_drawer_button";


  const help_text = document.createElement("span");
  help_text.innerHTML = "grafische Eingabe System"
  help_text.className = "helptext";
  help_text.id = "id_cad_helptext";

  div.appendChild(zurueck_button);
  div.appendChild(help_text);
  let br = document.createElement("br");
  div.appendChild(br);

  div.appendChild(undo_button);
  div.appendChild(redo_button);
  div.appendChild(trash_button);
  div.appendChild(select_button);
  div.appendChild(knoten_button);
  div.appendChild(edit_knoten_button);
  div.appendChild(stab_button);
  div.appendChild(lager_button);
  div.appendChild(knotlast_button);
  div.appendChild(ellast_button);
  div.appendChild(knotmass_button);
  div.appendChild(cog_button);
  div.appendChild(refresh_button);
  div.appendChild(info_button);
  div.appendChild(drawer_button);

  let h = div!.getBoundingClientRect()
  // console.log("Höhe des div", h)

  //  br = document.createElement("br");
  //div2.appendChild(br);
  div2.appendChild(querschnitt_default_select);

  div2.style.top = String(h)

  //let div_cad_group = document.getElementById("id_cad_group") as HTMLDivElement
  // undo_button!.addEventListener("focus", (_event) => {
  //   // @ts-ignore
  //   //console.log("focus", event)
  //   let hoehe = undo_button!.getBoundingClientRect()
  //   //console.log("hoehe div undo_button", hoehe)
  // });

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
    else if ((obj as TCAD_Element).elTyp === CAD_KNOTVERFORMUNG) {
      remove_element_nodes((obj as TCAD_Knotenverformung).index1)
      find_max_Lastfall();
    }
    else if ((obj as TCAD_Element).elTyp === CAD_KNMASSE) {
      remove_element_nodes((obj as TCAD_Knotenmasse).index1)
    }
    else if ((obj as TCAD_Element).elTyp === CAD_KNOTEN) {
      let index = (obj as TCAD_Knoten).index1
      if (CADNodes[index].nel > 1) {
        alertdialog("ok", "An dem Knoten hängen noch andere Elemente, erst diese löschen");
        return;
      }
      remove_element_nodes((obj as TCAD_Knoten).index1)
    }
    else if ((obj as TCAD_Element).elTyp === CAD_BEMASSUNG) {
      console.log("obj", obj)
      console.log("undo", (obj as TCAD_Bemassung).index1, (obj as TCAD_Bemassung).index3, (obj as TCAD_Bemassung).index4)
      remove_element_nodes((obj as TCAD_Bemassung).index1)
      remove_element_nodes((obj as TCAD_Bemassung).index2)
      remove_element_nodes((obj as TCAD_Bemassung).index3)
      remove_element_nodes((obj as TCAD_Bemassung).index4)
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
    console.log("redo", obj);

    let group: any

    if (obj.ellast) {
      console.log("Es handelt sich um eine Elementlast", obj.obj_elast)
      obj.obj_element.elast.push(obj.obj_elast)
      //obj.obj_element.nStreckenlasten++;
      console.log("neuer Stab", obj.obj_element)
      two.remove(obj.obj_element.two_obj);
      console.log("max Lastfall", obj.obj_elast.lastfall)
      let lf = obj.obj_elast.lastfall
      set_max_lastfall(lf)
      if (obj.obj_elast.className === 'TCAD_Streckenlast') {
        let pa = obj.obj_elast.pL;
        let pe = obj.obj_elast.pR;
        if (Math.abs(pa) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pa);
        if (Math.abs(pe) > max_value_lasten[lf - 1].eload) max_value_lasten[lf - 1].eload = Math.abs(pe);
      }
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
        let index1 = obj.index1
        group = draw_knotenlast(tr, obj, index1, 1.0, 0)
        two.add(group);
        add_element_nodes(obj.index1);

        find_max_Lastfall();
      }
      else if (obj.elTyp === CAD_KNOTVERFORMUNG) {
        group = draw_knotenverformung(tr, obj, 1.0, 0)
        two.add(group);
        add_element_nodes(obj.index1);

        find_max_Lastfall();
      }
      else if (obj.elTyp === CAD_KNOTEN) {
        //console.log("KNOTEN reDo", obj.x1, obj.z1)
        add_element_nodes(obj.index1);
        group = draw_knoten(obj, tr)
        two.add(group);
      }
      else if (obj.elTyp === CAD_KNMASSE) {
        //console.log("KNOTEN reDo", obj.x1, obj.z1)

        let index1 = obj.index1
        group = draw_knotenmasse(tr, obj.mass, get_cad_node_X(index1), get_cad_node_Z(index1))
        two.add(group);
        add_element_nodes(index1);
      }
      else if (obj.elTyp === CAD_BEMASSUNG) {
        group = drawBemassung(obj, tr);
        two.add(group);
        add_element_nodes(obj.index1);
        add_element_nodes(obj.index2);
        add_element_nodes(obj.index3);
        add_element_nodes(obj.index4);
      }

      obj.setTwoObj(group); // alte line zuvor am Anfang dieser Funktion gelöscht
      list.append(obj);
    }

    init_cad(2);
    //two.update();
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_button() {
  //----------------------------------------------------------------------------------------------------


  if (buttons_control.delete_element) {
    buttons_control.reset();
    delete_help_text();
  } else {
    buttons_control.reset();
    drawer_1_control.reset();
    let el = document.getElementById("id_cad_delete_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.delete_element = true;
    set_help_text('Pick ein Element');
    buttons_control.button_pressed = true;
    buttons_control.show_boundingRect = true;

    set_zoomIsActive(false);
    reset_pointer_length();
    init_cad(2)
  }
}

//--------------------------------------------------------------------------------------------------------
export function Select_button() {
  //----------------------------------------------------------------------------------------------------


  if (buttons_control.select_element) {
    buttons_control.reset();
    delete_help_text();
  } else {
    buttons_control.reset();
    drawer_1_control.reset();
    let el = document.getElementById("id_cad_select_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.select_element = true;
    set_help_text('Pick Element, Lager oder Last');
    buttons_control.button_pressed = true;
    buttons_control.show_boundingRect = true;

    set_zoomIsActive(false);
    reset_pointer_length();
    init_cad(2)
  }
}

//--------------------------------------------------------------------------------------------------------
export function delete_element(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("delete_element")
  if (list.size === 0) return;

  let gefunden = false

  let min_abstand = 1e30;
  let stab_gefunden = false
  let lager_gefunden = false
  let bemassung_gefunden = false
  let index_lager = -1
  let knotenlast_gefunden = false
  let elementlast_gefunden = false
  let index_knlast = -1
  let knoten_gefunden = false
  let index_knoten = -1
  let knotenmasse_gefunden = false
  let knotenverformung_gefunden = false
  let index_knotenverformung = -1;

  let index_knmasse = -1
  let index_bemassung = -1
  let min_abstand_bemassung = 1e30;

  // index_stab = -1;
  // element_einzellast_gefunden = false
  init_obj_mode();

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index1), get_cad_node_Z(obj.index1), get_cad_node_X(obj.index2), get_cad_node_Z(obj.index2), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index_stab = i;
          stab_gefunden = true
        }
      }

      // Schleife über alle Elementlasten

      if (show_elementlasten) {
        for (let j = 0; j < obj.elast.length; j++) {
          let typ = obj.elast[j].typ
          if (typ === 0 || typ === 2 || typ === 3 || typ === 4 || typ === 5) { // Streckenlast, Temperatur, Vorspannung, Spannschloss, Stabvorverformung

            let x = Array(4)
            let z = Array(4);
            (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);

            let inside = test_point_inside_area_2D(x, z, xc, zc)
            //console.log("select_element, inside ", inside)
            if (inside) {
              elementlast_gefunden = true
              obj_ellast = obj
              index_ellast = j
            }
          }
          else if (typ === 1) {
            if ((obj.elast[j] as TCAD_Einzellast).P !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              //console.log("select_element P, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }

            }
            if ((obj.elast[j] as TCAD_Einzellast).M !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_Einzellast).get_drawLast_M_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              //console.log("select_element M, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }
            }
          }
        }
      }
    }
    else if (obj.elTyp === CAD_LAGER && show_lager) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Lager", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          lager_gefunden = true
          index_lager = i;
        }
      }
    }
    else if (obj.elTyp === CAD_KNLAST && show_knotenlasten) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenlast).knlast.Px_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Px(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Px, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          index_knlast = i;
        }
      }
      if ((obj as TCAD_Knotenlast).knlast.Pz_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Pz(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Pz, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          index_knlast = i;
        }
      }
      if ((obj as TCAD_Knotenlast).knlast.p[2] !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_My(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element My, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          index_knlast = i;
        }
      }
    }

    else if (obj.elTyp === CAD_KNOTVERFORMUNG && show_knotenverformung) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispx0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_ux0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Px KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          index_knotenverformung = i
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispz0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_uz0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Pz KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          index_knotenverformung = i
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.phi0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_phi0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element My KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          index_knotenverformung = i
        }
      }
    }

    else if (obj.elTyp === CAD_KNMASSE && show_knotenmassen) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Knotenmasse", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knotenmasse_gefunden = true
          index_knmasse = i;
        }
      }
    }

    else if (obj.elTyp === CAD_KNOTEN) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Knotenlast", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knoten_gefunden = true
          index_knoten = i;
        }
      }
    }

    else if (obj.elTyp === CAD_BEMASSUNG && show_bemassung) {

      //console.log("index3,4", obj.index3, obj.index4)
      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index3), get_cad_node_Z(obj.index3), get_cad_node_X(obj.index4), get_cad_node_Z(obj.index4), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand_bemassung) {
          min_abstand_bemassung = abstand;
          index_bemassung = i;
          bemassung_gefunden = true
        }
      }

      let x = Array(4)
      let z = Array(4);

      (obj as TCAD_Bemassung).get_txt_xz(x, z);
      //console.log("xz", x, z)
      let inside = test_point_inside_area_2D(x, z, xc, zc)
      //console.log("select_bemassung, inside ", i, inside)
      if (inside) {
        bemassung_gefunden = true
        min_abstand_bemassung = 0.0
        index_bemassung = i
      }

      //console.log("delete bemassung gefunden", min_abstand_bemassung)
    }
  }

  console.log('ABSTAND', min_abstand, index_stab, lager_gefunden, elementlast_gefunden);


  if (elementlast_gefunden || element_einzellast_gefunden) {
    //(obj_ellast.elast[index_ellast] as TCAD_Streckenlast).pL = 1.0;

    if (element_einzellast_gefunden) {
      obj_ellast = obj_eleinzellast
      index_ellast = index_eleinzellast
    }

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
    gefunden = true;
  }
  else if (lager_gefunden) {
    let obj = list.removeAt(index_lager);
    two.remove(obj.two_obj);
    two.update();
    remove_element_nodes((obj as TCAD_Lager).index1)
    undoList.append(obj);
    // buttons_control.reset();
    gefunden = true;
  }
  else if (knoten_gefunden) {
    let obj = list.getAt(index_knoten);
    let index = (obj as TCAD_Knoten).index1
    if (CADNodes[index].nel === 1) {
      obj = list.removeAt(index_knoten);
      two.remove(obj.two_obj);
      two.update();
      undoList.append(obj);
      remove_element_nodes((obj as TCAD_Knoten).index1)
      //buttons_control.reset();
      gefunden = true;
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
    //buttons_control.reset();

    find_max_Lastfall();
    gefunden = true;
  }
  else if (knotenverformung_gefunden) {
    let obj = list.removeAt(index_knotenverformung);
    two.remove(obj.two_obj);
    two.update();
    remove_element_nodes((obj as TCAD_Knotenverformung).index1)
    undoList.append(obj);

    find_max_Lastfall();
    gefunden = true;
  }
  else if (knotenmasse_gefunden) {
    let obj = list.removeAt(index_knmasse);
    two.remove(obj.two_obj);
    two.update();
    remove_element_nodes((obj as TCAD_Knotenmasse).index1)
    undoList.append(obj);
    //buttons_control.reset();
    gefunden = true;
  }
  else if (stab_gefunden && min_abstand < get_fangweite_cursor()) {          // Stab   index >= 0 && min_abstand < 0.25
    if (list.size > 0) {
      let obj = list.removeAt(index_stab);
      two.remove(obj.two_obj);
      two.update();

      remove_element_nodes((obj as TCAD_Stab).index1)
      remove_element_nodes((obj as TCAD_Stab).index2)

      undoList.append(obj);
      //buttons_control.reset();
      gefunden = true;
    }
  }
  else if (bemassung_gefunden && min_abstand_bemassung < get_fangweite_cursor()) {          // Stab   index >= 0 && min_abstand < 0.25
    if (list.size > 0) {
      let obj = list.removeAt(index_bemassung);
      two.remove(obj.two_obj);
      two.update();

      remove_element_nodes((obj as TCAD_Bemassung).index1)
      remove_element_nodes((obj as TCAD_Bemassung).index2)
      remove_element_nodes((obj as TCAD_Bemassung).index3)
      remove_element_nodes((obj as TCAD_Bemassung).index4)

      undoList.append(obj);
      gefunden = true;
    }
  }

  if (gefunden) init_cad(2);

}

//--------------------------------------------------------------------------------------------------------
export function select_node(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  let knoten_gefunden = false
  let gefunden = false;

  init_obj_mode();
  // CADPunkt_gefunden = false;
  // mode_knoten_aendern = false;


  // Elementknoten finden

  let fangweite2 = get_fangweite_cursor() * get_fangweite_cursor();

  let abstand = 1e30
  for (let i = 0; i < CADNodes.length; i++) {
    if (CADNodes[i].isActive) {
      let x = CADNodes[i].x
      let z = CADNodes[i].z
      let dx = xc - x
      let dz = zc - z
      let sl = dx * dx + dz * dz
      if (sl < abstand && sl < fangweite2) {
        abstand = sl
        CADPunkt_gefunden = true
        index_CADPunkt = i
      }
    }
  }

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    console.log("eltyp", obj.elTyp)
    if (obj.elTyp === CAD_KNOTEN) {
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

  if (knoten_gefunden) {
    gefunden = true
    console.log("Knoten gefunden ", CADPunkt_gefunden)

    write_knoten_dialog((obj_knoten as TCAD_Knoten));

    (document.getElementById('id_dialog_knoten') as drDialogKnoten).set_mode(true);
    showDialog_knoten();

    picked_obj = obj_knoten
    mode_knoten_aendern = true

  }
  else if (CADPunkt_gefunden) {
    gefunden = true
    console.log("CAD Punkt gefunden")

    write_knoten_dialog_xz(CADNodes[index_CADPunkt].x, CADNodes[index_CADPunkt].z);

    (document.getElementById('id_dialog_knoten') as drDialogKnoten).set_mode(true);
    (document.getElementById('id_dialog_knoten') as drDialogKnoten).set_ID(CADNodes[index_CADPunkt].ID);
    showDialog_knoten();

    console.log("und vorbei an showDialog_knoten")

  }

}

//--------------------------------------------------------------------------------------------------------
export function select_element(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("select_element")
  if (list.size === 0) return;

  let min_abstand = 1e30;
  //let stab_gefunden = false
  let lager_gefunden = false
  //let index_lager = -1
  let knotenlast_gefunden = false
  let elementlast_gefunden = false
  let knotenmasse_gefunden = false
  let knotenverformung_gefunden = false

  let bemassung_gefunden = false
  //obj_bemassung = null;
  let min_abstand_bemassung = 1e30;

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  let gefunden = false

  init_obj_mode();
  // mode_knoten_aendern = false;
  //  mode_knotenverformung_aendern = false;

  // index_stab = -1;
  // element_einzellast_gefunden = false

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    //console.log("eltyp", obj.elTyp)

    if (obj.elTyp === CAD_KNLAST && show_knotenlasten) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenlast).knlast.Px_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Px(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Px KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }

      if ((obj as TCAD_Knotenlast).knlast.Pz_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Pz(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Pz KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }

      if ((obj as TCAD_Knotenlast).knlast.p[2] !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_My(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element My KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }
    }
    else if (obj.elTyp === CAD_KNOTVERFORMUNG && show_knotenverformung) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispx0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_ux0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Px KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispz0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_uz0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Pz KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.phi0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_phi0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element My KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }
    }

    else if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index1), get_cad_node_Z(obj.index1), get_cad_node_X(obj.index2), get_cad_node_Z(obj.index2), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index_stab = i;
          //stab_gefunden = true
        }
      }

      // Schleife über alle Elementlasten

      if (show_elementlasten) {
        for (let j = 0; j < obj.elast.length; j++) {
          let typ = obj.elast[j].typ

          if (typ === 0 || typ === 2 || typ === 3 || typ === 4 || typ === 5) { // Streckenlast, Temperatur, Vorspannung, Spannschloss, Stabvorverformung

            let x = Array(4)
            let z = Array(4);

            (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);
            //console.log("xz", x, z)
            let inside = test_point_inside_area_2D(x, z, xc, zc)
            //console.log("select_element, inside ", i, inside)
            if (inside) {
              elementlast_gefunden = true
              obj_ellast = obj
              index_ellast = j
            }
          }
          else if (typ === 1) {
            if ((obj.elast[j] as TCAD_Einzellast).P !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              //console.log("select_element P typ 1, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }

            }
            if ((obj.elast[j] as TCAD_Einzellast).M !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_Einzellast).get_drawLast_M_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              //console.log("select_element M typ 1, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }

            }
          }
        }
      }
    }
    else if (obj.elTyp === CAD_LAGER && show_lager) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Lager", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          lager_gefunden = true
          //index_lager = (obj as TCAD_Lager).index1;
          obj_knlager = obj
        }
      }
    }
    else if (obj.elTyp === CAD_KNMASSE && show_knotenmassen) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      //console.log("rect Knotenmasse", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knotenmasse_gefunden = true
          obj_knmasse = obj
        }
      }
    }

    else if (obj.elTyp === CAD_BEMASSUNG && show_bemassung) {

      console.log("index3,4", obj.index3, obj.index4)
      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index3), get_cad_node_Z(obj.index3), get_cad_node_X(obj.index4), get_cad_node_Z(obj.index4), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand_bemassung) {
          min_abstand_bemassung = abstand;
          obj_bemassung = obj;
          bemassung_gefunden = true
        }
      }

      let x = Array(4)
      let z = Array(4);

      (obj as TCAD_Bemassung).get_txt_xz(x, z);
      //console.log("xz", x, z)
      let inside = test_point_inside_area_2D(x, z, xc, zc)
      //console.log("select_bemassung, inside ", i, inside)
      if (inside) {
        bemassung_gefunden = true
        obj_bemassung = obj;
        min_abstand_bemassung = 0.0

      }

    }

  }

  console.log('ABSTAND', min_abstand, index_stab, lager_gefunden);



  if (knotenlast_gefunden) {
    gefunden = true
    //console.log("Knotenlast gefunden")

    write_knotenlast_dialog((obj_knlast as TCAD_Knotenlast).knlast)
    showDialog_knotenlast()

    picked_obj = obj_knlast
    mode_knotenlast_aendern = true
  }

  else if (knotenverformung_gefunden) {
    gefunden = true
    //console.log("knotenverformung gefunden")

    write_knotenverformung_dialog((obj_knotverform as TCAD_Knotenverformung).nodeDisp)
    showDialog_knotenverformung();

    picked_obj = obj_knotverform
    mode_knotenverformung_aendern = true
  }

  else if (element_einzellast_gefunden) {

    const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

    let lf = (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).lastfall
    ele.set_lastfall(lf)
    let x = (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).xe
    let P = (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).P
    let M = (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).M
    ele.set_x(x)
    ele.set_P(P)
    ele.set_M(M)
    ele.set_typ('1')
    mode_elementlast_aendern = true

    obj_ellast = obj_eleinzellast
    index_ellast = index_eleinzellast;

    (document.getElementById('id_dialog_elementlast') as drDialogElementlasten).set_display_group_typ(false);

    showDialog_elementlast()
    gefunden = true
  }

  else if (elementlast_gefunden) {

    const ele = document.getElementById("id_dialog_elementlast") as drDialogElementlasten;

    let lf = (obj_ellast.elast[index_ellast] as TCAD_Streckenlast).lastfall
    ele.set_lastfall(lf)

    let typ = (obj_ellast.elast[index_ellast] as TCAD_ElLast).typ
    ele.set_typ(String(typ))

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
    else if (typ === 5) {
      let w0a = (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0a
      let w0m = (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0m
      let w0e = (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0e
      ele.set_w0a(w0a)
      ele.set_w0m(w0m)
      ele.set_w0e(w0e)
    }

    mode_elementlast_aendern = true;

    (document.getElementById('id_dialog_elementlast') as drDialogElementlasten).set_display_group_typ(false);

    showDialog_elementlast()

    gefunden = true
  }

  else if (lager_gefunden) {
    console.log("Knotenlager gefunden")
    gefunden = true
    picked_obj = obj_knlager
    mode_knotenlager_aendern = true;

    let node = (obj_knlager as TCAD_Lager).node
    //console.log("Lager node", node)
    write_lager_dialog(node);

    showDialog_lager()

  }

  else if (knotenmasse_gefunden) {
    gefunden = true
    console.log("Knotenmasse gefunden")

    // let knlast = new TLoads();
    // let lf = (obj_knlast as TCAD_Knotenlast).knlast

    write_knotenmasse_dialog((obj_knmasse as TCAD_Knotenmasse).masse)
    showDialog_knotenmasse()

    picked_obj = obj_knmasse
    mode_knotenmasse_aendern = true

  }

  else if (index_stab >= 0 && min_abstand < get_fangweite_cursor()) {
    if (list.size > 0) {

      //console.log("two.obj", obj)
      let obj = list.getAt(index_stab);
      two.remove(obj.two_obj);
      let group = drawStab(obj, tr, true);
      two.add(group);
      selected_element.group = group
      obj.isSelected = true

      two.update();

      //buttons_control.reset();
      gefunden = true
      picked_obj = obj;
      console.log("picked obj", picked_obj)

      let divi = document.getElementById("id_context_menu");

      divi!.style.left = xpix + 'px';
      divi!.style.top = zpix + 'px';
      divi!.style.display = 'block';

    }
  }

  else if (bemassung_gefunden && min_abstand_bemassung < get_fangweite_cursor()) {          // Stab   index >= 0 && min_abstand < 0.25
    if (list.size > 0) {

      gefunden = true
      console.log("Bemassung gefunden")

      const el = document.getElementById("id_dialog_bemassung") as drDialogBemassung;
      console.log("el id_dialog_bemassung", el)
      let hl = obj_bemassung.get_hilfsline();
      console.log("hl", hl)
      el.set_art_hilfslinie(hl);
      showDialog_bemassung();

      picked_obj = obj_knmasse
      mode_knotenmasse_aendern = true


    }
  }

  if (gefunden) {
    if (right_mousebutton_pressed) {
      right_mousebutton_pressed = false;
      buttons_control.select_element = false;
    }
    init_cad(2);
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

      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index1), get_cad_node_Z(obj.index1), get_cad_node_X(obj.index2), get_cad_node_Z(obj.index2), xc, zc);
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

      // two.update();
      init_cad(2);

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
  let elFeder = el?.shadowRoot?.getElementById("id_kx") as HTMLInputElement;

  if (elem.checked) node.L_org[0] = 1;
  else node.L_org[0] = 0;
  if (elFeder.value !== '') node.kx = +elFeder.value.replace(/,/g, '.');
  else node.kx = 0;

  elem = el?.shadowRoot?.getElementById("id_Lz") as SlCheckbox;
  elFeder = el?.shadowRoot?.getElementById("id_kz") as HTMLInputElement;

  if (elem.checked) node.L_org[1] = 1;
  else node.L_org[1] = 0;
  if (elFeder.value !== '') node.kz = +elFeder.value.replace(/,/g, '.');
  else node.kz = 0;


  elem = el?.shadowRoot?.getElementById("id_Lphi") as SlCheckbox;
  elFeder = el?.shadowRoot?.getElementById("id_kphi") as HTMLInputElement;

  if (elem.checked) node.L_org[2] = 1;
  else node.L_org[2] = 0;

  if (elFeder.value !== '') node.kphi = +elFeder.value.replace(/,/g, '.');
  else node.kphi = 0;

  let elemi = el?.shadowRoot?.getElementById("id_alpha") as HTMLInputElement;
  node.phi = +elemi.value
}


//---------------------------------------------------------------------------------------------------------------
export function write_lager_dialog(node: TNode) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_lager") as HTMLDialogElement;

  console.log("write_lager_dialog, node.L_org=", node.L_org);

  let elem = el?.shadowRoot?.getElementById("id_Lx") as SlCheckbox;
  let elFeder = el?.shadowRoot?.getElementById("id_kx") as HTMLInputElement;
  if (node.L_org[0] === 1) {
    elem.checked = true
    elFeder.disabled = true
  } else {
    elem.checked = false
    elFeder.disabled = false
  }
  if (node.kx === 0.0) elFeder.value = '';
  else elFeder.value = String(node.kx);

  elem = el?.shadowRoot?.getElementById("id_Lz") as SlCheckbox;
  elFeder = el?.shadowRoot?.getElementById("id_kz") as HTMLInputElement;
  if (node.L_org[1] === 1) {
    elem.checked = true
    elFeder.disabled = true
  } else {
    elem.checked = false
    elFeder.disabled = false
  }
  if (node.kz === 0.0) elFeder.value = '';
  else elFeder.value = String(node.kz);

  elem = el?.shadowRoot?.getElementById("id_Lphi") as SlCheckbox;
  elFeder = el?.shadowRoot?.getElementById("id_kphi") as HTMLInputElement;
  if (node.L_org[2] === 1) {
    elem.checked = true
    elFeder.disabled = true
  } else {
    elem.checked = false
    elFeder.disabled = false
  }
  if (node.kphi === 0.0) elFeder.value = '';
  else elFeder.value = String(node.kphi);

  let elemi = el?.shadowRoot?.getElementById("id_alpha") as HTMLInputElement;
  elemi.value = String(node.phi)
}


//---------------------------------------------------------------------------------------------------------------

export function showDialog_bemassung() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_bemassung()");

  const el = document.getElementById("id_dialog_bemassung");
  console.log("id_dialog_bemassung", el);

  (el?.shadowRoot?.getElementById("dialog_bemassung") as HTMLDialogElement).addEventListener("close", dialog_bemassung_closed);

  (el?.shadowRoot?.getElementById("dialog_bemassung") as HTMLDialogElement).showModal();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_bemassung_closed(this: any, _e: any) {
  //------------------------------------------------------------------------------------------------------------
  // console.log("Event dialog_lager_closed", e);
  // console.log("this", this);
  const ele = document.getElementById("id_dialog_bemassung") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  (ele?.shadowRoot?.getElementById("dialog_bemassung") as HTMLDialogElement).removeEventListener("close", dialog_bemassung_closed);

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus, bemassung closed");

    const el = document.getElementById("id_dialog_bemassung") as drDialogBemassung;
    console.log("el id_dialog_bemassung", el)
    let hl = el.get_art_hilfslinie();
    console.log("hl", hl)
    obj_bemassung.set_hilfsline(hl);
    init_cad(2);

  } else {
    // Abbruch
    //lager_eingabe_beenden();
  }
}

export function showDialog_knoten() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_knoten()");

  const el = document.getElementById("id_dialog_knoten");
  // console.log("id_dialog_knoten", el);

  // console.log("shadow showDialog_knoten", el?.shadowRoot?.getElementById("dialog_knoten"));

  (el?.shadowRoot?.getElementById("dialog_knoten") as HTMLDialogElement).addEventListener("close", dialog_knoten_closed);

  (el?.shadowRoot?.getElementById("dialog_knoten") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_knoten_closed(this: any, _e: any) {
  //------------------------------------------------------------------------------------------------------------
  //console.log("Event dialog_knoten_closed", e);
  //console.log("this", this);

  //const returnValue = this.returnValue;

  if (this.returnValue === "ok") {
    //console.log("sieht gut aus", mode_knoten_aendern, CADPunkt_gefunden);

    if (mode_knoten_aendern) update_knoten(0);  // es handelt sich um einen User Knoten
    else if (CADPunkt_gefunden) update_knoten(1);

  } else {    // Abbruch

    const ele = document.getElementById("id_dialog_knoten") as HTMLDialogElement;
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

    buttons_control.reset();
    drawer_1_control.reset();
    el.style.backgroundColor = 'darkRed'
    buttons_control.knoten_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_KNOTEN
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0
    buttons_control.button_pressed = true;
    reset_pointer_length();

    showDialog_knoten();

  }

}


//--------------------------------------------------------------------------------------------------------
export function Edit_Knoten_button() {
  //----------------------------------------------------------------------------------------------------


  if (buttons_control.select_node) {
    buttons_control.reset();
    delete_help_text();
  } else {
    buttons_control.reset();
    let el = document.getElementById("id_cad_edit_knoten_button") as HTMLButtonElement;
    el.style.backgroundColor = "darkRed";

    buttons_control.select_node = true;
    set_help_text('Pick Knoten');
    buttons_control.button_pressed = true;
    set_zoomIsActive(false);
    reset_pointer_length();
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


//--------------------------------------------------------------------------------------------------------
export function Info_button(ev: Event) {
  //----------------------------------------------------------------------------------------------------

  console.log("in Info_button", ev)

  let el = document.getElementById("id_cad_info_button") as HTMLButtonElement

  if (buttons_control.info_eingabe_aktiv) {
    buttons_control.reset()
  } else {
    drawer_1_control.reset();
    el.style.backgroundColor = 'darkRed'
    buttons_control.info_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_INFO
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0
    buttons_control.button_pressed = true;

    showDialog_info();
    buttons_control.reset()

  }

}


//--------------------------------------------------------------------------------------------------------
export function Messen_button() {
  //----------------------------------------------------------------------------------------------------

  console.log("in Messen_button")

  //  let el = document.getElementById("id_cad_info_button") as HTMLButtonElement

  if (buttons_control.messen_aktiv) {
    buttons_control.reset()
  } else {
    buttons_control.reset()
    //  el.style.backgroundColor = 'darkRed'
    buttons_control.messen_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_MESSEN
    set_help_text('ersten Punkt picken');
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 2
    buttons_control.button_pressed = true;

    //showDialog_info();
    //buttons_control.reset()

  }

}


//---------------------------------------------------------------------------------------------------------------
export function showDialog_messen() {
  //------------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_messen");
  console.log("id_dialog_messen", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_messen"));
  (el?.shadowRoot?.getElementById("dialog_messen") as HTMLDialogElement).addEventListener("close", dialog_messen_closed);

  (el?.shadowRoot?.getElementById("dialog_messen") as HTMLDialogElement).showModal();

}

//---------------------------------------------------------------------------------------------------------------
function dialog_messen_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_messen_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_messen") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");

  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_messen") as HTMLDialogElement).removeEventListener("close", dialog_messen_closed);

    // knoten_eingabe_beenden();
    buttons_control.reset();
    drawer_1_control.reset();

  }
}


//--------------------------------------------------------------------------------------------------------
export function close_drawer_1() {
  //------------------------------------------------------------------------------------------------------
  drawer_1_control.reset()
}

//--------------------------------------------------------------------------------------------------------
export function Drawer_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  buttons_control.reset();

  const drawer = document.querySelector('.drawer-overview');
  const closeButton = drawer?.querySelector('sl-button[variant="primary"]');

  //console.log("in drawer_button", drawer);

  (document.getElementById("id_drawer_1") as drDrawer_1).init_loadcases(max_Lastfall);

  let el = document.getElementById("id_cad_drawer_button") as HTMLButtonElement


  if (drawer_1_control.drawer_eingabe_aktiv) {
    //@ts-ignore
    if (drawer !== null) drawer.hide()

    drawer_1_control.reset()
  } else {

    drawer_1_control.reset()

    el.style.backgroundColor = 'darkRed'
    drawer_1_control.drawer_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = false
    buttons_control.typ_cad_element = CAD_DRAWER
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 0
    buttons_control.button_pressed = true;

    //@ts-ignore
    closeButton?.addEventListener('click', () => drawer.hide());
    //@ts-ignore
    if (drawer !== null) drawer.show()

  }

}

//---------------------------------------------------------------------------------------------------------------
export function showDialog_info() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_info()");

  const el = document.getElementById("id_dialog_info");
  console.log("id_dialog_info", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_info")),
    (el?.shadowRoot?.getElementById("dialog_info") as HTMLDialogElement).addEventListener("close", dialog_info_closed);

  (el?.shadowRoot?.getElementById("dialog_info") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_info_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_info_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_info") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    console.log("alles ok")
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
    let el = document.getElementById('id_dialog_einstellungen') as drDialogEinstellungen;
    //console.log("dx drDialogEinstellungen", el.getRaster_dx())

    set_raster_dx(el.getRaster_dx());
    set_raster_dz(el.getRaster_dz());
    set_dx_offset_touch_factor(el.get_dx_offset())
    set_dz_offset_touch_factor(el.get_dz_offset())
    set_touch_support(!el.get_NO_touch_support())

    set_raster_xmin(el.get_raster_xmin());
    set_raster_xmax(el.get_raster_xmax());
    set_raster_zmin(el.get_raster_zmin());
    set_raster_zmax(el.get_raster_zmax());

    set_raster_offset_x(el.get_rasterOffset_x());
    set_raster_offset_z(el.get_rasterOffset_z());

    set_fangweite_cursor(el.get_fangweite_cursor());
    set_show_units(!el.get_show_units());
    set_penLikeTouch(el.get_penLikeTouch());
    set_faktor_lagersymbol(el.get_faktor_lagersymbol());

    if (el.get_raster_xmax() - el.get_raster_xmin() <= 0.0 || el.get_raster_zmax() - el.get_raster_zmin() <= 0.0) {
      alertdialog("ok", "Der darzustellende Rasterbereich enthält unzulässige Werte");
    }

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
export function Knotenmasse_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  //console.log("in Knotenmasse_button")

  let el = document.getElementById("id_cad_knotenmasse_button") as HTMLButtonElement

  if (buttons_control.knotenmasse_eingabe_aktiv) {

    buttons_control.reset()
    el.removeEventListener('keydown', keydown);
  } else {
    buttons_control.reset();
    drawer_1_control.reset();
    el.style.backgroundColor = 'darkRed'
    buttons_control.knotenmasse_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_KNMASSE
    el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 1
    buttons_control.button_pressed = true;
    set_zoomIsActive(false);
    reset_pointer_length();

    showDialog_knotenmasse();

    // jetzt auf Pointer eingabe warten

  }

}


//---------------------------------------------------------------------------------------------------------------

export function showDialog_knotenmasse() {
  //------------------------------------------------------------------------------------------------------------
  console.log("showDialog_knotenmasse()");

  const el = document.getElementById("id_dialog_knotenmasse");
  console.log("id_dialog_knotenmasse", el);

  console.log("shadow", el?.shadowRoot?.getElementById("dialog_knotenmasse")),
    (el?.shadowRoot?.getElementById("dialog_knotenmasse") as HTMLDialogElement).addEventListener("close", dialog_knotenmasse_closed);

  set_help_text('Knoten picken');

  (el?.shadowRoot?.getElementById("dialog_knotenmasse") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
function dialog_knotenmasse_closed(this: any, e: any) {
  //------------------------------------------------------------------------------------------------------------
  console.log("Event dialog_knotenmasse_closed", e);
  console.log("this", this);
  const ele = document.getElementById("id_dialog_knotenmasse") as HTMLDialogElement;

  // ts-ignore
  const returnValue = this.returnValue;

  if (returnValue === "ok") {
    //let system = Number((ele.shadowRoot?.getElementById("id_system") as HTMLSelectElement).value);
    console.log("sieht gut aus");
    if (mode_knotenmasse_aendern) update_knotenmasse();
  } else {
    // Abbruch
    (ele?.shadowRoot?.getElementById("dialog_knotenmasse") as HTMLDialogElement).removeEventListener("close", dialog_knotenmasse_closed);

    buttons_control.reset()
  }
}

//--------------------------------------------------------------------------------------------------------
export function Knotenlast_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  //console.log("in Knotenlast_button", buttons_control.knotenlast_eingabe_aktiv,ev)

  let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement

  if (buttons_control.knotenlast_eingabe_aktiv) {
    buttons_control.reset()

    let el = document.getElementById("id_cad_knotenlast_button") as HTMLButtonElement
    el.removeEventListener('keydown', keydown);
  } else {
    buttons_control.reset();
    drawer_1_control.reset();
    el.style.backgroundColor = 'darkRed'
    buttons_control.knotenlast_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_KNLAST
    el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 1
    buttons_control.button_pressed = true;
    set_zoomIsActive(false);
    reset_pointer_length();

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

  const el = document.getElementById("id_dialog_knotenlast") as drDialogKnotenlast;

  knlast.lf = el.get_lastfall();

  set_max_lastfall(knlast.lf)

  knlast.Px_org = el.get_Px();
  knlast.Pz_org = el.get_Pz();

  knlast.p[2] = el.get_My()

  knlast.alpha = el.get_alpha();

  // Transformation in x-z Koordinatensystem

  let phi = knlast.alpha * Math.PI / 180

  let si = Math.sin(phi)
  let co = Math.cos(phi)

  knlast.Px = co * knlast.Px_org + si * knlast.Pz_org
  knlast.Pz = -si * knlast.Px_org + co * knlast.Pz_org

}


//---------------------------------------------------------------------------------------------------------------
export function write_knotenlast_dialog(knlast: TLoads) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knotenlast") as drDialogKnotenlast;

  el.set_lastfall(knlast.lf)
  el.set_Px(knlast.Px_org)
  el.set_Pz(knlast.Pz_org)
  el.set_My(knlast.p[2])
  el.set_alpha(knlast.alpha)

}

//---------------------------------------------------------------------------------------------------------------
export function read_knotenmasse_dialog(masse: TMass) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knotenmasse") as drDialogKnotenmasse;

  console.log("read_knotenmasse_dialog, el=", el);

  masse.mass = el.get_mass();
  masse.theta = el.get_theta_y();
}


//---------------------------------------------------------------------------------------------------------------
export function write_knotenmasse_dialog(masse: TMass) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knotenmasse") as drDialogKnotenmasse;

  el.set_mass(masse.mass)
  el.set_theta_y(masse.theta)

}

//---------------------------------------------------------------------------------------------------------------
export function write_knoten_dialog(obj: TCAD_Knoten) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knoten") as HTMLDialogElement;

  let elem = el?.shadowRoot?.getElementById("id_x") as HTMLInputElement;
  elem.value = String(get_cad_node_X(obj.index1))

  elem = el?.shadowRoot?.getElementById("id_z") as HTMLInputElement;
  elem.value = String(get_cad_node_Z(obj.index1))

  let dialog = document.getElementById("id_dialog_knoten") as drDialogKnoten;
  dialog.set_ID(get_ID(obj.index1));
}

//---------------------------------------------------------------------------------------------------------------
export function write_knoten_dialog_xz(x: number, z: number) {
  //-----------------------------------------------------------------------------------------------------------

  const el = document.getElementById("id_dialog_knoten") as HTMLDialogElement;

  let elem = el?.shadowRoot?.getElementById("id_x") as HTMLInputElement;
  elem.value = String(x)

  elem = el?.shadowRoot?.getElementById("id_z") as HTMLInputElement;
  elem.value = String(z)

}

//--------------------------------------------------------------------------------------------------------
export function Elementlast_button(_ev: Event) {
  //----------------------------------------------------------------------------------------------------

  //console.log("in Knotenlast_button", buttons_control.knotenlast_eingabe_aktiv,ev)

  let el = document.getElementById("id_cad_elementlast_button") as HTMLButtonElement
  (document.getElementById("id_dialog_elementlast") as drDialogElementlasten).set_display_group_typ(true);

  if (buttons_control.elementlast_eingabe_aktiv) {
    buttons_control.reset()

    el.removeEventListener('keydown', keydown);
  } else {
    buttons_control.reset();
    drawer_1_control.reset();
    el.style.backgroundColor = 'darkRed'
    buttons_control.elementlast_eingabe_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_ELLAST
    el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 1
    buttons_control.button_pressed = true;
    set_zoomIsActive(false);
    reset_pointer_length();

    showDialog_elementlast();

    // jetzt auf Pointer eingabe warten

  }

}

//--------------------------------------------------------------------------------------------------------------

export function showDialog_elementlast() {
  //------------------------------------------------------------------------------------------------------------
  //console.log("showDialog_elementlast()");

  const el = (document.getElementById("id_dialog_elementlast") as drDialogElementlasten).shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement;

  //console.log("shadow", el?.shadowRoot?.getElementById("dialog_elementlast"));
  // (el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).addEventListener("close", dialog_elementlast_closed);
  el.addEventListener("close", dialog_elementlast_closed);

  set_help_text('Element picken');

  //(el?.shadowRoot?.getElementById("dialog_elementlast") as HTMLDialogElement).showModal();
  el.showModal();
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
  ele.set_display_group_typ(true);

  let lf = ele.get_lastfall()



  if (element_einzellast_gefunden) {    // Einzellast und Einzelmoment
    let x = ele.get_x();
    let P = ele.get_P();
    let M = ele.get_M();

    (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).xe = x;
    (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).P = P;
    (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).M = M;
    (obj_eleinzellast.elast[index_eleinzellast] as TCAD_Einzellast).lastfall = lf;
  }
  else {
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
    else if (typ === 5) {    // Stabvorverformung

      (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0a = ele.get_w0a();
      (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0m = ele.get_w0m();
      (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).w0e = ele.get_w0e();
      (obj_ellast.elast[index_ellast] as TCAD_Stabvorverformung).lastfall = lf;
    }
  }

  find_max_Lastfall();
  find_maxValues_eloads();

  let group = obj_ellast.getTwoObj();
  two.remove(group)
  group = drawStab(obj_ellast as TCAD_Stab, tr);
  two.add(group)
  obj_ellast.setTwoObj(group);

  two.update();

  berechnungErforderlich(true);

}

//---------------------------------------------------------------------------------------------------------------
function update_knotenlast() {
  //-------------------------------------------------------------------------------------------------------------

  mode_knotenlast_aendern = false

  //const ele = document.getElementById("id_dialog_knotenlast") as drDialogElementlasten;

  obj_knlast.zero_drawLasten();

  let knlast = new TLoads();
  read_knotenlast_dialog(knlast)
  obj_knlast.knlast = knlast

  find_max_Lastfall();

  let group = obj_knlast.getTwoObj();
  two.remove(group)
  let index1 = obj_knlast.index1
  group = draw_knotenlast(tr, obj_knlast, index1, 1, 0);
  two.add(group);

  obj_knlast.setTwoObj(group);
  two.update();

  init_cad(2);

  berechnungErforderlich(true);

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

  berechnungErforderlich(true);

}


//---------------------------------------------------------------------------------------------------------------
export function update_knoten(flag = 0) {
  //-------------------------------------------------------------------------------------------------------------

  let index = -1
  mode_knoten_aendern = false
  CADPunkt_gefunden = false

  //const ele = document.getElementById("id_dialog_lager") as drDialogElementlasten;

  let ele = document.getElementById('id_dialog_knoten') as drDialogKnoten;
  console.log('drDialogKnoten', ele.getValueX());
  console.log('drDialogKnoten', ele.getValueZ());

  if (flag === 0) {
    // (obj_knoten as TCAD_Lager).x1 = ele.getValueX();
    // (obj_knoten as TCAD_Lager).z1 = ele.getValueZ();

    CADNodes[(obj_knoten as TCAD_Lager).index1].x = ele.getValueX();
    CADNodes[(obj_knoten as TCAD_Lager).index1].z = ele.getValueZ();

    let group = obj_knoten.getTwoObj();
    two.remove(group)

    group = new Two.RoundedRectangle(
      tr.xPix(get_cad_node_X(obj_knoten.index1)),
      tr.zPix(get_cad_node_Z(obj_knoten.index1)),
      11 / devicePixelRatio,
      11 / devicePixelRatio,
      4
    );
    group.fill = 'black';

    two.add(group);

    obj_knoten.setTwoObj(group);

    index = index_obj_knoten
  }
  else if (flag === 1) {
    CADNodes[index_CADPunkt].x = ele.getValueX();
    CADNodes[index_CADPunkt].z = ele.getValueZ();
    index = index_CADPunkt
  }

  // Verschiebe alle Elemente an dem Knoten

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as TCAD_Element;
    if (obj.elTyp === CAD_STAB) {
      console.log("update_knoten", index, (obj as TCAD_Stab).index1, (obj as TCAD_Stab).index2)
      if (index === (obj as TCAD_Stab).index1) redraw_stab(obj as TCAD_Stab);
      if (index === (obj as TCAD_Stab).index2) redraw_stab(obj as TCAD_Stab);
    }
    else if (obj.elTyp === CAD_KNLAST) {
      if (index === obj.index1) {
        redraw_knotenlast(obj as TCAD_Knotenlast);
      }
    }
    else if (obj.elTyp === CAD_KNMASSE) {
      if (index === obj.index1) {
        redraw_knotenmasse(obj as TCAD_Knotenmasse);
      }
    }
    else if (obj.elTyp === CAD_LAGER) {
      if (index === obj.index1) {
        redraw_lager(obj as TCAD_Lager);
      }
    }
    else if (obj.elTyp === CAD_BEMASSUNG) {
      //console.log("update_knoten", index, (obj as TCAD_Stab).index1, (obj as TCAD_Stab).index2)
      if (index === (obj as TCAD_Bemassung).index1 || index === (obj as TCAD_Bemassung).index2) redraw_bemassung(obj as TCAD_Bemassung);
    }
  }
  two.update();

  berechnungErforderlich(true);

}


//---------------------------------------------------------------------------------------------------------------
function update_knotenmasse() {
  //-------------------------------------------------------------------------------------------------------------

  mode_knotenmasse_aendern = false

  //const ele = document.getElementById("id_dialog_knotenlast") as drDialogElementlasten;

  let knmass = new TMass();
  read_knotenmasse_dialog(knmass)
  obj_knmasse.masse = knmass

  let group = obj_knmasse.getTwoObj();
  two.remove(group)
  let index1 = obj_knmasse.index1
  group = draw_knotenmasse(tr, knmass, get_cad_node_X(index1), get_cad_node_Z(index1));
  two.add(group);

  obj_knmasse.setTwoObj(group);
  two.update();

  berechnungErforderlich(true);

}



//--------------------------------------------------------------------------------------------------------
export function show_selected_element(xc: number, zc: number) {
  //----------------------------------------------------------------------------------------------------

  timer.element_selected = false;

  console.log("select_element")
  if (list.size === 0) return;

  let min_abstand = 1e30;
  //let stab_gefunden = false
  let lager_gefunden = false
  let index_lager = -1
  let knotenlast_gefunden = false
  let elementlast_gefunden = false
  let knotenmasse_gefunden = false
  let knotenverformung_gefunden = false

  let bemassung_gefunden = false
  obj_bemassung = null;
  let min_abstand_bemassung = 1e30;

  let xpix = tr.xPix(xc)
  let zpix = tr.zPix(zc)

  //let gefunden = false

  mode_knoten_aendern = false;
  mode_knotenverformung_aendern = false;

  index_stab = -1;
  element_einzellast_gefunden = false

  for (let i = 0; i < list.size; i++) {
    let obj = list.getAt(i) as any;
    console.log("eltyp", obj.elTyp)

    if (obj.elTyp === CAD_KNLAST && show_knotenlasten) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenlast).knlast.Px_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Px(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        console.log("select_element Px KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }

      if ((obj as TCAD_Knotenlast).knlast.Pz_org !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_Pz(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        console.log("select_element Pz KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }

      if ((obj as TCAD_Knotenlast).knlast.p[2] !== 0.0) {
        (obj as TCAD_Knotenlast).get_drawLast_My(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        console.log("select_element My KNLAST, inside ", i, inside)
        if (inside) {
          knotenlast_gefunden = true
          obj_knlast = obj
        }
      }
    }
    else if (obj.elTyp === CAD_KNOTVERFORMUNG && show_knotenverformung) {

      let x = Array(4)
      let z = Array(4);

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispx0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_ux0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Px KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.dispz0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_uz0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element Pz KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }

      if ((obj as TCAD_Knotenverformung).nodeDisp.phi0.length !== 0) {
        (obj as TCAD_Knotenverformung).get_drawLast_phi0(x, z);
        //console.log("xz", x, z)
        let inside = test_point_inside_area_2D(x, z, xc, zc)
        //console.log("select_element My KNLAST, inside ", i, inside)
        if (inside) {
          knotenverformung_gefunden = true
          obj_knotverform = obj
        }
      }
    }

    else if (obj.elTyp === CAD_STAB) {

      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index1), get_cad_node_Z(obj.index1), get_cad_node_X(obj.index2), get_cad_node_Z(obj.index2), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand) {
          min_abstand = abstand;
          index_stab = i;
          //stab_gefunden = true
        }
      }

      // Schleife über alle Elementlasten

      if (show_elementlasten) {
        for (let j = 0; j < obj.elast.length; j++) {
          let typ = obj.elast[j].typ

          if (typ === 0 || typ === 2 || typ === 3 || typ === 4 || typ === 5) { // Streckenlast, Temperatur, Vorspannung, Spannschloss, Stabvorverformung

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
          else if (typ === 1) {
            if ((obj.elast[j] as TCAD_Einzellast).P !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_ElLast).get_drawLast_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              console.log("select_element P typ 1, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }

            }
            if ((obj.elast[j] as TCAD_Einzellast).M !== 0.0) {
              let x = Array(4)
              let z = Array(4);

              (obj.elast[j] as TCAD_Einzellast).get_drawLast_M_xz(x, z);
              //console.log("xz", x, z)
              let inside = test_point_inside_area_2D(x, z, xc, zc)
              console.log("select_element M typ 1, inside ", i, inside)
              if (inside) {
                element_einzellast_gefunden = true
                obj_eleinzellast = obj
                index_eleinzellast = j
              }

            }
          }
        }
      }
    }
    else if (obj.elTyp === CAD_LAGER && show_lager) {
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
    else if (obj.elTyp === CAD_KNMASSE && show_knotenmassen) {
      let two_obj = obj.two_obj
      let rect = two_obj.getBoundingClientRect();
      console.log("rect Knotenmasse", rect, xc, zc)
      if (xpix > rect.left && xpix < rect.right) {
        if (zpix > rect.top && zpix < rect.bottom) {
          knotenmasse_gefunden = true
          //index_knlast = i;
          obj_knmasse = obj
        }
      }
    }

    else if (obj.elTyp === CAD_BEMASSUNG && show_bemassung) {

      console.log("index3,4", obj.index3, obj.index4)
      let abstand = abstandPunktGerade_2D(get_cad_node_X(obj.index3), get_cad_node_Z(obj.index3), get_cad_node_X(obj.index4), get_cad_node_Z(obj.index4), xc, zc);
      if (abstand > -1.0) {
        if (abstand < min_abstand_bemassung) {
          min_abstand_bemassung = abstand;
          obj_bemassung = obj;
          bemassung_gefunden = true
        }
      }


      let x = Array(4)
      let z = Array(4);

      (obj as TCAD_Bemassung).get_txt_xz(x, z);
      //console.log("xz", x, z)
      let inside = test_point_inside_area_2D(x, z, xc, zc)
      console.log("select_bemassung, inside ", i, inside)
      if (inside) {
        bemassung_gefunden = true
        obj_bemassung = obj;
        min_abstand_bemassung = 0.0

      }

      console.log("delete bemassung gefunden", min_abstand_bemassung)
    }

  }

  //console.log('ABSTAND', min_abstand, index_stab, lager_gefunden);

  //--------------------------------------------------------------------------------------
  //                         gefundenes Element seltiert zeichnen
  //--------------------------------------------------------------------------------------


  if (knotenlast_gefunden) {

    timer.element_selected = true;
    two.remove(obj_knlast.two_obj);
    let group = draw_knotenlast(tr, obj_knlast, obj_knlast.index1, 1.0, 0);
    two.add(group);
    selected_element.group = group
    obj_knlast.isSelected = true
    two.update();
  }
  else if (knotenverformung_gefunden) {
    //gefunden = true

    timer.element_selected = true;
    two.remove(obj_knotverform.two_obj);
    let group = draw_knotenverformung(tr, obj_knotverform, 1.0, 0);
    two.add(group);
    selected_element.group = group
    obj_knotverform.isSelected = true
    two.update();

  }
  else if (element_einzellast_gefunden) {

    console.log("element_einzellast_gefunden")
    timer.element_selected = true;
    two.remove(obj_eleinzellast.two_obj);
    //console.log("obj_ellast.elast[index_ellast]", obj_ellast.elast[index_ellast])
    timer.index_ellast = index_eleinzellast;
    let group = draw_elementlasten(tr, obj_eleinzellast)
    two.add(group);
    selected_element.group = group
    obj_eleinzellast.isSelected = true
    two.update();

  }
  else if (elementlast_gefunden) {


    timer.element_selected = true;
    two.remove(obj_ellast.two_obj);
    console.log("obj_ellast.elast[index_ellast]", obj_ellast.elast[index_ellast])
    timer.index_ellast = index_ellast;
    let group = draw_elementlasten(tr, obj_ellast)
    two.add(group);
    selected_element.group = group
    obj_ellast.isSelected = true

    two.update();

  }
  else if (lager_gefunden) {
    console.log("Knotenlager gefunden")
    //gefunden = true

    timer.element_selected = true;
    two.remove(obj_knlager.two_obj);
    let group = draw_lager(tr, obj_knlager);
    two.add(group);
    selected_element.group = group
    obj_knlager.isSelected = true

    two.update();

  }

  else if (knotenmasse_gefunden) {
    //gefunden = true
    console.log("Knotenmasse gefunden")

    timer.element_selected = true;
    two.remove(obj_knmasse.two_obj);
    let group = draw_knotenmasse(tr, obj_knmasse, get_cad_node_X(obj_knmasse.index1), get_cad_node_Z(obj_knmasse.index1))
    two.add(group);
    selected_element.group = group
    obj_knmasse.isSelected = true

    two.update();

  }

  else if (index_stab >= 0 && min_abstand < get_fangweite_cursor()) {
    if (list.size > 0) {

      console.log("Stab gefunden", index_stab)
      let obj = list.getAt(index_stab);
      two.remove(obj.two_obj);
      let group = drawStab(obj, tr, true);
      two.add(group);
      selected_element.group = group
      obj.isSelected = true
      timer.element_selected = true;

      two.update();

    }
  }
  else if (bemassung_gefunden && min_abstand_bemassung < get_fangweite_cursor()) {          // Stab   index >= 0 && min_abstand < 0.25
    if (list.size > 0) {

      //gefunden = true
      console.log("Bemassung gefunden")

      timer.element_selected = true;
      two.remove(obj_bemassung.two_obj);
      let group = drawBemassung(obj_bemassung, tr);
      two.add(group);
      selected_element.group = group
      obj_bemassung.isSelected = true

      two.update();

    }
  }



}


