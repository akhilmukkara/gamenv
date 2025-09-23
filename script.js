const { jsPDF } = window.jspdf;

// Quiz data with explanations
const questions = [
    {
        question: "What is the main cause of climate change?",
        options: ["Deforestation", "Burning fossil fuels", "Overfishing", "Urbanization"],
        correct: "Burning fossil fuels",
        explanation: "Burning fossil fuels releases CO2, a major greenhouse gas. Learn more: <a href='https://www.unesco.org/en/climate-change' target='_blank'>UNESCO Climate Info</a>."
    },
    {
        question: "Which gas is primarily responsible for the greenhouse effect?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        correct: "Carbon Dioxide",
        explanation: "Carbon Dioxide traps heat in the atmosphere, driving global warming."
    },
    {
        question: "What can you do to reduce plastic waste?",
        options: ["Use reusable bags", "Buy more plastic", "Throw away recyclables", "Ignore recycling"],
        correct: "Use reusable bags",
        explanation: "Reusable bags reduce single-use plastic waste, helping the environment."
    },
    {
        question: "Why is biodiversity important?",
        options: ["It supports ecosystems", "It reduces food options", "It increases pollution", "It harms wildlife"],
        correct: "It supports ecosystems",
        explanation: "Biodiversity ensures ecosystem stability, supporting food chains and human survival."
    },
    {
        question: "What is sustainable development?",
        options: ["Meeting needs without compromising future generations", "Rapid industrialization", "Ignoring environmental laws", "Overexploitation of resources"],
        correct: "Meeting needs without compromising future generations",
        explanation: "Sustainable development balances current needs with future resource availability, per SDG goals."
    }
];

// Game state
let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let points = parseInt(localStorage.getItem('points')) || 0;
let badges = JSON.parse(localStorage.getItem('badges')) || [];
let streak = parseInt(localStorage.getItem('streak')) || 0;
let lastVisit = localStorage.getItem('lastVisit');
let questionsAnsweredToday = parseInt(localStorage.getItem('questionsAnsweredToday')) || 0;
let factsLearned = parseInt(localStorage.getItem('factsLearned')) || 0;

const ecoTips = [
    "Save water by fixing leaks!",
    "Use reusable bags to reduce plastic waste!",
    "Plant a tree to combat CO2 emissions!",
    "Turn off lights when not in use!",
    "Compost food waste for a healthier planet!"
];

const badgeDescriptions = {
    'Eco Starter': 'Earned 30 points!',
    'Green Champion': 'Earned 50 points!',
    'Daily Eco Star': 'Completed a daily challenge!',
    'Action Hero': 'Logged a real-world eco-task!'
};

// DOM elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const explanationEl = document.getElementById('explanation');
const pointsEl = document.getElementById('points-value');
const badgesEl = document.getElementById('badges-value');
const streakEl = document.getElementById('streak-value');
const levelEl = document.getElementById('level-value');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');
const challengeStatus = document.getElementById('challenge-status');

// Initialize game
function loadGame() {
    updateLevel();
    pointsEl.textContent = points;
    badgesEl.textContent = badges.length ? badges.join(', ') : 'None';
    streakEl.textContent = `${streak} days`;
    document.getElementById('facts-value').textContent = factsLearned;
    updateDailyChallenge();
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        questionEl.textContent = 'Quest Completed!';
        optionsEl.innerHTML = '';
        explanationEl.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }
    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    questionEl.classList.add('animate__fadeInDown');
    optionsEl.innerHTML = '';
    explanationEl.style.display = 'none';
    q.options.forEach((opt, index) => {
        const btn = document.createElement('div');
        btn.className = 'option animate__animated animate__fadeIn';
        btn.style.animationDelay = `${index * 0.2}s`;
        btn.textContent = opt;
        btn.onclick = () => selectOption(opt);
        optionsEl.appendChild(btn);
    });
    updateProgress();
    nextBtn.disabled = true;
}

function selectOption(selected) {
    const q = questions[currentQuestion];
    document.querySelectorAll('.option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
        if (btn.textContent === selected) {
            btn.classList.add('selected', selected === q.correct ? 'correct' : 'incorrect');
        }
        if (btn.textContent === q.correct) {
            btn.classList.add('correct');
        }
    });
    explanationEl.innerHTML = q.explanation;
    explanationEl.style.display = 'block';
    explanationEl.classList.add('animate__animated', 'animate__zoomIn');
    if (selected === q.correct) {
        points += 10;
        factsLearned++;
        localStorage.setItem('points', points);
        localStorage.setItem('factsLearned', factsLearned);
        pointsEl.textContent = points;
        document.getElementById('facts-value').textContent = factsLearned;
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        document.getElementById('correct-sound').play();
        updateBadges();
        questionsAnsweredToday++;
        localStorage.setItem('questionsAnsweredToday', questionsAnsweredToday);
        updateDailyChallenge();
    }
    const tipEl = document.getElementById('eco-tip');
    tipEl.textContent = ecoTips[Math.floor(Math.random() * ecoTips.length)];
    tipEl.style.display = 'block';
    setTimeout(() => tipEl.style.display = 'none', 3000);
    nextBtn.disabled = false;
    nextBtn.classList.add('animate__bounce');
}

function nextQuestion() {
    currentQuestion++;
    localStorage.setItem('currentQuestion', currentQuestion);
    updateLevel();
    loadQuestion();
}

function updateProgress() {
    const progress = (currentQuestion / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateLevel() {
    let level = 'Beginner';
    let avatarSrc = 'https://img.icons8.com/color/48/000000/tree.png';
    if (points >= 30) {
        level = 'Eco Warrior';
        avatarSrc = 'https://img.icons8.com/color/48/000000/forest.png';
    }
    if (points >= 50) {
        level = 'Green Champion';
        avatarSrc = 'https://img.icons8.com/color/48/000000/park.png';
    }
    levelEl.textContent = level;
    document.getElementById('avatar').src = avatarSrc;
    levelEl.parentElement.classList.add('animate__animated', 'animate__pulse');
    setTimeout(() => levelEl.parentElement.classList.remove('animate__pulse'), 1000);
}

function updateBadges() {
    if (points >= 30 && !badges.includes('Eco Starter')) {
        badges.push('Eco Starter');
        localStorage.setItem('badges', JSON.stringify(badges));
        badgesEl.textContent = badges.join(', ');
    }
    if (points >= 50 && !badges.includes('Green Champion')) {
        badges.push('Green Champion');
        localStorage.setItem('badges', JSON.stringify(badges));
        badgesEl.textContent = badges.join(', ');
    }
    badgesEl.parentElement.classList.add('animate__animated', 'animate__tada');
    setTimeout(() => badgesEl.parentElement.classList.remove('animate__tada'), 1000);
    badgesEl.onmouseover = () => {
        const tooltip = document.getElementById('badges-tooltip');
        tooltip.innerHTML = badges.map(b => `${b}: ${badgeDescriptions[b]}`).join('<br>');
        tooltip.style.display = 'block';
        tooltip.style.top = `${badgesEl.getBoundingClientRect().top - 60}px`;
        tooltip.style.left = `${badgesEl.getBoundingClientRect().left}px`;
    };
    badgesEl.onmouseout = () => {
        document.getElementById('badges-tooltip').style.display = 'none';
    };
}

function updateDailyChallenge() {
    const today = new Date().toDateString();
    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastVisit === yesterday.toDateString()) {
            streak++;
        } else {
            streak = 1;
        }
        questionsAnsweredToday = 0;
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastVisit', today);
        localStorage.setItem('questionsAnsweredToday', 0);
    }
    streakEl.textContent = `${streak} days`;
    if (questionsAnsweredToday >= 3) {
        challengeStatus.textContent = 'Daily Challenge Complete! +10 Bonus Points';
        if (!badges.includes('Daily Eco Star')) {
            badges.push('Daily Eco Star');
            points += 10;
            localStorage.setItem('points', points);
            pointsEl.textContent = points;
            localStorage.setItem('badges', JSON.stringify(badges));
            badgesEl.textContent = badges.join(', ');
        }
    } else {
        challengeStatus.textContent = `Answer ${3 - questionsAnsweredToday} more questions today!`;
    }
}

function logTask() {
    const taskInput = document.getElementById('task-input').value;
    if (taskInput.trim()) {
        points += 20;
        localStorage.setItem('points', points);
        pointsEl.textContent = points;
        if (!badges.includes('Action Hero')) {
            badges.push('Action Hero');
            localStorage.setItem('badges', JSON.stringify(badges));
            badgesEl.textContent = badges.join(', ');
        }
        document.getElementById('task-sound').play();
        alert('Task logged! +20 points');
        document.getElementById('task-input').value = '';
        updateLevel();
    } else {
        alert('Please describe your eco-task.');
    }
}

function generateCertificate() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('GamEnv Certificate', 20, 20);
    doc.setFontSize(14);
    doc.text(`Congratulations!`, 20, 40);
    doc.text(`You earned ${points} points and the following badges:`, 20, 50);
    doc.text(badges.length ? badges.join(', ') : 'None', 20, 60);
    doc.text(`Keep protecting our planet!`, 20, 80);
    doc.save('GamEnv_Certificate.pdf');
}

function resetGame() {
    localStorage.removeItem('points');
    localStorage.removeItem('badges');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('streak');
    localStorage.removeItem('lastVisit');
    localStorage.removeItem('questionsAnsweredToday');
    localStorage.removeItem('factsLearned');
    points = 0;
    badges = [];
    currentQuestion = 0;
    streak = 0;
    questionsAnsweredToday = 0;
    factsLearned = 0;
    pointsEl.textContent = points;
    badgesEl.textContent = 'None';
    streakEl.textContent = '0 days';
    document.getElementById('facts-value').textContent = factsLearned;
    challengeStatus.textContent = '';
    nextBtn.style.display = 'block';
    updateLevel();
    loadQuestion();
}

// Start the game
loadGame();