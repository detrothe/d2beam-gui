import Two from "two.js";
import { CAD_BEMASSUNG, einheit_bemassung, list, select_color, slmax_cad, style_txt, timer } from "./cad"
import { buttons_control, set_help_text } from "./cad_buttons"
import { add_cad_node, add_element_nodes, get_cad_node_X, get_cad_node_Z } from "./cad_node";
import { TCAD_Element } from "./CCAD_element";
import { crossProd } from "./lib";
import { CTrans } from "./trans";
import { myFormat } from "./utility";
import { draw_BoundingClientRect_xz } from "./cad_draw_elemente";


const PARALLEL = 1;
const HORIZONTAL = 2;
const VERTIKAL = 3;

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Bemassung extends TCAD_Element {
  //―――――――――――――――――――――――――――――――――――――――――

  index2 = -1;
  index3 = -1;
  index4 = -1;
  art = -1;
  b = [0, 0, 0];
  hilfslinie = 1;   // 0 = lang 1 = kurz

  x: number[] = Array(4).fill(0.0)   // Weltkoordinaten der gezeichneten Streckenbelastung
  z: number[] = Array(4).fill(0.0)

  constructor(obj: any, index1: number, index2: number, b: number[], elTyp: number) {
    super(obj, index1, elTyp);
    this.className = 'TCAD_Bemassung'
    this.index2 = index2;
    this.b = b;
    console.log("this.b", this.b)
  }

  set_art(art: number) {
    this.art = art;
  }

  set_index3(index3: number) {
    this.index3 = index3;
  }

  set_index4(index4: number) {
    this.index4 = index4;
  }

  set_hilfsline(wert: number) {
    this.hilfslinie = wert;
  }

  get_hilfsline() {
    return this.hilfslinie;
  }

  set_txt_xz(x: number[], z: number[]) {
    for (let i = 0; i < 4; i++) {
      this.x[i] = x[i]
      this.z[i] = z[i]
    }
  }

  get_txt_xz(x: number[], z: number[]) {
    for (let i = 0; i < 4; i++) {
      x[i] = this.x[i]
      z[i] = this.z[i]
    }
  }

}

//--------------------------------------------------------------------------------------------------------
export function add_bemassung(tr: CTrans, index1: number, index2: number, x3: number, z3: number, art: number) {
  //------------------------------------------------------------------------------------------------------

  let group = null;

  add_element_nodes(index1);
  add_element_nodes(index2);

  let b = [0, 0, 0]
  if (art === PARALLEL) {
    calc_abstand(index1, index2, x3, z3, b);
  }
  else if (art === HORIZONTAL) {
    b[0] = 0
    b[1] = z3 - get_cad_node_Z(index1)
    b[2] = 0
  }
  else if (art === VERTIKAL) {
    b[0] = x3 - get_cad_node_X(index1)
    b[1] = 0
    b[2] = 0
  }

  const obj = new TCAD_Bemassung(group, index1, index2, b, buttons_control.typ_cad_element);
  obj.set_art(art);
  list.append(obj);

  group = drawBemassung(obj, tr, true);

  obj.setTwoObj(group);

  return group;
}



//--------------------------------------------------------------------------------------------------------
export function calc_abstand(index1: number, index2: number, x3: number, z3: number, b: number[]) {
  //------------------------------------------------------------------------------------------------------
  const X = 0, Y = 1, Z = 2

  let dx: number, dz: number;

  let x1 = get_cad_node_X(index1)
  let z1 = get_cad_node_Z(index1)
  let x2 = get_cad_node_X(index2)
  let z2 = get_cad_node_Z(index2)
  // let x3 = get_cad_node_X(index3)
  // let z3 = get_cad_node_Z(index3)

  let a = Array(3), c = Array(3), d = Array(3);

  a[X] = dx = x2 - x1;
  a[Y] = dz = z2 - z1;
  a[Z] = 0.0;

  c[X] = x3 - x1;
  c[Y] = z3 - z1;
  c[Z] = 0.0;

  crossProd(a, c, d);     // d = a x c
  crossProd(d, a, b);     // b = d x a

  let aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y] + a[Z] * a[Z]);
  let abstand = Math.sqrt(d[X] * d[X] + d[Y] * d[Y] + d[Z] * d[Z]) / aBetrag;
  let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
  let fac = abstand / bBetrag;
  b[X] *= fac; b[Y] *= fac; b[Z] *= fac;
  console.log("calcParallelPunkt, b:", b[X], b[Y], b[Z], abstand);


}


//--------------------------------------------------------------------------------------------------------
export function recalc_abstand(obj: TCAD_Bemassung) {
  //------------------------------------------------------------------------------------------------------

  if (obj.art === PARALLEL) {

    const X = 0, Y = 1, Z = 2

    let dx: number, dz: number;


    let x1 = get_cad_node_X(obj.index1)
    let z1 = get_cad_node_Z(obj.index1)
    let x2 = get_cad_node_X(obj.index2)
    let z2 = get_cad_node_Z(obj.index2)
    // let x3 = get_cad_node_X(index3)
    // let z3 = get_cad_node_Z(index3)

    let a = Array(3), b = Array(3), c = Array(3), d = Array(3);

    a[X] = dx = x2 - x1;
    a[Y] = dz = z2 - z1;
    a[Z] = 0.0;

    c[X] = obj.b[X]  //x3 - x1;
    c[Y] = obj.b[Y] //z3 - z1;
    c[Z] = 0.0;

    crossProd(a, c, d);     // d = a x c
    crossProd(d, a, b);     // b = d x a

    //let aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y] + a[Z] * a[Z]);
    //let abstand = Math.sqrt(d[X] * d[X] + d[Y] * d[Y] + d[Z] * d[Z]) / aBetrag;
    let abstand = Math.sqrt(obj.b[X] * obj.b[X] + obj.b[Y] * obj.b[Y]);
    let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
    let fac = abstand / bBetrag;
    b[X] *= fac; b[Y] *= fac; b[Z] *= fac;
    obj.b[X] = b[X]; obj.b[Y] = b[Y];
    console.log("calcParallelPunkt, b:", b[X], b[Y], b[Z], Math.sqrt(obj.b[X] * obj.b[X] + obj.b[Y] * obj.b[Y]));
  }

}



//--------------------------------------------------------------------------------------------------------
export function drawBemassung(obj: TCAD_Bemassung, tr: CTrans, save = false) {
  //------------------------------------------------------------------------------------------------------

  const X = 0, Y = 1, Z = 2
  let p1xNew = 0, p1yNew = 0, p1zNew = 0, p2xNew = 0, p2yNew = 0, p2zNew = 0
  let pe1x = 0, pe1y = 0, pe2x = 0, pe2y = 0
  let pa1x = 0, pa1y = 0, pa1z = 0, pa2x = 0, pa2y = 0, pa2z = 0
  let dx = 0, dz = 0
  let dsl = 0, sinus = 0, cosinus = 0, alpha = 0

  let art = obj.art;

  let ueberstand = slmax_cad / 120;
  let m_strich = obj.get_hilfsline();

  let x1 = get_cad_node_X(obj.index1)
  let z1 = get_cad_node_Z(obj.index1)
  let x2 = get_cad_node_X(obj.index2)
  let z2 = get_cad_node_Z(obj.index2)

  dx = x2 - x1;
  dz = z2 - z1;

  if (art === PARALLEL) {

    let b = [0, 0, 0];
    b[X] = obj.b[X]
    b[Y] = obj.b[Y]

    // let a = Array(3), b = Array(3), c = Array(3), d = Array(3);

    // a[X] = dx = x2 - x1;
    // a[Y] = dz = z2 - z1;
    // a[Z] = 0.0;

    // c[X] = x3 - x1;
    // c[Y] = z3 - z1;
    // c[Z] = 0.0;

    // crossProd(a, c, d);     // d = a x c
    // crossProd(d, a, b);     // b = d x a

    // let aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y] + a[Z] * a[Z]);
    // let abstand = Math.sqrt(d[X] * d[X] + d[Y] * d[Y] + d[Z] * d[Z]) / aBetrag;
    // let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
    // let fac = abstand / bBetrag;
    // b[X] *= fac; b[Y] *= fac; b[Z] *= fac;
    // console.log("calcParallelPunkt, b:", b[X], b[Y], b[Z], abstand);

    p1xNew = x1 + b[X];
    p1yNew = z1 + b[Y];
    p1zNew = 0 + b[Z];
    p2xNew = x2 + b[X];
    p2yNew = z2 + b[Y];
    p2zNew = 0 + b[Z];
    //console.log("p12", p1xNew, p1yNew, p1zNew, p2xNew, p2yNew, p2zNew)

    let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
    let fac = ueberstand / bBetrag;
    b[X] *= fac; b[Y] *= fac; b[Z] *= fac;

    pe1x = p1xNew + b[X];
    pe1y = p1yNew + b[Y];
    pe2x = p2xNew + b[X];
    pe2y = p2yNew + b[Y];

    if (m_strich == 0) {
      pa1x = x1 + b[X], pa1y = z1 + b[Y], pa1z = 0 + b[Z];
      pa2x = x2 + b[X], pa2y = z2 + b[Y], pa2z = 0 + b[Z];
    } else {
      pa1x = p1xNew - b[X], pa1y = p1yNew - b[Y], pa1z = p1zNew - b[Z];
      pa2x = p2xNew - b[X], pa2y = p2yNew - b[Y], pa2z = p2zNew - b[Z];
    }

    dsl = Math.sqrt(dx * dx + dz * dz);
    sinus = dz / dsl;
    cosinus = dx / dsl;
    alpha = Math.atan2(dz, dx)

  }
  else if (art === HORIZONTAL) {

    p1xNew = x1; p1yNew = obj.b[Y] + z1; p1zNew = 0;
    p2xNew = x2; p2yNew = obj.b[Y] + z1; p2zNew = 0;

    let vorzeichen = Math.abs(obj.b[Y] + z1 - z1) / (obj.b[Y] + z1 - z1);

    pe1x = p1xNew; pe1y = p1yNew + vorzeichen * ueberstand;
    pe2x = p2xNew; pe2y = p2yNew + vorzeichen * ueberstand;


    if (m_strich == 0) {
      pa1x = x1; pa1y = z1 + 2.0 * vorzeichen * ueberstand;
      pa2x = x2; pa2y = z2 + 2.0 * vorzeichen * ueberstand;
    } else {
      pa1x = x1; pa1y = p1yNew - vorzeichen * ueberstand;
      pa2x = x2; pa2y = p1yNew - vorzeichen * ueberstand;
    }
    dsl = Math.abs(dx);
    cosinus = 1

  }
  else if (art === VERTIKAL) {

    p1xNew = obj.b[X] + x1; p1yNew = z1; p1zNew = 0;
    p2xNew = obj.b[X] + x1; p2yNew = z2; p2zNew = 0;

    let vorzeichen = Math.abs(obj.b[X] + x1 - x1) / (obj.b[X] + x1 - x1);

    pe1x = p1xNew + vorzeichen * ueberstand; pe1y = p1yNew;
    pe2x = p2xNew + vorzeichen * ueberstand; pe2y = p2yNew;

    if (m_strich == 0) {
      pa1x = x1 + 2.0 * vorzeichen * ueberstand; pa1y = z1;
      pa2x = x2 + 2.0 * vorzeichen * ueberstand; pa2y = z2;
    } else {
      pa1x = p1xNew - vorzeichen * ueberstand; pa1y = z1;
      pa2x = p2xNew - vorzeichen * ueberstand; pa2y = z2;
    }
    dsl = Math.abs(dz);
    sinus = 1;
    alpha = -Math.PI / 2.0
  }

  if (save) {   // neue Eingabe
    let index = add_cad_node(p1xNew, p1yNew, 1);
    add_element_nodes(index);
    obj.set_index3(index);

    index = add_cad_node(p2xNew, p2yNew, 1);
    add_element_nodes(index);
    obj.set_index4(index);
  }

  //console.log("pae12", pa1x, pa1y, pa1z, pa2x, pa2y, pa2z)

  let group = new Two.Group();


  let line = new Two.Line(tr.xPix(p1xNew), tr.zPix(p1yNew), tr.xPix(p2xNew), tr.zPix(p2yNew));
  line.linewidth = 2 / devicePixelRatio;
  if (timer.element_selected) {
    line.stroke = select_color;
    line.linewidth = 3;
  }
  group.add(line);

  let circle = new Two.Circle(tr.xPix(p1xNew), tr.zPix(p1yNew), 5 / devicePixelRatio, 6)
  circle.fill = 'black'
  group.add(circle);

  circle = new Two.Circle(tr.xPix(p2xNew), tr.zPix(p2yNew), 5 / devicePixelRatio, 6)
  circle.fill = 'black'
  group.add(circle);

  line = new Two.Line(tr.xPix(pa1x), tr.zPix(pa1y), tr.xPix(pe1x), tr.zPix(pe1y));
  line.linewidth = 1 / devicePixelRatio;
  group.add(line);

  line = new Two.Line(tr.xPix(pa2x), tr.zPix(pa2y), tr.xPix(pe2x), tr.zPix(pe2y));
  line.linewidth = 1 / devicePixelRatio;
  group.add(line);

  let grp = new Two.Group();

  let xm = tr.xPix((p1xNew + p2xNew) / 2) + (sinus * 11 + cosinus * 1) // devicePixelRatio  war 17
  let zm = tr.zPix((p1yNew + p2yNew) / 2) - (cosinus * 11 - sinus * 1)

  let str = '';
  if (einheit_bemassung === 'm') str = myFormat(dsl, 1, 3) + 'm';
  else if (einheit_bemassung === 'cm') str = myFormat(dsl * 100, 0, 3) + 'cm';
  else if (einheit_bemassung === 'mm') str = myFormat(dsl * 1000, 0, 3) + 'mm';

  const txt1 = new Two.Text(str, xm, zm, style_txt)
  txt1.fill = '#000000'
  txt1.alignment = 'center'
  txt1.baseline = 'middle'
  if (timer.element_selected) txt1.stroke = select_color;

  txt1.rotation = alpha
  grp.add(txt1);

  let xtr = Array(4), ztr = Array(4)
  let rect = grp.getBoundingClientRect()

  xtr[0] = tr.xWorld(rect.left)
  ztr[0] = tr.zWorld(rect.top)
  xtr[1] = tr.xWorld(rect.left)
  ztr[1] = tr.zWorld(rect.bottom)
  xtr[2] = tr.xWorld(rect.left + rect.width)
  ztr[2] = tr.zWorld(rect.bottom)
  xtr[3] = tr.xWorld(rect.left + rect.width)
  ztr[3] = tr.zWorld(rect.top);

  obj.set_txt_xz(xtr, ztr)   // Koordinaten merken für Picken

  if (buttons_control.show_boundingRect) group.add(draw_BoundingClientRect_xz(tr, xtr, ztr))

  group.add(grp)

  return group;

}






//------------------------------------------------------------------------------------------------------
export function Bemassung_button(art: number) {
  //----------------------------------------------------------------------------------------------------

  console.log("in Bemassung_button")

  if (buttons_control.bemassung_parallel_aktiv && art === 1) {
    buttons_control.reset(0)
  } else if (buttons_control.bemassung_horizontal_aktiv && art === 2) {
    buttons_control.reset(0)
  } else if (buttons_control.bemassung_vertikal_aktiv && art === 3) {
    buttons_control.reset(0)
  } else {
    buttons_control.reset(0)
    //  el.style.backgroundColor = 'darkRed'
    buttons_control.bemassung_aktiv = true
    buttons_control.art = art
    if (art === 1) buttons_control.bemassung_parallel_aktiv = true;
    else if (art === 2) buttons_control.bemassung_horizontal_aktiv = true;
    else if (art === 3) buttons_control.bemassung_vertikal_aktiv = true;
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_BEMASSUNG
    set_help_text('ersten Knoten picken');
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 3
    buttons_control.button_pressed = true;

  }
}


//--------------------------------------------------------------------------------------------------------
export function drawBemassung_band(tr: CTrans, x1: number, z1: number, x2: number, z2: number, x3: number, z3: number, art: number) {
  //------------------------------------------------------------------------------------------------------

  const X = 0, Y = 1, Z = 2
  let p1xNew = 0, p1yNew = 0, p1zNew = 0, p2xNew = 0, p2yNew = 0, p2zNew = 0
  let pe1x = 0, pe1y = 0, pe2x = 0, pe2y = 0
  let pa1x = 0, pa1y = 0, pa1z = 0, pa2x = 0, pa2y = 0, pa2z = 0
  let dx = 0, dz = 0
  let dsl = 0, sinus = 0, cosinus = 0, alpha = 0

  let ueberstand = slmax_cad / 120;
  let m_strich = 0;

  let b = [0, 0, 0];

  dx = x2 - x1;
  dz = z2 - z1;

  if (art === PARALLEL) {

    let a = Array(3), c = Array(3), d = Array(3);

    a[X] = dx = x2 - x1;
    a[Y] = dz = z2 - z1;
    a[Z] = 0.0;

    c[X] = x3 - x1;
    c[Y] = z3 - z1;
    c[Z] = 0.0;

    crossProd(a, c, d);     // d = a x c
    crossProd(d, a, b);     // b = d x a

    let aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y] + a[Z] * a[Z]);
    let abstand = Math.sqrt(d[X] * d[X] + d[Y] * d[Y] + d[Z] * d[Z]) / aBetrag;
    let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
    let fac = abstand / bBetrag;
    b[X] *= fac; b[Y] *= fac; b[Z] *= fac;

    p1xNew = x1 + b[X];
    p1yNew = z1 + b[Y];
    p1zNew = 0 + b[Z];
    p2xNew = x2 + b[X];
    p2yNew = z2 + b[Y];
    p2zNew = 0 + b[Z];
    //console.log("p12", p1xNew, p1yNew, p1zNew, p2xNew, p2yNew, p2zNew)

    bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
    fac = ueberstand / bBetrag;
    b[X] *= fac; b[Y] *= fac; b[Z] *= fac;

    pe1x = p1xNew + b[X];
    pe1y = p1yNew + b[Y];
    pe2x = p2xNew + b[X];
    pe2y = p2yNew + b[Y];

    if (m_strich == 0) {
      pa1x = x1 + b[X], pa1y = z1 + b[Y], pa1z = 0 + b[Z];
      pa2x = x2 + b[X], pa2y = z2 + b[Y], pa2z = 0 + b[Z];
    } else {
      pa1x = p1xNew - b[X], pa1y = p1yNew - b[Y], pa1z = p1zNew - b[Z];
      pa2x = p2xNew - b[X], pa2y = p2yNew - b[Y], pa2z = p2zNew - b[Z];
    }

    dsl = Math.sqrt(dx * dx + dz * dz);
    sinus = dz / dsl;
    cosinus = dx / dsl;
    alpha = Math.atan2(dz, dx)

  }
  else if (art === HORIZONTAL) {

    b[0] = 0
    b[1] = z3 - z1
    b[2] = 0

    p1xNew = x1; p1yNew = b[Y] + z1; p1zNew = 0;
    p2xNew = x2; p2yNew = b[Y] + z1; p2zNew = 0;

    let vorzeichen = Math.abs(b[Y] + z1 - z1) / (b[Y] + z1 - z1);

    pe1x = p1xNew; pe1y = p1yNew + vorzeichen * ueberstand;
    pe2x = p2xNew; pe2y = p2yNew + vorzeichen * ueberstand;


    if (m_strich == 0) {
      pa1x = x1; pa1y = z1 + 2.0 * vorzeichen * ueberstand;
      pa2x = x2; pa2y = z2 + 2.0 * vorzeichen * ueberstand;
    } else {
      pa1x = x1; pa1y = p1yNew - vorzeichen * ueberstand;
      pa2x = x2; pa2y = p1yNew - vorzeichen * ueberstand;
    }
    dsl = Math.abs(dx);
    cosinus = 1

  }
  else if (art === VERTIKAL) {

    b[0] = x3 - x1
    b[1] = 0
    b[2] = 0

    p1xNew = b[X] + x1; p1yNew = z1; p1zNew = 0;
    p2xNew = b[X] + x1; p2yNew = z2; p2zNew = 0;

    let vorzeichen = Math.abs(b[X] + x1 - x1) / (b[X] + x1 - x1);

    pe1x = p1xNew + vorzeichen * ueberstand; pe1y = p1yNew;
    pe2x = p2xNew + vorzeichen * ueberstand; pe2y = p2yNew;

    if (m_strich == 0) {
      pa1x = x1 + 2.0 * vorzeichen * ueberstand; pa1y = z1;
      pa2x = x2 + 2.0 * vorzeichen * ueberstand; pa2y = z2;
    } else {
      pa1x = p1xNew - vorzeichen * ueberstand; pa1y = z1;
      pa2x = p2xNew - vorzeichen * ueberstand; pa2y = z2;
    }
    dsl = Math.abs(dz);
    sinus = 1;
    alpha = -Math.PI / 2.0
  }

  let group = new Two.Group();


  let line = new Two.Line(tr.xPix(p1xNew), tr.zPix(p1yNew), tr.xPix(p2xNew), tr.zPix(p2yNew));
  line.linewidth = 2 / devicePixelRatio;
  group.add(line);

  let circle = new Two.Circle(tr.xPix(p1xNew), tr.zPix(p1yNew), 4 / devicePixelRatio, 6)
  circle.fill = 'black'
  group.add(circle);

  circle = new Two.Circle(tr.xPix(p2xNew), tr.zPix(p2yNew), 4 / devicePixelRatio, 6)
  circle.fill = 'black'
  group.add(circle);


  return group;

}


