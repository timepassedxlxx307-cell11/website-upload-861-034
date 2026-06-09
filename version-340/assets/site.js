(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-card-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var pills = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (input && q) {
      input.value = q;
    }

    var active = {};

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var matchText = !query || cardText(card).indexOf(query) !== -1;
        var matchFilters = Object.keys(active).every(function (key) {
          if (!active[key]) {
            return true;
          }
          return String(card.getAttribute("data-" + key)) === String(active[key]);
        });
        var show = matchText && matchFilters;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var key = pill.getAttribute("data-filter-key");
        var value = pill.getAttribute("data-filter-value");
        var selected = active[key] === value;
        active[key] = selected ? "" : value;
        pills.filter(function (item) {
          return item.getAttribute("data-filter-key") === key;
        }).forEach(function (item) {
          item.classList.toggle("is-active", !selected && item.getAttribute("data-filter-value") === value);
        });
        apply();
      });
    });

    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      if (!video) {
        return;
      }

      function start() {
        var src = video.getAttribute("data-play");
        if (!src) {
          return;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.getAttribute("src")) {
            video.setAttribute("src", src);
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsReady) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            video.__hlsReady = true;
          }
          video.play().catch(function () {});
          return;
        }
        if (!video.getAttribute("src")) {
          video.setAttribute("src", src);
        }
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.getAttribute("src")) {
          return;
        }
        if (event.target.closest(".player-cover") || event.target === shell) {
          start();
        }
      });
    });
  }
})();
