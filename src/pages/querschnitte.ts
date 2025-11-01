import { SlButton } from "@shoelace-style/shoelace"
import { drRechteckQuerSchnitt } from "../components/dr-dialog-rechteckquerschnitt"
import { CAD_STAB, list, redraw_stab, two_cad_update } from "./cad"
import { TCAD_Stab } from "./CCAD_element"
import { myFormat, write } from "./utility"
import { AlertDialog, ConfirmDialog } from "./confirm_dialog"
import { berechnungErforderlich } from "./globals"

export let nQuerschnittSets = 0
export let querschnitts_zaehler = -1
export function set_querschnitts_zaehler(wert: number) { querschnitts_zaehler = wert };
export let default_querschnitt = ''
export function set_default_querschnitt(wert: string) { default_querschnitt = wert };

export let querschnittset = [] as TQuerschnitt[]

let dialog_querschnitt_new = true;
export function set_dialog_querschnitt_new(wert: boolean) { dialog_querschnitt_new = wert };

let dialog_querschnitt_index = 0;
let dialog_querschnitt_item_id = "";

class TQuerschnitt {
    name: string = ''
    className = ''
    id: string = ''

    emodul: number = 30000.0
    Iy: number = 160000.0
    area: number = 1200.0
    zso: number = 0.2;
    height: number = 0.4
    width: number = 0.3
    wichte: number = 0.0
    alphaT: number = 0.0
    querdehnzahl: number = 0.0
    schubfaktor: number = 0.0
    faktor_dehn = 1.0

    model: number = 1
    definedQuerschnitt: number = 1
}

class TQuerschnittRechteck extends TQuerschnitt {

    constructor() {
        super();
        this.className = 'QuerschnittRechteck'
    }

    flanschbreite = 0
    flanschhoehe = 0
    stegbreite_oben = 0
    stegbreite_unten = 0
    steghoehe = 0
}


//---------------------------------------------------------------------------------------------------------------
export function change_def_querschnitt() {
    //---------------------------------------------------------------------------------------------------------------
    let el = document.getElementById('id_querschnitt_default') as HTMLSelectElement;
    default_querschnitt = el.value;
    write("default_querschnitt " + default_querschnitt)
}
//---------------------------------------------------------------------------------------------------------------
export function removeAll_def_querschnitt() {
    //---------------------------------------------------------------------------------------------------------------
    let select = document.getElementById('id_querschnitt_default') as HTMLSelectElement;
    let length = select.options.length;
    for (let i = length - 1; i >= 0; i--) select.remove(i);
}

//---------------------------------------------------------------------------------------------------------------
export function remove_def_querschnitt(str: string) {
    //---------------------------------------------------------------------------------------------------------------

    let select = document.getElementById('id_querschnitt_default') as HTMLSelectElement;
    let length = select.options.length;
    for (let i = length - 1; i >= 0; i--) {
        if (select.options.item(i)?.textContent === str) {
            select.remove(i);
            break;
        }
    }
}


//---------------------------------------------------------------------------------------------------------------
export function incr_querschnitts_zaehler() {
    //-----------------------------------------------------------------------------------------------------------
    querschnitts_zaehler++;
}

//---------------------------------------------------------------------------------------------------------------
export function set_querschnittszaehler() {
    //-----------------------------------------------------------------------------------------------------------

    for (let i = 0; i < nQuerschnittSets; i++) {
        let id = querschnittset[i].id
        let txtArray = id.split("-");
        //console.log("txtArray", txtArray)
        if (Number(txtArray[1]) > querschnitts_zaehler) querschnitts_zaehler = Number(txtArray[1])
    }
    //console.log("querschnitts_zaehler", querschnitts_zaehler)
}

//---------------------------------------------------------------------------------------------------------------
export function check_if_name_exists(name: string) {
    //-----------------------------------------------------------------------------------------------------------
    for (let i = 0; i < nQuerschnittSets; i++) {
        //console.log("check_if_name_exists", i, name, querschnittset[i].name)
        if (name === querschnittset[i].name) return true;
    }
    //console.log("exit check_if_name_exists")
    return false;
}

//---------------------------------------------------------------------------------------------------------------
export function incr_querschnittSets() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets++;
    querschnittset.push(new TQuerschnittRechteck())
}

//---------------------------------------------------------------------------------------------------------------
export function del_last_querschnittSet() {
    //-----------------------------------------------------------------------------------------------------------
    nQuerschnittSets--;
    querschnittset.pop();
}

//---------------------------------------------------------------------------------------------------------------
export function del_querschnittSet(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    for (let i = 0; i < nQuerschnittSets; i++) {
        if (qname === querschnittset[i].name) {
            console.log("lösche jetzt", i, qname)
            querschnittset.splice(i, 1);
            nQuerschnittSets--;
            break;
        }
    }

    let ele = document.getElementById("id_element_tabelle");
    ele?.setAttribute("option_deleted", qname);
}


//---------------------------------------------------------------------------------------------------------------
export function find_querschnittSet(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    let anzahl = 0;

    for (let i = 0; i < list.size; i++) {
        let obj = list.getNext(i) as TCAD_Stab;
        if (obj.elTyp === CAD_STAB) {
            if (obj.name_querschnitt === qname) return 1;
        }
    }
    return anzahl;

    // const el = document.getElementById('id_element_tabelle');
    // const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;

    // let nRowTab = table.rows.length;

    // for (let izeile = 1; izeile < nRowTab; izeile++) {
    //     let qsname = (table.rows[izeile].cells[1].firstElementChild as HTMLSelectElement).value;

    //     if (qname === qsname) {
    //         console.log("find_querschnittSet, gefunden", izeile, qname)
    //         anzahl++;
    //         break;
    //     }
    // }
    // return anzahl;
}



//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck_name(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].name;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_classname(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string = 'error'

    if (index >= 0) name = querschnittset[index].className;

    return name;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_length(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let len = 0

    if (index >= 0) len = Object.keys(querschnittset[index]).length;
    console.log("get_querschnitt_length", querschnittset[index])

    return len;
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnitt_index(qname: string) {
    //-----------------------------------------------------------------------------------------------------------

    for (let index = 0; index < querschnittset.length; index++) {
        if (qname === querschnittset[index].name) {
            return index;
            break;
        }
    }
    return -1;
}


//---------------------------------------------------------------------------------------------------------------
export function add_new_cross_section(qName: string, id: string) {
    //-------------------------------------------------------------------------------------------------------------

    const tag = document.createElement("sl-tree-item");
    // tag.textContent = qName
    //const text = document.createTextNode(qName);
    //tag.appendChild(text);

    const quer_button = document.createElement("sl-button");
    quer_button.textContent = qName;
    quer_button.style.minWidth = "8rem";
    quer_button.addEventListener("click", opendialog);
    quer_button.title = "click to modify";
    quer_button.id = id;
    //quer_button.style.margin='0';
    //quer_button.style.padding='0';

    const delete_button = document.createElement("button");
    //delete_button.textContent = "delete";
    delete_button.value = id;
    delete_button.className = "btn";
    delete_button.innerHTML = '<i class = "fa fa-trash"></i>';
    delete_button.addEventListener("click", contextmenu_querschnitt);
    delete_button.title = "delete Querschnitt";
    //delete_button.style.margin='0';
    //delete_button.style.padding='auto'

    //  var br = document.createElement("br");
    //  tag.appendChild(br);
    var div = document.createElement("div");
    //div.id='div_add_cross_section'
    div.style.display = "flex";
    div.style.alignItems = "center";
    //div.style.backgroundColor = "#f5f5f5";
    div.style.border = "0px";

    div.appendChild(quer_button);
    div.appendChild(delete_button);

    tag.appendChild(div);

    const element = document.getElementById("id_tree_LQ");
    element?.appendChild(tag);
    console.log("child appendchild", element);

    const ele = document.getElementById("id_element_tabelle");
    //console.log("ELE: >>", ele);
    ele?.setAttribute("add_new_option", "4");

    let select = document.getElementById('id_querschnitt_default') as HTMLSelectElement;
    const opt1 = document.createElement("option");
    opt1.text = qName;
    select.add(opt1);

    if (select.options.length === 1) default_querschnitt = qName
}


//---------------------------------------------------------------------------------------------------------------
export function opendialog(ev: any) {
    //-------------------------------------------------------------------------------------------------------------

    // @ts-ignore
    console.log("opendialog geht", this);
    ev.preventDefault;

    // @ts-ignore
    const id = this.id;

    // console.log("id", document.getElementById(id));

    // const myArray = id.split("-");
    // console.log("Array", myArray.length, myArray[0], myArray[1]);

    // const index = Number(myArray[1]);

    // @ts-ignore
    const ele = this;
    const qname = ele.textContent;
    console.log("opendialog, qname", ele.innerText, "|", ele.textContent, ele.id);
    const index = get_querschnitt_index(qname);

    if (index < 0) {
        alert("BIG Problem in opendialog, contact developer");
        return;
    }

    {
        //let qname: string = '', id0: string = ''
        //let emodul: number = 0, Iy: number = 0, area: number = 0, height: number = 0, bettung: number = 0, wichte: number = 0;

        const [qname, id0, emodul, Iy, area, height, width, definedQuerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT,
            flanschbreite, flanschhoehe, stegbreite_oben, stegbreite_unten, steghoehe, faktor_dehn] = get_querschnittRechteck(index);

        //if (id0 !== id) console.log("BIG Problem in opendialog");

        const el = document.getElementById("id_dialog_rechteck") as HTMLDialogElement;

        let elem = el?.shadowRoot?.getElementById("emodul") as HTMLInputElement;
        console.log("set emodul=", elem.value, emodul);
        elem.value = String(emodul);
        elem = el?.shadowRoot?.getElementById("traeg_y") as HTMLInputElement;
        elem.value = String(Iy);
        elem = el?.shadowRoot?.getElementById("area") as HTMLInputElement;
        elem.value = String(area);
        elem = el?.shadowRoot?.getElementById("qname") as HTMLInputElement;
        elem.value = String(qname);
        elem = el?.shadowRoot?.getElementById("height") as HTMLInputElement;
        elem.value = String(height);
        elem = el?.shadowRoot?.getElementById("width") as HTMLInputElement;
        elem.value = String(width);
        elem = el?.shadowRoot?.getElementById("id_defquerschnitt") as HTMLInputElement;
        elem.value = String(definedQuerschnitt);
        elem = el?.shadowRoot?.getElementById("wichte") as HTMLInputElement;
        elem.value = String(wichte);
        elem = el?.shadowRoot?.getElementById("schubfaktor") as HTMLInputElement;
        elem.value = String(schubfaktor);
        elem = el?.shadowRoot?.getElementById("querdehnzahl") as HTMLInputElement;
        elem.value = String(querdehnzahl);
        elem = el?.shadowRoot?.getElementById("zso") as HTMLInputElement;
        elem.value = String(zso);
        let wert = String(myFormat(Number(alphaT), 1, 6, 1)).replace(/,/g, ".");
        elem = el?.shadowRoot?.getElementById("alpha_t") as HTMLInputElement;
        // elem.setAttribute('value', String(myFormat(Number(alphaT), 1, 6, 1)));
        console.log("myformat", alphaT, "|", myFormat(Number(alphaT), 1, 6, 1), "|", String(myFormat(Number(alphaT), 1, 6, 1)));
        //    elem.value = String(alphaT);
        elem.value = wert;

        elem = el?.shadowRoot?.getElementById("id_fakt_dehn") as HTMLInputElement;
        elem.value = String(faktor_dehn);

        elem = (el?.shadowRoot?.getElementById("id_TQ_flanschbreite") as HTMLInputElement);
        elem.value = String(flanschbreite);
        elem = (el?.shadowRoot?.getElementById("id_TQ_flanschhoehe") as HTMLInputElement);
        elem.value = String(flanschhoehe);
        elem = (el?.shadowRoot?.getElementById("id_TQ_stegbreite_oben") as HTMLInputElement);
        elem.value = String(stegbreite_oben);
        elem = (el?.shadowRoot?.getElementById("id_TQ_stegbreite_unten") as HTMLInputElement);
        elem.value = String(stegbreite_unten);
        elem = (el?.shadowRoot?.getElementById("id_TQ_steghoehe") as HTMLInputElement);
        elem.value = String(steghoehe);
    }

    //const el=document.getElementById(id);
    const el = document.getElementById("id_dialog_rechteck") as drRechteckQuerSchnitt;

    el.init_name_changed(false);

    (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).addEventListener("close", dialog_querschnitt_closed);

    dialog_querschnitt_new = false;
    dialog_querschnitt_index = index;
    dialog_querschnitt_item_id = id;

    (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).showModal();
}


//---------------------------------------------------------------------------------------------------------------
export async function contextmenu_querschnitt(ev: any) {
    //-------------------------------------------------------------------------------------------------------------

    let qname = "";

    ev.preventDefault();

    // @ts-ignore
    const el = this;
    //console.log("el,this",ev.offsetParent)
    const id_button = el.value; // button
    const ele = document.getElementById(id_button) as SlButton;
    if (ele != null) qname = ele.textContent!;
    //console.log("contextmenu_querschnitt, qname", el.innerText, el.textContent, '|', el.value);

    const dialog = new ConfirmDialog({
        trueButton_Text: "ja",
        falseButton_Text: "nein",
        question_Text: "Lösche Querschnitt: " + qname,
    });
    const loesche = await dialog.confirm();
    //console.log("loesche", loesche);

    if (loesche) {
        // window.confirm("Lösche Querschnitt: " + qname)

        const anzahl = find_querschnittSet(qname);
        if (anzahl === 0) {
            del_querschnittSet(qname);

            let element = document.getElementById("id_tree_LQ") as any;
            //console.log("element.children", element.children);
            //console.log("el.parentNode", el.parentNode.parentNode);
            //console.log("el.parentElement", el.parentElement.parentElement);
            element?.removeChild(el.parentElement.parentElement);

            remove_def_querschnitt(qname);
        } else {
            const dialogAlert = new AlertDialog({
                trueButton_Text: "ok",
                question_Text: "Es gibt mindestens ein Element, das den Querschnitt verwendet",
            });
            await dialogAlert.confirm();
            //window.alert("Lösche Querschnitt: ")
        }
    }
}


//---------------------------------------------------------------------------------------------------------------
export function dialog_querschnitt_closed(_e: any) {
    //------------------------------------------------------------------------------------------------------------
    //console.log("Event dialog closed", e);
    console.log("dialog_querschnitt_closed")
    const el = document.getElementById("id_dialog_rechteck") as HTMLDialogElement;

    // @ts-ignore
    const returnValue = this.returnValue;

    (el?.shadowRoot?.getElementById("dialog_rechteck") as HTMLDialogElement).removeEventListener("close", dialog_querschnitt_closed);

    if (returnValue === "ok") {
        let id: string;
        if (dialog_querschnitt_new) {
            incr_querschnitts_zaehler();
            id = "mat-" + querschnitts_zaehler;
        } else {
            id = "mat-" + dialog_querschnitt_index;
        }
        {
            let elem = el?.shadowRoot?.getElementById("emodul") as HTMLInputElement;
            //console.log("emodul=", elem.value);
            const emodul = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("traeg_y") as HTMLInputElement;
            const Iy = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("area") as HTMLInputElement;
            const area = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("qname") as HTMLInputElement;
            const qname = elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("height") as HTMLInputElement;
            const height = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("width") as HTMLInputElement;
            const width = +elem.value.replace(/,/g, ".");
            //         elem = el?.shadowRoot?.querySelector('.radio-group-querschnitt') as any;
            elem = el?.shadowRoot?.getElementById("id_defquerschnitt") as any;
            //console.log("defquerschnitt", elem)
            const defquerschnitt = +elem.value.replace(/,/g, ".");
            //console.log("defquerschnitt", defquerschnitt)
            elem = el?.shadowRoot?.getElementById("schubfaktor") as HTMLInputElement;
            const schubfaktor = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("querdehnzahl") as HTMLInputElement;
            const querdehnzahl = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("wichte") as HTMLInputElement;
            const wichte = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("zso") as HTMLInputElement;
            const zso = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("alpha_t") as HTMLInputElement;
            const alphaT = +elem.value.replace(/,/g, ".");
            elem = el?.shadowRoot?.getElementById("id_fakt_dehn") as HTMLInputElement;
            const faktor_dehn = +elem.value.replace(/,/g, ".");
            //console.log("dialog_querschnitt_closed",elem.value,alphaT)

            let flanschbreite = Number((el?.shadowRoot?.getElementById('id_TQ_flanschbreite') as HTMLInputElement).value.replace(/,/g, "."));
            let flanschhoehe = Number((el?.shadowRoot?.getElementById('id_TQ_flanschhoehe') as HTMLInputElement).value.replace(/,/g, "."));
            let stegbreite_oben = Number((el?.shadowRoot?.getElementById('id_TQ_stegbreite_oben') as HTMLInputElement).value.replace(/,/g, "."));
            let stegbreite_unten = Number((el?.shadowRoot?.getElementById('id_TQ_stegbreite_unten') as HTMLInputElement).value.replace(/,/g, "."));
            let steghoehe = Number((el?.shadowRoot?.getElementById('id_TQ_steghoehe') as HTMLInputElement).value.replace(/,/g, "."));

            if (dialog_querschnitt_new) {
                incr_querschnittSets();

                set_querschnittRechteck(qname, id, emodul, Iy, area, height, width, defquerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT,
                    flanschbreite, flanschhoehe, stegbreite_oben, stegbreite_unten, steghoehe, faktor_dehn);
            } else {
                update_querschnittRechteck(dialog_querschnitt_index, qname, id, emodul, Iy, area, height, width, defquerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT,
                    flanschbreite, flanschhoehe, stegbreite_oben, stegbreite_unten, steghoehe, faktor_dehn);

                // Name des Querschnitts in Querschnitts-tree (tab Querschnitte) ändern
                const el = document.getElementById(dialog_querschnitt_item_id) as HTMLElement;
                //console.log("dialog_querschnitt_item_id", dialog_querschnitt_item_id);
                //console.log("dialog_querschnitt_index, qname", dialog_querschnitt_index, qname); // , el.textContent

                if (el.textContent !== qname) {
                    let old_name = el.textContent
                    // innerHTML

                    el.textContent = qname;
                    const ele = document.getElementById("id_element_tabelle");
                    //console.log('ELE: >>', ele);
                    ele?.setAttribute("namechanged", String(dialog_querschnitt_index));

                    // update in Tab cad

                    let eld = document.getElementById('id_querschnitt_default') as HTMLSelectElement;
                    for (const option of eld.options) {
                        //console.log("OPTIONS", option.value, option.textContent, option.text)
                        if (option.textContent === old_name) {
                            option.textContent = qname
                            if (default_querschnitt === old_name) default_querschnitt = qname;
                        }
                    }

                    // jetzt alle Stäbe korrigieren

                    for (let i = 0; i < list.size; i++) {
                        let obj = list.getNext(i) as TCAD_Stab;
                        if (obj.elTyp === CAD_STAB) {
                            if (obj.name_querschnitt === old_name) obj.name_querschnitt = qname;
                            redraw_stab(obj);
                        }
                    }
                    two_cad_update();
                }
            }
        }

        if (dialog_querschnitt_new) {
            const qName = (el?.shadowRoot?.getElementById("qname") as HTMLInputElement).value;
            console.log("NAME", qName);

            add_new_cross_section(qName, id);
        }

        berechnungErforderlich(true);
    }
}


//---------------------------------------------------------------------------------------------------------------
export function set_querschnittRechteck(name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number,
    definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number,
    flanschbreite: number, flanschhoehe: number, stegbreite_oben: number, stegbreite_unten: number, steghoehe: number, faktor_dehn: number) {
    //-----------------------------------------------------------------------------------------------------------

    const index = nQuerschnittSets - 1;

    querschnittset[index].name = name;
    querschnittset[index].id = id;
    (querschnittset[index] as TQuerschnittRechteck).emodul = emodul;
    (querschnittset[index] as TQuerschnittRechteck).Iy = Iy;
    (querschnittset[index] as TQuerschnittRechteck).area = area;
    (querschnittset[index] as TQuerschnittRechteck).height = height;
    (querschnittset[index] as TQuerschnittRechteck).width = width;
    (querschnittset[index] as TQuerschnittRechteck).definedQuerschnitt = definedQuerschnitt;
    (querschnittset[index] as TQuerschnittRechteck).wichte = wichte;
    (querschnittset[index] as TQuerschnittRechteck).schubfaktor = schubfaktor;
    (querschnittset[index] as TQuerschnittRechteck).querdehnzahl = querdehnzahl;
    (querschnittset[index] as TQuerschnittRechteck).zso = zso;
    (querschnittset[index] as TQuerschnittRechteck).alphaT = alphaT;

    (querschnittset[index] as TQuerschnittRechteck).flanschbreite = flanschbreite;
    (querschnittset[index] as TQuerschnittRechteck).flanschhoehe = flanschhoehe;
    (querschnittset[index] as TQuerschnittRechteck).stegbreite_oben = stegbreite_oben;
    (querschnittset[index] as TQuerschnittRechteck).stegbreite_unten = stegbreite_unten;
    (querschnittset[index] as TQuerschnittRechteck).steghoehe = steghoehe;

    (querschnittset[index] as TQuerschnittRechteck).faktor_dehn = faktor_dehn;

    console.log("set_querschnittRechteck", index, emodul)
}


//---------------------------------------------------------------------------------------------------------------
export function update_querschnittRechteck(index: number, name: string, id: string, emodul: number, Iy: number, area: number,
    height: number, width: number, definedQuerschnitt: number, wichte: number, schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number,
    flanschbreite: number, flanschhoehe: number, stegbreite_oben: number, stegbreite_unten: number, steghoehe: number, faktor_dehn: number) {
    //-----------------------------------------------------------------------------------------------------------

    querschnittset[index].name = name;
    querschnittset[index].id = id;
    (querschnittset[index] as TQuerschnittRechteck).emodul = emodul;
    (querschnittset[index] as TQuerschnittRechteck).Iy = Iy;
    (querschnittset[index] as TQuerschnittRechteck).area = area;
    (querschnittset[index] as TQuerschnittRechteck).height = height;
    (querschnittset[index] as TQuerschnittRechteck).width = width;
    (querschnittset[index] as TQuerschnittRechteck).definedQuerschnitt = definedQuerschnitt;
    (querschnittset[index] as TQuerschnittRechteck).wichte = wichte;
    (querschnittset[index] as TQuerschnittRechteck).schubfaktor = schubfaktor;
    (querschnittset[index] as TQuerschnittRechteck).querdehnzahl = querdehnzahl;
    (querschnittset[index] as TQuerschnittRechteck).zso = zso;
    (querschnittset[index] as TQuerschnittRechteck).alphaT = alphaT;
    (querschnittset[index] as TQuerschnittRechteck).faktor_dehn = faktor_dehn;

    (querschnittset[index] as TQuerschnittRechteck).flanschbreite = flanschbreite;
    (querschnittset[index] as TQuerschnittRechteck).flanschhoehe = flanschhoehe;
    (querschnittset[index] as TQuerschnittRechteck).stegbreite_oben = stegbreite_oben;
    (querschnittset[index] as TQuerschnittRechteck).stegbreite_unten = stegbreite_unten;
    (querschnittset[index] as TQuerschnittRechteck).steghoehe = steghoehe;

    console.log("update_querschnittRechteck", index, emodul)
}

//---------------------------------------------------------------------------------------------------------------
export function get_querschnittRechteck(index: number) {
    //-----------------------------------------------------------------------------------------------------------

    let name: string, id: string, emodul: number, Iy: number, area: number, height: number, width: number, definedQuerschnitt: number, wichte: number
    let schubfaktor: number, querdehnzahl: number, zso: number, alphaT: number
    let flanschbreite: number, flanschhoehe: number, stegbreite_oben: number, stegbreite_unten: number, steghoehe: number, faktor_dehn: number

    console.log("index", index)
    name = querschnittset[index].name;
    emodul = querschnittset[index].emodul;
    Iy = querschnittset[index].Iy;
    area = querschnittset[index].area;
    height = querschnittset[index].height;
    width = querschnittset[index].width;
    id = querschnittset[index].id;
    definedQuerschnitt = querschnittset[index].definedQuerschnitt;
    wichte = querschnittset[index].wichte;
    schubfaktor = querschnittset[index].schubfaktor;
    querdehnzahl = querschnittset[index].querdehnzahl;
    zso = querschnittset[index].zso;
    alphaT = querschnittset[index].alphaT;
    faktor_dehn = querschnittset[index].faktor_dehn;
    flanschbreite = (querschnittset[index] as TQuerschnittRechteck).flanschbreite
    flanschhoehe = (querschnittset[index] as TQuerschnittRechteck).flanschhoehe
    stegbreite_oben = (querschnittset[index] as TQuerschnittRechteck).stegbreite_oben
    stegbreite_unten = (querschnittset[index] as TQuerschnittRechteck).stegbreite_unten
    steghoehe = (querschnittset[index] as TQuerschnittRechteck).steghoehe;

    console.log("get_querschnittRechteck", index, emodul)

    return [name, id, emodul, Iy, area, height, width, definedQuerschnitt, wichte, schubfaktor, querdehnzahl, zso, alphaT,
        flanschbreite, flanschhoehe, stegbreite_oben, stegbreite_unten, steghoehe, faktor_dehn]
}


//---------------------------------------------------------------------------------------------------------------
export function add_rechteck_querschnitt(werte: any[]) {
    //-----------------------------------------------------------------------------------------------------------
    // Diese Methode darf nur von dateien.ts beim Einlesen aus Datei verwendet werden

    console.log('add_rechteck_querschnitt wert', werte)

    let flanschbreite = 0, flanschhoehe = 0, stegbreite_oben = 0, stegbreite_unten = 0, steghoehe = 0, faktor_dehn = 1.0;

    incr_querschnittSets();

    const qname = werte[0]
    const id = werte[1]
    const emodul = werte[2]
    const Iy = werte[3]
    const area = werte[4]
    const height = werte[5]
    const width = werte[6]
    const defquerschnitt = werte[7]
    const wichte = werte[8]
    const schubfaktor = werte[9]
    const querdehnzahl = werte[10]
    const zso = werte[11]
    const alphaT = werte[12]

    if (werte.length >= 18) {
        flanschbreite = werte[13]
        flanschhoehe = werte[14]
        stegbreite_oben = werte[15]
        stegbreite_unten = werte[16]
        steghoehe = werte[17]
    }
    if (werte.length >= 19) {
        faktor_dehn = werte[18]
    }

    set_querschnittRechteck(
        qname,
        id,
        emodul,
        Iy,
        area,
        height,
        width,
        defquerschnitt,
        wichte,
        schubfaktor,
        querdehnzahl,
        zso,
        alphaT,
        flanschbreite, flanschhoehe, stegbreite_oben, stegbreite_unten, steghoehe,
        faktor_dehn
    );

    add_new_cross_section(qname, id);

    // var tag = document.createElement('sl-tree-item');
    // var text = document.createTextNode(qname);
    // tag.appendChild(text);
    // tag.addEventListener('click', opendialog);
    // tag.addEventListener("contextmenu", contextmenu_querschnitt);

    // tag.id = id;
    // var element = document.getElementById('id_tree_LQ');
    // element?.appendChild(tag);
    // //console.log('child appendchild', element);

    // const ele = document.getElementById('id_element_tabelle');
    // //console.log('ELE: >>', ele);
    // ele?.setAttribute('add_new_option', '4');

}
