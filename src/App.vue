<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
body {
  overflow-x: hidden;
  background: rgb(32, 32, 36);
  color: #fff;
  margin: 0 auto;
  padding: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%;
}
div {
  box-sizing: border-box;
}
body::-webkit-scrollbar {
  width: 8px;  /* 스크롤바의 너비 */
}
body::-webkit-scrollbar-thumb {
  height: 30%; /* 스크롤바의 길이 */
  background: #5d5d5d; /* 스크롤바의 색상 */
  border-radius: 10px;
}
body::-webkit-scrollbar-track {
  background: rgba(91, 91, 91, 0.1);  /*스크롤바 뒷 배경 색상*/
}
</style>
