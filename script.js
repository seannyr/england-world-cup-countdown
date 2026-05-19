const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";


let fixtures = [];
let englandFixtures = [];

// LOAD DATA
async function loadData() {
  try {
    const res = await fetch(
      `${BASE_URL}/fixtures?team=10&season=2026`,
      { headers: { "x-apisports-key": API_KEY } }
    );

    const data = await res.json();

    if (data.response && data.response.length > 0) {
      fixtures = data.response.map(m => ({
        date: m.fixture.date,
        home: m.teams.home.name,
        away: m.teams.away.name,
        venue: m.fixture.venue.name
      }));
    } else {
      throw "API empty";
    }

  } catch {
    const res = await fetch("fixtures.json");
    const data = await res.json();
    fixtures = data;
  }

  init();
}

// INIT
function init() {
  fixtures.sort((a,b) => new Date(a.date) - new Date(b.date));

  englandFixtures = fixtures.filter(f =>
    f.home === "England" || f.away === "England"
  );

  renderFirstMatch();
  renderEnglandFixtures();

  setInterval(updateCountdowns, 1000);
}

// FIRST MATCH (GLOBAL)
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card highlight">
      <h2>🌍 ${first.home} vs ${first.away}</h2>
      <p>📍 ${first.venue}</p>
      <p>🗓 ${new Date(first.date).toLocaleString("en-GB")}</p>
      <div class="big-count" data-date="${first.date}"></div>
    </div>
  `;
}

// ENGLAND FIXTURES LIST
function renderEnglandFixtures() {
  const container = document.getElementById("england-fixtures");

  container.innerHTML = englandFixtures.map(f => `
    <div class="card england-card">
      <h3>${f.home} vs ${f.away}</h3>
      <p>📍 ${f.venue}</p>
      <p>🗓 ${new Date(f.date).toLocaleString("en-GB")}</p>
      <div class="big-count" data-date="${f.date}"></div>
    </div>
  `).join("");
}

// UPDATE ALL COUNTDOWNS
function updateCountdowns() {
  const elements = document.querySelectorAll(".big-count");

  elements.forEach(el => {
    const target = new Date(el.getAttribute("data-date"));
    const now = new Date();

    const diff = target - now;

    if (diff <= 0) {
      el.innerHTML = "⚽ LIVE ⚽";
      return;
    }

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);

    el.innerHTML = `⏳ ${d}d ${h}h ${m}m`;
  });
}

loadData();

