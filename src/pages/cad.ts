import Two from 'two.js'

import { CTrans } from './trans';

let two: any = null;
let domElement: any = null

let fullscreen = false;
let grafik_top = 0

//--------------------------------------------------------------------------------------------------------
export function click_zurueck_cad() {
    //----------------------------------------------------------------------------------------------------

    let elb = document.getElementById("id_button_zurueck_cad") as HTMLButtonElement
    let ele = document.getElementById("id_cad") as HTMLDivElement

    if (fullscreen) {
        console.log("click_zurueck_grafik_cad")
        let ele1 = document.getElementById("id_tab_group") as any
        console.log("HEIGHT id_tab_group boundingRect", ele1.getBoundingClientRect(), '|', ele1);

        ele.style.position = 'relative'
        fullscreen = false

        elb.innerHTML = "Fullscreen"
    }
    else {
        console.log("fullscreen")
        ele.style.position = 'absolute'
        fullscreen = true

        elb.innerHTML = "zurück"
    }

    elb.style.width = 'fit-content'

    //drawsystem();
    init_cad(0);

}


//--------------------------------------------------------------------------------------------------- i n i t _ t w o _ c a d

export function init_two_cad(svg_id = 'artboard_cad') {


    if (two !== null) {
        // let parent = two.renderer.domElement.parentElement
        // console.log("Parent ", parent)

        two.unbind('update')
        two.pause()
        two.removeEventListener()
        two.clear()

        //two.bind('update')
        //        let parent = two.renderer.domElement.parentelement;
        //console.log("Parent ", parent)
        //if (parent) parent.removeChild(two.renderer.domElement);
    }

    if (domElement != null) {
        // domElement.removeEventListener('wheel', wheel, { passive: false });
        // domElement.removeEventListener('mousedown', mousedown, false);
        // domElement.removeEventListener('mouseup', mousemove, false);

        //console.log('domElement',domElement)
        let parent = domElement.parentElement
        //console.log("Parent ", parent)
        if (parent) parent.removeChild(domElement);

    }

    // const tab_group = document.getElementById('container') as any;
    // tab_group.hidden=true

    // for (let i = 0; i < two.scene.children.length; i++) {
    //     let child = two.scene.children[i];
    //     two.scene.remove(child);
    //     Two.Utils.dispose(child);
    // }

    console.log("__________________________________  C  A  D  ___________")
    if (svg_id === 'svg_artboard_cad') {
        const elem = document.getElementById(svg_id) as any; //HTMLDivElement;
        //console.log("childElementCount", elem.childElementCount)

        if (elem.childElementCount > 0) elem.removeChild(elem?.lastChild);   // war > 2
    }

    var params = {
        fullscreen: false,
        type: Two.Types.canvas
    };

    if (svg_id === 'svg_artboard_cad') params.type = Two.Types.svg

    two = null;
    const artboard = document.getElementById(svg_id) as any;

    two = new Two(params).appendTo(artboard);

    if (svg_id === 'artboard_cad') {
        domElement = two.renderer.domElement;


        //     domElement.addEventListener('wheel', wheel, { passive: false });
        //     domElement.addEventListener('mousedown', mousedown, false);
        //     domElement.addEventListener('mouseup', mouseup, false);
        //     domElement.addEventListener('pointermove', pointermove, false);


        //     domElement.addEventListener('touchstart', touchstart, { passive: false });
        //     domElement.addEventListener('touchmove', touchmove, { passive: false });

        //     domElement.addEventListener('touchend', touchend, { passive: false });

    }

}


//--------------------------------------------------------------------------------------------------- i n i t _ c a d

export function init_cad(_flag: number) {
    let show_selection = true;
    let height = 0

    if (two) two.clear();

    let ele = document.getElementById("id_cad") as any
    if (fullscreen) {
        grafik_top = 0
        ele.style.position = 'absolute'
        height = document.documentElement.clientHeight - 4;
    } else {
        grafik_top = ele.getBoundingClientRect().top
        //console.log("HEIGHT id_grafik boundingRect", ele.getBoundingClientRect(), '|', ele);
        //write("grafik top: " + grafik_top)
        if (grafik_top === 0) grafik_top = 69
        height = document.documentElement.clientHeight - grafik_top - 4 - 17//- el?.getBoundingClientRect()?.height;
    }

    let breite: number
    let hoehe: number
    if (show_selection) {
        two.width = document.documentElement.clientWidth;
        two.height = height
        breite = two.width;
        hoehe = two.height;
    } else {
        two.width = breite = 1500;
        two.height = hoehe = 1500;
    }
    two.update();
}