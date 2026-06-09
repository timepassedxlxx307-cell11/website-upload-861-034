(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartHero();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    showSlide(0);
    restartHero();

    var searchForm = document.querySelector("[data-global-search]");

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = searchForm.querySelector("input");
        var keyword = input ? input.value.trim() : "";
        var target = "search.html";

        if (keyword) {
          target += "?q=" + encodeURIComponent(keyword);
        }

        window.location.href = target;
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var movieSearch = document.querySelector("#movie-search");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

    function applyFilters() {
      var keyword = normalize(movieSearch ? movieSearch.value : "");
      var filters = {};

      filterSelects.forEach(function (select) {
        filters[select.getAttribute("data-filter-select")] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
        var visible = !keyword || haystack.indexOf(keyword) !== -1;

        Object.keys(filters).forEach(function (key) {
          var value = filters[key];

          if (value && normalize(card.getAttribute("data-" + key)) !== value) {
            visible = false;
          }
        });

        card.classList.toggle("hidden-by-filter", !visible);
      });
    }

    if (movieSearch || filterSelects.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && movieSearch) {
        movieSearch.value = query;
      }

      if (movieSearch) {
        movieSearch.addEventListener("input", applyFilters);
      }

      filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });

      applyFilters();
    }
  });
})();
