/**
 * NewsHub AI — app.js
 * Real-Time News Web App using GNews API
 */

// ============================================================
// CONFIGURATION
// ============================================================

const NEWS_API_KEY = '8ac704f9c56e77065bdd76914e4a787c';

const API_BASE = 'https://gnews.io/api/v4/search';

const MAX_ARTICLES = 10;


// ============================================================
// DOM REFERENCES
// ============================================================

const newsGrid = document.getElementById('newsGrid');
const spinnerWrapper = document.getElementById('spinnerWrapper');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const retryBtn = document.getElementById('retryBtn');
const searchBtn = document.getElementById('searchBtn');
const citySearch = document.getElementById('citySearch');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const sectionTitle = document.getElementById('sectionTitle');
const catButtons = document.querySelectorAll('.cat-btn');


// ============================================================
// APP STATE
// ============================================================

const state = {
  category: 'general',
  city: '',
  theme: 'dark',
};


// ============================================================
// THEME
// ============================================================

function toggleTheme() {

  state.theme =
    state.theme === 'dark'
      ? 'light'
      : 'dark';

  applyTheme(state.theme);

  localStorage.setItem(
    'newshub_theme',
    state.theme
  );
}

function applyTheme(theme) {

  document.documentElement.setAttribute(
    'data-theme',
    theme
  );

  themeIcon.textContent =
    theme === 'dark'
      ? '☀️'
      : '🌙';
}

function loadSavedTheme() {

  const savedTheme =
    localStorage.getItem('newshub_theme')
    || 'dark';

  state.theme = savedTheme;

  applyTheme(savedTheme);
}


// ============================================================
// UI HELPERS
// ============================================================

function showSpinner() {

  spinnerWrapper.removeAttribute('hidden');

  errorBox.setAttribute('hidden', '');

  newsGrid.innerHTML = '';
}

function hideSpinner() {

  spinnerWrapper.setAttribute('hidden', '');
}

function showError(message) {

  hideSpinner();

  errorMsg.textContent = message;

  errorBox.removeAttribute('hidden');
}

function hideError() {

  errorBox.setAttribute('hidden', '');
}

function updateSectionTitle() {

  let title = 'Latest Headlines';

  if (state.category !== 'general') {
    title = toTitleCase(state.category);
  }

  if (state.city) {
    title += ` — ${toTitleCase(state.city)}`;
  }

  sectionTitle.textContent = title;
}

function toTitleCase(str) {

  return str.replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function formatDate(dateString) {

  if (!dateString) return 'Unknown';

  const date = new Date(dateString);

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getCategoryLabel(category) {

  const labels = {
    general: '🌐 Top News',
    sports: '🏆 Sports',
    politics: '🏛️ Politics',
    technology: '💻 Technology',
    business: '📈 Business',
    entertainment: '🎬 Entertainment',
  };

  return labels[category] || '📰 News';
}

function getCategoryPlaceholder(category) {

  const placeholders = {
    general: '📰',
    sports: '⚽',
    politics: '🏛️',
    technology: '🤖',
    business: '💼',
    entertainment: '🎥',
  };

  return placeholders[category] || '📰';
}


// ============================================================
// API URL
// ============================================================

function buildApiUrl() {

  const params = new URLSearchParams();

  params.set('apikey', NEWS_API_KEY);

  params.set('max', MAX_ARTICLES);

  params.set('lang', 'en');

  params.set('sortby', 'publishedAt');

  let query = '';

  // City + Category
  if (state.city.trim()) {

    query = state.city.trim();

    if (state.category !== 'general') {
      query += ` ${state.category}`;
    }

  }

  // Category only
  else if (state.category !== 'general') {

    query = state.category;

  }

  // Default
  else {

    query = 'India';

  }

  params.set('q', query);

  return `${API_BASE}?${params.toString()}`;
}


// ============================================================
// FETCH NEWS
// ============================================================

async function fetchNews() {

  const url = buildApiUrl();

  if (NEWS_API_KEY === 'YOUR_GNEWS_API_KEY') {

    throw new Error(
      'Please add your GNews API key.'
    );
  }

  const response = await fetch(url, {
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data.errors?.[0]
      || 'Failed to fetch news.'
    );
  }

  if (!data.articles
      || data.articles.length === 0) {

    throw new Error(
      'No news articles found.'
    );
  }

  return data.articles;
}


// ============================================================
// CREATE NEWS CARD
// ============================================================

function createNewsCard(article) {

  const card = document.createElement('article');

  card.className = 'news-card';

  const imageSection =
    article.image
      ? `
      <img
        src="${article.image}"
        alt="${article.title}"
        class="card-img"
      />
    `
      : `
      <div class="card-img-placeholder">
        ${getCategoryPlaceholder(state.category)}
      </div>
    `;

  card.innerHTML = `

    <div class="card-img-wrapper">

      ${imageSection}

      <span class="card-ribbon">
        ${getCategoryLabel(state.category)}
      </span>

    </div>

    <div class="card-body">

      <div class="card-meta">

        <span class="card-source">
          ${article.source?.name || 'Unknown'}
        </span>

        <span class="card-date">
          ${formatDate(article.publishedAt)}
        </span>

      </div>

      <h3 class="card-title">
        ${article.title || 'No title'}
      </h3>

      <p class="card-desc">
        ${article.description || ''}
      </p>

    </div>

    <div class="card-footer">

      <a
        href="${article.url}"
        target="_blank"
        class="read-more-btn"
      >
        Read More →
      </a>

    </div>
  `;

  return card;
}


// ============================================================
// RENDER ARTICLES
// ============================================================

function renderArticles(articles) {

  newsGrid.innerHTML = '';

  articles.forEach((article) => {

    const card = createNewsCard(article);

    newsGrid.appendChild(card);

  });
}


// ============================================================
// LOAD NEWS
// ============================================================

async function loadNews() {

  showSpinner();

  hideError();

  updateSectionTitle();

  try {

    const articles = await fetchNews();

    hideSpinner();

    renderArticles(articles);

  } catch (error) {

    console.error(error);

    showError(error.message);

  }
}


// ============================================================
// CATEGORY CLICK
// ============================================================

function handleCategoryClick(e) {

  const button = e.currentTarget;

  const category = button.dataset.category;

  state.category = category;

  catButtons.forEach((btn) => {

    btn.classList.remove('active');

    btn.setAttribute('aria-pressed', 'false');

  });

  button.classList.add('active');

  button.setAttribute('aria-pressed', 'true');

  loadNews();
}


// ============================================================
// SEARCH
// ============================================================

function handleSearch() {

  state.city =
    citySearch.value.trim();

  loadNews();
}


// ============================================================
// INIT APP
// ============================================================

function init() {

  loadSavedTheme();

  catButtons.forEach((btn) => {

    btn.addEventListener(
      'click',
      handleCategoryClick
    );

  });

  searchBtn.addEventListener(
    'click',
    handleSearch
  );

  citySearch.addEventListener(
    'keydown',
    (e) => {

      if (e.key === 'Enter') {

        handleSearch();

      }

    }
  );

  retryBtn.addEventListener(
    'click',
    loadNews
  );

  themeToggle.addEventListener(
    'click',
    toggleTheme
  );

  // Auto refresh every 5 min
  setInterval(loadNews, 300000);

  // First load
  loadNews();
}


// ============================================================
// START APP
// ============================================================

document.addEventListener(
  'DOMContentLoaded',
  init
);