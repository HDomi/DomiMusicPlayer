<template>
    <div class="wrap">
      <div class="add-sing-dialog-wrap" v-show="isAddSing">
        <div class="add-sing-dialog">
          <div class="button close" @click="closeAddSing()">x</div>
          <div class="set-info-wrap">
            <div v-for="(item, idx) in addSingArr" :key="`${idx}`" class="set-info">
              <div class="numbering">{{ idx + 1 }} 번: </div>
              <input v-model="item.title" placeholder="제목" type="text" @input="validateInput"/>
              <input v-model="item.link" placeholder="링크" type="text" />
              <div class="button delete-item" @click="deleteAddSingItem(idx)">x</div>
            </div>
            <div v-if="addSingArrLength" class="button addArrBtn" @click="addSingArray()">목록 추가</div>
          </div>
          <div class="button big-button" @click="addSing">노래추가</div>
        </div>
      </div>
      <div class="music-list">
        <div class="flux" @click="clearLocalStorage()">Music Player</div>
        <div v-if="!Object.keys(playList).length" class="not-set-sing">추가된 노래가 없습니다!</div>
        <div class="playList-item" :class="{nowPlaying: getNowPlay(item.link)}" v-for="(item, key, index) in playList" :key="`play-${index}`">
          <div class="info-wrap">
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
      </div>
      <div class="main-sec">
        <div class="cd-content">
          <div class="cd-wrap">
            <img class="cd" src="../assets/images/img_cd.svg" />
            <div class="cd-cover">
              <div class="description">유투브 영상 링크를 복사하여 노래추가하기를 통해 노래를 추가해 주세요.<br/>추가하시기전에 한번씩 새로고침</div>
              <div class="control-btn-wrap">
                <div class="button" @click="openAddSing()">+</div>
                <div class="button" @click="fetchList"><img src="../assets/images/refresh-w.png"  class="refresh"/></div>
              </div>
            </div>
          </div>
        </div>    
      </div>
    </div>
  </template>
  
  <script>
  import { initializeApp } from "firebase/app";
  import { getDatabase, ref, get, child, set} from "firebase/database";
  import firebaseConfig from '../config/firebaseConfig';
  import MakeToast from '../utils/MakeToast';
  export default {
    name: "AddMusic",
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
  
        addSingArr: [],
        addSingTitle: '',
        addSingLink: '',
      };
    },
    computed: {
      addSingArrLength: {
        get () {
          return this.addSingArr.length < 7;
        }
      }
    },
    methods: {
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
  
      fetchNowPlayCode () {
        const dbRef = ref(getDatabase(this.initializeApp));
        get(child(dbRef, `DomiMusic/PlayCode/`)).then((snapshot) => {
          if (snapshot.exists()) {
            this.videoId = snapshot.val();
          }
        }).catch((error) => {
          console.error(error);
        });
      },

      getNowPlay (item) { //지금 플레이중인지, true/false
        const id = this.getCode(item);
        return this.videoId === id && id !== '';
      },
  
      openAddSing () {
        this.addSingArr = [];
        this.addSingArr.push(
          {
            title: '',
            link: ''
          }
        )
        this.isAddSing = true;
      },

      closeAddSing () {
        this.isAddSing = false;
      },

      addSingArray () {
        this.addSingArr.push(
          {
            title: '',
            link: ''
          }
        )
      },
      
      deleteAddSingItem (idx) {
        this.addSingArr.splice(idx, 1);
      },

      addSing() { //리스트에 아이템 추가
        const checkArr = this.addSingArr.filter((v) => v.title === '' || v.link === '');
        if (checkArr.length) {
          MakeToast(this, '완료되지 않은 리스트가 있습니다.', 'error', 1200);
          return;
        }
        const db = getDatabase();
        this.addSingArr.forEach((v) => {
        const nowDate = new Date();
        const timeStamp = nowDate.getTime();
          set(ref(db, `DomiMusic/MusicList/${timeStamp}-${v.title}/`), {link: v.link});
        });
        
        this.fetchList();
        this.isAddSing = false;
      },
  
      deleteItem (key) { //리스트에서 아이템 삭제
        const db = getDatabase();
        set(ref(db, `DomiMusic/MusicList/${key}/`), {});
        this.fetchList();
      },
  
      validateInput() {
        if (this.addSingTitle.includes("-")) {
          this.addSingTitle = this.addSingTitle.replace(/-/g, "");
        }
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
        await this.fetchNowPlayCode();
      },
      clearLocalStorage () {
        localStorage.removeItem('ISCHECKED');
        MakeToast(this, '체크데이터가 삭제되었습니다.', 'warning', 1200);
      }
    },
    
    async mounted() {
      this.initializeApp = initializeApp(firebaseConfig);
      await this.fetchList();
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
        background: rgba(0, 0, 0, 0.2);
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
      .music-list {
        overflow-y: auto;
        min-width: 400px;
        max-width: 400px;
        height: 100%;
        border-right: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 14px 28px rgba(255,255,255,0.01), 0 10px 10px rgba(255,255,255,0.02);
        background: rgba(32, 32, 36, 0.45);
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
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 250px;
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
      .main-sec {
        background: rgba(32, 32, 36, 0.45);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
  