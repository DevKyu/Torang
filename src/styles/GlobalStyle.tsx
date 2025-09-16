import { Global, css } from '@emotion/react';

const GlobalStyle = () => (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html,
      body {
        height: 100%;
        font-family: sans-serif;
        background-color: #fff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
      }

      ul,
      ol {
        list-style: none;
      }

      button {
        background: none;
        border: none;
        cursor: pointer;
      }
    `}
  />
);

export default GlobalStyle;
