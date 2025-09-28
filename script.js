// script.js

// Safe DOM selector helper
function $(id) {
    return document.getElementById(id);
}

// DOM Elements
const startBtn = $("start-btn");
const homeScreen = $("home-screen");
const quizScreen = $("quiz-screen");
const questionText = $("question");
const optionsContainer = $("options");
const timerText = $("timer");
const scoreBoard = $("score");
const resultScreen = $("result-screen");
const finalScoreText = $("final-score");
const leaderboardScreen = $("leaderboard-screen");
const leaderboardList = $("leaderboard-list");
const closeLeaderboardBtn = $("close-leaderboard");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;
let streak = 0;

// Load questions from questions.js
let usedQuestions = [];
let availableQuestions = questions ? [...questions] : [];

// Start Game
function startGame() {
    if (!availableQuestions.length) {
        alert("⚠️ কোন প্রশ্ন পাওয়া যায়নি! questions.js ফাইল চেক করুন।");
        return;
    }

    if (homeScreen) homeScreen.style.display = "none";
    if (resultScreen) resultScreen.style.display = "none";
    if (quizScreen) quizScreen.style.display = "block";

    score = 0;
    streak = 0;
    usedQuestions = [];
    availableQuestions = [...questions];
    scoreBoard.innerText = `স্কোর: ${score}`;
    loadQuestion();
}

// Load Question
function loadQuestion() {
    if (availableQuestions.length === 0) {
        endGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionData = availableQuestions[randomIndex];
    currentQuestionIndex = questions.indexOf(questionData);

    usedQuestions.push(questionData);
    availableQuestions.splice(randomIndex, 1);

    if (questionText) questionText.innerText = questionData.question;
    if (optionsContainer) optionsContainer.innerHTML = "";

    questionData.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.innerText = option;
        btn.onclick = () => selectAnswer(option, questionData.answer);
        optionsContainer.appendChild(btn);
    });

    resetTimer();
}

// Answer Selection
function selectAnswer(selected, correct) {
    clearInterval(timer);

    const optionButtons = document.querySelectorAll(".option-btn");
    optionButtons.forEach(btn => {
        if (btn.innerText === correct) {
            btn.classList.add("correct");
        } else if (btn.innerText === selected) {
            btn.classList.add("wrong");
        }
        btn.disabled = true;
    });

    if (selected === correct) {
        streak++;
        score += 10 + timeLeft + (streak > 1 ? streak * 2 : 0);
    } else {
        streak = 0;
    }

    if (scoreBoard) scoreBoard.innerText = `স্কোর: ${score}`;

    setTimeout(() => {
        loadQuestion();
    }, 1500);
}

// Timer
function resetTimer() {
    clearInterval(timer);
    timeLeft = 20;
    if (timerText) timerText.innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        if (timerText) timerText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            loadQuestion();
        }
    }, 1000);
}

// End Game
function endGame() {
    if (quizScreen) quizScreen.style.display = "none";
    if (resultScreen) resultScreen.style.display = "block";
    if (finalScoreText) finalScoreText.innerText = `আপনার মোট স্কোর: ${score}`;
    saveToLeaderboard(score);
    showLeaderboard();
}

// Leaderboard System
function saveToLeaderboard(newScore) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ score: newScore, date: new Date().toLocaleString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function showLeaderboard() {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = "";
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = "<li>কোন রেকর্ড নেই</li>";
        return;
    }
    leaderboard.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. স্কোর: ${entry.score} (${entry.date})`;
        leaderboardList.appendChild(li);
    });
}

// Event Listeners
if (startBtn) startBtn.addEventListener("click", startGame);
if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener("click", () => {
        if (leaderboardScreen) leaderboardScreen.style.display = "none";
        if (homeScreen) homeScreen.style.display = "block";
    });
}
