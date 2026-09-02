// ====== AUDIO SYSTEM ======
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let soundEnabled = true;

function playTone(freq, type, duration, vol=0.1) {
    if (!soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const Sounds = {
    tick: () => playTone(600, 'square', 0.05, 0.05),
    warningTick: () => playTone(800, 'square', 0.1, 0.08),
    endAlarm: () => {
        playTone(400, 'sawtooth', 0.5, 0.2);
        setTimeout(() => playTone(300, 'sawtooth', 0.5, 0.2), 200);
        setTimeout(() => playTone(400, 'sawtooth', 0.8, 0.2), 400);
    },
    diceRoll: () => playTone(1200, 'triangle', 0.02, 0.02),
    diceResult: () => playTone(900, 'sine', 0.3, 0.1),
    chipDrop: () => playTone(300, 'sine', 0.1, 0.1)
};

// ====== DICE LOGIC ======
const diceFaces = [0, 0, 1, 1, 2, 2];
const diceDisplay = document.getElementById('dice-display');
const btnRoll = document.getElementById('btn-roll');
let isRolling = false;

btnRoll.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (isRolling) return;
    isRolling = true;
    btnRoll.disabled = true;
    
    // UX: Give visual feedback on the button
    btnRoll.innerHTML = '<i class="fa-solid fa-dice fa-spin"></i> Rolling...';
    
    diceDisplay.classList.add('rolling');
    let rollInterval = setInterval(() => {
        diceDisplay.innerText = diceFaces[Math.floor(Math.random() * diceFaces.length)];
        Sounds.diceRoll();
    }, 50);

    setTimeout(() => {
        clearInterval(rollInterval);
        diceDisplay.classList.remove('rolling');
        const finalResult = diceFaces[Math.floor(Math.random() * diceFaces.length)];
        diceDisplay.innerText = finalResult;
        Sounds.diceResult();
        
        // UX: Restore button
        isRolling = false;
        btnRoll.disabled = false;
        btnRoll.innerHTML = '<i class="fa-solid fa-dice"></i> Roll Dice';
    }, 800);
});

// ====== TIMER LOGIC ======
let timeLeft = 30;
let timerInterval = null;
let endTime = null;
const timerDisplay = document.getElementById('timer-display');
const btnStartTimer = document.getElementById('btn-start-timer');
const btnPauseTimer = document.getElementById('btn-pause-timer');
const btnResetTimer = document.getElementById('btn-reset-timer');

function updateTimerButtons() {
    const isRunning = timerInterval !== null;
    
    btnStartTimer.disabled = isRunning;
    btnStartTimer.style.opacity = isRunning ? '0.5' : '1';
    btnStartTimer.style.cursor = isRunning ? 'not-allowed' : 'pointer';

    btnPauseTimer.disabled = !isRunning;
    btnPauseTimer.style.opacity = !isRunning ? '0.5' : '1';
    btnPauseTimer.style.cursor = !isRunning ? 'not-allowed' : 'pointer';
}

function updateTimerDisplay() {
    timerDisplay.innerText = timeLeft;
    timerDisplay.className = '';
    if (timeLeft <= 10 && timeLeft > 5) {
        timerDisplay.classList.add('warning');
    } else if (timeLeft <= 5 && timeLeft > 0) {
        timerDisplay.classList.add('danger');
    } else if (timeLeft === 0) {
        timerDisplay.classList.add('danger'); // keep red when zero
    }
}

function startTimer() {
    if (timerInterval) return;
    if (timeLeft === 0) timeLeft = 30; // Auto reset if starting at 0
    updateTimerDisplay();
    
    // Initial state resume if needed
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    endTime = Date.now() + (timeLeft * 1000);
    
    timerInterval = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        
        if (remaining !== timeLeft) {
            timeLeft = remaining;
            
            if (timeLeft >= 0) {
                updateTimerDisplay();
                if (timeLeft > 0) {
                    if (timeLeft <= 5) Sounds.warningTick();
                    else Sounds.tick();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    updateTimerButtons();
                    Sounds.endAlarm();
                }
            }
        }
    }, 200);
    updateTimerButtons();
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        updateTimerButtons();
    }
}

function resetTimer() {
    pauseTimer();
    timeLeft = 30;
    updateTimerDisplay();
    updateTimerButtons();
}

btnStartTimer.addEventListener('click', startTimer);
btnPauseTimer.addEventListener('click', pauseTimer);
btnResetTimer.addEventListener('click', resetTimer);


// ====== DRAGGABLE CHIPS ======
const chips = document.querySelectorAll('.chip');
let activeChip = null;
let initialX, initialY, currentX, currentY, xOffset = 0, yOffset = 0;

chips.forEach(chip => {
    // We store individual offsets for each chip in attributes or properties
    chip.dataset.x = 0;
    chip.dataset.y = 0;

    chip.addEventListener('mousedown', dragStart);
    // Touch support
    chip.addEventListener('touchstart', dragStart, {passive: false});
});

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);
// Touch support
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    const target = e.currentTarget; // Safely reference the chip element
    
    if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - parseFloat(target.dataset.x || 0);
        initialY = e.touches[0].clientY - parseFloat(target.dataset.y || 0);
    } else {
        initialX = e.clientX - parseFloat(target.dataset.x || 0);
        initialY = e.clientY - parseFloat(target.dataset.y || 0);
    }

    activeChip = target;
    // Bring to front
    chips.forEach(c => c.style.zIndex = '10');
    activeChip.style.zIndex = '1000';
}

function drag(e) {
    if (activeChip) {
        e.preventDefault(); 
        
        let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        let clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        let newX = clientX - initialX;
        let newY = clientY - initialY;

        // Bounding logic to keep chip within container
        const container = document.getElementById('board-container');
        const minX = -activeChip.offsetLeft;
        const minY = -activeChip.offsetTop;
        const maxX = container.clientWidth - activeChip.offsetLeft - activeChip.offsetWidth;
        const maxY = container.clientHeight - activeChip.offsetTop - activeChip.offsetHeight;

        currentX = Math.max(minX, Math.min(newX, maxX));
        currentY = Math.max(minY, Math.min(newY, maxY));

        activeChip.dataset.x = currentX;
        activeChip.dataset.y = currentY;

        setTranslate(currentX, currentY, activeChip);
    }
}

function setTranslate(xPos, yPos, el) {
    const scale = el === activeChip ? 'scale(1.1)' : 'scale(1)';
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) ${scale}`;
}

function dragEnd(e) {
    if (activeChip) {
        initialX = currentX;
        initialY = currentY;
        activeChip = null;
        Sounds.chipDrop();
        saveState();
    }
}

// ====== SETTINGS TOGGLES ======
const btnToggleSound = document.getElementById('btn-toggle-sound');
const btnToggleChips = document.getElementById('btn-toggle-chips');
const btnToggleDice = document.getElementById('btn-toggle-dice');
const btnToggleTimer = document.getElementById('btn-toggle-timer');

const chipsContainer = document.getElementById('chips-container');
const diceSection = document.getElementById('dice-section');
const timerSection = document.getElementById('timer-section');

btnToggleSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnToggleSound.classList.toggle('disabled', !soundEnabled);
    btnToggleSound.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
});

btnToggleChips.addEventListener('click', () => {
    chipsContainer.classList.toggle('hidden');
    btnToggleChips.classList.toggle('disabled');
});

btnToggleDice.addEventListener('click', () => {
    diceSection.classList.toggle('hidden');
    btnToggleDice.classList.toggle('disabled');
});

btnToggleTimer.addEventListener('click', () => {
    timerSection.classList.toggle('hidden');
    btnToggleTimer.classList.toggle('disabled');
});

// ====== AUTO-SAVE & RESET ======
const btnResetGame = document.getElementById('btn-reset-game');

function saveState() {
    const state = {
        chips: Array.from(chips).map(chip => ({
            id: chip.id,
            x: parseFloat(chip.dataset.x || 0),
            y: parseFloat(chip.dataset.y || 0)
        })),
        settings: {
            soundEnabled,
            chipsHidden: chipsContainer.classList.contains('hidden'),
            diceHidden: diceSection.classList.contains('hidden'),
            timerHidden: timerSection.classList.contains('hidden')
        }
    };
    localStorage.setItem('30seconds_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('30seconds_state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            
            // Restore Chips
            state.chips.forEach(savedChip => {
                const chip = document.getElementById(savedChip.id);
                if (chip) {
                    chip.dataset.x = savedChip.x;
                    chip.dataset.y = savedChip.y;
                    setTranslate(savedChip.x, savedChip.y, chip);
                }
            });

            // Restore Settings
            if (state.settings.soundEnabled !== soundEnabled) btnToggleSound.click();
            if (state.settings.chipsHidden) btnToggleChips.click();
            if (state.settings.diceHidden) btnToggleDice.click();
            if (state.settings.timerHidden) btnToggleTimer.click();

        } catch(e) {
            console.error("Failed to load state", e);
        }
    }
}

// Reset Game
btnResetGame.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset the game? This will clear chip positions and settings.")) {
        localStorage.removeItem('30seconds_state');
        location.reload(); // Quickest way to clean reset the UI to initial state
    }
});

// Update save state listeners
btnToggleSound.addEventListener('click', saveState);
btnToggleChips.addEventListener('click', saveState);
btnToggleDice.addEventListener('click', saveState);
btnToggleTimer.addEventListener('click', saveState);

// Init display
updateTimerDisplay();
updateTimerButtons();
loadState();
