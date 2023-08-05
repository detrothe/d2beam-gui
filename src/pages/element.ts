export class CElement {

    print() {
        console.log("in element")
    }

    liesElementdaten() {

    }
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


    berechneInterneKraefte(ielem: number, iLastf: number, iter: number, u: number[]) {
        console.log("class element: berechneInterneKraefte", ielem, iLastf, iter, u[0])
    }

    berechneLagerkraefte() {

    }
    berechneElementlasten(ieload: number) {
        console.log("class element: berechneElementlasten von ", ieload)
    }

    berechneElementSchnittgroessen() {

    }

    get_edispL(edispL: number[], iLastfall: number) {
        console.log("class element: get_edispL", iLastfall, edispL[0])
    }

    get_edispL_eigenform(edispL: number[], iLastfall: number, ieigv: number) {
        console.log("class element: get_edispL", iLastfall, ieigv, edispL[0])
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