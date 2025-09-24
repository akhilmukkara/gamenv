// Import jsPDF for certificate generation
const { jsPDF } = window.jspdf;

// Question arrays for each difficulty level (8 questions each)
const basicQuestions = [
    {
        question: "What is the main cause of air pollution in cities?",
        options: ["Trees", "Cars", "Birds", "Bicycles"],
        correct: "Cars",
        explanation: "Cars emit harmful gases from burning fossil fuels."
    },
    // ... (7 more questions for Basic)
    {
        question: "What is pollution?",
        options: ["Clean air", "Harmful substances in environment", "Good for health", "Type of food"],
        correct: "Harmful substances in environment",
        explanation: "Pollution harms living things."
    }
];

const intermediateQuestions = [
    {
        question: "What is the greenhouse effect?",
        options: ["Gardening in glass houses", "Trapping heat in atmosphere", "Cooling the Earth", "Planting trees"],
        correct: "Trapping heat in atmosphere",
        explanation: "Gases like CO2 trap heat, causing global warming."
    },
    // ... (7 more questions for Intermediate)
    {
        question: "What is carbon footprint?",
        options: ["Amount of CO2 emitted by activities", "Shoe print in carbon", "Type of fuel", "Plant growth"],
        correct: "Amount of CO2 emitted by activities",
        explanation: "Measures environmental impact."
    }
];

const hardQuestions = [
    {
        question: "What is the Paris Agreement?",
        options: ["Climate accord to limit warming", "Fashion treaty", "Food agreement", "Travel pact"],
        correct: "Climate accord to limit warming",
        explanation: "Aims to keep global temperature rise below 2°C."
    },
    // ... (7 more questions for Hard)
    {
        question: "What is microplastic?",
        options: ["Small plastic particles polluting oceans", "Large plastic bags", "Type of fish", "Clean water"],
        correct: "Small plastic particles polluting oceans",
        explanation: "Enter food chain, harming health."
    }
];

// Game state variables (stored in localStorage for persistence)
let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0; // Tracks current question index
let points = parseInt(localStorage.getItem('points')) || 0; // User points
let badges = JSON.parse(localStorage.getItem('badges')) || []; // Earned badges
let streak = parseInt(localStorage.getItem('streak')) || 0; // Daily streak
let lastVisit = localStorage.getItem('lastVisit'); // Last visit date
let questionsAnsweredToday = parseInt(localStorage.getItem('questionsAnsweredToday')) || 0; // Daily answers
let factsLearned = parseInt(localStorage.getItem('factsLearned')) || 0; // Eco-facts learned
let selectedOption = null; // Current selected option
let userName = localStorage.getItem('userName') || ''; // User’s name
let difficulty = localStorage.getItem('difficulty') || ''; // Chosen difficulty
let questionsSet = []; // Randomized questions for current quiz

// Eco-tips for popups
const ecoTips = [
    "Save water by fixing leaks!",
    "Use reusable bags to reduce plastic waste!",
    "Plant a tree to combat CO2 emissions!",
    "Turn off lights when not in use!",
    "Compost food waste for a healthier planet!"
];

// Badge descriptions for tooltip
const badgeDescriptions = {
    'Eco Starter': 'Earned 50 points!',
    'Green Champion': 'Earned 80 points!',
    'Daily Eco Star': 'Completed a daily challenge!',
    'Action Hero': 'Logged a real-world eco-task!'
};

// DOM elements (links to HTML for updates)
const namePrompt = document.getElementById('name-prompt');
const difficultyPrompt = document.getElementById('difficulty-prompt');
const mainContent = document.getElementById('main-content');
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
const completionMessage = document.getElementById('completion-message');
const completionText = document.getElementById('completion-text');

// Shuffles an array (Fisher-Yates algorithm) for random question order
function shuffle(array) {
    try {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    } catch (error) {
        console.error('Error shuffling array:', error);
        return array; // Return unchanged array if error occurs
    }
}

// Sets questions based on selected difficulty
function setQuestions() {
    try {
        let sourceQuestions;
        switch (difficulty) {
            case 'basic':
                sourceQuestions = basicQuestions;
                break;
            case 'intermediate':
                sourceQuestions = intermediateQuestions;
                break;
            case 'hard':
                sourceQuestions = hardQuestions;
                break;
            default:
                sourceQuestions = basicQuestions; // Fallback
        }
        questionsSet = shuffle([...sourceQuestions]); // Randomize copy
    } catch (error) {
        console.error('Error setting questions:', error);
    }
}

// Initializes game, showing appropriate screen
function loadGame() {
    try {
        if (!userName) {
            namePrompt.style.display = 'block';
            difficultyPrompt.style.display = 'none';
            mainContent.style.display = 'none';
            return;
        }
        if (!difficulty) {
            namePrompt.style.display = 'none';
            difficultyPrompt.style.display = 'block';
            mainContent.style.display = 'none';
            return;
        }
        namePrompt.style.display = 'none';
        difficultyPrompt.style.display = 'none';
        mainContent.style.display = 'block';
        setQuestions();
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

// Handles name submission
function submitName() {
    try {
        const nameInput = document.getElementById('name-input').value.trim();
        if (nameInput) {
            userName = nameInput;
            localStorage.setItem('userName', userName);
            namePrompt.style.display = 'none';
            difficultyPrompt.style.display = 'block';
        } else {
            alert('Please enter your name to start the quiz!');
        }
    } catch (error) {
        console.error('Error submitting name:', error);
    }
}

// Starts quiz with selected difficulty
function startQuiz(selectedDifficulty) {
    try {
        difficulty = selectedDifficulty;
        localStorage.setItem('difficulty', difficulty);
        currentQuestion = 0;
        localStorage.setItem('currentQuestion', currentQuestion);
        setQuestions();
        difficultyPrompt.style.display = 'none';
        mainContent.style.display = 'block';
        loadGame();
    } catch (error) {
        console.error('Error starting quiz:', error);
    }
}

// Resets quiz for replay, keeping points/badges
function playAgain() {
    try {
        currentQuestion = 0;
        questionsSet = [];
        difficulty = '';
        localStorage.setItem('currentQuestion', currentQuestion);
        localStorage.setItem('difficulty', difficulty);
        completionMessage.style.display = 'none';
        namePrompt.style.display = 'none';
        difficultyPrompt.style.display = 'block';
        mainContent.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = true;
        console.log('Play Again: Reset quiz, showing difficulty prompt');
    } catch (error) {
        console.error('Error playing again:', error);
    }
}

// Loads current question or completion message
function loadQuestion() {
    try {
        if (currentQuestion >= questionsSet.length) {
            questionEl.textContent = '';
            optionsEl.innerHTML = '';
            explanationEl.style.display = 'none';
            okBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            completionMessage.style.display = 'block';
            const messages = ['you nailed it!', 'you rocked it!', 'you’re an eco-star!'];
            completionText.textContent = `Congrats ${userName}, ${messages[Math.floor(Math.random() * messages.length)]} You earned ${points} points and these badges: ${badges.length ? badges.join(', ') : 'None'}.`;
            progressBar.style.width = '100%';
            console.log('Quiz completed, showing completion message');
            return;
        }
        const q = questionsSet[currentQuestion];
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
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = true;
        updateProgress();
        console.log(`Loaded question ${currentQuestion + 1}, Next button visible: ${nextBtn.style.display}, disabled: ${nextBtn.disabled}`);
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

// Handles option selection (allows multiple changes)
function selectOption(opt) {
    try {
        selectedOption = opt;
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === opt) {
                btn.classList.add('selected');
            }
            btn.onclick = () => selectOption(btn.textContent);
        });
        okBtn.disabled = false;
        console.log(`Selected option: ${opt}, OK button enabled`);
    } catch (error) {
        console.error('Error selecting option:', error);
    }
}

// Confirms selection, shows feedback
function confirmSelection() {
    try {
        const q = questionsSet[currentQuestion];
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            if (btn.textContent === selectedOption) {
                btn.classList.add('selected', selectedOption === q.correct ? 'correct' : 'incorrect');
            }
            if (btn.textContent === q.correct) {
                btn.classList.add('correct');
            }
            btn.onclick = null;
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
        setTimeout(() => {
            tipEl.style.display = 'none';
            tipEl.classList.remove('animate__animated', 'animate__slideInRight', 'animate__fadeOut');
        }, 3000);
        okBtn.disabled = true;
        nextBtn.disabled = false;
        nextBtn.classList.add('animate__bounce');
        console.log('Confirmed selection, Next button enabled');
    } catch (error) {
        console.error('Error confirming selection:', error);
    }
}

// Advances to next question
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

// Updates progress bar (100% on completion)
function updateProgress() {
    try {
        const progress = currentQuestion >= questionsSet.length ? 100 : (currentQuestion / questionsSet.length) * 100;
        progressBar.style.width = `${progress}%`;
        console.log(`Progress: ${progress}% (currentQuestion: ${currentQuestion}, questionsSet.length: ${questionsSet.length})`);
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

// Updates user level based on points
function updateLevel() {
    try {
        let level = 'Beginner';
        if (points >= 50) level = 'Eco Warrior';
        if (points >= 80) level = 'Green Champion';
        levelEl.textContent = level;
        levelEl.parentElement.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => levelEl.parentElement.classList.remove('animate__pulse'), 1000);
    } catch (error) {
        console.error('Error updating level:', error);
    }
}

// Awards badges based on points
function updateBadges() {
    try {
        if (points >= 50 && !badges.includes('Eco Starter')) {
            badges.push('Eco Starter');
            localStorage.setItem('badges', JSON.stringify(badges));
            badgesEl.textContent = badges.join(', ');
        }
        if (points >= 80 && !badges.includes('Green Champion')) {
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

// Manages daily streak and challenge
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

// Logs eco-tasks for points
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

// Generates a styled certificate PDF
function generateCertificate() {
    try {
        const doc = new jsPDF();
        doc.setProperties({
            title: 'GamEnv Eco-Champion Certificate',
            subject: 'Certificate of Achievement',
            author: 'GamEnv',
            creator: 'GamEnv'
        });
        const green = [76, 175, 80];
        const darkGreen = [27, 94, 32];
        doc.setDrawColor(...green);
        doc.setLineWidth(2);
        doc.rect(10, 10, 190, 277);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkGreen);
        doc.text('GamEnv Eco-Champion Certificate', 105, 40, { align: 'center' });
        doc.setLineWidth(1);
        doc.line(30, 50, 180, 50);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`This certifies that`, 105, 70, { align: 'center' });
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...green);
        doc.text(`${userName}`, 105, 90, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`has successfully completed the ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level`, 105, 110, { align: 'center' });
        doc.text(`of the GamEnv Environmental Quiz`, 105, 125, { align: 'center' });
        doc.text(`on ${new Date().toLocaleDateString()}`, 105, 140, { align: 'center' });
        doc.text(`Points Earned: ${points}`, 105, 160, { align: 'center' });
        doc.text(`Badges Awarded: ${badges.length ? badges.join(', ') : 'None'}`, 105, 175, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(...darkGreen);
        doc.text('Thank you for your commitment to environmental education!', 105, 200, { align: 'center' });
        doc.text('Keep protecting our planet.', 105, 215, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Powered by GamEnv - Sustainable Learning Initiative', 105, 260, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(30, 250, 180, 250);
        doc.setFontSize(20);
        doc.setTextColor(...green);
        doc.text('🌿', 20, 20);
        doc.text('🌿', 190, 20);
        doc.text('🌿', 20, 277);
        doc.text('🌿', 190, 277);
        doc.save('GamEnv_Certificate.pdf');
    } catch (error) {
        console.error('Error generating certificate:', error);
    }
}

// Resets all progress
function resetGame() {
    try {
        localStorage.removeItem('points');
        localStorage.removeItem('badges');
        localStorage.removeItem('currentQuestion');
        localStorage.removeItem('streak');
        localStorage.removeItem('lastVisit');
        localStorage.removeItem('questionsAnsweredToday');
        localStorage.removeItem('factsLearned');
        localStorage.removeItem('userName');
        localStorage.removeItem('difficulty');
        points = 0;
        badges = [];
        currentQuestion = 0;
        streak = 0;
        questionsAnsweredToday = 0;
        factsLearned = 0;
        selectedOption = null;
        userName = '';
        difficulty = '';
        questionsSet = [];
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
        completionMessage.style.display = 'none';
        badgesEl.onmouseover = null;
        badgesEl.onmouseout = null;
        namePrompt.style.display = 'block';
        difficultyPrompt.style.display = 'none';
        mainContent.style.display = 'none';
    } catch (error) {
        console.error('Error resetting game:', error);
        alert('Failed to reset progress. Please check the console for errors.');
    }
}

// Start the game
loadGame();