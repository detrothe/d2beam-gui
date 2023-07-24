export class CElement {

    print() {
        console.log("in element")
    }

    liesElementdaten() {

    }
    // @ts-ignore
    initialisiereElementdaten(ielem: number) {

    }

    berechneElementsteifigkeitsmatrix() {

    }

    berechneLokaleElementsteifigkeitmatrix() {

    }

    addiereElementsteifigkeitmatrix(stiff: number[][]) {
        console.log("class element: addiereElementsteifigkeitmatrix", stiff[0][0])
    }


    berechneInterneKraefte(ielem:number,u: number[]) {
        console.log("class element: berechneInterneKraefte", ielem, u[0])
    }

    berechneLagerkraefte() {

    }
    berechneElementlasten(ieload:number) {
        console.log("class element: berechneElementlasten von ", ieload)
    }

    berechneElementSchnittgroessen() {

    }

    stmglenk() {

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