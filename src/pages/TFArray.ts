export class TFArray2D {

    length: number
    nrow: number
    ncol: number
    minRow: number
    maxRow: number
    minCol: number
    maxCol: number
    konstante: number
    marray: number[]


    constructor(min_Row = 1, max_Row: number, min_Col = 1, max_Col: number) {

        this.nrow = max_Row - min_Row + 1;
        this.ncol = max_Col - min_Col + 1;
        this.minRow = min_Row;
        this.maxRow = max_Row;
        this.minCol = min_Col;
        this.maxCol = max_Col;
        this.konstante = -this.minCol * this.nrow - this.minRow;
        this.length = this.nrow * this.ncol;
        this.marray = Array(this.length);
    }

    _(i: number, j: number) {                          // get value

        if (i < this.minRow || i > this.maxRow || j < this.minCol || j > this.maxCol) {
            console.log("wrong index in get", i, j);
            return Number.NaN;
        }
        return this.marray[j * this.nrow + i + this.konstante];
    }

    set(i: number, j: number, wert: number) {

        if (i < this.minRow || i > this.maxRow || j < this.minCol || j > this.maxCol) {
            console.log("wrong index in set", i, j);
            console.log("min,max, row,col",this.minRow ,this.maxRow ,this.minCol ,this.maxCol)
            return Number.NaN;
        }
        this.marray[j * this.nrow + i + this.konstante] = wert;
        return
    }

    initV(a: number[]) {

        for (let i = 0; i < this.length; i++) {
            this.marray[i] = a[i];
        }
    }

    zero() {
        this.marray.fill(0.0)
        //for (let i = 0; i < this.length; i++) {
        //    this.marray[i] = 0.0;
        //}
    }
}


export class TFVector {

    length: number
    minDim: number
    maxDim: number
    marray: number[]

    constructor(min_Dim = 1, max_Dim: number) {

        this.length = max_Dim - min_Dim + 1;
        this.minDim = min_Dim;
        this.maxDim = max_Dim;
        this.marray = Array(this.length);
    }

    _(i: number) {                         // get value

        if (i < this.minDim || i > this.maxDim) {
            console.log("wrong index in get", i);
            return Number.NaN;
        }
        return this.marray[i - this.minDim];
    }

    set(i: number, wert: number) {

        if (i < this.minDim || i > this.maxDim) {
            console.log("wrong index in set", i);
            return Number.NaN;
        }
        this.marray[i - this.minDim] = wert;
        return
    }

    initV(a: number[]) {

        for (let i = 0; i < this.length; i++) {
            this.marray[i] = a[i];
        }
    }

    zero() {
        this.marray.fill(0.0)
        //for (let i = 0; i < this.length; i++) {
        //    this.marray[i] = 0.0;
        //}
    }
}

export class TFArray3D {

    length: number
    nrow: number
    ncol: number
    ntab: number
    minRow: number
    maxRow: number
    minCol: number
    maxCol: number
    minTab: number
    maxTab: number
    konstante: number
    rowcol: number
    marray: number[]


    constructor(min_Row = 1, max_Row: number, min_Col = 1, max_Col: number, min_Tab = 1, max_Tab: number) {

        this.nrow = max_Row - min_Row + 1;
        this.ncol = max_Col - min_Col + 1;
        this.ntab = max_Tab - min_Tab + 1;
        this.minRow = min_Row;
        this.maxRow = max_Row;
        this.minCol = min_Col;
        this.maxCol = max_Col;
        this.minTab = min_Tab;
        this.maxTab = max_Tab;
        this.konstante = -this.minCol * this.nrow - this.minRow - this.nrow * this.ncol * this.minTab;
        this.rowcol = this.nrow * this.ncol
        this.length = this.nrow * this.ncol * this.ntab;
        this.marray = Array(this.length);
    }

    _(i: number, j: number, k: number) {                          // get value

        if (i < this.minRow || i > this.maxRow || j < this.minCol || j > this.maxCol || k < this.minTab || k > this.maxTab) {
            console.log("wrong index in get", i, j, k);
            return Number.NaN;
        }
        return this.marray[j * this.nrow + i + this.rowcol * k + this.konstante];
    }

    set(i: number, j: number, k: number, wert: number) {

        if (i < this.minRow || i > this.maxRow || j < this.minCol || j > this.maxCol || k < this.minTab || k > this.maxTab) {
            console.log("wrong index in set", i, j, k);
            return Number.NaN;
        }
        this.marray[j * this.nrow + i + this.rowcol * k + this.konstante] = wert;
        return
    }

    initV(a: number[]) {

        for (let i = 0; i < this.length; i++) {
            this.marray[i] = a[i];
        }
    }

    zero() {
        this.marray.fill(0.0)
    }
}


