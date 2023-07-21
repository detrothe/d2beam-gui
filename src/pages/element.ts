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

    addiereElementsteifigkeitmatrix() {

    }

    // @ts-ignore
    berechneInterneKraefte(u: number[]) {

    }

    berechneLagerkraefte() {

    }
    berechneElementlasten() {

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