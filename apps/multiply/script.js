const LOOKBACK = 5;
let currentMultiplicands = [0, 0];
let stats = {};
let recentAnswers = [];
function loadStatsFromCookie() {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('stats='));
  if (cookie) {
    try {
      stats = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch (e) { stats = {}; }
  }
}
function saveStatsToCookie() {
  document.cookie = `stats=${encodeURIComponent(JSON.stringify(stats))};path=/;max-age=31536000`;
}

function updateProgress() {
  const table = document.getElementById('progress-table');
  table.innerHTML = '';
  // header row
  const header = document.createElement('tr');
  header.innerHTML = '<th></th>' +
    Array.from({length: 9}, (_, i) => `<th>${i+1}</th>`).join('');
  table.appendChild(header);
  // matrix rows
  for (let i = 1; i <= 9; i++) {
    const row = document.createElement('tr');
    let cells = `<th>${i}</th>`;
    for (let j = 1; j <= 9; j++) {
      if (j <= i) {
        const key = `${i}×${j}`;
        const data = stats[key] || {history: []};
        const history = data.history || [];
        const totalPercent = history.length ? Math.round(history.filter(v => v).length / history.length * 100) : null;
        const display = totalPercent !== null ? totalPercent + '%' : '-';
        const recent = history.slice(-LOOKBACK);
        const recentPercent = recent.length ? Math.round(recent.filter(v => v).length / recent.length * 100) : null;
        const hue = recentPercent !== null ? (recentPercent * 120 / 100) : 0;
        const style = recentPercent !== null ? `style="background-color: hsl(${hue}, 70%, 80%);"` : '';
        cells += `<td ${style}>${display}</td>`;
      } else {
        cells += '<td></td>';
      }
    }
    row.innerHTML = cells;
    table.appendChild(row);
  }
}

function recencyScore(history) {
  const alpha = 0.7;
  let totalWeight = 0, weightedSum = 0;
  for (let i = 0; i < history.length; i++) {
    const w = Math.pow(alpha, history.length - 1 - i);
    totalWeight += w;
    if (history[i]) weightedSum += w;
  }
  return totalWeight ? (weightedSum / totalWeight) : 0;
}

function isAllMastered() {
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= i; j++) {
      const history = stats[`${i}×${j}`]?.history || [];
      if (history.length === 0 || history.some(v => v === false)) {
        return false;
      }
    }
  }
  return true;
}

function newQuestion() {
  // choose question weighted by recent performance
  const candidates = [];
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= i; j++) {
      const key = `${i}×${j}`;
      const history = (stats[key] && stats[key].history) || [];
      const score = recencyScore(history.slice(-LOOKBACK));
      const weight = 1 - score;
      candidates.push({i, j, weight});
    }
  }
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let choice;
  if (totalWeight > 0) {
    let r = Math.random() * totalWeight;
    for (const c of candidates) {
      if (r < c.weight) {
        choice = c;
        break;
      }
      r -= c.weight;
    }
  } else {
    choice = candidates[Math.floor(Math.random() * candidates.length)];
  }
  const a = choice.i, b = choice.j;
  currentMultiplicands = [a, b];
  document.getElementById('question').textContent = `What is ${a} × ${b}?`;
  document.getElementById('answer').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('answer').disabled = false;
  document.getElementById('submit').disabled = false;
  document.getElementById('answer').focus();
}

document.getElementById('game-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (document.getElementById('answer').value === '') return;
  document.getElementById('answer').disabled = true;
  document.getElementById('submit').disabled = true;
  const answer = parseInt(document.getElementById('answer').value, 10);
  const correct = currentMultiplicands[0] * currentMultiplicands[1];
  if (answer === correct) {
    showCelebration();
  } else {
    document.getElementById('feedback').textContent = `Wrong, it's ${correct}.`;
  }
  const [a, b] = currentMultiplicands;
  const key = `${Math.max(a, b)}×${Math.min(a, b)}`;
  if (!stats[key]) stats[key] = {history: []};
  stats[key].history.push(answer === correct);
  saveStatsToCookie();
  updateProgress();
  recentAnswers.push(answer === correct);
  if (recentAnswers.length > LOOKBACK) recentAnswers.shift();
  if (recentAnswers.length === LOOKBACK && recentAnswers.every(v => v)) {
    showFireworks();
  }
  const delay = answer === correct ? 1000 : 2000;
  setTimeout(newQuestion, delay);
});

window.addEventListener('DOMContentLoaded', () => {
  loadStatsFromCookie();
  updateProgress();
  newQuestion();
  document.getElementById('reset-link').addEventListener('click', e => {
    e.preventDefault();
    stats = {};
    saveStatsToCookie();
    updateProgress();
    newQuestion();
  });
});

function showCelebration() {
  const celebration = document.getElementById('celebration');
  celebration.classList.add('show');
  setTimeout(() => celebration.classList.remove('show'), 800);
}

function showFireworks() {
  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.6 }
  });
}
