import { jsPDF, jsPDFAPI } from "jspdf";
//import autoTable from "jspdf-autotable";
import { Canvg } from "canvg";
//import { app, infoBox } from "./index.js";

// @ts-ignore
import { font } from "../fonts/FreeSans-normal.js";
// @ts-ignore
import { fontBold } from "../fonts/FreeSans-bold.js";

import htmlToPdfmake from "html-to-pdfmake";
//import { tabQWerte, schnittgroesse, bezugswerte } from "./duennQ"

import { nnodes, nelem, System, stadyn, nnodalMass, nodalmass, dyn_neigv, dyn_omega, eigenform_print, nelem_koppelfedern, nelem_Balken, nelem_Balken_Bettung, matprop_flag } from "./rechnen";
import {
  el,
  element as stab,
  node,
  nlastfaelle,
  nkombinationen,
  nQuerschnittSets,
  neigv,
  THIIO_flag,
  disp_print,
  disp_print_kombi,
  lagerkraefte,
  lagerkraefte_kombi,
  querschnittset,
  alpha_cr,
  lastfall_bezeichnung,
  kombiTabelle,
  kombiTabelle_txt,
  nloads,
  load,
  nstreckenlasten, ntemperaturlasten, neinzellasten, nvorspannungen, nspannschloesser,
  eload,
  ausgabe_gleichgewichtSG,
} from "./rechnen";

import { myFormat } from "./utility";
import { app } from "./haupt";
import { unit_length_factor, current_unit_length } from "./einstellungen";
import { svg_pdf_ratio } from "./grafik.js";

let lastFileHandlePDF = "documents";
let currentFilenamePDF = "d2beam.pdf";

const zeilenAbstand = 1.15;
let Seite = "Seite";

let doc: jsPDF;

let Seite_No: number;

class pdf_table {
  doc: jsPDF;
  spaltenbreite: number[];
  spalteRandLinks: number[];

  //----------------------------------------------------------------------------------------------
  constructor(doc: jsPDF, left: number, spaltenbreite: number[]) {
    //--------------------------------------------------------------------------------------------

    this.spalteRandLinks = Array(spaltenbreite.length);
    this.spaltenbreite = Array(spaltenbreite.length);
    this.doc = doc;

    this.spalteRandLinks[0] = left;
    this.spaltenbreite[0] = spaltenbreite[0];
    for (let i = 1; i < spaltenbreite.length; i++) {
      this.spalteRandLinks[i] = this.spalteRandLinks[i - 1] + spaltenbreite[i - 1];
      this.spaltenbreite[i] = spaltenbreite[i];
    }
  }

  //----------------------------------------------------------------------------------------------
  leftStart(ispalte: number, str: string, pos: String, padding = 0) {
    //--------------------------------------------------------------------------------------------

    let x = 0;
    let texWid = this.getHtmlWidth(str);
    if (pos === "left") {
      x = this.spalteRandLinks[ispalte] + padding;
    } else if (pos === "right") {
      x = this.spalteRandLinks[ispalte] + this.spaltenbreite[ispalte] - texWid - padding;
    } else {
      x = this.spalteRandLinks[ispalte] + this.spaltenbreite[ispalte] / 2 - texWid / 2;
    }
    return x;
  }

  //----------------------------------------------------------------------------------------------
  getHtmlWidth(text: string) {
    //--------------------------------------------------------------------------------------------

    let texWid = 0;

    const html = htmlToPdfmake(text) as any;

    const fs = this.doc.getFontSize();

    if (typeof html.length === "undefined") {
      texWid = this.doc.getTextWidth(text);
    } else {
      for (let i = 0; i < html.length; i++) {
        if (typeof html[i].nodeName === "undefined") {
          // einfacher Text
          texWid += this.doc.getTextWidth(html[i].text);
        } else if (html[i].nodeName === "SUB") {
          this.doc.setFontSize(fs - 3);
          texWid += this.doc.getTextWidth(html[i].text);
          this.doc.setFontSize(fs);
        } else if (html[i].nodeName === "SUP") {
          this.doc.setFontSize(fs - 3);
          texWid += this.doc.getTextWidth(html[i].text);
          this.doc.setFontSize(fs);
        }
      }
    }
    //console.log("texWidth", texWid)
    return texWid;
  }

  //----------------------------------------------------------------------------------------------
  htmlText(str: string, ispalte: number, pos: String, y: number, padding = 0) {
    //--------------------------------------------------------------------------------------------

    let x = this.leftStart(ispalte, str, pos, padding);

    htmlText(str, x, y);
  }
}

//----------------------------------------------------------------------------------------------
function htmlText(text: string, x: number, y: number) {
  //--------------------------------------------------------------------------------------------

  const html = htmlToPdfmake(text) as any;
  //console.log("html", text, "|" + html.text + "|", html.length)

  const fs = doc.getFontSize();

  let xx = x;
  let yy = y;

  if (typeof html.length === "undefined") {
    doc.text(html.text, xx, yy);
    return;
  }

  for (let i = 0; i < html.length; i++) {
    //console.log("i,nodeName", i, html[i].text, html[i].nodeName)
    if (typeof html[i].nodeName === "undefined") {
      // einfacher Text
      doc.text(html[i].text, xx, yy);
      xx += doc.getTextWidth(html[i].text);
    } else if (html[i].nodeName === "SUB") {
      doc.setFontSize(fs - 3);
      doc.text(html[i].text, xx, yy + 1);
      xx += doc.getTextWidth(html[i].text);
      doc.setFontSize(fs);
    } else if (html[i].nodeName === "SUP") {
      doc.setFontSize(fs - 3);
      doc.text(html[i].text, xx, yy - 1);
      xx += doc.getTextWidth(html[i].text);
      doc.setFontSize(fs);
    }
  }
}

//----------------------------------------------------------------------------------------------
function neueZeile(yy: number, fs: number, anzahl = 1): number {
  //--------------------------------------------------------------------------------------------
  let y = yy + anzahl * zeilenAbstand * (fs * 0.352778);
  if (y > 270) {
    Seite_No++;
    doc.text(Seite + Seite_No, 100, 290);

    doc.addPage();
    y = 20;
  }
  return y;
}

//----------------------------------------------------------------------------------------------
function testSeite(yy: number, fs: number, anzahl: number, nzeilen: number): number {
  //--------------------------------------------------------------------------------------------
  const laenge = nzeilen * zeilenAbstand * (fs * 0.352778);
  if (laenge > 270) {
    // ganze Tabelle passt nicht auf eine Seite

    if (yy + (anzahl + 3) * zeilenAbstand * (fs * 0.352778) > 270) {
      // 3 Zeilen sollten mindestens unter Überschrift passen
      Seite_No++;
      doc.text(Seite + Seite_No, 100, 290);

      doc.addPage();
      return 20;
    } else {
      return yy + anzahl * zeilenAbstand * (fs * 0.352778);
    }
  }

  let y = yy + Math.min(laenge, 50); // wenn 5cm Platz auf Seite, sonst neue Seite anfangen
  console.log("y", y, nzeilen, laenge);
  if (y > 270) {
    Seite_No++;
    doc.text(Seite + Seite_No, 100, 290);

    doc.addPage();
    return 20;
  } else {
    return yy + anzahl * zeilenAbstand * (fs * 0.352778);
  }
}
//----------------------------------------------------------------------------------------------
function neueSeite(): number {
  //--------------------------------------------------------------------------------------------
  Seite_No++;
  doc.text(Seite + Seite_No, 100, 290);

  doc.addPage();
  return 20;
}

//----------------------------------------------------------------------------------------------
function letzteSeite() {
  //--------------------------------------------------------------------------------------------
  Seite_No++;
  doc.text(Seite + Seite_No, 100, 290);
}

//----------------------------------------------------------------------------------------------
export async function my_jspdf() {
  //--------------------------------------------------------------------------------------------


  console.log(" PDF eload", eload)

  let str: string, texWid: number;

  let fs1 = 15,
    fs = 11;
  const links = 20;

  const newLine = "\n";
  Seite_No = 0;
  if (app.browserLanguage != "de") Seite = "page";

  // Default export is a4 paper, portrait, using millimeters for units
  doc = new jsPDF();

  doc.addFileToVFS("freesans.ttf", font);
  doc.addFont("freesans.ttf", "freesans_normal", "normal");

  doc.addFileToVFS("freesansbold.ttf", fontBold);
  doc.addFont("freesansbold.ttf", "freesans_bold", "normal");

  doc.setFont("freesans_normal");
  doc.setFontSize(fs);
  let yy = 20;

  //doc.line(links, 1, 200, 1, "S");
  //doc.line(links, 295, 200, 295, "S");

  //const txtarea = document.getElementById("freetext") as HTMLTextAreaElement
  const txtarea = document.createElement("textarea");
  txtarea.value = "Bauvorhaben <b>In den Statikwiesen 1A</b>";

  console.log("textarea", txtarea.value);
  const txt = txtarea.value;
  if (txt.length > 0) {
    let bold = false;
    const myArray = txt.split(newLine);
    for (let i = 0; i < myArray.length; i++) {
      console.log("txt", i, myArray[i]);

      let indexA = myArray[i].indexOf("<b>");
      let indexE = myArray[i].indexOf("</b>");
      let txtL = "",
        txtM = "",
        txtR = "";

      if (indexA > 0) txtL = myArray[i].slice(0, indexA);
      if (indexA >= 0 && indexE > 0) txtM = myArray[i].slice(indexA + 3, indexE);

      if (indexA >= 0 && indexE === -1) {
        // Fett nur zeilenweise
        txtM = myArray[i].slice(indexA + 3, myArray[i].length);
        bold = true;
      } else if (indexA === -1 && indexE > 0) {
        txtM = myArray[i].slice(0, indexE);
        bold = false;
      }
      if (indexE >= 0) {
        txtR = myArray[i].slice(indexE + 4, myArray[i].length);
      }
      console.log("txtLMR", txtL + "|" + txtM + "|" + txtR + "|");
      console.log("IndexAE", indexA, indexE);
      let col = links;
      if (txtL.length > 0) {
        doc.setFont("freesans_normal");
        doc.text(txtL, col, yy);
        texWid = doc.getTextWidth(txtL);
        col += texWid;
      }
      if (txtM.length > 0) {
        doc.setFont("freesans_bold");
        doc.text(txtM, col, yy);
        texWid = doc.getTextWidth(txtM);
        col += texWid;
      }
      if (txtR.length > 0) {
        doc.setFont("freesans_normal");
        doc.text(txtR, col, yy);
      }
      if (indexA === -1 && indexE === -1) {
        if (bold) doc.setFont("freesans_bold");
        else doc.setFont("freesans_normal");
        doc.text(myArray[i], links, yy);
      }

      yy = neueZeile(yy, fs, 1);
    }
  }
  yy = neueZeile(yy, fs, 1);

  doc.setFont("freesans_bold");
  doc.setFontSize(fs1);

  if (app.browserLanguage == "de") {
    doc.text("Ebenes Stabwerk d2beam", links, yy);
  } else {
    doc.text("2D frame analysis", links, yy);
  }

  doc.setFontSize(fs); // in points
  doc.setFont("freesans_bold");

  yy = neueZeile(yy, fs, 2);
  doc.text("Eingabeprotokoll", links, yy);

  yy = neueZeile(yy, fs1, 1);
  doc.setFont("freesans_normal");

  {
    const nspalten = 7,
      nzeilen = nnodes; // Knoten

    yy = testSeite(yy, fs1, 1, 4 + nzeilen);
    if (app.browserLanguage == "de") {
      doc.text("Knotenkoordinaten und Lager", links, yy);
    } else {
      doc.text("Node coordinates and supports", links, yy);
    }

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs, 2);

    let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 23, 23, 23, 25]);

    el_table_nodes.htmlText("No", 0, "left", yy);
    el_table_nodes.htmlText("x [" + current_unit_length + "]", 1, "center", yy);
    el_table_nodes.htmlText("z [" + current_unit_length + "]", 2, "center", yy);
    el_table_nodes.htmlText("L<sub>x</sub> (kN/m)", 3, "center", yy);
    el_table_nodes.htmlText("L<sub>z</sub> (kN/m)", 4, "center", yy);
    if (System === 0) {
      el_table_nodes.htmlText("L<sub>φ</sub> (kNm/m)", 5, "center", yy);
      el_table_nodes.htmlText("Winkel [°]", 6, "center", yy);
    } else {
      el_table_nodes.htmlText("Winkel [°]", 5, "center", yy);
    }

    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs1, 1);

    for (let i = 0; i < nzeilen; i++) {
      el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);

      str = myFormat(node[i].x * unit_length_factor, 2, 2);
      el_table_nodes.htmlText(str, 1, "right", yy, 5);

      str = myFormat(node[i].z * unit_length_factor, 2, 2);
      el_table_nodes.htmlText(str, 2, "right", yy, 5);

      if (System === 0) {
        for (let j = 0; j < 3; j++) {
          if (node[i].L_org[j] === 1) str = "starr";
          else if (node[i].L_org[j] === 0) str = "-";
          else str = myFormat(node[i].L_org[j], 0, 1);

          el_table_nodes.htmlText(str, 3 + j, "center", yy);
        }

        str = myFormat(node[i].phi, 1, 2);
        el_table_nodes.htmlText(str, 6, "center", yy);
      } else {
        for (let j = 0; j < 2; j++) {
          if (node[i].L_org[j] === 1) str = "starr";
          else if (node[i].L_org[j] === 0) str = "-";
          else str = myFormat(node[i].L_org[j], 0, 1);

          el_table_nodes.htmlText(str, 3 + j, "center", yy);
        }

        str = myFormat(node[i].phi, 1, 2);
        el_table_nodes.htmlText(str, 5, "center", yy);

      }
      yy = neueZeile(yy, fs1, 1);
    }
  }

  {
    const nzeilen = nQuerschnittSets; // Querschnitte

    yy = testSeite(yy, fs1, 1, 4 + nzeilen);
    if (app.browserLanguage == "de") {
      doc.text("Querschnitte", links, yy);
    } else {
      doc.text("Cross sections", links, yy);
    }

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs, 2);

    let el_table_nodes = new pdf_table(doc, links, [5, 30, 20, 25, 20, 15, 15, 20, 20]);

    el_table_nodes.htmlText("", 0, "left", yy);
    el_table_nodes.htmlText("", 1, "center", yy);
    el_table_nodes.htmlText("A", 2, "center", yy);
    el_table_nodes.htmlText("I<sub>y</sub>", 3, "center", yy);
    el_table_nodes.htmlText("E-Modul", 4, "center", yy);
    el_table_nodes.htmlText("ν", 5, "center", yy);
    el_table_nodes.htmlText("κ<sub>τ</sub>", 6, "center", yy);
    el_table_nodes.htmlText("α<sub>T</sub>", 7, "center", yy);
    el_table_nodes.htmlText("Wichte", 8, "center", yy);
    yy = neueZeile(yy, fs, 1);

    el_table_nodes.htmlText("No", 0, "left", yy);
    el_table_nodes.htmlText("Name", 1, "center", yy);
    el_table_nodes.htmlText("[cm<sup>2</sup>]", 2, "center", yy);
    el_table_nodes.htmlText("[cm<sup>4</sup>]", 3, "center", yy);
    el_table_nodes.htmlText("[N/mm<sup>2</sup>]", 4, "center", yy);
    el_table_nodes.htmlText("-", 5, "center", yy);
    el_table_nodes.htmlText("-", 6, "center", yy);
    el_table_nodes.htmlText("[1/K]", 7, "center", yy);
    el_table_nodes.htmlText("[kN/m<sup>3</sup>]", 8, "center", yy);

    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs1, 1);

    for (let i = 0; i < nzeilen; i++) {
      el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
      el_table_nodes.htmlText(querschnittset[i].name, 1, "center", yy);

      str = myFormat(querschnittset[i].area, 1, 2);
      el_table_nodes.htmlText(str, 2, "right", yy, 5);

      str = myFormat(querschnittset[i].Iy, 1, 1);
      el_table_nodes.htmlText(str, 3, "right", yy, 5);

      str = myFormat(querschnittset[i].emodul, 1, 1);
      el_table_nodes.htmlText(str, 4, "right", yy, 2);

      str = myFormat(querschnittset[i].querdehnzahl, 1, 2);
      el_table_nodes.htmlText(str, 5, "right", yy, 5);

      str = myFormat(querschnittset[i].schubfaktor, 0, 3);
      el_table_nodes.htmlText(str, 6, "right", yy, 5);

      str = myFormat(querschnittset[i].alphaT, 1, 2, 1);
      el_table_nodes.htmlText(str, 7, "right", yy, 5);

      str = myFormat(querschnittset[i].wichte, 1, 2);
      el_table_nodes.htmlText(str, 8, "right", yy, 5);

      yy = neueZeile(yy, fs1, 1);
    }
  }

  // Elemente

  {
    const nspalten = 3,
      nzeilen = nelem;

    yy = testSeite(yy, fs1, 1, 4 + nzeilen);
    if (app.browserLanguage == "de") {
      doc.text("Elementdaten", links, yy);
    } else {
      doc.text("Element data", links, yy);
    }
    let str: string, texWid: number;

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs, 2);

    if (System === 0) {
      //texWid = doc.getTextWidth("Gelenke");
      //let xx = links + 70 + 30 - texWid / 2
      let el_table = new pdf_table(doc, links, [70, 60, 20]);
      el_table.htmlText("", 0, "center", yy);
      el_table.htmlText("Gelenke", 1, "center", yy);
      //doc.text("Gelenke", links + 70 + 30 - texWid / 2, yy);
      el_table.htmlText("k<sub>b</sub>", 2, "center", yy);
      yy = neueZeile(yy, fs, 1);
    }

    let el_table = new pdf_table(doc, links, [10, 30, 15, 15, 10, 10, 10, 10, 10, 10, 20]);
    console.log("el_table", el_table);

    el_table.htmlText("No", 0, "left", yy);
    el_table.htmlText("Querschnitt", 1, "center", yy);
    el_table.htmlText("nod a", 2, "center", yy);
    el_table.htmlText("nod e", 3, "center", yy);
    if (System === 0) {
      el_table.htmlText("Na", 4, "center", yy);
      el_table.htmlText("Va", 5, "center", yy);
      el_table.htmlText("Ma", 6, "center", yy);
      el_table.htmlText("Ne", 7, "center", yy);
      el_table.htmlText("Ve", 8, "center", yy);
      el_table.htmlText("Me", 9, "center", yy);
      el_table.htmlText("[kN/m²]", 10, "center", yy);
    }
    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs, 1);

    for (let i = 0; i < nzeilen; i++) {
      el_table.htmlText(String(+i + 1), 0, "center", yy);
      el_table.htmlText(String(stab[i].qname), 1, "center", yy);
      el_table.htmlText(String(+stab[i].nod[0] + 1), 2, "center", yy);
      el_table.htmlText(String(+stab[i].nod[1] + 1), 3, "center", yy);

      if (System === 0) {
        for (let j = 0; j < 6; j++) {
          if (stab[i].gelenk[j] === 0) {
            el_table.htmlText("-", j + 4, "center", yy);
          } else {
            el_table.htmlText("ʘ", j + 4, "center", yy);
          }
        }
        if (stab[i].k_0 > 0.0) {
          el_table.htmlText(myFormat(stab[i].k_0, 1, 2, 1), 10, "center", yy);
        }
      }

      yy = neueZeile(yy, fs1, 1);
    }

  }

  // Koppelfedern

  if (System === 0 && nelem_koppelfedern > 0) {

    const nspalten = 3,
      nzeilen = nelem_koppelfedern;

    yy = testSeite(yy, fs1, 1, 4 + nzeilen);
    if (app.browserLanguage == "de") {
      doc.text("Koppelfedern", links, yy);
    } else {
      doc.text("Spring data", links, yy);
    }
    let str: string, texWid: number;

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs, 2);

    let el_table = new pdf_table(doc, links, [10, 15, 15, 23, 23, 23, 23, 23, 23]);
    console.log("el_table", el_table);

    el_table.htmlText("", 0, "left", yy);
    el_table.htmlText("", 1, "center", yy);
    el_table.htmlText("", 2, "center", yy);

    el_table.htmlText("k<sub>x</sub>", 3, "center", yy);
    el_table.htmlText("f<sub>x.plast</sub>", 4, "center", yy);
    el_table.htmlText("k<sub>z</sub>", 5, "center", yy);
    el_table.htmlText("f<sub>z.plast</sub>", 6, "center", yy);
    el_table.htmlText("k<sub>φ</sub>", 7, "center", yy);
    el_table.htmlText("m<sub>φ.plast</sub>", 8, "center", yy);

    yy = neueZeile(yy, fs, 1);

    el_table.htmlText("No", 0, "left", yy);
    el_table.htmlText("nod a", 1, "center", yy);
    el_table.htmlText("nod e", 2, "center", yy);

    el_table.htmlText("[kN/m]", 3, "center", yy);
    el_table.htmlText("[kN]", 4, "center", yy);
    el_table.htmlText("[kN/m]", 5, "center", yy);
    el_table.htmlText("[kN]", 6, "center", yy);
    el_table.htmlText("[kNm/rad]", 7, "center", yy);
    el_table.htmlText("[kNm]", 8, "center", yy);

    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs, 1);

    let ielem = nelem_Balken

    for (let i = 0; i < nzeilen; i++) {
      el_table.htmlText(String(+i + 1), 0, "center", yy);
      el_table.htmlText(String(+stab[ielem].nod[0] + 1), 1, "center", yy);
      el_table.htmlText(String(+stab[ielem].nod[1] + 1), 2, "center", yy);

      for (let j = 0; j < 6; j++) {
        str = myFormat(stab[ielem].mat_koppelfeder[j], 1, 5, 1);
        el_table.htmlText(str, j + 3, "center", yy);
      }

      ielem++;
      yy = neueZeile(yy, fs1, 1);
    }

  }


  //   Knotenmassen

  let sum_mass = 0.0
  let sum_theta = 0.0

  if ((stadyn === 1) && (nnodalMass > 0)) {

    yy = testSeite(yy, fs, 1, 5);
    doc.setFont("freesans_bold");
    doc.text("Knotenmassen", links, yy);
    //yy = neueZeile(yy, fs, 1)

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs1, 1);
    let el_table = new pdf_table(doc, links, [20, 20, 30]);
    el_table.htmlText("Node No", 0, "left", yy);
    el_table.htmlText("Masse [t]", 1, "center", yy);
    if (System === 0) el_table.htmlText("Theta [tm²]", 2, "center", yy);

    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs, 1);

    for (let i = 0; i < nnodalMass; i++) {
      sum_mass += nodalmass[i].mass
      sum_theta += nodalmass[i].theta

      el_table.htmlText(String(+nodalmass[i].node + 1), 0, "center", yy);
      el_table.htmlText(myFormat(nodalmass[i].mass, 1, 2), 1, "right", yy, 5);
      if (System === 0) el_table.htmlText(myFormat(nodalmass[i].theta, 1, 2), 2, "right", yy, 10);
      yy = neueZeile(yy, fs, 1);
    }

  }

  if (stadyn === 1) {

    yy = testSeite(yy, fs, 1, 4);
    doc.setFont("freesans_normal");
    doc.text("Summe der Knotenmassen = " + myFormat(sum_mass, 1, 1) + ' [t]', links, yy);
    yy = neueZeile(yy, fs, 1);
    doc.text("Summe der Massenträgheitsmomente = " + myFormat(sum_theta, 1, 1) + ' [tm²]', links, yy);

    sum_mass = 0.0
    for (let i = 0; i < nelem; i++) {
      sum_mass += el[i].mass_gesamt
    }

    yy = neueZeile(yy, fs, 1);
    doc.text("Summe der Elementmassen = " + myFormat(sum_mass, 1, 2) + ' [t]', links, yy);
    yy = neueZeile(yy, fs, 1);

  }



  if (stadyn === 0) {

    if (nloads > 0) {   // Knotenlasten

      yy = testSeite(yy, fs1, 1, 5);
      if (app.browserLanguage == "de") {
        doc.text("Knotenlasten", links, yy);
      } else {
        doc.text("Nodal loads", links, yy);
      }

      doc.setFontSize(fs);
      doc.setFont("freesans_bold");
      yy = neueZeile(yy, fs, 2);

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Knoten", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("P<sub>x</sub> [kN]", 3, "center", yy);
      el_table_nodes.htmlText("P<sub>z</sub> [kN]", 4, "center", yy);
      if (System === 0) el_table_nodes.htmlText("M<sub>y</sub> [kNm]", 5, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let i = 0; i < nloads; i++) {
        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(load[i].node), 1, "center", yy);
        el_table_nodes.htmlText(String(load[i].lf), 2, "center", yy);

        str = myFormat(load[i].Px, 1, 3);
        el_table_nodes.htmlText(str, 3, "right", yy, 5);

        str = myFormat(load[i].Pz, 1, 3);
        el_table_nodes.htmlText(str, 4, "right", yy, 5);

        if (System === 0) {
          str = myFormat(load[i].p[2], 1, 3);
          el_table_nodes.htmlText(str, 5, "right", yy, 5);
        }
        yy = neueZeile(yy, fs, 1);
      }
    }

    if (nstreckenlasten > 0) {     // Trapezstreckenlasten

      yy = testSeite(yy, fs1, 1, 10);
      if (app.browserLanguage == "de") {
        doc.text("Trapezstreckenlasten", links, yy);
      } else {
        doc.text("Element loads", links, yy);
      }

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs, 2);

      doc.text('0 = Trapezstreckenlast senkrecht auf Stab', links, yy); yy = neueZeile(yy, fs, 1);
      doc.text('1 = Trapezstreckenlast in globaler z-Richtung', links, yy); yy = neueZeile(yy, fs, 1);
      doc.text('2 = Trapezstreckenlast in globaler z-Richtung, Projektion', links, yy); yy = neueZeile(yy, fs, 1);
      doc.text('3 = Trapezstreckenlast in globaler x-Richtung', links, yy); yy = neueZeile(yy, fs, 1);
      doc.text('4 = Trapezstreckenlast in globaler x-Richtung, Projektion', links, yy); yy = neueZeile(yy, fs, 2);

      doc.setFont("freesans_bold");

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Element", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("Art", 3, "center", yy);
      el_table_nodes.htmlText("p<sub>a</sub> [kN/m]", 4, "center", yy);
      el_table_nodes.htmlText("p<sub>e</sub> [kN/m]", 5, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let j = 0; j < nstreckenlasten; j++) {
        let i = j + nelem_Balken     // Eigengewicht nicht ausgeben
        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(+eload[i].element + 1), 1, "center", yy);
        el_table_nodes.htmlText(String(eload[i].lf), 2, "center", yy);
        el_table_nodes.htmlText(String(eload[i].art), 3, "center", yy);

        str = myFormat(eload[i].pL, 1, 3);
        el_table_nodes.htmlText(str, 4, "right", yy, 5);

        str = myFormat(eload[i].pR, 1, 3);
        el_table_nodes.htmlText(str, 5, "right", yy, 5);

        yy = neueZeile(yy, fs, 1);
      }
    }


    if (neinzellasten > 0) {    // Einzellasten auf Element

      yy = testSeite(yy, fs1, 1, 10);
      if (app.browserLanguage == "de") {
        doc.text("Einzellasten", links, yy);
      } else {
        doc.text("Element loads P, M", links, yy);
      }
      yy = neueZeile(yy, fs, 2);
      doc.setFont("freesans_bold");
      doc.setFontSize(fs);

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Element", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("x [m]", 3, "center", yy);
      el_table_nodes.htmlText("P [kN]", 4, "center", yy);
      el_table_nodes.htmlText("M [kNm]", 5, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let i = 0; i < neinzellasten; i++) {
        let index = i + nstreckenlasten + nelem_Balken
        //console.log("  PDF ", index, nstreckenlasten, eload[index])

        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(+eload[index].element + 1), 1, "center", yy);
        el_table_nodes.htmlText(String(eload[index].lf), 2, "center", yy);

        str = myFormat(eload[index].x, 1, 3);
        el_table_nodes.htmlText(str, 3, "right", yy, 5);

        str = myFormat(eload[index].P, 1, 3);
        el_table_nodes.htmlText(str, 4, "right", yy, 5);

        str = myFormat(eload[index].M, 1, 3);
        el_table_nodes.htmlText(str, 5, "right", yy, 5);

        yy = neueZeile(yy, fs, 1);
      }
    }


    if (ntemperaturlasten > 0) {    // Temperaturlasten

      yy = testSeite(yy, fs1, 1, 10);
      if (app.browserLanguage == "de") {
        doc.text("Temperaturlasten", links, yy);
      } else {
        doc.text("Element loads temperature", links, yy);
      }
      yy = neueZeile(yy, fs, 2);
      doc.setFont("freesans_bold");
      doc.setFontSize(fs);

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Element", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("T<sub>u</sub> [°]", 3, "center", yy);
      el_table_nodes.htmlText("T<sub>o</sub> [°]", 4, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let i = 0; i < ntemperaturlasten; i++) {
        let index = i + nstreckenlasten + neinzellasten + nelem_Balken

        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(+eload[index].element + 1), 1, "center", yy);
        el_table_nodes.htmlText(String(eload[index].lf), 2, "center", yy);

        str = myFormat(eload[index].Tu, 1, 3);
        el_table_nodes.htmlText(str, 3, "right", yy, 5);

        str = myFormat(eload[index].To, 1, 3);
        el_table_nodes.htmlText(str, 4, "right", yy, 5);

        yy = neueZeile(yy, fs, 1);
      }
    }

    if (nvorspannungen > 0) {    // Vorspannung

      yy = testSeite(yy, fs1, 1, 10);
      if (app.browserLanguage == "de") {
        doc.text("Vorspannung", links, yy);
      } else {
        doc.text("Element loads prestress", links, yy);
      }
      yy = neueZeile(yy, fs, 2);
      doc.setFont("freesans_bold");
      doc.setFontSize(fs);

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Element", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("σ<sub>v</sub> [N/mm²]", 3, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let i = 0; i < nvorspannungen; i++) {
        let index = i + nstreckenlasten + neinzellasten + ntemperaturlasten + nelem_Balken

        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(+eload[index].element + 1), 1, "center", yy);
        el_table_nodes.htmlText(String(eload[index].lf), 2, "center", yy);

        str = myFormat(eload[index].sigmaV / 1000., 1, 3);
        el_table_nodes.htmlText(str, 3, "right", yy, 5);

        yy = neueZeile(yy, fs, 1);
      }
    }


    if (nspannschloesser > 0) {    // Spannschloss

      yy = testSeite(yy, fs1, 1, 10);
      if (app.browserLanguage == "de") {
        doc.text("Spannschloss", links, yy);
      } else {
        doc.text("Element loads lock", links, yy);
      }
      yy = neueZeile(yy, fs, 2);
      doc.setFont("freesans_bold");
      doc.setFontSize(fs);

      let el_table_nodes = new pdf_table(doc, links, [5, 20, 20, 20]);

      el_table_nodes.htmlText("No", 0, "left", yy);
      el_table_nodes.htmlText("Element", 1, "center", yy);
      el_table_nodes.htmlText("Lastfall", 2, "center", yy);
      el_table_nodes.htmlText("Δs [mm]", 3, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs1, 1);

      for (let i = 0; i < nspannschloesser; i++) {
        let index = i + nstreckenlasten + neinzellasten + ntemperaturlasten + nvorspannungen + nelem_Balken

        el_table_nodes.htmlText(String(+i + 1), 0, "center", yy);
        el_table_nodes.htmlText(String(+eload[index].element + 1), 1, "center", yy);
        el_table_nodes.htmlText(String(eload[index].lf), 2, "center", yy);

        str = myFormat(eload[index].delta_s * 1000., 1, 3);
        el_table_nodes.htmlText(str, 3, "right", yy, 5);

        yy = neueZeile(yy, fs, 1);
      }
    }

    // Bezeichnungen der Lastfälle ausdrucken

    {
      let nBezeichnungen = 0;
      for (let i = 0; i < nlastfaelle; i++) {
        if (lastfall_bezeichnung[i].length > 0) nBezeichnungen++;
      }
      //console.log("Anzahl Lastfall-Bezeichnugen", nBezeichnungen);

      if (nBezeichnungen > 0) {
        yy = testSeite(yy, fs1, 1, 4 + nBezeichnungen);
        if (app.browserLanguage == "de") {
          doc.text("Lastfälle", links, yy);
        } else {
          doc.text("Load cases", links, yy);
        }

        doc.setFontSize(fs);
        doc.setFont("freesans_bold");
        yy = neueZeile(yy, fs, 2);

        let el_table = new pdf_table(doc, links, [10, 150]);
        //console.log("el_table", el_table);

        el_table.htmlText("Lf", 0, "center", yy);
        el_table.htmlText("Bezeichnung", 1, "left", yy);

        doc.setFontSize(fs);
        doc.setFont("freesans_normal");
        yy = neueZeile(yy, fs, 1);

        for (let i = 0; i < nlastfaelle; i++) {
          el_table.htmlText(String(+i + 1), 0, "center", yy);
          el_table.htmlText(lastfall_bezeichnung[i], 1, "left", yy);
          yy = neueZeile(yy, fs, 1);
        }
      }
    }

    // Kombinationen ausdrucken

    {
      yy = testSeite(yy, fs1, 1, 4 + nkombinationen);
      if (app.browserLanguage == "de") {
        doc.text("Kombinationen", links, yy);
      } else {
        doc.text("Load combinations", links, yy);
      }

      doc.setFontSize(fs);
      doc.setFont("freesans_bold");
      yy = neueZeile(yy, fs, 2);

      let spaltenArray = Array(nlastfaelle + 2);
      spaltenArray[0] = 10;
      spaltenArray[1] = 30;
      for (let i = 0; i < nlastfaelle; i++) spaltenArray[i + 2] = 10;
      console.log("spaltenArray", spaltenArray);

      let el_table = new pdf_table(doc, links, spaltenArray);
      //console.log("el_table", el_table)

      el_table.htmlText("No", 0, "center", yy);
      el_table.htmlText("Erläuterung", 1, "left", yy);
      for (let i = 0; i < nlastfaelle; i++) el_table.htmlText("Lf " + (+i + 1), 2 + i, "center", yy);

      doc.setFontSize(fs);
      doc.setFont("freesans_normal");
      yy = neueZeile(yy, fs, 1);

      for (let i = 0; i < nkombinationen; i++) {
        el_table.htmlText(String(+i + 1), 0, "center", yy);
        el_table.htmlText(kombiTabelle_txt[i], 1, "left", yy);
        for (let j = 0; j < nlastfaelle; j++) {
          console.log("kombitabelle", i, j, kombiTabelle[i][j]);
          el_table.htmlText(myFormat(kombiTabelle[i][j], 1, 2), j + 2, "center", yy);
        }
        yy = neueZeile(yy, fs, 1);
      }
    }

  }  // Ende Lasten Statik

  //    --------------------------------------  E R G E B N I S S E  --------------------------------

  doc.line(links, yy, 200, yy, "S");
  //  yy = neueZeile(yy, fs1, 2)
  yy = testSeite(yy, fs1, 2, 13);

  doc.setFontSize(fs1);
  doc.setFont("freesans_bold");
  if (app.browserLanguage == "de") {
    doc.text("Ergebnisse", links, yy);
  } else {
    doc.text("Results", links, yy);
  }
  doc.setFontSize(fs);
  doc.setFont("freesans_normal");

  //yy = neueZeile(yy, fs, 2)
  yy = neueZeile(yy, fs1, 1);

  if (stadyn === 0) {

    // Schnittgrößen ausdrucken

    let text: string;
    let nLoop = 0;
    if (THIIO_flag === 0) {      // Theorie I.Ordnung
      doc.text("Berechnung nach Theorie I. Ordnung", links, yy);
    } else {
      doc.text("Berechnung nach Theorie II. Ordnung", links, yy);
    }
    yy = neueZeile(yy, fs, 1);

    if (THIIO_flag === 0 && matprop_flag === 0) {      // Theorie I.Ordnung
      nLoop = nlastfaelle;
    } else {
      nLoop = nkombinationen;
    }

    //console.log("Ausgabe pdf", nLoop, nlastfaelle, nkombinationen);

    for (let iLastfall = 1; iLastfall <= nLoop; iLastfall++) {
      if (THIIO_flag === 0 && matprop_flag === 0) text = "Lastfall " + iLastfall;
      else text = "Kombination " + iLastfall;
      console.log("text", links, yy, text);
      doc.setFont("freesans_bold");
      yy = neueZeile(yy, fs, 1);

      doc.line(links, yy, 200, yy, "S");

      //yy = neueZeile(yy, fs, 1)
      yy = testSeite(yy, fs, 1, 8);
      doc.text(text, links, yy);
      yy = neueZeile(yy, fs, 1);

      //   Verformungen
      {
        yy = testSeite(yy, fs, 1, 5);
        doc.setFont("freesans_bold");
        doc.text("Knotenverformungen", links, yy);
        //yy = neueZeile(yy, fs, 1)

        doc.setFontSize(fs);
        doc.setFont("freesans_bold");
        yy = neueZeile(yy, fs1, 1);
        let el_table = new pdf_table(doc, links, [20, 20, 20, 20]);
        el_table.htmlText("Node No", 0, "left", yy);
        el_table.htmlText("u' [mm]", 1, "center", yy);
        el_table.htmlText("w' [mm]", 2, "center", yy);
        if (System === 0) el_table.htmlText("φ [mrad]", 3, "center", yy);

        doc.setFontSize(fs);
        doc.setFont("freesans_normal");
        yy = neueZeile(yy, fs, 1);

        for (let i = 0; i < nnodes; i++) {
          el_table.htmlText(String(+i + 1), 0, "center", yy);
          el_table.htmlText(myFormat(disp_print._(i + 1, 1, iLastfall), 2, 2), 1, "right", yy, 5);
          el_table.htmlText(myFormat(disp_print._(i + 1, 2, iLastfall), 2, 2), 2, "right", yy, 5);
          if (System === 0) el_table.htmlText(myFormat(disp_print._(i + 1, 3, iLastfall), 2, 2), 3, "right", yy, 5);
          yy = neueZeile(yy, fs, 1);
        }
      }

      //   Lagerkräfte
      {
        //yy = neueZeile(yy, fs, 1)
        yy = testSeite(yy, fs, 1, 5);
        doc.setFont("freesans_bold");
        doc.text("Lagerreaktionen", links, yy);
        //yy = neueZeile(yy, fs, 1)

        doc.setFontSize(fs);
        doc.setFont("freesans_bold");
        yy = neueZeile(yy, fs1, 1);
        let el_table = new pdf_table(doc, links, [20, 20, 20, 20]);
        el_table.htmlText("Node No", 0, "left", yy);
        el_table.htmlText("A<sub>x'</sub> [kN]", 1, "center", yy);
        el_table.htmlText("A<sub>z'</sub> [kN]", 2, "center", yy);
        if (System === 0) el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);

        doc.setFontSize(fs);
        doc.setFont("freesans_normal");
        yy = neueZeile(yy, fs, 1);

        for (let i = 0; i < nnodes; i++) {
          el_table.htmlText(String(+i + 1), 0, "center", yy);
          el_table.htmlText(myFormat(lagerkraefte._(i, 0, iLastfall - 1), 2, 2), 1, "right", yy, 5);
          el_table.htmlText(myFormat(lagerkraefte._(i, 1, iLastfall - 1), 2, 2), 2, "right", yy, 5);
          if (System === 0) el_table.htmlText(myFormat(lagerkraefte._(i, 2, iLastfall - 1), 2, 2), 3, "right", yy, 5);
          yy = neueZeile(yy, fs, 1);
        }
      }

      {
        if (THIIO_flag === 1) {
          yy = neueZeile(yy, fs, 1);
          for (let i = 0; i < neigv; i++) {
            htmlText("α<sub>cr</sub>[Eigenwert " + (+i + 1) + "] = " + myFormat(alpha_cr[iLastfall - 1][i], 2, 2), links, yy);
            yy = neueZeile(yy, fs, 1);
          }
        }
      }

      //   Schnittgrößen Stäbe
      {
        let str_Vz = "V<sub>z</sub>"

        yy = testSeite(yy, fs, 1, 5);
        doc.setFont("freesans_bold");
        if (THIIO_flag === 0) {
          doc.text("Stabschnittgrößen und lokale Verformungen", links, yy);
        } else {
          if (ausgabe_gleichgewichtSG) {
            doc.text("Stabschnittgrößen und lokale Verformungen", links, yy);
            str_Vz = "T<sub>z</sub>"
          } else {
            doc.text("Nachweisschnittgrößen und lokale Verformungen", links, yy);
          }
        }
        yy = neueZeile(yy, fs, 1);

        for (let ielem = 0; ielem < nelem; ielem++) {

          if (!el[ielem].isActive) continue

          yy = neueZeile(yy, fs, 1);
          doc.setFont("freesans_bold");
          doc.text("Element " + (+ielem + 1), links, yy);
          yy = neueZeile(yy, fs, 1);

          let el_table = new pdf_table(doc, links, [20, 20, 20, 20, 20, 20, 20, 25]);
          if (System === 0) {
            el_table.htmlText("x [m]", 0, "center", yy);
            el_table.htmlText("N [kN]", 1, "center", yy);
            el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
            el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);
            el_table.htmlText("u<sub>xL</sub> [mm]", 4, "center", yy);
            el_table.htmlText("w<sub>zL</sub> [mm]", 5, "center", yy);
            el_table.htmlText("ß [mrad]", 6, "center", yy);
            if (nelem_Balken_Bettung > 0) {
              el_table.htmlText("press [kN/m]", 7, "center", yy);
            }
          } else {
            el_table.htmlText("x [m]", 0, "center", yy);
            el_table.htmlText("N [kN]", 1, "center", yy);
            // el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
            el_table.htmlText("u<sub>xL</sub> [mm]", 2, "center", yy);
            el_table.htmlText("w<sub>zL</sub> [mm]", 3, "center", yy);

          }
          doc.setFontSize(fs);
          doc.setFont("freesans_normal");
          yy = neueZeile(yy, fs, 1);

          const nelTeilungen = el[ielem].nTeilungen;
          let sg_M: number[] = new Array(nelTeilungen);
          let sg_V: number[] = new Array(nelTeilungen);
          let sg_N: number[] = new Array(nelTeilungen);

          let uL: number[] = new Array(nelTeilungen); // L = Verformung lokal
          let wL: number[] = new Array(nelTeilungen);
          let phiL: number[] = new Array(nelTeilungen);
          let press: number[] = new Array(nelTeilungen);

          const lf_index = iLastfall - 1;
          el[ielem].get_elementSchnittgroesse_Moment(sg_M, lf_index);
          el[ielem].get_elementSchnittgroesse_Querkraft(sg_V, lf_index, ausgabe_gleichgewichtSG);
          el[ielem].get_elementSchnittgroesse_Normalkraft(sg_N, lf_index, ausgabe_gleichgewichtSG);
          el[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index, false);
          el[ielem].get_elementSchnittgroesse_bettung(press, lf_index);

          for (let i = 0; i < nelTeilungen; i++) {
            if (System === 0) {
              el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
              el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
              el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
              el_table.htmlText(myFormat(sg_M[i], 2, 2), 3, "right", yy, 5);
              el_table.htmlText(myFormat(uL[i] * 1000, 3, 3), 4, "right", yy, 5);
              el_table.htmlText(myFormat(wL[i] * 1000, 3, 3), 5, "right", yy, 5);
              el_table.htmlText(myFormat(phiL[i] * 1000, 3, 3), 6, "right", yy, 5);
              if (nelem_Balken_Bettung > 0) {
                el_table.htmlText(myFormat(press[i], 3, 3), 7, "right", yy, 5);
              }
            } else {
              el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
              el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
              //el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
              el_table.htmlText(myFormat(uL[i] * 1000, 3, 3), 2, "right", yy, 5);
              el_table.htmlText(myFormat(wL[i] * 1000, 3, 3), 3, "right", yy, 5);
            }
            yy = neueZeile(yy, fs, 1);
          }
        }
      }


      //   Schnittgrößen Koppelfedern

      if (nelem_koppelfedern > 0) {

        let str_Vz = "V<sub>z</sub>"

        yy = testSeite(yy, fs, 1, 5);
        doc.setFont("freesans_bold");
        if (THIIO_flag === 0) {
          doc.text("Koppelfedern-Schnittgrößen und lokale Verformungen", links, yy);
        } else {
          if (ausgabe_gleichgewichtSG) {
            doc.text("Koppelfedern-Schnittgrößen und lokale Verformungen", links, yy);
            str_Vz = "T<sub>z</sub>"
          } else {
            doc.text("Nachweisschnittgrößen und lokale Verformungen", links, yy);
          }
        }
        yy = neueZeile(yy, fs, 1);

        let ielem = 0

        for (let iel = 0; iel < nelem_koppelfedern; iel++) {

          ielem = iel + nelem_Balken

          if (!el[ielem].isActive) continue

          yy = neueZeile(yy, fs, 1);
          doc.setFont("freesans_bold");
          doc.text("Koppelfeder " + (+iel + 1), links, yy);
          yy = neueZeile(yy, fs, 1);

          let el_table = new pdf_table(doc, links, [20, 20, 20, 20, 25, 25, 25]);

          el_table.htmlText("x [m]", 0, "center", yy);
          el_table.htmlText("N [kN]", 1, "center", yy);
          el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
          el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);
          el_table.htmlText("Δu<sub>xL</sub> [mm]", 4, "center", yy);
          el_table.htmlText("Δw<sub>zL</sub> [mm]", 5, "center", yy);
          el_table.htmlText("Δφ [mrad]", 6, "center", yy);

          doc.setFontSize(fs);
          doc.setFont("freesans_normal");
          yy = neueZeile(yy, fs, 1);

          const nelTeilungen = el[ielem].nTeilungen;
          let sg_M: number[] = new Array(nelTeilungen);
          let sg_V: number[] = new Array(nelTeilungen);
          let sg_N: number[] = new Array(nelTeilungen);

          let uL: number[] = new Array(nelTeilungen); // L = Verformung lokal
          let wL: number[] = new Array(nelTeilungen);
          let phiL: number[] = new Array(nelTeilungen);

          const lf_index = iLastfall - 1;
          el[ielem].get_elementSchnittgroesse_Moment(sg_M, lf_index);
          el[ielem].get_elementSchnittgroesse_Querkraft(sg_V, lf_index, ausgabe_gleichgewichtSG);
          el[ielem].get_elementSchnittgroesse_Normalkraft(sg_N, lf_index, ausgabe_gleichgewichtSG);
          el[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index, false);

          for (let i = 0; i < 1; i++) {

            el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
            el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
            el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
            el_table.htmlText(myFormat(sg_M[i], 2, 2), 3, "right", yy, 5);
            el_table.htmlText(myFormat((uL[i + 1] - uL[i]) * 1000, 3, 3), 4, "right", yy, 5);
            el_table.htmlText(myFormat((wL[i + 1] - wL[i]) * 1000, 3, 3), 5, "right", yy, 5);
            el_table.htmlText(myFormat((phiL[i + 1] - phiL[i]) * 1000, 3, 3), 6, "right", yy, 5);

            yy = neueZeile(yy, fs, 1);
          }
        }
      }



    }

    //******************************************
    // Kombinationen bei Theorie I. Ordnung    *
    //******************************************

    if (THIIO_flag === 0 && matprop_flag === 0 && nkombinationen > 0) {

      for (let iKomb = 1; iKomb <= nkombinationen; iKomb++) {
        text = "Kombination " + iKomb;
        console.log("text", links, yy, text);
        doc.setFont("freesans_bold");
        yy = neueZeile(yy, fs, 1);

        doc.line(links, yy, 200, yy, "S");

        //yy = neueZeile(yy, fs, 1)
        yy = testSeite(yy, fs, 1, 8);
        doc.text(text, links, yy);
        yy = neueZeile(yy, fs, 1);

        //   Verformungen
        {
          yy = testSeite(yy, fs, 1, 5);
          doc.setFont("freesans_bold");
          doc.text("Knotenverformungen", links, yy);
          //yy = neueZeile(yy, fs, 1)

          doc.setFontSize(fs);
          doc.setFont("freesans_bold");
          yy = neueZeile(yy, fs1, 1);
          let el_table = new pdf_table(doc, links, [20, 20, 20, 20]);
          el_table.htmlText("Node No", 0, "left", yy);
          el_table.htmlText("u' [mm]", 1, "center", yy);
          el_table.htmlText("w' [mm]", 2, "center", yy);
          if (System === 0) el_table.htmlText("φ [mrad]", 3, "center", yy);

          doc.setFontSize(fs);
          doc.setFont("freesans_normal");
          yy = neueZeile(yy, fs, 1);

          for (let i = 0; i < nnodes; i++) {
            el_table.htmlText(String(+i + 1), 0, "center", yy);
            el_table.htmlText(myFormat(disp_print_kombi._(i + 1, 1, iKomb), 2, 2), 1, "right", yy, 5);
            el_table.htmlText(myFormat(disp_print_kombi._(i + 1, 2, iKomb), 2, 2), 2, "right", yy, 5);
            if (System === 0) el_table.htmlText(myFormat(disp_print_kombi._(i + 1, 3, iKomb), 2, 2), 3, "right", yy, 5);
            yy = neueZeile(yy, fs, 1);
          }
        }

        //   Lagerkräfte
        {
          //yy = neueZeile(yy, fs, 1)
          yy = testSeite(yy, fs, 1, 5);
          doc.setFont("freesans_bold");
          doc.text("Lagerreaktionen", links, yy);
          //yy = neueZeile(yy, fs, 1)

          doc.setFontSize(fs);
          doc.setFont("freesans_bold");
          yy = neueZeile(yy, fs1, 1);
          let el_table = new pdf_table(doc, links, [20, 20, 20, 20]);
          el_table.htmlText("Node No", 0, "left", yy);
          el_table.htmlText("A<sub>x'</sub> [kN]", 1, "center", yy);
          el_table.htmlText("A<sub>z'</sub> [kN]", 2, "center", yy);
          if (System === 0) el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);

          doc.setFontSize(fs);
          doc.setFont("freesans_normal");
          yy = neueZeile(yy, fs, 1);

          for (let i = 0; i < nnodes; i++) {
            el_table.htmlText(String(+i + 1), 0, "center", yy);
            el_table.htmlText(myFormat(lagerkraefte_kombi._(i, 0, iKomb - 1), 2, 2), 1, "right", yy, 5);
            el_table.htmlText(myFormat(lagerkraefte_kombi._(i, 1, iKomb - 1), 2, 2), 2, "right", yy, 5);
            if (System === 0) el_table.htmlText(myFormat(lagerkraefte_kombi._(i, 2, iKomb - 1), 2, 2), 3, "right", yy, 5);
            yy = neueZeile(yy, fs, 1);
          }
        }


        //   Schnittgrößen Stäbe
        {
          let str_Vz = "V<sub>z</sub>"

          yy = testSeite(yy, fs, 1, 5);
          doc.setFont("freesans_bold");
          if (THIIO_flag === 0) {
            doc.text("Stabschnittgrößen und lokale Verformungen", links, yy);
          } else {
            if (ausgabe_gleichgewichtSG) {
              doc.text("Stabschnittgrößen und lokale Verformungen", links, yy);
              str_Vz = "T<sub>z</sub>"
            } else {
              doc.text("Nachweisschnittgrößen und lokale Verformungen", links, yy);
            }
          }
          yy = neueZeile(yy, fs, 1);

          for (let ielem = 0; ielem < nelem; ielem++) {

            if (!el[ielem].isActive) continue

            yy = neueZeile(yy, fs, 1);
            doc.setFont("freesans_bold");
            doc.text("Element " + (+ielem + 1), links, yy);
            yy = neueZeile(yy, fs, 1);

            let el_table = new pdf_table(doc, links, [20, 20, 20, 20, 20, 20, 20, 25]);
            if (System === 0) {
              el_table.htmlText("x [m]", 0, "center", yy);
              el_table.htmlText("N [kN]", 1, "center", yy);
              el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
              el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);
              el_table.htmlText("u<sub>xL</sub> [mm]", 4, "center", yy);
              el_table.htmlText("w<sub>zL</sub> [mm]", 5, "center", yy);
              el_table.htmlText("ß [mrad]", 6, "center", yy);
              if (nelem_Balken_Bettung > 0) {
                el_table.htmlText("press [kN/m]", 7, "center", yy);
              }
            } else {
              el_table.htmlText("x [m]", 0, "center", yy);
              el_table.htmlText("N [kN]", 1, "center", yy);
              // el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
              el_table.htmlText("u<sub>xL</sub> [mm]", 2, "center", yy);
              el_table.htmlText("w<sub>zL</sub> [mm]", 3, "center", yy);

            }
            doc.setFontSize(fs);
            doc.setFont("freesans_normal");
            yy = neueZeile(yy, fs, 1);

            const nelTeilungen = el[ielem].nTeilungen;
            let sg_M: number[] = new Array(nelTeilungen);
            let sg_V: number[] = new Array(nelTeilungen);
            let sg_N: number[] = new Array(nelTeilungen);

            let uL: number[] = new Array(nelTeilungen); // L = Verformung lokal
            let wL: number[] = new Array(nelTeilungen);
            let phiL: number[] = new Array(nelTeilungen);
            let press: number[] = new Array(nelTeilungen);

            const lf_index = iKomb - 1 + nlastfaelle;
            el[ielem].get_elementSchnittgroesse_Moment(sg_M, lf_index);
            el[ielem].get_elementSchnittgroesse_Querkraft(sg_V, lf_index, ausgabe_gleichgewichtSG);
            el[ielem].get_elementSchnittgroesse_Normalkraft(sg_N, lf_index, ausgabe_gleichgewichtSG);
            el[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index, false);
            el[ielem].get_elementSchnittgroesse_bettung(press, lf_index);

            for (let i = 0; i < nelTeilungen; i++) {
              if (System === 0) {
                el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
                el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
                el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
                el_table.htmlText(myFormat(sg_M[i], 2, 2), 3, "right", yy, 5);
                el_table.htmlText(myFormat(uL[i] * 1000, 3, 3), 4, "right", yy, 5);
                el_table.htmlText(myFormat(wL[i] * 1000, 3, 3), 5, "right", yy, 5);
                el_table.htmlText(myFormat(phiL[i] * 1000, 3, 3), 6, "right", yy, 5);
                if (nelem_Balken_Bettung > 0) {
                  el_table.htmlText(myFormat(press[i], 3, 3), 7, "right", yy, 5);
                }
              } else {
                el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
                el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
                // el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
                el_table.htmlText(myFormat(uL[i] * 1000, 3, 3), 2, "right", yy, 5);
                el_table.htmlText(myFormat(wL[i] * 1000, 3, 3), 3, "right", yy, 5);
              }
              yy = neueZeile(yy, fs, 1);
            }
          }
        }


        //   Schnittgrößen Koppelfedern
        if (nelem_koppelfedern > 0) {

          let str_Vz = "V<sub>z</sub>"

          yy = testSeite(yy, fs, 1, 5);
          doc.setFont("freesans_bold");
          if (THIIO_flag === 0) {
            doc.text("Koppelfedern-Schnittgrößen und lokale Verformungen", links, yy);
          } else {
            if (ausgabe_gleichgewichtSG) {
              doc.text("Koppelfedern-Schnittgrößen und lokale Verformungen", links, yy);
              str_Vz = "T<sub>z</sub>"
            } else {
              doc.text("Nachweisschnittgrößen und lokale Verformungen", links, yy);
            }
          }
          yy = neueZeile(yy, fs, 1);

          let ielem = 0

          for (let iel = 0; iel < nelem_koppelfedern; iel++) {

            ielem = iel + nelem_Balken

            if (!el[ielem].isActive) continue

            yy = neueZeile(yy, fs, 1);
            doc.setFont("freesans_bold");
            doc.text("Element " + (+iel + 1), links, yy);
            yy = neueZeile(yy, fs, 1);

            let el_table = new pdf_table(doc, links, [20, 20, 20, 20, 25, 25, 25]);

            el_table.htmlText("x [m]", 0, "center", yy);
            el_table.htmlText("N [kN]", 1, "center", yy);
            el_table.htmlText(str_Vz + " [kN]", 2, "center", yy);
            el_table.htmlText("M<sub>y</sub> [kNm]", 3, "center", yy);
            el_table.htmlText("Δu<sub>xL</sub> [mm]", 4, "center", yy);
            el_table.htmlText("Δw<sub>zL</sub> [mm]", 5, "center", yy);
            el_table.htmlText("Δφ [mrad]", 6, "center", yy);

            doc.setFontSize(fs);
            doc.setFont("freesans_normal");
            yy = neueZeile(yy, fs, 1);

            const nelTeilungen = el[ielem].nTeilungen;
            let sg_M: number[] = new Array(nelTeilungen);
            let sg_V: number[] = new Array(nelTeilungen);
            let sg_N: number[] = new Array(nelTeilungen);

            let uL: number[] = new Array(nelTeilungen); // L = Verformung lokal
            let wL: number[] = new Array(nelTeilungen);
            let phiL: number[] = new Array(nelTeilungen);

            const lf_index = iKomb - 1 + nlastfaelle;
            el[ielem].get_elementSchnittgroesse_Moment(sg_M, lf_index);
            el[ielem].get_elementSchnittgroesse_Querkraft(sg_V, lf_index, ausgabe_gleichgewichtSG);
            el[ielem].get_elementSchnittgroesse_Normalkraft(sg_N, lf_index, ausgabe_gleichgewichtSG);
            el[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index, false);

            for (let i = 0; i < 1; i++) {

              el_table.htmlText(myFormat(el[ielem].x_[i], 2, 2), 0, "center", yy);
              el_table.htmlText(myFormat(sg_N[i], 2, 2), 1, "right", yy, 5);
              el_table.htmlText(myFormat(sg_V[i], 2, 2), 2, "right", yy, 5);
              el_table.htmlText(myFormat(sg_M[i], 2, 2), 3, "right", yy, 5);
              el_table.htmlText(myFormat((uL[i + 1] - uL[i]) * 1000, 3, 3), 4, "right", yy, 5);
              el_table.htmlText(myFormat((wL[i + 1] - wL[i]) * 1000, 3, 3), 5, "right", yy, 5);
              el_table.htmlText(myFormat((phiL[i + 1] - phiL[i]) * 1000, 3, 3), 6, "right", yy, 5);

              yy = neueZeile(yy, fs, 1);
            }
          }
        }

      }

    }
  }  // Ende stadyn === 0   STATIK

  //   Eigenwerte

  if ((stadyn === 1) && (dyn_neigv > 0)) {

    yy = testSeite(yy, fs, 1, 5);
    doc.setFont("freesans_bold");
    doc.text("Eigenwerte", links, yy);

    doc.setFontSize(fs);
    doc.setFont("freesans_bold");
    yy = neueZeile(yy, fs1, 1);
    let el_table = new pdf_table(doc, links, [20, 20, 40]);
    el_table.htmlText("Eig No", 0, "left", yy);
    el_table.htmlText("Frequenz [Hz]", 1, "center", yy);
    el_table.htmlText("Periode [sec]", 2, "center", yy);

    doc.setFontSize(fs);
    doc.setFont("freesans_normal");
    yy = neueZeile(yy, fs, 1);

    for (let i = 0; i < dyn_neigv; i++) {
      el_table.htmlText(String(+i + 1), 0, "center", yy);
      el_table.htmlText(myFormat(dyn_omega[i] / 2 / Math.PI, 2, 2), 1, "right", yy, 5);
      el_table.htmlText(myFormat(2 * Math.PI / dyn_omega[i], 2, 2), 2, "right", yy, 15);
      yy = neueZeile(yy, fs, 1);
    }

    for (let ieigv = 0; ieigv < dyn_neigv; ieigv++) {
      //   Eigenformen
      {
        yy = testSeite(yy, fs, 1, 5);
        doc.setFont("freesans_bold");
        doc.text("Eigenform " + (+ieigv + 1), links, yy);
        //yy = neueZeile(yy, fs, 1)

        doc.setFontSize(fs);
        doc.setFont("freesans_bold");
        yy = neueZeile(yy, fs1, 1);
        let el_table = new pdf_table(doc, links, [20, 20, 20, 20]);
        el_table.htmlText("Node No", 0, "left", yy);
        el_table.htmlText("ψ<sub>u</sub>", 1, "center", yy);
        el_table.htmlText("ψ<sub>w</sub>", 2, "center", yy);
        if (System === 0) el_table.htmlText("ψ<sub>φ</sub>", 3, "center", yy);

        doc.setFontSize(fs);
        doc.setFont("freesans_normal");
        yy = neueZeile(yy, fs, 1);

        for (let i = 0; i < nnodes; i++) {
          el_table.htmlText(String(+i + 1), 0, "center", yy);
          el_table.htmlText(myFormat(eigenform_print._(i, 0, ieigv), 3, 3), 1, "right", yy, 5);
          el_table.htmlText(myFormat(eigenform_print._(i, 1, ieigv), 3, 3), 2, "right", yy, 5);
          if (System === 0) el_table.htmlText(myFormat(eigenform_print._(i, 2, ieigv), 3, 3), 3, "right", yy, 5);
          yy = neueZeile(yy, fs, 1);
        }
      }


    }
  }

  // -------------------------------------  S  V  G  --------------------------------------

  //Get svg markup as string
  let svg = document.getElementById("svg_artboard")!.innerHTML;

  if (svg) {
    svg = svg.replace(/\r?\n|\r/g, "").trim();
    svg = svg.substring(0, svg.indexOf("</svg>")) + "</svg>";
    // @ts-ignore
    svg = svg.replaceAll("  ", "");
    // console.log("svg", svg);

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    console.log("canvas", canvas.width, canvas.height);

    if (context != null) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const v = Canvg.fromString(context, svg);

      v.render();

      var imgData = canvas.toDataURL("image/png", 1);

      if ((yy + 200) > 275) {
        yy = neueSeite();
      } else {
        yy = neueZeile(yy, fs)
      }
      if (app.browserLanguage == 'de') {
        doc.text('System', links, yy)
      } else {
        doc.text('System', links, yy)
      }

      // if (svg_pdf_ratio > 1.0) {
      //   doc.addImage(imgData, "PNG", 5, yy, 200, 200 / svg_pdf_ratio);
      // } else {
      //   doc.addImage(imgData, "PNG", 5, yy, 200 * svg_pdf_ratio, 200);
      // }
      doc.addImage(imgData, "PNG", 5, yy, 200, 200);

      letzteSeite();
    }

  }

  // ---

  let filename: any = "d2beam.pdf";

  if (app.hasFSAccess && app.isMac) {
    filename = window.prompt(
      "Name der Datei mit Extension, z.B. d2beam.pdf\nDie Datei wird im Default Download Ordner gespeichert",
      "d2beam.pdf"
    );
  } else if (app.hasFSAccess) {
    // filename = window.prompt(
    //   "Name der Datei mit Extension, z.B. d2beam.pdf\nDie Datei wird im Default Download Ordner gespeichert",
    //   "d2beam.pdf"
    // );

    try {
      // @ts-ignore
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: currentFilenamePDF,
        startIn: lastFileHandlePDF,
        types: [{
          description: "pdf file",
          accept: { "application/pdf": [".pdf"] }
        }]
      });
      //console.log("fileHandle PDF", fileHandle)
      lastFileHandlePDF = fileHandle
      currentFilenamePDF = fileHandle.name

      const fileStream = await fileHandle.createWritable();
      //console.log("fileStream=",fileStream);

      let blobPDF = new Blob([doc.output('blob')], { type: 'application/pdf' });

      //  WRITE FILE
      await fileStream.write(blobPDF);
      await fileStream.close();

    } catch (error: any) {
      //alert(error.name);
      alert(error.message);
    }

    return
  }

  try {
    doc.save(filename);
  } catch (error: any) {
    alert(error.message);
  }

  //   document.getElementById("id_pdf_info").innerText = "pdf-file saved in your Download folder";

  // }
}
