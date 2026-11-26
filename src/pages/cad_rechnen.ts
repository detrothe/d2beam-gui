import { msg, str } from '@lit/localize';
import { drButtonPM } from "../components/dr-button-pm";

import { alertdialog } from "./confirm_dialog"

import { CAD_BEMASSUNG, CAD_KNLAST, CAD_KNMASSE, CAD_KNOTEN, CAD_KNOTVERFORMUNG, CAD_LAGER, CAD_STAB, list } from "./cad";
import { TCAD_Bemassung } from "./cad_bemassung";
import { cad_buttons } from "./cad_buttons";
import { max_Lastfall, new_max_lastfall, set_max_lastfall } from "./cad_draw_elementlasten";
import { CADNodes } from "./cad_node";
import { TCAD_Knotenlast, TCAD_Lager, TCAD_Stab, TCAD_Streckenlast, TCAD_Temperaturlast, TCAD_ElLast, TCAD_Einzellast, TCAD_Vorspannung, TCAD_Spannschloss, TCAD_Stabvorverformung, TCAD_Knotenmasse, TCAD_Knoten, TCAD_Knotenverformung, TCAD_Element } from "./CCAD_element";
import {
    element, eload, FACHWERK, inc_nelem, inc_nnodes, load, maxValue_eload, nelem, nelem_Balken, nnodes, nodalmass, node,
    nodeDisp0,
    nstreckenlasten, ntemperaturlasten, set_maxBettung, set_maxU_node, set_neinzellasten, set_nelem, set_nelem_Balken, set_nelem_Balken_Bettung, set_nelemTotal, set_neloads, set_nkombinationen,
    set_nlastfaelle, set_nloads, set_nnodalMass, set_nNodeDisps, set_nnodes, set_nnodesTotal, set_nspannschloesser, set_nstabvorverfomungen, set_nstreckenlasten, set_ntemperaturlasten, set_ntotalEloads, set_nvorspannungen, stabvorverformung, System, TElement, TElLoads, TLoads, TMass, TNode,
    TNodeDisp,
    TStabvorverformung
} from "./rechnen";
import { myFormat, myFormat_en, testNumber, write } from "./utility";
import { fange_punkt, stab_teilen, vorverformung_teil } from "./cad_netz";

// Teilung eines CAD-Stabes in FE-Elemente (siehe cad_netz.ts)
interface TTeilPlan {
    obj: TCAD_Stab
    nod: number[]          // FE-Knoten an den Teilungspunkten
    xs: number[]           // Teilungspunkte ab Beginn des elastischen Stabteils
    feste: number[]        // Teilungspunkte aus Lasten und Stabenden
    L_el: number           // elastische Länge
    tol: number            // Fangtoleranz für Lastpunkte
    teilbar: boolean       // Biegestab (Fachwerkstäbe werden nicht geteilt)
    elem0: number          // Index des ersten Teilelements
    co: number
    si: number
}



// Anzahl der Eingabefehler, die cad_rechnen ins Ausgabefeld geschrieben hat; check_input zählt sie mit,
// damit "Anzahl Fehler in Eingabe" zur Meldung "Eingabefehler bitte erst beheben" passt
let anzahl_fehler_cad = 0;
export function get_anzahl_fehler_cad() { return anzahl_fehler_cad; }

export function cad_rechnen() {

    console.log("in cad_rechnen")
    let fatal_error = true;

    const elHaupt = document.getElementById('id_haupt');
    let shadow = elHaupt?.shadowRoot;
    if (!shadow) return fatal_error;

    let anzahl_festhaltungen = 0
    fatal_error = false;
    anzahl_fehler_cad = 0;
    let check_max_lastfall = 1   // für Eigengewichtslastfall

    // Markiere alle Knoten /Punkte, an denen Stäbe hängen

    for (let i = 0; i < CADNodes.length; i++) CADNodes[i].nel = 0  // init

    set_nelem_Balken_Bettung(0)
    set_nelem(0)

    let nNodeDisps = 0;

    let nnodalMass = 0
    let nknlast = 0
    let elNo = 0
    for (let i = 0; i < list.size; i++) {
        let obj = list.getNext(i) as TCAD_Stab;
        if (obj.elTyp === CAD_KNLAST) nknlast++;
        else if (obj.elTyp === CAD_KNMASSE) nnodalMass++;
        else if (obj.elTyp === CAD_KNOTVERFORMUNG) nNodeDisps++;
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
    set_nelem_Balken(nelem);
    set_nelemTotal(nelem);
    set_nloads(nknlast);
    set_nNodeDisps(nNodeDisps);


    set_nnodes(0);
    node.length = 0

    // alte FE-Nummern verwerfen: ein Knoten, der früher an einem Stab hing, behielt sonst seine
    // Nummer, und Lager/Lasten daran landeten nach dem Löschen von Stäben auf einem anderen Knoten
    for (let i = 0; i < CADNodes.length; i++) CADNodes[i].index_FE = -1

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].nel > 0) {
            node.push(new TNode())
            node[nnodes].x = CADNodes[i].x
            node[nnodes].z = CADNodes[i].z
            node[nnodes].is_used = true
            CADNodes[i].index_FE = nnodes
            if (System === FACHWERK) node[nnodes].L_org[2] = node[nnodes].L[2] = 1;   // Drehfreiheitsgrad festhalten
            inc_nnodes();
        }
    }

    set_nnodesTotal(nnodes)

    // deckungsgleiche Knoten (z. B. aus älteren Dateien oder durch Verschieben entstanden): die Stäbe
    // daran sehen verbunden aus, sind es statisch aber nicht -> melden statt falsch rechnen
    for (let i = 0; i < nnodes; i++) {
        for (let j = i + 1; j < nnodes; j++) {
            const dx = node[i].x - node[j].x, dz = node[i].z - node[j].z;
            if (dx * dx + dz * dz < 0.01 * 0.01) {
                write(msg(str`Am Ort (x=${node[i].x}, z=${node[i].z}) liegen zwei Knoten übereinander, die Stäbe daran sind nicht miteinander verbunden`));
                fatal_error = true; anzahl_fehler_cad++;
            }
        }
    }

    // Knotenelemente an Knoten ohne Stab gehen nicht in die Berechnung ein -> klare Meldung
    for (const obj of list) {
        let name = ''
        if (obj.elTyp === CAD_LAGER) name = msg('Lager')
        else if (obj.elTyp === CAD_KNLAST) name = msg('Knotenlast')
        else if (obj.elTyp === CAD_KNOTVERFORMUNG) name = msg('Knotenverformung')
        else if (obj.elTyp === CAD_KNMASSE) name = msg('Knotenmasse')
        else continue
        const k = CADNodes[obj.index1]
        if (k.index_FE < 0) {
            write(msg(str`${name} bei (x=${k.x}, z=${k.z}): an diesem Knoten hängt kein Stab`))
            fatal_error = true; anzahl_fehler_cad++;
        }
    }

    //          E l e m e n t t e i l u n g
    //
    // Jeder CAD-Stab wird in Teilelemente zerlegt: Knoten an Einzellasten, an den Grenzen von
    // Teilstreckenlasten und dazwischen nach der gewünschten Anzahl Elemente. Positionen x sind ab
    // Beginn des elastischen Stabteils gemessen. Neue Knoten werden hinter den CAD-Knoten angehängt.

    const plaene: TTeilPlan[] = []
    const knotenlasten_einzellast: TLoads[] = []                  // Einzellasten an Zwischenknoten bzw. Längsanteil am Stabende
    const einzellasten_art6: { element: number, lf: number, x: number, P: number, M: number }[] = []

    {
        // Systemgröße für die Fangtoleranz: Diagonale um alle Knoten
        let xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity
        for (let i = 0; i < nnodes; i++) {
            xmin = Math.min(xmin, node[i].x); xmax = Math.max(xmax, node[i].x)
            zmin = Math.min(zmin, node[i].z); zmax = Math.max(zmax, node[i].z)
        }
        const D = nnodes > 0 ? Math.sqrt((xmax - xmin) ** 2 + (zmax - zmin) ** 2) : 1.0

        let ielem = 0
        for (let i = 0; i < list.size; i++) {
            const obj = list.getNext(i) as TCAD_Stab;
            if (obj.elTyp !== CAD_STAB) continue

            const nodA = CADNodes[obj.index1].index_FE
            const nodB = CADNodes[obj.index2].index_FE
            const dx = node[nodB].x - node[nodA].x
            const dz = node[nodB].z - node[nodA].z
            const L = Math.sqrt(dx * dx + dz * dz)
            const co = L > 1e-12 ? dx / L : 1.0
            const si = L > 1e-12 ? dz / L : 0.0
            const L_el = L - obj.aL - obj.aR
            const teilbar = System !== FACHWERK && obj.get_stabtyp() === 0 && L_el > 1e-9
            const tol = Math.min(0.01 * L_el, 1e-3 * D)
            const eps = 1e-9 * Math.max(1.0, L)

            if (L > 1e-12 && L_el <= 1e-9) {
                write(msg(str`Stab ${obj.elNo}: die starren Enden sind zusammen nicht kürzer als der Stab`))
                fatal_error = true; anzahl_fehler_cad++;
            }

            let teilung = { xs: [0.0, Math.max(L_el, 0.0)], feste: [0.0, Math.max(L_el, 0.0)], hinweise: [] as string[] }
            if (teilbar) {
                const p_einzel: number[] = [], p_strecke: number[] = []
                for (const last of obj.elast) {
                    if (last.typ === 1) p_einzel.push((last as TCAD_Einzellast).xe)
                    else if (last.typ === 0) {
                        p_strecke.push((last as TCAD_Streckenlast).xa)
                        if ((last as TCAD_Streckenlast).xb >= 0.0) p_strecke.push((last as TCAD_Streckenlast).xb)
                    }
                }
                teilung = stab_teilen(L_el, obj.nTeil, tol, p_einzel, p_strecke)
                for (const h of teilung.hinweise) write(msg(str`Stab ${obj.elNo}: Lastpunkt zusammengefasst (Abstand kleiner ${myFormat(tol, 1, 4)} m): ${h}`))
            }

            // FE-Knoten entlang des Stabes
            const nod = [nodA]
            for (let k = 1; k < teilung.xs.length - 1; k++) {
                const s = obj.aL + teilung.xs[k]
                node.push(new TNode())
                node[nnodes].x = node[nodA].x + co * s
                node[nnodes].z = node[nodA].z + si * s
                node[nnodes].is_used = true
                nod.push(nnodes)
                inc_nnodes();
            }
            nod.push(nodB)

            const plan: TTeilPlan = { obj, nod, xs: teilung.xs, feste: teilung.feste, L_el, tol, teilbar, elem0: ielem, co, si }
            plaene.push(plan)
            const n = teilung.xs.length - 1
            ielem += n

            // Einzellasten: an Zwischenknoten als Knotenlast; am Rand des elastischen Teils Quer-
            // anteil und Moment als Elementlast (Lastseite eines Gelenks, Hebelarm starres Ende),
            // Längsanteil als Knotenlast am Endknoten (der starre Arm liegt in Stabrichtung)
            for (const last of obj.elast) {
                if (last.typ !== 1) continue
                const el_last = last as TCAD_Einzellast
                if (!teilbar) {
                    write(msg(str`Stab ${obj.elNo}: Einzellasten sind auf Fachwerkstäben nicht möglich`))
                    fatal_error = true; anzahl_fehler_cad++;
                    continue
                }
                if (el_last.xe < -eps || el_last.xe > L_el + eps) {
                    write(msg(str`Stab ${obj.elNo}: Angriffspunkt der Einzellast x=${el_last.xe} liegt nicht im elastischen Stabteil (0 bis ${myFormat(L_el, 1, 3)} m)`))
                    fatal_error = true; anzahl_fehler_cad++;
                    continue
                }
                const [Pxg, Pzg] = el_last.get_global(co, si)
                const M = el_last.M
                const lf = el_last.lastfall
                const x = fange_punkt(Math.min(Math.max(el_last.xe, 0.0), L_el), teilung.feste, tol)

                if (x <= eps || x >= L_el - eps) {
                    const links = x <= eps
                    const N = Pxg * co + Pzg * si          // Längsanteil
                    const Q = -Pxg * si + Pzg * co         // Queranteil (lokal z)
                    const e = links ? ielem - n : ielem - 1
                    if (Q !== 0.0 || M !== 0.0) {
                        einzellasten_art6.push({ element: e, lf, x: links ? 0.0 : teilung.xs[n] - teilung.xs[n - 1], P: Q, M })
                    }
                    if (Math.abs(N) > 1e-12) {
                        if (obj.gelenk[links ? 0 : 3] === 1) {
                            write(msg(str`Stab ${obj.elNo}: Einzellast mit Längsanteil am Stabende mit Normalkraftgelenk ist nicht möglich`))
                            fatal_error = true; anzahl_fehler_cad++;
                        } else {
                            const kl = new TLoads()
                            kl.node = links ? nodA : nodB; kl.lf = lf
                            kl.Px = kl.Px_org = N * co; kl.Pz = kl.Pz_org = N * si; kl.p[2] = 0.0
                            knotenlasten_einzellast.push(kl)
                        }
                    }
                } else {
                    const k = teilung.xs.indexOf(x)
                    const kl = new TLoads()
                    kl.node = nod[k]; kl.lf = lf
                    kl.Px = kl.Px_org = Pxg; kl.Pz = kl.Pz_org = Pzg; kl.p[2] = M
                    knotenlasten_einzellast.push(kl)
                }
            }
        }

        set_nnodesTotal(nnodes)
        set_nelem(ielem)
        set_nelem_Balken(ielem)
        set_nelemTotal(ielem)
    }

    let el = shadow.getElementById("id_button_nnodes") as drButtonPM;
    el.setValue(nnodes);

    let elTab = shadow.getElementById("id_knoten_tabelle");
    elTab?.setAttribute("nzeilen", String(nnodes));
    elTab?.setAttribute("clear", "0");

    {
        let el = shadow.getElementById('id_knoten_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
        let nSpalten = tabelle.rows[0].cells.length;

        for (let i = 1; i < tabelle.rows.length; i++) {
            //console.log("node-xz", node[i - 1].x, node[i - 1].z)
            for (let j = 1; j < 3; j++) {
                let child = tabelle.rows[i].cells[j].firstElementChild as HTMLInputElement;
                if (j === 1) child.value = myFormat_en(node[i - 1].x, 2, 3);
                else if (j === 2) child.value = myFormat_en(node[i - 1].z, 2, 3);
            }
        }

        // jetzt die Lager


        let ndof = 3
        if (System === FACHWERK) ndof = 2

        for (let i = 0; i < list.size; i++) {
            let obj = list.getNext(i) as TCAD_Lager;
            if (obj.elTyp === CAD_LAGER) {
                let index = obj.index1;
                //console.log("CAD-Lager ", index)
                if (index > -1) {
                    let ind = CADNodes[index].index_FE
                    //console.log("ind", ind)
                    if (ind < 0) continue;   // Knoten ohne Stab, bereits oben gemeldet
                    for (let j = 0; j < ndof; j++) {
                        let child = tabelle.rows[ind + 1].cells[j + 3].firstElementChild as HTMLInputElement;
                        if (obj.node.L_org[j] === 1) {
                            child.value = '1'
                            node[ind].L_org[j] = node[ind].L[j] = 1
                            anzahl_festhaltungen++
                        }
                        else {
                            if (j === 0) {
                                child.value = String(node[ind].kx)
                                node[ind].L_org[j] = node[ind].L[j] = obj.node.kx
                                node[ind].kx = obj.node.kx
                                if (obj.node.kx > 0.0) anzahl_festhaltungen++;
                            }
                            else if (j === 1) {
                                child.value = String(node[ind].kz)
                                node[ind].L_org[j] = node[ind].L[j] = obj.node.kz
                                node[ind].kz = obj.node.kz
                                if (obj.node.kz > 0.0) anzahl_festhaltungen++;
                            }
                            else if (j === 2) {
                                child.value = String(node[ind].kphi)
                                node[ind].L_org[j] = node[ind].L[j] = obj.node.kphi
                                node[ind].kphi = obj.node.kphi
                                if (obj.node.phi > 0.0) anzahl_festhaltungen++;

                            }
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

    // jetzt die Staebe (Teilelemente)

    {
        let el = shadow.getElementById("id_button_nelem") as drButtonPM;
        el.setValue(nelem);

        const elTab = shadow.getElementById("id_element_tabelle");
        elTab?.setAttribute("nzeilen", '0');
        elTab?.setAttribute("nzeilen", String(nelem));
    }

    {
        let nelem_Balken_Bettung = 0
        let maxBettung = 0

        let el = shadow.getElementById('id_element_tabelle') as HTMLElement;
        let tabelle = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        element.length = 0
        let ielem = 0
        for (const plan of plaene) {
            const obj = plan.obj
            const n = plan.xs.length - 1

            for (let k = 0; k < n; k++) {
                element.push(new TElement())

                const nod1 = plan.nod[k]
                const nod2 = plan.nod[k + 1]
                const erstes = k === 0, letztes = k === n - 1

                element[ielem].qname = obj.name_querschnitt.trim();
                element[ielem].nod[0] = nod1
                element[ielem].nod[1] = nod2

                element[ielem].x1 = node[nod1].x;
                element[ielem].x2 = node[nod2].x;
                element[ielem].z1 = node[nod1].z;
                element[ielem].z2 = node[nod2].z;

                const dx = element[ielem].x2 - element[ielem].x1;
                const dz = element[ielem].z2 - element[ielem].z1;
                element[ielem].sl = Math.sqrt(dx * dx + dz * dz);      // Länge Teilelement mit starren Enden

                if (element[ielem].sl < 1e-12) {
                    write(msg('Länge von Element') + " " + String(ielem + 1) + " " + msg('ist null'))
                    fatal_error = true; anzahl_fehler_cad++;    // Berechnung würde sonst abstürzen
                    element[ielem].cosinus = 1.0
                    element[ielem].sinus = 0.0
                    element[ielem].alpha = 0.0
                } else {
                    element[ielem].cosinus = dx / element[ielem].sl
                    element[ielem].sinus = dz / element[ielem].sl
                    element[ielem].alpha = Math.atan2(dz, dx)
                }

                // Gelenke und starre Enden nur an den Enden des CAD-Stabes
                let nGelenke = 0
                for (let i = 0; i < 6; i++) {
                    const am_ende = i < 3 ? erstes : letztes
                    element[ielem].gelenk[i] = am_ende ? obj.gelenk[i] : 0
                    if (element[ielem].gelenk[i] === 1) nGelenke++
                }
                element[ielem].nGelenke = nGelenke;

                element[ielem].aL = erstes ? obj.aL : 0.0
                element[ielem].aR = letztes ? obj.aR : 0.0
                element[ielem].k_0 = obj.k_0
                if (obj.k_0 !== 0.0) {
                    nelem_Balken_Bettung++;
                    if (Math.abs(obj.k_0) > maxBettung) maxBettung = Math.abs(obj.k_0)
                }
                element[ielem].elTyp = obj.get_stabtyp();

                ielem++

                let child = tabelle.rows[ielem].cells[1].firstElementChild as HTMLInputElement;
                child.value = obj.name_querschnitt
                child = tabelle.rows[ielem].cells[2].firstElementChild as HTMLInputElement;
                child.value = String(+obj.get_stabtyp())
                child = tabelle.rows[ielem].cells[3].firstElementChild as HTMLInputElement;
                child.value = String(+nod1 + 1)
                child = tabelle.rows[ielem].cells[4].firstElementChild as HTMLInputElement;
                child.value = String(+nod2 + 1)

                for (let i = 0; i < 6; i++) {
                    if (element[ielem - 1].gelenk[i] === 1) {
                        child = tabelle.rows[ielem].cells[5 + i].firstElementChild as HTMLInputElement;
                        child.value = '1'
                    }
                }
                child = tabelle.rows[ielem].cells[11].firstElementChild as HTMLInputElement;
                child.value = String(element[ielem - 1].aL)
                child = tabelle.rows[ielem].cells[12].firstElementChild as HTMLInputElement;
                child.value = String(element[ielem - 1].aR)
                child = tabelle.rows[ielem].cells[13].firstElementChild as HTMLInputElement;
                child.value = String(obj.k_0)
            }

            if (n > 1) write(msg(str`Stab ${obj.elNo}: Elemente ${plan.elem0 + 1} bis ${plan.elem0 + n}`))
        }

        set_nelem_Balken_Bettung(nelem_Balken_Bettung);
        set_maxBettung(maxBettung);


        if (nelem_Balken_Bettung === 0 && anzahl_festhaltungen < 3) {
            fatal_error = true; anzahl_fehler_cad++;
            alertdialog("ok", msg('Es gibt keine ausreichende Lagerung'));
        }
    }

    // jetzt die Knotenlasten (aus dem CAD und aus Einzellasten auf Stäben)

    {
        const nknlast_gesamt = nknlast + knotenlasten_einzellast.length
        set_nloads(nknlast_gesamt);

        let el = shadow.getElementById("id_button_nnodalloads") as drButtonPM;
        el.setValue(nknlast_gesamt);

        const elTab = shadow.getElementById("id_knotenlasten_tabelle");
        elTab?.setAttribute("nzeilen", String(nknlast_gesamt));

        load.length = 0

        if (nknlast_gesamt > 0) {
            elTab?.setAttribute("clear", "0");

            let tabelle = elTab?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

            let nel = 0
            for (let i = 0; i < list.size; i++) {
                let obj = list.getNext(i) as TCAD_Knotenlast;
                if (obj.elTyp === CAD_KNLAST) {
                    load.push(new TLoads())
                    let index = obj.index1;
                    let ind = CADNodes[index].index_FE
                    if (ind > -1) {
                        load[nel].lf = obj.knlast.lf
                        load[nel].Px = obj.knlast.Px
                        load[nel].Pz = obj.knlast.Pz
                        load[nel].p[2] = obj.knlast.p[2]
                        load[nel].Px_org = obj.knlast.Px_org
                        load[nel].Pz_org = obj.knlast.Pz_org
                        load[nel].alpha = obj.knlast.alpha
                        load[nel].node = ind
                        if (obj.knlast.lf > check_max_lastfall) check_max_lastfall = obj.knlast.lf;

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

            for (const kl of knotenlasten_einzellast) {
                load.push(kl)
                if (kl.lf > check_max_lastfall) check_max_lastfall = kl.lf;
                nel++

                let child = tabelle.rows[nel].cells[1].firstElementChild as HTMLInputElement;
                child.value = String(kl.node + 1)
                child = tabelle.rows[nel].cells[2].firstElementChild as HTMLInputElement;
                child.value = String(kl.lf)
                child = tabelle.rows[nel].cells[3].firstElementChild as HTMLInputElement;
                child.value = myFormat_en(kl.Px, 1, 4)
                child = tabelle.rows[nel].cells[4].firstElementChild as HTMLInputElement;
                child.value = myFormat_en(kl.Pz, 1, 4)
                child = tabelle.rows[nel].cells[5].firstElementChild as HTMLInputElement;
                child.value = String(kl.p[2])
            }
        }
    }


    // jetzt die Elementlasten, aufgeteilt auf die Teilelemente

    {
        // Eigengewicht für alle Balken-Teilelemente

        eload.length = 0
        for (let i = 0; i < nelem_Balken; i++) {
            eload.push(new TElLoads())
            eload[i].element = i
            eload[i].lf = 1
            eload[i].art = 1
        }

        const z_strecke: number[][] = [], z_einzel: number[][] = [], z_temp: number[][] = []
        const z_vorsp: number[][] = [], z_spann: number[][] = [], z_vorverf: number[][] = []

        stabvorverformung.length = 0

        for (const plan of plaene) {
            const obj = plan.obj
            const n = plan.xs.length - 1
            const eps = 1e-9 * Math.max(1.0, plan.L_el)

            for (let j = 0; j < obj.elast.length; j++) {
                const lf = (obj.elast[j] as TCAD_ElLast).lastfall
                if (lf > check_max_lastfall) check_max_lastfall = lf;
                const typ = obj.elast[j].typ

                if (typ === 0) {                                     // Streckenlast, auch Teilstreckenlast
                    const sl = obj.elast[j] as TCAD_Streckenlast
                    const xa = sl.xa
                    const xb = sl.xb < 0.0 ? plan.L_el : sl.xb
                    const teil = xa > eps || xb < plan.L_el - eps
                    if (xa < -eps || xb > plan.L_el + eps || xb <= xa) {
                        write(msg(str`Stab ${obj.elNo}: Streckenlast von xa=${xa} bis xe=${sl.xb} liegt nicht im elastischen Stabteil (0 bis ${myFormat(plan.L_el, 1, 3)} m)`))
                        fatal_error = true; anzahl_fehler_cad++;
                        continue
                    }
                    if (teil && !plan.teilbar) {
                        write(msg(str`Stab ${obj.elNo}: Teilstreckenlasten sind auf Fachwerkstäben nicht möglich`))
                        fatal_error = true; anzahl_fehler_cad++;
                        continue
                    }
                    // Lastgrenzen liegen auf Teilungspunkten (ggf. zusammengefasst); Resultierende erhalten
                    const xa2 = teil ? fange_punkt(xa, plan.feste, plan.tol) : 0.0
                    const xb2 = teil ? fange_punkt(xb, plan.feste, plan.tol) : plan.L_el
                    if (xb2 - xa2 <= eps) {
                        write(msg(str`Stab ${obj.elNo}: Teilstreckenlast ist kürzer als die Fangtoleranz und wird nicht berücksichtigt`))
                        continue
                    }
                    const f = (xb - xa) / (xb2 - xa2)
                    const p = (s: number) => f * (sl.pL + (sl.pR - sl.pL) * (s - xa2) / (xb2 - xa2))

                    for (let k = 0; k < n; k++) {
                        const s0 = plan.xs[k], s1 = plan.xs[k + 1]
                        if (s0 < xa2 - eps || s1 > xb2 + eps) continue
                        const ie = eload.length
                        eload.push(new TElLoads())
                        eload[ie].element = plan.elem0 + k
                        eload[ie].lf = lf
                        eload[ie].art = sl.art
                        eload[ie].pL = p(s0)
                        eload[ie].pR = p(s1)
                        z_strecke.push([plan.elem0 + k + 1, lf, sl.art, eload[ie].pL, eload[ie].pR])
                    }
                }
                else if (typ === 2) {                                // Temperatur: alle Teilelemente
                    const t = obj.elast[j] as TCAD_Temperaturlast
                    for (let k = 0; k < n; k++) {
                        const ie = eload.length
                        eload.push(new TElLoads())
                        eload[ie].element = plan.elem0 + k
                        eload[ie].lf = lf
                        eload[ie].art = 5
                        eload[ie].To = t.To
                        eload[ie].Tu = t.Tu
                        z_temp.push([plan.elem0 + k + 1, lf, t.Tu, t.To])
                    }
                }
                else if (typ === 3) {                                // Vorspannung: alle Teilelemente
                    const sigmaV = (obj.elast[j] as TCAD_Vorspannung).sigmaV
                    for (let k = 0; k < n; k++) {
                        const ie = eload.length
                        eload.push(new TElLoads())
                        eload[ie].element = plan.elem0 + k
                        eload[ie].lf = lf
                        eload[ie].art = 9
                        eload[ie].sigmaV = sigmaV * 1000.0; //von MN/m² in kN/m²
                        z_vorsp.push([plan.elem0 + k + 1, lf, sigmaV])
                    }
                }
                else if (typ === 4) {                                // Spannschloss: nur einmal, mittleres Teilelement
                    const ds = (obj.elast[j] as TCAD_Spannschloss).ds
                    const k = Math.floor(n / 2)
                    const ie = eload.length
                    eload.push(new TElLoads())
                    eload[ie].element = plan.elem0 + k
                    eload[ie].lf = lf
                    eload[ie].art = 10
                    eload[ie].delta_s = ds / 1000.;  // von mm in m
                    z_spann.push([plan.elem0 + k + 1, lf, ds])
                }
                else if (typ === 5) {                                // Stabvorverformung: Parabel über den ganzen Stab
                    const vv = obj.elast[j] as TCAD_Stabvorverformung
                    const stich = vv.get_stich()   // Kern erwartet den Stich
                    for (let k = 0; k < n; k++) {
                        const [w0a, w0e, w0m] = vorverformung_teil(vv.w0a, stich, vv.w0e, plan.L_el, plan.xs[k], plan.xs[k + 1])
                        const sv = new TStabvorverformung()
                        sv.element = plan.elem0 + k
                        sv.lf = lf
                        sv.p[0] = w0a / 1000.;  // von mm in m
                        sv.p[1] = w0e / 1000.;
                        sv.p[2] = w0m / 1000.;
                        stabvorverformung.push(sv)
                        z_vorverf.push([plan.elem0 + k + 1, lf, w0a, w0e, w0m])
                    }
                }
                // typ 1 (Einzellast) ist bei der Elementteilung schon verteilt worden
            }
        }

        // Einzellasten am Rand des elastischen Teils bleiben Elementlasten (art 6)
        for (const e6 of einzellasten_art6) {
            const ie = eload.length
            eload.push(new TElLoads())
            eload[ie].element = e6.element
            eload[ie].lf = e6.lf
            eload[ie].art = 6
            eload[ie].x = e6.x
            eload[ie].P = e6.P
            eload[ie].M = e6.M
            z_einzel.push([e6.element + 1, e6.lf, e6.x, e6.P, e6.M])
        }

        // Tabellen füllen (nur Anzeige)
        const fuelle = (id_button: string, id_tabelle: string, zeilen: number[][]) => {
            const b = shadow.getElementById(id_button) as drButtonPM;
            b.setValue(zeilen.length);
            const elTab = shadow.getElementById(id_tabelle);
            elTab?.setAttribute("nzeilen", String(zeilen.length));
            elTab?.setAttribute("clear", "0");
            const tabelle = elTab?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
            for (let i = 0; i < zeilen.length; i++) {
                for (let c = 0; c < zeilen[i].length; c++) {
                    const child = tabelle.rows[i + 1].cells[c + 1].firstElementChild as HTMLInputElement;
                    const w = zeilen[i][c]
                    child.value = Number.isInteger(w) ? String(w) : myFormat_en(w, 1, 4)
                }
            }
        }
        fuelle("id_button_nstreckenlasten", "id_streckenlasten_tabelle", z_strecke)
        fuelle("id_button_neinzellasten", "id_einzellasten_tabelle", z_einzel)
        fuelle("id_button_ntemperaturlasten", "id_temperaturlasten_tabelle", z_temp)
        fuelle("id_button_nvorspannungen", "id_vorspannungen_tabelle", z_vorsp)
        fuelle("id_button_nspannschloesser", "id_spannschloesser_tabelle", z_spann)
        fuelle("id_button_nstabvorverformungen", "id_stabvorverfomungen_tabelle", z_vorverf)

        set_nstreckenlasten(z_strecke.length);
        set_neinzellasten(z_einzel.length);
        set_ntemperaturlasten(z_temp.length);
        set_nvorspannungen(z_vorsp.length);
        set_nspannschloesser(z_spann.length);
        set_nstabvorverfomungen(z_vorverf.length);

        set_neloads(eload.length);
        set_ntotalEloads(eload.length)
    }

    //                  V o r v e r f o r m u n g e n

    {
        let el = shadow.getElementById('id_maxu_node_ID') as HTMLInputElement;
        let maxU_node_ID = Number(el.value);
        console.log("id_maxu_node_ID|", el.value, '|', maxU_node_ID)

        if (maxU_node_ID > 0) {
            for (let i = 0; i < CADNodes.length; i++) {
                if (maxU_node_ID === CADNodes[i].ID) {
                    set_maxU_node(CADNodes[i].index_FE + 1)
                    console.log("maxU_node für Schiefstellung", CADNodes[i].index_FE + 1)
                    break;
                }
            }
        }
        else {
            set_maxU_node(0);
        }
    }

    //                  d e f i n i e r t e    K n o t e n v e r f o r m u n g e n

    {

        // let el = shadow.getElementById('id_button_nnodedisps_gui') as any;
        // let nNodeDisps = Number(el.nel);
        // set_nNodeDisps(nNodeDisps);

        const elTab = shadow.getElementById("id_nnodedisps_tabelle");
        elTab?.setAttribute("nzeilen", String(nNodeDisps));

        elTab?.setAttribute("clear", "0");

        let tabelle = elTab?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        nodeDisp0.length = 0
        // for (let i = 0; i < nNodeDisps; i++) {
        //     nodeDisp0.push(new TNodeDisp)
        // }

        let nel = 0;
        for (let i = 0; i < list.size; i++) {
            let obj = list.getNext(i) as TCAD_Knotenverformung;
            if (obj.elTyp === CAD_KNOTVERFORMUNG) {
                nodeDisp0.push(new TNodeDisp)
                let index = obj.index1;
                let ind = CADNodes[index].index_FE
                if (ind > -1) {
                    nodeDisp0[nel].node = ind
                    nodeDisp0[nel].lf = obj.nodeDisp.lf
                    if (nodeDisp0[nel].lf > check_max_lastfall) check_max_lastfall = nodeDisp0[nel].lf;

                    let wert = obj.nodeDisp.dispx0;
                    if (wert.length === 0) nodeDisp0[nel].dispL[0] = false; else nodeDisp0[nel].dispL[0] = true;     // true=definierte Knotenverformung
                    nodeDisp0[nel].dispx0 = Number(wert.replace(/,/g, "."));
                    wert = obj.nodeDisp.dispz0;
                    if (wert.length === 0) nodeDisp0[nel].dispL[1] = false; else nodeDisp0[nel].dispL[1] = true;     // true=definierte Knotenverformung
                    nodeDisp0[nel].dispz0 = Number(wert.replace(/,/g, "."));
                    wert = obj.nodeDisp.phi0;
                    if (wert.length === 0) nodeDisp0[nel].dispL[2] = false; else nodeDisp0[nel].dispL[2] = true;     // true=definierte Knotenverformung
                    nodeDisp0[nel].phi0 = Number(wert.replace(/,/g, "."));
                } else {
                    nodeDisp0[nel].node = -1   // Knoten ohne Stab, bereits oben gemeldet (Vorgabe 0 wäre FE-Knoten 1)
                    nodeDisp0[nel].lf = obj.nodeDisp.lf   // sonst zusätzliche, irreführende Meldungen zum Lastfall
                    if (nodeDisp0[nel].lf > check_max_lastfall) check_max_lastfall = nodeDisp0[nel].lf;
                }
                nel++

                let child = tabelle.rows[nel].cells[1].firstElementChild as HTMLInputElement;
                child.value = String(+ind + 1)
                child = tabelle.rows[nel].cells[2].firstElementChild as HTMLInputElement;
                child.value = String(obj.nodeDisp.lf)
                child = tabelle.rows[nel].cells[3].firstElementChild as HTMLInputElement;
                child.value = obj.nodeDisp.dispx0
                child = tabelle.rows[nel].cells[4].firstElementChild as HTMLInputElement;
                child.value = obj.nodeDisp.dispz0
                child = tabelle.rows[nel].cells[5].firstElementChild as HTMLInputElement;
                child.value = obj.nodeDisp.phi0
            }
        }

        // el = shadow.getElementById('id_nnodedisps_tabelle_gui');
        // let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        // let nRowTab = table.rows.length;
        // let nColTab = table.rows[0].cells.length;

        // let shad = el?.shadowRoot?.getElementById('mytable')

        // for (let izeile = 1; izeile < nRowTab; izeile++) {
        //     let iz = izeile - 1
        //     for (let ispalte = 1; ispalte < nColTab; ispalte++) {
        //         let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
        //         let wert = child.value;
        //         console.log('NODE Knotenverformungen i:1', nnodes, izeile, ispalte, wert, wert.length);
        //         if (ispalte === 1) {
        //             let node_ID = Number(testNumber(wert, izeile, ispalte, shad));
        //             for (let i = 0; i < CADNodes.length; i++) {
        //                 if (node_ID === CADNodes[i].ID) {
        //                     nodeDisp0[iz].node = CADNodes[i].index_FE
        //                     console.log("node für Knotenverformung", CADNodes[i].index_FE + 1)
        //                     break;
        //                 }
        //             }
        //         }
        //         else if (ispalte === 2) {
        //             nodeDisp0[iz].lf = Number(testNumber(wert, izeile, ispalte, shad));
        //             set_max_lastfall(nodeDisp0[iz].lf);
        //             if (nodeDisp0[iz].lf > check_max_lastfall) check_max_lastfall = nodeDisp0[iz].lf;
        //         }
        //         else if (ispalte === 3) {
        //             if (wert.length === 0) nodeDisp0[iz].dispL[0] = false; else nodeDisp0[iz].dispL[0] = true;     // true=definierte Knotenverformung
        //             nodeDisp0[iz].dispx0 = Number(testNumber(wert, izeile, ispalte, shad));
        //         }
        //         else if (ispalte === 4) {
        //             if (wert.length === 0) nodeDisp0[iz].dispL[1] = false; else nodeDisp0[iz].dispL[1] = true;
        //             nodeDisp0[iz].dispz0 = Number(testNumber(wert, izeile, ispalte, shad));
        //         }
        //         else if (ispalte === 5) {
        //             if (wert.length === 0) nodeDisp0[iz].dispL[2] = false; else nodeDisp0[iz].dispL[2] = true;
        //             nodeDisp0[iz].phi0 = Number(testNumber(wert, izeile, ispalte, shad));
        //         }

        //     }
        // }


        el = shadow.getElementById("id_button_nnodedisps") as drButtonPM;
        el.setValue(nNodeDisps);


        // const elTabnodedisp = shadow.getElementById("id_nnodedisps_tabelle");
        // elTabnodedisp?.setAttribute("nzeilen", String(nNodeDisps));
        // elTabnodedisp?.setAttribute("clear", "0");

        // shad = elTabnodedisp?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

        // for (let izeile = 1; izeile < nRowTab; izeile++) {
        //     let iz = izeile - 1

        //     let child = shad.rows[izeile].cells[1].firstElementChild as HTMLInputElement;
        //     child.value = String(nodeDisp0[iz].node + 1)
        //     child = shad.rows[izeile].cells[2].firstElementChild as HTMLInputElement;
        //     child.value = String(nodeDisp0[iz].lf)
        //     child = shad.rows[izeile].cells[3].firstElementChild as HTMLInputElement;
        //     if (nodeDisp0[iz].dispL[0]) child.value = String(nodeDisp0[iz].dispx0);
        //     child = shad.rows[izeile].cells[4].firstElementChild as HTMLInputElement;
        //     if (nodeDisp0[iz].dispL[1]) child.value = String(nodeDisp0[iz].dispz0)
        //     child = shad.rows[izeile].cells[5].firstElementChild as HTMLInputElement;
        //     if (nodeDisp0[iz].dispL[2]) child.value = String(nodeDisp0[iz].phi0)

        // }


    }

    {  // Tabellen für Lastfälle und Kombinationen initialisieren

        if (max_Lastfall === 0) set_max_lastfall(1);

        console.log("check_max_lastfall , max_Lastfall", check_max_lastfall, max_Lastfall)
        if (check_max_lastfall < max_Lastfall) new_max_lastfall(check_max_lastfall);  // es wurden Lastfälle gelöscht

        set_nlastfaelle(max_Lastfall)
        console.log("set_nlastfaelle(max_Lastfall)", check_max_lastfall)
        let el = shadow.getElementById("id_button_nlastfaelle") as drButtonPM;
        el.setValue(max_Lastfall);
        let elTab = shadow.getElementById("id_lastfaelle_tabelle");
        elTab?.setAttribute("nzeilen", String(max_Lastfall));

        let el_komb = shadow.getElementById("id_kombinationen_tabelle");
        el_komb?.setAttribute("nspalten", String(Number(max_Lastfall) + 1)); // +1 wegen Kommentarspalte

    }

    //                  K n o t e n m a s s e n

    {
        let stadyn = 0

        const sel = shadow.getElementById("id_stadyn") as HTMLSelectElement;
        if (sel.value === '1') stadyn = 1;
        set_nnodalMass(nnodalMass);

        if (stadyn === 1 && nnodalMass > 0) {  // Dynamik

            let el = shadow.getElementById("id_button_nnodalmass") as drButtonPM;
            el.setValue(nnodalMass);

            nodalmass.length = 0

            const elTabKnotenmasse = shadow.getElementById("id_knotenmassen_tabelle");
            elTabKnotenmasse?.setAttribute("nzeilen", String(nnodalMass));
            elTabKnotenmasse?.setAttribute("clear", "0");

            let tabelle = elTabKnotenmasse?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

            let nel = 0
            for (let i = 0; i < list.size; i++) {
                let obj = list.getNext(i) as TCAD_Knotenmasse;
                if (obj.elTyp === CAD_KNMASSE) {
                    nodalmass.push(new TMass())
                    let index = obj.index1;
                    let ind = CADNodes[index].index_FE
                    if (ind > -1) {
                        nodalmass[nel].mass = obj.masse.mass
                        nodalmass[nel].theta = obj.masse.theta
                        nodalmass[nel].node = ind
                    }
                    nel++

                    let child = tabelle.rows[nel].cells[1].firstElementChild as HTMLInputElement;
                    child.value = String(+ind + 1)
                    child = tabelle.rows[nel].cells[2].firstElementChild as HTMLInputElement;
                    child.value = String(obj.masse.mass)
                    child = tabelle.rows[nel].cells[3].firstElementChild as HTMLInputElement;
                    child.value = String(obj.masse.theta)
                }

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

    // let coltext_lf = msg('Lf');
    // const ele = shadow.getElementById("id_kombinationen_tabelle");
    // console.log("ele", ele)
    // ele?.setAttribute("lf_languagechanged", coltext_lf);


    return fatal_error;

}
