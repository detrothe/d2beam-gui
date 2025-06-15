import Two from "two.js";
import { CAD_BEMASSUNG, list, slmax_cad, style_txt } from "./cad"
import { buttons_control, set_help_text } from "./cad_buttons"
import { add_cad_node, add_element_nodes, get_cad_node_X, get_cad_node_Z } from "./cad_node";
import { TCAD_Element } from "./CCAD_element";
import { crossProd } from "./lib";
import { CTrans } from "./trans";
import { myFormat } from "./utility";
import { style_txt_knotenlast } from "./grafik";

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
}



//--------------------------------------------------------------------------------------------------------
export function add_bemassung(tr: CTrans, index1: number, index2: number, x3: number, z3: number, art: number) {
  //------------------------------------------------------------------------------------------------------

  let group = null;

  add_element_nodes(index1);
  add_element_nodes(index2);

  let b = [0, 0, 0]
  calc_abstand(index1, index2, x3, z3, b);

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



//--------------------------------------------------------------------------------------------------------
export function drawBemassung(obj: TCAD_Bemassung, tr: CTrans, save = false) {
  //------------------------------------------------------------------------------------------------------

  const X = 0, Y = 1, Z = 2

  //let dx: number, dz: number;


  let x1 = get_cad_node_X(obj.index1)
  let z1 = get_cad_node_Z(obj.index1)
  let x2 = get_cad_node_X(obj.index2)
  let z2 = get_cad_node_Z(obj.index2)

  let b = [0, 0, 0];
  b[X] = obj.b[X]
  b[Y] = obj.b[Y]

  let dx = x2 - x1;
  let dz = z2 - z1;
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

  let p1xNew = x1 + b[X];
  let p1yNew = z1 + b[Y];
  let p1zNew = 0 + b[Z];
  let p2xNew = x2 + b[X];
  let p2yNew = z2 + b[Y];
  let p2zNew = 0 + b[Z];
  //console.log("p12", p1xNew, p1yNew, p1zNew, p2xNew, p2yNew, p2zNew)

  if (save) {   // neue Eingabe
    let index = add_cad_node(p1xNew, p1yNew, 1);
    add_element_nodes(index);
    obj.set_index3(index);

    index = add_cad_node(p2xNew, p2yNew, 1);
    add_element_nodes(index);
    obj.set_index4(index);
  }

  let ueberstand = slmax_cad / 90 / devicePixelRatio;  //tr.World0(10)

  let bBetrag = Math.sqrt(b[X] * b[X] + b[Y] * b[Y] + b[Z] * b[Z]);
  let fac = ueberstand / bBetrag;
  b[X] *= fac; b[Y] *= fac; b[Z] *= fac;

  let pe1x = p1xNew + b[X];
  let pe1y = p1yNew + b[Y];
  let pe2x = p2xNew + b[X];
  let pe2y = p2yNew + b[Y];

  let m_strich = 1;
  let pa1x, pa1y, pa1z, pa2x, pa2y, pa2z
  if (m_strich == 0) {
    pa1x = x1 + b[X], pa1y = z1 + b[Y], pa1z = 0 + b[Z];
    pa2x = x2 + b[X], pa2y = z2 + b[Y], pa2z = 0 + b[Z];
  } else {
    pa1x = p1xNew - b[X], pa1y = p1yNew - b[Y], pa1z = p1zNew - b[Z];
    pa2x = p2xNew - b[X], pa2y = p2yNew - b[Y], pa2z = p2zNew - b[Z];
  }

  //console.log("pae12", pa1x, pa1y, pa1z, pa2x, pa2y, pa2z)

  let group = new Two.Group();


  let line = new Two.Line(tr.xPix(p1xNew), tr.zPix(p1yNew), tr.xPix(p2xNew), tr.zPix(p2yNew));
  line.linewidth = 2 / devicePixelRatio;
  group.add(line);

  let circle = new Two.Circle(tr.xPix(p1xNew), tr.zPix(p1yNew), 5, 10)
  circle.fill = 'black'
  group.add(circle);

  circle = new Two.Circle(tr.xPix(p2xNew), tr.zPix(p2yNew), 5, 10)
  circle.fill = 'black'
  group.add(circle);

  line = new Two.Line(tr.xPix(pa1x), tr.zPix(pa1y), tr.xPix(pe1x), tr.zPix(pe1y));
  line.linewidth = 2 / devicePixelRatio;
  group.add(line);

  line = new Two.Line(tr.xPix(pa2x), tr.zPix(pa2y), tr.xPix(pe2x), tr.zPix(pe2y));
  line.linewidth = 2 / devicePixelRatio;
  group.add(line);

  let dsl = Math.sqrt(dx * dx + dz * dz);
  let sinus = dz / dsl;
  let cosinus = dx / dsl;
  let alpha = Math.atan2(dz, dx)

  let xm = tr.xPix((p1xNew + p2xNew) / 2) + (sinus * 11 + cosinus * 1) // devicePixelRatio  war 17
  let zm = tr.zPix((p1yNew + p2yNew) / 2) - (cosinus * 11 - sinus * 1)

  let str = myFormat(dsl, 1, 3) + 'm'
  const txt1 = new Two.Text(str, xm, zm, style_txt)
  txt1.fill = '#000000'
  txt1.alignment = 'center'
  txt1.baseline = 'middle'
  txt1.rotation = alpha
  group.add(txt1);

  return group;

}






//------------------------------------------------------------------------------------------------------
export function Bemassung_parallel_button() {
  //----------------------------------------------------------------------------------------------------

  console.log("in Bemassung_parallel_button")

  //  let el = document.getElementById("id_cad_info_button") as HTMLButtonElement

  if (buttons_control.bemassung_aktiv) {
    buttons_control.reset()
  } else {
    buttons_control.reset()
    //  el.style.backgroundColor = 'darkRed'
    buttons_control.bemassung_aktiv = true
    buttons_control.art = PARALLEL
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_BEMASSUNG
    set_help_text('ersten Knoten picken');
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 3
    buttons_control.button_pressed = true;


  }

}
