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
  }

  //turningColorCard() {
  //  [...document.querySelectorAll(".song-elem")].forEach((el) => {
  //    if (this.checkLikeList(el.id)) {
  //      el.style.background = "#302361c8";
  //    } else {
  //      el.style.background = "#413571c8";
  //    }
  //  });
  //}

  onInputChange(e) {
    if (this.currentSection === AudioPlayer.SECTION.likeList) {
      const songs = this.getLikeListData();
      const filteredSongs = songs.filter(({ title }) =>
        title.toLowerCase().includes(e.target.value.toLowerCase())
      );

      this.renderData(filteredSongs, AudioPlayer.likeListOutput, true);
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
		<span>Author: ${name}</span>
		<span>Album: ${titleAlbum}</span>
		<span>&#10030; ${rank}</span>
		
       <div>
      <div>
      <audio src="${preview}"></audio>
      </div>
     <div>
    <button id="btn-${id}" class="add-likelist-btn">${
        ifSongAddedToLikeList ? "Delete from likelist" : "Add LikeList"
      }</button>
     </div>
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

            //this.turningColorCard();

            btn.textContent = "Add LikeList";
            const buttonFromMusicOutput = AudioPlayer.musicOutput.querySelector(
              `#${btn.id}`
            );
            const buttonFromLikeListOutput =
              AudioPlayer.likeListOutput.querySelector(`#${btn.id}`);

            if (buttonFromMusicOutput)
              buttonFromMusicOutput.textContent = "Add LikeList";
            if (buttonFromLikeListOutput)
              buttonFromLikeListOutput.textContent = "Add LikeList";
          } else {
            this.addLikeList(currentSong);

            //this.turningColorCard();

            btn.textContent = "Delete from likelist";

            const buttonFromMusicOutput = AudioPlayer.musicOutput.querySelector(
              `#${btn.id}`
            );
            const buttonFromLikeListOutput =
              AudioPlayer.likeListOutput.querySelector(`#${btn.id}`);

            if (buttonFromMusicOutput)
              buttonFromMusicOutput.textContent = "Delete from likelist";
            if (buttonFromLikeListOutput)
              buttonFromLikeListOutput.textContent = "Delete from likelist";
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
