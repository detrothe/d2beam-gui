import { app } from "./haupt"
import { myFormat } from './utility'

import {
    el,
    neigv,
    nodeDisp0Force,
    nelem,
    nnodes,
    THIIO_flag,
    disp_print,
    lagerkraft,
    stabendkraefte,
    nodeDisp0,
    nelem_Balken,
    nelem_Federn,
    nNodeDisps,
    System,
    alpha_cr,
    ausgabe_gleichgewichtSG,
    dyn_neigv,
    dyn_omega,
    eigenform_print,
} from "./rechnen";

import { prot_eingabe } from "./prot_eingabe"


//--------------------------------------------------------------------------------------------
//------------------------------- A U S G A B E ----------------------------------------------
//--------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
export function ausgabe(iLastfall: number, newDiv: HTMLDivElement) {
    //-----------------------------------------------------------------------------------------------------------

    let i: number, j: number


    newDiv = prot_eingabe(iLastfall, newDiv)!;

    let tag = document.createElement("p");
    let text = document.createTextNode("Ergebnisse");
    tag.appendChild(text);
    tag.innerHTML = "<b>Ergebnisse</b>"
    newDiv?.appendChild(tag);

    tag = document.createElement("p");
    tag.setAttribute("id", "id_ergebnisse");
    text = document.createTextNode("xxx");
    tag.appendChild(text);
    if (app.browserLanguage == 'de') {
        if (THIIO_flag === 0) tag.innerHTML = "<b>Lastfall " + iLastfall + '</b>';
        else if (THIIO_flag === 1) tag.innerHTML = "<b>Kombination " + iLastfall + '</b>';
    } else {
        if (THIIO_flag === 0) tag.innerHTML = "Load case " // + current_unit_stress
        else if (THIIO_flag === 1) tag.innerHTML = "<b>Load Combination " + iLastfall + '</b>';
    }
    newDiv?.appendChild(tag);

    tag = document.createElement("p"); // <p></p>
    text = document.createTextNode("xxx");
    tag.appendChild(text);
    tag.innerHTML = "<b>Knotenverformungen</b>"

    newDiv?.appendChild(tag);

    //   Verformungen
    {
        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_verformungen");
        table.setAttribute("class", "output_table");
        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        // @ts-ignore
        const th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Node No";
        th0.title = "Knotennummer"
        th0.setAttribute("class", "table_cell_center");
        row.appendChild(th0);
        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "u &nbsp; [mm]";
        th1.title = "Verschiebung u, positiv in positiver x-Richtung"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "w &nbsp; [mm]";
        th2.title = "Verschiebung w, positiv in positiver z-Richtung"
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        if (System === 0) {
            // @ts-ignore
            const th3 = table.tHead.appendChild(document.createElement("th"));
            th3.innerHTML = "φ &nbsp;[mrad]";
            th3.title = "Verdrehung φ, positiv im Gegenuhrzeigersinn"
            th3.setAttribute("class", "table_cell_center");
            row.appendChild(th3);
        }

        for (i = 0; i < nnodes; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_center");

            newCell = newRow.insertCell(1);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(disp_print._(i + 1, 1, iLastfall), 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            newCell = newRow.insertCell(2);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(disp_print._(i + 1, 2, iLastfall), 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            if (System === 0) {
                newCell = newRow.insertCell(3);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(disp_print._(i + 1, 3, iLastfall), 2, 2));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
        }
    }

    // Lagerkräfte
    {
        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>Lagerreaktionen</b>"

        newDiv?.appendChild(tag);

        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_lagerkraefte");
        table.setAttribute("class", "output_table");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        // @ts-ignore
        const th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Node No";
        th0.title = "Knotennummer"
        th0.setAttribute("class", "table_cell_center");
        row.appendChild(th0);
        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "A<sub>x</sub>&nbsp;[kN]";
        th1.title = "Auflagerkraft Ax, positiv in negativer x-Richtung"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "A<sub>z</sub>&nbsp;[kN]";
        th2.title = "Auflagerkraft Az, positiv in negativer z-Richtung"
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        if (System === 0) {
            // @ts-ignore
            const th3 = table.tHead.appendChild(document.createElement("th"));
            th3.innerHTML = "M<sub>y</sub>&nbsp;[kNm]";
            th3.title = "Einspannmoment, positiv im Uhrzeigersinn"
            th3.setAttribute("class", "table_cell_center");
            row.appendChild(th3);
        }

        for (i = 0; i < nnodes; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_center");

            newCell = newRow.insertCell(1);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(lagerkraft[i][0], 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            newCell = newRow.insertCell(2);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(lagerkraft[i][1], 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            if (System === 0) {
                newCell = newRow.insertCell(3);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(lagerkraft[i][2], 2, 2));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
        }
    }

    // Stabendkräfte/-momente
    {
        let str_Vz_a = "V<sub>az</sub>&nbsp;[kN]"
        let str_Vz_e = "V<sub>ez</sub>&nbsp;[kN]"
        let str_Vz_title_a = "Querkraft am Stabanfang, positiv in negativer z-Richtung am negativen Schnittufer"
        let str_Vz_title_e = "Querkraft am Stabende, positiv in z-Richtung am positiven Schnittufer"
        if (THIIO_flag === 1) {
            str_Vz_a = "T<sub>az</sub>&nbsp;[kN]"
            str_Vz_e = "T<sub>ez</sub>&nbsp;[kN]"
            str_Vz_title_a = "Transversalkraft am Stabanfang, positiv in negativer z-Richtung am negativen Schnittufer"
            str_Vz_title_e = "Transversalkraft am Stabende, positiv in z-Richtung am positiven Schnittufer"
        }

        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>Stabendkräfte/-momente</b> (Gleichgewichtsschnittgrößen)"

        newDiv?.appendChild(tag);

        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_stabendkraefte");
        table.setAttribute("class", "output_table");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        // @ts-ignore
        const th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "El No";
        th0.title = "Stabnummer"
        th0.setAttribute("class", "table_cell_center");
        row.appendChild(th0);
        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "N<sub>a</sub> &nbsp;[kN]";
        th1.title = "Normalkraft N am Stabanfang, positiv als Zugkraft"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = str_Vz_a;
        th2.title = str_Vz_title_a
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        if (System === 0) {
            // @ts-ignore
            const th3 = table.tHead.appendChild(document.createElement("th"));
            th3.innerHTML = "M<sub>ay</sub>&nbsp;[kNm]";
            th3.title = "Biegemoment am Stabanfang, positiv im Uhrzeigersinn am negativen Schnittufer"
            th3.setAttribute("class", "table_cell_center");
            row.appendChild(th3);
        }
        // @ts-ignore
        const th4 = table.tHead.appendChild(document.createElement("th"));
        th4.innerHTML = "N<sub>e</sub> &nbsp;[kN]";
        th4.title = "Normalkraft N am Stabende, positiv als Zugkraft"
        th4.setAttribute("class", "table_cell_center");
        row.appendChild(th4);
        // @ts-ignore
        const th5 = table.tHead.appendChild(document.createElement("th"));
        th5.innerHTML = str_Vz_e;
        th5.title = str_Vz_title_e
        th5.setAttribute("class", "table_cell_center");
        row.appendChild(th5);
        if (System === 0) {
            // @ts-ignore
            const th6 = table.tHead.appendChild(document.createElement("th"));
            th6.innerHTML = "M<sub>ey</sub>&nbsp;[kNm]";
            th6.title = "Biegemoment am Stabende, positiv im Gegenuhrzeigersinn am positiven Schnittufer"
            th6.setAttribute("class", "table_cell_center");
            row.appendChild(th6);
        }

        for (i = 0; i < nelem; i++) {

            if (el[i].isActive) {

                let newRow = table.insertRow(-1);
                let newCell, newText
                newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

                newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_center");

                for (j = 1; j <= el[i].neqe; j++) {
                    newCell = newRow.insertCell(j);  // Insert a cell in the row at index 1
                    newText = document.createTextNode(myFormat(stabendkraefte._(j, i + 1, iLastfall), 2, 2));  // Append a text node to the cell
                    newCell.appendChild(newText);
                    newCell.setAttribute("class", "table_cell_right");
                }
            }
        }

    }

    // Federkräfte

    if (nelem_Federn > 0) {

        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>Federkräfte/-momente</b>"

        newDiv?.appendChild(tag);

        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_federkraefte");
        table.setAttribute("class", "output_table");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        // @ts-ignore
        const th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Node";
        th0.title = "Knoten, an dem die Feder befeestigt ist"
        th0.setAttribute("class", "table_cell_center");
        row.appendChild(th0);
        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "F<sub>x</sub> &nbsp;[kN]";
        th1.title = "Federktaft Fx, positiv als Zugkraft"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "F<sub>z</sub>&nbsp;[kN]";
        th2.title = "Federkraft Fz, positiv als Zugkraft "
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "M<sub>φ</sub>&nbsp;[kNm]";
        th3.title = "Federmoment, positiv im Uhrzeigersinn"
        th3.setAttribute("class", "table_cell_center");
        row.appendChild(th3);


        for (i = 0; i < nelem_Federn; i++) {

            let iFeder = i + nelem_Balken
            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(el[iFeder].nod + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_center");

            for (j = 1; j <= el[iFeder].neqe; j++) {
                newCell = newRow.insertCell(j);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(stabendkraefte._(j, iFeder + 1, iLastfall), 2, 2));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
        }

    }


    // Knotenvorverformung

    //console.log("BBBBBBBBBBBBBBBBBBBB  nNodeDisps",nNodeDisps)

    if (nNodeDisps > 0) {

        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>erforderliche Knotenkräfte/-momente für vorgegebene Knotenverformungen</b>"

        newDiv?.appendChild(tag);

        const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
        table.setAttribute("id", "id_table_knotenvorverformung");
        table.setAttribute("class", "output_table");

        table.style.border = 'none';
        newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

        const thead = table.createTHead();
        const row = thead.insertRow();

        // @ts-ignore
        const th = table.tHead.appendChild(document.createElement("th"));
        th.innerHTML = "No";
        th.title = "Nummer der definierten Verformung"
        th.setAttribute("class", "table_cell_center");
        row.appendChild(th);

        // @ts-ignore
        const th0 = table.tHead.appendChild(document.createElement("th"));
        th0.innerHTML = "Node";
        th0.title = "Knoten, für den die Verformungen definiert sind"
        th0.setAttribute("class", "table_cell_center");
        row.appendChild(th0);

        // @ts-ignore
        const th1 = table.tHead.appendChild(document.createElement("th"));
        th1.innerHTML = "F<sub>x</sub> &nbsp;[kN]";
        th1.title = "erforderliche Kraft, positiv in positiver x-Richtung"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "F<sub>z</sub>&nbsp;[kN]";
        th2.title = "erforderliche Kraft, positiv in positiver z-Richtung "
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "M<sub>φ</sub>&nbsp;[kNm]";
        th3.title = "erforderliches Moment, positiv im Gegenuhrzeigersinn"
        th3.setAttribute("class", "table_cell_center");
        row.appendChild(th3);


        for (i = 0; i < nNodeDisps; i++) {

            let inode = nodeDisp0[i].node
            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(+i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_center");

            newCell = newRow.insertCell(1);
            newText = document.createTextNode(String(+inode + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_mitte");

            for (j = 0; j < 3; j++) {
                newCell = newRow.insertCell(j + 2);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(nodeDisp0Force._(i, j, iLastfall - 1), 2, 2));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");
            }
        }

    }

    if (THIIO_flag === 1) {

        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = ''
        for (i = 0; i < neigv; i++) {
            tag.innerHTML += "<b>&alpha;<sub>cr</sub></b>[Eigenwert " + (+i + 1) + "] =&nbsp;" + myFormat(alpha_cr[iLastfall - 1][i], 2, 2) + "<br>"
        }
        newDiv?.appendChild(tag);

    }

    // Schnittgrößen und Verformungen entlang Stabachse
    {
        let str_Vz = "V<sub>z</sub>&nbsp;[kN]"
        let str_Vz_title = "Querkraft Vz, positiv in positiver z-Richtung am positiven Schnittufer"

        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        if (THIIO_flag === 0) {
            tag.innerHTML = "<b>Stabschnittgrößen und lokale Verformungen</b>"
        } else {
            if (ausgabe_gleichgewichtSG) {
                tag.innerHTML = "<b>Stabschnittgrößen und lokale Verformungen</b>"
                str_Vz = "T<sub>z</sub>&nbsp;[kN]"
                str_Vz_title = "Transversalkraft Tz, positiv in positiver z-Richtung am positiven Schnittufer"
            } else {
                tag.innerHTML = "<b>Nachweisschnittgrößen und lokale Verformungen</b>"
                tag.title = "Nachweisschnittgrößen berücksichtigen die Rotation des Querschnitts und sind für die Bemessung zu verwenden"
                str_Vz_title = "Querkraft Vz, positiv in positiver z(φ)-Richtung am positiven Schnittufer"
            }
        }
        newDiv?.appendChild(tag);


        for (let ielem = 0; ielem < nelem; ielem++) {

            if (el[ielem].isActive) {

                tag = document.createElement("p"); // <p></p>
                text = document.createTextNode("xxx");
                tag.appendChild(text);
                tag.innerHTML = "<b>Element " + (+ielem + 1) + "</b>"

                newDiv?.appendChild(tag);

                const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
                table.setAttribute("id", "id_table_schnittgroessen");
                table.setAttribute("class", "output_table");

                table.style.border = 'none';
                newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

                const thead = table.createTHead();
                const row = thead.insertRow();


                const th0 = table!.tHead!.appendChild(document.createElement("th"));
                th0.innerHTML = "x &nbsp;[m]";
                th0.title = "Stelle x"
                th0.setAttribute("class", "table_cell_center");
                row.appendChild(th0);

                // @ts-ignore
                const th1 = table.tHead.appendChild(document.createElement("th"));
                th1.innerHTML = "N &nbsp;[kN]";
                th1.title = "Normalkraft N, positiv als Zugkraft"
                th1.setAttribute("class", "table_cell_center");
                row.appendChild(th1);

                if (System === 0) {
                    // @ts-ignore
                    const th2 = table.tHead.appendChild(document.createElement("th"));
                    th2.innerHTML = str_Vz;
                    th2.title = str_Vz_title
                    th2.setAttribute("class", "table_cell_center");
                    row.appendChild(th2);
                    // @ts-ignore
                    const th3 = table.tHead.appendChild(document.createElement("th"));
                    th3.innerHTML = "M<sub>y</sub>&nbsp;[kNm]";
                    th3.title = "Biegemoment, positiv im Uhrzeigersinn am negativen Schnittufer"
                    th3.setAttribute("class", "table_cell_center");
                    row.appendChild(th3);
                }

                // @ts-ignore
                const th4 = table.tHead.appendChild(document.createElement("th"));
                th4.innerHTML = "u<sub>xL</sub> &nbsp;[mm]";
                th4.title = "lokale Verschiebung in Stabrichtung, positiv in lokaler x-Richtung"
                th4.setAttribute("class", "table_cell_center");
                row.appendChild(th4);
                // @ts-ignore
                const th5 = table.tHead.appendChild(document.createElement("th"));
                th5.innerHTML = "w<sub>zL</sub>&nbsp;[mm]";
                th5.title = "lokale Verschiebung in senkrecht zur Stabrichtung, positiv in lokaler z-Richtung"
                th5.setAttribute("class", "table_cell_center");
                row.appendChild(th5);
                if (System === 0) {
                    // @ts-ignore
                    const th6 = table.tHead.appendChild(document.createElement("th"));
                    th6.innerHTML = "&beta; &nbsp;[mrad]";
                    th6.title = "Rotation der Querschnittsebene, positiv im Uhrzeigersinn, bei schubstarr: ß = w'"
                    th6.setAttribute("class", "table_cell_center");
                    row.appendChild(th6);
                }

                if (THIIO_flag === 1) {
                    // @ts-ignore
                    const th7 = table.tHead.appendChild(document.createElement("th"));
                    th7.innerHTML = "&epsilon;";
                    th7.title = "Stabkennzahl epsilon"
                    th7.setAttribute("class", "table_cell_center");
                    row.appendChild(th7);
                }

                const nelTeilungen = el[ielem].nTeilungen
                let sg_M: number[] = new Array(nelTeilungen)
                let sg_V: number[] = new Array(nelTeilungen)
                let sg_N: number[] = new Array(nelTeilungen)

                let uL: number[] = new Array(nelTeilungen)   // L = Verformung lokal
                let wL: number[] = new Array(nelTeilungen)
                let phiL: number[] = new Array(nelTeilungen)

                const lf_index = iLastfall - 1
                el[ielem].get_elementSchnittgroesse_Moment(sg_M, lf_index);
                el[ielem].get_elementSchnittgroesse_Querkraft(sg_V, lf_index, ausgabe_gleichgewichtSG);
                el[ielem].get_elementSchnittgroesse_Normalkraft(sg_N, lf_index, ausgabe_gleichgewichtSG);
                el[ielem].get_elementSchnittgroesse_u_w_phi(uL, wL, phiL, lf_index);

                for (i = 0; i < nelTeilungen; i++) {

                    let newRow = table.insertRow(-1);
                    let newCell, newText
                    newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

                    newText = document.createTextNode(myFormat(el[ielem].x_[i], 2, 2));  // Append a text node to the cell
                    newCell.appendChild(newText);
                    newCell.setAttribute("class", "table_cell_center");

                    if (System === 0) {
                        let n = 6; if (THIIO_flag === 1) n = 7;
                        for (j = 1; j <= n; j++) {
                            newCell = newRow.insertCell(j);
                            if (j === 1) newText = document.createTextNode(myFormat(sg_N[i], 2, 2));
                            else if (j === 2) newText = document.createTextNode(myFormat(sg_V[i], 2, 2));
                            else if (j === 3) newText = document.createTextNode(myFormat(sg_M[i], 2, 2));
                            else if (j === 4) newText = document.createTextNode(myFormat(uL[i] * 1000., 3, 3));
                            else if (j === 5) newText = document.createTextNode(myFormat(wL[i] * 1000., 3, 3));
                            else if (j === 6) newText = document.createTextNode(myFormat(phiL[i] * 1000., 3, 3));
                            else if (j === 7) {
                                if ((THIIO_flag === 1)) {
                                    if (sg_N[i] < 0.0) {
                                        const eps = el[ielem].sl * Math.sqrt(Math.abs(sg_N[i]) / el[ielem].emodul / el[ielem].Iy)
                                        newText = document.createTextNode(myFormat(eps, 3, 3));
                                    } else {
                                        newText = document.createTextNode("");
                                    }
                                }
                            }
                            newCell.appendChild(newText);
                            newCell.setAttribute("class", "table_cell_right");
                        }
                    }
                    else {
                        newCell = newRow.insertCell(1);
                        newText = document.createTextNode(myFormat(sg_N[i], 2, 2));
                        newCell.appendChild(newText);
                        newCell.setAttribute("class", "table_cell_right");

                        newCell = newRow.insertCell(2);
                        newText = document.createTextNode(myFormat(uL[i] * 1000., 3, 3));
                        newCell.appendChild(newText);
                        newCell.setAttribute("class", "table_cell_right");

                        newCell = newRow.insertCell(3);
                        newText = document.createTextNode(myFormat(wL[i] * 1000., 3, 3));
                        newCell.appendChild(newText);
                        newCell.setAttribute("class", "table_cell_right");

                        if ((THIIO_flag === 1) && (sg_N[i] < 0.0)) {
                            newCell = newRow.insertCell(4);
                            const eps = el[ielem].sl * Math.sqrt(Math.abs(sg_N[i]) / el[ielem].emodul / el[ielem].Iy)
                            newText = document.createTextNode(myFormat(eps, 3, 3));
                            newCell.appendChild(newText);
                            newCell.setAttribute("class", "table_cell_right");
                        }
                    }
                }
            }
        }
    }

}



//--------------------------------------------------------------------------------------------
//------------------------------- D Y N  A U S G A B E ---------------------------------------
//--------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
export function dyn_ausgabe(newDiv: HTMLDivElement) {
    //-----------------------------------------------------------------------------------------------------------

    let i: number, j: number


    newDiv = prot_eingabe(1, newDiv)!;

    let tag = document.createElement("p");
    let text = document.createTextNode("Ergebnisse");
    tag.appendChild(text);
    tag.innerHTML = "<b>Ergebnisse</b>"
    newDiv?.appendChild(tag);


    tag = document.createElement("p");
    text = document.createTextNode("Eigenwerte");
    tag.appendChild(text);
    tag.innerHTML = "<b>Eigenwerte</b>"
    newDiv?.appendChild(tag);


    const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
    table.setAttribute("id", "id_table_eigenwerte");
    table.setAttribute("class", "output_table");

    table.style.border = 'none';
    newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

    const thead = table.createTHead();
    const row = thead.insertRow();

    // @ts-ignore
    const th = table.tHead.appendChild(document.createElement("th"));
    th.innerHTML = "No";
    th.title = "Nummer des Eigenwertes"
    th.setAttribute("class", "table_cell_center");
    row.appendChild(th);

    // @ts-ignore
    const th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "Frequenz [Hz]";
    th0.title = "Frequenz in Schwingungen pro Sekunde"
    th0.setAttribute("class", "table_cell_center");
    row.appendChild(th0);

    // @ts-ignore
    const th1 = table.tHead.appendChild(document.createElement("th"));
    th1.innerHTML = "Periode [sec]";
    th1.title = "Periode T in Sekunden"
    th1.setAttribute("class", "table_cell_center");
    row.appendChild(th1);



    for (i = 0; i < dyn_neigv; i++) {

        let newRow = table.insertRow(-1);
        let newCell, newText
        newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

        newText = document.createTextNode(String(+i + 1));  // Append a text node to the cell
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_cell_center");

        newCell = newRow.insertCell(1);
        newText = document.createTextNode(myFormat(dyn_omega[i] / 2 / Math.PI, 2, 2));
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_cell_mitte");

        newCell = newRow.insertCell(2);
        newText = document.createTextNode(myFormat(2 * Math.PI / dyn_omega[i], 2, 2));
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_cell_mitte");
    }


    //   Eigenformen
    {
        for (let ieigv = 0; ieigv < dyn_neigv; ieigv++) {


            tag = document.createElement("p"); // <p></p>
            text = document.createTextNode("xxx");
            tag.appendChild(text);
            tag.innerHTML = "<b>Eigenform " + (+ieigv+1) + "</b>"

            newDiv?.appendChild(tag);

            const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
            table.setAttribute("id", "id_table_eigenformen");
            table.setAttribute("class", "output_table");
            table.style.border = 'none';
            newDiv?.appendChild(table);

            const thead = table.createTHead();
            const row = thead.insertRow();

            // @ts-ignore
            const th0 = table.tHead.appendChild(document.createElement("th"));
            th0.innerHTML = "Node No";
            th0.title = "Knotennummer"
            th0.setAttribute("class", "table_cell_center");
            row.appendChild(th0);
            // @ts-ignore
            const th1 = table.tHead.appendChild(document.createElement("th"));
            th1.innerHTML = "ψ<sub>u</sub>";
            th1.title = "Verschiebung ψu, positiv in positiver x-Richtung"
            th1.setAttribute("class", "table_cell_center");
            row.appendChild(th1);
            // @ts-ignore
            const th2 = table.tHead.appendChild(document.createElement("th"));
            th2.innerHTML = "ψ<sub>w</sub>";
            th2.title = "Verschiebung ψw, positiv in positiver z-Richtung"
            th2.setAttribute("class", "table_cell_center");
            row.appendChild(th2);
            if (System === 0) {
                // @ts-ignore
                const th3 = table.tHead.appendChild(document.createElement("th"));
                th3.innerHTML = "ψ<sub>φ</sub>";
                th3.title = "Verdrehung φ, positiv im Gegenuhrzeigersinn"
                th3.setAttribute("class", "table_cell_center");
                row.appendChild(th3);
            }

            for (i = 0; i < nnodes; i++) {

                let newRow = table.insertRow(-1);
                let newCell, newText
                newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

                newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_center");

                newCell = newRow.insertCell(1);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(eigenform_print._(i, 0, ieigv), 3, 3));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");

                newCell = newRow.insertCell(2);  // Insert a cell in the row at index 1
                newText = document.createTextNode(myFormat(eigenform_print._(i, 1, ieigv), 3, 3));  // Append a text node to the cell
                newCell.appendChild(newText);
                newCell.setAttribute("class", "table_cell_right");

                if (System === 0) {
                    newCell = newRow.insertCell(3);  // Insert a cell in the row at index 1
                    newText = document.createTextNode(myFormat(eigenform_print._(i, 2, ieigv), 3, 3));  // Append a text node to the cell
                    newCell.appendChild(newText);
                    newCell.setAttribute("class", "table_cell_right");
                }
            }
        }
    }

}
