
import { testNumber } from './utility'

export let nnodes: number;
export let nelem: number;
export let neq: number;

export let node = [] as TNode[]
export let element = [] as TElement[]
export let querschnittset = [] as any[]

export let nQuerschnittSets = 0
 // @ts-ignore
 //var cmult = Module.cwrap("cmult", null, null);
 //console.log("CMULT-------------", cmult)
 var c_d2beam1 = Module.cwrap("c_d2beam1", null, null);
 console.log("C_D2BEAM1-------------", c_d2beam1)


class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    L = [0, 0, 0]                                     // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    nel: number = 0                                 // Anzahl der Elemente, die an dem Knoten hängen
}

class TQuerschnittRechteck {
    name: string = ''
    id: string = ''
    emodul: number = 30000.0
    Iy: number = 160000.0
    area: number = 1200.0
    height: number = 0.4
    wichte: number = 0.0
    ks: number = 0.0
}

class TElement {
    qname: string = ''
    nodeTyp: Number = 0           // 0= 2 Knoten, 1 = 3 Knoten, 2 = 4 Knoten
    EModul: number = 0.0
    dicke: number = 0.0
    sl: number = 0.0                                    // Stablänge
    nod = [0, 0]                                       // globale Knotennummer der Stabenden
    lm: number[] = []                          //  as number[]
    gelenk = [0, 0]
    estiff: number[] = []    // = [[0.0, 0.0], [0.0, 0.0]]
    F = [0.0, 0.0]
    F34 = [0.0, 0.0]
    cosinus: number = 0.0
    sinus: number = 0.0
    alpha: number = 0.0
}


//---------------------------------------------------------------------------------------------------------------
export function incr_querschnittSets() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets++;
    querschnittset.push(new TQuerschnittRechteck())
}

//---------------------------------------------------------------------------------------------------------------
export function rechnen() {
    //-----------------------------------------------------------------------------------------------------------

    console.log("in rechnen");

    let el = document.getElementById('id_button_nnodes') as any;

    nnodes = Number(el.nel);

    el = document.getElementById('id_button_nelem') as any;
    //console.log('EL: >>', el.nel);

    nelem = Number(el.nel);

    read_nodes();
    read_elements();

    calculate();

}

//---------------------------------------------------------------------------------------------------------------
export function set_querschnittRechteck(name: string, id: string, emodul: number, Iy: number, area: number, height: number, ks: number, wichte: number) {
    //-----------------------------------------------------------------------------------------------------------

    const index = nQuerschnittSets - 1;

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].id = id;
    querschnittset[index].ks = ks;
    querschnittset[index].wichte = wichte;
    console.log("set_querschnittRechteck", index, emodul)
}


//---------------------------------------------------------------------------------------------------------------
export function update_querschnittRechteck(index: number, name: string, id: string, emodul: number, Iy: number, area: number, height: number, ks: number, wichte: number) {
    //-----------------------------------------------------------------------------------------------------------

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].id = id;
    querschnittset[index].ks = ks;
    querschnittset[index].wichte = wichte;
    console.log("update_querschnittRechteck", index, emodul)
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string, id: string, emodul: number, Iy: number, area: number, height: number, ks: number, wichte: number

    name = querschnittset[index].name;
    emodul = querschnittset[index].emodul;
    Iy = querschnittset[index].Iy;
    area = querschnittset[index].area;
    height = querschnittset[index].height;
    id = querschnittset[index].id;
    ks = querschnittset[index].ks;
    wichte = querschnittset[index].wichte;

    console.log("get_querschnittRechteck", index, emodul)

    return [name, id, emodul, Iy, area, height, ks, wichte]
}


//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck_name(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].name;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
function read_nodes() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_knoten_tabelle');
    console.log('EL: >>', el);

    console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    console.log('nZeilen', table.rows.length);
    console.log('nSpalten', table.rows[0].cells.length);


    for (i = 0; i < nnodes; i++) {
        node.push(new TNode())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) node[izeile - 1].x = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 2) node[izeile - 1].z = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) node[izeile - 1].L[0] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) node[izeile - 1].L[1] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) node[izeile - 1].L[2] = Number(testNumber(wert, izeile, ispalte, shad));

            //child.value = izeile + '.' + ispalte;

        }
    }
}

//---------------------------------------------------------------------------------------------------------------
function read_elements() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_elment_tabelle');
    console.log('EL: >>', el);

    console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    console.log('nZeilen', table.rows.length);
    console.log('nSpalten', table.rows[0].cells.length);


    for (i = 0; i < nelem; i++) {
        element.push(new TElement())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) element[izeile - 1].qname = wert;
            else if (ispalte === 2) element[izeile - 1].nodeTyp = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) element[izeile - 1].nod[0] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 4) element[izeile - 1].nod[1] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 5) element[izeile - 1].gelenk[0] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 6) element[izeile - 1].gelenk[1] = Number(testNumber(wert, izeile, ispalte, shad));
        }
        console.log("element", izeile, element[izeile - 1].qname, element[izeile - 1].nod[0], element[izeile - 1].nod[1])
    }
}

//---------------------------------------------------------------------------------------------------------------
export function init_tabellen() {
    //---------------------------------------------------------------------------------------------------------------

    let el = document.getElementById('id_elment_tabelle');

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '2';

    el = document.getElementById('id_knoten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '1';

    (table.rows[2].cells[1].firstElementChild as HTMLInputElement).value = '5';

}

//---------------------------------------------------------------------------------------------------------------
function calculate() {
    //---------------------------------------------------------------------------------------------------------------

    let i: number, j: number, nod1: number, nod2: number
    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number;

    // Berechnung der Gleichungsnummern

    neq = 0;
    for (i = 0; i < nnodes; i++) {
        for (j = 0; j < 3; j++) {
            if (node[i].L[j] > 0) {
                node[i].L[j] = -1;
            } else {
                node[i].L[j] = neq;
                neq = neq + 1;
            }
        }
    }

    console.log("Anzahl Gleichungen: ", neq)


    for (i = 0; i < nelem; i++) {
        nod1 = element[i].nod[0];
        nod2 = element[i].nod[1];
        x1 = node[nod1].x;
        x2 = node[nod2].x;
        z1 = node[nod1].z;
        z2 = node[nod2].z;

        dx = x2 - x1;
        dz = z2 - z1;
        element[i].sl = Math.sqrt(dx * dx + dz * dz);      // Stablänge

        if (element[i].sl < 1e-12) {
            alert("Länge von Element " + String(i + 1) + " ist null")
            return;
        }

        element[i].alpha = Math.atan2(dz, dx) // *180.0/Math.PI
        console.log("sl=", i, element[i].sl, element[i].alpha)

        element[i].lm[0] = node[nod1].L[0];
        element[i].lm[1] = node[nod1].L[1];
        element[i].lm[2] = node[nod1].L[2];
        element[i].lm[3] = node[nod2].L[0];
        element[i].lm[4] = node[nod2].L[1];
        element[i].lm[5] = node[nod2].L[2];

    }

    //c_benchmark();
    c_d2beam1();
    console.log("nach c_d2beam1")
}
/*
async function c_benchmark() {
    console.log("start cmult")
    //output.value += '\nstart\n'
    //await Sleep(100); // Pausiert die Funktion für 100 Millisekunden

    //cmult();
    console.log("end cmult")
}
*/