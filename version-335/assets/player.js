(function () {
  function mountPlayer(playUrl) {
    var root = document.querySelector('.watch-player');
    if (!root) {
      return;
    }

    var video = root.querySelector('video');
    var overlay = root.querySelector('.play-overlay');
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }

      prepared = true;
    }

    function startPlayback() {
      prepare();
      root.classList.add('playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        root.classList.add('playing');
      });
      video.addEventListener('ended', function () {
        root.classList.remove('playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.mountPlayer = mountPlayer;
})();
