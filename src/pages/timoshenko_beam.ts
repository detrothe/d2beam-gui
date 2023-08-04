import { CElement } from "./element"

import { node, element, eload, lagerkraft, neloads, kombiTabelle, THIIO_flag } from "./rechnen"


export class CTimoshenko_beam extends CElement {

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
    normalkraft = 0.0
    lm: number[] = [6]
    cosinus = 0.0
    sinus = 0.0
    alpha = 0.0
    estiff: number[][] = []
    estiff_sig: number[][] = []
    estiff_sig_global: number[][] = []
    estm: number[][] = []
    ksig: number[][] = []
    trans: number[][] = []
    u: number[] = [6]
    F: number[] = [6]   // Stabendgrößen nach WGV im globalen Koordinatensystem
    FL: number[] = [6]  // Stabendgrößen nach KGV im lokalen Koordinatensystem
    Fe: number[] = [6]  // Vorverformungen aus Schiefstellung

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

        let x1, x2, z1, z2, dx: number, dz: number

        this.nod1 = element[ielem].nod[0];
        this.nod2 = element[ielem].nod[1];
        this.nod[0] = this.nod1
        this.nod[1] = this.nod2

        this.x1 = x1 = node[this.nod1].x;
        this.x2 = x2 = node[this.nod2].x;
        this.z1 = z1 = node[this.nod1].z;
        this.z2 = z2 = node[this.nod2].z;

        dx = x2 - x1;
        dz = z2 - z1;
        this.sl = Math.sqrt(dx * dx + dz * dz);      // Stablänge

        if (this.sl < 1e-12) {
            alert("Länge von Element " + String(ielem + 1) + " ist null")
            return;
        }


        this.cosinus = dx / this.sl
        this.sinus = dz / this.sl

        this.alpha = Math.atan2(dz, dx) // *180.0/Math.PI
        console.log("sl=", ielem, this.sl, this.alpha)

        this.normalkraft = 0.0

        this.lm[0] = node[this.nod1].L[0];
        this.lm[1] = node[this.nod1].L[1];
        this.lm[2] = node[this.nod1].L[2];
        this.lm[3] = node[this.nod2].L[0];
        this.lm[4] = node[this.nod2].L[1];
        this.lm[5] = node[this.nod2].L[2];

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

        let dispL = [6], dispG = [6], FeL = [6]

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
            dispL[i] = sum
        }

        for (j = 0; j < 6; j++) {
            sum = 0.0
            for (k = 0; k < 6; k++) {
                sum += this.normalkraft * this.ksig[j][k] * dispL[k]    // this.normalkraft *
            }
            FeL[j] = sum     // lokal
        }

        for (i = 0; i < 6; i++) {
            sum = 0.0
            for (j = 0; j < 6; j++) {
                sum += this.trans[j][i] * FeL[j]
            }
            this.Fe[i] = Fe[i] = sum          // global
        }

    }



}