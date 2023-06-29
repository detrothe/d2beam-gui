export let nnodes: number;


export function rechnen() {

    console.log("in rechnen");

    const el = document.getElementById('id_nnodes') as any;
    console.log('EL: >>', el.nel);

    nnodes = Number(el.nel);


}