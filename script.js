const countdownDisplay = document.getElementById('countdownDisplay');
const doneMsg = document.getElementById('doneMsg');
const darkModeToggle = document.getElementById('darkModeToggle');
const resetBtn = document.getElementById('resetBtn');
let timer = null;
let totalSeconds = 0;
let secondsLeft = 0;

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer(duration) {
  clearInterval(timer);
  totalSeconds = duration;
  secondsLeft = duration;
  countdownDisplay.textContent = formatTime(secondsLeft);
  doneMsg.style.display = 'none';
  timer = setInterval(() => {
    secondsLeft--;
    countdownDisplay.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      clearInterval(timer);
      countdownDisplay.textContent = '00:00';
      doneMsg.style.display = 'block';
    }
  }, 1000);
}

document.querySelectorAll('.timer-options button[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    startTimer(parseInt(btn.getAttribute('data-time')));
  });
});

document.getElementById('customBtn').addEventListener('click', () => {
  const min = parseInt(document.getElementById('customTime').value);
  if (!isNaN(min) && min > 0) {
    startTimer(min * 60);
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  secondsLeft = 0;
  countdownDisplay.textContent = '00:00';
  doneMsg.style.display = 'none';
});

darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});

// Optional: Save dark mode preference
if (window.localStorage) {
  darkModeToggle.checked = localStorage.getItem('eggTimerDark') === 'true';
  document.body.classList.toggle('dark', darkModeToggle.checked);
  darkModeToggle.addEventListener('change', () => {
    localStorage.setItem('eggTimerDark', darkModeToggle.checked);
  });
}

// --- Nerdle Math Puzzle Game Logic ---
const nerdleBoard = document.getElementById('nerdleBoard');
const gameMsg = document.getElementById('gameMsg');
const resetGameBtn = document.getElementById('resetGameBtn');
const startGameBtn = document.getElementById('startGameBtn');
const modeRadios = document.getElementsByName('gameMode');
let gameMode = 1;
let running = false;
let nerdleLength = 7;
let nerdleSolution = '';
let nerdleGuesses = [];
let nerdleCurrent = [];
let nerdleRow = [0,0,0];
let nerdleScores = [0,0,0];
let nerdleActive = [true,true,true];
let nerdlePlayers = [
  {keys:'1234567890+-*/=',enter:'Enter',back:'Backspace'},
  {keys:'1234567890+-*/=',enter:'Enter',back:'Backspace'},
  {keys:'1234567890+-*/=',enter:'Enter',back:'Backspace'}
];

function setGameMode(mode) {
  gameMode = mode;
}
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    setGameMode(parseInt(radio.value));
    resetGame();
  });
});

function randomEquation() {
  // Generate a valid equation of length nerdleLength
  // Example: 3+5=8, 12/4=3
  let ops = ['+','-','*','/'];
  while (true) {
    let left = '';
    let op = ops[Math.floor(Math.random()*ops.length)];
    let a = Math.floor(Math.random()*9)+1;
    let b = Math.floor(Math.random()*9)+1;
    let res;
    switch(op) {
      case '+': res = a+b; break;
      case '-': res = a-b; break;
      case '*': res = a*b; break;
      case '/': if (a%b!==0) continue; res = a/b; break;
    }
    left = `${a}${op}${b}`;
    let eq = `${left}=${res}`;
    if (eq.length===nerdleLength) return eq;
  }
}

function resetGame() {
  running = false;
  nerdleSolution = randomEquation();
  nerdleGuesses = [[],[],[]];
  nerdleCurrent = ['', '', ''];
  nerdleRow = [0,0,0];
  nerdleScores = [0,0,0];
  nerdleActive = [true,true,true];
  drawNerdle();
  gameMsg.textContent = 'Guess the equation! (e.g. 3+5=8)';
}

resetGameBtn.addEventListener('click', resetGame);

startGameBtn.addEventListener('click', () => {
  if (running) return;
  running = true;
  gameMsg.textContent = 'Game started! Type your guess and press Enter.';
});

function drawNerdle() {
  nerdleBoard.innerHTML = '';
  for (let p=0; p<gameMode; p++) {
    let playerDiv = document.createElement('div');
    playerDiv.style.marginBottom = '10px';
    playerDiv.innerHTML = `<b style="color:#1a5640">Player ${p+1}:</b>`;
    for (let r=0; r<6; r++) {
      let rowDiv = document.createElement('div');
      rowDiv.className = 'nerdle-row';
      let guess = nerdleGuesses[p][r] || '';
      for (let i=0; i<nerdleLength; i++) {
        let cell = document.createElement('div');
        cell.className = 'nerdle-cell';
        let val = (r===nerdleRow[p]) ? (nerdleCurrent[p][i]||'') : (guess[i]||'');
        cell.textContent = val;
        if (r<nerdleRow[p] && guess) {
          if (val===nerdleSolution[i]) cell.classList.add('correct');
          else if (nerdleSolution.includes(val)) cell.classList.add('present');
          else cell.classList.add('absent');
        }
        rowDiv.appendChild(cell);
      }
      playerDiv.appendChild(rowDiv);
    }
    // Score
    let scoreDiv = document.createElement('div');
    scoreDiv.style.color = '#1a5640';
    scoreDiv.style.fontWeight = 'bold';
    scoreDiv.textContent = 'Score: '+nerdleScores[p];
    playerDiv.appendChild(scoreDiv);
    nerdleBoard.appendChild(playerDiv);
  }
}

document.addEventListener('keydown', e => {
  if (!running) return;
  for (let p=0; p<gameMode; p++) {
    if (!nerdleActive[p]) continue;
    if (nerdlePlayers[p].keys.includes(e.key) && nerdleCurrent[p].length<nerdleLength) {
      nerdleCurrent[p] += e.key;
      drawNerdle();
    } else if (e.key===nerdlePlayers[p].back && nerdleCurrent[p].length>0) {
      nerdleCurrent[p] = nerdleCurrent[p].slice(0,-1);
      drawNerdle();
    } else if (e.key===nerdlePlayers[p].enter && nerdleCurrent[p].length===nerdleLength) {
      // Validate equation
      let guess = nerdleCurrent[p];
      if (!/^[0-9+\-*/=]+$/.test(guess)) return;
      let parts = guess.split('=');
      if (parts.length!==2) return;
      try {
        // eslint-disable-next-line no-eval
        if (eval(parts[0])==eval(parts[1])) {
          nerdleGuesses[p][nerdleRow[p]] = guess;
          nerdleScores[p]++;
          if (guess===nerdleSolution) {
            nerdleActive[p]=false;
            gameMsg.textContent = `Player ${p+1} solved it!`;
          } else if (nerdleRow[p]===5) {
            nerdleActive[p]=false;
            gameMsg.textContent = `Player ${p+1} ran out of guesses! Solution: ${nerdleSolution}`;
          }
          nerdleRow[p]++;
          nerdleCurrent[p]='';
          drawNerdle();
        } else {
          gameMsg.textContent = `Player ${p+1}: Invalid equation!`;
        }
      } catch {
        gameMsg.textContent = `Player ${p+1}: Invalid equation!`;
      }
    }
  }
  // Check game over
  if (nerdleActive.filter(x=>x).length===0) {
    running = false;
    let maxScore = Math.max(...nerdleScores);
    let winners = nerdleScores.map((s,i)=>s===maxScore?`Player ${i+1}`:null).filter(Boolean).join(', ');
    gameMsg.textContent += ` Game Over! Winner(s): ${winners}`;
  }
});

setGameMode(1);
