(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  ready(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-to]"));
      var prev = carousel.querySelector("[data-slide-prev]");
      var next = carousel.querySelector("[data-slide-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          move(1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          show(parseInt(dot.getAttribute("data-slide-to"), 10));
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function() {
          move(-1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          move(1);
          start();
        });
      }
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function(scope) {
      var input = scope.querySelector("[data-search-input]");
      var clear = scope.querySelector("[data-clear-search]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var activeValue = "";

      function apply() {
        var query = text(input ? input.value : "").trim();
        var chip = text(activeValue).trim();
        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.textContent
          ].map(text).join(" ");
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedChip = !chip || haystack.indexOf(chip) !== -1;
          card.classList.toggle("is-hidden-card", !(matchedQuery && matchedChip));
        });
      }

      chips.forEach(function(chip) {
        chip.addEventListener("click", function() {
          chips.forEach(function(item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          activeValue = chip.getAttribute("data-filter-value") || "";
          apply();
        });
      });

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
        input.addEventListener("input", apply);
      }

      if (clear && input) {
        clear.addEventListener("click", function() {
          input.value = "";
          activeValue = "";
          chips.forEach(function(item, i) {
            item.classList.toggle("is-active", i === 0);
          });
          apply();
        });
      }

      apply();
    });
  });
}());
