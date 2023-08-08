import styles from './dr-tabelle.css?raw';

import { nQuerschnittSets, get_querschnittRechteck_name } from '../pages/rechnen';

// <hello-world> Web Component
class DrTabelle extends HTMLElement {
   shadow: any = null;

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
   pointerIsDown = false;
   startx = 0;
   starty = 0;
   zelle = null;
   //nZeilen = 0
   //nSpalten = 0
   selectionMode = false;
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

      const table = document.createElement('table');
      this.shadow.appendChild(table);
      table.id = 'mytable';

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
               if (this.typs[iSpalte] === ' select') {
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
                  if (this.typs[iSpalte] === " text") {
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
               el.addEventListener('keydown', this.KEYDOWN);
               //el.addEventListener("change", function () { berechnungErforderlich(true); });

               newCell = newRow.insertCell();
               if (this.colWidth.length === 0) newCell.style.width = '6em';
               else newCell.style.width = this.colWidth[iSpalte] + 'em';
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

               el.addEventListener('pointerdown', this.POINTER_DOWN);
               //TODO el.addEventListener('pointermove', this.POINTER_MOVE);
               //console.log("rect", iZeile, iSpalte, el.getBoundingClientRect().x, newCell.getBoundingClientRect().y, newCell.getBoundingClientRect().width, newCell.getBoundingClientRect().height)
            }
         }
      }
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

      if (name === 'newselect') {
         this.update_select_options();

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
               this.columns[i] = myArray[i].replace(/"/g, '');
            }

            //console.log('-- columns', this.columns[0], this.columns[1], this.columns[2], this.columns[3], this.columns[4], this.columns[5]);

         } else if (name === 'typs') {
            let myValue = newValue.replace('[', '');
            const lastIndex = myValue.lastIndexOf(']');
            myValue = myValue.slice(0, lastIndex);
            //console.log('myValue', myValue);
            const myArray = myValue.split(',');
            //console.log('myArray', myArray[0], myArray[1], myArray[2]);
            let str=''
            for (let i = 0; i < myArray.length; i++) {
               this.typs[i] = myArray[i].replace(/"/g, '');
               str = str + this.typs[i]
            }
            console.log("str",str)

         } else if (name === 'colwidth') {
            let myValue = newValue.replace('[', '');
            const lastIndex = myValue.lastIndexOf(']');
            myValue = myValue.slice(0, lastIndex);
            const myArray = myValue.split(',');
            for (let i = 0; i < myArray.length; i++) {
               this.colWidth[i] = myArray[i].replace(/"/g, '');
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
      return ['nzeilen', 'nspalten', 'columns', 'typs', 'newselect', 'namechanged', 'clear', 'colwidth', 'coltext'];
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
   update_select_options() {
      //------------------------------------------------------------------------------------------------------------
      console.log('in update_select_options');

      const table = this.shadow.getElementById('mytable') as HTMLTableElement;

      console.log(" TEST this.nZeilen", this.nZeilen)
      for (let iZeile = 1; iZeile <= this.nZeilen; iZeile++) {
         // Spalten addieren
         let row = table.rows.item(iZeile);
         if (row) {
            //console.log("row", row);
            for (let iSpalte = 1; iSpalte <= this.nSpalten; iSpalte++) {

               if (this.typs[iSpalte] === ' select') {
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

               if (this.typs[iSpalte] === ' select') {
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
                        el.addEventListener('keydown', this.KEYDOWN);
                        //el.addEventListener('change', function () {
                        //  berechnungErforderlich(true);
                        //});
                        //el.addEventListener("mousemove", newMOUSEMOVE);

                        //console.log("el", el)
                        //newText = document.createTextNode(String(i + 1));  // Append a text node to the cell
                        //newCell = newRow.insertCell()
                        newCell.style.width = '6em';
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
                        el.addEventListener('pointerdown', this.POINTER_DOWN);
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
                  if (this.typs[iSpalte] === ' select') {
                     el = document.createElement('select');
                     el.style.width = '100%';   // 100px
                     console.log('CREATED SELECT');
                     for (let i = 0; i < nQuerschnittSets; i++) {
                        let option = document.createElement('option');

                        option.value = option.textContent = get_querschnittRechteck_name(i);;

                        el.appendChild(option);
                     }
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
                  el.addEventListener('keydown', this.KEYDOWN);
                  //el.addEventListener('change', function () {
                  //  berechnungErforderlich(true);
                  //});
                  //el.addEventListener("mousemove", newMOUSEMOVE);

                  newCell = newRow.insertCell();
                  //newCell.style.width = '6em';
                  if (this.colWidth.length === 0) newCell.style.width = '6em';
                  else newCell.style.width = this.colWidth[iSpalte] + 'em';

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
                  el.addEventListener('pointerdown', this.POINTER_DOWN);
               }
            }
         }
      }

      this.nSpalten = nColNew
      this.nZeilen = nRowNew
      this.nTabRow = this.nZeilen + 1
      this.nTabCol = this.nSpalten + 1
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
      if (ev.target.type === 'text') return;

      if (ev.keyCode > 47 && ev.keyCode < 58) return; // Ziffern 0-9
      if (ev.keyCode > 95 && ev.keyCode < 111) return; // Ziffern 0-9, +, - vom numpad
      if (ev.keyCode === 69 || ev.keyCode === 190 || ev.keyCode === 188) return; // e .  ,
      if (ev.keyCode === 13 || ev.keyCode === 8 || ev.keyCode === 46) return; // return, del, entfernen
      if (ev.keyCode === 37 || ev.keyCode === 39 || ev.keyCode === 189) return; // rechts links -
      if (ev.keyCode === 9 || ev.keyCode === 27) return; // Tab, ESC
      if (ev.keyCode === 173) return; // - Zeichen bei Firefox
      if (ev.keyCode === 0) return; // - Zeichen bei Android Firefox

      ev.preventDefault();
   }

   //------------------------------------------------------------------------------------------------
   POINTER_DOWN(ev: any) {
      // pointer move
      //--------------------------------------------------------------------------------------------

      const tableId = ev.target.offsetParent.offsetParent.id;
      const inputId = ev.target.id;
      console.log('tableID', ev.target);
      //const tableIndex = table_index(tableId)

      //TODO selectedCellPoly.tableId = tableId;

      //TODO const selectMode = this.selectionMode
      const selectMode = false;
      //TODO toggleMenuOff()

      //console.log("POINTERDOWN", ev)
      console.log(
         'POINTERDOWN',
         selectMode,
         ev.button,
         tableId,
         inputId,
         ev.pageX,
         ev.pageY,
         ev.which,
         ev.pointerType
      );

      //infoBox.innerHTML += "<br>POINTERDOWN" + ' | ' + selectMode + ' | ' + ev.button + ' | ' + tableId + ' | ' + inputId + ' | ' + ev.pageX + ' | ' + ev.pageY + ' | ' + ev.which + ' | ' + ev.pointerType
      //const shadow = this.shadowRoot;
      console.log('tableRoot:', this);
      //if (shadow) {
      const myTable = ev.target.offsetParent.offsetParent as HTMLTableElement; //this.tableRoot.getElementById(tableId);
      console.log('myTable:', myTable);
      if (selectMode || ev.pointerType === 'mouse') {
         // bei Mouse immer select mode
         console.log('select Mode = true', this);
         this.addEventListener('pointermove', this.POINTER_MOVE); // , { passive: false }
         //TODO myTable.addEventListener("pointerup", POINTER_UP);
      }

      const myArray = inputId.split('-');
      console.log('Array', myArray.length, myArray[0], myArray[1], myArray[2]);
      const el = ev.target; // this.tableRoot.getElementById(inputId) as HTMLInputElement;

      this.offsetX = ev.pageX - ev.clientX;
      this.offsetY = ev.pageY - ev.clientY;

      //ev.pointerType,
      this.cellLeft = el.getBoundingClientRect().x + this.offsetX;
      this.cellTop = el.getBoundingClientRect().y + this.offsetY;
      this.cellWidth = el.getBoundingClientRect().width;
      this.cellHeight = el.getBoundingClientRect().height;
      this.cellId = myArray[0];
      this.cellRow = myArray[1];
      this.cellCol = myArray[2];
      console.log(
         'MEMORY',
         this.cellRow,
         this.cellCol,
         this.cellLeft,
         this.cellTop,
         this.cellWidth,
         this.cellHeight,
         this.offsetX,
         this.offsetY
      );

      if (ev.which === 3) {
         // rechte Maustaste
         console.log('rechte Maustaste');
         ev.preventDefault();
      } else if (ev.button === 0) {
         // linke Maustaste

         //TODO remove_selected_Tabelle();
         this.selected = false;

         console.log('linke Maustaste');
         //ev.preventDefault();
         //TODO const row = myArray[1];
         //TODO const col = myArray[2];
         /*
    selectedCellPoly.row = row;
    selectedCellPoly.col = col;
    selectedCellPoly.wert = Number(el.value);
    selectedCellPoly.activatedElement = el;
    selectedCellPoly.isSelected = true;
    selectedCellPoly.startRowIndex = row;
    selectedCellPoly.startColIndex = col;

    this.row = row;
    this.col = col;
    this.wert = Number(el.value);
    this.activatedElement = el;
    this.isSelected = true;
    this.startRowIndex = row;
    this.startColIndex = col;
*/
         //if (myTable ) myTable.rows[this.cellRow].cells[this.cellCol].firstElementChild.className = 'input_select';  // funktioniert

         if (selectMode && ev.pointerType !== 'mouse') {
            ev.preventDefault();
         }
         //console.log("selectedCellPoly", selectedCellPoly.row, selectedCellPoly.col, selectedCellPoly.wert, selectedCellPoly.activatedElement)
      }
   }

   //------------------------------------------------------------------------------------------------
   POINTER_MOVE(ev: any) {
      // pointer move
      //--------------------------------------------------------------------------------------------
      console.log('POINTER MOVE', ev);
      console.log('tagname', ev.target.tagName);
      ev.preventDefault();

      if (ev.target.tagName !== 'INPUT') return;

      let rowIndex: number, colIndex: number;

      const tableId = ev.target.offsetParent.offsetParent.id;
      //console.log("tableId", tableId)
      if (tableId === '') return; // cursor steht auf irgendwas, aber nicht auf tag <input>

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
      //console.log("startend", rowStart, rowEnd, colStart, colEnd);

      const tabelle = ev.target.offsetParent.offsetParent; //document.getElementById(tableId) as HTMLTableElement;
      //console.log("tabelle", tabelle)
      //const nSpalten = tabelle.rows[0].cells.length - 1;
      const nZeilen = this.nZeilen;
      const nSpalten = this.nSpalten;

      for (let i = 1; i <= nZeilen; i++) {
         for (let j = 1; j < nSpalten; j++) {
            //console.log("i,j", tabelle.rows[i].cells[j].firstElementChild)
            tabelle.rows[i].cells[j].firstElementChild.className =
               'input_normal';
         }
      }

      for (let i = rowStart; i <= rowEnd; i++) {
         for (let j = colStart; j <= colEnd; j++) {
            // @ts-ignore
            if (!tabelle.rows[i].cells[j].firstElementChild.hidden)
               tabelle.rows[i].cells[j].firstElementChild.className =
                  'input_select';
         }
      }
   }
}

// register <hello-world> with the HelloWorld class
customElements.define('dr-tabelle', DrTabelle);


