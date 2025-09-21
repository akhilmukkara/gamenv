// Quiz data
const questions = [
    {
        question: "What is the main cause of climate change?",
        options: ["Deforestation", "Burning fossil fuels", "Overfishing", "Urbanization"],
        correct: "Burning fossil fuels"
    },
    {
        question: "Which gas is primarily responsible for the greenhouse effect?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        correct: "Carbon Dioxide"
    },
    {
        question: "What can you do to reduce plastic waste?",
        options: ["Use reusable bags", "Buy more plastic", "Throw away recyclables", "Ignore recycling"],
        correct: "Use reusable bags"
    },
    {
        question: "Why is biodiversity important?",
        options: ["It supports ecosystems", "It reduces food options", "It increases pollution", "It harms wildlife"],
        correct: "It supports ecosystems"
    },
    {
        question: "What is sustainable development?",
        options: ["Meeting needs without compromising future generations", "Rapid industrialization", "Ignoring environmental laws", "Overexploitation of resources"],
        correct: "Meeting needs without compromising future generations"
    }
];

// Game state
let currentQuestion = 0;
let points = parseInt(localStorage.getItem('points')) || 0;
let badges = JSON.parse(localStorage.getItem('badges')) || [];

// DOM elements
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const pointsEl = document.getElementById('points-value');
const badgesEl = document.getElementById('badges-value');
const nextBtn = document.getElementById('next-btn');

// Load initial state
function loadGame() {
    pointsEl.textContent = points;
    badgesEl.textContent = badges.length ? badges.join(', ') : 'None';
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        questionEl.textContent = 'Quiz Completed!';
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';
        return;
    }
    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = opt;
        btn.onclick = () => selectOption(opt);
        optionsEl.appendChild(btn);
    });
    nextBtn.disabled = true;
}

function selectOption(selected) {
    const q = questions[currentQuestion];
    document.querySelectorAll('.option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === selected) btn.classList.add('selected');
    });
    if (selected === q.correct) {
        points += 10;
        localStorage.setItem('points', points);
        pointsEl.textContent = points;
        // Award badge based on points
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
    }
    nextBtn.disabled = false;
}

function nextQuestion() {
    currentQuestion++;
    loadQuestion();
}

function resetGame() {
    localStorage.removeItem('points');
    localStorage.removeItem('badges');
    points = 0;
    badges = [];
    currentQuestion = 0;
    pointsEl.textContent = points;
    badgesEl.textContent = 'None';
    nextBtn.style.display = 'block';
    loadQuestion();
}

// Start the game
loadGame();