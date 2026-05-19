const countdownEl = document.getElementById('countdown');

loadFixtures();

// -----------------------------
// LINEUP POLLING LOGIC
// -----------------------------

let lineupPollingStopped = false;

async function checkLineups() {
  if (lineupPollingStopped) return;

  // Replace this with your real API endpoint later
  const fakeLineupReleased = false;

  if (fakeLineupReleased) {
    lineupPollingStopped = true;

    lineupsSection.style.display = 'block';

    const players = [
      'Pickford',
      'Walker',
      'Stones',
      'Guehi',
      'Shaw',
      'Rice',
      'Bellingham',
      'Foden',
      'Saka',
      'Kane',
      'Gordon'
    ];

    lineupsEl.innerHTML = `
      <div class="lineup-grid">
        ${players.map(player => `<div class="player">${player}</div>`).join('')}
      </div>
    `;
  }
}

// check every 60 seconds
setInterval(checkLineups, 60000);

// -----------------------------
// LIVE MATCH UPDATES
// -----------------------------

async function updateLiveMatch() {
  // Replace with real API later
  const liveData = {
    home: 'England',
    away: 'Croatia',
    score: '2 - 1',
    scorers: [
      'Kane 14\'',
      'Saka 52\'',
      'Modric 77\''
    ]
  };

  liveSection.style.display = 'block';

  liveMatchEl.innerHTML = `
    <div class="fixture-card">
      <div class="live-score">
        ${liveData.home} ${liveData.score} ${liveData.away}
      </div>

      <h4>Goalscorers</h4>

      <ul>
        ${liveData.scorers.map(goal => `<li>${goal}</li>`).join('')}
      </ul>
    </div>
  `;
}

// during live matches only
// setInterval(updateLiveMatch, 30000);
