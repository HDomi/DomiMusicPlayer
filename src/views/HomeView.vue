<template>
  <div class="wrap">
    <youtube-media :video-id="videoId" @ready="ready" @playing="playing" @ended="change" :player-vars="{autoplay: 1}" style="position: absolute; left: -9999px; top: -9999px; width: 0; height: 0"></youtube-media>
    <div class="main-sec">
      <div class="flux">Music Player</div>
      <div class="cd-content">
        <div class="cd-wrap">
          <img class="cd" src="../assets/images/img_cd.svg" />
          <div class="cd-cover">
            <div v-if="nowSingTitle.length" class="play-title">{{ nowSingTitle }}</div>
            <div v-else class="play-title">재생을 눌러주세요.</div>
            <div class="control-btn-wrap">
              <div class="button" @click="fetchList"><img src="../assets/images/refresh-w.png"  class="refresh"/></div>
              <div class="button" v-if="isPlay" @click="pause"><img src="../assets/images/pause-white.png"/></div>
              <div class="button" v-else @click="play"><img src="../assets/images/play-white.png"/></div>
              <div class="button" @click="change"><img src="../assets/images/skip-white.png"/></div>
            </div>
            <div class="button big-button" style="" @click="openList">목록보기</div>
          </div>
        </div>
      </div>    
    </div>
    <vue-bottom-sheet
      ref="myBottomSheet"
      class="music-bottom-sheet"
      :is-full-screen="true"
      >
      <div v-if="!Object.keys(playList).length" class="not-set-sing">추가된 노래가 없습니다!</div>
      <div class="playList-item" :class="{nowPlaying: getNowPlay(item.link)}" v-for="(item, key, index) in playList" :key="`play-${index}`">
        <div class="info-wrap" @click="onClickChange(item.link)">
          <div class="name">{{ getTitle(key) }}</div>
          <div class="link">{{ item.link }}</div>
        </div>
        <div class="control-wrap">
          <div v-if="getNowPlay(item.link)" class="btn">
            <img src="../assets/images/pause.svg"/>
          </div>
          <div v-else class="button" @click="deleteItem(key)">
            -
          </div>
        </div>
      </div>
    </vue-bottom-sheet>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, set} from "firebase/database";
import firebaseConfig from '../config/firebaseConfig'
import MakeToast from "../utils/MakeToast";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
export default {
  name: "HomeView",
  components: {
    VueBottomSheet
  },
  data() {
    return {
      isPlay: false,
      initializeApp: null,
      musicDataOnWeb: {},
      playList: {},
      videoId: '',
      nowSingTitle: '',
      nowSingTime: '',

      addSingTitle: '',
      addSingLink: '',
    };
  },
  computed: {
    playListId () {
      const idList = [];
      Object.keys(this.playList).forEach(key => {
        idList.push(this.getCode(this.playList[key].link));
      });
      return idList;
    },
  },
   watch: {
    videoId () {
      this.fetchList();
    }
  },
  methods: {
    ready (event) { //노래 준비됨
      this.setPlayStatusForDatabase(false);
      this.player = event.target;
    },

    playing (event) { //노래 시작됨
      this.setPlayStatusForDatabase(true);
      const playingData = this.player.getVideoData();
      this.nowSingTitle = playingData.title;
      this.setPlayNameForDatabase();
      console.log('@@@@@@@@@@@@',event);
      MakeToast(this, `'노래가 재생됩니다.\n', ${this.nowSingTitle}`, 'success', 1200);
    },

    async change () { //노래바꾸기
      await this.fetchList();
      
      this.setPlayStatusForDatabase(true);
      const nowIndex = this.playListId.indexOf(this.videoId, 0);
      const nextNum = this.playListId.length <= nowIndex + 1 ? 0 : nowIndex + 1;
      this.videoId = this.playListId[nextNum];
      // Object.keys(this.playList).forEach(key => {
      //   if(this.playList[key].link.includes(this.playListId[nowIndex])){
      //     this.deleteItem(key);
      //   }
      // });
      
    },

    play () { //재생
      this.setPlayStatusForDatabase(true);
      this.player.playVideo();
    },

    pause () { //일시정지
      MakeToast(this, '노래 일시정지', 'success', 1200);
      this.setPlayStatusForDatabase(false);
      this.player.pauseVideo();
    },

    openList() {
      this.$refs.myBottomSheet.open();
    },
    closeList() {
      this.$refs.myBottomSheet.close();
    },

    setPlayStatusForDatabase (status) {
      this.isPlay = status;
      const db = getDatabase();
      if(status){
        set(ref(db, `DomiMusic/PlayStatus/`), true);
      }else{
        set(ref(db, `DomiMusic/PlayStatus/`), false);
      }
      this.fetchList();
    },

    async fetchStatus () {
      const dbRef = ref(getDatabase(this.initializeApp));
      await get(child(dbRef, `DomiMusic/PlayStatus/`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.isPlay = snapshot.val();
        }
      }).catch((error) => {
        console.error(error);
      });
    },

    getCode (url) { //전체 링크에서 영상 코드만 추출
      let videoID = '';
      if (url.includes('youtu.be/')) {
        videoID = url.split('youtu.be/')[1];
      } else if (url.includes('youtube.com/watch?v=')) {
        videoID = url.split('youtube.com/watch?v=')[1];
      } else if (url.includes('youtube.com/embed/')) {
        videoID = url.split('youtube.com/embed/')[1];
      } else if (url.includes('youtube.com/v/')) {
        videoID = url.split('youtube.com/v/')[1];
      } 
      const ampersandPosition = videoID.indexOf('&');
      if (ampersandPosition !== -1) {
        videoID = videoID.substring(0, ampersandPosition);
      }
      return videoID;
    },
    
    getTitle (key) {
      return key.split('-').slice(1).join('-');
    },

    getNowPlay (item) { //지금 플레이중인지, true/false
      const id = this.getCode(item);
      return id === this.videoId;
    },

    setPlayNameForDatabase () {
      const db = getDatabase();
      set(ref(db, `DomiMusic/PlayName/`), this.nowSingTitle);
      set(ref(db, `DomiMusic/PlayCode/`), this.videoId);
    },

    onClickChange (item) { //아이템을 눌러 노래 바꾸기
      this.videoId = this.getCode(item);
    },

    deleteItem (key) { //리스트에서 아이템 삭제
      const db = getDatabase();
      set(ref(db, `DomiMusic/MusicList/${key}/`), {});
      this.fetchList();
    },

    async fetchMusicItem () {
      const dbRef = ref(getDatabase(this.initializeApp));
      await get(child(dbRef, `DomiMusic/MusicList/`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.musicDataOnWeb = snapshot.val();
          this.playList = this.musicDataOnWeb;
          console.log('FETCH DATA\n', this.playList);
        } else {
          MakeToast(this, '데이터가 없습니다.', 'warning', 1200);
        }
      }).catch((error) => {
        console.error(error);
      });
    },
    
    async fetchList () {
      await this.fetchMusicItem();
      await this.fetchStatus();
    },
  },
  beforeMount () {
    const isChecked = localStorage.getItem('ISCHECKED');
    if (!isChecked) {
      const enteredPassword = prompt('비밀번호를 입력하세요', '');
      if (enteredPassword === '0000') {
        localStorage.setItem('ISCHECKED', 'Check');
      } else {
        localStorage.setItem('ISCHECKED', 'NoCheck');
        this.$router.replace({name: 'addmusic'})
      }
    } else {
      if (isChecked !== 'Check') {
        this.$router.replace({name: 'addmusic'})
      }
    }
  },
  async mounted() {
    this.initializeApp = initializeApp(firebaseConfig);
    await this.fetchList();

    this.videoId = this.playListId[0]; //제일 첫번째 목록에 있는 노래 자동재생
    this.setPlayStatusForDatabase(true);
  },
}
</script>

<style lang="scss" scoped>
  @keyframes rotate_image{
    100% {
      transform: rotate(360deg);
    }
  }
  @font-face {
    font-family: neon;
    src: url(../assets/fonts/neon.ttf);
  }
  .music-bottom-sheet {
    overflow-y: auto;
    .playList-item{
      border-bottom: 1px solid rgba(255,255,255,0.2);
      cursor: auto;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100px;
      padding: 0 30px;
      &.nowPlaying{
        background: rgba(222, 76, 75, 0.53)!important;
      }
      .info-wrap{
        text-align: left;
        .name{
          font-size: 22px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 250px;
        }
        .link{
        }
      }
      .control-wrap{
        .btn{
          cursor: pointer;
          background: #fff;
          text-align: center;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          img{
            width: 25px;
            height: 25px;
            margin-top: 7px;
            cursor: pointer;
          }
          .delete{         
            color: #000;
            line-height: 30px;
            font-weight: bold;
            font-size: 40px;
            
          }
        }
      }
    }
  }
  .wrap {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    .add-sing-dialog-wrap {
      z-index: 99999;
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      .add-sing-dialog {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 15px;
        background: linear-gradient(124deg, rgba(56,54,75,1) 0%, rgba(27,24,41,1) 100%);
        width: 600px;
        min-height: 500px;
        position: relative;
        padding: 60px 15px 15px 15px;
        .close {
          position: absolute;
          top: 15px;
          right: 15px;
        }
        .set-info-wrap {
          .numbering {
            min-width: max-content;
            font-size: 14px;
            margin-right: 7px;
          }
          .set-info {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 5px;
            &:last-child {
              margin-bottom: 0px;
            }
            input[type="text"] {
              width: 100%;
              height: 40px;
              padding: 0 12px;
              background: rgba(248, 248, 248, 0.682);
              &::placeholder{
                color: #000;
              }
              &:focus{
                outline: none !important;
                border-color: rgb(107, 176, 255);
                box-shadow: 0 0 10px rgb(60, 150, 253);
              }
            }
            .delete-item {
              height: 30px;
              min-width: 30px;
              margin-left: 7px;
              font-size: 16px;
              background: #fff;
              color: #333;
            }
          }
          .addArrBtn {
            width: 100%;
            font-size: 14px;
            line-height: 40px;
            margin-top: 12px;
          }
        }
      }
    }
    .main-sec {
      background: rgba(32, 32, 36, 0.45);
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .flux {
        margin-top: 20px;
        margin-bottom: 30px;
        font-family: neon;
        color: #be2264;
        font-size: 31px;
        margin-bottom: 10px;
        text-shadow: 0 0 1px #de4c4b;
        animation: flux 3s linear infinite;
          -moz-animation: flux 3s linear infinite;
          -webkit-animation: flux 3s linear infinite;
          -o-animation: flux 3s linear infinite;
      }
      @keyframes flux {
          0%,
          100% {
            text-shadow: 0 0 1vw #be2264, 0 0 3vw #be2264, 0 0 10vw #be2264, 0 0 10vw #be2264, 0 0 .4vw #ff3288, .5vw .5vw .1vw #ff3288;
            color: #ff3a79;
          }
          50% {
            text-shadow: 0 0 .5vw #de4c4b, 0 0 1.5vw #de4c4b, 0 0 5vw #de4c4b, 0 0 5vw #de4c4b, 0 0 .2vw #de4c4b, .5vw .5vw .1vw #5b1616;
            color: #de4c4b;
          }
      }
      .cd-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80%;
        height: 100%;
        .cd-wrap {
          position: relative;
          padding: 20px;
          width: 100%;
          max-width: 600px;
          .cd {
            width: 100%;
            animation: rotate_image 6s linear infinite;
            transform-origin: 50% 50%;
          }
          .cd-cover {
            position: absolute;
            padding: 10px;
            bottom: 0;
            width: 100%;
            left: 0;
            right: 0;
            height: 40%;
            backdrop-filter: blur(15px);
            background: rgba(0, 0, 0, 0.5);
            border-radius: 5px 5px 15px 15px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            flex-direction: column;
            .description{
              font-size: 15px;
              word-break: keep-all;
            }
            .control-btn-wrap {
              display: flex;
              flex-direction: row;
              align-items: center;
              .button {
                margin-right: 10px;
                &:last-child {
                  margin-right: 0;
                }
              }
              .refresh{
                width: 25px;
                height: 25px;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
  @media (max-width: 1070px) {
    .controlBar-wrap{
      height: 175px;
      .flux{
        top: 0px;
        left: 0px;
        position: relative;
        margin-bottom: 20px;
      }
      .btn-wrap{
        margin-top: 0px;
      }
    }
  }
  @media (max-width: 450px) {
    .playList-wrap{
      .playList-item{
        .info-wrap{
          .name{
            font-size: 15px;
            max-width: 150px;
          }
          .link{
            display: none;
          }
        }
      }
    }
  }
</style>
