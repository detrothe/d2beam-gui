import { css } from 'lit';

export const dr_drawer_css = css`
   .class-my-drawer {
      display: none;
      margin: 0px;
      position: absolute;
      top: 0px;
      right: 0px;
      width: 16rem;
      /* height: -webkit-fill-available; */
      height: 100%;
      z-index: 200;
      color: white;
      background-color: rgb(90, 90, 90);
      pointer-events: all;
      cursor: pointer;
      /* transition: width 2s; */
      overflow-y: auto;
   }
`;

