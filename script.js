// script.js

// DOM Elements
const startBtn = document.getElementById("start-btn");
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const timerText = document.getElementById("timer");
const scoreBoard = document.getElementById("score");
const resultScreen = document.getElementById("result-screen");
const finalScoreText = document.getElementById("final-score");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const leaderboardList = document.getElementById("leaderboard-list");
const closeLeaderboardBtn = document.getElementById("close-leaderboard");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;
let streak = 0;

// Load questions from questions.js
let usedQuestions = [];
let availableQuestions = [...questions];

// Start Game
function startGame() {
    homeScreen.style.display = "none";
    resultScreen.style.display = "none";
    quizScreen.style.display = "block";
    score = 0;
    streak = 0;
    usedQuestions = [];
    availableQuestions = [...questions];
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

    questionText.innerText = questionData.question;
    optionsContainer.innerHTML = "";

    questionData.options.forEach((option, index) => {
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

    scoreBoard.innerText = `স্কোর: ${score}`;

    setTimeout(() => {
        loadQuestion();
    }, 1500);
}

// Timer
function resetTimer() {
    clearInterval(timer);
    timeLeft = 20;
    timerText.innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            loadQuestion();
        }
    }, 1000);
}

// End Game
function endGame() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "block";
    finalScoreText.innerText = `আপনার মোট স্কোর: ${score}`;
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
startBtn.addEventListener("click", startGame);
closeLeaderboardBtn.addEventListener("click", () => {
    leaderboardScreen.style.display = "none";
    homeScreen.style.display = "block";
});
