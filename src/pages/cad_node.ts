import Two from "two.js";
import { get_fangweite_cursor, two } from "./cad";

export let CADNodes = [] as TCADNode[];

let min_abstand = 0.01 * 0.01;

let ID_counter = 0;

export class TCADNode {
    two_obj: any;
    qname: string = "";
    isActive = true;

    ID = 0;

    x: number = 0.0;
    z: number = 0.0;

    nel: number = 0; // Anzahl der Elemente, die an dem Knoten hängen
    index_FE = -1; // index in FE Berechnung

    offset_Px = 0.0;
    offset_Pz = 0.0;
    offset_My = 0.0;

    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
        ID_counter++;
        this.ID = ID_counter;
    }

    zero_offset() {
        this.offset_Px = 0.0;
        this.offset_Pz = 0.0;
        this.offset_My = 0.0;
    }
}

//------------------------------------------------------------------------------------------------
export function add_cad_node(x: number, z: number, option = 0) {
    //--------------------------------------------------------------------------------------------

    let index = -1;

    min_abstand = 0.01 * 0.01;

    for (let i = 0; i < CADNodes.length; i++) {
        let dx = CADNodes[i].x - x;
        let dz = CADNodes[i].z - z;
        let abstand2 = dx * dx + dz * dz;
        if (abstand2 < min_abstand) {
            min_abstand = abstand2;
            index = i;
        }
    }


    if (index === -1) {
        x = Math.round(x * 1000.0) / 1000.0
        z = Math.round(z * 1000.0) / 1000.0
        console.log("x,z", x, z)

        let node = new TCADNode(x, z);
        CADNodes.push(node);
        if (option > 0) return CADNodes.length - 1;
    }

    return index;
}

//------------------------------------------------------------------------------------------------
export function find_nearest_cad_node(x: number, z: number) {
    //--------------------------------------------------------------------------------------------

    let index = -1;
    min_abstand = get_fangweite_cursor() * get_fangweite_cursor();

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].nel > 0) {
            let dx = CADNodes[i].x - x;
            let dz = CADNodes[i].z - z;
            let abstand2 = dx * dx + dz * dz;
            if (abstand2 < min_abstand) {
                min_abstand = abstand2;
                index = i;
            }
        }
    }
    return index;
}

//------------------------------------------------------------------------------------------------
export function get_cad_node_X(index: number) {
    //--------------------------------------------------------------------------------------------
    return CADNodes[index].x;
}

//------------------------------------------------------------------------------------------------
export function get_cad_node_Z(index: number) {
    //--------------------------------------------------------------------------------------------
    return CADNodes[index].z;
}

//------------------------------------------------------------------------------------------------
export function add_element_nodes(index: number): void {
    //--------------------------------------------------------------------------------------------
    CADNodes[index].nel++;
    console.log("add_element_nodes", index, CADNodes[index].nel);
}

//------------------------------------------------------------------------------------------------
export function remove_element_nodes(index: number): void {
    //--------------------------------------------------------------------------------------------
    CADNodes[index].nel--;
    console.log("remove_element_nodes", index, CADNodes[index].nel);
}

//------------------------------------------------------------------------------------------------
export function zero_nel(index: number): void {
    //--------------------------------------------------------------------------------------------
    CADNodes[index].nel = 0;
}

//------------------------------------------------------------------------------------------------
export function get_nel(index: number) {
    //--------------------------------------------------------------------------------------------
    return CADNodes[index].nel;
}

//------------------------------------------------------------------------------------------------
export function get_ID(index: number) {
    //--------------------------------------------------------------------------------------------
    return CADNodes[index].ID;
}

//------------------------------------------------------------------------------------------------
export function reset_ID_counter() {
    //--------------------------------------------------------------------------------------------

    ID_counter = 0;

    for (let i = 0; i < CADNodes.length; i++) {
        if (CADNodes[i].ID > ID_counter) ID_counter = CADNodes[i].ID;
    }
}

//------------------------------------------------------------------------------------------------
export function zero_offset_nodes() {
    //--------------------------------------------------------------------------------------------

    for (let i = 0; i < CADNodes.length; i++) {
        CADNodes[i].offset_Px = 0.0
        CADNodes[i].offset_Pz = 0.0
        CADNodes[i].offset_My = 0.0
    }

}


//------------------------------------------------------------------------------------------------
export function reset_cad_nodes() {
    //--------------------------------------------------------------------------------------------

    ID_counter = 0;
    CADNodes.length = 0

}
