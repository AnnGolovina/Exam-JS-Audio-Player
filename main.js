class AudioPlayer {
  static API_KEY = "b61d5b3e02msh16e35800987adb5p146679jsnc12f4cbb5316";
  static SEARCH_URL = "https://deezerdevs-deezer.p.rapidapi.com/search?q=";
  static DEFAULT_HEADERS = {
    "X-RapidAPI-Key": AudioPlayer.API_KEY,
    "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
  };

  static searchInput = document.querySelector("input");
  static searchBtn = document.querySelector("#search-btn");

  static searchListBtn = document.querySelector("#search-page-btn");
  static likeListBtn = document.querySelector("#likelist-page-btn");
  static likeListOutput = document.querySelector(".likelist-output");
  static musicOutput = document.querySelector(".music-output");
  static rankBtn = document.querySelector(".rank-btn");

  static SECTION = {
    searchList: "searchList",
    likeList: "likeList",
  };

  constructor(data = [], musicList = []) {
    this.data = data;
    this.musicList = musicList;
    this.currentSection = AudioPlayer.SECTION.searchList;

    AudioPlayer.searchBtn.onclick = () => this.onSearchButtonClick();
    AudioPlayer.likeListBtn.onclick = () => this.renderLikeList();
    AudioPlayer.searchListBtn.onclick = () => this.renderMusicList();
    AudioPlayer.searchInput.oninput = (e) => this.onInputChange(e);
    AudioPlayer.rankBtn.onclick = () => this.onRankBtnSort();
    //AudioPlayer.audioBtn.onclick = () => this.onPlayAudioBtn();
  }

  onInputChange(e) {
    if (this.currentSection === AudioPlayer.SECTION.likeList) {
      const songs = this.getLikeListData();
      const filteredSongs = songs.filter(({ title }) =>
        title.toLowerCase().includes(e.target.value.toLowerCase())
      );

      this.renderData(filteredSongs, AudioPlayer.likeListOutput, true);
    }
  }

  onRankBtnSort() {
    if (this.currentSection === AudioPlayer.SECTION.likeList) {
      const songs = this.getLikeListData();
      const sortSongs = songs.sort((rank1, rank2) => rank2.rank - rank1.rank);
      this.renderData(sortSongs, AudioPlayer.likeListOutput, true);
    }
    if (this.currentSection === AudioPlayer.SECTION.searchList) {
      this.getDataBySearch(AudioPlayer.SECTION.searchList).then(() => {
        const songs = this.data;
        const sortSongs = songs.sort((rank1, rank2) => rank2.rank - rank1.rank);
        this.renderData(sortSongs, AudioPlayer.musicOutput, true);
      });
    }
  }

  onSearchButtonClick() {
    this.getDataBySearch(AudioPlayer.searchInput.value).then(() => {
      AudioPlayer.searchInput.value = "";
      console.log("Data", this.data);

      this.renderData(this.data, AudioPlayer.musicOutput);
    });
  }

  async getDataBySearch(audioName = "") {
    try {
      const response = await fetch(AudioPlayer.SEARCH_URL + audioName, {
        headers: AudioPlayer.DEFAULT_HEADERS,
      });
      const data = await response.json();
      console.log(data.data, "!!!!");

      this.data = data.data;

      //if (this.data === undefined) {
      //  alert("Try to write the author again!");
      //}
    } catch (err) {
      alert("Data is not recognized");
    }
  }

  getLikeListData() {
    return JSON.parse(localStorage.getItem("likeList") || "[]");
  }

  addLikeList(song) {
    const oldLikeList = this.getLikeListData();
    localStorage.setItem("likeList", JSON.stringify([...oldLikeList, song]));
  }

  removeLikeListDaata(id) {
    const oldLikeList = this.getLikeListData();
    localStorage.setItem(
      "likeList",
      JSON.stringify([...oldLikeList].filter((song) => song.id !== id))
    );
  }

  checkLikeList(id) {
    return this.getLikeListData().find((song) => song.id === id) ? true : false;
  }

  renderData(
    dataToRender,
    outputElement = AudioPlayer.musicOutput,
    isUsingAsLikeList = false
  ) {
    outputElement.innerHTML = "";

    dataToRender.forEach((song) => {
      const { id, title, rank, preview, artist, album } = song;
      const { name, picture } = artist;
      const { title: titleAlbum, cover } = album;

      const ifSongAddedToLikeList = this.checkLikeList(id);

      outputElement.innerHTML += `
	 <div class="song-elem ${ifSongAddedToLikeList ? "likeListSong" : ""}">
     <div class="img-wrapper">
       <img src="${cover}">
     </div>    
	    	<h4>${title}</h4>
           <div>
		         <span>Author: ${name}</span>
		         <span>Album: ${titleAlbum}</span>		
           </div>
           <div class="rank-wrapper">
             <p>&#10030; ${rank}</p>
           </div>
        <div>
           <audio id="aud-${id}" src="${preview}"></audio>
        </div>
           <div class="button-panel">
              <button class="audio-btn"><img src="assets/play.png" width="20" height="20"/></button>
              <button id="btn-${id}" class="add-likelist-btn">${
        ifSongAddedToLikeList
          ? '<img src="assets/like.png" width="20" height="20"/>'
          : '<img src="assets/unlike.png" width="20" height="20"/>'
      }</button>
           </div>
         </div>
       `;

      const addLikeListBtn =
        this.currentSection === AudioPlayer.SECTION.searchList
          ? AudioPlayer.musicOutput.querySelectorAll(".add-likelist-btn")
          : AudioPlayer.likeListOutput.querySelectorAll(".add-likelist-btn");

      [...addLikeListBtn].forEach((btn, i) => {
        btn.onclick = () => {
          const currentSong = dataToRender[i];
          if (this.checkLikeList(currentSong.id)) {
            this.removeLikeListDaata(currentSong.id);

            isUsingAsLikeList &&
              this.renderData(
                this.getLikeListData(),
                AudioPlayer.likeListOutput,
                true
              );

            btn.textContent = "Add LikeList";
            const buttonFromMusicOutput = AudioPlayer.musicOutput.querySelector(
              `#${btn.id}`
            );
            const buttonFromLikeListOutput =
              AudioPlayer.likeListOutput.querySelector(`#${btn.id}`);

            if (buttonFromMusicOutput)
              buttonFromMusicOutput.innerHTML =
                '<img src="assets/unlike.png" width="20" height="20"/>';
            if (buttonFromLikeListOutput)
              buttonFromLikeListOutput.innerHTML =
                '<img src="assets/unlike.png" width="20" height="20"/>';
          } else {
            this.addLikeList(currentSong);

            btn.textContent = "Delete from likelist";

            const buttonFromMusicOutput = AudioPlayer.musicOutput.querySelector(
              `#${btn.id}`
            );
            const buttonFromLikeListOutput =
              AudioPlayer.likeListOutput.querySelector(`#${btn.id}`);

            if (buttonFromMusicOutput)
              buttonFromMusicOutput.innerHTML =
                '<img src="assets/like.png" width="20" height="20"/>';
            if (buttonFromLikeListOutput)
              buttonFromLikeListOutput.innerHTML =
                '<img src="assets/like.png" width="20" height="20"/>';
          }
        };
      });

      const audioPlayBtn =
        this.currentSection === AudioPlayer.SECTION.searchList
          ? AudioPlayer.musicOutput.querySelectorAll(".audio-btn")
          : AudioPlayer.likeListOutput.querySelectorAll(".audio-btn");

      [...audioPlayBtn].forEach((btn, i) => {
        btn.onclick = (e) => {
          const currentSong = dataToRender[i];

          const audio = document.querySelector(`#aud-${currentSong.id}`);
          if (audio.paused) {
            audio.play();
            btn.innerHTML = `<img src="assets/pause.png" width="20" height="20"/>`;
          } else {
            audio.pause();
            btn.innerHTML = `<img src="assets/play.png" width="20" height="20"/>`;
          }
        };
      });
    });
  }

  renderLikeList() {
    AudioPlayer.likeListOutput.style.display = "flex";
    AudioPlayer.musicOutput.style.display = "none";
    AudioPlayer.searchBtn.style.display = "none";

    this.currentSection = AudioPlayer.SECTION.likeList;

    const dataLikeList = this.getLikeListData();
    this.renderData(dataLikeList, AudioPlayer.likeListOutput, true);
  }

  renderMusicList() {
    AudioPlayer.musicOutput.style.display = "flex";
    AudioPlayer.likeListOutput.style.display = "none";
    AudioPlayer.searchBtn.style.display = "flex";

    this.currentSection = AudioPlayer.SECTION.searchList;
  }
}

new AudioPlayer();
