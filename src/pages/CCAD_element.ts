import { TLoads, TNode } from "./rechnen";

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    two_obj: any;
    qname: string = '';
    className = 'TCAD_Element';
    isActive = true;
    isSelected = false;

    elTyp: number = 0; // 0 = 2 Knoten, 1 = Fachwerkstab, 3 = 3 Knoten, 3 = 4 Knoten

    x1 = 0.0
    z1 = 0.0;

    index1 = -1;

    constructor(obj: any, x1: number, z1: number, index1: number, elTyp: number) {
        this.two_obj = obj;
        this.x1 = x1;
        this.z1 = z1;
        this.elTyp = elTyp;
        this.index1 = index1;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    getTwoObj() {
        return this.two_obj;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    setTwoObj(obj: any) {
        this.two_obj = obj;
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Stab extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――
    elNo = -1
    x2: number = 0.0;
    z2: number = 0.0;
    index2 = -1;
    name_querschnitt = ''
    nGelenke = 0
    gelenk = Array(6).fill(0)
    sinus = 0.0
    cosinus = 1.0
    alpha = 0.0

    aL = 0.0                             // starres Stabende limks (Stabanfang)
    aR = 0.0                             // starres Stabende rechts
    k_0 = 0.0                            // Bettungsmodul nach Winkler

    elast = [] as TCAD_ElLast[];
    //nStreckenlasten = 0

    constructor(obj: any, x1: number, z1: number, x2: number, z2: number, index1: number, index2: number, qname: string, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

        this.x2 = x2;
        this.z2 = z2;
        this.index2 = index2;
        this.name_querschnitt = qname
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    set_name_querschnitt(name: string) {
        this.name_querschnitt = name
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    get_name_querschnitt() {
        return this.name_querschnitt
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    set_gelenke(gelenk: boolean[]) {

        this.nGelenke = 0
        for (let i = 0; i < 6; i++) {
            if (gelenk[i]) {
                this.gelenk[i] = 1;
                this.nGelenke++;
            }
            else this.gelenk[i] = 0;
        }

    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    get_gelenke() {

        let gelenk: boolean[] = Array(6)

        for (let i = 0; i < 6; i++) {
            if (this.gelenk[i] === 1) gelenk[i] = true;
            else gelenk[i] = false;
        }

        return gelenk;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    set_starrA(wert: number) {
        this.aL = wert;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    get_starrA() {
        return this.aL;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    set_starrE(wert: number) {
        this.aR = wert;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    get_starrE() {
        return this.aR;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    set_bettung(wert: number) {
        this.k_0 = wert;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    get_bettung() {
        return this.k_0;
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    add_streckenlast(lf: number, art: number, pa: number, pe: number): void {
        this.elast.push(new TCAD_Streckenlast(lf, art, pa, pe))
        //this.nStreckenlasten++;
        console.log("add_streckenlast, lf,art= ", lf, art, pa, pe)
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    add_temperaturlast(lf: number, To: number, Tu: number): void {
        this.elast.push(new TCAD_Temperaturlast(lf, To, Tu))
        //this.nStreckenlasten++;
        console.log("add_streckenlast, lf,art= ", lf, To, Tu)
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Lager extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    // L_org = [0, 0, 0]                               // Lagerbedingung  bei Eingabe unverändert
    // kx = 0.0
    // kz = 0.0
    // kphi = 0.0
    nel: number = 0
    node: TNode                          // Anzahl der Elemente, die an dem Knoten hängen

    constructor(obj: any, x1: number, z1: number, index1: number, node: TNode, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

        this.node = node;
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Knotenlast extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    knlast: TLoads;

    constructor(obj: any, x1: number, z1: number, index1: number, knlast: TLoads, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

        this.knlast = knlast
    }
}


//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Knoten extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――


    constructor(obj: any, x1: number, z1: number, index1: number, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);
        this.className = 'TCAD_Knoten'

    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    lastfall = 1
    isActive = true;
    isSelected = false;
    typ = 0               // 0=Streckenlast, 1=Einzelllast, 2=Temperatur

    x: number[] = Array(4)   // Weltkoordinaten der gezeichneten Streckenbelastung
    z: number[] = Array(4)

    constructor(lf: number, typ: number) {
        this.lastfall = lf
        this.typ = typ
    }

    set_drawLast_xz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            this.x[i] = x[i]
            this.z[i] = z[i]
        }
    }

    get_drawLast_xz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            x[i] = this.x[i]
            z[i] = this.z[i]
        }
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Streckenlast extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    art = 0  // 0=senkrecht auf Stab, 1=
    pL = 0.0
    pR = 0.0

    constructor(lf: number, art: number, pa: number, pe: number) {
        super(lf, 0)
        this.art = art
        this.pL = pa
        this.pR = pe
    }

}


//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Temperaturlast extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――


    To = 0.0
    Tu = 0.0

    constructor(lf: number, To: number, Tu: number) {
        super(lf, 2)
        this.To = To
        this.Tu = Tu
    }

}