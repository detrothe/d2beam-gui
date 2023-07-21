import { CElement } from "./element"

import { node, element, lagerkraft } from "./rechnen"


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
    estm: number[][] = []
    ksig: number[][] = []
    trans: number[][] = []
    u: number[] = [6]
    F: number[] = [6]

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

        let EAL = this.emodul * this.area / sl
        const EI = this.emodul * this.Iy
        const area_s = this.schubfaktor * this.area
        this.gmodul = this.emodul / 2.0 / (1.0 + this.querdehnzahl)
        this.psi = 1.0 / (1.0 + 12.0 * EI / this.gmodul / area_s / L2)
        const psi = this.psi


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
    berechneElementsteifigkeitsmatrix() {

        let sum: number
        let j: number, k: number
        const help = Array.from(Array(6), () => new Array(6));

        for (j = 0; j < 6; j++) {
            for (k = 0; k < 6; k++) {
                sum = 0.0
                for (let l = 0; l < 6; l++) {
                    sum = sum + this.estm[j][l] * this.trans[l][k]
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
                this.estiff[j][k] = sum
            }
        }
    }


    //---------------------------------------------------------------------------------------------
    berechneInterneKraefte(u: number[]) {

        let ieq: number, j: number, k: number
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
        console.log("element F global ", this.F)

        this.normalkraft = -this.F[0]

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
}