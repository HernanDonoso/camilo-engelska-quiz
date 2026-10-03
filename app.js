const APP_VERSION = "2";

const words = [
  ["högljutt","loudly","Kap 1"], ["fnissa","giggle","Kap 1"], ["irriterad","annoyed","Kap 1"],
  ["genväg","shortcut","Kap 1"], ["pöl","puddle","Kap 1"], ["låsa upp","unlock","Kap 1"],
  ["fundersam","thoughtful","Kap 1"], ["hacka","chop","Kap 1"],
  ["västra","western","Kap 2"], ["sprickor","cracks","Kap 2"], ["regler","rules","Kap 2"],
  ["skrika","yell","Kap 2"], ["särskilt","especially","Kap 2"], ["kunna","be able to","Kap 2"],
  ["närmaste","nearest","Kap 2"], ["brasa","open fire","Kap 2"],
  ["sent på kvällen","late at night","Kap 3"], ["filt","blanket","Kap 3"],
  ["lugn och ro","peace and quiet","Kap 3"], ["beroendeframkallande","addictive","Kap 3"],
  ["om inte","unless","Kap 3"], ["bakåt","backwards","Kap 3"], ["framåt","forwards","Kap 3"],
  ["tystnad","silence","Kap 3"],
  ["delta (i)","attend","Memory"], ["rasande","furious","Memory"], ["interagera","interact","Memory"],
  ["lerig","muddy","Memory"], ["lysa","glow","Memory"], ["enhet","device","Memory"],
  ["reta","tease","Memory"], ["lova","promise","Memory"], ["skapa","create","Memory"],
  ["dyster","gloomy","Memory"], ["dammig","dusty","Memory"], ["att ha panik","to panic","Memory"],
  ["företag","company","Memory"], ["beskriva","describe","Memory"], ["avlägsen","remote","Memory"],
  ["kommentera","comment","Memory"]
];

const LS_MASTERED = "camiloEngQuiz_mastered_v1";
const LS_BEST = "camiloEngQuiz_bestScore_v1";

function loadMastered() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_MASTERED) || "[]")); }
  catch (e) { return new Set(); }
}
function saveMastered(set) {
  localStorage.setItem(LS_MASTERED, JSON.stringify([...set]));
}
function loadBest() {
  return parseInt(localStorage.getItem(LS_BEST) || "0", 10);
}
function saveBest(score) {
  const cur = loadBest();
  if (score > cur) localStorage.setItem(LS_BEST, String(score));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let mastered = loadMastered();

// ---- Flip mode ----
let flipDeck = [];
let flipShowingEng = false;

function resetFlipDeck(onlyUnmastered) {
  const pool = onlyUnmastered ? words.filter(w => !mastered.has(w[0])) : words.slice();
  flipDeck = shuffle(pool.length ? pool : words.slice());
  flipShowingEng = false;
}

function renderFlip() {
  document.getElementById('masteredCount').textContent = `${mastered.size} / ${words.length} ord kan du sedan tidigare`;
  document.getElementById('flipBarTotal').style.width = Math.round((mastered.size / words.length) * 100) + "%";

  if (flipDeck.length === 0) {
    document.getElementById('flipWord').textContent = mastered.size === words.length
      ? "🏆 Alla 40 ord klara!"
      : "🎉 Varvet klart!";
    document.getElementById('flipChapter').textContent = "Tryck \"Nytt varv\" för att fortsätta";
    document.getElementById('flipProgress').textContent = "";
    return;
  }
  const [sv, en, ch] = flipDeck[0];
  document.getElementById('flipWord').textContent = flipShowingEng ? en : sv;
  document.getElementById('flipChapter').textContent = ch + (flipShowingEng ? " · engelska" : " · svenska — tryck kortet för att vända");
  document.getElementById('flipProgress').textContent = `${flipDeck.length} kvar i det här varvet`;
}

function initFlip() {
  resetFlipDeck(true);
  renderFlip();

  document.getElementById('flipCard').onclick = () => {
    flipShowingEng = !flipShowingEng;
    renderFlip();
  };
  document.getElementById('btnKnew').onclick = () => {
    if (flipDeck.length === 0) return;
    const w = flipDeck.shift();
    mastered.add(w[0]);
    saveMastered(mastered);
    flipShowingEng = false;
    renderFlip();
  };
  document.getElementById('btnDidnt').onclick = () => {
    if (flipDeck.length === 0) return;
    const w = flipDeck.shift();
    mastered.delete(w[0]);
    saveMastered(mastered);
    flipDeck.push(w);
    flipShowingEng = false;
    renderFlip();
  };
  document.getElementById('btnNewRound').onclick = () => {
    resetFlipDeck(true);
    renderFlip();
  };
  document.getElementById('btnAllWords').onclick = () => {
    resetFlipDeck(false);
    renderFlip();
  };
}

// ---- Quiz mode ----
let quizDeck = [];
let quizIdx = 0;
let quizScore = 0;

function startQuiz() {
  quizDeck = shuffle(words);
  quizIdx = 0;
  quizScore = 0;
  renderQuiz();
}

function renderQuiz() {
  document.getElementById('bestScore').textContent = `Bästa resultat: ${loadBest()} / ${words.length}`;
  if (quizIdx >= quizDeck.length) {
    saveBest(quizScore);
    document.getElementById('quizWord').textContent = `🎉 Klart! ${quizScore} / ${quizDeck.length} rätt`;
    document.getElementById('quizInput').style.display = 'none';
    document.getElementById('quizProgress').textContent = "";
    document.getElementById('bestScore').textContent = `Bästa resultat: ${loadBest()} / ${words.length}`;
    return;
  }
  document.getElementById('quizWord').textContent = quizDeck[quizIdx][0];
  document.getElementById('quizInput').value = "";
  document.getElementById('quizInput').style.display = 'block';
  document.getElementById('quizFeedback').textContent = "";
  document.getElementById('quizProgress').textContent = `Fråga ${quizIdx + 1} av ${quizDeck.length} · Rätt hittills: ${quizScore}`;
  document.getElementById('quizInput').focus();
}

function initQuiz() {
  startQuiz();
  document.getElementById('quizInput').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    submitQuizAnswer();
  });
  document.getElementById('btnQuizCheck').onclick = submitQuizAnswer;
  document.getElementById('btnQuizRestart').onclick = startQuiz;
}

function submitQuizAnswer() {
  if (quizIdx >= quizDeck.length) return;
  const answer = document.getElementById('quizInput').value.trim().toLowerCase();
  const correct = quizDeck[quizIdx][1].toLowerCase();
  const fb = document.getElementById('quizFeedback');
  if (answer === correct) {
    fb.textContent = "✅ Rätt!";
    fb.className = "feedback ok";
    quizScore++;
  } else {
    fb.textContent = `❌ Rätt svar: ${quizDeck[quizIdx][1]}`;
    fb.className = "feedback bad";
  }
  quizIdx++;
  setTimeout(renderQuiz, 900);
}

// ---- Facit ----
function renderFacit() {
  const chapters = [...new Set(words.map(w => w[2]))];
  const container = document.getElementById('facitList');
  container.innerHTML = chapters.map(ch => {
    const rows = words.filter(w => w[2] === ch).map(([sv, en]) =>
      `<tr><td>${sv}</td><td>${en}</td></tr>`
    ).join('');
    return `
      <div class="facitGroup">
        <h3>${ch}</h3>
        <table class="facitTable">
          <thead><tr><th>Svenska</th><th>Engelska</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('');
}

// ---- Tabs ----
function initTabs() {
  const views = {
    flip: document.getElementById('flipView'),
    quiz: document.getElementById('quizView'),
    facit: document.getElementById('facitView'),
  };
  const tabs = {
    flip: document.getElementById('tabFlip'),
    quiz: document.getElementById('tabQuiz'),
    facit: document.getElementById('tabFacit'),
  };
  function showTab(name) {
    Object.keys(views).forEach(k => {
      views[k].style.display = (k === name) ? 'block' : 'none';
      tabs[k].classList.toggle('active', k === name);
    });
  }
  tabs.flip.onclick = () => showTab('flip');
  tabs.quiz.onclick = () => showTab('quiz');
  tabs.facit.onclick = () => { renderFacit(); showTab('facit'); };

  document.getElementById('tabResetProgress').onclick = () => {
    if (!confirm("Nollställ allt sparat framsteg (kända ord + bästa resultat)?")) return;
    mastered = new Set();
    saveMastered(mastered);
    localStorage.setItem(LS_BEST, "0");
    resetFlipDeck(true);
    renderFlip();
    startQuiz();
  };
}

initTabs();
initFlip();
initQuiz();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
