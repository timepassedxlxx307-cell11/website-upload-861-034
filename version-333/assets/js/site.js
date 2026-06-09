(function () {
  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = queryAll("[data-hero-slide]", carousel);
    var dots = queryAll("[data-hero-dot]", carousel);
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-region-filter]");
    var type = document.querySelector("[data-type-filter]");
    var year = document.querySelector("[data-year-filter]");
    var cards = queryAll("[data-search-card]");
    var empty = document.querySelector("[data-no-results]");

    if (!cards.length) {
      return;
    }

    if (input && !input.value) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function apply() {
      var term = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));

        var matched =
          (!term || haystack.indexOf(term) !== -1) &&
          (!regionValue || cardRegion.indexOf(regionValue) !== -1) &&
          (!typeValue || cardType.indexOf(typeValue) !== -1) &&
          (!yearValue || cardYear === yearValue);

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var hls = null;

    if (!video || !button || !overlay || !streamUrl) {
      return;
    }

    function start() {
      if (!video.getAttribute("data-ready")) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.setAttribute("data-ready", "1");
      }

      overlay.classList.add("is-hidden");
      var playState = video.play();
      if (playState && typeof playState.catch === "function") {
        playState.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!video.getAttribute("data-ready")) {
        start();
      } else if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
