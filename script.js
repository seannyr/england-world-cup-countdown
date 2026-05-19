const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";

let fixtures = [];
let englandFixtures = [];
let currentMatch = null;

// ----------------------------
// LOAD DATA (API FIRST, FALLBACK SECOND)
// ----------------------------
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
        venue: m.fixture.venue.name,
        id: m.fixture.id
      }));
    } else {
      throw "No API data";
    }

  } catch {
    console.log("Using fallback JSON");

    const res = await fetch("fixtures.json");
    const data = await res.json();

    fixtures = data.map(f => ({ ...f, id: null }));
  }

  init();
}

// ----------------------------
// INIT
// ----------------------------
function init() {
  fixtures.sort((a,b) => new Date(a.date) - new Date(b.date));

  englandFixtures = fixtures.filter(f =>
    f.home === "England" || f.away === "England"
  );

  renderFirstMatch();

  setInterval(updateEverything, 1000);
}

// ----------------------------
function getNextEnglandMatch() {
  const now = new Date();
  return englandFixtures.find(m => new Date(m.date) > now);
}

// ----------------------------
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card glitch">
      <h2>${first.home} vs ${first.away}</h2>
      <p>📍 ${first.venue}</p>
    </div>
  `;
}

// ----------------------------
function updateEverything() {
  const now = new Date();

  updateCountdown("global-countdown", new Date(fixtures[0].date), now);

  currentMatch = getNextEnglandMatch();

  if (!currentMatch) return;

  document.getElementById("england-match").innerHTML = `
    <div class="card england-card pulse">
      <h2>${currentMatch.home} vs ${currentMatch.away}</h2>
      <p>📍 ${currentMatch.venue}</p>
    </div>
  `;

  updateCountdown("england-countdown", new Date(currentMatch.date), now);

  loadLive();
  loadLineups();
}

// ----------------------------
function updateCountdown(id, target, now) {
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById(id).innerHTML = "⚽ LIVE ⚽";
    return;
  }

  const h = Math.floor(diff / (1000*60*60));
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById(id).innerHTML = `
    <div class="big-count">${h}h ${m}m ${s}s</div>
  `;
}

// ----------------------------
// LIVE DATA
// ----------------------------
async function loadLive() {
  if (!currentMatch?.id) return;

  const res = await fetch(
    `${BASE_URL}/fixtures?id=${currentMatch.id}`,
    { headers: { "x-apisports-key": API_KEY } }
  );

  const data = await res.json();
  const match = data.response?.[0];

  if (!match) return;

  document.getElementById("live-section").style.display = "block";

  document.getElementById("live").innerHTML = `
    <div class="card live-card">
      <h1>${match.goals.home} - ${match.goals.away}</h1>
      <h3>${match.fixture.status.long}</h3>
    </div>
  `;
}

// ----------------------------
// LINEUPS
// ----------------------------
async function loadLineups() {
  if (!currentMatch?.id) return;

  const res = await fetch(
    `${BASE_URL}/fixtures/lineups?fixture=${currentMatch.id}`,
    { headers: { "x-apisports-key": API_KEY } }
  );

  const data = await res.json();

  if (!data.response?.length) return;

  document.getElementById("lineups-section").style.display = "block";

  document.getElementById("lineups").innerHTML =
    data.response.map(team => `
      <div>
