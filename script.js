const { jsPDF } = window.jspdf;

// Quiz questions for each difficulty level
const basicQuestions = [
    {
        question: "What is the main cause of air pollution in cities?",
        options: ["Trees", "Cars", "Birds", "Bicycles"],
        correct: "Cars",
        explanation: "Cars emit harmful gases from burning fossil fuels."
    },
    {
        question: "What should you do with plastic bottles after use?",
        options: ["Throw in trash", "Recycle", "Burn them", "Leave in park"],
        correct: "Recycle",
        explanation: "Recycling reduces waste in landfills."
    },
    {
        question: "Why is saving water important?",
        options: ["It's fun", "To prevent shortages", "For swimming", "To make ice"],
        correct: "To prevent shortages",
        explanation: "Water is a limited resource."
    },
    {
        question: "What is a renewable energy source?",
        options: ["Coal", "Solar power", "Oil", "Gas"],
        correct: "Solar power",
        explanation: "Solar power comes from the sun, which is unlimited."
    },
    {
        question: "How can you reduce energy use at home?",
        options: ["Leave lights on", "Turn off lights when not in use", "Use more heaters", "Open windows in winter"],
        correct: "Turn off lights when not in use",
        explanation: "Saves electricity and reduces bills."
    },
    {
        question: "What is composting?",
        options: ["Burning trash", "Turning food waste into soil", "Throwing away food", "Buying soil"],
        correct: "Turning food waste into soil",
        explanation: "Composting helps plants grow and reduces waste."
    },
    {
        question: "Why are trees important?",
        options: ["They make noise", "They provide oxygen", "They eat food", "They drive cars"],
        correct: "They provide oxygen",
        explanation: "Trees absorb CO2 and release oxygen."
    },
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
    {
        question: "What is biodiversity?",
        options: ["Variety of life", "Single species", "Pollution type", "Energy source"],
        correct: "Variety of life",
        explanation: "Biodiversity supports ecosystem health."
    },
    {
        question: "How does deforestation affect climate?",
        options: ["Increases CO2", "Decreases CO2", "No effect", "Cools the planet"],
        correct: "Increases CO2",
        explanation: "Trees absorb CO2; removing them increases greenhouse gases."
    },
    {
        question: "What is sustainable development?",
        options: ["Using resources without depleting them", "Rapid use of resources", "Ignoring environment", "Building more factories"],
        correct: "Using resources without depleting them",
        explanation: "Meets current needs without compromising future."
    },
    {
        question: "What is plastic pollution's impact on oceans?",
        options: ["Harms marine life", "Helps fish", "Cleans water", "No impact"],
        correct: "Harms marine life",
        explanation: "Animals mistake plastic for food."
    },
    {
        question: "What is renewable energy?",
        options: ["Energy from sources that replenish", "From fossil fuels", "From nuclear", "From coal"],
        correct: "Energy from sources that replenish",
        explanation: "Like solar, wind."
    },
    {
        question: "Why is coral bleaching a problem?",
        options: ["Destroys habitats", "Makes corals colorful", "Helps fish", "No problem"],
        correct: "Destroys habitats",
        explanation: "Due to warming oceans, affects marine biodiversity."
    },
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
    {
        question: "What is circular economy?",
        options: ["Recycling and reusing to minimize waste", "Linear production", "Wasting resources", "Buying new"],
        correct: "Recycling and reusing to minimize waste",
        explanation: "Reduces environmental impact."
    },
    {
        question: "How does climate change affect sea levels?",
        options: ["Rising due to melting ice", "Lowering", "No effect", "Fluctuating randomly"],
        correct: "Rising due to melting ice",
        explanation: "Threatens coastal areas."
    },
    {
        question: "What is IPCC?",
        options: ["Intergovernmental Panel on Climate Change", "International Police", "Food organization", "Sports committee"],
        correct: "Intergovernmental Panel on Climate Change",
        explanation: "Assesses climate science."
    },
    {
        question: "What is net zero emissions?",
        options: ["Balance between emitted and removed greenhouse gases", "No emissions at all", "Increasing emissions", "Ignoring emissions"],
        correct: "Balance between emitted and removed greenhouse gases",
        explanation: "Goal for limiting warming."
    },
    {
        question: "What is environmental justice?",
        options: ["Fair treatment in environmental policies", "Legal system for nature", "Ignoring poor communities", "Building more factories"],
        correct: "Fair treatment in environmental policies",
        explanation: "Ensures no group bears disproportionate burden."
    },
    {
        question: "What is the role of wetlands in environment?",
        options: ["Carbon sinks and biodiversity hotspots", "Waste dumps", "Urban development", "No role"],
        correct: "Carbon sinks and biodiversity hotspots",
        explanation: "Absorb CO2 and filter water."
    },
    {
        question: "What is microplastic?",
        options: ["Small plastic particles polluting oceans", "Large plastic bags", "Type of fish", "Clean water"],
        correct: "Small plastic particles polluting oceans",
        explanation: "Enter food chain, harming health."
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
let userName = localStorage.getItem('userName') || '';
let difficulty = localStorage.getItem('difficulty') || '';
let questionsSet = [];

// DOM elements
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

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Set questions based on difficulty
function setQuestions() {
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
    questionsSet = shuffle([...sourceQuestions]); // Randomize and copy
}

// Initialize game
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
        nextBtn.disabled = true;
        updateProgress();
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

function selectOption(opt) {
    try {
        if (selectedOption) return;
        selectedOption = opt;
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === opt) {
                btn.classList.add('selected');
            }
            btn.onclick = null;
        });
        okBtn.disabled = false;
    } catch (error) {
        console.error('Error selecting option:', error);
    }
}

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
        const progress = currentQuestion >= questionsSet.length ? 100 : (currentQuestion / questionsSet.length) * 100;
        progressBar.style.width = `${progress}%`;
        console.log(`Progress: ${progress}% (currentQuestion: ${currentQuestion}, questionsSet.length: ${questionsSet.length})`);
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

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
        doc.text(`Congratulations, ${userName}!`, 20, 40);
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