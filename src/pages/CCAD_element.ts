import { TLoads, TNode } from "./rechnen";

export class TCADElement {
    two_obj: any;
    qname: string = '';
    isActive = true;
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

    getObj() {
        return this.two_obj;
    }

    setObj(obj: any) {
        this.two_obj = obj;
    }
}

export class TCAD_Stab extends TCADElement {
    x2: number = 0.0;
    z2: number = 0.0;
    index2 = -1;

    constructor(obj: any, x1: number, z1: number, x2: number, z2: number, index1: number, index2: number, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

        this.x2 = x2;
        this.z2 = z2;
        this.index2 = index2;
    }

}

export class TCAD_Lager extends TCADElement {

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

export class TCAD_Knotenlast extends TCADElement {

    knlast: TLoads;

    constructor(obj: any, x1: number, z1: number, index1: number, knlast: TLoads, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

        this.knlast = knlast
    }
}


export class TCAD_Knoten extends TCADElement {


    constructor(obj: any, x1: number, z1: number, index1: number, elTyp: number) {
        super(obj, x1, z1, index1, elTyp);

    }
}