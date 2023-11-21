import { el, element as stab, node, nelem, nnodes, nloads, neloads, eload, nstabvorverfomungen, stabvorverformung, nelem_Balken } from "./rechnen";

import { testNumber, myFormat, write } from './utility'

//---------------------------------------------------------------------------------------------------------------
export function prot_eingabe(iLastfall: number, newDiv: HTMLDivElement) {
    //-----------------------------------------------------------------------------------------------------------

    console.log("----------------- in prot_eingabe --------------------")

    let tag = document.createElement("p"); // <p></p>
    let text = document.createTextNode("xxx");
    tag.appendChild(text);
    tag.innerHTML = "<b>Stabelemente</b>"
    newDiv?.appendChild(tag);



    const table = document.createElement("TABLE") as HTMLTableElement;   //TABLE??
    table.setAttribute("id", "id_table_stabendkraefte");
    table.setAttribute("class", "output_table_ein");

    table.style.border = 'none';
    newDiv?.appendChild(table);  //appendChild() insert it in the document (table --> myTableDiv)

    const thead = table.createTHead();
    const row0 = thead.insertRow();

    // @ts-ignore
    let th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "";
    th0.title = "Stabnummer"
    //th0.setAttribute("class", "table_ein_cell_center");
    th0.colSpan = 4
    row0.appendChild(th0);


    // @ts-ignore
    th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "Gelenke";
    th0.title = "Gelenke"
    th0.setAttribute("class", "table_ein_cell_center");
    th0.colSpan = 6
    row0.appendChild(th0);

    // @ts-ignore
    th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "";
    row0.appendChild(th0);

    // @ts-ignore
    th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "Gleichungsnummern";
    th0.title = "Gleichungsnummern"
    th0.setAttribute("class", "table_ein_cell_center");
    th0.colSpan = 6
    row0.appendChild(th0);


    const row = thead.insertRow();

    // @ts-ignore
    th0 = table.tHead.appendChild(document.createElement("th"));
    th0.innerHTML = "El No";
    th0.title = "Stabnummer"
    th0.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th0);
    // @ts-ignore
    const th1 = table.tHead.appendChild(document.createElement("th"));
    th1.innerHTML = "Querschnitt";
    th1.title = "Querschnittsname"
    th1.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th1);
    // @ts-ignore
    const th2 = table.tHead.appendChild(document.createElement("th"));
    th2.innerHTML = "nod a";
    th2.title = "globale Knotennummer am Elementanfang"
    th2.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th2);
    // @ts-ignore
    const th3 = table.tHead.appendChild(document.createElement("th"));
    th3.innerHTML = "nod e";
    th3.title = "globale Knotennummer am Elementende"
    th3.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th3);

    // @ts-ignore
    let th4 = table.tHead.appendChild(document.createElement("th"));
    th4.innerHTML = "N<sub>a</sub>";
    th4.title = "Normalkraftgelenk am Stabanfang"
    th4.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th4);
    // @ts-ignore
    let th5 = table.tHead.appendChild(document.createElement("th"));
    th5.innerHTML = "V<sub>a</sub>";
    th5.title = "Querkraftgelenk am Stabanfang"
    th5.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th5);
    // @ts-ignore
    let th6 = table.tHead.appendChild(document.createElement("th"));
    th6.innerHTML = "M<sub>a</sub>";
    th6.title = "Biegemomentgelenk am stabanfang"
    th6.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th6);


    // @ts-ignore
    th4 = table.tHead.appendChild(document.createElement("th"));
    th4.innerHTML = "N<sub>e</sub>";
    th4.title = "Normalkraftgelenk am Stabende"
    th4.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th4);
    // @ts-ignore
    th5 = table.tHead.appendChild(document.createElement("th"));
    th5.innerHTML = "V<sub>e</sub>";
    th5.title = "Querkraftgelenk am Stabende"
    th5.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th5);
    // @ts-ignore
    th6 = table.tHead.appendChild(document.createElement("th"));
    th6.innerHTML = "M<sub>e</sub>";
    th6.title = "Biegemomentgelenk am Stabende"
    th6.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th6);

    // @ts-ignore
    th6 = table.tHead.appendChild(document.createElement("th"));
    th6.innerHTML = "Länge [m]";
    th6.title = "Stablänge"
    th6.setAttribute("class", "table_ein_cell_center");
    row.appendChild(th6);

    for (let i = 1; i <= 6; i++) {
        // @ts-ignore
        th6 = table.tHead.appendChild(document.createElement("th"));
        th6.innerHTML = "lm(" + i + ")"
        th6.title = "Gleichungsnummer"
        th6.setAttribute("class", "table_ein_cell_center");
        row.appendChild(th6);
    }

    for (let i = 0; i < nelem_Balken; i++) {

        let newRow = table.insertRow(-1);
        let newCell, newText
        newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

        newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_ein_cell_center");

        let ispalte = 1
        newCell = newRow.insertCell(ispalte);
        newText = document.createTextNode(String(stab[i].qname));
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_cell_right");

        for (let j = 0; j < 2; j++) {
            ispalte++
            newCell = newRow.insertCell(ispalte);
            newText = document.createTextNode(String(+stab[i].nod[j] + 1));
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");
        }

        for (let j = 1; j <= 6; j++) {
            newCell = newRow.insertCell(j + 3);  // Insert a cell in the row at index 1
            newText = document.createTextNode(String(stab[i].gelenk[j - 1]));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");
        }
        ispalte = 10
        newCell = newRow.insertCell(ispalte);
        newText = document.createTextNode(myFormat(stab[i].sl, 3, 3));
        newCell.appendChild(newText);
        newCell.setAttribute("class", "table_cell_right");


        for (let j = 0; j < 6; j++) {
            ispalte++
            newCell = newRow.insertCell(ispalte);
            newText = document.createTextNode(String(+el[i].lm[j] + 1));
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");
        }

    }


    return newDiv;

}