
import { testNumber } from './utility'

export let nnodes: number;
export let nelem: number;
export let node = [] as TNode[]
export let querschnittset = [] as any[]

export let nQuerschnittSets = 0

class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    Lx: number = 0                                  // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    Lz: number = 0                                  // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    Lphi: number = 0                                  // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
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

    const el = document.getElementById('id_button_nnodes') as any;
    //console.log('EL: >>', el.nel);

    nnodes = Number(el.nel);

    read_nodes();

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

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) node[izeile - 1].x = Number(testNumber(wert, izeile, ispalte, 'id_knoten_tabelle'));
            else if (ispalte === 2) node[izeile - 1].z = Number(testNumber(wert, izeile, ispalte, 'id_knoten_tabelle'));
            else if (ispalte === 3) node[izeile - 1].Lx = Number(testNumber(wert, izeile, ispalte, 'id_knoten_tabelle'));
            else if (ispalte === 4) node[izeile - 1].Lz = Number(testNumber(wert, izeile, ispalte, 'id_knoten_tabelle'));
            else if (ispalte === 5) node[izeile - 1].Lphi = Number(testNumber(wert, izeile, ispalte, 'id_knoten_tabelle'));
            //child.value = izeile + '.' + ispalte;

        }
    }
}

export function  init_tabellen() {

}