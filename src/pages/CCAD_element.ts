import { TLoads, TMass, TNode } from "./rechnen";

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    two_obj: any;
    qname: string = '';
    className = 'TCAD_Element';
    isActive = true;
    isSelected = false;

    elTyp: number = 0; // 0 = 2 Knoten, 1 = Fachwerkstab, 3 = 3 Knoten, 3 = 4 Knoten

    // x1 = 0.0
    // z1 = 0.0;

    index1 = -1;

    constructor(obj: any, index1: number, elTyp: number) {
        this.two_obj = obj;
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
export class TCAD_Knotenmasse extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    masse: TMass;

    constructor(obj: any, index1: number, masse: TMass, elTyp: number) {
        super(obj, index1, elTyp);

        this.masse = masse
        this.className = 'TCAD_Knotenmasse'
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Stab extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――
    elNo = -1
    // x2: number = 0.0;
    // z2: number = 0.0;
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

    constructor(obj: any, index1: number, index2: number, qname: string, elTyp: number) {
        super(obj, index1, elTyp);

        // this.x2 = x2;
        // this.z2 = z2;
        this.index2 = index2;
        this.name_querschnitt = qname
        this.className = 'TCAD_Stab'
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
    add_einzellast(lf: number, x: number, P: number, M: number): void {
        this.elast.push(new TCAD_Einzellast(lf, x, P, M))
        //this.nStreckenlasten++;
        console.log("add_einzellast, lf,art= ", lf, x, P, M)
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    add_temperaturlast(lf: number, To: number, Tu: number): void {
        this.elast.push(new TCAD_Temperaturlast(lf, To, Tu))
        //this.nStreckenlasten++;
        console.log("add_streckenlast, lf,art= ", lf, To, Tu)
    }

    //―――――――――――――――――――――――――――――――――――――――――――――
    add_vorspannung(lf: number, sigmaV: number): void {
        this.elast.push(new TCAD_Vorspannung(lf, sigmaV))
        //this.nStreckenlasten++;
        console.log("add_vorspannung, lf,art= ", lf, sigmaV)
    }
    //―――――――――――――――――――――――――――――――――――――――――――――
    add_spannschloss(lf: number, ds: number): void {
        this.elast.push(new TCAD_Spannschloss(lf, ds))
        //this.nStreckenlasten++;
        console.log("add_spannschloss, lf,art= ", lf, ds)
    }
    //―――――――――――――――――――――――――――――――――――――――――――――
    add_stabvorverformung(lf: number, w0a: number, w0m: number, w0e: number): void {
        this.elast.push(new TCAD_Stabvorverformung(lf, w0a, w0m, w0e))
        //this.nStreckenlasten++;
        console.log("add_stabvorverformung, lf,art= ", lf, w0a, w0m, w0e)
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

    constructor(obj: any, index1: number, node: TNode, elTyp: number) {
        super(obj, index1, elTyp);

        this.node = node;
        this.className = 'TCAD_Lager'
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Knotenlast extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――

    knlast: TLoads;

    xPx: number[] = Array(4)   // Weltkoordinaten der gezeichneten Px Last
    zPx: number[] = Array(4)
    xPz: number[] = Array(4)   // Weltkoordinaten der gezeichneten Pz Last
    zPz: number[] = Array(4)
    xMy: number[] = Array(4)   // Weltkoordinaten des gezeichneten Momentenpfeils
    zMy: number[] = Array(4)

    constructor(obj: any, index1: number, knlast: TLoads, elTyp: number) {
        super(obj, index1, elTyp);

        this.knlast = knlast
        this.className = 'TCAD_Knotenlast'
    }


    set_drawLast_Px(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            this.xPx[i] = x[i]
            this.zPx[i] = z[i]
        }
    }

    get_drawLast_Px(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            x[i] = this.xPx[i]
            z[i] = this.zPx[i]
        }
    }

    set_drawLast_Pz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            this.xPz[i] = x[i]
            this.zPz[i] = z[i]
        }
    }

    get_drawLast_Pz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            x[i] = this.xPz[i]
            z[i] = this.zPz[i]
        }
    }

    set_drawLast_My(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            this.xMy[i] = x[i]
            this.zMy[i] = z[i]
        }
    }

    get_drawLast_My(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            x[i] = this.xMy[i]
            z[i] = this.zMy[i]
        }
    }
}


//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Knoten extends TCAD_Element {
    //―――――――――――――――――――――――――――――――――――――――――


    constructor(obj: any, index1: number, elTyp: number) {
        super(obj, index1, elTyp);
        this.className = 'TCAD_Knoten'
        this.className = 'TCAD_Knoten'
    }
}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    className = 'TCAD_ElLast'
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
        this.className = 'TCAD_Streckenlast'
    }

}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Einzellast extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――


    xe = 0.0
    P = 0.0
    M = 0.0

    xM: number[] = Array(4)   // Weltkoordinaten des gezeichneten Momentenpfeils
    zM: number[] = Array(4)

    constructor(lf: number, x: number, P: number, M: number) {
        super(lf, 1)
        this.xe = x
        this.P = P
        this.M = M
        this.className = 'TCAD_Einzellast'
    }
    set_drawLast_M_xz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            this.xM[i] = x[i]
            this.zM[i] = z[i]
        }
    }

    get_drawLast_M_xz(x: number[], z: number[]) {
        for (let i = 0; i < 4; i++) {
            x[i] = this.xM[i]
            z[i] = this.zM[i]
        }
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
        this.className = 'TCAD_Temperaturlast'
    }

}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Vorspannung extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    sigmaV = 0.0

    constructor(lf: number, sigmaV: number) {
        super(lf, 3)
        this.sigmaV = sigmaV
        this.className = 'TCAD_Vorspannung'
    }

}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Spannschloss extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    ds = 0.0

    constructor(lf: number, ds: number) {
        super(lf, 4)
        this.ds = ds
        this.className = 'TCAD_Spannschloss'
    }

}

//―――――――――――――――――――――――――――――――――――――――――――――
export class TCAD_Stabvorverformung extends TCAD_ElLast {
    //―――――――――――――――――――――――――――――――――――――――――

    w0a = 0.0
    w0m = 0.0
    w0e = 0.0

    constructor(lf: number, w0a: number, w0m: number, w0e: number) {
        super(lf, 5)
        this.w0a = w0a
        this.w0m = w0m
        this.w0e = w0e
        this.className = 'TCAD_Stabvorverformung'
    }

}