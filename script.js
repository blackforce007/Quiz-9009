// main quiz engine
const QUESTIONS_ALL = QUESTIONS.slice(); // copy
let questions = [];
let current = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let timerInterval = null;
let timePerQuestion = parseInt(localStorage.getItem('timePerQ')) || 15;
let remaining = timePerQuestion;

// DOM
const qText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const correctEl = document.getElementById('correct-count');
const wrongEl = document.getElementById('wrong-count');
const streakEl = document.getElementById('streak');
const feedbackEl = document.getElementById('feedback');
const timeSelect = document.getElementById('timeSelect');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const modal = document.getElementById('modal');
const leaderList = document.getElementById('leaderList');
const closeModal = document.getElementById('closeModal');
const restartBtn = document.getElementById('restartBtn');
const badgesDiv = document.getElementById('badges');

// init
timeSelect.value = timePerQuestion;
timeSelect.addEventListener('change', (e)=>{
  timePerQuestion = parseInt(e.target.value);
  localStorage.setItem('timePerQ', timePerQuestion);
});

leaderboardBtn.addEventListener('click', showLeaderboard);
closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));
restartBtn.addEventListener('click', initGame);

function initGame(){
  // shuffle and pick all questions in random order (so repetition each session random)
  questions = shuffleArray(QUESTIONS_ALL.slice());
  current = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  updateHUD();
  nextQuestion();
  renderBadges();
}

function nextQuestion(){
  if(timerInterval) clearInterval(timerInterval);
  if(current >= questions.length){
    finishGame();
    return;
  }
  const q = questions[current];
  qText.textContent = q.q;
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.dataset.idx = idx;
    btn.addEventListener('click', ()=> handleAnswer(idx, btn));
    optionsDiv.appendChild(btn);
  });

  // reset feedback
  feedbackEl.textContent = '';
  // timer
  remaining = timePerQuestion;
  timerEl.textContent = remaining;
  timerInterval = setInterval(()=>{
    remaining--;
    timerEl.textContent = remaining;
    if(remaining <= 0){
      clearInterval(timerInterval);
      autoMarkWrong();
    }
  },1000);
}

function handleAnswer(idx, btn){
  if(timerInterval) clearInterval(timerInterval);
  const q = questions[current];
  const correctIdx = q.a;
  lockOptions();
  if(idx === correctIdx){
    // correct
    correctCount++;
    streak++;
    const base = 10;
    const timeBonus = Math.max(0, remaining);
    const streakBonus = streak * 2;
    const earned = base + timeBonus + streakBonus;
    score += earned;
    showFeedback(true, correctIdx, idx);
  }else{
    // wrong
    wrongCount++;
    streak = 0;
    showFeedback(false, correctIdx, idx);
  }
  updateHUD();
  // auto move to next after short delay
  setTimeout(()=>{
    current++;
    nextQuestion();
  }, 1400);
}

function autoMarkWrong(){
  // show correct & mark wrong counts
  wrongCount++;
  streak = 0;
  updateHUD();
  showFeedback(false, questions[current].a, null);
  setTimeout(()=>{
    current++;
    nextQuestion();
  }, 1200);
}

function showFeedback(isCorrect, correctIdx, chosenIdx){
  const optionBtns = Array.from(document.querySelectorAll('.option-btn'));
  optionBtns.forEach((b, i) => {
    if(i === correctIdx){
      b.classList.add('correct');
      // animate: rotate a bit
      b.style.transform = 'rotateY(6deg)';
      b.style.transition = 'transform 0.6s';
    }
    if(chosenIdx !== null && i === chosenIdx && i !== correctIdx){
      b.classList.add('wrong');
      b.style.transform = 'scale(0.98)';
    }
  });

  if(isCorrect){
    feedbackEl.textContent = `সঠিক উত্তর! +${10 + Math.max(0,remaining) + (streak*2)} পয়েন্ট`;
    feedbackEl.style.color = 'var(--gold)';
  } else {
    feedbackEl.textContent = `ভুল উত্তর। সঠিক উত্তর: "${questions[current].options[correctIdx]}"`;
    feedbackEl.style.color = 'var(--danger)';
  }
}

function lockOptions(){
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);
}

function updateHUD(){
  scoreEl.textContent = score;
  correctEl.textContent = correctCount;
  wrongEl.textContent = wrongCount;
  streakEl.textContent = streak;
}

function finishGame(){
  // stop timer
  if(timerInterval) clearInterval(timerInterval);

  // save leaderboard
  const name = prompt("আপনার নাম লিখুন (Leaderboard এ জমা হবে):","Player");
  saveLeaderboard(name || 'Player', score);

  // show results
  alert(`Game Over!\nScore: ${score}\nসঠিক: ${correctCount}\nভুল: ${wrongCount}`);
  renderLeaderboard();
  renderBadges(true);
}

// leaderboard using localStorage
function saveLeaderboard(name, scoreVal){
  const key = 'bf007_leader';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({name, score: scoreVal, date: new Date().toISOString()});
  // sort desc and keep top 50
  list.sort((a,b)=> b.score - a.score);
  localStorage.setItem(key, JSON.stringify(list.slice(0,50)));
}

function showLeaderboard(){
  renderLeaderboard();
  modal.classList.remove('hidden');
}

function renderLeaderboard(){
  const key = 'bf007_leader';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  leaderList.innerHTML = '';
  if(list.length === 0){
    leaderList.innerHTML = '<li>কোন রেকর্ড নেই</li>';
    return;
  }
  list.forEach(entry=>{
    const li = document.createElement('li');
    const date = new Date(entry.date);
    li.textContent = `${entry.name} — ${entry.score} — ${date.toLocaleDateString()}`;
    leaderList.appendChild(li);
  });
}

// helper shuffle
function shuffleArray(arr){
  for(let i = arr.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Achievement / badge system
function renderBadges(final=false){
  badgesDiv.innerHTML = '';
  // load best score
  const key = 'bf007_leader';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const best = list[0] ? list[0].score : 0;

  const badges = [];
  if(score >= 200 || best >= 200) badges.push('Legendary (200+)');
  if(score >= 100 || best >= 100) badges.push('Pro (100+)');
  if(correctCount >= 20) badges.push('Sharp Shooter (20+)');
  if(streak >= 5) badges.push('Hot Streak (5)');
  if(final && score === 0) badges.push('Try Again');

  if(badges.length === 0) badges.push('Novice');

  badges.forEach(b => {
    const el = document.createElement('div');
    el.className = 'badge';
    el.textContent = b;
    badgesDiv.appendChild(el);
  });
}

// start
initGame();
renderLeaderboard();
