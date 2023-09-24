import { CElement } from "./element"


import {
    node, element, eload, lagerkraft, neloads, kombiTabelle, THIIO_flag, add_neq, neq, u_lf, u0_komb, eigenform_container_u,
    nelTeilungen, ntotalEloads, nlastfaelle, nkombinationen, maxValue_komb, maxValue_lf, nstabvorverfomungen, stabvorverformung
} from "./rechnen"

import { BubbleSort } from "./lib"

export class CSpring extends CElement {

    neqe = 3

    ielem = -1
    nknoten = 1

    nod = -1
    kx = 0.0
    kz = 0.0
    kphi = 0.0
    lm: number[] = [0, 0, 0]
    Fi: number[] = [0.0, 0.0, 0.0]                           // globale interne Stabendkräfte Fx,Fz,M
    edisp: number[] = [0.0, 0.0, 0.0]

    estm: number[][] = []
    //Fx()
    //Fz()
    //M_phi()

    //---------------------------------------------------------------------------------------------
    constructor(node: number, kx: number, kz: number, kphi: number) {

        super()
        this.nod = node
        this.kx = kx
        this.kz = kz
        this.kphi = kphi

    }

    //---------------------------------------------------------------------------------------------
    ich_bin(ielem: number) {
        console.log("Ich bin ein Federelement , No ", ielem)
    }

    //---------------------------------------------------------------------------------------------
    initialisiereElementdaten(ielem: number) {

        console.log("initialisiere Feder")
        this.ielem = ielem

        this.estm = Array.from(Array(3), () => new Array(3));

        this.lm[0] = node[this.nod].L[0];
        this.lm[1] = node[this.nod].L[1];
        this.lm[2] = node[this.nod].L[2];

        this.berechneLokaleElementsteifigkeitmatrix()
    }


    //---------------------------------------------------------------------------------------------
    berechneLokaleElementsteifigkeitmatrix() {

        this.estm[0][0] = this.kx
        this.estm[0][1] = 0.0
        this.estm[0][2] = 0.0
        this.estm[1][0] = 0.0
        this.estm[1][1] = this.kz
        this.estm[1][2] = 0.0
        this.estm[2][0] = 0.0
        this.estm[2][1] = 0.0
        this.estm[2][2] = this.kphi

    }
    //---------------------------------------------------------------------------------------------
    addiereElementsteifigkeitmatrix(stiff: number[][]) {

        let i: number, j: number
        let lmi: number, lmj: number

        console.log("addiereElementsteifigkeitmatrix FEDER", this.estm)

        for (i = 0; i < 3; i++) {
            lmi = this.lm[i];
            if (lmi >= 0) {
                for (j = 0; j < 3; j++) {
                    lmj = this.lm[j];
                    if (lmj >= 0) {
                        stiff[lmi][lmj] = stiff[lmi][lmj] + this.estm[i][j];
                    }
                }
            }
        }

    }

    //---------------------------------------------------------------------------------------------
    berechneInterneKraefte(_ielem: number, _iLastf: number, _iter: number, u: number[]) {

        let ieq: number, i: number, j: number, k: number
        let sum: number

        for (j = 0; j < 3; j++) {                           // Stabverformungen
            ieq = this.lm[j]
            if (ieq === -1) {
                this.edisp[j] = 0
            } else {
                this.edisp[j] = u[ieq]
            }
        }

        for (j = 0; j < 3; j++) {
            sum = 0.0
            for (k = 0; k < 3; k++) {
                sum += this.estm[j][k] * this.edisp[k]
            }
            this.Fi[j] = sum
        }


        return this.Fi;

    }


    //---------------------------------------------------------------------------------------------
    berechneLagerkraefte() {

        // let nodi: number

        // nodi = this.nod
        // lagerkraft[nodi][0] = lagerkraft[nodi][0] - this.Fi[0]
        // lagerkraft[nodi][1] = lagerkraft[nodi][1] - this.Fi[1]
        // lagerkraft[nodi][2] = lagerkraft[nodi][2] - this.Fi[2]

    }
}