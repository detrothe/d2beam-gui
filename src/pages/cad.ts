import Two from 'two.js';

import { CTrans } from './trans';
import { draw_arrow_alpha } from './grafik';
import { myFormat, write } from './utility';
import { LinkedList } from '../components/linkedlist';
import { alertdialog, TLoads, TMass, TNode } from './rechnen';
import { abstandPunktGerade_2D } from './lib';
import {
   delete_element,
   buttons_control,
   read_lager_dialog,
   showDialog_lager,
   read_knotenlast_dialog,
   select_element,
   add_elementlast,
   set_help_text,
   delete_help_text,
   select_node,
   read_knotenmasse_dialog,
   drawer_1_control,
   showDialog_messen,
} from './cad_buttons';
import { draw_knoten, draw_knotenlast, draw_knotenmasse, draw_lager, drawStab } from './cad_draw_elemente';

import '../components/dr-dialog_knoten';
import {
   add_cad_node,
   add_element_nodes,
   CADNodes,
   find_nearest_cad_node,
   get_cad_node_X,
   get_cad_node_Z,
   remove_element_nodes,
   zero_offset_nodes,
} from './cad_node';
//import { AlertDialog } from './confirm_dialog';
import { TCAD_Knoten, TCAD_Knotenlast, TCAD_Lager, TCAD_Stab, TCAD_Element, TCAD_Knotenmasse } from './CCAD_element';
import { Group } from 'two.js/src/group';
import { default_querschnitt, set_default_querschnitt } from './querschnitte';
import { drDialogKnoten } from '../components/dr-dialog_knoten';
import { drDialogMessen } from '../components/dr-dialog_messen';
import { add_bemassung, drawBemassung, recalc_abstand, TCAD_Bemassung } from './cad_bemassung';

export const CAD_KNOTEN = 1;
export const CAD_STAB = 2;
export const CAD_KNLAST = 3;
export const CAD_LAGER = 4;
export const CAD_ELLAST = 5;
export const CAD_EINSTELLUNGEN = 6;
export const CAD_INFO = 7;
export const CAD_KNMASSE = 8;
export const CAD_DRAWER = 9;
export const CAD_MESSEN = 10;

export const CAD_BEMASSUNG = 11;

export let two: any = null;
let domElement: any = null;
export let tr: CTrans;

let devicePixelRatio = 1;

let fangweite_cursor = 0.25;
export function set_fangweite_cursor(wert: number) { fangweite_cursor = wert; }
export function get_fangweite_cursor() { return fangweite_cursor; }

let fullscreen = false;
let grafik_top = 0;

let mouseOffsetX = 0.0;
let mouseOffsetY = 0.0;
let mouseDx = 0.0;
let mouseDz = 0.0;

let mouseCounter = 0;
let wheel_factor = 1.0
let wheel_factor_alt = 0.0
let touchLoop = 0
let prevDiff = -1;
let curDiff = 0.0

let deltaXY = 0.0
let deltaXY_alt = 0.0

let zoomIsActive = false;
export function set_zoomIsActive(wert: boolean) { zoomIsActive = wert; }

let isPen = false;
let isTouch = false;
let penLikeTouch = false;
export function set_penLikeTouch(wert: boolean) { penLikeTouch = wert; }

let allow_pan_cad = true;

let centerX = 0.0;
let centerY = 0.0;
let centerX_last = 0.0;
let centerY_last = 0.0;

export let dx_offset_touch = 0;
export let dz_offset_touch = 0;
let dx_offset_touch_fact = 0;
let dz_offset_touch_fact = -1;
export function set_dx_offset_touch_factor(dx: number) { dx_offset_touch_fact = dx; }
export function set_dz_offset_touch_factor(dz: number) { dz_offset_touch_fact = dz; }

let touch_support = true;
export function set_touch_support(wert: boolean) { touch_support = wert; }

export let unit_force = 'kN';
export let unit_moment = 'kNm';

export let show_units = true;
export function set_show_units(wert: boolean) {
   show_units = wert;
   if (wert) {
      unit_force = 'kN';
      unit_moment = 'kNm';
   } else {
      unit_force = '';
      unit_moment = '';
   }
}

class CPointer {
   id = -1
   isPrimary = false;
   x = 0;
   y = 0;

   constructor(id: number, primary: boolean, x: number, y: number) {
      this.id = id;
      this.isPrimary = primary;
      this.x = x;
      this.y = y;
   }
}
let pointer = [] as CPointer[]
export function reset_pointer_length() { pointer.length = 0; }

export let rubberband: any = null;
let input_active = false;
export let rubberband_drawn = false;
export function set_rubberband_drawn(wert: boolean) { rubberband_drawn = wert; }


let start_x = 0
let start_y = 0


let start_x_wc = 0
let end_x_wc = 0; // x-z im Weltkoordinatensystem
let start_z_wc = 0
let end_z_wc = 0;
let pkt3_x_wc = 0
let pkt3_z_wc = 0;

let cursorLineh: any = null;
let cursorLinev: any = null;
let txt_mouseCoord: any = null;

let xminv = 0.0,
   xmaxv = 0.0,
   zminv = 0.0,
   zmaxv = 0.0;

export let raster_xmin = -1.0,
   raster_xmax = 10.0,
   raster_zmin = -1.0,
   raster_zmax = 9.0;

export let slmax_cad = 10.0;

export let raster_dx = 0.5,
   raster_dz = 0.5;
let xRasterPoint = 0.0,
   zRasterPoint = 0.0;
let xNodePoint = 0.0,
   zNodePoint = 0.0;
let rasterPoint: any = null;
let nodePoint: any = null;
let foundRasterPoint = false;
let foundNodePoint = false;
let foundSelectNode = false;
let selectNode: any = null;

export function set_raster_dx(dx: number) { raster_dx = dx; }
export function set_raster_dz(dz: number) { raster_dz = dz; }
export function set_raster_xmin(xz: number) { raster_xmin = xz; }
export function set_raster_xmax(xz: number) { raster_xmax = xz; }
export function set_raster_zmin(xz: number) { raster_zmin = xz; }
export function set_raster_zmax(xz: number) { raster_zmax = xz; }

// let cad_eingabe_aktiv = false
// let stab_eingabe_aktiv = false
// let lager_eingabe_aktiv = false
// let typ_cad_element = 0
// let n_input_points = 0

export let picked_element = -1;

let show_raster = true;
export function set_show_raster(wert: boolean) {
   show_raster = wert;
   init_cad(2);
}

export let show_stab_qname = true;
export function set_show_stab_qname(wert: boolean) {
   show_stab_qname = wert;
   init_cad(2);
}

export let show_knotenlasten = true;
export function set_show_knotenlasten(wert: boolean) {
   show_knotenlasten = wert;
   init_cad(2);
}

export let show_elementlasten = true;
export function set_show_elementlasten(wert: boolean) {
   show_elementlasten = wert;
   init_cad(2);
}

export const style_txt = {
   family: 'system-ui, sans-serif',
   size: 14,
   fill: 'black',
   //opacity: 0.5,
   //leading: 50
   weight: 'normal',
};

class Tselected_element {
   group: any = null
};
export const selected_element = new Tselected_element

export let list: LinkedList = new LinkedList(); // Empty list
export let undoList: LinkedList = new LinkedList(); // Empty undo list

window.addEventListener('draw_cad_knoten', draw_cad_knoten);


//--------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------
export function two_cad_update() { two.update(); }
//--------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------
export function two_cad_clear() {
   //-----------------------------------------------------------------------------------------------------

   console.log("in two_cad_clear")

   // if (two !== null) {
   //    two.unbind('update');
   //    two.pause();
   //    two.removeEventListener();
   //    two.clear();
   // }

   let size = list.size;
   for (let i = 0; i < size; i++) {
      list.removeTail();
   }

   size = undoList.size;
   for (let i = 0; i < size; i++) {
      undoList.removeTail();
   }
   console.log("list...", list.size, undoList.size)

   CADNodes.length = 0

   buttons_control.reset();
   input_active = false;

   reset_cad();
   set_default_querschnitt('');

}

//--------------------------------------------------------------------------------------------------------
export function redraw_stab(obj: TCAD_Stab) {
   //-----------------------------------------------------------------------------------------------------

   let group = obj.getTwoObj();
   two.remove(group);

   group = drawStab(obj as TCAD_Stab, tr);
   two.add(group);
   obj.setTwoObj(group);
}

//--------------------------------------------------------------------------------------------------------
export function redraw_knotenlast(obj: TCAD_Knotenlast) {
   //-----------------------------------------------------------------------------------------------------

   let group = obj.getTwoObj();
   two.remove(group);

   // let knlast = new TLoads();
   // knlast = obj.knlast
   let index1 = obj.index1
   group = draw_knotenlast(tr, obj, index1, 1, 0);

   two.add(group);
   obj.setTwoObj(group);
}


//--------------------------------------------------------------------------------------------------------
export function redraw_knotenmasse(obj: TCAD_Knotenmasse) {
   //-----------------------------------------------------------------------------------------------------

   let group = obj.getTwoObj();
   two.remove(group);

   let masse = new TMass();
   masse = obj.masse
   let index1 = obj.index1
   group = draw_knotenmasse(tr, masse, get_cad_node_X(index1), get_cad_node_Z(index1));

   two.add(group);
   obj.setTwoObj(group);
}

//--------------------------------------------------------------------------------------------------------
export function redraw_lager(obj: TCAD_Lager) {
   //-----------------------------------------------------------------------------------------------------

   let group = obj.getTwoObj();
   two.remove(group);

   group = draw_lager(tr, obj)

   two.add(group);
   obj.setTwoObj(group);
}


//--------------------------------------------------------------------------------------------------------
export function redraw_bemassung(obj: TCAD_Bemassung) {
   //-----------------------------------------------------------------------------------------------------

   console.log("in redraw_bemassung")

   let group = obj.getTwoObj();
   two.remove(group);

   // remove nodes

   remove_element_nodes((obj as TCAD_Bemassung).index3)
   remove_element_nodes((obj as TCAD_Bemassung).index4)

   recalc_abstand(obj as TCAD_Bemassung);

   group = drawBemassung(obj as TCAD_Bemassung, tr, true);
   two.add(group);
   obj.setTwoObj(group);
}

//--------------------------------------------------------------------------------------------------------
export function Stab_button(_ev: Event) {
   //----------------------------------------------------------------------------------------------------

   // console.log('in Stab_button', ev);
   // let div = document.getElementById("id_cad_group") as HTMLDivElement
   // let h = div!.getBoundingClientRect()
   // console.log("hoehe des div", h)

   if (default_querschnitt.length === 0) {
      alertdialog('ok', 'Es ist noch kein Querschnitt definiert');
      return;
   }
   let el = document.getElementById('id_cad_stab_button') as HTMLButtonElement;

   if (buttons_control.stab_eingabe_aktiv) {
      // el.style.backgroundColor = 'DodgerBlue'
      buttons_control.reset();
      el.removeEventListener('keydown', keydown);
      delete_help_text();
   } else {
      buttons_control.reset();
      drawer_1_control.reset();

      el.style.backgroundColor = 'darkRed';
      buttons_control.stab_eingabe_aktiv = true;
      buttons_control.cad_eingabe_aktiv = true;
      buttons_control.typ_cad_element = CAD_STAB;
      el.addEventListener('keydown', keydown);
      buttons_control.n_input_points = 2;
      set_help_text('Anfangsknoten eingeben');
      buttons_control.button_pressed = true;
      set_zoomIsActive(false);
      pointer.length = 0

   }
}

//--------------------------------------------------------------------------------------------------------
export function Lager_button(ev: Event) {
   //----------------------------------------------------------------------------------------------------

   console.log('in Lager_button', ev);

   let el = document.getElementById('id_cad_lager_button') as HTMLButtonElement;

   if (buttons_control.lager_eingabe_aktiv) {
      lager_eingabe_beenden();
   } else {
      buttons_control.reset();
      drawer_1_control.reset();
      el.style.backgroundColor = 'darkRed';
      buttons_control.lager_eingabe_aktiv = true;
      buttons_control.cad_eingabe_aktiv = true;
      buttons_control.typ_cad_element = CAD_LAGER;
      el.addEventListener('keydown', keydown);
      buttons_control.n_input_points = 1;
      buttons_control.button_pressed = true;
      set_zoomIsActive(false);
      pointer.length = 0

      showDialog_lager();

      // jetzt auf Pointer eingabe warten
   }
}

//--------------------------------------------------------------------------------------------------------
export function lager_eingabe_beenden() {
   //----------------------------------------------------------------------------------------------------

   let el = document.getElementById('id_cad_lager_button') as HTMLButtonElement;

   //el.style.backgroundColor = 'DodgerBlue'
   buttons_control.reset();
   el.removeEventListener('keydown', keydown);
   // lager_eingabe_aktiv = false
   // cad_eingabe_aktiv = false
   // typ_cad_element = 0
   // n_input_points = 0
}

//--------------------------------------------------------------------------------------------------------
export function click_zurueck_cad() {
   //----------------------------------------------------------------------------------------------------

   let elb = document.getElementById('id_button_zurueck_cad') as HTMLButtonElement;
   let ele = document.getElementById('id_cad') as HTMLDivElement;

   if (fullscreen) {
      console.log('click_zurueck_grafik_cad');
      //let ele1 = document.getElementById("id_tab_group") as any
      //console.log("HEIGHT id_tab_group boundingRect", ele1.getBoundingClientRect(), '|', ele1);

      ele.style.position = 'relative';
      fullscreen = false;

      elb.innerHTML = 'Fullscreen';
   } else {
      console.log('fullscreen');
      ele.style.position = 'absolute';
      fullscreen = true;

      elb.innerHTML = 'zurück';
   }

   elb.style.width = 'fit-content';

   //drawsystem();
   init_cad(0);
}


//--------------------------------------------------------------------------------------------------------
export function click_pan_button_cad() {
   //----------------------------------------------------------------------------------------------------

   allow_pan_cad = !allow_pan_cad;

   const el_pan_button = document.getElementById('id_button_pan_cad') as HTMLButtonElement;

   if (allow_pan_cad) {
      el_pan_button.style.color = 'white'
   } else {
      el_pan_button.style.color = 'grey'
   }

}
//--------------------------------------------------------------------------------------------------- i n i t _ t w o _ c a d

export function init_two_cad(svg_id = 'artboard_cad') {
   devicePixelRatio = window.devicePixelRatio;

   if (two !== null) {
      // let parent = two.renderer.domElement.parentElement
      // console.log("Parent ", parent)

      two.unbind('update');
      two.pause();
      two.removeEventListener();
      two.clear();

      //two.bind('update')
      //        let parent = two.renderer.domElement.parentelement;
      //console.log("Parent ", parent)
      //if (parent) parent.removeChild(two.renderer.domElement);
   }

   if (domElement != null) {
      // domElement.removeEventListener('wheel', wheel, { passive: false });
      // domElement.removeEventListener('mousedown', mousedown, false);
      // domElement.removeEventListener('mouseup', mousemove, false);

      //console.log('domElement',domElement)
      let parent = domElement.parentElement;
      //console.log("Parent ", parent)
      if (parent) parent.removeChild(domElement);
      const id_cad = document.getElementById('id_CAD') as any;
      id_cad.removeEventListener('keydown', keydown);
   }

   // const tab_group = document.getElementById('container') as any;
   // tab_group.hidden=true

   // for (let i = 0; i < two.scene.children.length; i++) {
   //     let child = two.scene.children[i];
   //     two.scene.remove(child);
   //     Two.Utils.dispose(child);
   // }

   console.log('__________________________________  C  A  D  ___________');
   if (svg_id === 'svg_artboard_cad') {
      const elem = document.getElementById(svg_id) as any; //HTMLDivElement;
      //console.log("childElementCount", elem.childElementCount)

      if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild); // war > 2
   }

   var params = {
      fullscreen: false,
      type: Two.Types.canvas,
   };

   if (svg_id === 'svg_artboard_cad') params.type = Two.Types.svg;

   two = null;
   const artboard = document.getElementById(svg_id) as any;

   two = new Two(params).appendTo(artboard);

   if (svg_id === 'artboard_cad') {
      domElement = two.renderer.domElement;

      domElement.addEventListener('wheel', wheel, { passive: false });
      domElement.addEventListener('pointerdown', pointerdown, false);
      domElement.addEventListener('pointerup', pointerup, false);
      domElement.addEventListener('pointermove', pointermove, false);

      // const id_cad = document.getElementById('id_CAD') as any;
      // id_cad.addEventListener('keyup', keydown);
      domElement.addEventListener(
         'contextmenu',
         (e: { preventDefault: () => any }) => e.preventDefault()
      );

      domElement.addEventListener('touchstart', touchstart, { passive: false });
      domElement.addEventListener('touchmove', touchmove, { passive: false });
      domElement.addEventListener('touchend', touchend, { passive: false });
   }
}

//--------------------------------------------------------------------------------------------------- i n i t _ c a d

export function init_cad(flag: number) {


   let show_selection = true;
   let height = 0;

   if (flag !== 2) {
      zoomIsActive = false

      centerX = 0.0
      centerY = 0.0
      centerX_last = 0.0
      centerY_last = 0.0
      wheel_factor = 0.0   // 1.0
      wheel_factor_alt = 0.0
      touchLoop = 0

      pointer.length = 0
      mouseCounter = 0;
   }

   if (two) two.clear();

   let ele = document.getElementById('id_cad') as any;
   if (fullscreen) {
      grafik_top = 0;
      ele.style.position = 'absolute';
      height = document.documentElement.clientHeight - 4;
   } else {
      grafik_top = ele.getBoundingClientRect().top;
      //console.log("HEIGHT id_grafik boundingRect", ele.getBoundingClientRect(), '|', ele);
      //write("grafik top: " + grafik_top)
      if (grafik_top === 0) grafik_top = 69;
      height = document.documentElement.clientHeight - grafik_top - 4 - 17; //- el?.getBoundingClientRect()?.height;
   }

   let breite: number;
   let hoehe: number;
   if (show_selection) {
      two.width = document.documentElement.clientWidth;
      two.height = height;
      breite = two.width;
      hoehe = two.height;
   } else {
      two.width = breite = 1500;
      two.height = hoehe = 1500;
   }
   //write("width,height " + breite + ' | ' + hoehe);

   // (xminv = -1.0), (xmaxv = 10.0), (zminv = -1.0), (zmaxv = 10.0);
   xminv = raster_xmin
   xmaxv = raster_xmax
   zminv = raster_zmin
   zmaxv = raster_zmax;

   let dx = xmaxv - xminv
   let dz = zmaxv - zminv

   xminv -= centerX;
   xmaxv -= centerX;
   zminv -= centerY;
   zmaxv -= centerY;

   // xminv = xminv - dx * wheel_factor / 2.
   // xmaxv = xmaxv + dx * wheel_factor / 2.
   // zminv = zminv - dz * wheel_factor / 2.
   // zmaxv = zmaxv + dz * wheel_factor / 2.

   xminv = xminv - deltaXY / 2.
   xmaxv = xmaxv + deltaXY / 2.
   zminv = zminv - deltaXY / 2.
   zmaxv = zmaxv + deltaXY / 2.

   //console.log("wheel_factor", wheel_factor, deltaXY, xminv, xmaxv, zminv, zmaxv)

   if (tr === undefined) {
      //console.log('in undefined');
      tr = new CTrans(xminv, zminv, xmaxv, zmaxv, breite, hoehe);
   } else {
      //if (init) {
      tr.init(xminv, zminv, xmaxv, zmaxv, breite, hoehe);

      //}
   }

   {
      // Koordinatenursprung darstellen

      draw_arrow_alpha(two, tr, 0.0, 0.0, 0.0, -1.0, {
         a: 55,
         b: 25,
         h: 12,
         linewidth: 4,
         color: '#bb0000',
      });
      let txt = two.makeText(
         'x',
         tr.xPix(0.0) + 80 / devicePixelRatio,
         tr.zPix(0.0) - 10 / devicePixelRatio,
         style_txt
      );
      txt.fill = '#bb0000';
      draw_arrow_alpha(two, tr, 0.0, 0.0, Math.PI / 2.0, -1.0, {
         a: 55,
         b: 25,
         h: 12,
         linewidth: 4,
         color: '#0000bb',
      });
      txt = two.makeText(
         'z',
         tr.xPix(0.0) + 10 / devicePixelRatio,
         tr.zPix(0.0) + 80 / devicePixelRatio,
         style_txt
      );
      txt.fill = '#0000bb';
   }
   {
      const [x_min, x_max, z_min, z_max] = tr.getMinMax();

      let dx = x_max - x_min;
      let dz = z_max - z_min;
      //console.log("min max", x_min, x_max, z_min, z_max, dx, dz)
      //console.log("LINKS", tr.xPix(x_min + dx * 0.1), tr.zPix(z_min + dz * 0.1), tr.xPix(x_min + dx * 0.1), tr.zPix(z_max - dz * 0.1))

      // linke Linie
      let rand = tr.World0(20 / devicePixelRatio);
      let xl = x_min + rand; //dx * 0.05
      let zl = z_max - rand;
      let line1 = two.makeLine(tr.xPix(xl), tr.zPix(z_min + dz * 0.05), tr.xPix(xl), tr.zPix(z_max - dz * 0.05));
      line1.linewidth = 1;

      let line2 = two.makeLine(tr.xPix(x_min), tr.zPix(0.0), tr.xPix(x_min + rand), tr.zPix(0.0));
      line2.linewidth = 1;
      let txt = two.makeText('0', tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(0.0), style_txt);
      txt.fill = '#000000';
      txt.baseline = 'middle';
      txt.alignment = 'left';

      if (myFormat(raster_zmin, 1, 2) !== myFormat(0.0, 1, 2)) {
         line2 = two.makeLine(tr.xPix(x_min), tr.zPix(raster_zmin), tr.xPix(x_min + rand), tr.zPix(raster_zmin));
         line2.linewidth = 1;
         txt = two.makeText(myFormat(raster_zmin, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(raster_zmin), style_txt)
         txt.fill = '#000000'
         txt.baseline = 'middle'
         txt.alignment = 'left'
      }

      if (myFormat(raster_zmax, 1, 2) != myFormat(0.0, 1, 2)) {
         line2 = two.makeLine(tr.xPix(x_min), tr.zPix(raster_zmax), tr.xPix(x_min + rand), tr.zPix(raster_zmax));
         line2.linewidth = 1;
         txt = two.makeText(myFormat(raster_zmax, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(raster_zmax), style_txt)
         txt.fill = '#000000'
         txt.baseline = 'middle'
         txt.alignment = 'left'
      }

      //unten

      let line3 = two.makeLine(tr.xPix(x_min + dx * 0.05), tr.zPix(zl), tr.xPix(x_max - dx * 0.05), tr.zPix(zl));
      line3.linewidth = 1;
      let line4 = two.makeLine(tr.xPix(0.0), tr.zPix(z_max), tr.xPix(0.0), tr.zPix(z_max - rand));
      line4.linewidth = 1;
      let txt1 = two.makeText('0', tr.xPix(0.0), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt);
      txt1.fill = '#000000';
      txt1.baseline = 'baseline';
      txt1.alignment = 'center';

      if (myFormat(raster_xmax, 1, 2) != myFormat(0.0, 1, 2)) {
         let line5 = two.makeLine(tr.xPix(raster_xmax), tr.zPix(z_max), tr.xPix(raster_xmax), tr.zPix(z_max - rand));
         line5.linewidth = 1;
         txt1 = two.makeText(myFormat(raster_xmax, 1, 2), tr.xPix(raster_xmax), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
         txt1.fill = '#000000'
         txt1.baseline = 'baseline'
         txt1.alignment = 'center'
      }

      if (myFormat(raster_xmin, 1, 2) != myFormat(0.0, 1, 2)) {
         let line5 = two.makeLine(tr.xPix(raster_xmin), tr.zPix(z_max), tr.xPix(raster_xmin), tr.zPix(z_max - rand));
         line5.linewidth = 1;
         txt1 = two.makeText(myFormat(raster_xmin, 1, 2), tr.xPix(raster_xmin), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
         txt1.fill = '#000000'
         txt1.baseline = 'baseline'
         txt1.alignment = 'center'
      }

      // Mitte

      {
         let xmean = (xminv + xmaxv) / 2
         //xmean = Number(xmean.toFixed(1))
         let line5 = two.makeLine(tr.xPix(xmean), tr.zPix(z_max), tr.xPix(xmean), tr.zPix(z_max - rand));
         line5.linewidth = 2;
         line5.stroke = 'dodgerblue'
         txt1 = two.makeText(myFormat(xmean, 1, 2), tr.xPix(xmean), tr.zPix(z_max - rand) - 4 / devicePixelRatio, style_txt)
         txt1.fill = '#000000'
         txt1.baseline = 'baseline'
         txt1.alignment = 'center'
      }

      {
         let zmean = (zminv + zmaxv) / 2
         //zmean = Number(zmean.toFixed(1))
         let line2 = two.makeLine(tr.xPix(x_min), tr.zPix(zmean), tr.xPix(x_min + rand), tr.zPix(zmean));
         line2.linewidth = 2;
         line2.stroke = 'dodgerblue'
         txt = two.makeText(myFormat(zmean, 1, 2), tr.xPix(x_min + rand) + 4 / devicePixelRatio, tr.zPix(zmean), style_txt)
         txt.fill = '#000000'
         txt.baseline = 'middle'
         txt.alignment = 'left'
      }

   }
   if (show_raster) drawRaster();

   slmax_cad = Math.sqrt((raster_xmax - raster_xmin) ** 2 + (raster_zmax - raster_zmin) ** 2)

   // Zeichne vorhandenes System

   zero_offset_nodes();

   //console.log('init cad list.size', list.size);
   for (let i = 0; i < list.size; i++) {

      let obj: TCAD_Element = list.getAt(i);

      if (obj.elTyp === CAD_KNOTEN) {
         let group = draw_knoten(obj, tr)
         two.add(group);
         obj.setTwoObj(group);
      }
      else if (obj.elTyp === CAD_STAB) {
         let group = drawStab(obj as TCAD_Stab, tr);
         two.add(group);
         obj.setTwoObj(group);
      }
      else if (obj.elTyp === CAD_LAGER) {
         let group = draw_lager(tr, obj as TCAD_Lager)
         two.add(group);
         obj.setTwoObj(group);
      }
      else if (obj.elTyp === CAD_KNLAST) {
         if (show_knotenlasten) {
            let index1 = obj.index1
            let group = draw_knotenlast(tr, (obj as TCAD_Knotenlast), index1, 1.0, 0, true)
            two.add(group);
            obj.setTwoObj(group);
         }
      }
      else if (obj.elTyp === CAD_KNMASSE) {
         let masse = new TMass();
         masse = (obj as TCAD_Knotenmasse).masse
         let index1 = obj.index1
         let group = draw_knotenmasse(tr, masse, get_cad_node_X(index1), get_cad_node_Z(index1))
         two.add(group);
         obj.setTwoObj(group);
      }
      else if (obj.elTyp === CAD_BEMASSUNG) {
         let group = drawBemassung(obj as TCAD_Bemassung, tr)
         two.add(group);
         obj.setTwoObj(group);
      }
   }

   two.update();

   // dx_offset_touch = -tr.Pix0(raster_dx) * devicePixelRatio;
   // dz_offset_touch = -tr.Pix0(raster_dz) * devicePixelRatio;
   // let sl = Math.sqrt((xmaxv - xminv) ** 2 + (zmaxv - zminv) ** 2)
   let sl = Math.sqrt(breite * breite + hoehe * hoehe)
   dx_offset_touch = sl / 10 * devicePixelRatio * dx_offset_touch_fact //* devicePixelRatio;
   dz_offset_touch = sl / 10 * devicePixelRatio * dz_offset_touch_fact //* devicePixelRatio;
   //   dx_offset_touch = tr.Pix0(sl) / 7 * devicePixelRatio * dx_offset_touch_fact //* devicePixelRatio;
   //   dz_offset_touch = tr.Pix0(sl) / 7 * devicePixelRatio * dz_offset_touch_fact //* devicePixelRatio;
   //write("dxz_offset_touch " + dx_offset_touch + '  ' + dz_offset_touch + '  ' + devicePixelRatio)



}


//--------------------------------------------------------------------------------------------------------
function wheel(ev: WheelEvent) {
   //----------------------------------------------------------------------------------------------------

   ev.preventDefault()

   if (ev.deltaY > 0) {       // Bild wird kleiner
      //if (mouseCounter < 60) {
      mouseCounter++;
      wheel_factor = mouseCounter / 60.    //0.025;
      deltaXY += tr.World0(30)
      //}
      //if (wheel_factor > 3) wheel_factor = 3.0
   }
   else if (ev.deltaY < 0) {   // zoom in, Detail
      //if (mouseCounter > -59) {
      mouseCounter--;
      wheel_factor = mouseCounter / 60.0;  //0.025;
      //if (wheel_factor < 0.2) wheel_factor = 0.2
      deltaXY -= tr.World0(30)
      //}
   }
   init_cad(2)
}

//--------------------------------------------------------------------------------------------------------
function pointerdown(ev: PointerEvent) {
   //----------------------------------------------------------------------------------------------------
   //console.log('in pointerdown', ev.width);
   //write('pointer wh ' + ev.width + '|' + ev.height);

   ev.preventDefault();

   isPen = false;
   isTouch = false

   let eingabe = buttons_control.cad_eingabe_aktiv || buttons_control.pick_element || buttons_control.select_element || buttons_control.select_node
   //console.log("eingabe", eingabe)

   switch (ev.pointerType) {
      case 'mouse':
         mousedown(ev);
         break;
      case 'pen':
         isPen = true;
         if (eingabe) {
            zoomIsActive = false;
         }
         // penDown(ev);
         // mousedown(ev);
         if (!penLikeTouch) {
            if (buttons_control.input_started === 0) penDown(ev);
            else if (buttons_control.bemassung_aktiv && buttons_control.input_started === 2) break;
            else if (buttons_control.n_input_points > 1) mouseup(ev);
         }
         break;
      case 'touch':
         isTouch = true;
         touchLoop = 0

         if (eingabe) {
            zoomIsActive = false;
         } else {
            // if (allow_pan_cad) {
            if (allow_pan_cad) zoomIsActive = true;

            mouseOffsetX = ev.offsetX;
            mouseOffsetY = ev.offsetY;

            mouseDx = 0.0;
            mouseDz = 0.0;

            if (pointer.length < 2) {
               pointer.push(new CPointer(ev.pointerId, ev.isPrimary, ev.offsetX, ev.offsetY))
               //console.log("pointerdown, length", pointer.length, ev.pointerId)
            }
            // }
         }
         break;
   }

   if (eingabe && (isTouch || isPen)) {   // Cursor anzeigen

      let dx_offset = 0.0, dy_offset = 0.0;
      if (isTouch) {
         dx_offset = dx_offset_touch / devicePixelRatio;
         dy_offset = dz_offset_touch / devicePixelRatio;
      }
      let xo = ev.offsetX + dx_offset
      let yo = ev.offsetY + dy_offset

      if (cursorLineh) two.remove(cursorLineh);
      if (cursorLinev) two.remove(cursorLinev);
      let len = tr.Pix0(fangweite_cursor);
      cursorLineh = two.makeLine(xo - len, yo, xo + len, yo);
      cursorLinev = two.makeLine(xo, yo - len, xo, yo + len);
      two.update();
   }
}

//--------------------------------------------------------------------------------------------------------
function pointermove(ev: PointerEvent) {
   //----------------------------------------------------------------------------------------------------
   //console.log("in pointermove", ev);

   ev.preventDefault();

   isPen = false;
   isTouch = false

   let eingabe = buttons_control.cad_eingabe_aktiv || buttons_control.pick_element || buttons_control.select_element || buttons_control.select_node

   switch (ev.pointerType) {
      case 'mouse':
         mousemove(ev);
         break;
      case 'pen':
         isPen = true;
         if (eingabe) {
            zoomIsActive = false;
            mousemove(ev);
         }
         //         mousemove(ev);
         break;
      case 'touch':
         isTouch = true;
         if (eingabe) {
            zoomIsActive = false;
            if (touch_support) mousemove(ev);
         }
         else {
            if (pointer.length === 2) {
               for (let i = 0; i < pointer.length; i++) {
                  if (ev.pointerId === pointer[i].id) {
                     console.log("pointermove", pointer[i].id)
                     pointer[i].x = ev.offsetX
                     pointer[i].y = ev.offsetY
                     break;
                  }
               }
               let dx = pointer[0].x - pointer[1].x
               let dy = pointer[0].y - pointer[1].y
               curDiff = Math.sqrt(dx * dx + dy * dy) //* 0.25;

               let xm = (pointer[0].x + pointer[1].x) / 2
               let ym = (pointer[0].y + pointer[1].y) / 2

               if (touchLoop === 1) {

                  // let factor = prevDiff / curDiff - 1.0 + wheel_factor_alt
                  // if (factor > -0.95 && factor < 0.5) {
                  //    wheel_factor = factor //prevDiff / curDiff - 1.0 + wheel_factor_alt
                  //    //if (wheel_factor < -0.99) wheel_factor = -0.99
                  //    //console.log("pointermove, wheel_factor", wheel_factor, wheel_factor_alt, factor)
                  // } else {
                  //    touchLoop = 0
                  //    wheel_factor_alt = wheel_factor
                  // }
                  deltaXY = -tr.World0((curDiff - prevDiff)) + deltaXY_alt

                  mouseDx += xm - mouseOffsetX
                  mouseDz += ym - mouseOffsetY

                  centerX = centerX_last + tr.World0(mouseDx)
                  centerY = centerY_last + tr.World0(mouseDz)
                  mouseOffsetX = xm
                  mouseOffsetY = ym

                  init_cad(2)
               } else {
                  touchLoop = 1
                  prevDiff = curDiff;
                  mouseOffsetX = xm
                  mouseOffsetY = ym
               }
            } else {
               mousemove(ev);
            }
         }
         break;
   }
}

//--------------------------------------------------------------------------------------------------------
function pointerup(ev: PointerEvent) {
   //----------------------------------------------------------------------------------------------------
   //console.log('in pointerup', ev.button);

   ev.preventDefault();

   isPen = false;
   isTouch = false;
   touchLoop = 0

   switch (ev.pointerType) {

      case 'mouse':
         if (ev.button === 2 && buttons_control.input_started === 0) {
            // test Element unter Maus
            test_for_cad_element(ev);
         } else {
            mouseup(ev);
         }
         break;

      case 'pen':
         isPen = true;
         //if (buttons_control.input_started === 0) penDown(ev);
         // alt if (buttons_control.n_input_points > 1) mouseup(ev);
         if (penLikeTouch) {
            if (buttons_control.input_started === 0) penDown(ev);
            else if (buttons_control.n_input_points > 1) mouseup(ev);
         }
         else {
            if (buttons_control.n_input_points > 1) mouseup(ev);
         }
         break;

      case 'touch':
         isTouch = true;
         if (buttons_control.cad_eingabe_aktiv || buttons_control.pick_element || buttons_control.select_element || buttons_control.select_node) {
            if (touch_support) {
               if (buttons_control.input_started === 0) penDown(ev);
               else if (buttons_control.n_input_points > 1) mouseup(ev);
            }
         }
         else {     // if (!buttons_control.button_pressed)
            zoomIsActive = false;

            centerX_last = centerX;
            centerY_last = centerY;
            reset_pointer_length();
            // let memId = 0
            // for (let i = 0; i < pointer.length; i++) {
            //    if (ev.pointerId === pointer[i].id) {
            //       pointer.splice(i, 1);
            //       memId = ev.pointerId
            //       break;
            //    }
            // }
            // console.log("pointerup, pointer length", pointer.length, memId)
         }
         touchLoop = 0
         wheel_factor_alt = wheel_factor
         deltaXY_alt = deltaXY

         break;
   }
}

//--------------------------------------------------------------------------------------------------------
function penDown(ev: PointerEvent) {
   //----------------------------------------------------------------------------------------------------
   //console.log('in penDown', ev);

   ev.preventDefault();



   let dx_offset = 0.0, dy_offset = 0.0;
   if (isTouch) {
      dx_offset = dx_offset_touch / devicePixelRatio;
      dy_offset = dz_offset_touch / devicePixelRatio;
   }

   let xo = ev.offsetX + dx_offset
   let yo = ev.offsetY + dy_offset

   if (buttons_control.pick_element) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      delete_element(xc, zc);

   } else if (buttons_control.select_element) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      select_element(xc, zc);

   } else if (buttons_control.select_node) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      select_node(xc, zc);


   } else if (buttons_control.elementlast_eingabe_aktiv) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      add_elementlast(xc, zc);
   }
   else if (buttons_control.cad_eingabe_aktiv) {
      if (buttons_control.input_started === 0) {

         let xc = tr.xWorld(xo);
         let zc = tr.zWorld(yo);

         // find next CAD node

         let index = find_nearest_cad_node(xc, zc);
         //console.log("mouseup, index", index, xc, zc)
         if (index > -1) {
            let x = get_cad_node_X(index);
            let z = get_cad_node_Z(index);
            nodePoint = two.makeRoundedRectangle(
               tr.xPix(x),
               tr.zPix(z),
               15 / devicePixelRatio,
               15 / devicePixelRatio,
               4
            );
            nodePoint.fill = '#001111';
            foundNodePoint = true;
            start_x = tr.xPix(x);
            start_y = tr.zPix(z);
            start_x_wc = x;
            start_z_wc = z;
            if (buttons_control.stab_eingabe_aktiv) set_help_text('Stabende eingeben');
            else if (buttons_control.messen_aktiv) set_help_text('zweiten Punkt picken');
            else if (buttons_control.bemassung_aktiv) set_help_text('zweiten Knoten picken');
         } else {
            if (buttons_control.bemassung_aktiv) {
               alertdialog('ok', 'keinen Knoten gepickt');
               //buttons_control.input_started = 0;
               return;
            }
            let gefunden = findNextRasterPoint(xc, zc);
            if (gefunden) {
               rasterPoint = two.makeRectangle(
                  tr.xPix(xRasterPoint),
                  tr.zPix(zRasterPoint),
                  5,
                  5
               );
               rasterPoint.fill = '#0000ff';
               rasterPoint.stroke = '#0000ff';
               foundRasterPoint = true;

               start_x = tr.xPix(xRasterPoint);
               start_y = tr.zPix(zRasterPoint);
               start_x_wc = xRasterPoint;
               start_z_wc = zRasterPoint;
            } else {
               start_x = xo;
               start_y = yo;
               start_x_wc = xc;
               start_z_wc = zc;
            }
            if (buttons_control.stab_eingabe_aktiv) set_help_text('Stabende eingeben');
            else if (buttons_control.messen_aktiv) set_help_text('zweiten Punkt picken');
            else if (buttons_control.bemassung_aktiv) set_help_text('zweiten Knoten picken');
         }
         input_active = true;
         buttons_control.input_started = 1;

         if (buttons_control.n_input_points === 1) {
            if (buttons_control.lager_eingabe_aktiv) {

               let node = new TNode();
               node.x = start_x_wc;
               node.z = start_z_wc;
               read_lager_dialog(node);
               console.log('pendown, node', node);

               let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
               if (index1 > -1) {
                  // Überprüfe, ob Knoten schon Lager hat
                  let vorhanden = check_doppeltes_Lager(index1)
                  if (vorhanden) {
                     alertdialog('ok', 'Knoten hat schon ein Lager');
                  }
                  else {
                     let group: any;
                     const el = new TCAD_Lager(group, index1, node, buttons_control.typ_cad_element);
                     list.append(el);
                     add_element_nodes(index1);
                     group = draw_lager(tr, el);
                     two.add(group);
                     el.setTwoObj(group)
                     two.update();
                  }
               } else {
                  console.log('Keinen Knoten gefunden');
                  alertdialog('ok', 'keinen Knoten gefunden');
               }
            }

            if (buttons_control.knotenlast_eingabe_aktiv) {

               let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
               if (index1 > -1) {
                  let knlast = new TLoads();
                  read_knotenlast_dialog(knlast);
                  const el = new TCAD_Knotenlast(null, index1, knlast, buttons_control.typ_cad_element);

                  let group = draw_knotenlast(tr, el, index1, 1, 0, true);
                  el.setTwoObj(group)
                  two.add(group);
                  //console.log('getBoundingClientRect', group.getBoundingClientRect());
                  list.append(el);
                  add_element_nodes(index1);
                  two.update();
               } else {
                  console.log('Keinen Knoten gefunden');
                  alertdialog('ok', 'keinen Knoten gefunden');
               }
            }
            else if (buttons_control.knotenmasse_eingabe_aktiv) {

               let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
               if (index1 > -1) {
                  let vorhanden = check_doppelte_Masse(index1)
                  if (vorhanden) {
                     alertdialog('ok', 'Knoten hat schon eine Knotenmasse');
                  }
                  else {
                     let masse = new TMass();
                     read_knotenmasse_dialog(masse);
                     let group = draw_knotenmasse(tr, masse, get_cad_node_X(index1), get_cad_node_Z(index1));
                     two.add(group);
                     two.update();
                     console.log('getBoundingClientRect', group.getBoundingClientRect());
                     const el = new TCAD_Knotenmasse(group, index1, masse, buttons_control.typ_cad_element);
                     list.append(el);
                     add_element_nodes(index1);
                  }
               } else {
                  console.log('Keinen Knoten gefunden');
                  alertdialog('ok', 'keinen Knoten gefunden');
               }
            }
            buttons_control.input_started = 0;
            input_active = false;
            rubberband_drawn = false;
         }
      }
   }
}

//--------------------------------------------------------------------------------------------------------
function check_doppeltes_Lager(index1: number): boolean {
   //-----------------------------------------------------------------------------------------------------

   for (let i = 0; i < list.size; i++) {
      let obj = list.getAt(i) as TCAD_Lager;
      if (obj.elTyp === CAD_LAGER) {
         if (obj.index1 === index1) {
            return true
            break;
         }
      }
   }
   return false;
}

//--------------------------------------------------------------------------------------------------------
function check_doppelte_Masse(index1: number): boolean {
   //-----------------------------------------------------------------------------------------------------

   for (let i = 0; i < list.size; i++) {
      let obj = list.getAt(i) as TCAD_Knotenmasse;
      if (obj.elTyp === CAD_KNMASSE) {
         if (obj.index1 === index1) {
            return true
            break;
         }
      }
   }
   return false;
}

//-------------------------------------------------------------------------------------------------------
function mousedown(ev: any) {
   //----------------------------------------------------------------------------------------------------

   //console.log('in mousedown', ev.button);
   ev.preventDefault();

   // if (!mouseMoveIsActive) {
   //domElement.addEventListener('mousemove', mousemove, false);
   //     mouseMoveIsActive = true
   // }
   if ((ev.button === 1) || (ev.button === 0 && !buttons_control.cad_eingabe_aktiv)) {
      if (allow_pan_cad) {
         zoomIsActive = true;

         mouseOffsetX = ev.offsetX;
         mouseOffsetY = ev.offsetY;

         mouseDx = 0.0;
         mouseDz = 0.0;
      }
   }

   //console.log("mouse_DownWX", mouse_DownWX, mouse_DownWY)

   //input_active = true
   // input_x = ev.offsetX
   // input_y = ev.offsetY
   // console.log("input mouse", input_x, input_y)
   // if (buttons_control.input_started === 0) {
   //     buttons_control.input_started = 1;
   // }
}

//--------------------------------------------------------------------------------------------------------
function mousemove(ev: MouseEvent) {
   //----------------------------------------------------------------------------------------------------

   // console.log('**********************************')
   // console.log('in mousemove', ev.movementX, ev.movementY, ev.offsetX, ev.offsetY, rubberband_drawn, buttons_control.input_started)
   // console.log('**********************************')

   ev.preventDefault();

   // console.log("ev.offset", ev.offsetX, ev.offsetY);
   //console.log("move", ev.button, zoomIsActive, ev.movementX, ev.movementY, ev.offsetX - mouseOffsetX, ev.offsetY - mouseOffsetY)

   if (zoomIsActive) {  // mittlere Maustaste gedrückt
      mouseDx += ev.offsetX - mouseOffsetX
      mouseDz += ev.offsetY - mouseOffsetY
      centerX = centerX_last + tr.World0(mouseDx)
      centerY = centerY_last + tr.World0(mouseDz)
      //console.log("move", ev.movementX, ev.movementY, ev.offsetX - mouseOffsetX, ev.offsetY - mouseOffsetY)
      // two.translation.set(mouseDx,mouseDz)
      mouseOffsetX = ev.offsetX
      mouseOffsetY = ev.offsetY
      // two.update();
      init_cad(2)
   }
   else {

      let dx_offset = 0.0, dy_offset = 0.0;
      if (isTouch) {
         dx_offset = dx_offset_touch / devicePixelRatio;
         dy_offset = dz_offset_touch / devicePixelRatio;
      }
      let xo = ev.offsetX + dx_offset
      let yo = ev.offsetY + dy_offset

      if (cursorLineh) two.remove(cursorLineh);
      if (cursorLinev) two.remove(cursorLinev);



      if (foundSelectNode) {
         two.remove(selectNode);
         foundSelectNode = false;
      }

      //if (buttons_control.cad_eingabe_aktiv || buttons_control.select_node) {
      //if (buttons_control.cad_eingabe_aktiv || buttons_control.pick_element || buttons_control.select_element || buttons_control.select_node) {
      let len = tr.Pix0(fangweite_cursor);
      cursorLineh = two.makeLine(xo - len, yo, xo + len, yo);
      cursorLinev = two.makeLine(xo, yo - len, xo, yo + len);
      // }

      if (buttons_control.cad_eingabe_aktiv) {

         if (rubberband_drawn) {
            two.remove(rubberband);
         }
         if (foundRasterPoint) {
            two.remove(rasterPoint);
            foundRasterPoint = false;
         }
         if (foundNodePoint) {
            two.remove(nodePoint);
            foundNodePoint = false;
         }

         if (buttons_control.input_started === 1) {
            rubberband = new Two.Group();
            let band = new Two.Line(start_x, start_y, xo, yo);
            band.linewidth = 1; /// devicePixelRatio;
            band.dashes = [2, 2];
            rubberband.add(band);

            let dx = xo - start_x
            let dy = yo - start_y
            let sl = Math.sqrt(dx * dx + dy * dy)

            let sinus = dy / sl;
            let cosinus = dx / sl;
            let alpha = Math.atan2(dy, dx)

            let xm = (xo + start_x) / 2. + (sinus * 11 + cosinus * 1) // devicePixelRatio  war 17
            let zm = (yo + start_y) / 2. - (cosinus * 11 - sinus * 1) // devicePixelRatio

            let str = 'L=' + myFormat(tr.World0(sl), 2, 2) + 'm'
            const txt1 = two.makeText(str, xm, zm, style_txt)
            txt1.fill = '#000000'
            txt1.alignment = 'center'
            txt1.baseline = 'middle'
            txt1.rotation = alpha
            rubberband.add(txt1);

            two.add(rubberband);

            rubberband_drawn = true;
         }
         else if (buttons_control.input_started === 2) {
            rubberband = new Two.Group();
            let band = new Two.Line(start_x, start_y, xo, yo);
            band.linewidth = 1; /// devicePixelRatio;
            band.dashes = [2, 2];
            rubberband.add(band);
            two.add(rubberband);

            rubberband_drawn = true;
         }

         if (txt_mouseCoord) {
            two.remove(txt_mouseCoord);
         }
         let xc = tr.xWorld(xo);
         let zc = tr.zWorld(yo);
         let txt = 'x: ' + myFormat(xc, 2, 2) + ' | z: ' + myFormat(zc, 2, 2);
         txt_mouseCoord = two.makeText(
            txt,
            two.width - 100,
            two.height - 20,
            style_txt
         );
         txt_mouseCoord.fill = '#000000';
         txt_mouseCoord.baseline = 'middle';
         txt_mouseCoord.alignment = 'left';

         // find next CAD node

         let index = find_nearest_cad_node(xc, zc);
         if (index > -1) {
            nodePoint = two.makeRoundedRectangle(tr.xPix(get_cad_node_X(index)), tr.zPix(get_cad_node_Z(index)), 15 / devicePixelRatio, 15 / devicePixelRatio, 4);
            nodePoint.fill = '#001111';
            foundNodePoint = true;
            xNodePoint = get_cad_node_X(index);
            zNodePoint = get_cad_node_Z(index);
         } else {
            // if (rubberband_drawn) {
            let gefunden = findNextRasterPoint(xc, zc);
            if (gefunden) {
               rasterPoint = two.makeRectangle(tr.xPix(xRasterPoint), tr.zPix(zRasterPoint), 5, 5);
               rasterPoint.fill = '#0000ff';
               rasterPoint.stroke = '#0000ff';
               foundRasterPoint = true;
            }
         }
      }
      else if (buttons_control.select_node) {
         // Elementknoten finden

         let xc = tr.xWorld(xo);
         let zc = tr.zWorld(yo);

         let index = find_nearest_cad_node(xc, zc);
         if (index > -1) {
            selectNode = two.makeRoundedRectangle(tr.xPix(get_cad_node_X(index)), tr.zPix(get_cad_node_Z(index)), 15 / devicePixelRatio, 15 / devicePixelRatio, 4);
            foundSelectNode = true;
         }

      }
      two.update();
   }
}

//--------------------------------------------------------------------------------------------------------
function mouseup(ev: any) {
   //----------------------------------------------------------------------------------------------------

   //console.log('in mouseup', ev.button);
   ev.preventDefault();

   zoomIsActive = false;

   centerX_last = centerX;
   centerY_last = centerY;

   let dx_offset = 0.0, dy_offset = 0.0;
   if (isTouch) {
      dx_offset = dx_offset_touch / devicePixelRatio;
      dy_offset = dz_offset_touch / devicePixelRatio;
   }

   let xo = ev.offsetX + dx_offset
   let yo = ev.offsetY + dy_offset

   if (buttons_control.pick_element) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      delete_element(xc, zc);

   } else if (buttons_control.select_element) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      select_element(xc, zc);

   } else if (buttons_control.select_node) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      select_node(xc, zc);

   } else if (buttons_control.elementlast_eingabe_aktiv) {
      let xc = tr.xWorld(xo);
      let zc = tr.zWorld(yo);

      add_elementlast(xc, zc);

   }
   else if (buttons_control.cad_eingabe_aktiv) {
      if (ev.button === 0 || isPen || isTouch) {
         // Linker Mausbutton
         if (buttons_control.input_started === 0) {

            if (foundRasterPoint) {
               two.remove(rasterPoint);
               foundRasterPoint = false;
            }
            if (foundNodePoint) {
               two.remove(nodePoint);
               foundNodePoint = false;
            }
            let xc = tr.xWorld(xo);
            let zc = tr.zWorld(yo);
            // find next CAD node

            let index = find_nearest_cad_node(xc, zc);
            // console.log('mouseup, index', index, xc, zc);
            if (index > -1) {
               let x = get_cad_node_X(index);
               let z = get_cad_node_Z(index);
               nodePoint = two.makeRoundedRectangle(tr.xPix(x), tr.zPix(z), 15 / devicePixelRatio, 15 / devicePixelRatio, 4);
               nodePoint.fill = '#001111';
               foundNodePoint = true;
               start_x = tr.xPix(x);
               start_y = tr.zPix(z);
               start_x_wc = x;
               start_z_wc = z;
               if (buttons_control.stab_eingabe_aktiv) set_help_text('Stabende eingeben');
               else if (buttons_control.messen_aktiv) set_help_text('zweiten Punkt picken');
               else if (buttons_control.bemassung_aktiv) set_help_text('zweiten Knoten picken');
            } else {
               if (buttons_control.bemassung_aktiv) {
                  alertdialog('ok', 'keinen Knoten gepickt');
                  //buttons_control.input_started = 0;
                  return;
               }
               let gefunden = findNextRasterPoint(xc, zc);
               if (gefunden) {
                  rasterPoint = two.makeRectangle(
                     tr.xPix(xRasterPoint),
                     tr.zPix(zRasterPoint),
                     5,
                     5
                  );
                  rasterPoint.fill = '#0000ff';
                  rasterPoint.stroke = '#0000ff';
                  foundRasterPoint = true;
                  start_x = tr.xPix(xRasterPoint);
                  start_y = tr.zPix(zRasterPoint);
                  start_x_wc = xRasterPoint;
                  start_z_wc = zRasterPoint;
               } else {
                  start_x = xo;
                  start_y = yo;
                  start_x_wc = xc;
                  start_z_wc = zc;
               }
               if (buttons_control.stab_eingabe_aktiv) set_help_text('Stabende eingeben');
               else if (buttons_control.messen_aktiv) set_help_text('zweiten Punkt picken');
               else if (buttons_control.bemassung_aktiv) set_help_text('zweiten Knoten picken');
            }
            input_active = true;
            buttons_control.input_started = 1;

            if (buttons_control.n_input_points === 1) {
               if (buttons_control.lager_eingabe_aktiv) {
                  //let group=two.makeRectangle(start_x,start_y,20,20);
                  let node = new TNode();
                  // node.L_org[0] = 1
                  // node.L_org[1] = 1
                  node.x = start_x_wc;
                  node.z = start_z_wc;
                  read_lager_dialog(node);

                  let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
                  if (index1 > -1) {
                     // Überprüfe, ob Knoten schon Lager hat
                     let vorhanden = check_doppeltes_Lager(index1)
                     if (vorhanden) {
                        alertdialog('ok', 'Knoten hat schon ein Lager');
                     }
                     else {

                        let group: any;
                        const el = new TCAD_Lager(group, index1, node, buttons_control.typ_cad_element);
                        list.append(el);
                        add_element_nodes(index1);
                        group = draw_lager(tr, el);
                        two.add(group);
                        el.setTwoObj(group);
                        two.update();
                     }
                  } else {
                     alertdialog('ok', 'keinen Knoten gefunden');
                  }
               }
               else if (buttons_control.knotenlast_eingabe_aktiv) {

                  let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
                  if (index1 > -1) {
                     let knlast = new TLoads();
                     read_knotenlast_dialog(knlast);
                     const el = new TCAD_Knotenlast(null, index1, knlast, buttons_control.typ_cad_element);

                     let group = draw_knotenlast(tr, el, index1, 1, 0, true);
                     two.add(group);
                     //console.log('getBoundingClientRect', group.getBoundingClientRect());
                     el.setTwoObj(group)
                     list.append(el);
                     add_element_nodes(index1);
                     two.update();
                  } else {
                     alertdialog('ok', 'keinen Knoten gefunden');
                  }
               }
               else if (buttons_control.knotenmasse_eingabe_aktiv) {
                  //console.log("Knotenmasse eingabe aktiv")

                  let index1 = find_nearest_cad_node(start_x_wc, start_z_wc);
                  if (index1 > -1) {
                     let vorhanden = check_doppelte_Masse(index1)
                     if (vorhanden) {
                        alertdialog('ok', 'Knoten hat schon eine Knotenmasse');
                     }
                     else {
                        let masse = new TMass();
                        read_knotenmasse_dialog(masse);
                        let group = draw_knotenmasse(tr, masse, get_cad_node_X(index1), get_cad_node_Z(index1));
                        two.add(group);
                        two.update();
                        //console.log('getBoundingClientRect', group.getBoundingClientRect());
                        const el = new TCAD_Knotenmasse(group, index1, masse, buttons_control.typ_cad_element);
                        list.append(el);
                        add_element_nodes(index1);
                     }
                  } else {
                     alertdialog('ok', 'keinen Knoten gefunden');
                  }
               }


               buttons_control.input_started = 0;
               input_active = false;
               rubberband_drawn = false;
            }
         } else if (buttons_control.input_started === 1) {          // Eingabe Stabende
            two.remove(rubberband);
            rubberband_drawn = false;

            if (foundNodePoint) {
               end_x_wc = xNodePoint;
               end_z_wc = zNodePoint;

               two.remove(nodePoint);
               foundNodePoint = false;
            } else {
               if (buttons_control.bemassung_aktiv) {
                  alertdialog('ok', 'keinen Knoten gepickt');
                  return;
               }
               if (foundRasterPoint) {
                  end_x_wc = xRasterPoint;
                  end_z_wc = zRasterPoint;

                  two.remove(rasterPoint);
                  foundRasterPoint = false;
               } else {
                  end_x_wc = tr.xWorld(xo);
                  end_z_wc = tr.zWorld(yo);
               }
            }

            if (buttons_control.n_input_points === 2) {
               buttons_control.input_started = 0;
               input_active = false;
            }

            if (buttons_control.stab_eingabe_aktiv) {

               let group = null;

               // Überprüfe Stablänge
               let dx = end_x_wc - start_x_wc
               let dz = end_z_wc - start_z_wc
               let sl = Math.sqrt(dx * dx + dz * dz)
               if (sl > 0.001) {
                  let index1 = add_cad_node(start_x_wc, start_z_wc, 1);
                  let index2 = add_cad_node(end_x_wc, end_z_wc, 1);
                  add_element_nodes(index1);
                  add_element_nodes(index2);
                  const obj = new TCAD_Stab(group, index1, index2, default_querschnitt, buttons_control.typ_cad_element);
                  list.append(obj);

                  group = drawStab(obj, tr);
                  two.add(group);
                  two.update();

                  obj.setTwoObj(group)
               }
               else {
                  alertdialog('ok', 'Stablänge zu klein = ' + sl + 'm');
               }
               set_help_text('Stabanfang eingeben');
            }
            else if (buttons_control.messen_aktiv) {
               let dx = end_x_wc - start_x_wc
               let dz = end_z_wc - start_z_wc
               let sl = Math.sqrt(dx * dx + dz * dz)
               //console.log("Abstand zwischen den 2 Punkten beträgt = ", sl)

               const el = document.getElementById("id_dialog_messen") as drDialogMessen;
               el.set_dxdz(dx, dz);
               showDialog_messen();

               set_help_text('ersten Punkt picken');

            }
            else if (buttons_control.bemassung_aktiv) {
               set_help_text('Masslinienpunkt picken');
               buttons_control.input_started = 2;
            }

         }
         else if (buttons_control.input_started === 2) {

            if (foundNodePoint) {
               pkt3_x_wc = xNodePoint;
               pkt3_z_wc = zNodePoint;

               two.remove(nodePoint);
               foundNodePoint = false;
            }
            else if (foundRasterPoint) {
               pkt3_x_wc = xRasterPoint;
               pkt3_z_wc = zRasterPoint;

               two.remove(rasterPoint);
               foundRasterPoint = false;
            } else {
               pkt3_x_wc = tr.xWorld(xo);
               pkt3_z_wc = tr.zWorld(yo);
            }

            if (buttons_control.bemassung_aktiv) {
               set_help_text('ersten Knoten picken');
               let index1 = add_cad_node(start_x_wc, start_z_wc, 1);
               let index2 = add_cad_node(end_x_wc, end_z_wc, 1);
               //console.log("Bemassung index1-2", index1, index2)
               let group = add_bemassung(tr, index1, index2, pkt3_x_wc, pkt3_z_wc, buttons_control.art);
               two.add(group);
               two.update();
            }

            if (buttons_control.n_input_points === 3) {

               buttons_control.input_started = 0;
               input_active = false;
            }

         }
      }
   }
}

//------------------------------------------------------------------------------------------------
export function keydown(ev: any) {
   //--------------------------------------------------------------------------------------------

   //console.log('KEYDOWN ' + ev.target.type + ' | ' + ev);

   //console.log('KEYDOWN, keycode, key, code: ', ev.keyCode, ev.key, ev.code);

   if (ev.key === 'Escape') {
      if (rubberband_drawn) {
         two.remove(rubberband);
         two.update();
      }
      input_active = false;
      rubberband_drawn = false;
      buttons_control.input_started = 0;
      delete_help_text();
   }
}

// --------------------------  T O U C H  T O U C H  T O U C H  T O U C H  T O U C H  --------------------
//--------------------------------------------------------------------------------------------------------
function touchstart(ev: TouchEvent) {
   //----------------------------------------------------------------------------------------------------

   ev.preventDefault();

   //     if (isPen) return;

   //     console.log("in touchstart " + ev.touches.length + " | " + buttons_control.input_started)
   //     if (ev.touches.length === 1) {
   //         if (buttons_control.input_started === 0) {
   //             input_active = true
   //             buttons_control.input_started = 1
   //             touchstart_x = ev.touches[0].clientX
   //             touchstart_y = ev.touches[0].clientY - grafik_top
   //         }
   //     }
}

//--------------------------------------------------------------------------------------------------------
// function myTouchStart(ev: PointerEvent) {
//----------------------------------------------------------------------------------------------------

// console.log("myPointerEvent", ev)
// ev.preventDefault();

//     if (isPen) return;

//     if (cad_eingabe_aktiv) {

//         if (buttons_control.input_started === 0) {
//             input_active = true
//             buttons_control.input_started = 1

//             let xc = tr.xWorld(ev.offsetX)
//             let zc = tr.zWorld(ev.offsetY)
//             let gefunden = findNextRasterPoint(xc, zc)
//             if (gefunden) {
//                 rasterPoint = two.makeRectangle(tr.xPix(xRasterPoint), tr.zPix(zRasterPoint), 5, 5);
//                 rasterPoint.fill = '#0000ff';
//                 rasterPoint.stroke = "#0000ff";
//                 foundRasterPoint = true;
//                 touchstart_x = tr.xPix(xRasterPoint)
//                 touchstart_y = tr.zPix(zRasterPoint)
//                 start_x_wc = xRasterPoint
//                 start_z_wc = zRasterPoint
//             } else {
//                 touchstart_x = ev.offsetX
//                 touchstart_y = ev.offsetY
//                 start_x_wc = xc
//                 start_z_wc = zc
//             }
//         }
//     }

// }

//--------------------------------------------------------------------------------------------------------
function touchend(ev: TouchEvent) {
   //----------------------------------------------------------------------------------------------------
   //console.log('in touchend', ev.touches.length);
   //write("in touchend " + ev.touches.length + " | " + buttons_control.input_started);

   ev.preventDefault();
   //     if (isPen) return;

   //     // if (ev.touches.length === 0) {
   //     //     if (buttons_control.input_started === 1) {
   //     input_active = false
   //     buttons_control.input_started = 0
   //     //write("touchstart_x_y " + touchstart_x + " | " + touchstart_y);

   //     //write("touchend_x_y " + touchend_x + " | " + touchend_y);
   //     let line1 = two.makeLine(touchstart_x, touchstart_y, touchend_x, touchend_y);
   //     line1.linewidth = 2 /// devicePixelRatio;

   //     two.update();
   //     //     }
   //     // }
}

// //--------------------------------------------------------------------------------------------------------
function touchmove(ev: TouchEvent) {
   //----------------------------------------------------------------------------------------------------

   ev.preventDefault();
   //     if (isPen) return;

   //     //console.log("in touchmove", ev);

   //     touchend_x = ev.touches[0].clientX;
   //     touchend_y = ev.touches[0].clientY - grafik_top;
}

//------------------------------------------------------------------------------------------------
function drawRaster() {
   //---------------------------------------------------------------------------------------------

   const color = '#aaaaaa';

   // let size = 3 / devicePixelRatio;

   let nx = Math.abs(raster_xmax - raster_xmin) / raster_dx;
   let nz = Math.abs(raster_zmax - raster_zmin) / raster_dz;
   if (nx > 1000 || nz > 1000) return;

   let raster_xmin_pix = tr.xPix(raster_xmin);
   let raster_xmax_pix = tr.xPix(raster_xmax);
   let raster_zmin_pix = tr.zPix(raster_zmin);
   let raster_zmax_pix = tr.zPix(raster_zmax);

   // horizontale Linien

   let zp = 0.0
   while (zp <= raster_zmax) {
      if (zp >= raster_zmin) {
         let zp_pix = tr.zPix(zp)
         let line = two.makeLine(raster_xmin_pix, zp_pix, raster_xmax_pix, zp_pix);
         line.stroke = color;
         line.linewidth = 1;
      }
      zp += raster_dz;
   }

   zp = -raster_dz;
   while (zp >= raster_zmin) {
      if (zp <= raster_zmax) {
         let zp_pix = tr.zPix(zp)
         let line = two.makeLine(raster_xmin_pix, zp_pix, raster_xmax_pix, zp_pix);
         line.stroke = color;
         line.linewidth = 1;
      }
      zp -= raster_dz;
   }

   // vertikale Linien

   let xp = -raster_dx;
   while (xp >= raster_xmin) {
      if (xp <= raster_xmax) {
         let xp_pix = tr.xPix(xp)
         let line = two.makeLine(xp_pix, raster_zmin_pix, xp_pix, raster_zmax_pix);
         line.stroke = color;
         line.linewidth = 1;
      }
      xp -= raster_dx;
   }

   xp = 0.0;
   while (xp <= raster_xmax) {
      if (xp >= raster_xmin) {
         let xp_pix = tr.xPix(xp)
         let line = two.makeLine(xp_pix, raster_zmin_pix, xp_pix, raster_zmax_pix);
         line.stroke = color;
         line.linewidth = 1;
      }
      xp += raster_dx;
   }


   // while (zp <= raster_zmax) {
   //    xp = 0.0;
   //    while (xp <= raster_xmax) {
   //       xg = xp;
   //       zg = zp;
   //       let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
   //       //rechteck.fill = color;
   //       rechteck.stroke = color;
   //       rechteck.linewidth = 1;
   //       //rechteck.nostroke();
   //       xp += raster_dx;
   //    }
   //    zp += raster_dz;
   // }

   // zp = -raster_dz;
   // while (zp >= raster_zmin) {
   //    xp = -raster_dx;
   //    while (xp >= raster_xmin) {
   //       xg = xp;
   //       zg = zp;
   //       let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
   //       //rechteck.fill = color;
   //       rechteck.stroke = color;
   //       rechteck.linewidth = 1;
   //       //rechteck.nostroke();
   //       xp -= raster_dx;
   //    }
   //    zp -= raster_dz;
   // }

   // zp = 0.0;
   // while (zp <= raster_zmax) {
   //    xp = -raster_dx;
   //    while (xp >= raster_xmin) {
   //       xg = xp;
   //       zg = zp;
   //       let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
   //       //rechteck.fill = color;
   //       rechteck.stroke = color;
   //       rechteck.linewidth = 1;
   //       //rechteck.nostroke();
   //       xp -= raster_dx;
   //    }
   //    zp += raster_dz;
   // }

   // zp = -raster_dz;
   // while (zp >= raster_zmin) {
   //    xp = 0.0;
   //    while (xp <= raster_xmax) {
   //       xg = xp;
   //       zg = zp;
   //       let rechteck = two.makeRectangle(tr.xPix(xg), tr.zPix(zg), size, size);
   //       //rechteck.fill = color;
   //       rechteck.stroke = color;
   //       rechteck.linewidth = 1;
   //       //rechteck.nostroke();
   //       xp += raster_dx;
   //    }
   //    zp -= raster_dz;
   // }
}

//-------------------------------------------------------------------------------------------------------
function findNextRasterPoint(xl: number, yl: number) {
   //-------------------------------------------------------------------------------------------------------
   // xl, yl : lokale Koordinaten des Cursors
   let sl2: number, slmin: number, rahm: number, fangweite2: number;
   let x1: number, x2: number, y1: number, y2: number;
   let gefunden = false;

   slmin = 1e30;
   rahm = fangweite_cursor;
   fangweite2 = rahm * rahm;

   if (xl >= 0.0) {
      x1 = Math.trunc(xl / raster_dx) * raster_dx;
      x2 = x1 + raster_dx;
   } else {
      x2 = Math.trunc(xl / raster_dx) * raster_dx;
      x1 = x2 - raster_dx;
   }
   if (yl >= 0.0) {
      y1 = Math.trunc(yl / raster_dz) * raster_dz;
      y2 = y1 + raster_dz;
   } else {
      y2 = Math.trunc(yl / raster_dz) * raster_dz;
      y1 = y2 - raster_dz;
   }

   sl2 = (x1 - xl) * (x1 - xl) + (y1 - yl) * (y1 - yl);
   if (sl2 < fangweite2) {
      if (sl2 < slmin) {
         slmin = sl2;
         xRasterPoint = x1;
         zRasterPoint = y1;
         gefunden = true;
      }
   }
   sl2 = (x2 - xl) * (x2 - xl) + (y1 - yl) * (y1 - yl);
   if (sl2 < fangweite2) {
      if (sl2 < slmin) {
         slmin = sl2;
         xRasterPoint = x2;
         zRasterPoint = y1;
         gefunden = true;
      }
   }
   sl2 = (x2 - xl) * (x2 - xl) + (y2 - yl) * (y2 - yl);
   if (sl2 < fangweite2) {
      if (sl2 < slmin) {
         slmin = sl2;
         xRasterPoint = x2;
         zRasterPoint = y2;
         gefunden = true;
      }
   }
   sl2 = (x1 - xl) * (x1 - xl) + (y2 - yl) * (y2 - yl);
   if (sl2 < fangweite2) {
      if (sl2 < slmin) {
         slmin = sl2;
         xRasterPoint = x1;
         zRasterPoint = y2;
         gefunden = true;
      }
   }

   return gefunden;
}

//-------------------------------------------------------------------------------------------------------
function test_for_cad_element(ev: any) {
   //---------------------------------------------------------------------------------------------------

   console.log('test_for_element');

   let xc = tr.xWorld(ev.offsetX);
   let zc = tr.zWorld(ev.offsetY);

   buttons_control.reset();
   buttons_control.select_element = true;
   delete_help_text();
   set_zoomIsActive(false);
   reset_pointer_length();

   select_element(xc, zc);

}


//-------------------------------------------------------------------------------------------------------
export function draw_cad_knoten() {
   //---------------------------------------------------------------------------------------------------

   console.log('draw_cad_knoten');

   const el = document.getElementById('id_dialog_knoten');
   //console.log('id_dialog_knoten', el);

   //console.log("shadow showDialog_knoten", el?.shadowRoot?.getElementById("dialog_knoten").getValue())

   let ele = document.getElementById('id_dialog_knoten') as drDialogKnoten;
   // console.log('drDialogKnoten', ele.getValueX());
   // console.log('drDialogKnoten', ele.getValueZ());

   let x = ele.getValueX();
   let z = ele.getValueZ();

   let index = add_cad_node(x, z);

   console.log('index draw_cad_knoten ', index);
   if (index === -1) {

      let index1 = CADNodes.length - 1;
      add_element_nodes(index1)

      let group = new Two.Group();

      const obj = new TCAD_Knoten(group, index1, CAD_KNOTEN);
      list.append(obj);

      group = draw_knoten(obj, tr)
      two.add(group)

      two.update();

      obj.setTwoObj(group);

   } else {
      alertdialog('ok', 'Knoten existiert bereits');
   }

}

//--------------------------------------------------------------------------------------------------------
export function reset_cad() {
   //--------------------------------------------------------------------------------------------------------

   mouseDx = 0.0
   mouseDz = 0.0
   wheel_factor = 0.0
   wheel_factor_alt = 0.0
   deltaXY = 0.0
   deltaXY_alt = 0.0

   touchLoop = 0
   mouseCounter = 0;

   centerX = 0.0
   centerY = 0.0
   centerX_last = 0.0
   centerY_last = 0.0

   pointer.length = 0
   zoomIsActive = false

   init_cad(2);

   for (let i = 0; i < CADNodes.length; i++) {
      let x = CADNodes[i].x;
      let z = CADNodes[i].z;
      //console.log("circle nel=", i, CADNodes[i].nel)
      let circle = two.makeCircle(tr.xPix(x), tr.zPix(z), 14, 20)
      circle.fill = 'none'
      if (CADNodes[i].nel === 0) circle.stroke = 'red'
      if (CADNodes[i].nel < 0) circle.stroke = 'blue'
      const txt1 = two.makeText(String(CADNodes[i].nel), tr.xPix(x), tr.zPix(z), style_txt)
      txt1.fill = '#000000'
      txt1.alignment = 'left'
      txt1.baseline = 'bottom'
   }
   two.update();

}
