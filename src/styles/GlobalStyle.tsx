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
        background: #fff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
      }

      button {
        border: none;
        background: none;
        cursor: pointer;
      }

      ul,
      ol {
        list-style: none;
      }

      .gallery-swiper {
        width: 100%;
        overflow: hidden;
        position: relative;
      }

      .gallery-slide {
        padding: 8px 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
      }
    `}
  />
);

export default GlobalStyle;
