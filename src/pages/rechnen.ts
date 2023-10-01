declare let Module: any;
import { app, nlastfaelle_init, opendialog } from "./haupt"
import { TFVector, TFArray2D, TFArray3D } from "./TFArray"

import { testNumber, myFormat } from './utility'
//import {Module} from '../../d2beam_wasm.js'
// @ts-ignore
import { gauss } from "./gauss"
import { CTimoshenko_beam } from "./timoshenko_beam"
import { CSpring } from "./feder"
import { init_grafik, drawsystem } from "./grafik";

export let nnodes: number;
export let nelem: number;
export let nelem_Balken = 0;
export let nloads: number = 0;
export let neloads: number = 0;
export let ntotalEloads: number = 0;
export let nstabvorverfomungen = 0;
export let neq: number;
export let nnodesTotal: number = 0;
export let nelemTotal: number = 0;
export let nlastfaelle: number = 0;
export let nkombinationen: number = 0;
export let nelTeilungen = 10;
export let n_iterationen = 5;

export let neigv: number = 2;
export let nfedern = 0;
export let nNodeDisps = 0;

export let lagerkraft = [] as number[][];
export let disp_lf: TFArray3D;
export let stabendkraefte: TFArray3D
export let lagerkraefte: TFArray3D
export let u_lf = [] as number[][]
export let u0_komb = [] as number[][]   // berechnete Schiefstellung
export let eigenform_container_node = [] as TFArray3D[]
export let eigenform_container_u = [] as TFArray2D[]
export let node = [] as TNode[]
export let element = [] as TElement[]
export let feder = [] as TSpring[]
export let nodeDisp0 = [] as TNodeDisp[]
export let load = [] as TLoads[]
export let eload = [] as TElLoads[]
export let stabvorverformung = [] as TStabvorverformung[]
export let querschnittset = [] as any[]
export let kombiTabelle = [] as number[][]
export let alpha_cr = [] as number[][]

export let maxU_schief = 0.03
export let maxU_node = -1
export let maxU_dir = 1

export let nQuerschnittSets = 0

export let ndivsl = 3;
export let art = 1;
export let intArt = 2;
export let THIIO_flag = 0;

export let el = [] as any

export let maxValue_lf = [] as TMaxValues[]
export let maxValue_komb = [] as TMaxValues[]
export let maxValue_eigv = [] as number[][]
export let maxValue_u0 = [] as TMaxU0[]
export let maxValue_eload = [] as number[]
export let maxValue_w0 = 0.0                // Stabvorverformung


export let xmin = -50.0, zmin = -50.0, xmax = 50.0, zmax = 50.0, slmax = 0.0;


// @ts-ignore
//var cmult = Module.cwrap("cmult", null, null);
//console.log("CMULT-------------", cmult)
let c_d2beam1 = Module.cwrap("c_d2beam1", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number"]);
let c_d2beam2 = Module.cwrap("c_d2beam2", null, ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]);
let c_simvektoriteration = Module.cwrap("c_simvektoriteration", null, ["number", "number", "number", "number", "number", "number"]);
//console.log("C_D2BEAM2-------------", c_d2beam2)

const bytes_8 = 8;
const bytes_4 = 4;

//__________________________________________________________________________________________________

class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    L = [0, 0, 0]                                   // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    kx = 0.0
    kz = 0.0
    kphi = 0.0
    nel: number = 0                                 // Anzahl der Elemente, die an dem Knoten hängen

    phi = 0.0                                       // Drehung des Lagers im Gegenuhrzeigersinn
    co = 1.0
    si = 0.0
    show_phi = true
}


class TNodeDisp {                                   // Knotenzwangsverformungen, analog zu Knotenkräften
    node = 0                                        // werden aber mit TElDisp0 wie Elementlasten verarbeitet
    lf = 0
    dispx0 = 0.0                                    // Knotenvorverformungen gedreht in Richtung eines gedrehten Lagers
    dispz0 = 0.0
    phi0 = 0.0
    ux = 0.0                                        // Knotenvorverformungen in globale x-Richtung
    uz = 0.0                                        // Knotenvorverformungen in globale z-Richtung
}

class TQuerschnittRechteck {
    name: string = ''
    id: string = ''
    model: number = 1
    className = 'QuerschnittRechteck'
    emodul: number = 30000.0
    Iy: number = 160000.0
    area: number = 1200.0
    zso: number = 0.2;
    height: number = 0.4
    width: number = 0.3
    wichte: number = 0.0
    alphaT: number = 0.0
    definedQuerschnitt: number = 1
}

class TElement {
    qname: string = ''
    nodeTyp: number = 0           // 0= 2 Knoten, 1 = 3 Knoten, 2 = 4 Knoten
    nknoten: number = 2
    EModul: number = 0.0
    querdehnzahl: number = 0.3
    schubfaktor: number = 0.833
    gmodul: number = 0.0
    dicke: number = 0.0
    x1: number = 0.0
    x2: number = 0.0
    z1: number = 0.0
    z2: number = 0.0
    sl: number = 0.0                    // Stablänge
    nod = [0, 0, 0, 0]                  // globale Knotennummer der Stabenden
    lm: number[] = []
    gelenk = [0, 0, 0, 0, 0, 0]
    estiff: number[][] = []
    estm: number[][] = []
    ksig: number[][] = []
    trans: number[][] = []
    F: number[] = Array(14)             // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = Array(14)            // Stabendgrößen nach KGV im lokalen Koordinatensystem
    F34 = [0.0, 0.0]
    cosinus: number = 0.0
    sinus: number = 0.0
    alpha: number = 0.0
    normalkraft: number = 0.0
    u: number[] = Array(14)
    prop_ptr: any
    npar_ptr: any
    xz_ptr: any
    brAbst_ptr: any
    stress_ptr: any

}

class TSpring {
    nod = -1
    kx = 0.0
    kz = 0.0
    kphi = 0.0

    constructor(node: number, kx: number, kz: number, kphi: number) {

        this.nod = node
        this.kx = kx
        this.kz = kz
        this.kphi = kphi
    }
    getNode() { return this.nod }
    getKx() { return this.kx }
    getKz() { return this.kz }
    getKphi() { return this.kphi }

}

class TLoads {
    node: number = -1
    lf: number = -1
    p = [0.0, 0.0, 0.0]
    Px = 0.0                                 // Last in globale x-Richtung
    Pz = 0.0                                 // Last in globale z-Richtung
}

class TElLoads {
    element: number = 0
    lf: number = 0
    art: number = 0
    pL: number = 0.0
    pR: number = 0.0
    x: number = 0.0
    P: number = 0.0
    M: number = 0.0
    Tu: number = 0.0
    To: number = 0.0
    kappa_dT: number = 0.0
    eps_Ts: number = 0.0
    sigmaV: number = 0.0
    delta_s: number = 0.0
    dispx0 = 0.0
    dispz0 = 0.0
    phi0 = 0.0
    node0 = 0
    dispL0: number[] = Array(6)

    C1: number = 0.0                    // Integrationskonstante C1 für beidseitig eingespannt
    C2: number = 0.0                    // Integrationskonstante C2 für beidseitig eingespannt
    CwP: number = 0.0                   // Durchbiegung w infolge P beidseitig eingespannter Balken
    CphiP: number = 0.0                 // Verdrehung phi infolge P beidseitig eingespannter Balken
    CwM: number = 0.0                   // Durchbiegung w infolge M beidseitig eingespannter Balken
    CphiM: number = 0.0                 // Verdrehung phi infolge M beidseitig eingespannter Balken

    re: number[] = Array(6)             // Elementlastvektor lokal
    el_r: number[] = Array(6)           // Elementlastvektor im globalen Koordinatensystem
}


class TStabvorverformung {
    element: number = -1
    p = [0.0, 0.0, 0.0]
}

class TMaxValues {
    disp = 0.0
    N = 0.0
    Vz = 0.0
    My = 0.0
    eload = 0.0

    zero() {
        this.disp = 0.0
        this.N = 0.0
        this.Vz = 0.0
        this.My = 0.0
        this.eload = 0.0
    }
}

class TMaxU0 {
    ieq = -1
    u0 = 0.0
}

//---------------------------------------------------------------------------------------------------------------
export function add_neq() {
    //---------------------------------------------------------------------------------------------------------------
    neq++;
}

//---------------------------------------------------------------------------------------------------------------
export function incr_querschnittSets() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets++;
    querschnittset.push(new TQuerschnittRechteck())
}

//---------------------------------------------------------------------------------------------------------------
export function del_last_querschnittSet() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets--;
    querschnittset.pop();
}

//---------------------------------------------------------------------------------------------------------------
export function rechnen() {
    //-----------------------------------------------------------------------------------------------------------

    console.log("in rechnen");

    let el = document.getElementById('id_button_nnodes') as any;
    nnodes = Number(el.nel);

    el = document.getElementById('id_button_nelem') as any;
    nelem = Number(el.nel);
    nelem_Balken = nelem;

    el = document.getElementById('id_button_nnodalloads') as any;
    nloads = Number(el.nel);

    el = document.getElementById('id_button_nstabvorverformungen') as any;
    nstabvorverfomungen = Number(el.nel);

    el = document.getElementById('id_button_nnodedisps') as any;
    nNodeDisps = Number(el.nel);

    el = document.getElementById('id_button_nlastfaelle') as any;
    nlastfaelle = Number(el.nel);

    el = document.getElementById('id_button_nkombinationen') as any;
    nkombinationen = Number(el.nel);
    /*
        el = document.getElementById('id_ndivsl') as HTMLInputElement;
        ndivsl = Number(el.value);

        el = document.getElementById('id_intart') as HTMLSelectElement;
        intArt = Number(el.value);

        el = document.getElementById('id_art') as HTMLSelectElement;
        art = Number(el.value);
    */
    el = document.getElementById('id_THIIO') as HTMLSelectElement;
    THIIO_flag = Number(el.value);

    el = document.getElementById('id_maxu_node') as HTMLSelectElement;
    maxU_node = Number(el.value);

    el = document.getElementById('id_maxu_dir') as HTMLSelectElement;
    maxU_dir = Number(el.value);

    el = document.getElementById('id_maxu_schief') as HTMLSelectElement;
    maxU_schief = Number(el.value) / 1000.0;  // in m bzw. rad

    el = document.getElementById('id_neigv') as HTMLSelectElement;
    neigv = Number(el.value);

    el = document.getElementById('id_button_nteilungen') as any;
    nelTeilungen = Number(el.nel);

    el = document.getElementById('id_button_niter') as any;
    n_iterationen = Number(el.nel);

    console.log("THIIO_flag", THIIO_flag, nelTeilungen, n_iterationen)

    console.log("intAt, art", intArt, art, ndivsl)
    console.log("maxU", maxU_node, maxU_dir, maxU_schief, neigv)

    read_nodes();
    read_elements();
    read_nodal_loads();
    read_element_loads();
    read_stabvorverformungen();
    read_kombinationen();

    calculate();

}

//---------------------------------------------------------------------------------------------------------------
export function set_querschnittRechteck(name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number,
    definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number) {
    //-----------------------------------------------------------------------------------------------------------

    const index = nQuerschnittSets - 1;

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].width = width;
    querschnittset[index].id = id;
    querschnittset[index].definedQuerschnitt = definedQuerschnitt;
    querschnittset[index].wichte = wichte;
    querschnittset[index].schubfaktor = schubfaktor;
    querschnittset[index].querdehnzahl = querdehnzahl;
    querschnittset[index].zso = zso;
    querschnittset[index].alphaT = alphaT;
    console.log("set_querschnittRechteck", index, emodul)
}


//---------------------------------------------------------------------------------------------------------------
export function update_querschnittRechteck(index: number, name: string, id: string, emodul: number, Iy: number, area: number,
    height: number, width: number, definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number) {
    //-----------------------------------------------------------------------------------------------------------

    querschnittset[index].name = name;
    querschnittset[index].emodul = emodul;
    querschnittset[index].Iy = Iy;
    querschnittset[index].area = area;
    querschnittset[index].height = height;
    querschnittset[index].width = width;
    querschnittset[index].id = id;
    querschnittset[index].definedQuerschnitt = definedQuerschnitt;
    querschnittset[index].wichte = wichte;
    querschnittset[index].schubfaktor = schubfaktor;
    querschnittset[index].querdehnzahl = querdehnzahl;
    querschnittset[index].zso = zso;
    querschnittset[index].alphaT = alphaT;

    console.log("update_querschnittRechteck", index, emodul)
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number, definedQuerschnitt: number, wichte: number
    let schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number

    console.log("index", index)
    name = querschnittset[index].name;
    emodul = querschnittset[index].emodul;
    Iy = querschnittset[index].Iy;
    area = querschnittset[index].area;
    height = querschnittset[index].height;
    width = querschnittset[index].width;
    id = querschnittset[index].id;
    definedQuerschnitt = querschnittset[index].definedQuerschnitt;
    wichte = querschnittset[index].wichte;
    schubfaktor = querschnittset[index].schubfaktor;
    querdehnzahl = querschnittset[index].querdehnzahl;
    zso = querschnittset[index].zso;
    alphaT = querschnittset[index].alphaT;

    console.log("get_querschnittRechteck", index, emodul)

    return [name, id, emodul, Iy, area, height, width, definedQuerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT]
}


//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck_name(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].name;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_classname(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].className;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_length(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let len = 0

    if (index >= 0) len = Object.keys(querschnittset[index]).length;
    console.log("get_querschnitt_length", querschnittset[index])

    return len;
}

//---------------------------------------------------------------------------------------------------------------
function read_nodes() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    let el = document.getElementById('id_knoten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);


    for (i = 0; i < nnodes; i++) {
        node.push(new TNode())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    let shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        let iz = izeile - 1
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) node[iz].x = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 2) node[iz].z = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) node[iz].L[0] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) node[iz].L[1] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) node[iz].L[2] = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 6) node[iz].phi = Number(testNumber(wert, izeile, ispalte, shad));

        }
    }

    nnodesTotal = nnodes;

    // definierte Knotenverformungen

    for (i = 0; i < nNodeDisps; i++) {
        nodeDisp0.push(new TNodeDisp)
    }

    el = document.getElementById('id_nnodedisps_tabelle');
    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;

    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        let iz = izeile - 1
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) nodeDisp0[iz].node = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) nodeDisp0[iz].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) nodeDisp0[iz].dispx0 = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) nodeDisp0[iz].dispz0 = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) nodeDisp0[iz].phi0 = Number(testNumber(wert, izeile, ispalte, shad));

        }
    }

}


//---------------------------------------------------------------------------------------------------------------
function read_nodal_loads() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_knotenlasten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);


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
            else if (ispalte === 3) load[izeile - 1].Px = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) load[izeile - 1].Pz = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) load[izeile - 1].p[2] = Number(testNumber(wert, izeile, ispalte, shad));
        }
        if (load[izeile - 1].lf > nlastfaelle) nlastfaelle = load[izeile - 1].lf

        console.log("R", izeile, load[izeile - 1])
    }
}

//---------------------------------------------------------------------------------------------------------------
function read_element_loads() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;


    let el = document.getElementById('id_button_nstreckenlasten') as any;
    const nstreckenlasten = Number(el.nel);

    el = document.getElementById('id_button_neinzellasten') as any;
    const neinzellasten = Number(el.nel);

    el = document.getElementById('id_button_ntemperaturlasten') as any;
    const ntemperaturlasten = Number(el.nel);

    el = document.getElementById('id_button_nvorspannungen') as any;
    const nvorspannungen = Number(el.nel);

    el = document.getElementById('id_button_nspannschloesser') as any;
    const nspannschloesser = Number(el.nel);

    ntotalEloads = neloads = nstreckenlasten + neinzellasten + ntemperaturlasten + nvorspannungen + nspannschloesser

    console.log("NELOADS", neloads, nstreckenlasten, neinzellasten, ntemperaturlasten, nvorspannungen, nspannschloesser)

    for (i = 0; i < neloads; i++) {
        eload.push(new TElLoads())
    }
    let ieload = 0

    // Streckenlasten

    el = document.getElementById('id_streckenlasten_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    let shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].art = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) eload[ieload].pL = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) eload[ieload].pR = Number(testNumber(wert, izeile, ispalte, shad));
        }
        if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf

        console.log("eload", izeile, eload[ieload])
        ieload++;
    }

    maxValue_eload = new Array(nlastfaelle).fill(0.0)

    for (i = 0; i < ieload; i++) {
        let lf = eload[i].lf - 1
        let art = eload[i].art
        console.log("art=", art, lf)
        if (art === 0 || art === 1 || art === 2) {
            if (Math.abs(eload[i].pL) > maxValue_eload[lf]) maxValue_eload[lf] = Math.abs(eload[i].pL)
            if (Math.abs(eload[i].pR) > maxValue_eload[lf]) maxValue_eload[lf] = Math.abs(eload[i].pR)
        }
    }


    // Einzellasten

    el = document.getElementById('id_einzellasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].x = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) eload[ieload].P = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 5) eload[ieload].M = Number(testNumber(wert, izeile, ispalte, shad));
            eload[ieload].art = 6;
        }
        if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Temperatur

    el = document.getElementById('id_temperaturlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].Tu = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 4) eload[ieload].To = Number(testNumber(wert, izeile, ispalte, shad));
            eload[ieload].art = 5;
        }
        if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Vorspannung

    el = document.getElementById('id_vorspannungen_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].sigmaV = Number(testNumber(wert, izeile, ispalte, shad))*1000.0; //von MN/m² in kN/m²
            eload[ieload].art = 9;
        }
        if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    // Spannschloss

    el = document.getElementById('id_spannschloesser_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    nRowTab = table.rows.length;
    nColTab = table.rows[0].cells.length;
    shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) eload[ieload].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) eload[ieload].lf = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) eload[ieload].delta_s = Number(testNumber(wert, izeile, ispalte, shad))/1000.;  // von mm in m
            eload[ieload].art = 10;
        }
        if (eload[ieload].lf > nlastfaelle) nlastfaelle = eload[ieload].lf

        console.log("eload", izeile, eload[ieload])
        ieload++;

    }

    //for (i = 0; i < nlastfaelle; i++) console.log('maxValue_eload', i, maxValue_eload[i])
    console.log('maxValue_eload', maxValue_eload)
}


//---------------------------------------------------------------------------------------------------------------
function read_stabvorverformungen() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_stabvorverfomungen_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    for (i = 0; i < nstabvorverfomungen; i++) {
        stabvorverformung.push(new TStabvorverformung())
    }

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    maxValue_w0 = 0.0

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            if (ispalte === 1) stabvorverformung[izeile - 1].element = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 2) stabvorverformung[izeile - 1].p[0] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;   // von cm in m
            else if (ispalte === 3) stabvorverformung[izeile - 1].p[1] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;
            else if (ispalte === 4) stabvorverformung[izeile - 1].p[2] = Number(testNumber(wert, izeile, ispalte, shad)) / 100.0;
        }

        maxValue_w0 = Math.max(maxValue_w0, Math.abs(stabvorverformung[izeile - 1].p[0]), Math.abs(stabvorverformung[izeile - 1].p[1]), Math.abs(stabvorverformung[izeile - 1].p[2]))
        console.log("stabvorverfomung", izeile, stabvorverformung[izeile - 1])
    }

    console.log('nstabvorverfomungen, maxValue_w0', nstabvorverfomungen, maxValue_w0)
}

//---------------------------------------------------------------------------------------------------------------
function read_elements() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number, ielem: number;

    const el = document.getElementById('id_element_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    element.length = 0
    for (i = 0; i < nelem; i++) {
        element.push(new TElement())
    }
    nelemTotal = nelem

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 1; ispalte < nColTab; ispalte++) {
            if (ispalte === 1) {
                //console.log('iSpalte === 1',izeile, ispalte, table.rows[izeile].cells[ispalte].firstElementChild.value);
                wert = (table.rows[izeile].cells[ispalte].firstElementChild as HTMLSelectElement).value;
            } else {
                let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
                wert = child.value;
                //console.log('NODE i:1', nnodes, izeile, ispalte, wert, table.rows[izeile].cells[ispalte].textContent);
            }
            if (ispalte === 1) element[izeile - 1].qname = wert;
            else if (ispalte === 2) element[izeile - 1].nodeTyp = Number(testNumber(wert, izeile, ispalte, shad));
            else if (ispalte === 3) element[izeile - 1].nod[0] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte === 4) element[izeile - 1].nod[1] = Number(testNumber(wert, izeile, ispalte, shad)) - 1;
            else if (ispalte > 4 && ispalte <= 10) {
                element[izeile - 1].gelenk[ispalte - 5] = Number(testNumber(wert, izeile, ispalte, shad));
            }
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
function read_kombinationen() {
    //-----------------------------------------------------------------------------------------------------------

    let i: number;

    const el = document.getElementById('id_kombinationen_tabelle');
    //console.log('EL: >>', el);
    //console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));

    const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
    //console.log('nZeilen', table.rows.length);
    //console.log('nSpalten', table.rows[0].cells.length);

    kombiTabelle = Array.from(Array(nkombinationen), () => new Array(nlastfaelle).fill(0.0));

    let nRowTab = table.rows.length;
    let nColTab = table.rows[0].cells.length;
    let wert: any;
    const shad = el?.shadowRoot?.getElementById('mytable')

    for (let izeile = 1; izeile < nRowTab; izeile++) {
        for (let ispalte = 2; ispalte < nColTab; ispalte++) {
            let child = table.rows[izeile].cells[ispalte].firstElementChild as HTMLInputElement;
            wert = child.value;
            //console.log('NODE i:1', nnodes, izeile, ispalte, wert);
            kombiTabelle[izeile - 1][ispalte - 2] = Number(testNumber(wert, izeile, ispalte, shad));
        }

        console.log("kombiTabelle", izeile, kombiTabelle[izeile - 1])
    }
}


//---------------------------------------------------------------------------------------------------------------
export function add_rechteck_querschnitt(werte: any[]) {
    //-----------------------------------------------------------------------------------------------------------
    console.log('add_rechteck_querschnitt wert', werte)

    incr_querschnittSets();

    const qname = werte[0]
    const id = werte[1]
    const emodul = werte[2]
    const Iy = werte[3]
    const area = werte[4]
    const height = werte[5]
    const width = werte[6]
    const defquerschnitt = werte[7]
    const wichte = werte[8]
    const schubfaktor = werte[9]
    const querdehnzahl = werte[10]
    const zso = werte[11]
    const alphaT = werte[12]

    set_querschnittRechteck(
        qname,
        id,
        emodul,
        Iy,
        area,
        height,
        width,
        defquerschnitt,
        wichte,
        schubfaktor,
        querdehnzahl,
        zso,
        alphaT
    );


    var tag = document.createElement('sl-tree-item');
    var text = document.createTextNode(qname);
    tag.appendChild(text);
    tag.addEventListener('click', opendialog);

    tag.id = id;
    var element = document.getElementById('id_tree_LQ');
    element?.appendChild(tag);
    //console.log('child appendchild', element);

    const ele = document.getElementById('id_element_tabelle');
    //console.log('ELE: >>', ele);
    ele?.setAttribute('newselect', '4');

}

//---------------------------------------------------------------------------------------------------------------
export function init_tabellen() {
    //-----------------------------------------------------------------------------------------------------------

    // Querschnitt hinzufügen
    {

        incr_querschnittSets();

        const qname = 'R 40x30'
        const id = 'mat-0';
        const emodul = 30000.
        const Iy = 160000.
        const area = 1200.
        const height = 40.
        const width = 30.
        const defquerschnitt = 1
        const wichte = 0.0
        const schubfaktor = 0.0
        const querdehnzahl = 0.2
        const zso = 20.0;
        const alphaT = 1.e-5

        set_querschnittRechteck(
            qname,
            id,
            emodul,
            Iy,
            area,
            height,
            width,
            defquerschnitt,
            wichte,
            schubfaktor,
            querdehnzahl,
            zso,
            alphaT
        );

        /*
        const el = document.getElementById('id_dialog_rechteck') as HTMLDialogElement;

        const qName = (
            el?.shadowRoot?.getElementById('qname') as HTMLInputElement
        ).value;
        console.log('NAME', qName);
        */
        var tag = document.createElement('sl-tree-item');
        var text = document.createTextNode(qname);
        tag.appendChild(text);
        tag.addEventListener('click', opendialog);

        tag.id = id;
        var element = document.getElementById('id_tree_LQ');
        element?.appendChild(tag);
        //console.log('child appendchild', element);

        const ele = document.getElementById('id_element_tabelle');
        //console.log('ELE: >>', ele);
        ele?.setAttribute('newselect', '4');
    }

    let el = document.getElementById('id_element_tabelle');

    let table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '0';
    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '2';


    //(table.rows[2].cells[3].firstElementChild as HTMLInputElement).value = '2';
    //(table.rows[2].cells[4].firstElementChild as HTMLInputElement).value = '3';

    el = document.getElementById('id_knoten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '1';

    (table.rows[2].cells[1].firstElementChild as HTMLInputElement).value = '5';
    //(table.rows[3].cells[1].firstElementChild as HTMLInputElement).value = '5';


    el = document.getElementById('id_knotenlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[1].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[3].firstElementChild as HTMLInputElement).value = '-600';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '50';


    el = document.getElementById('id_streckenlasten_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    (table.rows[1].cells[1].firstElementChild as HTMLInputElement).value = '1';
    (table.rows[1].cells[2].firstElementChild as HTMLInputElement).value = '2';
    (table.rows[1].cells[4].firstElementChild as HTMLInputElement).value = '5';
    (table.rows[1].cells[5].firstElementChild as HTMLInputElement).value = '5';

    el = document.getElementById('id_kombinationen_tabelle');

    table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    for (let i = 1; i <= Number(nlastfaelle_init); i++) {
        (table.rows[i].cells[i + 1].firstElementChild as HTMLInputElement).value = '1';

    }
}

//---------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------

function calculate() {

    //-----------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------

    let i: number, j: number

    let ielem: number

    (document.getElementById('output') as HTMLTextAreaElement).value = ''; // Textarea output löschewn

    el.length = 0

    // Berechnung der Gleichungsnummern bestimmen der Federn

    nfedern = 0
    neq = 0;
    for (i = 0; i < nnodesTotal; i++) {

        let kx = 0.0, kz = 0.0, kphi = 0.0
        if (node[i].L[0] > 1.0) kx = node[i].L[0];
        if (node[i].L[1] > 1.0) kz = node[i].L[1];
        if (node[i].L[2] > 1.0) kphi = node[i].L[2];

        node[i].kx = kx
        node[i].kz = kz
        node[i].kphi = kphi

        for (j = 0; j < 3; j++) {
            if (node[i].L[j] === 1) {
                node[i].L[j] = -1;
            } else {
                node[i].L[j] = neq;
                neq = neq + 1;
            }
        }

        let phi = node[i].phi * Math.PI / 180.0
        node[i].co = Math.cos(phi)
        node[i].si = Math.sin(phi)


        if (kx > 1.0 || kz > 1.0 || kphi > 1.0) {
            // neue feder einführen
            console.log("neue Feder gefunden", i, node[i].L)

            feder.push(new TSpring(i, kx, kz, kphi))
            nelemTotal++;
            nfedern++;
        }
    }



    // Knotenlasten wirken in globalen Richtungen, auch bei gedrehten Lagern

    for (i = 0; i < nloads; i++) {
        let kn = load[i].node
        if (kn < nnodes) {
            load[i].p[0] = node[kn].co * load[i].Px - node[kn].si * load[i].Pz
            load[i].p[1] = node[kn].si * load[i].Px + node[kn].co * load[i].Pz
        }
    }

    // vorgegebene Knotenverformungen den Elementlasten zuordnen

    let nElNodeDisps = 0
    for (i = 0; i < nNodeDisps; i++) {
        for (j = 0; j < nelem_Balken; j++) {
            if (nodeDisp0[i].node === element[j].nod[0] || nodeDisp0[i].node === element[j].nod[1]) {
                nElNodeDisps = nElNodeDisps + 1
                eload.push(new TElLoads())
                eload[ntotalEloads].art = 8
                eload[ntotalEloads].element = j
                eload[ntotalEloads].dispx0 = nodeDisp0[i].dispx0 / 1000.0   // von mm in m
                eload[ntotalEloads].dispz0 = nodeDisp0[i].dispz0 / 1000.0
                eload[ntotalEloads].phi0 = nodeDisp0[i].phi0 / 1000.0       // von mrad in rad
                eload[ntotalEloads].node0 = nodeDisp0[i].node
                eload[ntotalEloads].lf = nodeDisp0[i].lf
                ntotalEloads++;
            }
        }
    }

    neloads = ntotalEloads;



    // für die Grafik

    xmin = 1.e30
    zmin = 1.e30
    xmax = -1.e30
    zmax = -1.e30

    for (i = 0; i < nnodes; i++) {
        if (node[i].x < xmin) xmin = node[i].x;
        if (node[i].z < zmin) zmin = node[i].z;
        if (node[i].x > xmax) xmax = node[i].x;
        if (node[i].z > zmax) zmax = node[i].z;
    }

    slmax = Math.sqrt((xmax - xmin) ** 2 + (zmax - zmin) ** 2)

    for (i = 0; i < nlastfaelle; i++) {
        maxValue_lf.push(new TMaxValues());
        maxValue_lf[i].zero();
    }

    for (i = 0; i < nkombinationen; i++) {
        maxValue_komb.push(new TMaxValues());
        maxValue_komb[i].zero();
        maxValue_u0.push(new TMaxU0);
    }

    console.log("N E I G V", neigv)
    maxValue_eigv = Array.from(Array(nkombinationen), () => new Array(neigv).fill(0.0));

    console.log("Anzahl Gleichungen: ", neq)

    let emodul: number = 0.0, ks: number = 0.0, wichte: number = 0.0, definedQuerschnitt = 1
    let querdehnzahl: number = 0.3, schubfaktor: number = 0.833, zso: number = 0.0, alphaT = 0.0
    let nfiber: number = 2, maxfiber: number = 5, offset_abstand: number = 0.0, height: number = 0.0, width = 0.0
    let Iy: number = 0.0, area: number = 0.0, b: number;
    let lmj: number = 0, nod1: number, nodi: number

    let breite: number[] = Array(2)
    let abstand: number[] = Array(2)

    for (ielem = 0; ielem < nelem; ielem++) {

        // get material data

        const qname = element[ielem].qname
        console.log("qname", qname, nQuerschnittSets)
        let index = -1;
        for (j = 0; j < nQuerschnittSets; j++) {
            console.log("qname", querschnittset[j].name)
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
            definedQuerschnitt = querschnittset[index].definedQuerschnitt
            querdehnzahl = querschnittset[index].querdehnzahl
            schubfaktor = querschnittset[index].schubfaktor
            zso = querschnittset[index].zso / 100.0   // von cm in m
            alphaT = querschnittset[index].alphaT

            nfiber = 2
            maxfiber = 3 * (nfiber - 1)
            height = querschnittset[index].height / 100.0     // in m
            width = querschnittset[index].width / 100.0     // in m
            if (definedQuerschnitt === 1) {
                b = width
                area = width * height
                Iy = area * height * height / 12.0
                console.log("A, Iy", area, Iy)
            } else {
                Iy = querschnittset[index].Iy / 100000000.0
                area = querschnittset[index].area / 10000.0
                b = Math.sqrt(area * area * area / Iy / 12.0)      // in m
                console.log("BREITE=", b, Iy)
            }
            breite[0] = b
            breite[1] = b
            abstand[0] = 0.0
            abstand[1] = height
            offset_abstand = height / 2.0       // in m

        }

        el.push(new CTimoshenko_beam())
        el[ielem].setQuerschnittsdaten(emodul, Iy, area, wichte, ks, querdehnzahl, schubfaktor, height, zso, alphaT)
        el[ielem].initialisiereElementdaten(ielem)
    }

    // Federn addieren

    for (let ifeder = 0; ifeder < nfedern; ifeder++) {
        el.push(new CSpring(feder[ifeder].getNode(), feder[ifeder].getKx(), feder[ifeder].getKz(), feder[ifeder].getKphi()))
        el[ifeder + nelem].initialisiereElementdaten(ielem)
    }

    console.log("TOTALS,nelemTotal,nnodesTotal ", nelemTotal, nnodesTotal)
    for (ielem = 0; ielem < el.length; ielem++) {
        el[ielem].ich_bin(ielem);
    }

    const stiff = Array.from(Array(neq), () => new Array(neq).fill(0.0));
    const R = Array(neq);
    const u = Array(neq);

    lagerkraft = Array.from(Array(nnodesTotal), () => new Array(3).fill(0.0));

    //------------------------------------------------------------------------   alte Ausgabe löschen
    let elem = document.getElementById('id_newDiv');
    if (elem !== null) elem.parentNode?.removeChild(elem);

    const myResultDiv = document.getElementById("id_results");  //in div
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", "id_newDiv");
    myResultDiv?.appendChild(newDiv);
    //------------------------------------------------------------------------

    if (THIIO_flag === 0) { // Theorie I.Ordnung

        disp_lf = new TFArray3D(1, nnodesTotal, 1, 3, 1, nlastfaelle);   // nlastfaelle
        console.log("nlastfaelle", nlastfaelle)
        stabendkraefte = new TFArray3D(1, 6, 1, nelemTotal, 1, nlastfaelle);   // nlastfaelle
        lagerkraefte = new TFArray3D(0, nnodes - 1, 0, 2, 0, nlastfaelle - 1);   //
        u_lf = Array.from(Array(neq), () => new Array(nlastfaelle).fill(0.0));

        for (let iLastfall = 1; iLastfall <= nlastfaelle; iLastfall++) {

            for (i = 0; i < neq; i++) stiff[i].fill(0.0);

            R.fill(0.0);
            u.fill(0.0);
            for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0)

            for (ielem = 0; ielem < nelemTotal; ielem++) {

                el[ielem].berechneElementsteifigkeitsmatrix(0);
                el[ielem].addiereElementsteifigkeitmatrix(stiff)

                for (let ieload = 0; ieload < neloads; ieload++) {
                    if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastfall)) {
                        el[ielem].berechneElementlasten(ieload)
                    }
                }
            }

            for (j = 0; j < neq; j++) {
                console.log('stiff[]', stiff[j])
            }

            // Aufstellen der rechte Seite, Einzellasten


            for (i = 0; i < nloads; i++) {
                if (load[i].lf === iLastfall) {
                    nod1 = load[i].node
                    for (j = 0; j < 3; j++) {
                        lmj = node[nod1].L[j]
                        if (lmj >= 0) {
                            R[lmj] = R[lmj] + load[i].p[j]
                        }
                    }
                }
            }

            //  und jetzt noch die normalen Elementlasten

            for (ielem = 0; ielem < nelem; ielem++) {

                for (let ieload = 0; ieload < neloads; ieload++) {
                    if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastfall)) {
                        for (j = 0; j < 6; j++) {
                            lmj = el[ielem].lm[j]
                            if (lmj >= 0) {
                                R[lmj] = R[lmj] - eload[ieload].el_r[j]
                            }
                        }
                    }
                }

            }

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
                u_lf[i][iLastfall - 1] = u[i]
            }

            // Rückrechnung

            let force: number[] = Array(6)

            for (ielem = 0; ielem < nelemTotal; ielem++) {
                force = el[ielem].berechneInterneKraefte(ielem, iLastfall, 0, u);
                console.log("force", el[ielem].neqe, force)
                for (i = 0; i < el[ielem].neqe; i++) stabendkraefte.set(i + 1, ielem + 1, iLastfall, force[i]);

                el[ielem].berechneLagerkraefte();
            }

            let disp = [3]
            for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                for (j = 0; j < 3; j++) {
                    let ieq = node[i].L[j]
                    if (ieq === -1) {
                        disp[j] = 0
                    } else {
                        disp[j] = u[ieq] * 1000     // Umrechnung in mm und mrad
                    }
                }

                for (j = 0; j < 3; j++) {
                    disp_lf.set(i + 1, j + 1, iLastfall, disp[j])
                    if (Math.abs(disp[j]) > maxValue_lf[iLastfall - 1].disp) maxValue_lf[iLastfall - 1].disp = Math.abs(disp[j])
                }
            }

            for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen
                if ((i + 1) === iLastfall) {
                    nodi = load[i].node
                    lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0]
                    lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1]
                    lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2]
                }
            }

            for (let inode = 0; inode < nnodes; inode++) {
                lagerkraefte.set(inode, 0, iLastfall - 1, lagerkraft[inode][0]);
                lagerkraefte.set(inode, 1, iLastfall - 1, lagerkraft[inode][1]);
                lagerkraefte.set(inode, 2, iLastfall - 1, lagerkraft[inode][2]);
            }

            //for (i = 0; i < nnodesTotal; i++) {
            //    console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
            //}

            for (ielem = 0; ielem < nelem; ielem++) {
                el[ielem].berechneElementSchnittgroessen(ielem, iLastfall - 1)
            }


            ausgabe(iLastfall, newDiv)

        }   //ende iLastfall

    }
    // -------------------------------------------------------------------------------------------------------  T H  II.  O R D N U N G

    else if (THIIO_flag === 1) {

        const stiff_sig = Array.from(Array(neq), () => new Array(neq).fill(0.0));

        disp_lf = new TFArray3D(1, nnodesTotal, 1, 3, 1, nkombinationen);
        u_lf = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));
        u0_komb = Array.from(Array(neq), () => new Array(nkombinationen).fill(0.0));

        //console.log("nkombinationen", nkombinationen)
        stabendkraefte = new TFArray3D(1, 6, 1, nelemTotal, 1, nkombinationen);
        lagerkraefte = new TFArray3D(0, nnodes - 1, 0, 2, 0, nkombinationen - 1);
        eigenform_container_node.length = 0
        eigenform_container_u.length = 0
        for (let i = 0; i < nkombinationen; i++) {
            let a = new TFArray3D(1, nnodesTotal, 1, 3, 1, neigv)
            eigenform_container_node.push(a)

            let b = new TFArray2D(0, neq - 1, 1, neigv)
            eigenform_container_u.push(b)
        }
        alpha_cr = Array.from(Array(nkombinationen), () => new Array(neigv).fill(0.0));

        for (ielem = 0; ielem < nelem; ielem++) {

            for (let ieload = 0; ieload < neloads; ieload++) {
                el[ielem].berechneElementlasten(ieload)
            }
        }


        let pg = new Array(neq)

        for (let iKomb = 1; iKomb <= nkombinationen; iKomb++) {

            pg.fill(0.0)
            //console.log("pg init", pg)

            console.log("\n***************  K O M B I N A T I O N ", iKomb, "\n\n")

            for (let iter = 0; iter < n_iterationen; iter++) {

                console.log("_________________  I T E R  = ", iter, " ___________________")

                for (i = 0; i < neq; i++) stiff[i].fill(0.0);
                for (i = 0; i < nnodesTotal; i++) lagerkraft[i].fill(0.0)

                R.fill(0.0);
                u.fill(0.0);

                for (ielem = 0; ielem < nelemTotal; ielem++) {

                    el[ielem].berechneElementsteifigkeitsmatrix(iter);
                    el[ielem].addiereElementsteifigkeitmatrix(stiff)
                    /*
                                        for (let ieload = 0; ieload < neloads; ieload++) {
                                            if ((eload[ieload].element === ielem) && (eload[ieload].lf === iKomb)) {
                                                el[ielem].berechneElementlasten(ieload)
                                            }
                                        }
                    */
                }

                for (j = 0; j < neq; j++) {
                    console.log('stiff[]', stiff[j])
                }

                // Aufstellen der rechte Seite, Einzellasten


                for (i = 0; i < nloads; i++) {
                    const index = load[i].lf - 1
                    if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                        nod1 = load[i].node
                        for (j = 0; j < 3; j++) {
                            lmj = node[nod1].L[j]
                            if (lmj >= 0) {
                                R[lmj] = R[lmj] + load[i].p[j] * kombiTabelle[iKomb - 1][index]
                            }
                        }
                    }
                }
                console.log("R Einzellasten", R)

                //  und jetzt noch die normalen Elementlasten

                for (ielem = 0; ielem < nelem; ielem++) {

                    for (let ieload = 0; ieload < neloads; ieload++) {
                        if (eload[ieload].element === ielem) {
                            const index = eload[ieload].lf - 1
                            console.log("elem kombi index", index, kombiTabelle[iKomb - 1][index])
                            if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                                for (j = 0; j < 6; j++) {
                                    lmj = el[ielem].lm[j]
                                    if (lmj >= 0) {
                                        R[lmj] = R[lmj] - eload[ieload].el_r[j] * kombiTabelle[iKomb - 1][index]
                                    }
                                }
                            }
                        }
                    }

                }
                console.log("R mit Elementlasten", R)

                //for (i = 0; i < neq; i++) R[i] -= pg[i]   // Schiefstellung

                if (iter > 0) {

                    let pel = new Array(6)

                    for (ielem = 0; ielem < nelem; ielem++) {

                        el[ielem].berechneElementlasten_Vorverformung(pel, pg)
                        console.log("P E L", ielem, pel)

                        for (j = 0; j < 6; j++) {
                            lmj = el[ielem].lm[j]
                            if (lmj >= 0) {
                                R[lmj] = R[lmj] - pel[j]
                            }
                        }
                    }
                }




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
                    u_lf[i][iKomb - 1] = u[i]
                }

                // Rückrechnung

                let force: number[] = Array(6)

                for (ielem = 0; ielem < nelemTotal; ielem++) {
                    force = el[ielem].berechneInterneKraefte(ielem, iKomb, iter, u);
                    console.log("force", force)
                    for (i = 0; i < 6; i++) stabendkraefte.set(i + 1, ielem + 1, iKomb, force[i]);

                    el[ielem].berechneLagerkraefte();
                }

                if (iter > 0) {
                    let disp = [3]
                    for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                        for (j = 0; j < 3; j++) {
                            let ieq = node[i].L[j]
                            if (ieq === -1) {
                                disp[j] = 0
                            } else {
                                disp[j] = u[ieq] * 1000     // Umrechnung in mm und mrad
                            }
                        }

                        for (j = 0; j < 3; j++) {
                            disp_lf.set(i + 1, j + 1, iKomb, disp[j])
                            if (Math.abs(disp[j]) > maxValue_komb[iKomb - 1].disp) maxValue_komb[iKomb - 1].disp = Math.abs(disp[j])
                        }
                    }
                }
                if (iter === 0) {     // Schiefstellung

                    eigenwertberechnung(iKomb, stiff, stiff_sig, u, 0)

                    let umax = 0.0, ieq = -1
                    if (maxU_node === 0 || maxU_node > nnodes) {

                        for (i = 0; i < neq; i++) {
                            if (Math.abs(u[i]) > umax) {
                                umax = Math.abs(u[i]);
                                ieq = i;
                            }
                        }
                        console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU umax=", umax)

                    } else {
                        ieq = node[maxU_node - 1].L[maxU_dir]
                        console.log("schief", ieq, u[ieq])
                        umax = Math.abs(u[ieq])
                    }

                    let pg_max = 0.0
                    if (umax > 0.0) {
                        let vorzeichen_U = Math.sign(u_lf[ieq][iKomb - 1])
                        if (vorzeichen_U === 0.0) vorzeichen_U = 1.0
                        let vorzeichen_umax = Math.sign(u[ieq])
                        let faktor = vorzeichen_U * vorzeichen_umax * maxU_schief / umax
                        console.log("vorzeichen", vorzeichen_U, vorzeichen_umax, faktor)
                        for (i = 0; i < neq; i++) {
                            pg[i] = u[i] * faktor
                            if (Math.abs(pg[i]) > pg_max) pg_max = Math.abs(pg[i])
                        }
                    } else {
                        pg.fill(0.0)
                    }

                    for (i = 0; i < neq; i++) {
                        u0_komb[i][iKomb - 1] = pg[i]
                    }
                    maxValue_u0[iKomb - 1].ieq = ieq
                    maxValue_u0[iKomb - 1].u0 = pg_max

                    //console.log("pg", pg)

                    /*
                                        for (i = 0; i < neq; i++) {
                                            let sum = 0.0
                                            for (j = 0; j < neq; j++) {
                                                sum += stiff_sig[i][j] * u[j] * maxU_schief / umax
                                            }
                                            pg[i] = sum
                                        }
                                        console.log("pg", pg)
                    */

                }

            }  // ende iter

            if (maxValue_u0[iKomb - 1].ieq >= 0) {
                console.log("==== pg_max", maxValue_u0[iKomb - 1].ieq, maxValue_u0[iKomb - 1].u0, u0_komb[maxValue_u0[iKomb - 1].ieq][iKomb - 1])
            }

            for (ielem = 0; ielem < nelem; ielem++) {
                el[ielem].berechneElementSchnittgroessen(ielem, iKomb - 1)
            }


            for (i = 0; i < nloads; i++) {                          // Knotenlasten am Knoten abziehen

                const index = load[i].lf - 1
                if (kombiTabelle[iKomb - 1][index] !== 0.0) {
                    nodi = load[i].node
                    lagerkraft[nodi][0] = lagerkraft[nodi][0] + load[i].p[0] * kombiTabelle[iKomb - 1][index]
                    lagerkraft[nodi][1] = lagerkraft[nodi][1] + load[i].p[1] * kombiTabelle[iKomb - 1][index]
                    lagerkraft[nodi][2] = lagerkraft[nodi][2] + load[i].p[2] * kombiTabelle[iKomb - 1][index]
                }
            }


            for (let inode = 0; inode < nnodes; inode++) {
                lagerkraefte.set(inode, 0, iKomb - 1, lagerkraft[inode][0]);
                lagerkraefte.set(inode, 1, iKomb - 1, lagerkraft[inode][1]);
                lagerkraefte.set(inode, 2, iKomb - 1, lagerkraft[inode][2]);
            }
            //for (i = 0; i < nnodesTotal; i++) {
            //    console.log("Lager", i + 1, lagerkraft[i][0], lagerkraft[i][1], lagerkraft[i][2])
            //}

            // Berechnung alpha_cr, Knickformen

            eigenwertberechnung(iKomb, stiff, stiff_sig, u, 1)

            ausgabe(iKomb, newDiv)


            //for (i = 0; i < nnodes; i++) {
            //    console.log("eigenform_c", i,eigenform_container_node[iKomb-1]._(i + 1, 1, 1), eigenform_container_node[iKomb-1]._(i + 1, 2, 1), eigenform_container_node[iKomb-1]._(i + 1, 3, 1))
            //}

        }   //ende iKomb

    }

    init_grafik();
    drawsystem();

    return 0;
}

//---------------------------------------------------------------------------------------------------------------
function eigenwertberechnung(iKomb: number, stiff: number[][], stiff_sig: number[][], u: number[], flag: number) {
    //---------------------------------------------------------------------------------------------------------------
    {

        let i: number, j: number, ielem: number

        for (i = 0; i < neq; i++) stiff[i].fill(0.0);
        for (i = 0; i < neq; i++) stiff_sig[i].fill(0.0);

        //R.fill(0.0);
        //u.fill(0.0);
        //const help = Array.from(Array(6), () => new Array(6));

        for (ielem = 0; ielem < nelem; ielem++) {

            el[ielem].berechneElementsteifigkeitsmatrix(0);
            el[ielem].addiereElementsteifigkeitmatrix(stiff)

            el[ielem].berechneElementsteifigkeitsmatrix_Ksig();
            el[ielem].addiereElementsteifigkeitmatrix_ksig(stiff_sig)

        }

        for (i = 0; i < neq; i++) {
            console.log("stiff_sig", stiff_sig[i])
        }

        let kstiff_array = new Float64Array(neq * neq);
        let k = 0
        for (let ispalte = 0; ispalte < neq; ispalte++) {
            for (let izeile = 0; izeile < neq; izeile++) {
                kstiff_array[k] = stiff[izeile][ispalte];
                k++;
            }
        }
        let kstiff_ptr = Module._malloc(kstiff_array.length * bytes_8);
        Module.HEAPF64.set(kstiff_array, kstiff_ptr / bytes_8);

        let kstiff_sig_array = new Float64Array(neq * neq);
        k = 0
        for (let ispalte = 0; ispalte < neq; ispalte++) {
            for (let izeile = 0; izeile < neq; izeile++) {
                kstiff_sig_array[k] = stiff_sig[izeile][ispalte];
                k++;
            }
        }
        let kstiff_sig_ptr = Module._malloc(kstiff_sig_array.length * bytes_8);
        Module.HEAPF64.set(kstiff_sig_array, kstiff_sig_ptr / bytes_8);

        let eigenform_ptr = Module._malloc(neq * neigv * bytes_8);
        let omega_ptr = Module._malloc(neigv * bytes_8);

        c_simvektoriteration(kstiff_ptr, kstiff_sig_ptr, omega_ptr, eigenform_ptr, neq, neigv);

        let omega_array = new Float64Array(Module.HEAPF64.buffer, omega_ptr, neigv);
        console.log("omega", omega_array[0], omega_array[1]);

        for (i = 0; i < neigv; i++) alpha_cr[iKomb - 1][i] = omega_array[i] ** 2

        let eigenform_array = new Float64Array(Module.HEAPF64.buffer, eigenform_ptr, neq * neigv);
        //console.log("eigenform_array", eigenform_array);

        if (flag === 0) {

            for (i = 0; i < neq; i++) u[i] = eigenform_array[i]

        } else {

            let disp = [3]
            let offset = 0
            for (let ieigv = 1; ieigv <= neigv; ieigv++) {

                for (i = 0; i < nnodes; i++) {                      // Ausgabe der Verschiebungen der einzelnen Knoten im gedrehten Koordinatensystem
                    for (j = 0; j < 3; j++) {
                        let ieq = node[i].L[j]
                        if (ieq === -1) {
                            disp[j] = 0
                        } else {
                            disp[j] = eigenform_array[ieq + offset]
                        }
                    }

                    for (j = 0; j < 3; j++) {
                        // console.log("eigenform_container_node[iKomb]", eigenform_container_node[iKomb-1])
                        eigenform_container_node[iKomb - 1].set(i + 1, j + 1, ieigv, disp[j])
                        if (Math.abs(disp[j]) > maxValue_eigv[iKomb - 1][ieigv - 1]) maxValue_eigv[iKomb - 1][ieigv - 1] = Math.abs(disp[j])
                    }
                }

                for (i = 0; i < neq; i++) {
                    eigenform_container_u[iKomb - 1].set(i, ieigv, eigenform_array[i + offset])
                }
                offset = offset + neq
                console.log(" maxValue_eigv[iKomb - 1][ieigv-1] = ", maxValue_eigv[iKomb - 1][ieigv - 1])
            }
        }

        Module._free(kstiff_ptr);
        Module._free(kstiff_sig_ptr);
        Module._free(eigenform_ptr);
        Module._free(omega_ptr);
    }

}



//--------------------------------------------------------------------------------------------
//------------------------------- A U S G A B E ----------------------------------------------
//--------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
function ausgabe(iLastfall: number, newDiv: HTMLDivElement) {
    //---------------------------------------------------------------------------------------------------------------

    let i: number, j: number

    let tag = document.createElement("p"); // <p></p>
    tag.setAttribute("id", "id_ergebnisse");
    let text = document.createTextNode("xxx");
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
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "&phi; &nbsp;[mrad]";
        th3.title = "Verdrehung &phi;, positiv im Gegenuhrzeigersinn"
        th3.setAttribute("class", "table_cell_center");
        row.appendChild(th3);

        for (i = 0; i < nnodes; i++) {

            let newRow = table.insertRow(-1);
            let newCell, newText
            newCell = newRow.insertCell(0);  // Insert a cell in the row at index 0

            newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_center");

            newCell = newRow.insertCell(1);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(disp_lf._(i + 1, 1, iLastfall), 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            newCell = newRow.insertCell(2);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(disp_lf._(i + 1, 2, iLastfall), 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");

            newCell = newRow.insertCell(3);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(disp_lf._(i + 1, 3, iLastfall), 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");
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
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "M<sub>y</sub>&nbsp;[kNm]";
        th3.title = "Einspannmoment, positiv im Uhrzeigersinn"
        th3.setAttribute("class", "table_cell_center");
        row.appendChild(th3);

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

            newCell = newRow.insertCell(3);  // Insert a cell in the row at index 1
            newText = document.createTextNode(myFormat(lagerkraft[i][2], 2, 2));  // Append a text node to the cell
            newCell.appendChild(newText);
            newCell.setAttribute("class", "table_cell_right");
        }
    }

    // Stabendkräfte/-momente
    {
        tag = document.createElement("p"); // <p></p>
        text = document.createTextNode("xxx");
        tag.appendChild(text);
        tag.innerHTML = "<b>Stabendkräfte/-momente</b>"

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
        th1.innerHTML = "N<sub>L</sub> &nbsp;[kN]";
        th1.title = "Normalkraft N, positiv als Zugktaft"
        th1.setAttribute("class", "table_cell_center");
        row.appendChild(th1);
        // @ts-ignore
        const th2 = table.tHead.appendChild(document.createElement("th"));
        th2.innerHTML = "V<sub>Lz</sub>&nbsp;[kN]";
        th2.title = "Querkraft Vz, positiv in negativer z-Richtung am negativen Schnittufer"
        th2.setAttribute("class", "table_cell_center");
        row.appendChild(th2);
        // @ts-ignore
        const th3 = table.tHead.appendChild(document.createElement("th"));
        th3.innerHTML = "M<sub>Ly</sub>&nbsp;[kNm]";
        th3.title = "Biegemoment, positiv im Uhrzeigersinn am negativen Schnittufer"
        th3.setAttribute("class", "table_cell_center");
        row.appendChild(th3);

        // @ts-ignore
        const th4 = table.tHead.appendChild(document.createElement("th"));
        th4.innerHTML = "N<sub>R</sub> &nbsp;[kN]";
        th4.title = "Normalkraft N, positiv als Zugktaft"
        th4.setAttribute("class", "table_cell_center");
        row.appendChild(th4);
        // @ts-ignore
        const th5 = table.tHead.appendChild(document.createElement("th"));
        th5.innerHTML = "V<sub>Rz</sub>&nbsp;[kN]";
        th5.title = "Querkraft Vz, positiv in z-Richtung am positiven Schnittufer"
        th5.setAttribute("class", "table_cell_center");
        row.appendChild(th5);
        // @ts-ignore
        const th6 = table.tHead.appendChild(document.createElement("th"));
        th6.innerHTML = "M<sub>Ry</sub>&nbsp;[kNm]";
        th6.title = "Biegemoment, positiv im Gegenuhrzeigersinn am positiven Schnittufer"
        th6.setAttribute("class", "table_cell_center");
        row.appendChild(th6);

        for (i = 0; i < nelem; i++) {

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

}
