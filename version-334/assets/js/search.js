(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var movies = window.MOVIE_SEARCH_DATA || [];

  if (!form || !input || !results) {
    return;
  }

  var escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  var renderCard = function (movie) {
    var tag = movie.tags && movie.tags.length ? movie.tags[0] : movie.type;

    return [
      '<article class="movie-card search">',
      '  <a class="movie-cover" href="' + escapeHtml(movie.link) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="badge year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(tag) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  };

  var search = function () {
    var keyword = input.value.trim().toLowerCase();

    if (!keyword) {
      var initial = movies.slice(0, 12);
      results.innerHTML = initial.map(renderCard).join('');
      status.textContent = '热门搜索：剧情、悬疑、爱情、动作、科幻、家庭';
      return;
    }

    var matched = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return text.indexOf(keyword) !== -1;
    }).slice(0, 80);

    results.innerHTML = matched.map(renderCard).join('');
    status.textContent = matched.length ? '已找到相关影片' : '没有找到匹配影片';
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    search();
  });

  input.addEventListener('input', search);
})();
