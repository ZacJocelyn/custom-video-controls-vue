
Vue.component('control-bar' , {
  template: '#control-bar',
  data: function() {
    return {
      playing: 'pause',
      muted: 'volume_up',
      percentage: 0,
      totalTime: 0,
      elapsedTime: 0,
      currentTime: 0,
      time: 0,
      preVids: 0,
      ready: '',
      playPauseState: '',
      seeked: '',
      source: '',
      ended: '',
      vidDuration: '',
      currentVid: 0,
      currentVid2: 0,
      timeChange: '',
    }
  },
  ready: function () {
    var data = this
    videojs('vid1').on('waiting', function() {
      data.ready = 'Video is ready';
      data.vidDuration = 'Current video duration ' + fancyTimeFormat(this.duration());
    })
    videojs('vid1').on('ended', function() {
      data.preVids += this.duration();
      data.currentVid ++;
      data.ended = 'Video has ended';
    })
    videojs('vid1').on('timeupdate', function() {
      if (data.currentVid !== data.currentVid2) {
        data.source = 'Video source has been changed';
        data.currentVid2 = data.currentVid
      }
      var currentTime = this.currentTime() + data.preVids
      var percentage = Math.floor((100 / data.time) *
      currentTime);
      data.percentage = percentage;
      var progressBar = document.getElementById('progress-bar')
      progressBar.value = data.percentage;
      data.elapsedTime = fancyTimeFormat(currentTime);
      data.currentTime = currentTime;
    })
    getVidArrDuration(this.$root.videoDurations, this.$root.videos)
    function getVidArrDuration(durations, videos) {
      if (durations.length !== videos.length) {
        setTimeout(function() {
          return getVidArrDuration(durations, videos)
        }, 500)
      }else {
        for (var i = 0; i < durations.length; i++) {
          data.time += durations[i];
        }
        data.totalTime = fancyTimeFormat(data.time);
      }
    }
    function fancyTimeFormat(time) {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = Math.floor(time % 60);
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
  },
  methods: {
    fancyTimeFormat: function (time) {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = Math.floor(time % 60);
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    },
    togglePlayPause: function() {
      if (!videojs('vid1').paused()) {
        this.playPauseState = 'Video has been paused'
        this.playing = 'play_arrow';
        videojs('vid1').pause();
      }else {
        this.playPauseState = 'Video has been played'
        this.playing = 'pause';
        videojs('vid1').play();
      }
    },
    videoScrubbing : function(e) {
      var currentTime = this.currentTime;
      var pos = (e.pageX  - e.target.offsetLeft) / e.target.offsetWidth;
      var preVids = 0;
      var myPlayer = videojs('vid1');
      var videos = this.$root.videos;
      var videoDurations = this.$root.videoDurations;
      var clickTime = pos * this.time;
      for (var i = 0; i < videos.length; i++) {
        if (clickTime > preVids + videoDurations[i]){
            myPlayer.src(videos[i])
            preVids += videoDurations[i];
        }else {
          this.currentVid = i;
          myPlayer.src(videos[i])
          break;
        }
      }
      setTimeout(() => {
        this.preVids = preVids;
        myPlayer.currentTime(clickTime - preVids);
      }, 500)
      if (currentTime > clickTime) {
        this.seeked = 'Video has been seeked backwards'
      }else if (currentTime < clickTime) {
        this.seeked = 'Video has been seeked forwards'
      }
      this.timeChange = 'Current time has changed ' + this.fancyTimeFormat(clickTime);
    },
    toggleMute: function() {
      if (videojs('vid1').volume() === 1) {
        videojs('vid1').volume(0);
        this.muted = 'volume_off';
      }else if (videojs('vid1').volume() === 0) {
        videojs('vid1').volume(1);
        this.muted = 'volume_up';
      }
    },
  },
})


 var vm = new Vue({
  el: '#app',
  data: function() {
    return {
      videos: [{ type: "video/youtube", src: "https://www.youtube.com/watch?v=7CVtTOpgSyY"},{ type: "application/x-mpegURL", src: "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8"}, ],
      videoDurations: [],
      show: true,
    }
  },
  ready: function () {
    var videos = this.videos;
    var videoDurations = this.videoDurations
    var show = this.show
    videojs('vid1').ready(function () {
      var myPlayer = this;
      var x = 0;
      myPlayer.controls(false);
      getVideoDuration(0, videos);
      function getVideoDuration(i, videos) {
        if (i === videos.length) {
          myPlayer.src(videos[0]);
          return videos;
        }else {
          myPlayer.src(videos[i])
          if (videos[i].type === 'video/youtube') {
            myPlayer.on('waiting', function() {
              if (videoDurations.length === videos.length) {
                return videos;
              }else {
                videoDurations[i] = myPlayer.duration();
                i++
                return getVideoDuration(i, videos);
              }
            })
          }else {
            myPlayer.on('loadedmetadata', function() {
              if (videoDurations.length === videos.length) {
                return videos;
              }else {
                videoDurations[i] = myPlayer.duration();
                i++
                return getVideoDuration(i, videos);
              }
            })
          }
        }
      }
      myPlayer.on('ended', function() {
        x ++;
        myPlayer.src(videos[x]);
      });
    });
    videoDurations.pop();
  }
});
