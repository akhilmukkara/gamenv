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
    },
    {
        question: "What is a major renewable energy source?",
        options: ["Coal", "Solar power", "Natural gas", "Nuclear waste"],
        correct: "Solar Power",
        explanation: "Solar power harnesses energy from the sun, a renewable resource, reducing reliance on fossil fuels."
        
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
let selectedOption = null;

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
const okBtn = document.getElementById('ok-btn');
const challengeStatus = document.getElementById('challenge-status');
const factsEl = document.getElementById('facts-value');
const tipEl = document.getElementById('eco-tip');
const avatarEl = document.getElementById('avatar');

// Initialize game
function loadGame() {
    try {
        updateLevel();
        pointsEl.textContent = points;
        badgesEl.textContent = badges.length ? badges.join(', ') : 'None';
        streakEl.textContent = `${streak} days`;
        factsEl.textContent = factsLearned;
        updateDailyChallenge();
        loadQuestion();
    } catch (error) {
        console.error('Error loading game:', error);
    }
}

function loadQuestion() {
    try {
        if (currentQuestion >= questions.length) {
            questionEl.textContent = 'Quest Completed!';
            optionsEl.innerHTML = '';
            explanationEl.style.display = 'none';
            okBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        const q = questions[currentQuestion];
        questionEl.textContent = q.question;
        questionEl.classList.add('animate__fadeInDown');
        optionsEl.innerHTML = '';
        explanationEl.style.display = 'none';
        selectedOption = null;
        q.options.forEach((opt, index) => {
            const btn = document.createElement('div');
            btn.className = 'option animate__animated animate__fadeIn';
            btn.style.animationDelay = `${index * 0.2}s`;
            btn.textContent = opt;
            btn.onclick = () => selectOption(opt);
            optionsEl.appendChild(btn);
        });
        okBtn.style.display = 'inline-block';
        okBtn.disabled = true;
        nextBtn.disabled = true;
        updateProgress();
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

function selectOption(opt) {
    try {
        if (selectedOption) return; // Lock selection
        selectedOption = opt;
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === opt) {
                btn.classList.add('selected');
            }
            btn.onclick = null; // Disable further clicks
        });
        okBtn.disabled = false;
    } catch (error) {
        console.error('Error selecting option:', error);
    }
}

function confirmSelection() {
    try {
        const q = questions[currentQuestion];
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            if (btn.textContent === selectedOption) {
                btn.classList.add('selected', selectedOption === q.correct ? 'correct' : 'incorrect');
            }
            if (btn.textContent === q.correct) {
                btn.classList.add('correct');
            }
        });
        explanationEl.innerHTML = q.explanation;
        explanationEl.style.display = 'block';
        explanationEl.classList.add('animate__animated', 'animate__zoomIn');
        if (selectedOption === q.correct) {
            points += 10;
            factsLearned++;
            localStorage.setItem('points', points);
            localStorage.setItem('factsLearned', factsLearned);
            pointsEl.textContent = points;
            factsEl.textContent = factsLearned;
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            document.getElementById('correct-sound').play();
            updateBadges();
            questionsAnsweredToday++;
            localStorage.setItem('questionsAnsweredToday', questionsAnsweredToday);
            updateDailyChallenge();
        }
        tipEl.textContent = ecoTips[Math.floor(Math.random() * ecoTips.length)];
        tipEl.style.display = 'block';
        setTimeout(() => tipEl.style.display = 'none', 3000);
        okBtn.disabled = true;
        nextBtn.disabled = false;
        nextBtn.classList.add('animate__bounce');
    } catch (error) {
        console.error('Error confirming selection:', error);
    }
}

function nextQuestion() {
    try {
        currentQuestion++;
        localStorage.setItem('currentQuestion', currentQuestion);
        updateLevel();
        loadQuestion();
    } catch (error) {
        console.error('Error advancing to next question:', error);
    }
}

function updateProgress() {
    try {
        const progress = (currentQuestion / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

function updateLevel() {
    try {
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
        avatarEl.src = avatarSrc;
        levelEl.parentElement.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => levelEl.parentElement.classList.remove('animate__pulse'), 1000);
    } catch (error) {
        console.error('Error updating level:', error);
    }
}

function updateBadges() {
    try {
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
    } catch (error) {
        console.error('Error updating badges:', error);
    }
}

function updateDailyChallenge() {
    try {
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
    } catch (error) {
        console.error('Error updating daily challenge:', error);
    }
}

function logTask() {
    try {
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
    } catch (error) {
        console.error('Error logging task:', error);
    }
}

function generateCertificate() {
    try {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('GamEnv Certificate', 20, 20);
        doc.setFontSize(14);
        doc.text(`Congratulations!`, 20, 40);
        doc.text(`You earned ${points} points and the following badges:`, 20, 50);
        doc.text(badges.length ? badges.join(', ') : 'None', 20, 60);
        doc.text(`Keep protecting our planet!`, 20, 80);
        doc.save('GamEnv_Certificate.pdf');
    } catch (error) {
        console.error('Error generating certificate:', error);
    }
}

function resetGame() {
    try {
        // Clear localStorage
        localStorage.removeItem('points');
        localStorage.removeItem('badges');
        localStorage.removeItem('currentQuestion');
        localStorage.removeItem('streak');
        localStorage.removeItem('lastVisit');
        localStorage.removeItem('questionsAnsweredToday');
        localStorage.removeItem('factsLearned');

        // Reset state variables
        points = 0;
        badges = [];
        currentQuestion = 0;
        streak = 0;
        questionsAnsweredToday = 0;
        factsLearned = 0;
        selectedOption = null;

        // Update DOM elements
        pointsEl.textContent = points;
        badgesEl.textContent = 'None';
        streakEl.textContent = '0 days';
        factsEl.textContent = factsLearned;
        challengeStatus.textContent = '';
        nextBtn.style.display = 'block';
        okBtn.style.display = 'inline-block';
        okBtn.disabled = true;
        questionEl.classList.remove('animate__fadeInDown');
        explanationEl.style.display = 'none';
        tipEl.style.display = 'none';

        // Reset badge tooltip event listeners
        badgesEl.onmouseover = null;
        badgesEl.onmouseout = null;

        updateLevel();
        loadQuestion();
    } catch (error) {
        console.error('Error resetting game:', error);
        alert('Failed to reset progress. Please check the console for errors.');
    }
}

// Start the game
loadGame();