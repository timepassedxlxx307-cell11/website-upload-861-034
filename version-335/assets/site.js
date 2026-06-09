(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  }

  var searchForms = document.querySelectorAll('[data-site-search]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function readQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  var filterList = document.querySelector('[data-filter-list]');
  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterList && filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
    var emptyState = filterList.querySelector('[data-empty-state]');

    if (searchInput) {
      searchInput.value = readQueryParam('q');
    }

    function matchCard(card) {
      var query = searchInput ? normalize(searchInput.value) : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var haystack = normalize(card.getAttribute('data-haystack'));
      var queryMatch = !query || haystack.indexOf(query) !== -1;
      var regionMatch = !region || card.getAttribute('data-region') === region;
      var typeMatch = !type || card.getAttribute('data-type') === type;
      var yearMatch = !year || card.getAttribute('data-year') === year;
      return queryMatch && regionMatch && typeMatch && yearMatch;
    }

    function applyFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var matched = matchCard(card);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
