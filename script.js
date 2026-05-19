let fixtures = [];
let englandFixtures = [];

// LOAD LOCAL DATA ONLY (reliable)
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
}

// FIRST MATCH
function renderFirstMatch() {
  const first = fixtures[0];

  document.getElementById("first-match").innerHTML = `
    <div class="card highlight">
      <h2>${first.home} vs ${first.away}</h2>
      <p>📍 ${first.venue}</p>
      <p>${new Date(first.date).toLocaleString("en-GB")}</p>
      <div class="big-count" data-date="${first.date}"></div>
    </div>
  `;
}

// ENGLAND FIXTURES
function renderEnglandFixtures() {
  const container = document.getElementById("england-fixtures");

  container.innerHTML = englandFixtures.map(f => `
    <div class="card england-card">
      <h3>${f.home} vs ${f.away}</h3>
      <p>📍 ${f.venue}</p>
      <p>${new Date(f.date).toLocaleString("en-GB")}</p>
