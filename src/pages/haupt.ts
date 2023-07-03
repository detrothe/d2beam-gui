import { html, render } from 'lit';
//import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

//import { styles } from '../styles/shared-styles';

import '../components/dr-button-pm';
import '../components/dr-table';
import '../components/dr-test';
import '../components/dr-dialog-layerquerschnitt';
import '../components/dr-dialog-rechteckquerschnitt';

import { rechnen, nQuerschnittSets, incr_querschnittSets, set_querschnittRechteck, get_querschnittRechteck, update_querschnittRechteck } from './rechnen';


let dialog_querschnitt_new = true;
let dialog_querschnitt_index = 0;
let dialog_querschnitt_item_id = '';

{
   const template = () => html`
      <style>
         .custom-icons sl-tree-item::part(expand-button) {
            /* Disable the expand/collapse animation */
            rotate: none;
         }
      </style>

      <sl-tab-group>
         <sl-tab slot="nav" panel="tab-haupt">Haupt</sl-tab>
         <sl-tab slot="nav" panel="tab-querschnitte">Querschnitte</sl-tab>
         <sl-tab slot="nav" panel="tab-knoten">Knoten</sl-tab>
         <sl-tab slot="nav" panel="tab-elemente">Elemente</sl-tab>
         <sl-tab slot="nav" panel="tab-knotenlasten">Knotenlasten</sl-tab>
         <sl-tab slot="nav" panel="tab-6">Tab 6</sl-tab>
         <sl-tab slot="nav" panel="tab-7">Tab 7</sl-tab>
         <sl-tab slot="nav" panel="tab-8">Tab 8</sl-tab>
         <sl-tab slot="nav" panel="tab-9">Tab 9</sl-tab>
         <sl-tab slot="nav" panel="tab-10">Tab 10</sl-tab>
         <sl-tab slot="nav" panel="tab-11">Tab 11</sl-tab>
         <sl-tab slot="nav" panel="tab-12">Tab 12</sl-tab>
         <sl-tab slot="nav" panel="tab-13">Tab 13</sl-tab>
         <sl-tab slot="nav" panel="tab-14">Tab 14</sl-tab>
         <sl-tab slot="nav" panel="tab-15">Tab 15</sl-tab>
         <sl-tab slot="nav" panel="tab-16">Tab 16</sl-tab>
         <sl-tab slot="nav" panel="tab-17">Tab 17</sl-tab>
         <sl-tab slot="nav" panel="tab-18">Tab 18</sl-tab>
         <sl-tab slot="nav" panel="tab-19">Tab 19</sl-tab>
         <sl-tab slot="nav" panel="tab-20">Tab 20</sl-tab>

         <sl-tab-panel name="tab-querschnitte">
            <sl-button id="open-dialog" @click="${handleClick}"
               >neuer allgemeiner Querschnitt</sl-button
            >
            <br />
            <sl-button
               id="open-dialog_rechteck"
               @click="${handleClick_rechteck}"
               >neuer Rechteck-Querschnitt</sl-button
            >

            <sl-tree class="custom-icons">
               <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
      -->
               <sl-tree-item id="id_tree_LQ" @click="${handleClick_LD}">
                  Linear elastisch Querschnittswerte
                  <!-- <sl-tree-item>Birch</sl-tree-item>

                  <sl-tree-item>Oak</sl-tree-item> -->
               </sl-tree-item>

               <sl-tree-item>
                  Linear elastisch allgemein
                  <sl-tree-item>Cedar</sl-tree-item>
                  <sl-tree-item>Pine</sl-tree-item>
                  <sl-tree-item>Spruce</sl-tree-item>
               </sl-tree-item>
            </sl-tree>

            <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt>
            <dr-rechteckquerschnitt
               id="id_dialog_rechteck"
            ></dr-rechteckquerschnitt>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->

         <sl-tab-panel name="tab-haupt">
            <br />

            <table id="querschnittwerte_table">
               <tbody>
                  <tr>
                     <td>Anzahl Knoten :</td>
                     <td>
                        <dr-button-pm
                           nel="3"
                           inputid="nnodes"
                           id="id_nnodes"
                        ></dr-button-pm>
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Elemente :</td>
                     <td>
                        <dr-button-pm nel="4" inputid="nelem"></dr-button-pm>
                     </td>
                  </tr>
                  <tr>
                     <td>Anzahl Knotenlasten :</td>
                     <td>
                        <dr-button-pm nel="2" inputid="nelem"></dr-button-pm>
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td>
                        <sl-button id="resize" value="resize" @click="${resize}"
                           >Resize Tabellen</sl-button
                        >
                     </td>
                  </tr>
                  <tr>
                     <td></td>
                     <td>
                        <sl-button
                           id="rechnen"
                           value="Rechnen"
                           @click="${calculate}"
                           >Rechnen</sl-button
                        >
                     </td>
                  </tr>
               </tbody>
            </table>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-elemente"
            >Eingabe der Elemente <br />

            <dr-test
               id="ne"
               nzeilen="4"
               nspalten="5"
               columns='["No", "qName", "inz a", "inz e", "Gelenk a", "Gelenk e"]'
               typs='["-", "select", "number", "number", "number", "number"]'
            ></dr-test>

            <!-- <dr-table

                columns='["No", "y&#772; [cm]", "z&#772; [cm]"]'
               nZeilen="2"
            ></dr-table> -->
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-knoten"
            >Eingabe der Knotenkoordinaten und Lager
            <sl-button id="nZeilen" value="anmelden" @click="${neuZeilen}"
               >neue Zeilen</sl-button
            >
            <dr-test
               id="nz"
               nzeilen="4"
               nspalten="5"
               columns='["No", "x [m]", "z [m]", "L<sub>x</sub>", "L<sub>z</sub>", "L<sub>&phi;</sub>"]'
            ></dr-test>
         </sl-tab-panel>

         <!--------------------------------------------------------------------------------------->
         <sl-tab-panel name="tab-knotenlasten"
            >Eingabe der Knotenlasten</sl-tab-panel
         >

         <sl-tab-panel name="tab-6">Tab panel 6</sl-tab-panel>
         <sl-tab-panel name="tab-7">Tab panel 7</sl-tab-panel>
         <sl-tab-panel name="tab-8">Tab panel 8</sl-tab-panel>
         <sl-tab-panel name="tab-9">Tab panel 9</sl-tab-panel>
         <sl-tab-panel name="tab-10">Tab panel 10</sl-tab-panel>
         <sl-tab-panel name="tab-11">Tab panel 11</sl-tab-panel>
         <sl-tab-panel name="tab-12">Tab panel 12</sl-tab-panel>
         <sl-tab-panel name="tab-13">Tab panel 13</sl-tab-panel>
         <sl-tab-panel name="tab-14">Tab panel 14</sl-tab-panel>
         <sl-tab-panel name="tab-15">Tab panel 15</sl-tab-panel>
         <sl-tab-panel name="tab-16">Tab panel 16</sl-tab-panel>
         <sl-tab-panel name="tab-17">Tab panel 17</sl-tab-panel>
         <sl-tab-panel name="tab-18">Tab panel 18</sl-tab-panel>
         <sl-tab-panel name="tab-19">Tab panel 19</sl-tab-panel>
         <sl-tab-panel name="tab-20">Tab panel 20</sl-tab-panel>
      </sl-tab-group>

      <!-- <dr-layerquerschnitt id="id_dialog"></dr-layerquerschnitt> -->
   `;

   const container = document.getElementById('container') as HTMLDivElement;
   const renderBefore = container?.querySelector('footer');
   render(template(), container, { renderBefore });
}

//---------------------------------------------------------------------------------------------------------------

function handleClick() {
   console.log('handleClick()');
   //console.log(this._root.querySelector('#dialog'));
   //const shadow = this.shadowRoot;
   //if (shadow) {
   //console.log(shadow.getElementById('dialog'));
   //console.log(shadow.getElementById('Anmeldung'));
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
}
//---------------------------------------------------------------------------------------------------------------

function handleClick_rechteck() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_rechteck()');

   const el = document.getElementById('id_dialog_rechteck');
   console.log('id_dialog_rechteck', el);
   console.log(
      'QUERY Dialog',
      el?.shadowRoot?.getElementById('dialog_rechteck')
   );

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = true;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
   /*
   console.log('NAME', el?.shadowRoot?.getElementById('qname'));
   var tag = document.createElement('sl-tree-item');
   var text = document.createTextNode(
      'Tutorix is the best e-learning platform'
   );
   tag.appendChild(text);
   var element = document.getElementById('id_tree_LQ');
   element?.appendChild(tag);
   */
}

//---------------------------------------------------------------------------------------------------------------
function neuZeilen() {
   //---------------------------------------------------------------------------------------------------------------
   const el = document.getElementById('nz');
   console.log('EL: >>', el);
   el?.setAttribute('nzeilen', '4');
   console.log('QUERY', el?.shadowRoot?.getElementById('mytable'));
   const table = el?.shadowRoot?.getElementById('mytable') as HTMLTableElement;
   console.log('nZeilen', table.rows.length);
   console.log('nSpalten', table.rows[0].cells.length);

   let nnodes = table.rows.length - 1;
   let wert: any;

   for (let i = 0; i < nnodes; i++) {
      let child = table.rows[i + 1].cells[1]
         .firstElementChild as HTMLInputElement;
      wert = child.value;
      child.value = '21';
      console.log('NODE i:1', i, wert);
      child = table.rows[i + 1].cells[2].firstElementChild as HTMLInputElement;
      console.log('NODE i:2', i, wert);
      wert = child.value;
   }
}

//---------------------------------------------------------------------------------------------------------------
function handleClick_LD(ev: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('handleClick_LD()', ev);
   /*
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
  */
}

//---------------------------------------------------------------------------------------------------------------
function calculate() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('calculate');
   rechnen();
}

//---------------------------------------------------------------------------------------------------------------
function resize() {
   //---------------------------------------------------------------------------------------------------------------
   console.log('calculate');
   rechnen();
}

//---------------------------------------------------------------------------------------------------------------
function dialog_closed(e: any) {
   //---------------------------------------------------------------------------------------------------------------
   console.log('Event dialog closed', e);
   const el = document.getElementById(
      'id_dialog_rechteck'
   ) as HTMLDialogElement;

   // @ts-ignore
   const returnValue = this.returnValue;

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).removeEventListener('close', dialog_closed);

   if (returnValue === 'ok') {

      const id = 'mat-' + nQuerschnittSets;

      {
         let elem = el?.shadowRoot?.getElementById('emodul') as HTMLInputElement;
         console.log('emodul=', elem.value);
         const emodul = +elem.value
         elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
         const Iy = +elem.value
         elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
         const area = +elem.value
         elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
         const qname = elem.value
         elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
         const height = +elem.value
         elem = el?.shadowRoot?.getElementById('bettung') as HTMLInputElement;
         const bettung = +elem.value
         elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
         const wichte = +elem.value;

         if (dialog_querschnitt_new) {
            incr_querschnittSets();

            set_querschnittRechteck(qname, id, emodul, Iy, area, height, bettung, wichte)

         } else {

            update_querschnittRechteck(dialog_querschnitt_index, qname, id, emodul, Iy, area, height, bettung, wichte)

            //console.log("UPDATE", this)
            const el = document.getElementById(dialog_querschnitt_item_id) as HTMLElement;
            //console.log("dialog_querschnitt_item_id", el.innerHTML)
            if (el.innerHTML !== qname) {
               el.innerHTML = qname;
               const ele = document.getElementById('ne');
               console.log('ELE: >>', ele);
               ele?.setAttribute('namechanged', String(dialog_querschnitt_index));
            }
         }

      }

      if (dialog_querschnitt_new) {

         const qName = (
            el?.shadowRoot?.getElementById('qname') as HTMLInputElement
         ).value;
         console.log('NAME', qName);
         var tag = document.createElement('sl-tree-item');
         var text = document.createTextNode(qName);
         tag.appendChild(text);
         tag.addEventListener('click', opendialog);

         tag.id = id;
         var element = document.getElementById('id_tree_LQ');
         element?.appendChild(tag);
         console.log("child appendchild", element)

         const ele = document.getElementById('ne');
         console.log('ELE: >>', ele);
         ele?.setAttribute('newselect', '4');
      }
   }
}

//---------------------------------------------------------------------------------------------------------------
function opendialog(ev: any) {
   //---------------------------------------------------------------------------------------------------------------

   // @ts-ignore
   console.log('opendialog geht', this);
   ev.preventDefault;

   // @ts-ignore
   const id = this.id;

   console.log('id', document.getElementById(id));

   const myArray = id.split('-');
   console.log('Array', myArray.length, myArray[0], myArray[1]);

   const index = Number(myArray[1])
   {
      //let qname: string = '', id0: string = ''
      //let emodul: number = 0, Iy: number = 0, area: number = 0, height: number = 0, bettung: number = 0, wichte: number = 0;

      const [qname, id0, emodul, Iy, area, height, bettung, wichte] = get_querschnittRechteck(index)

      if (id0 !== id) console.log("BIG Problem in opendialog");

      const el = document.getElementById(
         'id_dialog_rechteck'
      ) as HTMLDialogElement;

      let elem = el?.shadowRoot?.getElementById('emodul') as HTMLInputElement;
      console.log('set emodul=', elem.value, emodul);
      elem.value = String(emodul)
      elem = el?.shadowRoot?.getElementById('traeg_y') as HTMLInputElement;
      elem.value = String(Iy)
      elem = el?.shadowRoot?.getElementById('area') as HTMLInputElement;
      elem.value = String(area)
      elem = el?.shadowRoot?.getElementById('qname') as HTMLInputElement;
      elem.value = String(qname)
      elem = el?.shadowRoot?.getElementById('height') as HTMLInputElement;
      elem.value = String(height)
      elem = el?.shadowRoot?.getElementById('bettung') as HTMLInputElement;
      elem.value = String(bettung)
      elem = el?.shadowRoot?.getElementById('wichte') as HTMLInputElement;
      elem.value = String(wichte);

   }

   //const el=document.getElementById(id);
   const el = document.getElementById('id_dialog_rechteck');

   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).addEventListener('close', dialog_closed);

   dialog_querschnitt_new = false;
   dialog_querschnitt_index = index;
   dialog_querschnitt_item_id = id;

   //console.log('id_dialog', el);
   //console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
}

