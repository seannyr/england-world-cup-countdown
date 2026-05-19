const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";

let currentFixture = null;
let lineupsLoaded = false;

// --------------------
// LOAD NEXT ENGLAND MATCH
// --------------------
async function loadNextMatch() {
  const res = await fetch(`${BASE_URL}/fixtures?next=20`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await res.json();

  const match = data.response.find(m =>
    m.teams.home.name === "England" ||
    m.teams.away.name === "England"
  );

  if (!match) return;

  currentFixture = match;

  document.getElementById("next-match").innerHTML = `
    <div class="card">
      <h3>🏴 ${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>📍 ${match.fixture.venue.name}</p>
      <p>🗓 ${new Date(match.fixture.date).toLocaleString("en-GB")}</p>
    </div>
  `;

  startCountdown(match.fixture.date);
}

// --------------------
// COUNTDOWN
// --------------------
function startCountdown(date) {
  const target = new Date(date);

  setInterval(() => {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) return;

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById("countdown").innerHTML =
      `${d}d ${h}h ${m}m ${s}s`;
  }, 1000);
}

// --------------------
// CHECK LINEUPS (AUTO)
// --------------------
async function checkLineups() {
  if (!currentFixture || lineupsLoaded) return;

  const res = await fetch(
    `${BASE_URL}/fixtures/lineups?fixture=${currentFixture.fixture.id}`,
    { headers: { "x-apisports-key": API_KEY } }
  );

  const data = await res.json();

  if (data.response && data.response.length > 0) {
    lineupsLoaded = true;

    const england = data.response.find(t =>
      t.team.name === "England"
    );

    const players = england.startXI.map(p => p.player.name);

    document.getElementById("lineups-section").style.display = "block";

    document.getElementById("lineups").innerHTML = `
      <div class="lineup-grid">
        ${players.map(p => `<div class="player">${p}</div>`).join("")}
      </div>
    `;
  }
}

// --------------------
// LIVE MATCH UPDATES
// --------------------
async function updateLive() {
  if (!currentFixture) return;

  const res = await fetch(
    `${BASE_URL}/fixtures?id=${currentFixture.fixture.id}`,
    { headers: { "x-apisports-key": API_KEY } }
  );

  const data = await res.json();
  const match = data.response[0];

  const home = match.teams.home.name;
  const away = match.teams.away.name;

  const goals = match.events
    .filter(e => e.type === "Goal")
    .map(g => `${g.player.name} ${g.time.elapsed}'`);

  document.getElementById("live-section").style.display = "block";

  document.getElementById("live").innerHTML = `
    <div class="card">
      <h2>${home} ${match.goals.home} - ${match.goals.away} ${away}</h2>

      <h3>⚽ Goals</h3>
      <ul>
        ${goals.map(g => `<li>${g}</li>`).join("")}
      </ul>
    </div>
  `;
}

// --------------------
// START APP
// --------------------
loadNextMatch();

// lineup check every 60s
setInterval(checkLineups, 60000);

// live updates every 30s
setInterval(updateLive, 30000);
