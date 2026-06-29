import { createGlobalStyle } from 'styled-components';

// 전역 리셋 + 폰트 (구 index.css 를 styled-components 로 이전).
// 검정 base 배경은 레터박스(스테이지 밖 여백)를 가리는 용도 — 특정 페이지 전용이 아니다.
export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Pathway+Gothic+One&family=Poppins:wght@500;600;700&display=swap');

  :root {
    color-scheme: dark;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    --font-ui: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
    font-family: var(--font-ui);
    overscroll-behavior: none;
    -webkit-tap-highlight-color: transparent;
  }

  #root {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    position: relative;
    overflow: hidden;
    background: #000;
  }
`;
