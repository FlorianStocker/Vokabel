const unitSelect = document.getElementById('unitSelect');
const newUnitInput = document.getElementById('newUnitInput');
const vocabInput = document.getElementById('vocabInput');
const saveVocabBtn = document.getElementById('saveVocabBtn');
const statusDiv = document.getElementById('status');
const flashcardContainer = document.getElementById('flashcardContainer');
const flashcard = document.getElementById('flashcard');
const frontText = document.getElementById('frontText');
const backText = document.getElementById('backText');
const counter = document.getElementById('counter');
const rightBtn = document.getElementById('rightBtn');
const wrongBtn = document.getElementById('wrongBtn');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');
const retryWrongBtn = document.getElementById('retryWrongBtn');
const restartBtn = document.getElementById('restartBtn');

let fullVocabList = [];   
let activeVocabList = []; 
let wrongVocabList = [];  
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;

window.addEventListener('DOMContentLoaded', () => {
    loadUnitsToDropdown();
});

function loadUnitsToDropdown() {
    unitSelect.innerHTML = '<option value="">-- Unit auswählen --</option>';
    const units = JSON.parse(localStorage.getItem('vocab_units')) || {};
    
    Object.keys(units).forEach(unitName => {
        const option = document.createElement('option');
        option.value = unitName;
        option.textContent = `${unitName} (${units[unitName].length} Vokabeln)`;
        unitSelect.appendChild(option);
    });
}

// Unit auswählen
unitSelect.addEventListener('change', (e) => {
    const selectedUnit = e.target.value;
    if (!selectedUnit) {
        flashcardContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        vocabInput.value = '';
        return;
    }

    const units = JSON.parse(localStorage.getItem('vocab_units')) || {};
    fullVocabList = units[selectedUnit] || [];
    vocabInput.value = fullVocabList.map(pair => `${pair.front}, ${pair.back}`).join(', ');

    if (fullVocabList.length > 0) {
        startTraining(fullVocabList);
        statusDiv.textContent = `Unit "${selectedUnit}" geladen. Viel Erfolg!`;
    }
});

// Unit speichern
saveVocabBtn.addEventListener('click', () => {
    let unitName = newUnitInput.value.trim();
    if (!unitName) {
        unitName = unitSelect.value;
    }

    if (!unitName) {
        statusDiv.textContent = "Bitte wähle eine Unit aus oder gib eine neue ein.";
        return;
    }

    const rawText = vocabInput.value.trim();
    if (!rawText) {
        statusDiv.textContent = "Bitte gib Vokabeln ein.";
        return;
    }

    const tokens = rawText.split(',').map(item => item.trim()).filter(item => item.length > 0);
    if (tokens.length < 2) {
        statusDiv.textContent = "Bitte gib mindestens ein vollständiges Paar ein (durch Komma getrennt).";
        return;
    }

    const newPairs = [];
    for (let i = 0; i < tokens.length - 1; i += 2) {
        newPairs.push({ front: tokens[i], back: tokens[i + 1] });
    }

    const units = JSON.parse(localStorage.getItem('vocab_units')) || {};
    units[unitName] = newPairs;
    localStorage.setItem('vocab_units', JSON.stringify(units));

    loadUnitsToDropdown();
    unitSelect.value = unitName;
    newUnitInput.value = '';

    fullVocabList = newPairs;
    startTraining(fullVocabList);
    statusDiv.textContent = `${newPairs.length} Vokabeln für "${unitName}" gespeichert!`;
});

// Trainingsrunde starten (Hier werden alle alten Werte sauber zurückgesetzt)
function startTraining(list) {
    activeVocabList = [...list];
    wrongVocabList = [];
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;

    resultContainer.classList.add('hidden');
    flashcardContainer.classList.remove('hidden');
    showCard(currentIndex);
}

function showCard(index) {
    if (activeVocabList.length === 0) return;
    frontText.textContent = activeVocabList[index].front;
    backText.textContent = activeVocabList[index].back;
    counter.textContent = `${index + 1} / ${activeVocabList.length}`;
    flashcard.classList.remove('flipped');
}

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

rightBtn.addEventListener('click', () => {
    correctCount++;
    nextCard();
});

wrongBtn.addEventListener('click', () => {
    wrongCount++;
    wrongVocabList.push(activeVocabList[currentIndex]);
    nextCard();
});

function nextCard() {
    currentIndex++;
    if (currentIndex < activeVocabList.length) {
        showCard(currentIndex);
    } else {
        showResults();
    }
}

function showResults() {
    flashcardContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    const total = activeVocabList.length;
    resultText.innerHTML = `
        <strong>Durchgang beendet!</strong><br><br>
        ✔️ Richtig: <strong>${correctCount}</strong><br>
        ❌ Falsch: <strong>${wrongCount}</strong> von ${total}
    `;

    if (wrongVocabList.length > 0) {
        retryWrongBtn.classList.remove('hidden');
    } else {
        retryWrongBtn.classList.add('hidden');
    }
}

retryWrongBtn.addEventListener('click', () => {
    startTraining(wrongVocabList);
});

restartBtn.addEventListener('click', () => {
    startTraining(fullVocabList);
});