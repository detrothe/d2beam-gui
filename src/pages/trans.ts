//import {myScreen} from "./index";
//import * as THREE from "three";
//import {OrbitControls} from "./OrbitControls";

class CTrans {

    xmin = 0.0
    zmin = 0.0
    xmax = 0.0
    zmax = 0.0
    dx = 0.0
    dz = 0.0
    height = 100.0
    width = 100.0

    constructor(xmin = 0.0, zmin = 0.0, xmax = 1.0, zmax = 1.0, clientWidth = 100.0, clientHeight = 100.0) {
        this.init(xmin, zmin, xmax, zmax, clientWidth, clientHeight)
    }

    init(xmin: number, zmin: number, xmax: number, zmax: number, clientWidth: number, clientHeight: number) {

        let dx, dz;

        this.xmin = Number(xmin);
        this.xmax = Number(xmax);
        this.zmin = Number(zmin);
        this.zmax = Number(zmax);

        // dx = this.xmax - this.xmin;
        // dz = this.zmax - this.zmin;

        // this.xmin -= 0.2 * dx;
        // this.xmax += 0.2 * dx;
        // this.zmin -= 0.2 * dz;
        // this.zmax += 0.2 * dz;

        this.dx = this.xmax - this.xmin;
        this.dz = this.zmax - this.zmin;

        //console.log("Grenzen", this.xmin, this.xmax, this.zmin, this.zmax);

        //this.ratio_world = this.dx / this.dz;

        // console.log("dx,dz", this.dx, this.dz);

        this.height = clientHeight - 1; //  .getElementById("my-svg").clientHeight - 1;
        //this.width = document.getElementById("dataviz_area").clientWidth - 1;
        this.width = clientWidth - 1;

        //console.log("width,height", this.width, this.height)

        dz = this.dx * this.height / this.width;
        //console.log("dz", dz, this.dz);
        dx = this.dz * this.width / this.height;
        //console.log("dx", dx, this.dx);

        if (dz >= this.dz) {
            const delta_dz = (dz - this.dz) / 2;
            this.zmin = this.zmin - delta_dz;
            this.zmax = this.zmax + delta_dz;
            this.dz = this.zmax - this.zmin;
            //console.log("new z", delta_dz, this.zmin, this.zmax, this.dz);
        } else if (dx >= this.dx) {
            const delta_dx = (dx - this.dx) / 2;
            this.xmin = this.xmin - delta_dx;
            this.xmax = this.xmax + delta_dx;
            this.dx = this.xmax - this.xmin;
            //console.log("new x", delta_dx, this.xmin, this.xmax, this.dx);
        }
        //console.log("dx,dz", this.dx, this.dz);

    }

    xPix(x: number) {
        //return (this.xmax - x) * this.width / this.dx;
        return (x - this.xmin) * this.width / this.dx;
    }

    zPix(z: number) {
        return (z - this.zmin) * this.height / this.dz;
    }

    xWorld(xPix: number) {
        //return this.xmax - xPix * this.dx / this.width;
        return xPix * this.dx / this.width + this.xmin;
    }
    xWorld0(xPix: number) {
        //return this.xmax - xPix * this.dx / this.width;
        return xPix * this.dx / this.width - this.xmin;
    }
    zWorld(zPix: number) {
        return zPix * this.dz / this.height + this.zmin;
    }

    Pix0(x: number) {
        return x * this.width / this.dx;
    }
    World0(xPix: number) {
        //return this.xmax - xPix * this.dx / this.width;
        return xPix * this.dx / this.width;
    }

    getMinMax() {
        return [this.xmin, this.xmax, this.zmin, this.zmax]
    }
}


export { CTrans };