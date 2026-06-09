import { H as Hls } from './hls-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var source = player.getAttribute('data-source');
  var hls = null;

  if (!video || !source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  }

  var start = function () {
    player.classList.add('is-playing');
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        player.classList.remove('is-playing');
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    player.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    player.classList.remove('is-playing');
  });
});
