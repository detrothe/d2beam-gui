import { drButtonPM } from "../components/dr-button-pm";

import { CAD_LAGER, CAD_STAB, list } from "./cad";
import { cad_buttons } from "./cad_buttons";
import { CADNodes } from "./cad_node";
import { TCAD_Lager, TCAD_Stab, TCADElement } from "./CCAD_element";
import { alertdialog, element, inc_nelem, inc_nnodes, nelem, nnodes, node, set_nelem, set_nelem_Balken_Bettung, set_nelemTotal, set_nnodes, set_nnodesTotal, TElement, TNode } from "./rechnen";
import { myFormat, myFormat_en } from "./utility";

export function cad_rechnen() {
    // Markiere alle Knoten /Punkte, an denen Stäbe hängen

    for (let i = 0; i < CADNodes.length; i++) CADNodes[i].nel = 0  // init

    set_nelem_Balken_Bettung(0)
    set_nelem(0)
    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Stab;
        if (obj.elTyp === CAD_STAB) {
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

            inc_nelem();
        }
    }
    set_nelemTotal(nelem)

    set_nnodes(0);
    node.length = 0

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].nel > 0) {
            node.push(new TNode())
            node[nnodes].x = CADNodes[i].x
            node[nnodes].z = CADNodes[i].z
            CADNodes[i].index_FE = nnodes
            inc_nnodes();
        }
    }

    set_nnodesTotal(nnodes)

    let el = document.getElementById("id_button_nnodes") as drButtonPM;
    el.setValue(nnodes);

    let elTab = document.getElementById("id_knoten_tabelle");
    elTab?.setAttribute("nzeilen", String(nnodes));
    elTab?.setAttribute("clear", "0");

    {
        let el = document.getElementById('id_knoten_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        let nSpalten = tabelle.rows[0].cells.length;

        for (let i = 1; i < tabelle.rows.length; i++) {
            console.log("node-xz", node[i - 1].x, node[i - 1].z)
            for (let j = 1; j < 3; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                if (j === 1) child.value = myFormat_en(node[i - 1].x, 2, 3);
                else if (j === 2) child.value = myFormat_en(node[i - 1].z, 2, 3);
            }
        }

        // jetzt die Lager


        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Lager;
            if (obj.elTyp === CAD_LAGER) {
                let index = obj.index1;
                console.log("CAD-LAger ", index)
                if (index > -1) {
                    let ind = CADNodes[index].index_FE
                    console.log("ind", ind)
                    if (ind < 0) alertdialog("ok", "Lager ind " + (ind) + "hängt an keinem Knoten, FATAL ERROR");
                    for (let j = 0; j < 3; j++) {
                        if (obj.node.L_org[j] === 1) {
                            let child = tabelle.rows[ind + 1].cells[j + 3].firstElementChild as HTMLInputElement;
                            child.value = '1'
                            node[ind].L_org[j] = node[ind].L[j] = 1
                        }
                    }
                } else {
                    alertdialog("ok", "Lager " + (+i + 1) + "hängt an keinem Knoten, FATAL ERROR");
                }

            }
        }

    }

    // jetzt die Staebe
    {

        let el = document.getElementById("id_button_nelem") as drButtonPM;
        el.setValue(nelem);

        const elTab = document.getElementById("id_element_tabelle");
        elTab?.setAttribute("nzeilen", String(nelem));
        elTab?.setAttribute("clear", "0");
    }



    {
        let el = document.getElementById('id_element_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        element.length = 0
        let nel = 0
        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Stab;
            if (obj.elTyp === CAD_STAB) {
                element.push(new TElement())

                let index = obj.index1;
                let ind1 = CADNodes[index].index_FE
                index = obj.index2;
                let ind2 = CADNodes[index].index_FE

                element[nel].qname='R 40x30'
                element[nel].nod[0] = ind1
                element[nel].nod[1] = ind2

                nel++

                let child = tabelle.rows[nel].cells[2].firstElementChild as HTMLInputElement;
                child.value = 'R 40x30'
                child = tabelle.rows[nel].cells[3].firstElementChild as HTMLInputElement;
                child.value = String(+ind1 + 1)
                child = tabelle.rows[nel].cells[4].firstElementChild as HTMLInputElement;
                child.value = String(+ind2 + 1)


            }
        }

    }

}


