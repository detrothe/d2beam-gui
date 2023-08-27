import { CElement } from "./element"

import {
    node, element, eload, lagerkraft, neloads, kombiTabelle, THIIO_flag, add_neq, neq, u_lf, u0_komb, eigenform_container_u,
    nelTeilungen, nlastfaelle, nkombinationen, maxValue_komb, maxValue_lf, nstabvorverfomungen, stabvorverformung
} from "./rechnen"


export class CTimoshenko_beam extends CElement {

    ielem = -1
    nknoten = 2
    emodul = 0.0
    gmodul = 0.0
    querdehnzahl = 0.0
    schubfaktor = 0.0
    wichte = 0.0
    ks = 0.0
    Iy = 0.0
    area = 0.0
    psi = 0.0
    kappa = 0.0
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
    lm: number[] = Array(6)
    gelenk: number[] = [0, 0, 0, 0, 0, 0]
    nGelenke = 0
    cosinus = 0.0
    sinus = 0.0
    alpha = 0.0
    estiff: number[][] = []
    estiff_sig: number[][] = []
    estiff_sig_global: number[][] = []
    estm: number[][] = []
    ksig: number[][] = []
    trans: number[][] = []
    u: number[] = Array(6)   // Verformungen global
    edispL: number[] = Array(6)   // Verformungen lokal
    edisp0: number[] = Array(6)   // Vorverformungren
    F: number[] = Array(6)   // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = Array(6)  // Stabendgrößen nach KGV im lokalen Koordinatensystem
    Fe: number[] = Array(6)  // Vorverformungen aus Schiefstellung

    N_ = [] as number[][]  // Schnittgrößen entlang Stab, lokal
    V_ = [] as number[][]
    M_ = [] as number[][]
    u_ = [] as number[][]  // Verformungen entlang Stab, lokale Richtung
    w_ = [] as number[][]
    phi_ = [] as number[][]

    NL: number = 0.0
    VL: number = 0.0
    ML: number = 0.0
    uL: number = 0.0
    wL: number = 0.0
    phiL: number = 0.0



    //---------------------------------------------------------------------------------------------
    setQuerschnittsdaten(emodul: number, Iy: number, area: number, wichte: number, ks: number, querdehnzahl: number, schubfaktor: number) {

        this.emodul = emodul
        this.Iy = Iy
        this.area = area
        this.wichte = wichte
        this.ks = ks
        this.querdehnzahl = querdehnzahl
        this.schubfaktor = schubfaktor
    }

    //---------------------------------------------------------------------------------------------
    initialisiereElementdaten(ielem: number) {

        let x1, x2, z1, z2

        let n: number

        this.ielem = ielem

        if (THIIO_flag === 0) n = nlastfaelle;
        else n = nkombinationen;

        this.N_ = Array.from(Array(n), () => new Array(nelTeilungen + 1).fill(0.0));
        this.V_ = Array.from(Array(n), () => new Array(nelTeilungen + 1).fill(0.0));
        this.M_ = Array.from(Array(n), () => new Array(nelTeilungen + 1).fill(0.0));
        this.u_ = Array.from(Array(n), () => new Array(nelTeilungen + 1).fill(0.0));
        this.w_ = Array.from(Array(n), () => new Array(nelTeilungen + 1).fill(0.0));

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
        this.sl = Math.sqrt(this.dx * this.dx + this.dz * this.dz);      // Stablänge

        if (this.sl < 1e-12) {
            alert("Länge von Element " + String(ielem + 1) + " ist null")
            return;
        }


        this.cosinus = this.dx / this.sl
        this.sinus = this.dz / this.sl

        this.alpha = Math.atan2(this.dz, this.dx) // *180.0/Math.PI
        console.log("sl=", ielem, this.sl, this.alpha)

        this.normalkraft = 0.0

        this.lm[0] = node[this.nod1].L[0];
        this.lm[1] = node[this.nod1].L[1];
        this.lm[2] = node[this.nod1].L[2];
        this.lm[3] = node[this.nod2].L[0];
        this.lm[4] = node[this.nod2].L[1];
        this.lm[5] = node[this.nod2].L[2];

        this.nGelenke = 0
        for (let i = 0; i < 6; i++) {
            this.gelenk[i] = element[ielem].gelenk[i]
            if (this.gelenk[i] > 0) {
                this.nGelenke++;
                this.lm[i] = neq;
                add_neq();
            }
        }

        this.estm = Array.from(Array(6), () => new Array(6));
        this.ksig = Array.from(Array(6), () => new Array(6));
        this.trans = Array.from(Array(6), () => new Array(6).fill(0.0));
        this.estiff = Array.from(Array(6), () => new Array(6));
        this.estiff_sig = Array.from(Array(6), () => new Array(6));

        this.trans[0][0] = this.cosinus
        this.trans[0][1] = this.sinus
        this.trans[1][0] = -this.sinus
        this.trans[1][1] = this.cosinus
        this.trans[2][2] = 1.0

        this.trans[3][3] = this.cosinus
        this.trans[3][4] = this.sinus
        this.trans[4][3] = -this.sinus
        this.trans[4][4] = this.cosinus
        this.trans[5][5] = 1.0

        this.berechneLokaleElementsteifigkeitmatrix()
    }

    //---------------------------------------------------------------------------------------------
    berechneLokaleElementsteifigkeitmatrix() {

        const sl = this.sl
        const L2 = sl * sl
        const L3 = L2 * sl

        let area_s: number
        let EAL = this.emodul * this.area / sl
        const EI = this.emodul * this.Iy
        this.gmodul = this.emodul / 2.0 / (1.0 + this.querdehnzahl)

        if (this.schubfaktor === 0.0) {  // schubstarr
            area_s = this.area
            this.psi = 1.0
            this.kappa = 0.0
        } else {
            area_s = this.schubfaktor * this.area
            this.psi = 1.0 / (1.0 + 12.0 * EI / this.gmodul / area_s / L2)
            this.kappa = EI / this.gmodul / area_s
        }
        const psi = this.psi

        console.log("psi", this.psi)

        this.estm[0][0] = EAL
        this.estm[0][1] = 0.0
        this.estm[0][2] = 0.0
        this.estm[0][3] = -EAL
        this.estm[0][4] = 0.0
        this.estm[0][5] = 0.0
        this.estm[1][0] = 0.0
        this.estm[1][1] = 12 * EI * psi / L3
        this.estm[1][2] = -6 * EI * psi / L2
        this.estm[1][3] = 0.0
        this.estm[1][4] = -12 * EI * psi / L3
        this.estm[1][5] = -6 * EI * psi / L2
        this.estm[2][0] = 0.0
        this.estm[2][1] = -6 * EI * psi / L2
        this.estm[2][2] = (1.0 + 3.0 * psi) * EI / sl
        this.estm[2][3] = 0.0
        this.estm[2][4] = 6 * EI * psi / L2
        this.estm[2][5] = (3.0 * psi - 1.0) * EI / sl
        this.estm[3][0] = -EAL
        this.estm[3][1] = 0.0
        this.estm[3][2] = 0.0
        this.estm[3][3] = EAL
        this.estm[3][4] = 0.0
        this.estm[3][5] = 0.0
        this.estm[4][0] = 0.0
        this.estm[4][1] = -12 * EI * psi / L3
        this.estm[4][2] = 6 * EI * psi / L2
        this.estm[4][3] = 0.0
        this.estm[4][4] = 12 * EI * psi / L3
        this.estm[4][5] = 6 * EI * psi / L2
        this.estm[5][0] = 0.0
        this.estm[5][1] = -6 * EI * psi / L2
        this.estm[5][2] = (3.0 * psi - 1.0) * EI / sl
        this.estm[5][3] = 0.0
        this.estm[5][4] = 6 * EI * psi / L2
        this.estm[5][5] = (1.0 + 3.0 * psi) * EI / sl


        EAL = 0.0
        const fact = 1.0 / 60.0 / sl
        const psi2 = psi * psi

        this.ksig[0][0] = EAL
        this.ksig[0][1] = 0.0
        this.ksig[0][2] = 0.0
        this.ksig[0][3] = -EAL
        this.ksig[0][4] = 0.0
        this.ksig[0][5] = 0.0
        this.ksig[1][0] = 0.0
        this.ksig[1][1] = (60.0 + 12.0 * psi2) * fact
        this.ksig[1][2] = -6. * psi2 * fact * sl
        this.ksig[1][3] = 0.0
        this.ksig[1][4] = -(60. + 12. * psi2) * fact
        this.ksig[1][5] = -6. * psi2 * fact * sl
        this.ksig[2][0] = 0.0
        this.ksig[2][1] = -6. * psi2 * fact * sl
        this.ksig[2][2] = (5. + 3. * psi2) * fact * L2
        this.ksig[2][3] = 0.0
        this.ksig[2][4] = 6. * psi2 * fact * sl
        this.ksig[2][5] = (3. * psi2 - 5.) * fact * L2
        this.ksig[3][0] = -EAL
        this.ksig[3][1] = 0.0
        this.ksig[3][2] = 0.0
        this.ksig[3][3] = EAL
        this.ksig[3][4] = 0.0
        this.ksig[3][5] = 0.0
        this.ksig[4][0] = 0.0
        this.ksig[4][1] = -(60.0 + 12.0 * psi2) * fact
        this.ksig[4][2] = 6. * psi2 * fact * sl
        this.ksig[4][3] = 0.0
        this.ksig[4][4] = (60.0 + 12.0 * psi2) * fact
        this.ksig[4][5] = 6. * psi2 * fact * sl
        this.ksig[5][0] = 0.0
        this.ksig[5][1] = -6. * psi2 * fact * sl
        this.ksig[5][2] = (3. * psi2 - 5.) * fact * L2
        this.ksig[5][3] = 0.0
        this.ksig[5][4] = 6. * psi2 * fact * sl
        this.ksig[5][5] = (5. + 3. * psi2) * fact * L2

        /*
                for (let zeile = 0; zeile < 6; zeile++) {
                    if (this.gelenk[zeile] > 0) {
                        this.stmglenk(this.estm, zeile)
                    }
                }

                for (let zeile = 0; zeile < 6; zeile++) {
                    if (this.gelenk[zeile] > 0) {
                        this.stmglenk(this.ksig, zeile)
                    }
                }
        */
    }


    //---------------------------------------------------------------------------------------------
    berechneElementsteifigkeitsmatrix(theorie: number) {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(6));

        console.log("berechneElementsteifigkeitsmatrix", theorie, this.normalkraft)

        if (theorie === 0) {

            for (j = 0; j < 6; j++) {
                for (k = 0; k < 6; k++) {
                    sum = 0.0
                    for (let l = 0; l < 6; l++) {
                        sum = sum + this.estm[j][l] * this.trans[l][k]
                    }
                    help[j][k] = sum
                }
            }

        } else {

            const estm = Array.from(Array(6), () => new Array(6));

            for (j = 0; j < 6; j++) {
                for (k = 0; k < 6; k++) {
                    estm[j][k] = this.estm[j][k] + this.normalkraft * this.ksig[j][k]
                }
            }

            for (j = 0; j < 6; j++) {
                for (k = 0; k < 6; k++) {
                    sum = 0.0
                    for (let l = 0; l < 6; l++) {
                        sum = sum + estm[j][l] * this.trans[l][k]
                    }
                    help[j][k] = sum
                }
            }

        }

        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.trans[l][j] * help[l][k]
                }
                this.estiff[j][k] = sum
            }
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
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estiff[i][j];
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
                    sum = sum + this.ksig[j][l] * this.trans[l][k]
                }
                help[j][k] = sum
            }
        }


        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.trans[l][j] * help[l][k]
                }
                this.estiff_sig[j][k] = -sum * this.normalkraft
            }
        }
        console.log("NORMALKRAFT", this.normalkraft)
    }

    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix_ksig(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number


        for (i = 0; i < 6; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < 6; j++) {
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

        for (j = 0; j < 6; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                this.u[j] = 0
            } else {
                this.u[j] = u[ieq]
            }
        }

        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.estiff[j][k] * this.u[k]
            }
            this.F[j] = sum
        }

        // normale Elementlasten hinzufügen

        if (THIIO_flag === 0) {

            for (let ieload = 0; ieload < neloads; ieload++) {
                if ((eload[ieload].element === ielem) && (eload[ieload].lf === iLastf)) {
                    for (i = 0; i < 6; i++) {
                        this.F[i] = this.F[i] + eload[ieload].el_r[i]
                    }
                }
            }
        }
        else if (THIIO_flag === 1) { // ikomb=iLastf

            for (let ieload = 0; ieload < neloads; ieload++) {
                if (eload[ieload].element === ielem) {
                    const index = eload[ieload].lf - 1
                    console.log("elem kombi index", index, kombiTabelle[iLastf - 1][index])
                    if (kombiTabelle[iLastf - 1][index] !== 0.0) {

                        for (i = 0; i < 6; i++) {
                            this.F[i] = this.F[i] + eload[ieload].el_r[i] * kombiTabelle[iLastf - 1][index]
                        }
                    }
                }
            }

            if (iter > 0) {
                for (i = 0; i < 6; i++) {                            // Schiefstellung
                    this.F[i] = this.F[i] + this.Fe[i]
                }
            }

        }

        console.log("element F global ", this.F)

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.trans[i][j] * this.F[j]
            }
            this.FL[i] = sum
        }


        for (i = 0; i < 3; i++) this.FL[i] = -this.FL[i];  // Linke Seite Vorzeichen nach KGV

        this.normalkraft = (this.FL[0] + this.FL[3]) / 2.0

        for (i = 0; i < 6; i++) { // Verformungen lokal
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.trans[i][j] * this.u[j]
            }
            this.edispL[i] = sum
        }

        this.NL = this.FL[0]                               // Verformungen, Schnittgrößen am Stabanfang für Zustandslinien
        this.VL = this.FL[1]
        this.ML = this.FL[2]
        this.uL = this.edispL[0]
        this.wL = this.edispL[1]
        this.phiL = this.edispL[2]

        return this.FL;
    }

    //---------------------------------------------------------------------------------------------
    berechneLagerkraefte() {

        let nodi: number

        for (let i = 0; i < 2; i++) {
            nodi = this.nod[i]
            lagerkraft[nodi][0] = lagerkraft[nodi][0] - this.F[3 * i]
            lagerkraft[nodi][1] = lagerkraft[nodi][1] - this.F[3 * i + 1]
            lagerkraft[nodi][2] = lagerkraft[nodi][2] - this.F[3 * i + 2]
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten(ieload: number) {

        const sl = this.sl

        if (eload[ieload].art === 0) {              // Trapezstreckenlast senkrecht auf Stab

            const p1 = -sl * (eload[ieload].pR + eload[ieload].pL) / 2.0 / 60.0
            const p2 = -sl * (eload[ieload].pR - eload[ieload].pL) / 2.0 / 60.0
            eload[ieload].re[0] = 0
            eload[ieload].re[3] = 0

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2
        }
        else if (eload[ieload].art === 1) {              // Trapezstreckenlast z-Richtung

            let pL = eload[ieload].pL
            let pR = eload[ieload].pR

            let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
            let pzR = this.cosinus * pR
            let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
            let pxR = this.sinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2
        }
        else if (eload[ieload].art === 2) {              // Trapezstreckenlast z-Richtung, Projektion

            let pL = eload[ieload].pL * this.dx / sl
            let pR = eload[ieload].pR * this.dx / sl

            let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
            let pzR = this.cosinus * pR
            let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
            let pxR = this.sinus * pR

            const p1 = -sl * (pzR + pzL) / 2.0 / 60.0
            const p2 = -sl * (pzR - pzL) / 2.0 / 60.0

            eload[ieload].re[0] = -sl * (2 * pxL + pxR) / 6
            eload[ieload].re[3] = -sl * (pxL + 2 * pxR) / 6

            eload[ieload].re[1] = 30.0 * p1 - (10.0 + 2.0 * this.psi) * p2 // VL
            eload[ieload].re[4] = 30.0 * p1 + (10.0 + 2.0 * this.psi) * p2 // VR

            eload[ieload].re[2] = -5.0 * sl * p1 + sl * this.psi * p2
            eload[ieload].re[5] = 5.0 * sl * p1 + sl * this.psi * p2
        }


        eload[ieload].el_r[0] = this.trans[0][0] * eload[ieload].re[0] + this.trans[1][0] * eload[ieload].re[1] // !! mit [T]^T multiplizieren
        eload[ieload].el_r[1] = this.trans[0][1] * eload[ieload].re[0] + this.trans[1][1] * eload[ieload].re[1]
        eload[ieload].el_r[2] = eload[ieload].re[2]
        eload[ieload].el_r[3] = this.trans[3][3] * eload[ieload].re[3] + this.trans[4][3] * eload[ieload].re[4]
        eload[ieload].el_r[4] = this.trans[3][4] * eload[ieload].re[3] + this.trans[4][4] * eload[ieload].re[4]
        eload[ieload].el_r[5] = eload[ieload].re[5]

        console.log("elementload global ", eload[ieload].el_r)

    }

    //---------------------------------------------------------------------------------------------
    berechneElementlasten_Vorverformung(Fe: number[], u: number[]) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        let dispL = Array(6), dispG = Array(6), FeL = Array(6)
        let v0 = Array(6).fill(0.0)

        for (j = 0; j < 6; j++) {                           // Stabverformungen
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
            for (j = 0; j < 6; j++) {
                sum += this.trans[i][j] * dispG[j]
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

        // jetzt noch die Anteile aus Stabvorverformungen

        console.log("ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß   nstabvorverfomungen", nstabvorverfomungen)
        for (i = 0; i < nstabvorverfomungen; i++) {
            if (stabvorverformung[i].element === this.ielem) {
                console.log("Element ", +i + 1, ' hat Stabvorverformungen')
                v0[1] = stabvorverformung[i].p[0]
                v0[4] = stabvorverformung[i].p[1]

                v0[2] = -(v0[4] - v0[1] / this.sl)
                v0[5] = v0[2]

                let v0m = stabvorverformung[i].p[2]
                v0[2] = v0[2] - 4.0 * v0m / this.sl
                v0[5] = v0[5] + 4.0 * v0m / this.sl
            }

        }


        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * v0[k]
            }
            FeL[j] += sum     // lokal
        }



        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.trans[j][i] * FeL[j]
            }
            this.Fe[i] = Fe[i] = sum          // global
        }

    }


    /*
        //---------------------------------------------------------------------------------------------
        stmglenk(estm: number[][], zeile: number) {

            let iz: number, i: number, j: number
            const estm_neu = Array.from(Array(6), () => new Array(6));
            let div: number

            div = estm[zeile][zeile]
            for (iz = 0; iz < 6; iz++) {
                for (i = 0; i < 6; i++) {
                    estm_neu[iz][i] = estm[iz][i] - estm[iz][zeile] * estm[zeile][i] / div
                }
            }

            for (i = 0; i < 6; i++) {
                for (j = 0; j < 6; j++) {
                    estm[i][j] = estm_neu[i][j]
                }
            }

        }

        //---------------------------------------------------------------------------------------------
        elrglenk(estm: number[][], el_r: number[], zeile: number) {

            let iz: number, i: number
            let elr_neu = new Array(6)
            let div: number


            div = estm[zeile][zeile]
            for (iz = 0; iz < 6; iz++) {
                elr_neu[iz] = el_r[iz] - estm[iz][zeile] * el_r[zeile] / div
            }

            for (i = 0; i < 6; i++) {
                el_r[i] = elr_neu[i]
            }

        }
    */
    //---------------------------------------------------------------------------------------------
    get_edispL(edispL: number[], iLastfall: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < 6; j++) {
            let ieq = this.lm[j]
            if (ieq === -1) {
                edisp[j] = 0.0
            } else {
                edisp[j] = u_lf[ieq][iLastfall]              // in m, rad
            }
        }
        console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < 6; j++) {
                sum += this.trans[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        console.log("dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------
    get_edispL_schiefstellung(edispL: number[], iKomb: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < 6; j++) {
            let ieq = this.lm[j]
            if (ieq === -1) {
                edisp[j] = 0.0
            } else {
                edisp[j] = u0_komb[ieq][iKomb]
            }
        }
        console.log("disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < 6; j++) {
                sum += this.trans[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        console.log("dispL", edispL)
    }

    //---------------------------------------------------------------------------------------------
    get_edispL_eigenform(edispL: number[], iKomb: number, ieigv: number) {

        let edisp: number[] = new Array(6)


        for (let j = 0; j < 6; j++) {
            let ieq = this.lm[j]
            if (ieq === -1) {
                edisp[j] = 0.0
            } else {
                edisp[j] = eigenform_container_u[iKomb - 1]._(ieq, ieigv)
            }
        }
        console.log("eigen, disp", edisp)

        for (let i = 0; i < 6; i++) {
            let sum = 0.0
            for (let j = 0; j < 6; j++) {
                sum += this.trans[i][j] * edisp[j]
            }
            edispL[i] = sum
        }
        console.log("eigen, dispL", edispL)
    }


    //---------------------------------------------------------------------------------------------

    berechneElementSchnittgroessen(ielem: number, iLastf: number) {

        let Mx: number, Vx: number, Nx: number, ux: number, wx: number
        let Nu: number[] = new Array(2), Nw: number[] = new Array(4)
        let u: number, w: number, wL: number = 0.0, disp = 0.0
        let edisp: number[] = Array(6)

        let EI = this.emodul * this.Iy

        console.log("class element: berechneElementSchnittgroessen von ", iLastf)

        const kappa = this.kappa
        const sl = this.sl
        const nenner = sl ** 3 + 12 * kappa * sl

        if (THIIO_flag > 0) {
            for (let i = 0; i < 6; i++) edisp[i] = this.edispL[i] + this.edisp0[i]
            wL = this.wL + this.edisp0[1]
        }

        let d_x = this.sl / (nelTeilungen)
        let x = 0.0

        for (let iteil = 0; iteil <= nelTeilungen; iteil++) {
            Mx = this.ML + this.VL * x
            Vx = this.VL
            Nx = this.NL
            ux = 0.0
            wx = 0.0

            if (THIIO_flag === 1) {

                Nu[0] = (1.0 - x / sl);
                Nu[1] = x / sl
                Nw[0] = (2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x + sl ** 3 + 12 * kappa * sl) / nenner;
                Nw[1] = -((sl * x ** 3 + (-2 * sl ** 2 - 6 * kappa) * x ** 2 + (sl ** 3 + 6 * kappa * sl) * x) / nenner);
                Nw[2] = -((2 * x ** 3 - 3 * sl * x ** 2 - 12 * kappa * x) / nenner);
                Nw[3] = -((sl * x ** 3 + (6 * kappa - sl ** 2) * x ** 2 - 6 * kappa * sl * x) / nenner);
                u = Nu[0] * edisp[0] + Nu[1] * edisp[3]
                w = Nw[0] * edisp[1] + Nw[1] * edisp[2] + Nw[2] * edisp[4] + Nw[3] * edisp[5];

                Mx = Mx - this.NL * (w - wL)

                for (let i = 0; i < nstabvorverfomungen; i++) {
                    if (stabvorverformung[i].element === this.ielem) {
                        //console.log("Element ", +i + 1, ' hat Stabvorverformungen')
                        let w0a = stabvorverformung[i].p[0]
                        let w0e = stabvorverformung[i].p[1]
                        let v0m = stabvorverformung[i].p[2]
                        let w0x = (w0e - w0a) * x / sl + 4.0 * v0m * x / sl * (1.0 - x / sl)
                        Mx = Mx - this.NL * w0x
                    }

                }

            }

            // normale Elementlasten hinzufügen

            if (THIIO_flag === 0) {

                for (let ieload = 0; ieload < neloads; ieload++) {
                    if ((eload[ieload].element === ielem) && (eload[ieload].lf - 1 === iLastf)) {

                        if (eload[ieload].art === 0) {              // Trapezstreckenlast senkrecht auf Stab

                            const pL = eload[ieload].pR
                            const pR = eload[ieload].pR
                            const dp = pR - pL

                            Vx = Vx - pL * x - dp * x * x / 2.
                            Mx = Mx - pL * x * x / 2 - dp * x * x * x / 6.

                            wx = pL / 24.0 * (x ** 4 - 2 * sl * x ** 3 + sl * sl * x * x) / EI

                        }
                        else if (eload[ieload].art === 1) {         // Trapezstreckenlast z-Richtung

                            const pL = eload[ieload].pR
                            const pR = eload[ieload].pR

                            let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                            let pzR = this.cosinus * pR
                            let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                            let pxR = this.sinus * pR

                            const dpx = pxR - pxL
                            const dpz = pzR - pzL

                            Nx = Nx - pxL * x - dpx * x * x / 2.
                            Vx = Vx - pzL * x - dpz * x * x / 2.
                            Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / 6.

                        }
                        else if (eload[ieload].art === 2) {         // Trapezstreckenlast z-Richtung, Projektion

                            //console.log("Projektion",this.dx, sl)
                            const pL = eload[ieload].pR * this.dx / sl
                            const pR = eload[ieload].pR * this.dx / sl

                            let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                            let pzR = this.cosinus * pR
                            let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                            let pxR = this.sinus * pR

                            const dpx = pxR - pxL
                            const dpz = pzR - pzL

                            Nx = Nx - pxL * x - dpx * x * x / 2.
                            Vx = Vx - pzL * x - dpz * x * x / 2.
                            Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / 6.

                        }
                    }
                }

                disp = Math.sqrt(ux * ux + wx * wx) * 1000.0      // in mm

                if (Math.abs(Nx) > maxValue_lf[iLastf].N) maxValue_lf[iLastf].N = Math.abs(Nx)
                if (Math.abs(Vx) > maxValue_lf[iLastf].Vz) maxValue_lf[iLastf].Vz = Math.abs(Vx)
                if (Math.abs(Mx) > maxValue_lf[iLastf].My) maxValue_lf[iLastf].My = Math.abs(Mx)
                if (disp > maxValue_lf[iLastf].disp) maxValue_lf[iLastf].disp = disp

            }
            else if (THIIO_flag === 1) { // ikomb=iLastf

                for (let ieload = 0; ieload < neloads; ieload++) {

                    if (eload[ieload].element === ielem) {
                        const index = eload[ieload].lf - 1
                        //console.log("elem kombi index", index, kombiTabelle[iLastf][index])
                        if (kombiTabelle[iLastf][index] !== 0.0) {

                            if (eload[ieload].art === 0) {              // Trapezstreckenlast senkrecht auf Stab

                                const pL = eload[ieload].pR * kombiTabelle[iLastf][index]
                                const pR = eload[ieload].pR * kombiTabelle[iLastf][index]
                                const dp = pR - pL

                                Vx = Vx - pL * x - dp * x * x / 2.
                                Mx = Mx - pL * x * x / 2 - dp * x * x * x / 6.

                            }
                            else if (eload[ieload].art === 1) {         // Trapezstreckenlast z-Richtung

                                const pL = eload[ieload].pR * kombiTabelle[iLastf][index]
                                const pR = eload[ieload].pR * kombiTabelle[iLastf][index]

                                let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                let pzR = this.cosinus * pR
                                let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.sinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / 2.
                                Vx = Vx - pzL * x - dpz * x * x / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / 6.

                            }
                            else if (eload[ieload].art === 2) {         // Trapezstreckenlast z-Richtung, Projektion

                                const pL = eload[ieload].pR * this.dx / sl * kombiTabelle[iLastf][index]
                                const pR = eload[ieload].pR * this.dx / sl * kombiTabelle[iLastf][index]

                                let pzL = this.cosinus * pL                           // Lastanteil senkrecht auf Stab
                                let pzR = this.cosinus * pR
                                let pxL = this.sinus * pL                             // Lastanteil parallel zum Stab
                                let pxR = this.sinus * pR

                                const dpx = pxR - pxL
                                const dpz = pzR - pzL

                                Nx = Nx - pxL * x - dpx * x * x / 2.
                                Vx = Vx - pzL * x - dpz * x * x / 2.
                                Mx = Mx - pzL * x * x / 2 - dpz * x * x * x / 6.

                            }

                        }
                    }
                }

                disp = Math.sqrt(ux * ux + wx * wx) * 1000.0

                if (Math.abs(Nx) > maxValue_komb[iLastf].N) maxValue_komb[iLastf].N = Math.abs(Nx)
                if (Math.abs(Vx) > maxValue_komb[iLastf].Vz) maxValue_komb[iLastf].Vz = Math.abs(Vx)
                if (Math.abs(Mx) > maxValue_komb[iLastf].My) maxValue_komb[iLastf].My = Math.abs(Mx)
                if (disp > maxValue_komb[iLastf].disp) maxValue_komb[iLastf].disp = disp

            }

            console.log("x, Vx, Mx", x, Vx, Mx, wx)
            this.M_[iLastf][iteil] = Mx
            this.V_[iLastf][iteil] = Vx
            this.N_[iLastf][iteil] = Nx
            this.u_[iLastf][iteil] = ux
            this.w_[iLastf][iteil] = wx
            x += d_x
        }

    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Moment(Mx: number[], iLastf: number) {

        for (let i = 0; i <= nelTeilungen; i++) {
            Mx[i] = this.M_[iLastf][i]
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Querkraft(Vx: number[], iLastf: number) {

        for (let i = 0; i <= nelTeilungen; i++) {
            Vx[i] = this.V_[iLastf][i]
        }
    }

    //---------------------------------------------------------------------------------------------
    get_elementSchnittgroesse_Normalkraft(Nx: number[], iLastf: number) {

        for (let i = 0; i <= nelTeilungen; i++) {
            Nx[i] = this.N_[iLastf][i]
        }
    }


}