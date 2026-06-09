(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
        showSlide(nextIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var queryInputs = Array.prototype.slice.call(document.querySelectorAll('[data-query-input]'));
  if (queryInputs.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    queryInputs.forEach(function (input) {
      input.value = query;
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;

        if (keyword && searchText.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]')).forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var player = document.querySelector('[data-player]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var playButton = player.querySelector('[data-play-button]');
        if (playButton) {
          window.setTimeout(function () {
            playButton.click();
          }, 320);
        }
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var source = player.getAttribute('data-source');
    var video = player.querySelector('[data-video]');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function requestPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('请再次点击播放按钮开始播放');
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    function initPlayer() {
      if (!video || !source) {
        setStatus('当前播放源暂不可用');
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');

      if (initialized) {
        requestPlay();
        return;
      }

      initialized = true;
      setStatus('正在加载高清播放源');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
          requestPlay();
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          requestPlay();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面重试');
          }
        });
        return;
      }

      video.src = source;
      video.load();
      requestPlay();
    }

    if (button) {
      button.addEventListener('click', initPlayer);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!initialized) {
          initPlayer();
        } else if (video.paused) {
          requestPlay();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setStatus('');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
