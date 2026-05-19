const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";

// ----------------------------
// STATE
// ----------------------------
let allFixtures = [];
let englandFixtures = [];
let currentEnglandMatch = null;

// ----------------------------
// LOAD ALL WORLD CUP FIXTURES
// ----------------------------
async function loadAllFixtures() {
  const res = await fetch(`${BASE_URL}/fixtures?season=2026&next=50`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();
  allFixtures = data.response || [];

  setupGlobalCountdown();
  setupEnglandFixtures();
}

// ----------------------------
// GLOBAL COUNTDOWN (TOP SECTION)
// ----------------------------
function setupGlobalCountdown() {
  updateGlobalCountdown();

  setInterval(updateGlobalCountdown, 1000);
}

function updateGlobalCountdown() {
  const now = new Date();

  // find next upcoming match globally
  const nextMatch = allFixtures
    .filter(m => new Date(m.fixture.date) > now)
    .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date))[0];

  if (!nextMatch) return;

  const target = new Date(nextMatch.fixture.date);
  const diff = target - now;

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById("first-countdown").innerHTML = `
    <div class="card">
      <h3>🌍 Next World Cup Match</h3>
      <p><b>${nextMatch.teams.home.name}</b> vs <b>${nextMatch.teams.away.name}</b></p>
      <p>⏰ ${new Date(nextMatch.fixture.date).toLocaleString("en-GB")}</p>

      <h2>${d}d ${h}h ${m}m ${s}s</h2>
    </div>
  `;
}

// ----------------------------
// ENGLAND FIXTURES (MAIN CONTENT)
// ----------------------------
async function setupEnglandFixtures() {
  englandFixtures = allFixtures.filter(m =>
    m.teams.home.name === "England" ||
    m.teams.away.name === "England"
  );

  if (englandFixtures.length === 0) return;

  renderNextEnglandMatch();
  currentEnglandMatch = englandFixtures[0];
}

// ----------------------------
// NEXT ENGLAND MATCH
// ----------------------------
function renderNextEnglandMatch() {
  const match = englandFixtures[0];

  document.getElementById("next-match").innerHTML = `
    <div class="card">
      <h3>🏴 ${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>📍 ${match.fixture.venue.name}</p>
      <p>🗓 ${new Date(match.fixture.date).toLocaleString("en-GB")}</p>
      <p>Status: ${match.fixture.status.long}</p>
    </div>
  `;
}

// ----------------------------
// LINEUPS (AUTO DETECT)
// ----------------------------
let lineupsLoaded = false;

async function checkLineups() {
  if (!currentEnglandMatch || lineupsLoaded) return;

  const res = await fetch(
    `${BASE_URL}/fixtures/lineups?fixture=${currentEnglandMatch.fixture.id}`,
    {
      headers: {
        "x-apisports-key": API_KEY
      }
    }
  );

  const data = await res.json();

  if (data.response && data.response.length > 0) {
    lineupsLoaded = true;

    const england = data.response.find(t => t.team.name === "England");

    const players = england.startXI.map(p => p.player.name);

    document.getElementById("lineups-section").style.display = "block";

    document.getElementById("lineups").innerHTML = `
      <div class="lineup-grid">
        ${players.map(p => `<div class="player">${p}</div>`).join("")}
      </div>
    `;
  }
}

// ----------------------------
// LIVE MATCH
// ----------------------------
async function updateLive() {
  if (!currentEnglandMatch) return;

  const res = await fetch(
    `${BASE_URL}/fixtures?id=${currentEnglandMatch.fixture.id}`,
    {
      headers: {
        "x-apisports-key": API_KEY
      }
    }
  );

  const data = await res.json();
  const match = data.response[0];

  if (!match) return;

  const goals = match.events
    .filter(e => e.type === "Goal")
    .map(g => `${g.player.name} ${g.time.elapsed}'`);

  document.getElementById("live-section").style.display = "block";

  document.getElementById("live").innerHTML = `
    <div class="card">
      <h2>
        ${match.teams.home.name}
        ${match.goals.home} - ${match.goals.away}
        ${match.teams.away.name}
      </h2>

      <h3>⚽ Goals</h3>
      <ul>
        ${goals.map(g => `<li>${g}</li>`).join("")}
      </ul>
    </div>
  `;
}

// ----------------------------
// START APP
// ----------------------------
loadAllFixtures();

setInterval(checkLineups, 60000);
setInterval(updateLive, 30000);
