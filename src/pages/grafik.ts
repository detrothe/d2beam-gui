import Two from 'two.js'

console.log("in grafik")

export function drawsystem() {

    var params = {
        fullscreen: false
    };
    var elem = document.getElementById('id_grafik') as HTMLElement;
    var two = new Two(params).appendTo(elem);


    console.log("document.documentElement",document.documentElement.clientHeight)

    let el = document.getElementById("id_tab_group") as any
    //let height = el.getBoundingClientRect().height
    console.log("boundingRect", el?.getBoundingClientRect().height)
    let height = document.documentElement.clientHeight //- el?.getBoundingClientRect()?.height;
    two.width = document.documentElement.clientWidth;
    el = document.querySelector('.footer'); //.getElementById("container")
    console.log("container footer boundingRect", el?.getBoundingClientRect())

    //height= height - el?.getBoundingClientRect().height;
    two.height=height

    // Two.js has convenient methods to make shapes and insert them into the scene.
    var radius = 50;
    var x = two.width * 0.5;
    var y = two.height * 0.5 - radius * 1.25;
    var circle = two.makeCircle(x, y, radius);

    y = two.height * 0.5 + radius * 1.25;
    var width = 100;
    height = 100;
    var rect = two.makeRectangle(x, y, width, height);

    // The object returned has many stylable properties:
    circle.fill = '#FF8000';
    // And accepts all valid CSS color:
    circle.stroke = 'orangered';
    circle.linewidth = 5;

    rect.fill = 'rgb(0, 200, 255)';
    rect.opacity = 0.75;
    rect.noStroke();

    two.makeLine(0,0,two.width,two.height)

    // Don’t forget to tell two to draw everything to the screen
    two.update();

    //el = document.querySelector('.footer'); //.getElementById("container")
    //console.log("nach update container footer boundingRect", el?.getBoundingClientRect())

}