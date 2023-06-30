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

import { rechnen } from './rechnen';

{
   const template = () => html`
      <style>
         .custom-icons sl-tree-item::part(expand-button) {
            /* Disable the expand/collapse animation */
            rotate: none;
         }
      </style>

      <sl-tab-group>
         <sl-tab slot="nav" panel="tab-1">Haupt</sl-tab>
         <sl-tab slot="nav" panel="tab-2">Querschnitte</sl-tab>
         <sl-tab slot="nav" panel="tab-3">Knoten</sl-tab>
         <sl-tab slot="nav" panel="tab-4">Tab Test</sl-tab>
         <sl-tab slot="nav" panel="tab-5">Elemente</sl-tab>
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

         <sl-tab-panel name="tab-2">
            <sl-button id="open-dialog" @click="${handleClick}"
               >Zeige die Dialog-Box</sl-button
            >
            <br />
            <sl-button
               id="open-dialog_rechteck"
               @click="${handleClick_rechteck}"
               >Rechteckdialog</sl-button
            >

            <sl-tree class="custom-icons">
               <!--
               <sl-icon name="plus-square" slot="expand-icon"></sl-icon>
               <sl-icon name="dash-square" slot="collapse-icon"></sl-icon>
      -->
               <sl-tree-item @click="${handleClick_LD}">
                  Linear elastisch Querschnittswerte
                  <sl-tree-item>Birch</sl-tree-item>

                  <sl-tree-item>Oak</sl-tree-item>
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

         <sl-tab-panel name="tab-1">
            <br />
            <dr-button-pm
               nel="3"
               txt="Anzahl Knoten :"
               inputid="nnodes"
               id="id_nnodes"
            ></dr-button-pm>
            <br />
            <dr-button-pm
               nel="4"
               txt="Anzahl Elemente :"
               inputid="nelem"
            ></dr-button-pm>
            <br />
            <sl-button id="resize" value="resize" @click="${resize}"
               >Resize Tables</sl-button
            ><br />
            <sl-button id="rechnen" value="Rechnen" @click="${calculate}"
               >Rechnen</sl-button
            >
         </sl-tab-panel>
         <sl-tab-panel name="tab-3"
            >Tab panel 3 <br />
            <!-- <dr-table

                columns='["No", "y&#772; [cm]", "z&#772; [cm]"]'
               nZeilen="2"
            ></dr-table> -->
         </sl-tab-panel>
         <sl-tab-panel name="tab-4"
            >Tab panel 4
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
         <sl-tab-panel name="tab-5">Tab panel 5</sl-tab-panel>
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

function handleClick_rechteck() {
   console.log('handleClick_rechteck()');

   const el = document.getElementById('id_dialog_rechteck');
   console.log('id_dialog_rechteck', el);
   console.log(
      'QUERY Dialog',
      el?.shadowRoot?.getElementById('dialog_rechteck')
   );
   (
      el?.shadowRoot?.getElementById('dialog_rechteck') as HTMLDialogElement
   ).showModal();
   //(shadow.getElementById('dialog') as HTMLDialogElement).showModal();
   //}
}
function neuZeilen() {
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

function handleClick_LD(ev: any) {
   console.log('handleClick_LD()', ev);
   /*
   const el = document.getElementById('id_dialog');
   console.log('id_dialog', el);
   console.log('QUERY Dialog', el?.shadowRoot?.getElementById('dialog'));
   (el?.shadowRoot?.getElementById('dialog') as HTMLDialogElement).showModal();
  */
}

function calculate() {
   console.log('calculate');
   rechnen();
}

function resize() {
   console.log('calculate');
   rechnen();
}

