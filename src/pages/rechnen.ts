export let nnodes: number;
export let node = [] as TNode[]

class TNode {
    x: number = 1.0                                 // Knotenkoordinaten bezogen auf Hilfskoordinatensystem
    z: number = 1.0

    Lx: number = 0                                  // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    Lz: number = 0                                  // Lagerbedingung  bei Eingabe: 0=frei, 1=fest, später enthält L() die Gleichungsnummern
    nel: number = 0                                 // Anzahl der Elemente, die an dem Knoten hängen
}

export function rechnen() {

    console.log("in rechnen");

    const el = document.getElementById('id_nnodes') as any;
    console.log('EL: >>', el.nel);

    nnodes = Number(el.nel);


}