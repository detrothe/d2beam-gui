
const X = 0, Y = 1, Z = 2

export function BubbleSort(arr: number[]) {

    let temp: number
    let i: number, j: number

    let len = arr.length
    //console.log("BubbleSort, len", len)
    for (i = 0; i < len - 1; i++) {
        for (j = i + 1; j < len; j++) {
            if (arr[i] > arr[j]) {
                temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
    }
    //console.log("sortiert",arr)
}


/*
    Abstand eines Punktes Q von einer Geraden, die durch die Punkte p1 und p1 definiert ist. 3D Version
*/
//-------------------------------------------------------------------------------------------------------
export function abstandPunktGerade(p1: number[], p2: number[], pQ: number[])
//-------------------------------------------------------------------------------------------------------
{
    let a = Array(3), b = Array(3), c = Array(3);
    let aBetrag, cBetrag;

    let abstand = -1.0

    a[X] = p2[X] - p1[X];
    a[Y] = p2[Y] - p1[Y];
    a[Z] = p2[Z] - p1[Z];

    aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y] + a[Z] * a[Z]);

    if (aBetrag < 1.e-12) return abstand;         // Geradenpunkte sind zu nahe beieinander

    b[X] = pQ[X] - p1[X];
    b[Y] = pQ[Y] - p1[Y];
    b[Z] = pQ[Z] - p1[Z];

    crossProd(a, b, c);

    cBetrag = Math.sqrt(c[X] * c[X] + c[Y] * c[Y] + c[Z] * c[Z]);

    return abstand = cBetrag / aBetrag;

}
/*
    Abstand eines Punktes Q von einer Geraden, die durch die Punkte p1 und p1 definiert ist. 2D Version, Vektor
*/
//-------------------------------------------------------------------------------------------------------
export function abstandPunktGerade_2D_v(p1: number[], p2: number[], pQ: number[])
//-------------------------------------------------------------------------------------------------------
{
    let a = Array(2), b = Array(2);
    let aBetrag, cBetrag;

    let abstand = -1.0

    a[X] = p2[X] - p1[X];  // dx
    a[Y] = p2[Y] - p1[Y];  // dy
    // a[Z] = p2[Z] - p1[Z];

    aBetrag = Math.sqrt(a[X] * a[X] + a[Y] * a[Y]);

    if (aBetrag < 1.e-12) return abstand;         // Geradenpunkte sind zu nahe beieinander

    b[X] = pQ[X] - p1[X];
    b[Y] = pQ[Y] - p1[Y];
    // b[Z] = pQ[Z] - p1[Z];

    // crossProd(a, b, c);
    let cZ = a[X] * b[Y] - a[Y] * b[X];

    cBetrag = Math.sqrt(cZ * cZ);

    return abstand = cBetrag / aBetrag;

}
/*
    Abstand eines Punktes Q von einer Geraden, die durch die Punkte p1 und p1 definiert ist. 2D Version
*/
//-------------------------------------------------------------------------------------------------------
export function abstandPunktGerade_2D(p1x: number, p1y: number, p2x: number, p2y: number, pQx: number, pQy: number)
//-------------------------------------------------------------------------------------------------------
{
    let ax: number, ay: number, bx: number, by: number;
    let aBetrag: number, cBetrag: number;

    let abstand = -1.0

    ax = p2x - p1x;   // dx
    ay = p2y - p1y;   // dy

    let det = ax * ax + ay * ay

    aBetrag = Math.sqrt(det);

    if (aBetrag < 1.e-12) return abstand;         // Geradenpunkte sind zu nahe beieinander

    bx = pQx - p1x;
    by = pQy - p1y;

    let eta = (ax * bx + ay * by) / det
    //console.log("eta", eta)
    if (eta < 0.0 || eta > 1.0) return abstand;

    let lambda = (-ay * bx + ax * by) / det
    console.log("lambda", lambda)

    // cross product

    cBetrag = Math.abs(ax * by - ay * bx);

    return abstand = cBetrag / aBetrag;

}

//-------------------------------------------------------------------------------------------------------
export function crossProd(a: number[], b: number[], c: number[]): void
//-------------------------------------------------------------------------------------------------------
{
    //      c = a x b

    c[X] = a[Y] * b[Z] - a[Z] * b[Y];
    c[Y] = a[Z] * b[X] - a[X] * b[Z];
    c[Z] = a[X] * b[Y] - a[Y] * b[X];

}

/*
    Inside Area. 2D Version
*/
//-------------------------------------------------------------------------------------------------------
export function test_point_inside_area_2D(x: number[], y: number[], pQx: number, pQy: number): boolean
//-------------------------------------------------------------------------------------------------------
{
    //console.log("in test_point_inside_area_2D")
    let dx: number, dy: number, bx: number, by: number;

    //let inside = true
    let outside = false
    let len = x.length

    for (let i = 0; i < len; i++) {

        if (i < len - 1) {
            dx = x[i + 1] - x[i];
            dy = y[i + 1] - y[i];
        } else {
            dx = x[0] - x[i];
            dy = y[0] - y[i];
        }

        let det = dx * dx + dy * dy
        if (isNaN(det)) continue;

        if (Math.abs(det) < 1.e-12) continue;

        bx = pQx - x[i];
        by = pQy - y[i];

        // let eta = (dx * bx + dy * by) / det
        // //console.log("eta", eta)
        // if (eta < 0.0 || eta > 1.0) {
        //     outside = true
        //     continue;
        // }
        let lambda = (-dy * bx + dx * by) / det
        //console.log("lambda", lambda, det)

        if (lambda > 0.0) outside = true

    }
    return !outside;

}
