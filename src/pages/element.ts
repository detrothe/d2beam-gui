export class CElement {

    print() {
        console.log("in element")
    }

    liesElementdaten() { }

    ich_bin(ielem: number) { console.log("Ich bin ein unbekanntes Element , No ", ielem) }

    // @ts-ignore
    initialisiereElementdaten(ielem: number) {

    }

    berechneElementsteifigkeitsmatrix(theorie: number) {
        console.log("class element: berechneElementsteifigkeitsmatrix", theorie)
    }

    berechneLokaleElementsteifigkeitmatrix() {

    }

    addiereElementsteifigkeitmatrix(stiff: number[][]) {
        console.log("class element: addiereElementsteifigkeitmatrix", stiff[0][0])
    }

    // @ts-ignore
    addiereElementsteifigkeitmatrix_ksig(stiff: number[][]) {
    }

    berechneElementsteifigkeitsmatrix_Ksig() { }

    berechneInterneKraefte(ielem: number, iLastf: number, iter: number, u: number[]) {
        console.log("class element: berechneInterneKraefte", ielem, iLastf, iter, u[0])
    }

    berechneLagerkraefte() {

    }
    berechneElementlasten(ieload: number) {
        console.log("class element: berechneElementlasten von ", ieload)
    }

    berechneElementSchnittgroessen(ielem: number, iLastf: number) {
        console.log("class element: berechneElementSchnittgroessen von ", ielem, iLastf)
    }

    get_edispL(edispL: number[], iLastfall: number) {
        console.log("class element: get_edispL", iLastfall, edispL[0])
    }

    get_edispL_schiefstellung(edispL: number[], iKomb: number) {
        console.log("class element: get_edispL_schiefstellung", iKomb, edispL[0])
    }

    get_edispL_eigenform(edispL: number[], iLastfall: number, ieigv: number) {
        console.log("class element: get_edispL", iLastfall, ieigv, edispL[0])
    }

    get_elementSchnittgroesse_Moment(Mx: number[], iLastf: number) {
        console.log("class element: get_elementSchnittgroesse_Moment", iLastf, Mx[0])
    }

    get_elementSchnittgroesse_Querkraft(Vx: number[], iLastf: number, use_gleichgewichtSG: boolean) {
        console.log("class element: get_elementSchnittgroesse_Querkraft", iLastf, Vx[0], use_gleichgewichtSG)
    }

    get_elementSchnittgroesse_Normalkraft(Nx: number[], iLastf: number, use_gleichgewichtSG: boolean) {
        console.log("class element: get_elementSchnittgroesse_Normalkraft", iLastf, Nx[0], use_gleichgewichtSG)
    }
}


class beam extends CElement {

    print() {
        console.log("in beam")
    }
}

export function testclass() {

    let test = new beam();
    test.print();
}