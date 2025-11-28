import { Global, css } from '@emotion/react';

const GlobalStyle = () => (
  <Global
    styles={css`
      html,
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, 'Noto Sans KR', 'Apple SD Gothic Neo',
          'Malgun Gothic', sans-serif;

        height: 100%;
        background: #fff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
      }

      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      button {
        border: none;
        background: none;
        cursor: pointer;
        font-family: inherit;
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
