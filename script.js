let fixtures = [];
let englandFixtures = [];

// LOAD LOCAL FILE
async function loadFixtures() {
  const res = await fetch("fixtures.json");
  const data = await res.json();

  fixtures = data.sort((a,b) => new Date(a.date) - new Date(b.date));
  englandFixtures = fixtures.filter(f =>
    f.home === "England" || f.away === "England"
  );

  renderFirstMatch();
  setInterval(updateCountdowns, 1000);
  setInterval(updateEnglandMatch, 60000);
}

// FIRST WORLD CUP MATCH
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card">
      <h3>${first.home} vs ${first.away}</h3>
      <p>📍 ${first.venue}</p>
      <p>🗓 ${new Date(first.date).toLocaleString("en-GB")}</p>
    </div>
  `;
}

// GET NEXT ENGLAND MATCH
function getNextEnglandMatch() {
  const now = new Date();
  return englandFixtures.find(m => new Date(m.date) > now);
}

// RENDER ENGLAND MATCH
function updateEnglandMatch() {
  const match = getNextEnglandMatch();
  if (!match) return;

  document.getElementById("england-match").innerHTML = `
    <div class="card england-card">
      <h2>${match.home} vs ${match.away}</h2>
      <p>📍 ${match.venue}</p>
      <p>🗓 ${new Date(match.date).toLocaleString("en-GB")}</p>
    </div>
  `;
}

// COUNTDOWNS
function updateCountdowns() {
  const now = new Date();

  // GLOBAL
  const first = fixtures[0];
  updateCountdown("global-countdown", new Date(first.date), now);

  // ENGLAND
  const nextEngland = getNextEnglandMatch();
  if (nextEngland) {
    updateCountdown("england-countdown", new Date(nextEngland.date), now);
  }
}

function updateCountdown(elementId, target, now) {
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById(elementId).innerHTML = "⚽ LIVE ⚽";
    return;
  }

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  document.getElementById(elementId).innerHTML = `
    <div class="count">
      ${d}d ${h}h ${m}m ${s}s
    </div>
  `;
}

loadFixtures();
updateEnglandMatch();
