(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = one('[data-menu-toggle]');
    var nav = one('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]');
    var prev = one('[data-hero-prev]');
    var next = one('[data-hero-next]');
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        render(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }

    render(0);
    start();
  }

  function setupSearch() {
    var roots = all('[data-search-page]');
    roots.forEach(function (root) {
      var keyword = one('#search-keyword', root);
      var region = one('#search-region', root);
      var type = one('#search-type', root);
      var year = one('#search-year', root);
      var cards = all('.movie-card', root);
      var empty = one('[data-search-empty]', root);

      function apply() {
        var q = normalize(keyword && keyword.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            ok = false;
          }
          if (selectedType && cardType !== selectedType) {
            ok = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  window.initializeMoviePlayer = function (streamUrl) {
    var video = one('[data-player-video]');
    var layer = one('[data-player-layer]');
    var button = one('[data-player-button]');
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function requestPlay() {
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          video.controls = true;
        });
      }
    }

    function bindStream() {
      if (attached) {
        requestPlay();
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', requestPlay, { once: true });
        requestPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        requestPlay();
        return;
      }

      video.src = streamUrl;
      requestPlay();
    }

    if (button) {
      button.addEventListener('click', bindStream);
    }
    if (layer) {
      layer.addEventListener('click', bindStream);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        bindStream();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
}());
