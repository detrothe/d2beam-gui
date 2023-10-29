import styles from './dr-tabelle.css?raw';

import { nQuerschnittSets, get_querschnittRechteck_name } from '../pages/rechnen';
import { Detect } from '../pages/haupt';

//import { show_contextMenu, toggleMenuOff } from '../pages/contextMenu.js';

const contextMenuLinkClassName = "context-menu__link";
const contextMenuActive = "context-menu--active";

const taskItemClassName = "tabellen";   // tasks  tabelle
let taskItemInContext;

let clickCoords;
let clickCoordsX;
let clickCoordsY;

const menu = document.querySelector("#context-menu") as any;

let menuState = 0;
let menuWidth;
let menuHeight;

let windowWidth;
let windowHeight;


//----------------------------------------------------------------------------------------------
function toggleMenuOn() {
   //------------------------------------------------------------------------------------------
   //console.log("toggleMenuOn", menuState);
   if (menuState !== 1) {
      menuState = 1;
      menu?.classList.add(contextMenuActive);
      menu?.focus();
   }
}

//----------------------------------------------------------------------------------------------
export function toggleMenuOff() {
   //------------------------------------------------------------------------------------------
   if (menuState !== 0) {
      menuState = 0;
      menu?.classList.remove(contextMenuActive);
   }
}



//----------------------------------------------------------------------------------------------
function getPosition(e: any) {
   //------------------------------------------------------------------------------------------
   let posx = 0;
   let posy = 0;

   //if (!e) var e = window.event;

   if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
   } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
   }

   //console.log("getPosition", posx, posy)

   return {
      x: posx,
      y: posy
   }
}

//----------------------------------------------------------------------------------------------
function positionMenu(e: any) {
   //------------------------------------------------------------------------------------------

   //console.log("positionMenu", e.pageX, e.pageY);

   clickCoords = getPosition(e);
   clickCoordsX = clickCoords.x;
   clickCoordsY = clickCoords.y;

   menuWidth = menu.offsetWidth + 4;
   menuHeight = menu.offsetHeight + 4;

   windowWidth = document.documentElement.clientWidth;   //window.innerWidth;
   windowHeight = document.documentElement.clientHeight; //window.innerHeight;

   if ((e.pageX + menuWidth) > windowWidth) {
      menu.style.left = e.pageX - menuWidth + "px";
   } else {
      //menu.style.left = clickCoordsX + "px";
      menu.style.left = e.pageX + "px";
   }


   if ((e.pageY + menuHeight) > windowHeight) {
      menu.style.top = e.pageY - menuHeight + "px";
   } else {
      //menu.style.top = clickCoordsY + "px";
      menu.style.top = e.pageY + "px";
   }
}

//______________________________________________________________________________________________________
//______________________________________________________________________________________________________ DrTabelle
//______________________________________________________________________________________________________

// <hello-world> Web Component
class DrTabelle extends HTMLElement {
   shadow: any = null;

   ref_listener: any = null;

   nZeilen = 2;
   nSpalten = 2;

   columns: any = [];
   typs: any = [];
   colWidth: any = [];
   colText = '';

   nTabRow = 3; // immert 1 mehr, da Zeile, Spalte mit 0 beginnt
   nTabCol = 3;

   cellWidth = 0;
   cellHeight = 0;
   cellRow = 0;
   cellCol = 0;
   cellTop = 0;
   cellLeft = 0;
   //cellRight = 0;
   //cellBottom = 0;
   cellId: string = '';
   offsetX: number = 0;
   offsetY: number = 0;
   selected: boolean = false;

   tableRoot: any;

   tableId = null;
   isSelected = false;
   selectedCellRow = -1;
   selectedCellCol = -1;
   col = -1;
   row = -1;
   wert = 0;
   activatedElement = null;
   //selColY= []
   //selColZ= []
   startRowIndex = 0;
   startColIndex = 0;

   firstRowIndex = 0;
   firstColIndex = 0;
   firtstWert = ''

   pointerIsDown = false;
   startx = 0;
   starty = 0;
   zelle = null;
   //nZeilen = 0
   //nSpalten = 0
   selectionMode = false;

   cellsLeft: number[] = [];
   cellsWidth: number[] = [];
   /*
   connectedCallback() {
      this.textContent = 'Hello, World!';
   }
  */
   //---------------------------------------------------------------------------------------------------------------
   connectedCallback() {
      //------------------------------------------------------------------------------------------------------------

      //console.log('connectedCallback  Custom square element added to page.');

      //console.log('columns', this.columns);

      //console.log("-----------nQuerschnittSets--------------", nQuerschnittSets);

      //document.getElementById("context-menu")?.addEventListener('click', this.contextMenuClicked.bind(this));

      const table = document.createElement('table');
      this.shadow.appendChild(table);
      table.id = 'mytable';
      table.addEventListener('mousemove', this.POINTER_MOVE.bind(this));    // , {capture:true}
      table.addEventListener('pointerleave', this.POINTER_LEAVE.bind(this));
      table.addEventListener('pointerup', this.POINTER_UP.bind(this));

      table.addEventListener("contextmenu", e => e.preventDefault());

      let thead = table.createTHead();
      //console.log('thead', thead);
      let row = thead.insertRow();
      for (let i = 0; i < this.nTabCol; i++) {
         if (table.tHead) {
            const th0 = table.tHead.appendChild(document.createElement('th'));
            th0.innerHTML = this.columns[i];
            //th0.title = "Elementnummer"
            th0.style.padding = '5px';
            th0.style.margin = '0px';
            th0.style.textAlign = 'center';
            //th0.setAttribute('title', 'Hilfe')
            row.appendChild(th0);
         }
      }

      let id_table = 'idtable';

      let tbody = table.createTBody();
      //      tbody.addEventListener('mousemove', this.POINTER_MOVE);

      for (let iZeile = 1; iZeile < this.nTabRow; iZeile++) {
         let newRow = tbody.insertRow(-1);

         for (let iSpalte = 0; iSpalte < this.nTabCol; iSpalte++) {
            //this.columns.length
            // columns.length

            let newCell, newText;
            if (iSpalte === 0) {
               newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
               newText = document.createTextNode(String(iZeile)); // Append a text node to the cell
               newCell.style.textAlign = 'center';
               //   >>> newCell.style.backgroundColor = color_table_in   //'#b3ae00'   //'rgb(150,180, 180)';
               newCell.style.padding = '0px';
               newCell.style.margin = '0px';
               newCell.appendChild(newText);
               //newCell.setAttribute('title', 'Knotennummer')
            } else {
               //console.log('this.typs', '|' + this.typs[iSpalte] + '|');
               let el;
               if (this.typs[iSpalte] === 'select') {
                  el = document.createElement('select');
                  el.style.width = '100%';   // 100px
                  console.log('CREATED SELECT');
                  for (let i = 0; i < nQuerschnittSets; i++) {
                     let option = document.createElement('option');

                     option.value = option.textContent = 'Querschnitt lang ' + (i + 1);

                     el.appendChild(option);
                  }
               } else {
                  el = document.createElement('input');
                  if (this.typs[iSpalte] === "text") {
                     el.setAttribute('type', 'text');
                  } else {
                     el.setAttribute('type', 'number');
                  }
                  el.style.width = 'inherit'; //'6em';   // 100px
               }

               //el.style.backgroundColor = 'rgb(200,200,200)';
               el.style.border = 'none';
               el.style.borderWidth = '0px';
               el.style.padding = '5px';
               el.style.margin = '0px';
               el.style.borderRadius = '0px';

               const str = id_table + '-' + iZeile + '-' + iSpalte;
               el.id = str;
               //el.value = str;
               //el.className = 'input_normal';
               el.addEventListener('keydown', this.KEYDOWN.bind(this));
               //el.addEventListener("change", function () { berechnungErforderlich(true); });

               newCell = newRow.insertCell();
               if (this.colWidth.length === 0) newCell.style.width = '6em';
               else newCell.style.width = this.colWidth[Math.min(iSpalte, this.colWidth.length - 1)] + 'em';

               newCell.style.border = 'solid';
               newCell.style.borderWidth = '1px';
               newCell.style.padding = '0px';
               newCell.style.margin = '0px';
               newCell.style.backgroundColor = 'rgb(200,200,200)';
               newCell.style.touchAction = 'auto';
               const str1 = id_table + 'Cell-' + iZeile + '-' + iSpalte;
               newCell.id = str1;
               newCell.className = 'input_normal';

               newCell.appendChild(el);

               //if (this.typs[iSpalte] === 'select') el.addEventListener('click', this.SELECT.bind(this));
               //else
               el.addEventListener('pointerdown', this.POINTER_DOWN.bind(this));
               //el.addEventListener('touchmove', this.TOUCH_MOVE.bind(this));


               //el.addEventListener('mousemove', this.POINTER_MOVE);
               //console.log("el.addEventlistener", el)
               //TODO el.addEventListener('pointermove', this.POINTER_MOVE);
               //console.log("rect", iZeile, iSpalte, el.getBoundingClientRect().x, newCell.getBoundingClientRect().y, newCell.getBoundingClientRect().width, newCell.getBoundingClientRect().height)
            }
         }
      }

      this.cellsLeft = Array(this.nTabCol);
      this.cellsWidth = Array(this.nTabCol);
   }

   //---------------------------------------------------------------------------------------------------------------
   disconnectedCallback() {
      //------------------------------------------------------------------------------------------------------------
      //console.log('Custom square element removed from page.');
   }

   //---------------------------------------------------------------------------------------------------------------
   adoptedCallback() {
      //------------------------------------------------------------------------------------------------------------
      //console.log('Custom square element moved to new page.');
   }

   //---------------------------------------------------------------------------------------------------------------
   attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      //------------------------------------------------------------------------------------------------------------
      //console.log('Custom square element attributes changed.', name, oldValue, newValue);

      if (name === 'add_new_option') {
         this.add_new_select_option();

      } else if (name === 'namechanged') {
         this.update_select_options_name(Number(newValue));

      } else if (name === 'clear') {
         this.clear_Tabelle('mytable');

      } else if (oldValue === null) {                         // Initialisierungsphase
         //console.log('1', newValue.length);
         if (name === 'columns') {
            let myValue = newValue.replace('[', '');
            const lastIndex = myValue.lastIndexOf(']');
            myValue = myValue.slice(0, lastIndex);
            //console.log('myValue', myValue);
            const myArray = myValue.split(',');
            //console.log('myArray', myArray[0], myArray[1], myArray[2]);
            for (let i = 0; i < myArray.length; i++) {
               this.columns[i] = myArray[i].replace(/"/g, '').trim();
            }

            //console.log('-- columns', this.columns[0], this.columns[1], this.columns[2], this.columns[3], this.columns[4], this.columns[5]);

         } else if (name === 'typs') {
            let myValue = newValue.replace('[', '');
            const lastIndex = myValue.lastIndexOf(']');
            myValue = myValue.slice(0, lastIndex);
            //console.log('myValue', myValue);
            const myArray = myValue.split(',');
            //console.log('myArray', myArray[0], myArray[1], myArray[2]);
            let str = ''
            for (let i = 0; i < myArray.length; i++) {
               this.typs[i] = myArray[i].replace(/"/g, '').trim();
               str = str + this.typs[i]
            }
            console.log("str", str)

         } else if (name === 'colwidth') {
            let myValue = newValue.replace('[', '');
            const lastIndex = myValue.lastIndexOf(']');
            myValue = myValue.slice(0, lastIndex);
            const myArray = myValue.split(',');
            console.log("°°°°°°°°°°°°°°°° colwidth", myValue, myArray.length, myArray)
            for (let i = 0; i < myArray.length; i++) {
               this.colWidth[i] = myArray[i].replace(/"/g, '').trim();
            }
         } else if (name === 'coltext') {
            this.colText = newValue;

         } else if (name === 'nzeilen') {
            this.nZeilen = newValue;
            //console.log('typeof', typeof (this.nZeilen | 0));
            this.nTabRow = Number(this.nZeilen) + 1; // immert 1 mehr, da Zeile, Spalte mit 0 beginnt
            //console.log('#### name=', name, this.nTabRow);
         } else if (name === 'nspalten') {
            this.nSpalten = newValue;
            this.nTabCol = Number(this.nSpalten) + 1; // immert 1 mehr, da Zeile, Spalte mit 0 beginnt
            //console.log('#### name=', name, this.nTabCol);
         }
      } else {
         if (name === 'nzeilen') {
            this.nZeilen = newValue;
            this.nTabRow = Number(this.nZeilen) + 1; // immert 1 mehr, da Zeile, Spalte mit 0 beginnt
            this.resize_Tabelle('mytable', newValue, this.nSpalten);
         } else if (name === 'nspalten') {
            this.nSpalten = newValue;
            this.nTabCol = Number(this.nSpalten) + 1; // immert 1 mehr, da Zeile, Spalte mit 0 beginnt
            this.resize_Tabelle('mytable', this.nZeilen, newValue);
         }
      }
   }

   //---------------------------------------------------------------------------------------------------------------
   static get observedAttributes() {
      //------------------------------------------------------------------------------------------------------------
      return ['nzeilen', 'nspalten', 'columns', 'typs', 'add_new_option', 'namechanged', 'clear', 'colwidth', 'coltext'];
   }

   //---------------------------------------------------------------------------------------------------------------
   set neueZeilen(n: any) {
      //------------------------------------------------------------------------------------------------------------
      console.log('in neueZeilen', n);
      this.nZeilen = n;
   }
   /*
      test() {  // kann nicht aufgerufen werden, leider
         console.log("IN T E S T #######################################")
      }
   */
   //---------------------------------------------------------------------------------------------------------------
   add_new_select_option() {
      //------------------------------------------------------------------------------------------------------------
      console.log('in add_new_select_option');

      const table = this.shadow.getElementById('mytable') as HTMLTableElement;

      console.log(" TEST this.nZeilen", this.nZeilen)
      for (let iZeile = 1; iZeile <= this.nZeilen; iZeile++) {
         // Spalten addieren
         let row = table.rows.item(iZeile);
         if (row) {
            //console.log("row", row);
            for (let iSpalte = 1; iSpalte <= this.nSpalten; iSpalte++) {

               if (this.typs[iSpalte] === 'select') {
                  const idstr = 'idtable-' + iZeile + '-' + iSpalte;
                  const el = this.shadow.getElementById(idstr)
                  //console.log("idstr", el)
                  const index = nQuerschnittSets - 1;
                  let option = document.createElement('option');

                  option.value = option.textContent = get_querschnittRechteck_name(index);

                  el.appendChild(option);
               }
            }
         }
      }
   }


   //---------------------------------------------------------------------------------------------------------------
   update_select_options_name(index: number) {
      //------------------------------------------------------------------------------------------------------------
      //console.log('in update_select_options_name', get_querschnittRechteck_name(index));

      const table = this.shadow.getElementById('mytable') as HTMLTableElement;

      for (let iZeile = 1; iZeile <= this.nZeilen; iZeile++) {
         // Spalten addieren
         let row = table.rows.item(iZeile);
         if (row) {
            //console.log("row", row);
            for (let iSpalte = 1; iSpalte <= this.nSpalten; iSpalte++) {

               if (this.typs[iSpalte] === 'select') {
                  const idstr = 'idtable-' + iZeile + '-' + iSpalte;
                  const el = this.shadow.getElementById(idstr)
                  //console.log("idstr", el.children)
                  for (let i = 0; i < el.children.length; i++) {
                     console.log("i", i, el.children.item(i))
                     if (i === index) {
                        el.children.item(i).innerHTML = get_querschnittRechteck_name(index);
                        el.children.item(i).value = get_querschnittRechteck_name(index);
                     }
                  }

               }
            }
         }
      }
   }


   //---------------------------------------------------------------------------------------------------------------
   clear_Tabelle(idTable: any) {
      //------------------------------------------------------------------------------------------------------------
      console.info('in clear_Tabelle');

      const table = this.shadow.getElementById(idTable) as HTMLTableElement;
      console.log('spalten', table);
      let nZeilen = table.rows.length
      let nSpalten = table.rows[0].cells.length

      for (let iZeile = 1; iZeile < nZeilen; iZeile++) {

         for (let iSpalte = 1; iSpalte < nSpalten; iSpalte++) {
            let child = table.rows[iZeile].cells[iSpalte].firstElementChild as HTMLInputElement;
            child.value = "";
            if (this.typs[iSpalte] === 'select') {
               const idstr = 'idtable-' + iZeile + '-' + iSpalte;
               const el = this.shadow.getElementById(idstr)
               //console.log("idstr", el)
               //const index = nQuerschnittSets - 1;
               //let option = document.createElement('option');

               //option.value = option.textContent = get_querschnittRechteck_name(index);
               for (let i = 0; i < nQuerschnittSets; i++) el.removeChild(el.lastChild);
            }
         }
      }

   }

   //---------------------------------------------------------------------------------------------------------------
   unselect_Tabelle() {
      //------------------------------------------------------------------------------------------------------------
      console.info('in unselect_Tabelle');

      const tabelle = this.shadow.getElementById('mytable') as any;
      const nZeilen = this.nZeilen;
      const nSpalten = this.nSpalten;

      for (let i = 1; i <= nZeilen; i++) {
         for (let j = 1; j <= nSpalten; j++) {
            if (tabelle !== null) tabelle.rows[i].cells[j].firstElementChild.className = 'input_normal';
         }
      }

   }

   //---------------------------------------------------------------------------------------------------------------
   resize_Tabelle(idTable: any, nRowNew: number, nColNew: number) {
      //------------------------------------------------------------------------------------------------------------
      let id_table = 'idtable';

      console.info('in resize', idTable);

      const table = this.shadow.getElementById(idTable) as HTMLTableElement;
      console.log('spalten', table);
      let nZeilen = table.rows.length - 1; // header abziehen
      let nSpalten = table.rows[0].cells.length - 1;

      //TODO const tableIndex = table_index(idTable);
      //tableInfo[tableIndex].nZeilen = nRowNew;
      //tableInfo[tableIndex].nSpalten = nColNew + 1;

      console.log('nRowNew', nRowNew, nColNew, nZeilen, nSpalten);

      if (nSpalten > nColNew) {
         for (let i = 1; i <= nSpalten - nColNew; i++) {
            // Spalten löschen  nZeilen - nRowNew
            for (let j = 0; j <= nZeilen; j++) {
               let row = table.rows.item(j);
               if (row) row.deleteCell(-1);
            }
         }
      }
      if (nZeilen > nRowNew) {
         for (let i = 1; i <= nZeilen - nRowNew; i++) {
            table.deleteRow(-1);
            //console.log("selRow",selectedCellPoly.selRow);
            //selectedCellPoly.selColY.length -= 1;
            //selectedCellPoly.selColZ.length -= 1;
         }
      }

      if (nColNew > nSpalten) {
         // nicht getestet, da hier nicht gebraucht

         for (let iZeile = 0; iZeile <= nZeilen; iZeile++) {
            // Spalten addieren
            let row = table.rows.item(iZeile);
            if (row) {
               //console.log("row",row);
               for (let iSpalte = nSpalten + 1; iSpalte <= nColNew; iSpalte++) {
                  // nZeilen + 1; j <= nRowNew

                  const newCell = row.insertCell(-1);
                  let newText;
                  if (iSpalte === 0) {
                     //newCell = newRow.insertCell(iSpalte);  // Insert a cell in the row at index 0
                     newText = document.createTextNode(String(iZeile)); // Append a text node to the cell
                     newCell.style.textAlign = 'center';
                     //TODO newCell.style.backgroundColor = color_table_in; //'#b3ae00'  //'rgb(150,180, 180)';
                     newCell.style.padding = '0px';
                     newCell.style.margin = '0px';
                     newCell.appendChild(newText);
                  } else {
                     if (iZeile === 0) {
                        console.log("THEAD", table.rows.item(0)?.childElementCount)
                        /*
                                                const th0 = table.tHead?.appendChild(document.createElement('th')) as any;
                                                th0.innerHTML = "Test";
                                                th0.style.padding = '5px';
                                                th0.style.margin = '0px';
                                                th0.style.textAlign = 'center';
                                                row.appendChild(th0);
                                                */
                        newCell.innerHTML = '<b>' + this.colText + ' ' + (iSpalte - 1) + '</b>';
                        //th0.title = "Elementnummer"
                        newCell.style.padding = '5px';
                        newCell.style.margin = '0px';
                        newCell.style.textAlign = 'center';
                        //th0.setAttribute('title', 'Hilfe')
                        //row.appendChild(newCell);

                     }
                     else {


                        let el = document.createElement('input');
                        el.setAttribute('type', 'number');
                        el.style.width = 'inherit'; //'6em';
                        //el.style.backgroundColor = 'rgb(200,200,200)';
                        el.style.border = 'none';
                        el.style.borderWidth = '0px';
                        el.style.padding = '5px';
                        el.style.margin = '0px';
                        el.style.borderRadius = '0px';
                        const str = id_table + '-' + iZeile + '-' + iSpalte;
                        el.id = str;
                        el.className = 'input_normal';
                        el.addEventListener('keydown', this.KEYDOWN.bind(this));

                        //newCell.style.width = '6em';
                        //console.log("§§§§§§§§§ colwidth",this.colWidth.length,this.colWidth[this.colWidth.length-1])
                        if (this.colWidth.length === 0) newCell.style.width = '6em';
                        else newCell.style.width = this.colWidth[this.colWidth.length - 1] + 'em';

                        newCell.style.border = 'solid';
                        newCell.style.borderWidth = '1px';
                        newCell.style.padding = '0px';
                        newCell.style.margin = '0px';
                        newCell.style.backgroundColor = 'rgb(200,200,200)';
                        newCell.style.touchAction = 'auto';
                        const str1 = id_table + 'Cell-' + iZeile + '-' + iSpalte;
                        newCell.id = str1;
                        newCell.className = 'input_normal';

                        newCell.appendChild(el);
                        // el.addEventListener("pointermove", POINTERMOVE);
                        el.addEventListener('pointerdown', this.POINTER_DOWN.bind(this));
                     }
                  }
               }
            }
         }
      }

      if (nRowNew > nZeilen) {
         //const material_equal = document.getElementById(
         //  'material_equal'
         //) as HTMLInputElement | null;
         //console.log("in setMaterialEqual, nRowNew > nZeilen", nColNew, material_equal.checked);

         for (let iZeile = nZeilen + 1; iZeile <= nRowNew; iZeile++) {
            //selectedCellPoly.selColY.push(false);
            //selectedCellPoly.selColZ.push(false);

            // Insert a row at the end of the table
            let newRow = table.insertRow(-1);

            for (let iSpalte = 0; iSpalte <= nColNew; iSpalte++) {
               let newCell, newText;
               if (iSpalte === 0) {
                  newCell = newRow.insertCell(iSpalte); // Insert a cell in the row at index 0
                  newText = document.createTextNode(String(iZeile)); // Append a text node to the cell
                  newCell.style.textAlign = 'center';
                  //TODO newCell.style.backgroundColor = color_table_in; //'#b3ae00'  //'rgb(150,180, 180)';
                  newCell.style.padding = '0px';
                  newCell.style.margin = '0px';
                  newCell.appendChild(newText);
               } else {
                  let el;
                  if (this.typs[iSpalte] === 'select') {
                     el = document.createElement('select');
                     el.style.width = '100%';   // 100px
                     console.log('CREATED SELECT');
                     for (let i = 0; i < nQuerschnittSets; i++) {
                        let option = document.createElement('option');

                        option.value = option.textContent = get_querschnittRechteck_name(i);;

                        el.appendChild(option);
                     }
                     //el.style.width = 'inherit'; //'6em';
                  } else {
                     el = document.createElement('input');
                     el.setAttribute('type', 'number');
                     el.style.width = 'inherit'; //'6em';
                  }

                  el.style.border = 'none';
                  el.style.borderWidth = '0px';
                  el.style.padding = '5px';
                  el.style.margin = '0px';
                  el.style.borderRadius = '0px';
                  const str = id_table + '-' + iZeile + '-' + iSpalte;
                  el.id = str;
                  //el.className = 'input_normal';
                  el.addEventListener('keydown', this.KEYDOWN.bind(this));

                  newCell = newRow.insertCell();
                  //newCell.style.width = '6em';
                  // if (this.colWidth.length === 0) newCell.style.width = '6em';
                  // else newCell.style.width = this.colWidth[iSpalte] + 'em';
                  // if (this.colWidth.length === 0) newCell.style.width = '6em';
                  // else newCell.style.width = this.colWidth[this.colWidth.length - 1] + 'em';
                  if (this.colWidth.length === 0) newCell.style.width = '6em';
                  else if (iSpalte < this.colWidth.length) {
                     newCell.style.width = this.colWidth[iSpalte] + 'em';
                  } else {
                     newCell.style.width = this.colWidth[this.colWidth.length - 1] + 'em';
                  }
                  newCell.style.border = 'solid';
                  newCell.style.borderWidth = '1px';
                  newCell.style.padding = '0px';
                  newCell.style.margin = '0px';
                  newCell.style.backgroundColor = 'rgb(200,200,200)';
                  newCell.style.touchAction = 'auto';
                  const str1 = id_table + 'Cell-' + iZeile + '-' + iSpalte;
                  newCell.id = str1;
                  newCell.className = 'input_normal';

                  newCell.appendChild(el);
                  el.addEventListener('pointerdown', this.POINTER_DOWN.bind(this));
                  //el.addEventListener('mousemove', this.POINTER_MOVE);
               }
            }
         }
      }

      this.nSpalten = nColNew
      this.nZeilen = nRowNew
      this.nTabRow = +this.nZeilen + 1
      this.nTabCol = +this.nSpalten + 1
   }

   //----------------------------------------------------------------------------------------
   constructor() {
      //----------------------------------------------------------------------------------------
      super();

      // defaults
      //console.log('shadowroot ', this.shadowRoot);

      // attach shadow DOM
      this.shadow = this.attachShadow({ mode: 'open' });
      //console.log('shadow ', this.shadow);

      const stylesheet = new CSSStyleSheet();
      stylesheet.replace(styles);
      this.shadow.adoptedStyleSheets = [stylesheet];


      //console.log('im constructor -------------------------------------------------');

      //console.log('FINAL shadowroot ', this.shadowRoot);
   }

   //------------------------------------------------------------------------------------------------
   KEYDOWN(ev: any) {
      //--------------------------------------------------------------------------------------------

      console.log(
         'KEYDOWN, keycode, id_input, id_tabelle',
         ev.keyCode,
         ev.target.id,
         ev.target.offsetParent.offsetParent.id,
         ev.target.type
      );
      //const tableCellId = ev.target.offsetParent.id;

      console.log('KEYDOWN', ev.keyCode, ev.shiftKey, ev.key, ev);
      //infoBox.innerHTML += "<br>key= " + ev.key + "  | keyCode= " + ev.keyCode

      //ev.target.style.backgroundColor = 'rgb(210,00,00)';

      if (ev.shiftKey) {
         ev.preventDefault();
         return;
      }

      if (ev.keyCode === 13) {  // return-Taste
         ev.preventDefault();
         const inputId = ev.target.id;
         const myArray = inputId.split('-');
         console.log('RETURN Taste in Zelle', myArray.length, myArray[0], myArray[1], myArray[2], this.nTabRow);
         let zeile = +myArray[1] + 1;
         console.log("zeile", zeile, this.nTabRow)
         if (zeile < this.nTabRow) {
            console.log("springe jetzt in Zeile ", zeile)
            let spalte: number;
            if (this.typs[1] === 'select') {
               spalte = 2;                        // select option bisher nur in Spalte 1
            } else spalte = 1;
            let str = 'idtable-' + zeile + '-' + spalte;
            const elemNeu = this.shadow.getElementById(str) as HTMLInputElement;
            console.log("elemNeu", str, elemNeu)
            //elemNeu.innerText = "";
            elemNeu.focus();
            const evt = new Event("mousedown", { "bubbles": true, "cancelable": false }) as any;
            evt.button = 0;     // linke Maustaste
            elemNeu.dispatchEvent(evt);
         }

      } else if (ev.key === 'ArrowDown' || ev.key === 'PageDown') {
         console.log("ArrowDown")
         ev.preventDefault();
         const inputId = ev.target.id;
         const myArray = inputId.split('-');
         //console.log('ArrowDown Taste in Zelle', myArray.length, myArray[0], myArray[1], myArray[2], inputId.selectionStart);
         let zeile = +myArray[1] + 1;
         //console.log("zeile", zeile, this.nTabRow)
         if (zeile < this.nTabRow) {
            console.log("springe jetzt in Zeile ", zeile)
            let spalte = myArray[2];
            let str = 'idtable-' + zeile + '-' + spalte;
            const elemNeu = this.shadow.getElementById(str) as HTMLInputElement;
            console.log("elemNeu", str, elemNeu)
            elemNeu.focus();
            const evt = new Event("mousedown", { "bubbles": true, "cancelable": false }) as any;
            evt.button = 0;     // linke Maustaste
            elemNeu.dispatchEvent(evt);
         }

      } else if (ev.key === 'ArrowUp' || ev.key === 'PageUp') {
         console.log("ArrowUp")
         ev.preventDefault();
         const inputId = ev.target.id;
         const myArray = inputId.split('-');
         //console.log('RETURN Taste in Zelle', myArray.length, myArray[0], myArray[1], myArray[2], this.nTabRow);
         let zeile = +myArray[1] - 1;
         //console.log("zeile", zeile, this.nTabRow)
         if (zeile > 0) {
            console.log("springe jetzt in Zeile ", zeile)
            let spalte = myArray[2];
            let str = 'idtable-' + zeile + '-' + spalte;
            const elemNeu = this.shadow.getElementById(str) as HTMLInputElement;
            console.log("elemNeu", str, elemNeu)
            elemNeu.focus();
            const evt = new Event("mousedown", { "bubbles": true, "cancelable": false }) as any;
            evt.button = 0;     // linke Maustaste
            elemNeu.dispatchEvent(evt);
         }

      }
      else if (ev.target.type === 'text') {
         return;
      }
      else {
         if (ev.keyCode > 47 && ev.keyCode < 58) return;                            // Ziffern 0-9
         if (ev.keyCode > 95 && ev.keyCode < 111) return;                           // Ziffern 0-9, +, - vom numpad
         if (ev.keyCode === 69 || ev.keyCode === 190 || ev.keyCode === 188) return; // e .  ,
         if (ev.keyCode === 8 || ev.keyCode === 46) return;                         //  del, entfernen
         if (ev.keyCode === 37 || ev.keyCode === 39 || ev.keyCode === 189) return;  // rechts links -
         if (ev.keyCode === 9 || ev.keyCode === 27) return;                         // Tab, ESC
         if (ev.keyCode === 173) return;                                            // - Zeichen bei Firefox
         if (ev.keyCode === 0) return;                                              // - Zeichen bei Android Firefox

         ev.preventDefault();
      }
   }


   //------------------------------------------------------------------------------------------------
   SELECT() {
      //---------------------------------------------------------------------------------------------
      console.log("---- SELECT ----")
   }

   //------------------------------------------------------------------------------------------------
   POINTER_UP(ev: any) {
      //---------------------------------------------------------------------------------------------
      console.log("---- POINTER_UP ----")

      if (this.selectionMode) this.show_contextMenu(ev);

      this.selectionMode = false;


   }

   //------------------------------------------------------------------------------------------------
   POINTER_LEAVE(ev: any) {
      //---------------------------------------------------------------------------------------------
      console.log("---- POINTER_LEAVE ----")
      if (!this.selectionMode) {
         ev.preventDefault();
         return;
      }

      this.selectionMode = false;
      this.unselect_Tabelle();

   }

   //------------------------------------------------------------------------------------------------
   TOUCH_MOVE(ev: any) {
      //---------------------------------------------------------------------------------------------

      // if (ev.target.hasPointerCapture(ev.pointerId)) {
      //    ev.target.releasePointerCapture(ev.pointerId);
      // }
      ev.preventDefault();
      //console.log('TOUCH MOVE', ev.target, ev.target.id, this.selectionMode);

      const text = ev.target?.id;
      if (text.length > 0) {
         let rowIndex: number, colIndex: number;

         let tabelle = ev.target.offsetParent.offsetParent;
         //console.log("TABELLE TOUCH MOVE",tabelle)

         const touch = ev.changedTouches[0];
         const actualTarget = document.elementFromPoint(touch.clientX, touch.clientY);
         //console.log("TOUCH MOVE", touch.clientX, touch.clientY)
         //console.log("actualTarget", actualTarget)


         let dy = touch.pageY - this.cellTop; // + document.documentElement.scrollTop;
         let zeile: number, spalte: number = 1
         let nx: number, ny: number, vorz: number, div: number

         div = dy / this.cellHeight
         vorz = Math.abs(div) / div
         ny = Math.trunc(Math.abs(div)) * vorz
         if (vorz < 0.0) ny = ny - 1
         //ny = Number(Math.trunc(dy / cellHeight))
         zeile = Number(this.startRowIndex) + 1 * ny
         console.log("Zeile=", zeile, div, dy, vorz, ny, touch.pageY, this.cellTop, this.cellHeight, this.startRowIndex)
         //console.log("::::", tableIndex, zeile, spalte)
         if (zeile > this.nZeilen) return;    //zeile = tableInfo[tableIndex].nZeilen
         if (zeile < 1) return;   // zeile = 1



         let left = touch.clientX;
         spalte = 1
         for (let ispalte = 1; ispalte < this.nTabCol; ispalte++) {
            if (left > this.cellsLeft[ispalte]) {
               // let input_id = 'idtable' + '-' + zeile + '-' + ispalte;
               // const el = this.shadow.getElementById(input_id) as HTMLInputElement;
               // el.className = 'input_select'
               // console.log("TOUCH MOVE", ispalte, this.cellLeft, left, this.cellsLeft[ispalte])
               spalte = ispalte
            }
         }

         {
            rowIndex = zeile;
            colIndex = spalte;
            // console.log("TOUCH MOVE rowIndex",rowIndex,colIndex,this.firstRowIndex,this.firstColIndex);
            if (rowIndex === this.firstRowIndex && colIndex === this.firstColIndex) { // Bewegung innerhalb erstgepickter Zelle
               return;
            }
            this.firstRowIndex = -1;

            let tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;  //ev.target.offsetParent.offsetParent;
            tabelle.rows[rowIndex].cells[colIndex].firstElementChild!.className = 'input_select';




            let rowStart: number, rowEnd: number, colStart: number, colEnd: number;

            if (rowIndex < this.startRowIndex) {
               rowStart = rowIndex;
               rowEnd = this.startRowIndex;
            } else {
               rowStart = this.startRowIndex;
               rowEnd = rowIndex;
            }

            if (colIndex < this.startColIndex) {
               colStart = colIndex;
               colEnd = this.startColIndex;
            } else {
               colStart = this.startColIndex;
               colEnd = colIndex;
            }

            //console.log("selected Block", rowStart, colStart, rowEnd, colEnd)

            //const tabelle = ev.target.offsetParent.offsetParent; //document.getElementById(tableId) as HTMLTableElement;
            const nZeilen = this.nZeilen;
            const nSpalten = this.nSpalten;

            for (let i = 1; i <= nZeilen; i++) {
               for (let j = 1; j <= nSpalten; j++) {
                  //console.log("i,j", tabelle.rows[i].cells[j].firstElementChild)
                  tabelle.rows[i].cells[j].firstElementChild!.className = 'input_normal';
               }
            }

            for (let i = rowStart; i <= rowEnd; i++) {
               for (let j = colStart; j <= colEnd; j++) {
                  tabelle.rows[i].cells[j].firstElementChild!.className = 'input_select';
               }
            }
         }


      }
   }
   //------------------------------------------------------------------------------------------------
   POINTER_DOWN(ev: any) {
      //---------------------------------------------------------------------------------------------

      const tableId = ev.target.offsetParent.offsetParent.id;
      const inputId = ev.target.id;

      console.log("INFO POINTER DOWN", inputId)
      //console.log('tableID', ev.target, ev.target.id, ev.currentTarget);
      //const tableIndex = table_index(tableId)

      //TODO selectedCellPoly.tableId = tableId;

      //TODO const selectMode = this.selectionMode
      //const selectMode = true;
      //TODO toggleMenuOff()
      //console.log("this.selectionMode", this.selectionMode)

      toggleMenuOff();

      if (this.cellsLeft.length !== this.nTabCol) {
         this.cellsLeft = Array(this.nTabCol);
         this.cellsWidth = Array(this.nTabCol);
      }

      for (let ispalte = 1; ispalte < this.nTabCol; ispalte++) {
         let input_id = 'idtable' + '-1' + '-' + ispalte;
         const el = this.shadow.getElementById(input_id) as HTMLInputElement;
         //console.log("getBoundingClientRect", ispalte, this.cellsLeft.length,this.nTabCol, el)
         let cellLeft = this.cellsLeft[ispalte] = el.getBoundingClientRect().x;
         let cellWidth = this.cellsWidth[ispalte] = el.getBoundingClientRect().width;

         //console.log("Zell Info", input_id, cellLeft, cellWidth)
      }
      //    if (ev.target.hasPointerCapture(ev.pointerId)) {
      // ev.target.releasePointerCapture(ev.pointerId);
      //   }
      //console.log("POINTERDOWN", ev)
      //console.log('POINTERDOWN', this.selectionMode, ev.button, tableId, inputId, ev.pageX, ev.pageY, ev.which, ev.pointerType);

      //infoBox.innerHTML += "<br>POINTERDOWN" + ' | ' + selectMode + ' | ' + ev.button + ' | ' + tableId + ' | ' + inputId + ' | ' + ev.pageX + ' | ' + ev.pageY + ' | ' + ev.which + ' | ' + ev.pointerType
      //const shadow = this.shadowRoot;
      //console.log('pointerdown THIS:', this);
      //if (shadow) {
      const myTable = ev.target.offsetParent.offsetParent as HTMLTableElement; //this.tableRoot.getElementById(tableId);
      //console.log('myTable:', myTable);

      //myTable.addEventListener('mousemove', this.POINTER_MOVE);
      if (this.selectionMode || ev.pointerType === 'mouse') {
         // bei Mouse immer select mode
         //      console.log('select Mode = true', this.id, this.shadow, this.shadowRoot);
         //const el=this.shadow.getElementById(this.id) as any
         //console.log("el",el)
         //   this.addEventListener('touchmove', this.TOUCH_MOVE.bind(this)); // , { passive: false }  , { capture: true }
         //TODO myTable.addEventListener("pointerup", POINTER_UP);
      }

      const myArray = inputId.split('-');
      console.log('Array', myArray.length, myArray[0], myArray[1], myArray[2]);
      //console.log("WERT=", ev.target.value)
      this.firtstWert = ev.target.value;

      this.firstRowIndex = Number(myArray[1]);
      this.firstColIndex = Number(myArray[2]);

      //this.offsetX = ev.pageX - ev.clientX;
      //this.offsetY = ev.pageY - ev.clientY;

      // this.cellLeft = el.getBoundingClientRect().x + this.offsetX;
      // this.cellTop = el.getBoundingClientRect().y + this.offsetY;
      // this.cellWidth = el.getBoundingClientRect().width;

      // this.cellId = myArray[0];
      // this.cellRow = myArray[1];
      // this.cellCol = myArray[2];
      // console.log('MEMORY', this.cellRow, this.cellCol, this.cellLeft, this.cellTop, this.cellWidth, this.cellHeight, this.offsetX, this.offsetY);
      if (ev.pointerType === 'touch' || ev.pointerType === 'pen') {
         this.addEventListener('touchmove', this.TOUCH_MOVE.bind(this)); // , { passive: false }  , { capture: true }
         this.selectionMode = true;

         this.offsetX = ev.pageX - ev.clientX
         this.offsetY = ev.pageY - ev.clientY

         const el = this.shadow.getElementById(inputId) as HTMLInputElement;
         this.cellLeft = el.getBoundingClientRect().x + this.offsetX
         this.cellTop = el.getBoundingClientRect().y + this.offsetY
         this.cellHeight = el.getBoundingClientRect().height;

         console.log("??????????? ", this.cellLeft, this.cellTop, this.cellHeight)
      }

      if (ev.which === 3) {                 // rechte Maustaste
         console.log('rechte Maustaste');
         // ev.preventDefault();
      }
      if (ev.button === 0 || ev.which === 3) {         // linke Maustaste

         this.selectionMode = true;

         console.log('linke Maustaste');

         this.startRowIndex = Number(myArray[1]);
         this.startColIndex = Number(myArray[2]);

      }
   }

   //------------------------------------------------------------------------------------------------
   POINTER_MOVE(ev: any) {
      //--------------------------------------------------------------------------------------------
      console.log('POINTER MOVE', ev.target.id, this.selectionMode);
      ev.preventDefault();

      if (!this.selectionMode) return;

      //console.log('POINTER MOVE ev', this);  // zeigt auf dr-table
      //console.log('tagname', ev.target.tagName);
      //console.log("POINTER MOVE vor prevent")

      //ev.preventDefault();

      if (ev.target.tagName !== 'INPUT') return;

      let rowIndex: number, colIndex: number;

      const tableId = ev.target.offsetParent.offsetParent.id;
      //console.log("tableId", tableId)
      if (tableId === '') return; // cursor steht auf irgendwas, aber nicht auf tag <input>

      const text = ev.target.id;
      if (text.length > 0) {
         const myArray = text.split("-");
         //console.log("Array", tableId, myArray.length, myArray[0], myArray[1], myArray[2])
         rowIndex = Number(myArray[1]);
         colIndex = Number(myArray[2]);

         if (rowIndex === this.firstRowIndex && colIndex === this.firstColIndex) { // Bewegung innerhalb erstgepickter Zelle
            return;
         }
         this.firstRowIndex = -1;

         let tabelle = ev.target.offsetParent.offsetParent;
         tabelle.rows[rowIndex].cells[colIndex].firstElementChild.className = 'input_select';


         // if (rowIndex > this.cellRight) this.cellRight = rowIndex;
         // else if (rowIndex < this.cellLeft) this.cellLeft = rowIndex;

         // if (colIndex > this.cellBottom) this.cellBottom = colIndex;
         // else if (colIndex < this.cellTop) this.cellTop = colIndex;

         let rowStart: number, rowEnd: number, colStart: number, colEnd: number;

         if (rowIndex < this.startRowIndex) {
            rowStart = rowIndex;
            rowEnd = this.startRowIndex;
         } else {
            rowStart = this.startRowIndex;
            rowEnd = rowIndex;
         }

         if (colIndex < this.startColIndex) {
            colStart = colIndex;
            colEnd = this.startColIndex;
         } else {
            colStart = this.startColIndex;
            colEnd = colIndex;
         }

         //console.log("selected Block", rowStart, colStart, rowEnd, colEnd)

         //const tabelle = ev.target.offsetParent.offsetParent; //document.getElementById(tableId) as HTMLTableElement;
         const nZeilen = this.nZeilen;
         const nSpalten = this.nSpalten;

         for (let i = 1; i <= nZeilen; i++) {
            for (let j = 1; j <= nSpalten; j++) {
               //console.log("i,j", tabelle.rows[i].cells[j].firstElementChild)
               tabelle.rows[i].cells[j].firstElementChild.className = 'input_normal';
            }
         }

         for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = colStart; j <= colEnd; j++) {
               tabelle.rows[i].cells[j].firstElementChild.className = 'input_select';
            }
         }

      }
      //    ev.preventDefault();

      // TODO const inputId = ev.target.id;

      //TODO selectedCellPoly.tableId = tableId;
      //const tableIndex = table_index(tableId);

      //console.log("POINTERMOVE", ev.buttons, ev.target.id, tableId)
      //console.log("MOVE ids", tableId, ev.target.id, ev.pointerId)
      //console.log("POINTER_MOVE pos", ev.pageX, ev.pageY, ev.clientX, ev.clientY, ev.pointerId, ev.target.id)

      // TODO const el = document.getElementById(inputId);
      //console.log("getBoundingClientRect", el.getBoundingClientRect().x, el.getBoundingClientRect().y);
      /*
      if (el.className !== 'input_select') {
          el.className = 'input_select';
          selected = true
      }
      */
      //console.log("rect", ev.pointerType, ev.clientX - el.getBoundingClientRect().x, ev.clientY - el.getBoundingClientRect().y, el.getBoundingClientRect().width, el.getBoundingClientRect().height)

      //infoBox.innerHTML += "<br>POINTER Move" + ' | ' + ev.pointerType + ' | ' + tableId + ' | ' + inputId

      // TODO Nconst browser = "Chrome"; //Detect.browser;

      //if (ev.pointerType === 'touch' || ev.pointerType === 'pen' || browser === 'Firefox') {
      /*
       {
         //console.log("scrollLeft", document.body.scrollLeft, document.documentElement.scrollLeft, window.pageXOffset)
         let dx = ev.pageX - this.cellLeft; // + document.documentElement.scrollLeft;
         let dy = ev.pageY - this.cellTop; // + document.documentElement.scrollTop;
         let zeile: number, spalte: number;
         let nx: number, ny: number, vorz: number, div: number;
         div = dx / this.cellWidth;
         vorz = Math.abs(div) / div;
         nx = Math.trunc(Math.abs(div)) * vorz;
         if (vorz < 0.0) nx = nx - 1;
         //console.log("div", dx, div, vorz, nx)
         div = dy / this.cellHeight;
         vorz = Math.abs(div) / div;
         ny = Math.trunc(Math.abs(div)) * vorz;
         if (vorz < 0.0) ny = ny - 1;
         //ny = Number(Math.trunc(dy / cellHeight))
         spalte = Number(this.cellCol) + 1 * nx; //if (dx > cellWidth)
         zeile = Number(this.cellRow) + 1 * ny;
         //console.log("::::", tableIndex, zeile, spalte)
         if (spalte > this.nSpalten - 1) return; //spalte = this.nSpalten
         if (zeile > this.nZeilen) return; //zeile = this.nZeilen
         if (spalte < 1) return; // spalte = 1
         if (zeile < 1) return; // zeile = 1
         console.log('nx', nx, this.cellCol, spalte);
         //if (dy > cellHeight) zeile++

         const str = this.cellId + '-' + zeile + '-' + spalte;
         //console.log("dx, dy", dx, dy, str)
         const el = document.getElementById(str);
         if (el) {
            el.className = 'input_select';
            //if (browser !== 'Firefox') {
            if (ev.pointerType === 'touch' || ev.pointerType === 'pen') {
               el.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center',
               }); // { behavior: "smooth", block: "end", inline: "nearest" }
            }
            //}
         }
         if (nx !== 0 || ny !== 0) this.selected = true;
         rowIndex = zeile;
         colIndex = spalte;
      }
      */

      /* else {
      const text = ev.target.id;
      const myArray = text.split("-");
      console.log("Array", tableId, tableIndex, myArray.length, myArray[0], myArray[1], myArray[2])
      rowIndex = myArray[1];
      colIndex = myArray[2];
      if (el.className !== 'input_select') {
          el.className = 'input_select';
          if ((selectedCellPoly.row !== rowIndex) || (selectedCellPoly.col !== colIndex)) selected = true
      }
  }*/


      //console.log("startend", rowStart, rowEnd, colStart, colEnd);

      const tabelle = ev.target.offsetParent.offsetParent; //document.getElementById(tableId) as HTMLTableElement;
      //console.log("tabelle", tabelle)
      //const nSpalten = tabelle.rows[0].cells.length - 1;
      const nZeilen = this.nZeilen;
      const nSpalten = this.nSpalten;

      // for (let i = 1; i <= nZeilen; i++) {
      //    for (let j = 1; j < nSpalten; j++) {
      //       //console.log("i,j", tabelle.rows[i].cells[j].firstElementChild)
      //       tabelle.rows[i].cells[j].firstElementChild.className = 'input_normal';
      //    }
      // }

      //console.log("rowStart...", rowStart, rowEnd, colStart, colEnd)
      // for (let i = rowStart; i <= rowEnd; i++) {
      //    for (let j = colStart; j <= colEnd; j++) {

      //       if (!tabelle.rows[i].cells[j].firstElementChild.hidden)
      //          tabelle.rows[i].cells[j].firstElementChild.className = 'input_select';
      //    }
      // }
   }


   //----------------------------------------------------------------------------------------------
   menuItemListener(link: any) {
      //-------------------------------------------------------------------------------------------
      console.log("LINK", link.getAttribute("data-action"))
      //console.log("Task ID - " + taskItemInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
      toggleMenuOff();

      if (link.getAttribute("data-action") === "copyFirst") {
         // Zellwert in zuletzt geklickter Zelle
         let row = this.startRowIndex;
         let col = this.startColIndex;

         const wert = this.firtstWert;
         console.log("copyFirst, wert=", wert, row, col);

         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         console.log("tabelle 1=", tabelle)
         const nZeilen = tabelle.rows.length;  // header abziehen
         const nSpalten = tabelle.rows[0].cells.length;
         //console.log("Tabelle", tabelle, nZeilen, nSpalten)

         let i, j;
         for (i = 1; i < nZeilen; i++) {
            for (j = 1; j < nSpalten; j++) {
               let child = tabelle.rows[i].cells[j].firstElementChild as any // input
               if (child.className === 'input_select') {
                  child.value = wert.toString();
               }
            }
         }
      } else if (link.getAttribute("data-action") === "copyFirstRow") {

         let i, j;
         console.log("copyFirstRow")
         // Zellwert in zuletzt geklickter Zelle
         let row = this.startRowIndex;
         let col = this.startColIndex;

         const wert = this.firtstWert;
         console.log("copyFirst, wert=", wert, row, col);

         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         const nZeilen = tabelle.rows.length;  // header abziehen
         const nSpalten = tabelle.rows[0].cells.length;

         const value = [];
         let nCols = 0;
         for (j = 1; j < nSpalten; j++) {
            value.push((tabelle.rows[row].cells[j].firstElementChild as any).value)
            nCols++;
         }
         console.log("value", value);

         for (i = 1; i < nZeilen; i++) {
            for (j = 1; j < nSpalten; j++) {
               let child = tabelle.rows[i].cells[j].firstElementChild as any // input
               if (child.className === 'input_select') {
                  child.value = value[j - 1].toString();
               }
            }
         }

      } else if (link.getAttribute("data-action") === "increment_1") {

         let i, j;

         // Zellwert in zuletzt geklickter Zelle
         let row = this.startRowIndex;
         let col = this.startColIndex;

         let wert = this.firtstWert;
         //console.log("increment_1, wert=", wert);

         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         const nZeilen = tabelle.rows.length;
         const nSpalten = tabelle.rows[0].cells.length;

         const value = [];

         for (j = 1; j < nSpalten; j++) {
            value.push((tabelle.rows[row].cells[j].firstElementChild as any).value)
         }
         console.log("value", value);


         for (i = 1; i < nZeilen; i++) {
            for (j = 1; j < nSpalten; j++) {
               let child = tabelle.rows[i].cells[j].firstElementChild as any  // input
               if (child.className === 'input_select') {
                  child.value = (value[j - 1]++).toString();
               }
            }
         }

      } else if (link.getAttribute("data-action") === "increment_delta") {

         let i, j;

         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         const nZeilen = tabelle.rows.length;
         const nSpalten = tabelle.rows[0].cells.length;

         // Zellwert in zuletzt geklickter Zelle
         let row = Number(this.startRowIndex);
         console.log("test increment_delta", row, nZeilen)
         if (Number(row) + 2 >= nZeilen) return;    // das geht nicht, da gibt es nichts zu tun
         console.log("alive")
         //let col = selectedCellPoly.col;

         //let wert = Number(selectedCellPoly.wert);
         //console.log("increment_1, wert=", wert);

         const value = [];
         const delta = [];
         let del;

         for (j = 1; j < nSpalten; j++) {

            //del = Number(tabelle.rows[row + 1].cells[j].firstElementChild.value.replace(/,/g, '.'))
            //    - Number(tabelle.rows[row].cells[j].firstElementChild.value.replace(/,/g, '.'))
            //value.push(Number(tabelle.rows[row].cells[j].firstElementChild.value.replace(/,/g, '.')))
            del = (tabelle.rows[row + 1].cells[j].firstElementChild as any).value
               - (tabelle.rows[row].cells[j].firstElementChild as any).value
            value.push(Number((tabelle.rows[row].cells[j].firstElementChild as any).value))
            delta.push(Number(del))
         }
         console.log("value", value);
         console.log("delta", delta);

         for (i = 1; i < nZeilen; i++) {
            for (j = 1; j < nSpalten; j++) {
               let child = tabelle.rows[i].cells[j].firstElementChild as any
               if (child.className === 'input_select') {
                  let zahl = (Number(value[j - 1]) as any).toPrecision(12) * 1;
                  (tabelle.rows[i].cells[j].firstElementChild as any).value = zahl.toString();
                  value[j - 1] += delta[j - 1];
               }
            }
         }
      } else if (link.getAttribute("data-action") === "copy") {

         let newClip = "";
         let wertInSpalte1 = false;

         let numberFormat_OS = Intl.NumberFormat().resolvedOptions().locale.split("-")

         let newLine = null;
         if (Detect.OS === 'Windows') {
            newLine = "\r\n";
         } else {
            newLine = "\n";
         }
         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         const nZeilen = tabelle.rows.length;
         const nSpalten = tabelle.rows[0].cells.length;

         let i, j;
         for (i = 1; i < nZeilen; i++) {
            wertInSpalte1 = false;
            for (j = 1; j < nSpalten - 1; j++) {
               let child = tabelle.rows[i].cells[j].firstElementChild as any // input
               if (child.className === 'input_select') {
                  if (wertInSpalte1) newClip += "\t";
                  let wert = (tabelle.rows[i].cells[j].firstElementChild as any).value;
                  if (numberFormat_OS[0] === 'de') {
                     wert = wert.replace('.', ',')
                  }
                  newClip += wert;
                  wertInSpalte1 = true;
               }
            }
            let child = tabelle.rows[i].cells[nSpalten - 1].firstElementChild as any // input
            if (child.className === 'input_select') {
               if (wertInSpalte1) newClip += "\t";
               let wert = (tabelle.rows[i].cells[nSpalten - 1].firstElementChild as any).value;
               if (numberFormat_OS[0] === 'de') {
                  wert = wert.replace('.', ',')
               }
               newClip += wert + newLine;
            } else {
               if (wertInSpalte1) newClip += newLine;
            }
         }


         navigator.clipboard.writeText(newClip).then(function () {
            console.log("clipboard successfully set");
         }, function () {
            console.log("clipboard write failed");
         });

      }
      else if (link.getAttribute("data-action") === "insert") {

         let newLine = '';
         if (Detect.OS === 'Windows') {
            newLine = "\r\n";
         } else {
            newLine = "\n";
         }

         // Zellwert in zuletzt geklickter Zelle
         let row = Number(this.startRowIndex);
         let col = Number(this.startColIndex);

         //console.log("insert", row, col)

         const tabelle = this.shadow.getElementById('mytable') as HTMLTableElement;
         const nZeilen = tabelle.rows.length;
         const nSpalten = tabelle.rows[0].cells.length;

         //console.log("nZeilen,nSpalten", nZeilen, nSpalten)

         navigator.clipboard.readText().then(function (clipText) {
            //console.log("clipText", clipText);

            let zeilen = clipText.split(newLine);
            //console.log("zeilen", zeilen, zeilen.length);

            let i, j;
            for (i = 0; i < zeilen.length - 1; i++) {
               let zeile = zeilen[i].split("\t");
               //console.log("zeile", i, zeile, zeile.length);
               for (j = 0; j < zeile.length; j++) {
                  //console.log("z", i, j, zeile[j], (row + i), nZeilen, (col + j), nSpalten);
                  if ((row + i) < nZeilen && (col + j) < nSpalten) {
                     //console.log("z", i, j, zeile[j], (row + i), nZeilen, (col + j), nSpalten);
                     let zahl: any = (zeile[j] as any).replace(/,/g, '.');
                     (tabelle.rows[row + i].cells[col + j].firstElementChild as any).value = zahl;
                  }
               }
            }

         });
      }
      else if (link.getAttribute("data-action") === "close") {
      }


      document.getElementById("context-menu")?.removeEventListener('click', this.ref_listener)
      this.ref_listener = null;

      this.unselect_Tabelle();

   }


   //-------------------------------------------------------------------------
   show_contextMenu(ev: any) {
      //---------------------------------------------------------------------
      if (this.ref_listener === null) {
         document.getElementById("context-menu")?.addEventListener('click', this.ref_listener = this.contextMenuClicked.bind(this));
      }

      taskItemInContext = this.clickInsideElement(ev, taskItemClassName);

      console.log("//// show_contextMemu  taskItem In Context", taskItemInContext);
      console.log("this.nSpalten", this.nSpalten)

      if (taskItemInContext) {
         ev.preventDefault();
         toggleMenuOn();
         positionMenu(ev);
      } else {
         taskItemInContext = null;
         toggleMenuOff();
      }
   }


   clickInsideElement(e: any, className: any) {
      //------------------------------------------------------------------------------------------

      let el = e.srcElement || e.target;
      //console.log("click Inside Element:", className, e.target, "-el-", el);

      if (el.classList.contains(className)) {
         //console.log("el.classList.contains: ", className)
         return el;
      } else if (el.classList.contains('input_select')) {
         //console.log("el.classList.contains: input_select")
         return el;
      }
      else {
         while (el = el.parentNode) {
            if (el.classList && el.classList.contains(className)) {
               //console.log("parent", el)
               return el;
            }
         }
      }

      return false;
   }

   //----------------------------------------------------------------------------------------------
   contextMenuClicked(ev: any) {
      //------------------------------------------------------------------------------------------

      console.log("in contextMenuClicked", ev)
      const clickeElIsLink = this.clickInsideElement(ev, contextMenuLinkClassName);
      //console.log("+++ clickListener  clickeElIsLink", clickeElIsLink, ev.button);

      if (clickeElIsLink) {
         ev.preventDefault();
         if (ev.button === 2) return
         this.menuItemListener(clickeElIsLink);
      }
   }



}

// register <hello-world> with the HelloWorld class
customElements.define('dr-tabelle', DrTabelle);


