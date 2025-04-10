import { drButtonPM } from "../components/dr-button-pm";

import { CAD_KNLAST, CAD_LAGER, CAD_STAB, list } from "./cad";
import { cad_buttons } from "./cad_buttons";
import { max_Lastfall } from "./cad_draw_elementlasten";
import { CADNodes } from "./cad_node";
import { TCAD_Knotenlast, TCAD_Lager, TCAD_Stab, TCAD_Streckenlast, TCAD_Temperaturlast, TCAD_ElLast, TCAD_Einzellast, TCAD_Vorspannung, TCAD_Spannschloss } from "./CCAD_element";
import {
    alertdialog, element, eload, inc_nelem, inc_nnodes, load, maxValue_eload, nelem, nelem_Balken, nlastfaelle, nnodes, node,
    nstreckenlasten, ntemperaturlasten, set_nelem, set_nelem_Balken, set_nelem_Balken_Bettung, set_nelemTotal, set_neloads, set_nkombinationen,
    set_nlastfaelle, set_nloads, set_nnodes, set_nnodesTotal, set_ntotalEloads, TElement, TElLoads, TLoads, TNode
} from "./rechnen";
import { myFormat, myFormat_en, write } from "./utility";



export function cad_rechnen() {

    let fatal_error = false;


    // Markiere alle Knoten /Punkte, an denen Stäbe hängen

    for (let i = 0; i < CADNodes.length; i++) CADNodes[i].nel = 0  // init

    set_nelem_Balken_Bettung(0)
    set_nelem(0)

    let nknlast = 0
    let elNo = 0
    for (let i = 0; i < list.size; i++) {
        let obj = list.getAt(i) as TCAD_Stab;
        if (obj.elTyp === CAD_KNLAST) nknlast++;
        else if (obj.elTyp === CAD_STAB) {
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

            inc_nelem();
        }
    }
    set_nelem_Balken(nelem)
    set_nelemTotal(nelem)
    set_nloads(nknlast)

    set_nnodes(0);
    node.length = 0

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].nel > 0) {
            node.push(new TNode())
            node[nnodes].x = CADNodes[i].x
            node[nnodes].z = CADNodes[i].z
            node[nnodes].is_used = true
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
                console.log("CAD-Lager ", index)
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
                    let child = tabelle.rows[ind + 1].cells[6].firstElementChild as HTMLInputElement;
                    child.value = String(obj.node.phi)
                    node[ind].phi = obj.node.phi
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
        elTab?.setAttribute("nzeilen", '0');
        elTab?.setAttribute("nzeilen", String(nelem));
        //elTab?.setAttribute("clear", "0");
    }



    {
        let el = document.getElementById('id_element_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        element.length = 0
        let ielem = 0
        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Stab;
            if (obj.elTyp === CAD_STAB) {
                element.push(new TElement())

                let index = obj.index1;
                let nod1 = CADNodes[index].index_FE
                index = obj.index2;
                let nod2 = CADNodes[index].index_FE

                element[ielem].qname = obj.name_querschnitt
                element[ielem].nod[0] = nod1
                element[ielem].nod[1] = nod2

                element[ielem].x1 = node[nod1].x;
                element[ielem].x2 = node[nod2].x;
                element[ielem].z1 = node[nod1].z;
                element[ielem].z2 = node[nod2].z;


                const dx = element[ielem].x2 - element[ielem].x1;
                const dz = element[ielem].z2 - element[ielem].z1;
                element[ielem].sl = Math.sqrt(dx * dx + dz * dz);      // Stablänge

                if (element[ielem].sl < 1e-12) {
                    write("Länge von Element " + String(ielem + 1) + " ist null")
                    element[ielem].cosinus = 1.0
                    element[ielem].sinus = 0.0
                    element[ielem].alpha = 0.0
                } else {
                    element[ielem].cosinus = dx / element[ielem].sl
                    element[ielem].sinus = dz / element[ielem].sl
                    element[ielem].alpha = Math.atan2(dz, dx)
                }

                for (let i = 0; i < 6; i++) element[ielem].gelenk[i] = obj.gelenk[i];
                element[ielem].nGelenke = obj.nGelenke;

                element[ielem].aL = obj.aL
                element[ielem].aR = obj.aR
                element[ielem].k_0 = obj.k_0

                ielem++

                let child = tabelle.rows[ielem].cells[1].firstElementChild as HTMLInputElement;
                console.log("CHILD", child)
                child.value = obj.name_querschnitt
                //child.innerHTML = obj.name_querschnitt
                child = tabelle.rows[ielem].cells[3].firstElementChild as HTMLInputElement;
                child.value = String(+nod1 + 1)
                child = tabelle.rows[ielem].cells[4].firstElementChild as HTMLInputElement;
                child.value = String(+nod2 + 1)

                for (let i = 0; i < 6; i++) {
                    if (obj.gelenk[i] === 1) {
                        child = tabelle.rows[ielem].cells[5 + i].firstElementChild as HTMLInputElement;
                        child.value = '1'
                    }
                }
                child = tabelle.rows[ielem].cells[11].firstElementChild as HTMLInputElement;
                child.value = String(obj.aL)
                child = tabelle.rows[ielem].cells[12].firstElementChild as HTMLInputElement;
                child.value = String(obj.aR)
                child = tabelle.rows[ielem].cells[13].firstElementChild as HTMLInputElement;
                child.value = String(obj.k_0)

            }
        }

    }

    {  // Tabellen für Lastfälle und Kombinationen initialisieren

        set_nlastfaelle(max_Lastfall)
        let el = document.getElementById("id_button_nlastfaelle") as drButtonPM;
        el.setValue(max_Lastfall);
        let elTab = document.getElementById("id_lastfaelle_tabelle");
        elTab?.setAttribute("nzeilen", String(max_Lastfall));

        // set_nkombinationen(0)
        // el = document.getElementById("id_button_nkombinationen") as drButtonPM;
        // el.setValue(0);
        // elTab = document.getElementById("id_kombinationen_tabelle");
        // elTab?.setAttribute("nzeilen", '0');
    }

    // jetzt die Knotenlasten

    {

        let el = document.getElementById("id_button_nnodalloads") as drButtonPM;
        el.setValue(nknlast);

        const elTab = document.getElementById("id_knotenlasten_tabelle");
        elTab?.setAttribute("nzeilen", String(nknlast));

        load.length = 0

        if (nknlast > 0) {
            elTab?.setAttribute("clear", "0");

            let tabelle = elTab?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

            let nel = 0
            for (let i = 0; i < list.size; i++) {
                let obj = list.getAt(i) as TCAD_Knotenlast;
                if (obj.elTyp === CAD_KNLAST) {
                    load.push(new TLoads())
                    let index = obj.index1;
                    let ind = CADNodes[index].index_FE
                    if (ind > -1) {
                        load[nel].lf = obj.knlast.lf
                        load[nel].Px = obj.knlast.Px
                        load[nel].Pz = obj.knlast.Pz
                        load[nel].p[2] = obj.knlast.p[2]
                        load[nel].node = ind
                    }
                    nel++

                    let child = tabelle.rows[nel].cells[1].firstElementChild as HTMLInputElement;
                    child.value = String(+ind + 1)
                    child = tabelle.rows[nel].cells[2].firstElementChild as HTMLInputElement;
                    child.value = String(obj.knlast.lf)
                    child = tabelle.rows[nel].cells[3].firstElementChild as HTMLInputElement;
                    child.value = String(obj.knlast.Px)
                    child = tabelle.rows[nel].cells[4].firstElementChild as HTMLInputElement;
                    child.value = String(obj.knlast.Pz)
                    child = tabelle.rows[nel].cells[5].firstElementChild as HTMLInputElement;
                    child.value = String(obj.knlast.p[2])
                }

            }
        }
    }


    // jetzt die Streckenlasten

    {

        // Eigengewicht für Balken

        eload.length = 0
        for (let i = 0; i < nelem_Balken; i++) {
            eload.push(new TElLoads())
            eload[i].element = i
            eload[i].lf = 1
            eload[i].art = 1
        }

        let nStreckenlasten = 0
        let nTemperaturlasten = 0
        let nEinzellasten = 0
        let nVorspannungen = 0
        let nSpannschloesser = 0
        let nStabvorverfomungen = 0

        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Stab;
            if (obj.elTyp === CAD_STAB) {
                for (let j = 0; j < obj.elast.length; j++) {
                    let typ = obj.elast[j].typ
                    if (typ === 0) {
                        nStreckenlasten++;
                    } else if (typ === 1) {
                        nEinzellasten++
                    } else if (typ === 2) {
                        nTemperaturlasten++
                    } else if (typ === 3) {
                        nVorspannungen++
                    } else if (typ === 4) {
                        nSpannschloesser++
                    } else if (typ === 5) {
                        nStabvorverfomungen++
                    }
                }
            }
        }
        console.log("nTemperaturlasten,nStreckenlasten,...", nTemperaturlasten, nStreckenlasten, nEinzellasten, nVorspannungen, nSpannschloesser, nStabvorverfomungen)

        // Streckenlasten
        let el = document.getElementById("id_button_nstreckenlasten") as drButtonPM;
        el.setValue(nStreckenlasten);

        const elTabStreckenlast = document.getElementById("id_streckenlasten_tabelle");
        elTabStreckenlast?.setAttribute("nzeilen", String(nStreckenlasten));
        elTabStreckenlast?.setAttribute("clear", "0");

        let tabelleStreckenlast = elTabStreckenlast?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        // Einzellastenlasten
        el = document.getElementById("id_button_neinzellasten") as drButtonPM;
        el.setValue(nEinzellasten);

        const elTabEinzellast = document.getElementById("id_einzellasten_tabelle");
        elTabEinzellast?.setAttribute("nzeilen", String(nEinzellasten));
        elTabEinzellast?.setAttribute("clear", "0");

        let tabelleEinzellast = elTabEinzellast?.shadowRoot?.getElementById('mytable') as HTMLTableElement;


        // Temperaturlasten
        el = document.getElementById("id_button_ntemperaturlasten") as drButtonPM;
        el.setValue(nTemperaturlasten);

        const elTabTemplast = document.getElementById("id_temperaturlasten_tabelle");
        elTabTemplast?.setAttribute("nzeilen", String(nTemperaturlasten));
        elTabTemplast?.setAttribute("clear", "0");

        let tabelleTemplast = elTabTemplast?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        // Vorspannung
        el = document.getElementById("id_button_nvorspannungen") as drButtonPM;
        el.setValue(nVorspannungen);

        const elTabVorspannung = document.getElementById("id_vorspannungen_tabelle");
        elTabVorspannung?.setAttribute("nzeilen", String(nVorspannungen));
        elTabVorspannung?.setAttribute("clear", "0");

        let tabelleVorspannung = elTabVorspannung?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        // Spannschloss
        el = document.getElementById("id_button_nspannschloesser") as drButtonPM;
        el.setValue(nSpannschloesser);

        const elTabSpannschloss = document.getElementById("id_spannschloesser_tabelle");
        elTabSpannschloss?.setAttribute("nzeilen", String(nSpannschloesser));
        elTabSpannschloss?.setAttribute("clear", "0");

        let tabelleSpannschloss = elTabSpannschloss?.shadowRoot?.getElementById('mytable') as HTMLTableElement;


        let ielem = nelem_Balken
        let irowStreckenlast = 1
        let irowTemplast = 1
        let irowEinzellast = 1
        let irowVorspannung = 1
        let irowSpannschloss = 1
        for (let i = 0; i < list.size; i++) {
            let obj = list.getAt(i) as TCAD_Stab;
            if (obj.elTyp === CAD_STAB) {

                if (obj.elast.length > 0) {
                    for (let j = 0; j < obj.elast.length; j++) {

                        let lf = (obj.elast[j] as TCAD_ElLast).lastfall
                        if (lf > nlastfaelle) {
                            fatal_error = true;
                            write('Stab ' + obj.elNo + ', Lastfall einer Elementlast ist größer als in Tab Kombinationen definiert: ' + lf + ': Nummer des Lastfalls muss <= Anzahl Lastfälle sein');
                        }
                        let typ = obj.elast[j].typ
                        if (typ === 0) { // Streckenlast


                            let art = (obj.elast[j] as TCAD_Streckenlast).art
                            let pL = (obj.elast[j] as TCAD_Streckenlast).pL
                            let pR = (obj.elast[j] as TCAD_Streckenlast).pR
                            //console.log("typeof", typeof obj.elast[j], lf)
                            eload.push(new TElLoads())
                            eload[ielem].element = obj.elNo - 1
                            eload[ielem].lf = lf
                            eload[ielem].art = art
                            eload[ielem].pL = pL
                            eload[ielem].pR = pR
                            ielem++;

                            let child = tabelleStreckenlast.rows[irowStreckenlast].cells[1].firstElementChild as HTMLInputElement;
                            child.value = String(obj.elNo)
                            child = tabelleStreckenlast.rows[irowStreckenlast].cells[2].firstElementChild as HTMLInputElement;
                            child.value = String(lf)
                            child = tabelleStreckenlast.rows[irowStreckenlast].cells[3].firstElementChild as HTMLInputElement;
                            child.value = String(art)
                            child = tabelleStreckenlast.rows[irowStreckenlast].cells[4].firstElementChild as HTMLInputElement;
                            child.value = String(pL)
                            child = tabelleStreckenlast.rows[irowStreckenlast].cells[5].firstElementChild as HTMLInputElement;
                            child.value = String(pR)
                            irowStreckenlast++;
                        }
                        else if (typ === 1) {
                            let x = (obj.elast[j] as TCAD_Einzellast).xe
                            let P = (obj.elast[j] as TCAD_Einzellast).P
                            let M = (obj.elast[j] as TCAD_Einzellast).M

                            eload.push(new TElLoads())
                            eload[ielem].element = obj.elNo - 1
                            eload[ielem].lf = lf
                            eload[ielem].art = 6
                            eload[ielem].x = x
                            eload[ielem].P = P
                            eload[ielem].M = M
                            ielem++;

                            let child = tabelleEinzellast.rows[irowEinzellast].cells[1].firstElementChild as HTMLInputElement;
                            child.value = String(obj.elNo)
                            child = tabelleEinzellast.rows[irowEinzellast].cells[2].firstElementChild as HTMLInputElement;
                            child.value = String(lf)
                            child = tabelleEinzellast.rows[irowEinzellast].cells[3].firstElementChild as HTMLInputElement;
                            child.value = String(x)
                            child = tabelleEinzellast.rows[irowEinzellast].cells[4].firstElementChild as HTMLInputElement;
                            child.value = String(P)
                            child = tabelleEinzellast.rows[irowEinzellast].cells[5].firstElementChild as HTMLInputElement;
                            child.value = String(M)
                            irowEinzellast++;
                        }
                        else if (typ === 2) {

                            let To = (obj.elast[j] as TCAD_Temperaturlast).To
                            let Tu = (obj.elast[j] as TCAD_Temperaturlast).Tu
                            //console.log("typeof", typeof obj.elast[j], lf)
                            eload.push(new TElLoads())
                            eload[ielem].element = obj.elNo - 1
                            eload[ielem].lf = lf
                            eload[ielem].art = 5
                            eload[ielem].To = To
                            eload[ielem].Tu = Tu
                            ielem++;

                            let child = tabelleTemplast.rows[irowTemplast].cells[1].firstElementChild as HTMLInputElement;
                            child.value = String(obj.elNo)
                            child = tabelleTemplast.rows[irowTemplast].cells[2].firstElementChild as HTMLInputElement;
                            child.value = String(lf)
                            child = tabelleTemplast.rows[irowTemplast].cells[3].firstElementChild as HTMLInputElement;
                            child.value = String(Tu)
                            child = tabelleTemplast.rows[irowTemplast].cells[4].firstElementChild as HTMLInputElement;
                            child.value = String(To)
                            irowTemplast++;
                        }
                        else if (typ === 3) {

                            let sigmaV = (obj.elast[j] as TCAD_Vorspannung).sigmaV

                            eload.push(new TElLoads())
                            eload[ielem].element = obj.elNo - 1
                            eload[ielem].lf = lf
                            eload[ielem].art = 9
                            eload[ielem].sigmaV = sigmaV * 1000.0; //von MN/m² in kN/m²
                            ielem++;

                            let child = tabelleVorspannung.rows[irowVorspannung].cells[1].firstElementChild as HTMLInputElement;
                            child.value = String(obj.elNo)
                            child = tabelleVorspannung.rows[irowVorspannung].cells[2].firstElementChild as HTMLInputElement;
                            child.value = String(lf)
                            child = tabelleVorspannung.rows[irowVorspannung].cells[3].firstElementChild as HTMLInputElement;
                            child.value = String(sigmaV)
                            irowVorspannung++;
                        }
                        else if (typ === 4) {

                            let ds = (obj.elast[j] as TCAD_Spannschloss).ds

                            eload.push(new TElLoads())
                            eload[ielem].element = obj.elNo - 1
                            eload[ielem].lf = lf
                            eload[ielem].art = 10
                            eload[ielem].delta_s = ds / 1000.;  // von mm in m
                            ielem++;

                            let child = tabelleSpannschloss.rows[irowSpannschloss].cells[1].firstElementChild as HTMLInputElement;
                            child.value = String(obj.elNo)
                            child = tabelleSpannschloss.rows[irowSpannschloss].cells[2].firstElementChild as HTMLInputElement;
                            child.value = String(lf)
                            child = tabelleSpannschloss.rows[irowSpannschloss].cells[3].firstElementChild as HTMLInputElement;
                            child.value = String(ds)
                            irowSpannschloss++;
                        }
                    }
                }
            }
        }

        set_neloads(nelem_Balken + nStreckenlasten + nTemperaturlasten + nEinzellasten + nVorspannungen + nSpannschloesser);
        set_ntotalEloads(nelem_Balken + nStreckenlasten + nTemperaturlasten + nEinzellasten + nVorspannungen + nSpannschloesser)
    }

    return fatal_error;

}
