<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
html {
  overflow: hidden;
  background: linear-gradient(124deg, rgba(56,54,75,1) 0%, rgba(27,24,41,1) 100%);
  background-repeat: no-repeat;
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
body {
  margin: 0 auto;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
  position: relative;
}
div {
  box-sizing: border-box;
}
.music-bottom-sheet {
  overflow-y: auto;
  .bottom-sheet__card.fx-default {
    background: rgba(32, 32, 36, 0.9)!important;
    border: 1px solid rgba(255,255,255,0.5)!important;
    .bottom-sheet__pan {
      .bottom-sheet__bar {
        background: #fff!important;
      }
    }
    .bottom-sheet__content {
    }
  }
}
.bottom-sheet__content::-webkit-scrollbar {
  width: 8px;  /* 스크롤바의 너비 */
}
.bottom-sheet__content::-webkit-scrollbar-thumb {
  height: 30%; /* 스크롤바의 길이 */
  background: #5d5d5d; /* 스크롤바의 색상 */
  border-radius: 10px;
}
.bottom-sheet__content::-webkit-scrollbar-track {
  background: rgba(91, 91, 91, 0.1);  /*스크롤바 뒷 배경 색상*/
}
.music-list::-webkit-scrollbar {
  width: 8px;  /* 스크롤바의 너비 */
}
.music-list::-webkit-scrollbar-thumb {
  height: 30%; /* 스크롤바의 길이 */
  background: #5d5d5d; /* 스크롤바의 색상 */
  border-radius: 10px;
}
.music-list::-webkit-scrollbar-track {
  background: rgba(91, 91, 91, 0.1);  /*스크롤바 뒷 배경 색상*/
}
.button {
  background: linear-gradient(135deg, #de4c4b 0%, #be2264 100%);
  cursor: pointer;
  text-align: center;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  color: #fff;
  line-height: 27px;
  font-weight: bold;
  font-size: 40px;
  img{
    width: 25px;
    height: 25px;
    margin-top: 7px;
    cursor: pointer;
  }
}
.big-button {
  width: 100%!important;
  font-size: 14px!important;
  line-height: 40px!important;
}
</style>
