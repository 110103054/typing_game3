/* Typing Game - vanilla JS */
(function () {
  const elements = {
    startBtn: document.getElementById('btn-start'),
    restartBtn: document.getElementById('btn-restart'),
    playAgainBtn: document.getElementById('btn-play-again'),
    difficulty: document.getElementById('difficulty'),
    time: document.getElementById('time'),
    score: document.getElementById('score'),
    wpm: document.getElementById('wpm'),
    accuracy: document.getElementById('accuracy'),
    word: document.getElementById('word'),
    input: document.getElementById('input'),
    resultPanel: document.getElementById('result'),
    finalScore: document.getElementById('final-score'),
    finalWpm: document.getElementById('final-wpm'),
    finalAccuracy: document.getElementById('final-accuracy')
  };

  const WORD_BANK = {
    easy: [
      'cat','dog','sun','ice','red','blue','milk','book','tree','home','game','code','bird','frog','rain','snow','desk','door','fish','star','coin','moon','road','ball','ship','ring','king','girl','boy','cake','sand','wind','rock','mouse','light','water','fire','food','map','note'
    ],
    medium: [
      'planet','silver','random','window','bridge','forest','smooth','search','button','little','common','double','puzzle','market','danger','policy','fabric','custom','gentle','energy','memory','player','thrive','impact','design','linear','bright','radius','syntax','vector','module','sudden','garage','worker','yellow','demand','origin','master','dragon'
    ],
    hard: [
      'synchronize','aesthetics','throughout','microscope','capability','philosophy','conscience','ubiquitous','cryptography','equilibrium','meticulous','tranquility','theoretical','approximate','counterpoint','breakthrough','unambiguous','articulation','interleaving','multiplicity','idiosyncrasy','permutation','reconciliation','decomposition','parallelism','compatibility','susceptible','miscellaneous','extrapolate','configuration','responsible','architecture','circumstance','characteristic','authentication','infrastructure','implementation','unprecedented','representative','indistinguishable'
    ]
  };

  const GAME_DURATION_SEC = 60;

  let gameState = createInitialState();

  function createInitialState() {
    return {
      isRunning: false,
      remainingSec: GAME_DURATION_SEC,
      score: 0,
      totalCharsTyped: 0,
      correctCharsTyped: 0,
      wordsCompleted: 0,
      currentWord: '',
      timerId: null,
      startedAt: 0,
      difficulty: 'medium'
    };
  }

  function pickWord(difficulty) {
    const list = WORD_BANK[difficulty] || WORD_BANK.medium;
    return list[Math.floor(Math.random() * list.length)];
  }

  function renderWord(word, typedLength) {
    const safeWord = word.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const typed = safeWord.slice(0, typedLength);
    const rest = safeWord.slice(typedLength);
    elements.word.innerHTML = `<span class="ok">${typed}</span>${rest}`;
  }

  function updateStatsUI() {
    elements.time.textContent = String(gameState.remainingSec);
    elements.score.textContent = String(gameState.score);
    const minutes = (GAME_DURATION_SEC - gameState.remainingSec) / 60;
    const wpm = minutes > 0 ? Math.round(gameState.wordsCompleted / minutes) : 0;
    const acc = gameState.totalCharsTyped > 0
      ? Math.round((gameState.correctCharsTyped / gameState.totalCharsTyped) * 100)
      : 100;
    elements.wpm.textContent = String(wpm);
    elements.accuracy.textContent = `${acc}%`;
  }

  function enableInput(enable) {
    elements.input.disabled = !enable;
    elements.input.setAttribute('aria-disabled', String(!enable));
    if (enable) {
      elements.input.focus();
    }
  }

  function startGame() {
    if (gameState.isRunning) return;
    gameState = createInitialState();
    gameState.isRunning = true;
    gameState.difficulty = elements.difficulty.value;
    gameState.currentWord = pickWord(gameState.difficulty);
    gameState.startedAt = Date.now();
    elements.input.value = '';
    renderWord(gameState.currentWord, 0);
    updateStatsUI();
    enableInput(true);
    elements.resultPanel.hidden = true;
    elements.restartBtn.hidden = false;
    elements.startBtn.hidden = true;

    gameState.timerId = setInterval(() => {
      gameState.remainingSec -= 1;
      updateStatsUI();
      if (gameState.remainingSec <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    if (!gameState.isRunning) return;
    gameState.isRunning = false;
    enableInput(false);
    elements.restartBtn.hidden = true;
    elements.startBtn.hidden = false;
    if (gameState.timerId) clearInterval(gameState.timerId);
    elements.word.textContent = 'Great job!';

    const minutes = (Date.now() - gameState.startedAt) / 1000 / 60;
    const wpm = minutes > 0 ? Math.round(gameState.wordsCompleted / minutes) : 0;
    const acc = gameState.totalCharsTyped > 0
      ? Math.round((gameState.correctCharsTyped / gameState.totalCharsTyped) * 100)
      : 100;

    elements.finalScore.textContent = String(gameState.score);
    elements.finalWpm.textContent = String(wpm);
    elements.finalAccuracy.textContent = `${acc}%`;
    elements.resultPanel.hidden = false;
  }

  function handleInput(e) {
    if (!gameState.isRunning) return;
    const value = e.target.value;
    const target = gameState.currentWord;

    // Update char stats
    gameState.totalCharsTyped = gameState.totalCharsTyped + 1; // per keystroke
    if (target.startsWith(value)) {
      gameState.correctCharsTyped = gameState.correctCharsTyped + 1;
    }

    renderWord(target, value.length);

    // Word completed
    if (value === target) {
      gameState.score += Math.max(1, Math.floor(target.length / 2));
      gameState.wordsCompleted += 1;
      // Add small time bonus based on difficulty
      const bonus = { easy: 3, medium: 2, hard: 1 }[gameState.difficulty] || 2;
      gameState.remainingSec = Math.min(GAME_DURATION_SEC, gameState.remainingSec + bonus);

      // Next word
      gameState.currentWord = pickWord(gameState.difficulty);
      e.target.value = '';
      renderWord(gameState.currentWord, 0);
    }

    updateStatsUI();
  }

  elements.startBtn.addEventListener('click', startGame);
  elements.restartBtn.addEventListener('click', startGame);
  elements.playAgainBtn.addEventListener('click', startGame);
  elements.input.addEventListener('input', handleInput);

  // Keyboard UX: press Enter to start when focused on body
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !gameState.isRunning) {
      startGame();
    }
  });
})();


