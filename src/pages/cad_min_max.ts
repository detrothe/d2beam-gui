import { CAD_BEMASSUNG, CAD_KNLAST, CAD_KNMASSE, CAD_KNOTEN, CAD_KNOTVERFORMUNG, CAD_LAGER, CAD_STAB, list, set_raster_xmax, set_raster_xmin, set_raster_zmax, set_raster_zmin } from "./cad";
import { TCAD_Bemassung } from "./cad_bemassung";
import { CADNodes } from "./cad_node";
import { TCAD_Element, TCAD_Stab } from "./CCAD_element";
import { alertdialog } from "./rechnen";



export function cad_min_max() {


    console.log("in cad_min_max")
    let fatal_error = true;

    fatal_error = false;

    // Markiere alle Knoten /Punkte, an denen Stäbe hängen

    for (let i = 0; i < CADNodes.length; i++) CADNodes[i].nel = 0  // init


    let nNodeDisps = 0;

    let nnodalMass = 0
    let nknlast = 0
    let elNo = 0
    for (let i = 0; i < list.size; i++) {
        let obj = list.getNext(i) as TCAD_Stab;
        if (obj.elTyp === CAD_STAB) {
            elNo++;
            obj.elNo = elNo;
            let index = obj.index1;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Anfang von Stab " + (+i + 1) + "hängt an keinem Knoten, FATAL ERROR");
            }
            index = obj.index2;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Ende von Stab " + (+i + 1) + "hängt an keinem Knoten, FATAL ERROR");
            }

        }
    }


    // User-Knoten korrigieren

    for (let i = 0; i < list.size; i++) {
        let obj = list.getNext(i) as TCAD_Element;
        if (obj.elTyp === CAD_KNOTEN || obj.elTyp === CAD_KNLAST || obj.elTyp === CAD_KNOTVERFORMUNG
            || obj.elTyp === CAD_LAGER || obj.elTyp === CAD_KNMASSE) {
            let index = obj.index1;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "User-Knoten " + (+i + 1) + "hat keinen Index, FATAL ERROR");
            }
        }
        else if (obj.elTyp === CAD_BEMASSUNG) {
            let index = obj.index1;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Bemassung " + (+i + 1) + "hat keinen Index1, FATAL ERROR");
            }
            index = (obj as TCAD_Bemassung).index2;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Bemassung " + (+i + 1) + "hat keinen Index2, FATAL ERROR");
            }
            index = (obj as TCAD_Bemassung).index3;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Bemassung " + (+i + 1) + "hat keinen Index3, FATAL ERROR");
            }
            index = (obj as TCAD_Bemassung).index4;
            if (index > -1) {
                CADNodes[index].nel++;
            } else {
                alertdialog("ok", "Bemassung " + (+i + 1) + "hat keinen Index4, FATAL ERROR");
            }
        }
    }

    let xmin = 1.e30
    let zmin = 1.e30
    let xmax = -1.e30
    let zmax = -1.e30

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].nel > 0) {
            if (CADNodes[i].x < xmin) xmin = CADNodes[i].x;
            if (CADNodes[i].z < zmin) zmin = CADNodes[i].z;
            if (CADNodes[i].x > xmax) xmax = CADNodes[i].x;
            if (CADNodes[i].z > zmax) zmax = CADNodes[i].z;

        }
    }

    if (xmin < 1.30 && zmin < 1.e30) {
        let dx = xmax - xmin;
        let dz = zmax - zmin;

        set_raster_xmin(xmin - 0.15 * dx);
        set_raster_xmax(xmax + 0.15 * dx);
        set_raster_zmin(zmin - 0.15 * dz);
        set_raster_zmax(zmax + 0.15 * dz);
    }

}