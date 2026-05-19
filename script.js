const API_KEY = "2096cfafa894e4c6bfcae741f392a144";
const BASE_URL = "https://v3.football.api-sports.io";

let fixtures = [];
let englandFixtures = [];

// ----------------------------
// LOAD LOCAL FIXTURES (ALWAYS WORKS)
// ----------------------------
async function loadData() {
  const res = await fetch("fixtures.json");
  const data = await res.json();

  fixtures = data.sort((a,b) => new Date(a.date) - new Date(b.date));

  englandFixtures = fixtures.filter(f =>
    f.home === "England" || f.away === "England"
  );

  renderFirstMatch();
  renderEnglandFixtures();

  setInterval(updateCountdowns, 1000);
  setInterval(checkLiveMatches, 30000);
}

// ----------------------------
// RENDER FIRST MATCH (GLOBAL)
// ----------------------------
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card highlight">
      <h2>${first.home} vs ${first.away}</h2>
      <p>📍 ${first.venue}</p>
      <p>🗓 ${new Date(first.date).toLocaleString("en-GB")}</p>
      <div class="big-count" data-date="${first.date}"></div>
    </div>
  `;
}

// ----------------------------
// RENDER ENGLAND FIXTURES
// ----------------------------
function renderEnglandFixtures() {
  const container = document.getElementById("england-fixtures");

  container.innerHTML = englandFixtures.map(f => `
    <div class="card england-card">
      <h3>${f.home} vs ${f.away}</h3>
      <p>📍 ${f.venue}</p>
      <p>🗓 ${new Date(f.date).toLocaleString("en-GB")}</p>
      <div class="big-count" data-date="${f.date}"></div>
      <div class="live-data" id="live-${f.date}"></div>
    </div>
  `).join("");
}

// ----------------------------
// COUNTDOWNS
// ----------------------------
function updateCountdowns() {
  document.querySelectorAll(".big-count").forEach(el => {
    const target = new Date(el.dataset.date);
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

// ----------------------------
// LIVE MATCH DATA (API)
// ----------------------------
async function checkLiveMatches() {
  for (const f of englandFixtures) {

    // skip if no API match ID (from JSON)
    if (!f.id) continue;

    try {
      const res = await fetch(
        `${BASE_URL}/fixtures?id=${f.id}`,
        { headers: { "x-apisports-key": API_KEY } }
      );

      const data = await res.json();
      const match = data.response?.[0];

      if (!match) continue;

      const container = document.getElementById(`live-${f.date}`);

      container.innerHTML = `
        <div class="live-mini">
          ${match.goals.home} - ${match.goals.away}
          (${match.fixture.status.short})
        </div>
      };

    } catch (err) {
      console.log("API failed, skipping live data");
    }
  }
}

// ----------------------------
loadData();
