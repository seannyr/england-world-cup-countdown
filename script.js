const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";

let fixtures = [];
let englandFixtures = [];
let currentMatch = null;

// LOAD DATA (API + fallback)
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
      throw new Error("API empty");
    }

  } catch (err) {
    console.log("Using fallback fixtures");

    const res = await fetch("fixtures.json");
    const data = await res.json();

    fixtures = data.map(f => ({
      date: f.date,
      home: f.home,
      away: f.away,
      venue: f.venue,
      id: null
    }));
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

  setInterval(updateEverything, 1000);
}

// FIRST MATCH
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card">
      <h2>${first.home} vs ${first.away}</h2>
      <p>📍 ${first.venue}</p>
      <p>🗓 ${new Date(first.date).toLocaleString("en-GB")}</p>
    </div>
  `;
}

// NEXT ENGLAND MATCH
function getNextEnglandMatch() {
  const now = new Date();
  return englandFixtures.find(m => new Date(m.date) > now);
}

// MAIN LOOP
function updateEverything() {
  const now = new Date();

  updateCountdown("global-countdown", new Date(fixtures[0].date), now);

  currentMatch = getNextEnglandMatch();
  if (!currentMatch) return;

  document.getElementById("england-match").innerHTML = `
    <div class="card england-card">
      <h2>${currentMatch.home} vs ${currentMatch.away}</h2>
      <p>📍 ${currentMatch.venue}</p>
      <p>🗓 ${new Date(currentMatch.date).toLocaleString("en-GB")}</p>
    </div>
  `;

  updateCountdown("england-countdown", new Date(currentMatch.date), now);

  loadLive();
  loadLineups();
}

// COUNTDOWN
function updateCountdown(id, target, now) {
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById(id).innerHTML = "<div class='big-count'>⚽ LIVE ⚽</div>";
    return;
  }

  const h = Math.floor(diff / (1000*60*60));
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById(id).innerHTML = `
    <div class="big-count">⏳ ${h}h ${m}m ${s}s</div>
  `;
}

// LIVE
async function loadLive() {
  if (!currentMatch?.id) return;

  try {
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
  } catch {}
}

// LINEUPS
async function loadLineups() {
  if (!currentMatch?.id) return;

  try {
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
          <h3>${team.team.name}</h3>
          ${team.startXI.map(p => `<div class="player">${p.player.name}</div>`).join("")}
        </div>
      `).join("");
  } catch {}
}

loadData();
