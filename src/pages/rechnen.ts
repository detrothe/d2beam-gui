declare let Module: any;

import { testNumber } from './utility'
//import {Module} from '../../d2beam_wasm.js'
// @ts-ignore
import { gauss } from "./gauss.js"

export let nnodes: number;
export let nelem: number;
export let nloads: number = 0;
export let neq: number;
export let nnodesTotal: number = 0;

export let lagerkraft = [] as number[][]

export let node = [] as TNode[]
export let element = [] as TElement[]
export let load = [] as TLoads[]
export let querschnittset = [] as any[]

export let nQuerschnittSets = 0

export let ndivsl = 3;
export let art = 1;
export let intArt = 2;
export let THIIO_flag = 0;

// @ts-ignore
//var cmult = Module.cwrap("cmult", null, null);
//console.log("CMULT-------------", cmult)
let c_d2beam1 = Module.cwrap("c_d2beam1", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number"]);
let c_d2beam2 = Module.cwrap("c_d2beam2", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]);
console.log("C_D2BEAM2-------------", c_d2beam2)

const bytes_8 = 8;
const bytes_4 = 4;

//__________________________________________________________________________________________________

class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    L = [0, 0, 0]                                     // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    nel: number = 0                                 // Anzahl der Elemente, die an dem Knoten hängen
}

class TQuerschnittRechteck {
    name: string = ''
    id: string = ''
    model: number = 1
    className = 'QuerschnittRechteck'
    emodul: number = 30000.0
    Iy: number = 160000.0
    area: number = 1200.0
    height: number = 0.4
    wichte: number = 0.0
    ks: number = 0.0
}

class TElement {
    qname: string = ''
    nodeTyp: number = 0           // 0= 2 Knoten, 1 = 3 Knoten, 2 = 4 Knoten
    EModul: number = 0.0
    dicke: number = 0.0
    x1: number = 0.0
    x2: number = 0.0
    z1: number = 0.0
    z2: number = 0.0
    sl: number = 0.0                                    // Stablänge
    nod = [0, 0, 0, 0]                                   // globale Knotennummer der Stabenden
    lm: number[] = []                          //  as number[]
    gelenk = [0, 0]
    estiff: number[][] = []    // = [[0.0, 0.0], [0.0, 0.0]]
    F: number[] = [14]
    F34 = [0.0, 0.0]
    cosinus: number = 0.0
    sinus: number = 0.0
    alpha: number = 0.0
    u: number[] = [14]
    prop_ptr: any
    npar_ptr: any
    xz_ptr: any
    brAbst_ptr: any
    stress_ptr: any

}

class TLoads {
    node: number = -1
    lf: number = -1
    p = [0.0, 0.0, 0.0]
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

    el = document.getElementById('id_button_nnodalloads') as any;
    //console.log('EL: >>', el.nel);

    nloads = Number(el.nel);


    el = document.getElementById('id_ndivsl') as HTMLInputElement;
    ndivsl = Number(el.value);

    el = document.getElementById('id_intart') as HTMLSelectElement;
    intArt = Number(el.value);

    el = document.getElementById('id_art') as HTMLSelectElement;
    art = Number(el.value);

    el = document.getElementById('id_THIIO') as HTMLSelectElement;
    THIIO_flag = Number(el.value);

    console.log("intAt, art", intArt, art, ndivsl)

    read_nodes();
    read_elements();
    read_nodal_loads();

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

    nnodesTotal = nnodes;
}


//---------------------------------------------------------------------------------------------------------------
function read_nodal_loads() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_knotenlasten_tabelle');
    console.log('EL: >>', el);

    console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    console.log('nZeilen', table.rows.length);
    console.log('nSpalten', table.rows[0].cells.length);


    for (i = 0; i < nloads; i++) {
        load.push(new TLoads())
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
            if (ispalte === 1) load[izeile - 1].node = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) load[izeile - 1].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) load[izeile - 1].p[0] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) load[izeile - 1].p[1] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) load[izeile - 1].p[2] = Number(testNumber(wert, izeile, ispalte, shad));
        }

        console.log("R", izeile, load[izeile - 1])
    }
}

//---------------------------------------------------------------------------------------------------------------
function read_elements() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number, ielem: number;

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

        ielem = izeile - 1

        if (element[ielem].nodeTyp === 3) {

            let x = (element[ielem].x2 + element[ielem].x1) / 2.0
            let z = (element[ielem].z2 + element[ielem].z1) / 2.0
            node.push(new TNode())
            node[nnodesTotal].x = x
            node[nnodesTotal].z = z
            element[ielem].nod[2] = nnodesTotal
            nnodesTotal++;
        }
        else if (element[ielem].nodeTyp === 4) {

            let dx = (element[ielem].x2 - element[ielem].x1) / 3.0
            let dz = (element[ielem].z2 - element[ielem].z1) / 3.0
            let x = element[ielem].x1 + dx
            let z = element[ielem].z1 + dz
            node.push(new TNode())
            node[nnodesTotal].x = x
            node[nnodesTotal].z = z
            element[ielem].nod[2] = nnodesTotal
            nnodesTotal++;

            x = x + dx
            z = z + dz
            node.push(new TNode())
            node[nnodesTotal].x = x
            node[nnodesTotal].z = z
            element[ielem].nod[3] = nnodesTotal
            nnodesTotal++;
        }
    }


}

//---------------------------------------------------------------------------------------------------------------
export function init_tabellen() {
    //---------------------------------------------------------------------------------------------------------------

    let el = document.getElementById('id_elment_tabelle');

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '3';
    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '2';

    el = document.getElementById('id_knoten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '1';

    (table.rows[2].cells[1].firstElementChild as HTMLInputElement).value = '5';


    el = document.getElementById('id_knotenlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[1].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '50';

}

//---------------------------------------------------------------------------------------------------------------
function calculate() {
    //---------------------------------------------------------------------------------------------------------------

    let i: number, j: number, k: number, js: number, nod1: number, nod2: number
    let x1: number, x2: number, z1: number, z2: number, dx: number, dz: number;
    let lmi: number = 0, lmj: number = 0
    let ielem: number, ieq: number, nodi: number, nknoten: number


    // Berechnung der Gleichungsnummern

    neq = 0;
    for (i = 0; i < nnodesTotal; i++) {
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

    let emodul: number = 0.0, bettung: number = 0.0, ks: number = 0.0, wichte: number = 0.0
    let nfiber: number = 2, maxfiber: number = 5, offset_abstand: number = 0.0, height: number = 0.0
    let Iy: number, area: number, b: number;

    let breite: number[] = [2]
    let abstand: number[] = [2]

    for (ielem = 0; ielem < nelem; ielem++) {
        nod1 = element[ielem].nod[0];
        nod2 = element[ielem].nod[1];
        element[ielem].x1 = x1 = node[nod1].x;
        element[ielem].x2 = x2 = node[nod2].x;
        element[ielem].z1 = z1 = node[nod1].z;
        element[ielem].z2 = z2 = node[nod2].z;

        dx = x2 - x1;
        dz = z2 - z1;
        element[ielem].sl = Math.sqrt(dx * dx + dz * dz);      // Stablänge

        if (element[ielem].sl < 1e-12) {
            alert("Länge von Element " + String(ielem + 1) + " ist null")
            return;
        }

        element[ielem].alpha = Math.atan2(dz, dx) // *180.0/Math.PI
        console.log("sl=", ielem, element[ielem].sl, element[ielem].alpha)

        nknoten = element[ielem].nodeTyp

        i = (nknoten - 1) * 3
        element[ielem].lm[0] = node[nod1].L[0];
        element[ielem].lm[1] = node[nod1].L[1];
        element[ielem].lm[2] = node[nod1].L[2];
        element[ielem].lm[3] = node[nod2].L[0];
        element[ielem].lm[4] = node[nod2].L[1];
        element[ielem].lm[5] = node[nod2].L[2];
        //element[ielem].lm[i] = node[nod2].L[0];
        //element[ielem].lm[i + 1] = node[nod2].L[1];
        //element[ielem].lm[i + 2] = node[nod2].L[2];

        if (nknoten === 3 || nknoten === 4) {
            let nodi = element[ielem].nod[2];
            element[ielem].lm[6] = node[nodi].L[0];
            element[ielem].lm[7] = node[nodi].L[1];
            element[ielem].lm[8] = node[nodi].L[2];
        }
        if (nknoten === 4) {
            let nodi = element[ielem].nod[3];
            element[ielem].lm[9] = node[nodi].L[0];
            element[ielem].lm[10] = node[nodi].L[1];
            element[ielem].lm[11] = node[nodi].L[2];
        }

        console.log("lm", element[ielem].lm)

        element[ielem].estiff = Array.from(Array(nknoten * 3), () => new Array(nknoten * 3));

        // get material data

        const qname = element[ielem].qname
        let index = -1;
        for (j = 0; j < nQuerschnittSets; j++) {
            if (querschnittset[j].name === qname) {
                index = j;
                break;
            }
        }

        if (index === -1) {
            alert('element ' + ielem + ' hat keinen Querschnitt');
            return -1;
        }
        console.log("typeOf ", index, querschnittset[index].className)

        if (querschnittset[index].className === 'QuerschnittRechteck') {   //  linear elastisch
            console.log('es ist ein Rechteck')
            emodul = querschnittset[index].emodul * 1000.0   // in kN/m²
            wichte = querschnittset[index].wichte
            ks = querschnittset[index].ks

            nfiber = 2
            maxfiber = 3 * (nfiber - 1)
            height = querschnittset[index].height / 100.0     // in m
            Iy = querschnittset[index].Iy
            area = querschnittset[index].area
            b = Math.sqrt(area * area * area / Iy / 12.0) / 100.0     // in m
            console.log("BREITE=", b, Iy)
            breite[0] = b
            breite[1] = b
            abstand[0] = 0.0
            abstand[1] = height
            offset_abstand = height / 2.0       // in m

            const leng = 3 * (ndivsl * nfiber * 2)  // das sollte reichen
            let stress_array = new Float64Array(leng); // array of 64-bit signed double to pass
            // stress_array enthält sigma, epsx, emodul
            for (i = 0; i < leng; i++) {
                stress_array[i] = 0.0
            }
            for (i = 2; i < leng; i = i + 3) {
                stress_array[i] = emodul
            }

            element[ielem].stress_ptr = Module._malloc(stress_array.length * bytes_8);
            Module.HEAPF64.set(stress_array, element[ielem].stress_ptr / bytes_8);


        }

        let prop_array = new Float64Array(5); // array of 64-bit signed double to pass
        prop_array[0] = ks
        prop_array[1] = wichte
        prop_array[2] = emodul

        console.log("BETTUNG, EMODUL", bettung, emodul)

        let bytes_per_element = prop_array.BYTES_PER_ELEMENT;   // 8 bytes each element
        element[ielem].prop_ptr = Module._malloc(prop_array.length * bytes_per_element);
        Module.HEAPF64.set(prop_array, element[ielem].prop_ptr / bytes_per_element);

        let npar_array = new Int32Array(21);
        npar_array[0] = element[ielem].nodeTyp           // nknoten
        npar_array[1] = 0           // nGelenke
        npar_array[4] = element[ielem].nodeTyp + 1
        npar_array[5] = ndivsl
        npar_array[6] = 1           // model
        npar_array[13] = art
        npar_array[14] = THIIO_flag
        npar_array[16] = 1          // maxStahlLagen
        npar_array[17] = intArt

        element[ielem].npar_ptr = Module._malloc(npar_array.length * bytes_4);
        Module.HEAP32.set(npar_array, element[ielem].npar_ptr / bytes_4);

        let xz_array = new Float64Array(6); // array of 64-bit signed double to pass
        xz_array[0] = x1
        xz_array[1] = x2
        xz_array[2] = z1
        xz_array[3] = z2
        xz_array[4] = 0.0   // sl1   starre Enden
        xz_array[5] = 0.0   // sl2

        element[ielem].xz_ptr = Module._malloc(xz_array.length * bytes_8);
        Module.HEAPF64.set(xz_array, element[ielem].xz_ptr / bytes_8);


        let brAbst_array = new Float64Array(nfiber * 2); // array of 64-bit signed double to pass
        k = 0;
        for (j = 0; j < nfiber; j++) {
            brAbst_array[k] = breite[j]
            brAbst_array[k + 1] = abstand[j]
            k = k + 2
        }
        element[ielem].brAbst_ptr = Module._malloc(brAbst_array.length * bytes_8);
        Module.HEAPF64.set(brAbst_array, element[ielem].brAbst_ptr / bytes_8);


    }

    //c_benchmark();
    console.log("nach c_d2beam1")


    // Aufstellen der Steifigkeitsmatrix

    //    ReDim stiff(neq, neq), R(neq), u(neq), stiff2(neq, neq)
    //    TFMatrix2D<double> stiff(neq, neq), stiff2(neq, neq);
    //    TFVector<double>   R(neq), u(neq);

    const stiff = Array.from(Array(neq), () => new Array(neq).fill(0.0));
    const R = Array(neq);
    const u = Array(neq);

    lagerkraft = Array.from(Array(nnodesTotal), () => new Array(3).fill(0.0));

    for (let iter = 0; iter < 2; iter++) {

        for (i = 0; i < neq; i++) {
            stiff[i].fill(0.0);
        }
        R.fill(0.0);

        for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0);

        for (ielem = 0; ielem < nelem; ielem++) {

            nknoten = element[ielem].nodeTyp

            let estiff_ptr = Module._malloc(105 * bytes_8);
            console.log("estiff ptr", estiff_ptr)

            c_d2beam1(nfiber, maxfiber, offset_abstand, element[ielem].prop_ptr, element[ielem].xz_ptr, element[ielem].brAbst_ptr,
                element[ielem].npar_ptr, estiff_ptr, element[ielem].stress_ptr);
            // @ts-ignore
            let estiff_array = new Float64Array(Module.HEAPF64.buffer, estiff_ptr, 105);

            k = 0
            for (j = 0; j < nknoten * 3; j++) {
                for (js = j; js < nknoten * 3; js++) {
                    //console.log('estiff', j, js, estiff_array[k])
                    element[ielem].estiff[j][js] = estiff_array[k]
                    element[ielem].estiff[js][j] = estiff_array[k]
                    k++;
                }
            }
            for (j = 0; j < 6; j++) {
                console.log('xx ', element[ielem].estiff[j])
            }

            Module._free(estiff_ptr);
        }


        for (k = 0; k < nelem; k++) {
            console.log("add", element[k].estiff[0])
            console.log("lm", element[k].lm)

            nknoten = element[k].nodeTyp

            for (i = 0; i < nknoten * 3; i++) {
                lmi = element[k].lm[i];
                if (lmi >= 0) {
                    for (j = 0; j < nknoten * 3; j++) {
                        lmj = element[k].lm[j];
                        if (lmj >= 0) {
                            stiff[lmi][lmj] = stiff[lmi][lmj] + element[k].estiff[i][j];
                        }
                    }
                }
            }
        }

        for (j = 0; j < neq; j++) {
            console.log('neq ', stiff[j])
        }

        // Aufstellen der rechten Seite

        //for (i = 0; i < neq; i++) R[i] = 0.0;

        // Aufstellen der rechte Seite

        for (i = 0; i < nloads; i++) {
            nod1 = load[i].node
            for (j = 0; j < 3; j++) {
                lmj = node[nod1].L[j]
                if (lmj >= 0) {
                    R[lmj] = R[lmj] + load[i].p[j]
                }
            }
        }

        /*
        // Elementlasten

            for (k = 0; k < nelem; k++) {
                for (i = 0; i < 2; i++) {
                    lmi = element[k].lm[i];
                    if (lmi >= 0) {
                        R[lmi] = R[lmi] + element[k].R[i];
                    }
                }
            }
        */


        for (i = 0; i < neq; i++) {
            console.log("R", i, R[i])
        }
        // Gleichungssystem lösen
        let error = gauss(neq, stiff, R);
        if (error != 0) {
            window.alert("Gleichungssystem singulär");
            return 1;
        }

        for (i = 0; i < neq; i++) u[i] = R[i];

        for (i = 0; i < neq; i++) {
            console.log("U", i, u[i] * 1000.0)    // in mm, mrad
        }


        for (ielem = 0; ielem < nelem; ielem++) {
            nknoten = element[ielem].nodeTyp
            for (j = 0; j < nknoten * 3; j++) {                           // Stabverformungen
                ieq = element[ielem].lm[j]
                if (ieq === -1) {
                    element[ielem].u[j] = 0
                } else {
                    element[ielem].u[j] = u[ieq]
                }
            }

            let u_array = new Float64Array(14); // array of 64-bit signed double to pass
            for (i = 0; i < nknoten * 3; i++) {
                u_array[i] = element[ielem].u[i]
                console.log("elem.u", i, u_array[i])
            }
            let u_ptr = Module._malloc(14 * bytes_8);

            Module.HEAPF64.set(u_array, u_ptr / bytes_8);

            let fk_ptr = Module._malloc(14 * bytes_8);
            console.log("u fk ptr", u_ptr, fk_ptr)

            c_d2beam2(nfiber, maxfiber, offset_abstand,
                element[ielem].prop_ptr, element[ielem].xz_ptr, element[ielem].brAbst_ptr, element[ielem].npar_ptr,
                u_ptr, fk_ptr, element[ielem].stress_ptr);

            let fk_array = new Float64Array(Module.HEAPF64.buffer, fk_ptr, 14);

            Module._free(fk_ptr);
            Module._free(u_ptr);

            for (i = 0; i < nknoten * 3; i++) {
                console.log("fk ", i, fk_array[i], fk_array.length)
                element[ielem].F[i] = fk_array[i]
            }

            // Knotengleichgewicht bilden, um Auflagerkräfte zu bestimmen

            //let iz = []
            //iz[0] = 0;
            //iz[1] = 3;
            //if (nknoten === 3) {iz[2] = 6;}
            //else if (nknoten === 4) {iz[2] = 6; iz[3] = 9;}

            for (i = 0; i < nknoten; i++) {
                nodi = element[ielem].nod[i]
                lagerkraft[nodi][0] = lagerkraft[nodi][0] - element[ielem].F[3 * i]
                lagerkraft[nodi][1] = lagerkraft[nodi][1] - element[ielem].F[3 * i + 1]
                lagerkraft[nodi][2] = lagerkraft[nodi][2] - element[ielem].F[3 * i + 2]
            }
        }


        for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen
            nodi = load[i].node
            lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0]
            lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1]
            lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2]
        }

        for (i = 0; i < nnodesTotal; i++) {
            console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
        }
    }

    for (ielem = 0; ielem < nelem; ielem++) {

        Module._free(element[ielem].prop_ptr);
        Module._free(element[ielem].npar_ptr);
        Module._free(element[ielem].xz_ptr);
        Module._free(element[ielem].brAbst_ptr);
        Module._free(element[ielem].stress_ptr);
    }

    return 0;
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