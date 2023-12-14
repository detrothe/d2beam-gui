import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }

  main {
    margin-top: 10px;
  }

   .custom-icons sl-tree-item::part(expand-button) {
     /* Disable the expand/collapse animation */
    rotate: none;
  }
`;