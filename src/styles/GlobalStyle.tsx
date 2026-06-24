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
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        overflow-x: hidden;
        overscroll-behavior: none;
      }

      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      button {
        border: none;
        background: none;
        cursor: pointer;
        font-family: inherit;
        outline: none;
        touch-action: manipulation;
      }

      button:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      input,
      textarea,
      select {
        border: none;
        background: none;
        font-family: inherit;
      }

      ul,
      ol {
        list-style: none;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        pointer-events: none;
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
