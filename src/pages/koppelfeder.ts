import { CElement } from "./element"

import {
    node, element, eload, lagerkraft, neloads, kombiTabelle, THIIO_flag, incr_neq, neq, u_lf, u0_komb, eigenform_container_u,
    ntotalEloads, nlastfaelle, nkombinationen, maxValue_komb, maxValue_lf, nstabvorverfomungen, stabvorverformung,
    stadyn, eigenform_dyn, stabvorverformung_komb, R_internal, matprop_flag
} from "./rechnen"

//import { BubbleSort } from "./lib"

export class CKoppelfeder extends CElement {

    neqe = 6

    neqeG = 6

    ielem = -1
    nknoten = 2
    isActive = true
    kx = 0.0
    kz = 0.0
    kphi = 0.0
    fx = 0.0
    fz = 0.0
    mphi = 0.0
    dkx = 0.0
    dkz = 0.0
    dphi = 0.0
    winkel = 0.0

    delta_x = 0.0
    delta_z = 0.0
    delta_phi = 0.0

    kx_tang = 0.0
    kz_tang = 0.0
    kphi_tang = 0.0

    kx_is_plastic = false
    kz_is_plastic = false
    kphi_is_plastic = false

    emodul = 0.0
    gmodul = 0.0
    querdehnzahl = 0.0
    schubfaktor = 0.0
    wichte = 0.0
    stabgewicht = 0.0   // Area * Wichte
    ks = 0.0
    Iy = 0.0
    area = 0.0
    zso = 0.0
    alphaT = 0.0
    h = 0.0
    psi = 0.0
    eta = 0.0
    nod1 = -1
    nod2 = -1
    nod = [0, 0]
    x1 = 0.0
    x2 = 0.0
    z1 = 0.0
    z2 = 0.0
    sl = 0.0
    dx = 0.0
    dz = 0.0
    normalkraft = 0.0
    lm: number[] = Array(6).fill(-2)
    //gelenk: number[] = [0, 0, 0, 0, 0, 0]
    nGelenke = 0
    cosinus = 0.0
    sinus = 0.0
    alpha = 0.0
    //estiff: number[][] = []
    estiff_sig: number[][] = []
    estiff_sig_global: number[][] = []
    estm: number[][] = []
    estmL2: number[][] = []       // lokale Elementsteifigkeitsmatrix incl. TH.II.O., für Lastvektor von Knotenverformungen
    ksig: number[][] = []
    //trans: number[][] = []
    emass: number[][] = []
    mue = 0.0                     // Dichte * Area für Dynamik Massenmatrix
    mass_gesamt = 0.0             // Gesamtmasse des Elementes

    transU: number[][] = []       // Transformation von global nach lokal
    //transF: number[][] = []       // Transformation von lokal nach global = transU ^T
    TfG2L: number[][] = []        // Transformation der Kraefte von global nach lokal

    estiffG: number[][] = []      // globale Elementsteigkeitsmatrix mit Berücksichtigung der Gelenke
    emassG: number[][] = []      // globale Elementmassenmatrix mit Berücksichtigung der Gelenke


    u: number[] = Array(6)        // Verformungen global
    edispL: number[] = Array(6)    // Verformungen lokal
    edisp0: number[] = Array(6).fill(0.0)   // Vorverformungen
    F: number[] = Array(6)        // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = Array(6)        // Stabendgrößen nach KGV im lokalen Koordinatensystem
    Fe: number[] = Array(6).fill(0.0)       // Vorverformungen aus Schiefstellung 1. Eigenform
    FeVor: number[] = Array(6).fill(0.0)    // Vorverformungen aus Stabschiefstellung

    N_ = [] as number[][]          // Schnittgrößen entlang Stab, lokal
    V_ = [] as number[][]
    M_ = [] as number[][]
    u_ = [] as number[][]          // Verformungen entlang Stab, lokale Richtung
    w_ = [] as number[][]
    phi_ = [] as number[][]

    N_komb = [] as number[][]         // Schnittgrößen entlang Stab, lokal, aus Kombinationen
    V_komb = [] as number[][]
    M_komb = [] as number[][]
    u_komb = [] as number[][]         // Verformungen entlang Stab, lokale Richtung
    uG_komb = [] as number[][]         // Verformungen entlang Stab, lokale Richtung
    w_komb = [] as number[][]
    wG_komb = [] as number[][]
    phi_komb = [] as number[][]

    NL: number = 0.0
    VL: number = 0.0
    ML: number = 0.0
    uL: number = 0.0
    wL: number = 0.0
    phiL: number = 0.0
    NR = 0.0

    nTeilungen = 1;
    x_: number[] = []

    //---------------------------------------------------------------------------------------------
    constructor(prop: number[]) {

        super()
        this.kx = this.kx_tang = prop[0]
        this.fx = prop[1]
        this.kz = this.kz_tang = prop[2]
        this.fz = prop[3]
        this.kphi = this.kphi_tang = prop[4]
        this.mphi = prop[5]
        console.log("CONSTRUCTOR KOPPELFEDER", this.kx, this.kz, this.kphi)

        if (this.kx !== 0.0) this.dkx = Math.abs(this.fx / this.kx)
        if (this.kz !== 0.0) this.dkz = Math.abs(this.dkz = this.fz / this.kz)
        if (this.kphi !== 0.0) this.dphi = Math.abs(this.mphi / this.kphi)

    }

    //---------------------------------------------------------------------------------------------
    ich_bin(ielem: number) {
        console.log("Ich bin ein Koppelfeder Element , No ", ielem)
    }


    // //---------------------------------------------------------------------------------------------
    // setQuerschnittsdaten(emodul: number, Iy: number, area: number, wichte: number, ks: number, querdehnzahl: number, schubfaktor: number,
    //     height: number, zso: number, alphaT: number) {

    //     this.emodul = emodul
    //     this.Iy = Iy
    //     this.area = area
    //     this.wichte = wichte
    //     this.ks = ks
    //     this.querdehnzahl = querdehnzahl
    //     this.schubfaktor = schubfaktor
    //     this.h = height
    //     this.zso = zso
    //     this.alphaT = alphaT
    // }

    //---------------------------------------------------------------------------------------------
    initialisiereElementdaten(ielem: number) {

        let x1, x2, z1, z2

        let n: number

        this.ielem = ielem

        if (THIIO_flag === 0) n = nlastfaelle;
        else n = nkombinationen;

        this.isActive = element[ielem].isActive
        if (!this.isActive) return;

        this.nod1 = element[ielem].nod[0];
        this.nod2 = element[ielem].nod[1];
        this.nod[0] = this.nod1
        this.nod[1] = this.nod2

        this.x1 = x1 = node[this.nod1].x;
        this.x2 = x2 = node[this.nod2].x;
        this.z1 = z1 = node[this.nod1].z;
        this.z2 = z2 = node[this.nod2].z;


        this.dx = x2 - x1;
        this.dz = z2 - z1;
        this.sl = Math.sqrt(this.dx * this.dx + this.dz * this.dz);      // elastische Stablänge

        // if (this.sl < 1e-12) {
        //     alert("Länge von Element " + String(ielem + 1) + " ist null")
        //     return;
        // }


        this.cosinus = 1.0  //this.dx / this.sl
        this.sinus = 0.0  //this.dz / this.sl

        this.alpha = Math.atan2(this.dz, this.dx) // *180.0/Math.PI
        console.log("sl = ", ielem, this.sl, this.alpha)

        this.normalkraft = 0.0

        this.lm[0] = node[this.nod1].L[0];
        this.lm[1] = node[this.nod1].L[1];
        this.lm[2] = node[this.nod1].L[2];
        this.lm[3] = node[this.nod2].L[0];
        this.lm[4] = node[this.nod2].L[1];
        this.lm[5] = node[this.nod2].L[2];

        this.nGelenke = 0


        console.log("neqeG ", this.neqeG)
        console.log("lm() von Element ", ielem, this.lm)

        this.estm = Array.from(Array(6), () => new Array(6).fill(0.0));
        this.estmL2 = Array.from(Array(6), () => new Array(6));
        this.ksig = Array.from(Array(6), () => new Array(6).fill(0.0));
        //this.trans = Array.from(Array(6), () => new Array(6).fill(0.0));
        //this.estiff = Array.from(Array(6), () => new Array(6));
        this.estiff_sig = Array.from(Array(6), () => new Array(6));

        this.transU = Array.from(Array(6), () => new Array(6).fill(0.0));
        //this.transF = Array.from(Array(6), () => new Array(6).fill(0.0));
        this.TfG2L = Array.from(Array(6), () => new Array(6).fill(0.0));

        this.estiffG = Array.from(Array(6), () => new Array(6));

        if (stadyn > 0) {
            // this.emass = Array.from(Array(6), () => new Array(6));
            // this.emassG = Array.from(Array(6), () => new Array(6));
            // this.mue = this.wichte * this.area / 10   // in Tonnen/m
            // //console.log("wichte", this.wichte)
            // this.mass_gesamt = this.mue * this.sl
        }

        let cophi = node[this.nod1].co
        let siphi = node[this.nod1].si

        let t00 = this.cosinus * cophi - this.sinus * siphi    //this.cosinus
        let t01 = this.sinus * cophi + this.cosinus * siphi    //this.sinus
        let t10 = -t01
        let t11 = t00

        this.transU[0][0] = t00
        this.transU[0][1] = t01
        this.transU[1][0] = t10
        this.transU[1][1] = t11

        this.transU[2][2] = 1.0

        cophi = node[this.nod2].co
        siphi = node[this.nod2].si

        let t22 = this.cosinus * cophi - this.sinus * siphi    //this.cosinus
        let t23 = this.sinus * cophi + this.cosinus * siphi    //this.sinus
        let t32 = -t23
        let t33 = t22

        this.transU[3][3] = t22
        this.transU[3][4] = t23
        this.transU[4][3] = t32
        this.transU[4][4] = t33

        this.transU[5][5] = 1.0



        // this.nTeilungen
        // übernahme der Voreinstellung

        this.x_ = Array(this.nTeilungen + 1)

        const delta_x = this.sl / this.nTeilungen                    //erstmal normal mit nTeilungen Stab teilen
        let xx = 0.0
        let j = 1
        for (let i = 0; i <= this.nTeilungen; i++) {
            this.x_[i] = xx
            xx = xx + delta_x
        }

        // let sort = 0
        let nelTeilungenNeu = this.nTeilungen + 1


        this.nTeilungen = nelTeilungenNeu
        //console.log ("NTEILUNGEN",this.nTeilungen,nelTeilungenNeu,nelTeilungen)

        if (THIIO_flag === 0) {
            this.N_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.V_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.M_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.u_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.w_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
            this.phi_ = Array.from(Array(n), () => new Array(this.nTeilungen).fill(0.0));
        }

        if (nkombinationen > 0) {
            this.N_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.V_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.M_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.u_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.uG_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.w_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.wG_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
            this.phi_komb = Array.from(Array(nkombinationen), () => new Array(this.nTeilungen).fill(0.0));
        }

        this.berechneLokaleElementsteifigkeitmatrix()

        // // Eigengewicht
        // this.stabgewicht = this.area * this.wichte
        // eload[ielem].pL = this.stabgewicht
        // eload[ielem].pR = this.stabgewicht

        // if (stadyn > 0) this.berechneLokaleElementmassenmatrix();
    }



    //---------------------------------------------------------------------------------------------
    berechneLokaleElementsteifigkeitmatrix() {

        const sl = this.sl

        //  let EAL = this.emodul * this.area / sl

        this.estm[0][0] = this.kx_tang
        this.estm[3][3] = this.kx_tang
        this.estm[0][3] = -this.kx_tang
        this.estm[3][0] = -this.kx_tang

        this.estm[1][1] = this.kz_tang
        this.estm[4][4] = this.kz_tang
        this.estm[1][4] = -this.kz_tang
        this.estm[4][1] = -this.kz_tang

        this.estm[2][2] = this.kphi_tang
        this.estm[5][5] = this.kphi_tang
        this.estm[2][5] = -this.kphi_tang
        this.estm[5][2] = -this.kphi_tang

        for (let j = 0; j < 6; j++) {
            console.log('kopfed estm[]', this.estm[j])
        }
        // EAL = 1.0 / sl

        // this.ksig[0][0] = 0.0
        // this.ksig[0][1] = 0.0
        // this.ksig[0][2] = 0.0
        // this.ksig[0][3] = 0.0

        // this.ksig[1][0] = 0.0
        // this.ksig[1][1] = EAL
        // this.ksig[1][2] = 0.0
        // this.ksig[1][3] = -EAL

        // this.ksig[2][0] = 0.0
        // this.ksig[2][1] = 0.0
        // this.ksig[2][2] = 0.0
        // this.ksig[2][3] = 0.0

        // this.ksig[3][0] = 0.0
        // this.ksig[3][1] = -EAL
        // this.ksig[3][2] = 0.0
        // this.ksig[3][3] = EAL

    }


    //---------------------------------------------------------------------------------------------
    berechneLokaleElementmassenmatrix() {

        // let EAL = this.mue * this.sl / 6
        // //console.log("EAL", EAL, this.mue)

        // this.emass[0][0] = 2 * EAL
        // this.emass[0][1] = 0.0
        // this.emass[0][2] = EAL
        // this.emass[0][3] = 0.0

        // this.emass[1][0] = 0.0
        // this.emass[1][1] = 2 * EAL
        // this.emass[1][2] = 0.0
        // this.emass[1][3] = EAL

        // this.emass[2][0] = EAL
        // this.emass[2][1] = 0.0
        // this.emass[2][2] = 2 * EAL
        // this.emass[2][3] = 0.0

        // this.emass[3][0] = 0.0
        // this.emass[3][1] = EAL
        // this.emass[3][2] = 0.0
        // this.emass[3][3] = 2 * EAL


        // for (let j = 0; j < 4; j++) {
        //     console.log("this.emass", this.emass[j])
        // }
    }

    //---------------------------------------------------------------------------------------------
    berechneElementsteifigkeitsmatrix(_theorie: number) {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(this.neqeG));

        //console.log("berechneElementsteifigkeitsmatrix", theorie, this.normalkraft)

        this.berechneLokaleElementsteifigkeitmatrix()

        for (j = 0; j < 6; j++) {
            for (k = 0; k < this.neqeG; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.estm[j][l] * this.transU[l][k]

                }
                help[j][k] = sum
            }
        }



        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                this.estmL2[j][k] = this.estm[j][k]
            }
        }



        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.transU[l][j] * help[l][k]
                }
                this.estiffG[j][k] = sum
            }
        }

        for (j = 0; j < 6; j++) {
            console.log("Koppelfeder this.estiffG", this.estiffG[j])
        }
    }

    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < 6; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < 6; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        // stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff[i][j];
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiffG[i][j];
                    }
                }
            }
        }

    }


    //---------------------------------------------------------------------------------------------
    berechneElementmassenmatrix() {

        // let sum: number
        // let j: number, k: number
        // const help = Array.from(Array(6), () => new Array(6));

        // //console.log("berechneElementmassenmatrix")


        // for (j = 0; j < 6; j++) {
        //     for (k = 0; k < 4; k++) {
        //         sum = 0.0
        //         for (let l = 0; l < 4; l++) {
        //             sum = sum + this.emass[j][l] * this.transU[l][k]

        //         }
        //         help[j][k] = sum
        //     }
        // }


        // for (j = 0; j < 4; j++) {
        //     for (k = 0; k < 4; k++) {
        //         sum = 0.0
        //         for (let l = 0; l < 4; l++) {
        //             sum = sum + this.transU[l][j] * help[l][k]
        //         }
        //         this.emassG[j][k] = sum
        //     }
        // }

        // for (j = 0; j < 4; j++) {
        //     console.log("this.emassG", this.emassG[j])
        // }
    }


    //---------------------------------------------------------------------------------------------
    addiereElementmassmatrix(mass: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < 6; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < 6; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        mass[lmi][lmj] = mass[lmi][lmj] + this.emassG[i][j];
                    }
                }
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneElementsteifigkeitsmatrix_Ksig() {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(6));

        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.ksig[j][l] * this.transU[l][k]
                }
                help[j][k] = sum
            }
        }


        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.transU[l][j] * help[l][k]
                    // sum = sum + this.transF[j][l] * help[l][k]
                }
                this.estiff_sig[j][k] = -sum * this.normalkraft
            }
        }
        //console.log("NORMALKRAFT", this.normalkraft)
    }

    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix_ksig(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < this.neqeG; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < this.neqeG; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff_sig[i][j];
                    }
                }
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneInterneKraefte(ielem: number, iLastf: number, iter: number, u: number[]) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        for (j = 0; j < this.neqeG; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                this.u[j] = 0
            } else {
                this.u[j] = u[ieq]
            }
        }

        for (i = 0; i < 6; i++) { // Verformungen lokal
            sum = 0.0
            for (j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * this.u[j]
            }
            this.edispL[i] = sum
        }

        //console.log("this.u[]", this.neqeG, this.u)

        for (j = 0; j < this.neqeG; j++) {
            sum = 0.0
            for (k = 0; k < this.neqeG; k++) {
                sum += this.estiffG[j][k] * this.u[k]
            }
            this.F[j] = sum
        }


        if (matprop_flag > 0) {    // nichtlineare Feder

            if (this.fx > 0.0) {
                let dx = this.edispL[3] - this.edispL[0]
                if (this.kx !== 0.0 && Math.abs(dx) > this.dkx) {
                    this.F[0] = -this.fx * Math.sign(dx)
                    this.F[3] = this.fx * Math.sign(dx)
                    //console.log("this.F[0]", this.F[0], this.fx, Math.sign(dx))
                    this.kx_tang = 0.0
                    this.kx_is_plastic = true
                } else {
                    this.kx_tang = this.kx
                    this.kx_is_plastic = false
                }
            }
            if (this.fz > 0.0) {
                let dz = this.edispL[4] - this.edispL[1]
                if (this.kz !== 0.0 && Math.abs(dz) > this.dkz) {
                    this.F[1] = -this.fz * Math.sign(dz)
                    this.F[4] = this.fz * Math.sign(dz)
                    //console.log("this.F[1]", this.F[1], this.fz, Math.sign(dz))
                    this.kz_tang = 0.0
                    this.kz_is_plastic = true
                } else {
                    this.kz_tang = this.kz
                    this.kz_is_plastic = true
                }
            }
            if (this.mphi > 0.0) {
                let dphi = this.edispL[5] - this.edispL[2]
                if (this.kphi !== 0.0 && Math.abs(dphi) > this.dphi) {
                    this.F[2] = -this.mphi * Math.sign(dphi)
                    this.F[5] = this.mphi * Math.sign(dphi)
                    //console.log("this.F[2]", this.F[2], this.mphi, dphi)
                    this.kphi_tang = 0.0
                    this.kphi_is_plastic = true
                } else {
                    this.kphi_tang = this.kphi
                    this.kphi_is_plastic = false
                }
            }

        }
        console.log("this.F[]", this.F)


        // internen Kraftvektor berechnen für Iterationen

        for (j = 0; j < this.neqeG; j++) {
            ieq = this.lm[j]
            if (ieq >= 0) {
                R_internal[ieq] += this.F[j]
            }
        }

        // normale Elementlasten hinzufügen

        if (THIIO_flag === 0) {

            for (let ieload = 0; ieload < neloads; ieload++) {
                if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastf)) {
                    //if (eload[ieload].art !== 8) {
                    for (i = 0; i < this.neqeG; i++) {
                        this.F[i] = this.F[i] + eload[ieload].el_r[i]
                    }
                    //}
                }
            }
        }
        else if (THIIO_flag === 1) { // ikomb=iLastf

            for (let ieload = 0; ieload < neloads; ieload++) {
                if (eload[ieload].element === ielem) {
                    const index = eload[ieload].lf - 1
                    //console.log("elem kombi index", index, kombiTabelle[iLastf - 1][index])
                    if (kombiTabelle[iLastf - 1][index] !== 0.0) {

                        for (i = 0; i < this.neqeG; i++) {
                            this.F[i] = this.F[i] + eload[ieload].el_r[i] * kombiTabelle[iLastf - 1][index]
                        }
                    }
                }
            }

            if (iter > 0) {
                //console.log("FE[]", this.Fe)
                for (i = 0; i < this.neqeG; i++) {                            // Schiefstellung
                    this.F[i] = this.F[i] + this.Fe[i]
                }
            }

        }

        //console.log("element F global ", this.F)

        // TODO ?? Bei gedrehten Lagern erst ins x,z Koordinatensystem zurückdrehen, siehe Excel ab Zeile 434

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < this.neqe; j++) {
                sum += this.transU[i][j] * this.F[j]
                //sum += this.TfG2L[i][j] * this.F[j]
            }
            this.FL[i] = sum
        }


        for (i = 0; i < 3; i++) this.FL[i] = -this.FL[i];  // Linke Seite Vorzeichen nach KGV

        console.log('lokale Schnittgrößen, Element', (ielem + 1), this.FL)

        this.normalkraft = this.FL[0]
        if (this.normalkraft > 0.0) this.normalkraft = 0.0           // keine Zugversteifung

        //console.log("N O R M A L K R A F T von Element ", ielem, " = ", this.normalkraft)


        this.NL = this.FL[0]                               // Verformungen, Schnittgrößen am Stabanfang für Zustandslinien
        this.VL = this.FL[1]
        this.ML = this.FL[2]
        this.uL = this.edispL[0]
        this.wL = this.edispL[1]
        this.phiL = this.edispL[2]
        this.NR = this.FL[3]

        //this.FL[1] = this.FL[1] - this.normalkraft * this.phiL

        // console.log("--- Bemessungsquerkraft",(ielem+1),this.VL,this.FL[0] * this.phiL, this.phiL)
        return this.FL;
    }

    //---------------------------------------------------------------------------------------------
    berechneLagerkraefte() {

        let nodi: number

        //console.log("Lagerkräfte d2beam",this.F)

        for (let i = 0; i < 2; i++) {
            nodi = this.nod[i]
            //console.log("nodi", i, nodi)
            lagerkraft[nodi][0] = lagerkraft[nodi][0] - this.F[3 * i]
            lagerkraft[nodi][1] = lagerkraft[nodi][1] - this.F[3 * i + 1]
            lagerkraft[nodi][2] = lagerkraft[nodi][2] - this.F[3 * i + 2]
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten(ieload: number) {

        // const sl = this.sl


        // if (eload[ieload].art === 0) {                          // Trapezstreckenlast senkrecht auf Stab

        //     console.log("STRECKENLAST SENKRECHT")
        //     const p1 = -sl * (2.0 * eload[ieload].pL + eload[ieload].pR) / 6.0
        //     const p2 = -sl * (eload[ieload].pL + 2.0 * eload[ieload].pR) / 6.0

        //     eload[ieload].re[0] = 0
        //     eload[ieload].re[2] = 0

        //     eload[ieload].re[1] = p1 // VL
        //     eload[ieload].re[3] = p2 // VR

        //     eload[ieload].re[2] = 0.0
        //     eload[ieload].re[5] = 0.0

        //     eload[ieload].C1 = 0.0
        //     eload[ieload].C2 = 0.0

        // }
        // else if (eload[ieload].art === 1) {                     // Trapezstreckenlast z-Richtung

        //     let pL = eload[ieload].pL
        //     let pR = eload[ieload].pR

        //     let pzL = this.cosinus * pL                         // Lastanteil senkrecht auf Stab
        //     let pzR = this.cosinus * pR
        //     let pxL = this.sinus * pL                           // Lastanteil parallel zum Stab
        //     let pxR = this.sinus * pR

        //     eload[ieload].re[0] = -sl * (2.0 * pxL + pxR) / 6
        //     eload[ieload].re[2] = -sl * (pxL + 2.0 * pxR) / 6

        //     eload[ieload].re[1] = -sl * (2.0 * pzL + pzR) / 6
        //     eload[ieload].re[3] = -sl * (pzL + 2.0 * pzR) / 6

        //     eload[ieload].re[4] = 0.0
        //     eload[ieload].re[5] = 0.0

        //     eload[ieload].C1 = 0.0
        //     eload[ieload].C2 = 0.0

        // }
        // else if (eload[ieload].art === 2) {                     // Trapezstreckenlast z-Richtung, Projektion

        //     let pL = eload[ieload].pL * this.dx / this.sl
        //     let pR = eload[ieload].pR * this.dx / this.sl

        //     let pzL = this.cosinus * pL                         // Lastanteil senkrecht auf Stab
        //     let pzR = this.cosinus * pR
        //     let pxL = this.sinus * pL                           // Lastanteil parallel zum Stab
        //     let pxR = this.sinus * pR

        //     eload[ieload].re[0] = -sl * (2.0 * pxL + pxR) / 6
        //     eload[ieload].re[2] = -sl * (pxL + 2.0 * pxR) / 6

        //     eload[ieload].re[1] = -sl * (2.0 * pzL + pzR) / 6
        //     eload[ieload].re[3] = -sl * (pzL + 2.0 * pzR) / 6

        //     eload[ieload].re[4] = 0.0
        //     eload[ieload].re[5] = 0.0

        //     eload[ieload].C1 = 0.0
        //     eload[ieload].C2 = 0.0

        // }
        // else if (eload[ieload].art === 3) {                     // Trapezstreckenlast x-Richtung

        //     let pL = eload[ieload].pL
        //     let pR = eload[ieload].pR

        //     let pzL = -this.sinus * pL                          // Lastanteil senkrecht auf Stab
        //     let pzR = -this.sinus * pR
        //     let pxL = this.cosinus * pL                         // Lastanteil parallel zum Stab
        //     let pxR = this.cosinus * pR

        //     eload[ieload].re[0] = -sl * (2.0 * pxL + pxR) / 6
        //     eload[ieload].re[2] = -sl * (pxL + 2.0 * pxR) / 6

        //     eload[ieload].re[1] = -sl * (2.0 * pzL + pzR) / 6
        //     eload[ieload].re[3] = -sl * (pzL + 2.0 * pzR) / 6

        //     eload[ieload].re[4] = 0.0
        //     eload[ieload].re[5] = 0.0

        //     eload[ieload].C1 = 0.0
        //     eload[ieload].C2 = 0.0

        // }
        // else if (eload[ieload].art === 4) {                     // Trapezstreckenlast x-Richtung, Projektion

        //     let pL = eload[ieload].pL * this.dz / sl
        //     let pR = eload[ieload].pR * this.dz / sl

        //     let pzL = -this.sinus * pL                          // Lastanteil senkrecht auf Stab
        //     let pzR = -this.sinus * pR
        //     let pxL = this.cosinus * pL                         // Lastanteil parallel zum Stab
        //     let pxR = this.cosinus * pR

        //     eload[ieload].re[0] = -sl * (2.0 * pxL + pxR) / 6
        //     eload[ieload].re[2] = -sl * (pxL + 2.0 * pxR) / 6

        //     eload[ieload].re[1] = -sl * (2.0 * pzL + pzR) / 6
        //     eload[ieload].re[3] = -sl * (pzL + 2.0 * pzR) / 6

        //     eload[ieload].re[4] = 0.0
        //     eload[ieload].re[5] = 0.0

        //     eload[ieload].C1 = 0.0
        //     eload[ieload].C2 = 0.0

        // }
        // else if (eload[ieload].art === 5) {              // Temperatur

        //     eload[ieload].kappa_dT = this.alphaT * (eload[ieload].Tu - eload[ieload].To) / this.h
        //     eload[ieload].eps_Ts = this.alphaT * ((eload[ieload].Tu - eload[ieload].To) * this.zso / this.h + eload[ieload].To)
        //     console.log("Temperatur", this.alphaT, eload[ieload].Tu, eload[ieload].To, this.h, this.emodul * this.area)

        //     eload[ieload].re[0] = this.emodul * this.area * eload[ieload].eps_Ts
        //     eload[ieload].re[2] = -this.emodul * this.area * eload[ieload].eps_Ts

        //     eload[ieload].re[1] = 0.0
        //     eload[ieload].re[3] = 0.0

        // }


        if (eload[ieload].art === 8) {              // Knotenverformungen

            if (eload[ieload].node0 === this.nod1) {
                eload[ieload].dispL0[0] = this.transU[0][0] * eload[ieload].dispx0 + this.transU[0][1] * eload[ieload].dispz0
                eload[ieload].dispL0[1] = this.transU[1][0] * eload[ieload].dispx0 + this.transU[1][1] * eload[ieload].dispz0
                eload[ieload].dispL0[2] = eload[ieload].phi0
                eload[ieload].dispL0[3] = 0.0
                eload[ieload].dispL0[4] = 0.0
                eload[ieload].dispL0[5] = 0.0
            } else {
                eload[ieload].dispL0[0] = 0.0
                eload[ieload].dispL0[1] = 0.0
                eload[ieload].dispL0[2] = 0.0
                eload[ieload].dispL0[3] = this.transU[3][3] * eload[ieload].dispx0 + this.transU[3][4] * eload[ieload].dispz0
                eload[ieload].dispL0[4] = this.transU[4][3] * eload[ieload].dispx0 + this.transU[4][4] * eload[ieload].dispz0
                eload[ieload].dispL0[5] = eload[ieload].phi0

            }
            for (let j = 0; j < 6; j++) {
                let sum = 0.0
                for (let k = 0; k < 6; k++) {
                    sum += this.estmL2[j][k] * eload[ieload].dispL0[k]
                }
                eload[ieload].re[j] = sum
            }
            console.log("Koppelfeder LASTVEKTOR 8 ", eload[ieload].re)
            console.log("dispL0", eload[ieload].dispL0)
        }

        // else if (eload[ieload].art === 9) {              // zentrische Vorspannung

        //     eload[ieload].re[0] = -this.area * eload[ieload].sigmaV
        //     eload[ieload].re[2] = this.area * eload[ieload].sigmaV

        //     eload[ieload].re[1] = 0.0
        //     eload[ieload].re[3] = 0.0
        // }
        // else if (eload[ieload].art === 10) {              // Spannschloss

        //     eload[ieload].re[0] = -this.emodul * this.area * eload[ieload].delta_s / sl
        //     eload[ieload].re[2] = this.emodul * this.area * eload[ieload].delta_s / sl

        //     eload[ieload].re[1] = 0.0
        //     eload[ieload].re[3] = 0.0
        // }


        for (let j = 0; j < this.neqeG; j++) {
            let sum = 0.0
            for (let k = 0; k < 6; k++) {
                // sum += this.transF[j][k] * eload[ieload].re[k]
                sum += this.transU[k][j] * eload[ieload].re[k]
            }
            eload[ieload].el_r[j] = sum
        }

        console.log("Koppelfeder elementload global ", eload[ieload].el_r)

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten_Vorverformung(Fe: number[], u: number[], ikomb: number) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        let dispG = Array(6), FeL = Array(6)
        let v0 = Array(6).fill(0.0)

        for (j = 0; j < this.neqeG; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                dispG[j] = 0
            } else {
                dispG[j] = u[ieq]
            }
        }

        console.log("dispG", dispG)

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * dispG[j]
            }
            this.edisp0[i] = sum
        }

        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * this.edisp0[k]    // this.normalkraft *
            }
            FeL[j] = sum     // lokal
        }



        v0[1] = stabvorverformung_komb[this.ielem][ikomb].w0a
        v0[3] = stabvorverformung_komb[this.ielem][ikomb].w0e


        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * v0[k]
            }
            FeL[j] += sum     // lokal
        }



        for (i = 0; i < this.neqeG; i++) {
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.transU[j][i] * FeL[j]
                //sum += this.transF[i][j] * FeL[j]
            }
            this.Fe[i] = Fe[i] = sum          // global
        }

    }



    //---------------------------------------------------------------------------------------------
    get_edispL(edispL: number[], iLastfall: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = u_lf[ieq][iLastfall]              // in m, rad
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        //console.log("dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------
    get_edispL_schiefstellung(edispL: number[], iKomb: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = u0_komb[ieq][iKomb]
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        //console.log("dispL", edispL)
    }

    //---------------------------------------------------------------------------------------------
    get_edispL_eigenform(edispL: number[], iKomb: number, ieigv: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < this.neqeG; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = eigenform_container_u[iKomb - 1]._(ieq, ieigv)
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("eigen, disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < this.neqeG; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        //console.log("eigen, dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------
    get_edispL_dyn_eigenform(edispL: number[], ieigv: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < 6; j++) {
            let ieq = this.lm[j]
            if (ieq >= 0) {
                edisp[j] = eigenform_dyn[ieigv][ieq]
            } else {
                edisp[j] = 0.0
            }
        }
        //console.log("eigen, disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < 6; j++) {
                sum += this.transU[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        // console.log("eigen, dispL", edispL)
    }

    //---------------------------------------------------------------------------------------------

    berechneElementSchnittgroessen(ielem: number, iLastf: number) {
        //-----------------------------------------------------------------------------------------

        let Mx: number, Vx: number, Nx: number, ux: number, wx: number, phix: number, phixG: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(6), Nphi: number[] = new Array(6)
        let u: number, wL: number = 0.0, wLG = 0.0, disp = 0.0, dwx = 0.0, wxG = 0.0, uxG = 0.0, dwxG = 0.0
        let Nm = 0.0
        let edisp: number[] = Array(6)
        let edispG: number[] = Array(6).fill(0.0)

        let EI = this.emodul * this.Iy
        let EA = this.emodul * this.area

        //console.log("________________________________________________________________")
        //console.log("class element: berechneElementSchnittgroessen von ", ielem, iLastf)

        const eta = this.eta
        const sl = this.sl
        const sl2 = sl * sl
        const sl3 = sl2 * sl
        const nenner = sl3 + 12. * eta * sl

        //console.log("ETA", eta)

        if (THIIO_flag === 0) {      // Theorie I. Ordnung
            for (let i = 0; i < 6; i++) edisp[i] = this.edispL[i]
        }
        else {      // Theorie II. Ordnung

            for (let i = 0; i < 6; i++) edisp[i] = this.edispL[i] // Verformung
            for (let i = 0; i < 6; i++) edispG[i] = this.edispL[i] + this.edisp0[i]  // Verformung + Schiefstellung
            //console.log(" 1 edisp", edisp)

            wL = this.wL
            wLG = this.wL + this.edisp0[1]
            Nm = (this.NL + this.NR) / 2

            for (let ieload = 0; ieload < neloads; ieload++) {

                if (eload[ieload].element === ielem) {
                    const index = eload[ieload].lf - 1
                    if (kombiTabelle[iLastf][index] !== 0.0) {

                        if (eload[ieload].art === 8) {         // Knotenverformung
                            wL += eload[ieload].dispL0[1] * kombiTabelle[iLastf][index];
                            for (let i = 0; i < 6; i++)  edisp[i] += eload[ieload].dispL0[i] * kombiTabelle[iLastf][index];
                            wLG += eload[ieload].dispL0[1] * kombiTabelle[iLastf][index];
                            for (let i = 0; i < 6; i++)  edispG[i] += eload[ieload].dispL0[i] * kombiTabelle[iLastf][index];
                        }
                    }
                }
            }

            // console.log("wL = ", wL)
            // console.log("edisp", edisp)
            // console.log("edispL", this.edispL)
            // console.log("edisp0", this.edisp0)
        }

        //let d_x = this.sl / (nelTeilungen)
        let x = 0.0

        for (let iteil = 0; iteil < this.nTeilungen; iteil++) {
            x = this.x_[iteil]
            const x2 = x * x
            const x3 = x2 * x
            Vx = this.VL
            Mx = this.ML + Vx * x
            Nx = this.NL
            //ux = 0.0
            //wx = 0.0

            Nu[0] = (1.0 - x / sl);
            Nu[1] = x / sl
            Nw[0] = (2. * x3 - 3. * sl * x2 - 12. * eta * x + sl3 + 12. * eta * sl) / nenner;
            Nw[1] = -((sl * x3 + (-2. * sl2 - 6. * eta) * x2 + (sl3 + 6. * eta * sl) * x) / nenner);
            Nw[2] = -((2. * x3 - 3. * sl * x2 - 12. * eta * x) / nenner);
            Nw[3] = -((sl * x3 + (6. * eta - sl2) * x2 - 6. * eta * sl * x) / nenner);
            Nphi[0] = 6.0 * (sl * x - x2) / nenner
            Nphi[1] = (3 * sl * x2 + (-12 * eta - 4 * sl2) * x + 12 * sl * eta + sl3) / nenner
            Nphi[2] = -6.0 * (sl * x - x2) / nenner
            Nphi[3] = (3 * sl * x2 + (12 * eta - 2 * sl2) * x) / nenner
            ux = Nu[0] * edisp[0] + Nu[1] * edisp[2]
            wx = Nu[0] * edisp[1] + Nu[1] * edisp[3];
            uxG = Nu[0] * edispG[0] + Nu[1] * edispG[2]
            wxG = Nu[0] * edispG[1] + Nu[1] * edispG[3];
            phix = 0.0
            //phixG = -(Nphi[0] * edispG[1] + Nphi[1] * edispG[2] + Nphi[2] * edispG[4] + Nphi[3] * edispG[5]);  // im Uhrzeigersinn
            //console.log("phix", x, phix)

            if (THIIO_flag === 1) {

                dwx = wxG - wLG
                dwxG = wxG - wLG
                //if (this.NL < 0.0) Mx = Mx - this.NL * (wxG - wLG)  //?

                for (let i = 0; i < nstabvorverfomungen; i++) {
                    if (stabvorverformung[i].element === this.ielem) {
                        //console.log("Element ", +i + 1, ' hat Stabvorverformungen')
                        let w0a = stabvorverformung[i].p[0]
                        let w0e = stabvorverformung[i].p[1]
                        //let v0m = stabvorverformung[i].p[2]
                        let w0x = (w0e - w0a) * x / sl // + 4.0 * v0m * x / sl * (1.0 - x / sl)
                        // if (this.NL < 0.0) Mx = Mx - this.NL * w0x
                        wxG += w0x + w0a;
                    }

                }

            }

            if (THIIO_flag === 0) {

                Nx = this.FL[3 * iteil]
                Vx = this.FL[3 * iteil + 1]
                Mx = this.FL[3 * iteil + 2]
                ux = this.edispL[3 * iteil]
                wx = this.edispL[3 * iteil + 1]
                phix = this.edispL[3 * iteil + 2]

                disp = Math.sqrt(ux * ux + wx * wx) * 1000.0      // in mm

                if (Math.abs(Nx) > maxValue_lf[iLastf].N) maxValue_lf[iLastf].N = Math.abs(Nx)
                if (Math.abs(Vx) > maxValue_lf[iLastf].Vz) maxValue_lf[iLastf].Vz = Math.abs(Vx)
                if (Math.abs(Mx) > maxValue_lf[iLastf].My) maxValue_lf[iLastf].My = Math.abs(Mx)
                if (disp > maxValue_lf[iLastf].disp) maxValue_lf[iLastf].disp = disp

                console.log("°°° Mx", Mx, Vx, Nx)
                this.M_[iLastf][iteil] = Mx
                this.V_[iLastf][iteil] = Vx
                this.N_[iLastf][iteil] = Nx
                this.u_[iLastf][iteil] = ux
                this.w_[iLastf][iteil] = wx
                this.phi_[iLastf][iteil] = phix

            }
            else if (THIIO_flag === 1) { // ikomb=iLastf


                Nx = this.FL[3 * iteil]
                Vx = this.FL[3 * iteil + 1]
                Mx = this.FL[3 * iteil + 2]
                ux = this.edispL[3 * iteil]
                wx = this.edispL[3 * iteil + 1]
                phix = this.edispL[3 * iteil + 2]

                disp = Math.sqrt(ux * ux + wx * wx) * 1000.0

                if (Math.abs(Nx) > maxValue_komb[iLastf].N) maxValue_komb[iLastf].N = Math.abs(Nx)
                if (Math.abs(Vx) > maxValue_komb[iLastf].Vz) maxValue_komb[iLastf].Vz = Math.abs(Vx)
                if (Math.abs(Mx) > maxValue_komb[iLastf].My) maxValue_komb[iLastf].My = Math.abs(Mx)
                if (disp > maxValue_komb[iLastf].disp) maxValue_komb[iLastf].disp = disp

                this.M_komb[iLastf][iteil] = Mx
                this.V_komb[iLastf][iteil] = Vx
                this.N_komb[iLastf][iteil] = Nx
                this.u_komb[iLastf][iteil] = ux
                this.uG_komb[iLastf][iteil] = uxG
                this.w_komb[iLastf][iteil] = wx
                this.wG_komb[iLastf][iteil] = wxG
                this.phi_komb[iLastf][iteil] = phix

            }  // ende TH II Ordnung


        }

    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Moment(Mx: number[], iLastf: number) {

        if (THIIO_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Mx[i] = this.M_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Mx[i] = this.M_komb[iLastf - nlastfaelle][i]
            }
        } else {
            for (let i = 0; i < this.nTeilungen; i++) Mx[i] = this.M_komb[iLastf][i]
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Querkraft(Vx: number[], iLastf: number, use_gleichgewichtSG: boolean) {


        if (THIIO_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Vx[i] = this.V_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Vx[i] = this.V_komb[iLastf - nlastfaelle][i]
            }
        } else {
            if (use_gleichgewichtSG) {
                for (let i = 0; i < this.nTeilungen; i++) Vx[i] = this.V_komb[iLastf][i]
            } else {
                for (let i = 0; i < this.nTeilungen; i++) Vx[i] = this.V_komb[iLastf][i]
            }
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Normalkraft(Nx: number[], iLastf: number, use_gleichgewichtSG: boolean) {


        if (THIIO_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++)  Nx[i] = this.N_[iLastf][i]

            } else {
                for (let i = 0; i < this.nTeilungen; i++)  Nx[i] = this.N_komb[iLastf - nlastfaelle][i]
            }
        } else {
            if (use_gleichgewichtSG) {
                for (let i = 0; i < this.nTeilungen; i++) Nx[i] = this.N_komb[iLastf][i]
            } else {
                for (let i = 0; i < this.nTeilungen; i++) Nx[i] = this.N_komb[iLastf][i]
            }
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_u_w_phi(ux: number[], wx: number[], phix: number[], iLastf: number, gesamt: boolean) {


        if (THIIO_flag === 0) {
            if (iLastf < nlastfaelle) {
                for (let i = 0; i < this.nTeilungen; i++) {
                    ux[i] = this.u_[iLastf][i]
                    wx[i] = this.w_[iLastf][i]
                    phix[i] = this.phi_[iLastf][i]
                }
            } else {
                for (let i = 0; i < this.nTeilungen; i++) {
                    ux[i] = this.u_komb[iLastf - nlastfaelle][i]
                    wx[i] = this.w_komb[iLastf - nlastfaelle][i]
                    phix[i] = this.phi_komb[iLastf - nlastfaelle][i]
                }
            }
        } else {
            for (let i = 0; i < this.nTeilungen; i++) {
                if (gesamt) {
                    ux[i] = this.uG_komb[iLastf][i]
                    wx[i] = this.wG_komb[iLastf][i];
                } else {
                    ux[i] = this.u_komb[iLastf][i]
                    wx[i] = this.w_komb[iLastf][i];
                }
                phix[i] = this.phi_komb[iLastf][i]
            }
        }
    }


}
