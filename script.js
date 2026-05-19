const API_KEY = "2096cfafa894e4c6bfcae741f392a144"; // keep if you want lineups
const BASE_URL = "https://v3.football.api-sports.io";

let englandFixtures = [];
let currentEnglandMatch = null;

// ----------------------------
// LOAD FROM LOCAL JSON (SAFE FOR GITHUB PAGES)
// ----------------------------
async function loadFixtures() {
  const res = await fetch("fixtures.json");
  const data = await res.json();

  englandFixtures = data
    .map(f => ({
      fixture: {
        id: null,
        date: f.date,
        venue: { name: f.venue },
        status: { long: "Not Started" }
      },
      teams: {
        home: { name: f.home },
        away: { name: f.away }
      }
    }))
    .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

  updateApp();
  setInterval(updateApp, 60000);
  setInterval(updateCountdown, 1000);
}

// ----------------------------
// GET NEXT MATCH
// ----------------------------
function getNextMatch() {
  const now = new Date();
  return englandFixtures.find(m => new Date(m.fixture.date) > now);
}

// ----------------------------
// MAIN UPDATE
// ----------------------------
function updateApp() {
  currentEnglandMatch = getNextMatch();

  if (!currentEnglandMatch) return;

  renderNextMatch();
  updateCountdown();
  tryLoadLineups();
}

// ----------------------------
// RENDER MATCH
// ----------------------------
function renderNextMatch() {
  const match = currentEnglandMatch;

  document.getElementById("next-match").innerHTML = `
    <div class="card">
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>📍 ${match.fixture.venue.name}</p>
      <p>🗓 ${new Date(match.fixture.date).toLocaleString("en-GB")}</p>
    </div>
  `;
}

// ----------------------------
// COUNTDOWN
// ----------------------------
function updateCountdown() {
  if (!currentEnglandMatch) return;

  const now = new Date();
  const target = new Date(currentEnglandMatch.fixture.date);
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById("first-countdown").innerHTML =
      "<h2>⚽ MATCH STARTED ⚽</h2>";
    return;
  }

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById("first-countdown").innerHTML = `
    <div class="card">
      <h3>⏳ NEXT ENGLAND MATCH</h3>
      <h2>${d}d ${h}h ${m}m ${s}s</h2>
    </div>
  `;
}

// ----------------------------
// TRY LOAD LINEUPS (API OPTIONAL)
// ----------------------------
async function tryLoadLineups() {
  if (!API_KEY || !currentEnglandMatch.fixture.id) return;

  try {
    const res = await fetch(
      `${BASE_URL}/fixtures/lineups?fixture=${currentEnglandMatch.fixture.id}`,
      { headers: { "x-apisports-key": API_KEY } }
    );

    const data = await res.json();
    if (!data.response || data.response.length < 2) return;

    renderLineups(data.response);
  } catch (err) {
    console.log("No lineups yet");
  }
}

// ----------------------------
// RENDER LINEUPS
// ----------------------------
function renderLineups(teams) {
  document.getElementById("lineups-section").style.display = "block";

  const html = teams.map(team => `
    <div>
      <h3>${team.team.name}</h3>
      <div class="lineup-grid">
        ${team.startXI.map(p => `<div class="player">${p.player.name}</div>`).join("")}
      </div>
    </div>
  `).join("");

  document.getElementById("lineups").innerHTML = html;
}

// ----------------------------
loadFixtures();
``
