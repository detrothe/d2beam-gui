import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('dr-table')
export class drTable extends LitElement {
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


    tableId = null
    isSelected = false
    selectedCellRow = -1
    selectedCellCol = -1
    col = -1
    row = -1
    wert = 0
    activatedElement = null
    //selColY= []
    //selColZ= []
    startRowIndex = 0
    startColIndex = 0
    pointerIsDown = false
    startx = 0
    starty = 0
    zelle = null
    //nZeilen = 0
    nSpalten = 0
    selectionMode = false


  @property({ type: String }) title = 'simple table';

  @property({ type: Boolean }) enableBack: boolean = false;
  @property({ type: Number }) nZeilen = 2;
  @property({ type: String }) inputID = 'leer';
  @property({ type: Array }) columns = [];

  static get styles() {
    return css`
      input,
      label {
        font-size: 1em;
      }

      button {
        font-size: 1em;
        border-radius: 3px;
        border-width: 1px;
        border-color: #303030;
        color: #444;
        padding: 0.2em;
      }

      button:active {
        background-color: darkorange;
      }
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type='number'] {
        -moz-appearance: textfield;
      }

      .input_int {
        width: 3.125em;
        margin: 0;
        padding: 1px;
        border-top: 1px solid #444;
        border-bottom: 1px solid #444;
        border-left: 0;
        border-right: 0;
        border-radius: 0;
        text-align: center;
      }

      td,
      th {
        padding: 0px;
        margin: 0px;
        width: 6em;
      }

      table {
        border: none;
        border-spacing: 0px;
        padding: 5px;
        margin: 5px;
        background-color: rgb(207, 217, 21);
        border-radius: 5px;
      }

      td.selected {
        /*background-color: rgb(206, 196, 46);*/
        color: rgb(13, 13, 13);
      }

      td.highlight {
        background-color: orange;
        color: darkslateblue;
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    console.log('inputID', this.inputID);
    console.log('heads', this.columns);

    const shadow = this.shadowRoot;
    console.log('this: ', this);
    if (shadow) {
      this.tableRoot = shadow;
      console.log('11', this.tableRoot);
      const table = shadow.getElementById('id_table') as HTMLTableElement;
      let thead = table.createTHead();
      console.log('thead', thead);
      let row = thead.insertRow();
      for (let i = 0; i < this.columns.length; i++) {
        const th0 = table.tHead.appendChild(document.createElement('th'));
        th0.innerHTML = this.columns[i];
        //th0.title = "Elementnummer"
        th0.style.padding = '5px';
        th0.style.margin = '0px';
        th0.style.textAlign = 'center';
        //th0.setAttribute('title', 'Hilfe')
        row.appendChild(th0);
      }
      let id_table = 'idtable';

      let tbody = table.createTBody();

      for (let iZeile = 1; iZeile <= this.nZeilen; iZeile++) {
        let newRow = tbody.insertRow(-1);

        for (let iSpalte = 0; iSpalte < this.columns.length; iSpalte++) {
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
            let el = document.createElement('input');
            el.setAttribute('type', 'number');
            el.style.width = 'inherit'; //'6em';   // 100px
            //el.style.backgroundColor = 'rgb(200,200,200)';
            el.style.border = 'none';
            el.style.borderWidth = '0px';
            el.style.padding = '5px';
            el.style.margin = '0px';
            el.style.borderRadius = '0px';
            const str = id_table + '-' + iZeile + '-' + iSpalte;
            el.id = str;
            //el.className = 'input_normal';
            el.addEventListener('keydown', this.KEYDOWN);
            //el.addEventListener("change", function () { berechnungErforderlich(true); });

            newCell = newRow.insertCell();
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

            el.addEventListener('pointerdown', this.POINTER_DOWN);
            el.addEventListener('pointermove', this.POINTER_MOVE);
            //console.log("rect", iZeile, iSpalte, el.getBoundingClientRect().x, newCell.getBoundingClientRect().y, newCell.getBoundingClientRect().width, newCell.getBoundingClientRect().height)
          }
        }
      }
    }
    console.log('shadowRoot', this.shadowRoot?.getElementById('id_table'));
    this.requestUpdate();
  }

  //----------------------------------------------------------------------------------------------

  render() {
    return html` <table id="id_table"></table> `;
  }

  //------------------------------------------------------------------------------------------------
  KEYDOWN(ev: any) {
    //--------------------------------------------------------------------------------------------

    console.log(
      'KEYDOWN, keycode, id_input, id_tabelle',
      ev.keyCode,
      ev.target.id,
      ev.target.offsetParent.offsetParent.id
    );
    //const tableCellId = ev.target.offsetParent.id;

    //console.log("KEYDOWN", ev.keyCode, ev.shiftKey, ev.key, ev)
    //infoBox.innerHTML += "<br>key= " + ev.key + "  | keyCode= " + ev.keyCode

    if (ev.shiftKey) {
      ev.preventDefault();
      return;
    }
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
    const selectMode = true;
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
      console.log("select Mode = true")
      myTable.addEventListener('pointermove', this.POINTER_MOVE); // , { passive: false }
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
      const row = myArray[1];
      const col = myArray[2];
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
    console.log("POINTER MOVE", ev)
    console.log("tagname", ev.target.tagName)
    ev.preventDefault();

    if (ev.target.tagName !== 'INPUT') return;

    let rowIndex: number, colIndex: number;

    const tableId = ev.target.offsetParent.offsetParent.id;
    //console.log("tableId", tableId)
    if (tableId === '') return; // cursor steht auf irgendwas, aber nicht auf tag <input>

    //    ev.preventDefault();

    const inputId = ev.target.id;

    //TODO selectedCellPoly.tableId = tableId;
    //const tableIndex = table_index(tableId);

    //console.log("POINTERMOVE", ev.buttons, ev.target.id, tableId)
    //console.log("MOVE ids", tableId, ev.target.id, ev.pointerId)
    //console.log("POINTER_MOVE pos", ev.pageX, ev.pageY, ev.clientX, ev.clientY, ev.pointerId, ev.target.id)

    const el = document.getElementById(inputId);
    //console.log("getBoundingClientRect", el.getBoundingClientRect().x, el.getBoundingClientRect().y);
    /*
      if (el.className !== 'input_select') {
          el.className = 'input_select';
          selected = true
      }
      */
    //console.log("rect", ev.pointerType, ev.clientX - el.getBoundingClientRect().x, ev.clientY - el.getBoundingClientRect().y, el.getBoundingClientRect().width, el.getBoundingClientRect().height)

    //infoBox.innerHTML += "<br>POINTER Move" + ' | ' + ev.pointerType + ' | ' + tableId + ' | ' + inputId

    const browser = "Chrome"; //Detect.browser;

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
        tabelle.rows[i].cells[j].firstElementChild.className = 'input_normal';
      }
    }

    for (let i = rowStart; i <= rowEnd; i++) {
      for (let j = colStart; j <= colEnd; j++) {
        // @ts-ignore
        if (!tabelle.rows[i].cells[j].firstElementChild.hidden)
          tabelle.rows[i].cells[j].firstElementChild.className = 'input_select';
      }
    }
  }
}

