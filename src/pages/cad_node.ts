import Two from 'two.js'
import { two } from "./cad";

export let CADNodes = [] as TCADNode[]

let min_abstand = 0.2 * 0.2

export class TCADNode {
    two_obj: any
    qname: string = ''
    isActive = true;

    x: number = 0.0
    z: number = 0.0

    constructor(x: number, z: number) {
        this.x = x
        this.z = z
    }


}

export function add_cad_node(x: number, z: number) {

    let index = -1

    min_abstand = 0.2 * 0.2

    for (let i = 0; i < CADNodes.length; i++) {
        let dx = CADNodes[i].x - x
        let dz = CADNodes[i].z - z
        let abstand2 = dx * dx + dz * dz
        if (abstand2 < min_abstand) {
            min_abstand = abstand2
            index = i
        }
    }

    if (index === -1) {

        let node = new TCADNode(x, z)
        CADNodes.push(node)
    }

    return index;
}


export function find_nearest_cad_node(x: number, z: number) {

    let index = -1
    min_abstand = 0.2 * 0.2

    for (let i = 0; i < CADNodes.length; i++) {
        let dx = CADNodes[i].x - x
        let dz = CADNodes[i].z - z
        let abstand2 = dx * dx + dz * dz
        if (abstand2 < min_abstand) {
            min_abstand = abstand2
            index = i
        }
    }
    return index;
}

export function get_cad_node_X(index: number) {
    return CADNodes[index].x
}

export function get_cad_node_Z(index: number) {
    return CADNodes[index].z
}
