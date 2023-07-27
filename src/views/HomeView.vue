<template>
  <div class="wrap stars">
    <div class="small"></div>
    <div class="medium"></div>
    <div class="big"></div>
    <div class="controlBar-wrap">
      <div class="flux">Music Player</div>
      <div class="description">유투브 영상 링크를 복사하여 노래추가하기를 통해 노래를 추가해 주세요.</div>
      <div class="description">재생/일시정지를 임의로 조작하지 말아주세요..</div>
      <youtube-media :video-id="videoId" @ready="ready" @playing="playing" @ended="change" :player-vars="{autoplay: 1}" style="position: absolute; left: -9999px; top: -9999px; width: 0; height: 0"></youtube-media>
      <div class="playing-info-wrap">
        <div v-if="nowSingTitle.length" class="play-title">{{ nowSingTitle }}</div>
        <div v-else class="play-title">재생을 눌러주세요.</div>
      </div>
      <div class="btn-wrap">
        <img v-if="isPlay" @click="pause" src="../assets/images/pause-white.png"/>
        <img v-else @click="play" src="../assets/images/play-white.png"/>
        <img @click="change" src="../assets/images/skip-white.png"/>
      </div>
    </div>
    <!-- <div class="add-sing-wrap">
      <span v-if="!isAddSing" @click="isAddSing = true">노래 추가하기</span>
      <div v-if="isAddSing" class="add-sing-info">
        <div class="set-info">
          <input v-model="addSingTitle" placeholder="제목" type="text"/>
          <input v-model="addSingLink" placeholder="링크" type="text" style="margin-top: 7px;"/>
        </div>
        <div class="add-btn" @click="addSing">+</div>
      </div>
    </div> -->
    <div class="playList-wrap">
      <div v-if="!Object.keys(playList).length" class="not-set-sing">추가된 노래가 없습니다!</div>
      <div class="playList-item" :class="{nowPlaying: getNowPlay(item.link)}" v-for="(item, key, index) in playList" :key="`play-${index}`">
        <div class="info-wrap" @click="onClickChange(item.link)">
          <div class="name">{{ getTitle(key) }}</div>
          <div class="link">{{ item.link }}</div>
        </div>
        <div class="control-wrap">
          <div v-if="getNowPlay(item.link) && isPlay" @click="pause" class="btn">
            <img src="../assets/images/pause.svg"/>
          </div>
          <div v-else class="btn" @click="deleteItem(key)">
            <div class="delete">-</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, set} from "firebase/database";
import firebaseConfig from '../config/firebaseConfig'
export default {
  name: "HomeView",
  components: {
  },
  data() {
    return {
      isPlay: false,
      isAddSing: false,
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
      console.log('노래가 재생됩니다.\n', this.nowSingTitle);
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
      this.setPlayStatusForDatabase(false);
      this.player.pauseVideo();
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

    addSing() { //리스트에 아이템 추가
      this.fetchUpdate(true);
      this.addSingTitle = this.addSingLink = '';
      this.isAddSing = false;
    },

    deleteItem (key) { //리스트에서 아이템 삭제
      this.fetchUpdate(false, key);
    },

    fetchUpdate (isAdd, key) {
      const db = getDatabase();
      const nowDate = new Date();
      const timeStamp = nowDate.getTime();
      if(isAdd){
        set(ref(db, `DomiMusic/MusicList/${timeStamp}-${this.addSingTitle}/`), {link: this.addSingLink});
      }else{
        set(ref(db, `DomiMusic/MusicList/${key}/`), {});
      }
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
          console.log("No data available");
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
  
  async mounted() {
    this.initializeApp = initializeApp(firebaseConfig);
    await this.fetchList();

    this.videoId = this.playListId[0]; //제일 첫번째 목록에 있는 노래 자동재생
    this.setPlayStatusForDatabase(true);
  },
}
</script>

<style lang="scss" scoped>
@import url(../assets/styles/stars.css);
  @font-face {
    font-family: neon;
    src: url(../assets/fonts/neon.ttf);
  }
  .wrap{
    width: 100%;
    height: 100%;
    position: relative;
  }
  .controlBar-wrap{
    width: 100%;
    height: 150px;
    box-shadow: 0 14px 28px rgba(255,255,255,0.01), 0 10px 10px rgba(255,255,255,0.02);
    background: rgb(32, 32, 36);
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    position: relative;
    .playing-info-wrap{
      .play-title{
        font-size: 23px;
        font-weight: bold;
      }
    }
    .description{
      font-size: 13px;
    }
    .flux {
      position: absolute;
      top: 10px;
      left: 15px;
      font-family: neon;
      color: rgb(107, 176, 255);
      font-size: 21px;
      text-shadow: 0 0 1px rgb(60, 150, 253);
    }
    .flux {
        animation: flux 3s linear infinite;
        -moz-animation: flux 3s linear infinite;
        -webkit-animation: flux 3s linear infinite;
        -o-animation: flux 3s linear infinite;
    }
    @keyframes flux {
        0%,
        100% {
          text-shadow: 0 0 1vw #1041FF, 0 0 3vw #1041FF, 0 0 10vw #1041FF, 0 0 10vw #1041FF, 0 0 .4vw #8BFDFE, .5vw .5vw .1vw #147280;
          color: #28D7FE;
        }
        50% {
          text-shadow: 0 0 .5vw #082180, 0 0 1.5vw #082180, 0 0 5vw #082180, 0 0 5vw #082180, 0 0 .2vw #082180, .5vw .5vw .1vw #0A3940;
          color: #146C80;
        }
    }
    .btn-wrap{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 70px;
      height: 40px;
      margin-top: 20px;
      img{
        width: 20px;
        height: auto;
        cursor: pointer;
      }
    }
  }
  .add-sing-wrap{
    width: 100%;
    min-height: 50px;
    margin: 20px 0;
    padding: 13px 30px;
    background: rgba(187, 187, 187, 0.13);
    border: 1px solid #fff;
    span{
      cursor: pointer;
      font-size: 17px;
      font-weight: bold;
    }
    .add-sing-info{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      .set-info{
        display: flex;
        flex-direction: column;
        height: 100px;
        width: calc(100% - 96px);
        input{
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
      }
      .add-btn{
        color: #000;
        cursor: pointer;
        background: #fff;
        text-align: center;
        border-radius: 10px;
        width: 40px;
        height: 40px;
        color: #000;
        line-height: 30px;
        font-weight: bold;
        font-size: 40px;
      }
    }
  }
  .playList-wrap{
    width: 100%;
    height: 100%;
    padding: 0 30px;
    .nowPlaying{
      background: rgba(80, 162, 255, 0.53)!important;
    }
    .playList-item{
      border: 1px solid #fff;
      cursor: pointer;
      background: rgba(234, 234, 234, 0.053);
      margin-top: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100px;
      padding: 0 30px;
      border-radius: 15px;
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
