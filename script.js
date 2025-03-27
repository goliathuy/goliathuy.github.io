document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startBasicBtn = document.getElementById('start-basic');
    const startLongBtn = document.getElementById('start-long');
    const startQuickBtn = document.getElementById('start-quick');
    const stopBtn = document.getElementById('stop-btn');
    const customizeBtn = document.getElementById('customize-btn');
    const startCustomBtn = document.getElementById('start-custom');
    const closeCustomizeBtn = document.getElementById('close-customize');
    const instruction = document.getElementById('instruction');
    const countdown = document.getElementById('countdown');
    const phaseLabel = document.getElementById('phase-label');
    const timerFill = document.getElementById('timer-fill');
    const timerNegative = document.getElementById('timer-negative');
    
    // Panel Elements
    const customizePanel = document.getElementById('customize-panel');
    const exercisesPanel = document.getElementById('exercises-panel');
    const progressPanel = document.getElementById('progress-panel');
    const aboutPanel = document.getElementById('about-panel');
    const benefitsPanel = document.getElementById('benefits-panel');
    const faqPanel = document.getElementById('faq-panel');
    
    // Section Buttons
    const exercisesBtn = document.getElementById('exercises-btn');
    const progressBtn = document.getElementById('progress-btn');
    const aboutBtn = document.getElementById('about-btn');
    const benefitsBtn = document.getElementById('benefits-btn');
    const faqBtn = document.getElementById('faq-btn');
    
    // Close Buttons
    const closeExercisesBtn = document.getElementById('close-exercises');
    const closeProgressBtn = document.getElementById('close-progress');
    const closeAboutBtn = document.getElementById('close-about');
    const closeBenefitsBtn = document.getElementById('close-benefits');
    const closeFaqBtn = document.getElementById('close-faq');
    
    // Customize Inputs
    const customHoldInput = document.getElementById('custom-hold');
    const customRelaxInput = document.getElementById('custom-relax');
    const customRepsInput = document.getElementById('custom-reps');
    
    // Progress Tracking
    const todayCountDisplay = document.getElementById('today-count');
    const streakDisplay = document.getElementById('streak');
    const logSessionBtn = document.getElementById('log-session');
    
    // Sound and Vibration Controls
    const soundToggle = document.getElementById('sound-toggle');
    const vibrationToggle = document.getElementById('vibration-toggle');
    
    let todayCount = 0;
    let streak = 0;
    
    // Load saved data
    if (localStorage.getItem('todayCount')) {
        todayCount = parseInt(localStorage.getItem('todayCount'));
        todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
    }
    
    if (localStorage.getItem('streak')) {
        streak = parseInt(localStorage.getItem('streak'));
        streakDisplay.textContent = `Current streak: ${streak} days`;
    }
    
    // Timer Variables
    let timer;
    let seconds = 0;
    let phaseSeconds = 0;
    let phaseDuration = 0;
    let isHolding = true;
    let count = 0;
    let totalReps = 0;
    
    // Audio Context and Sounds
    let audioContext;
    let holdSound;
    let relaxSound;
    
    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create hold sound (higher pitch)
        holdSound = audioContext.createOscillator();
        holdSound.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        
        // Create relax sound (lower pitch)
        relaxSound = audioContext.createOscillator();
        relaxSound.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    }
    
    function playSound(isHold) {
        if (!soundToggle.checked || !audioContext) return;
        
        const sound = isHold ? holdSound : relaxSound;
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        sound.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        sound.start();
        setTimeout(() => {
            sound.stop();
            sound.disconnect();
        }, 200);
    }
    
    function vibrate(duration) {
        if (vibrationToggle.checked && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Helper Functions
    function hideAllPanels() {
        console.log('Hiding all panels');
        customizePanel.style.display = 'none';
        exercisesPanel.style.display = 'none';
        progressPanel.style.display = 'none';
        aboutPanel.style.display = 'none';
        benefitsPanel.style.display = 'none';
        faqPanel.style.display = 'none';
    }
    
    function updateTimerVisuals() {
        console.log('Updating timer visuals');
        const remainingTime = phaseDuration - phaseSeconds;
        const percentage = (phaseSeconds / phaseDuration) * 100;
        
        // Update countdown display
        countdown.textContent = remainingTime;
        
        // Update phase label
        phaseLabel.textContent = isHolding ? "HOLD" : "RELAX";
        
        // Update timer colors
        if (isHolding) {
            timerFill.className = 'timer-fill hold';
        } else {
            timerFill.className = 'timer-fill relax';
        }
        
        // Clip path for timer fill (what's left)
        timerFill.style.transform = `scaleY(${1 - (percentage / 100)})`;
        
        // Clip path for timer negative (what's used)
        timerNegative.style.transform = `scaleY(${percentage / 100})`;
        
        // Add blinking effect for last 3 seconds
        if (remainingTime <= 3) {
            timerFill.classList.add('blinking');
            timerNegative.classList.add('blinking');
        } else {
            timerFill.classList.remove('blinking');
            timerNegative.classList.remove('blinking');
        }
    }
    
    function resetTimer() {
        timerFill.style.transform = 'scaleY(1)';
        timerNegative.style.transform = 'scaleY(0)';
        timerFill.className = 'timer-fill';
        timerNegative.className = 'timer-negative';
        countdown.textContent = '0';
        phaseLabel.textContent = 'READY';
        instruction.textContent = 'Select an exercise to begin';
        
        // Reset progress ring
        const progressRing = document.getElementById('rep-progress-ring');
        const repCount = document.getElementById('rep-count');
        if (progressRing && repCount) {
            progressRing.style.background = 'conic-gradient(var(--secondary-color) 0%, transparent 0%)';
            repCount.textContent = '0/0';
        }
    }
    
    function stopTimer() {
        clearInterval(timer);
        startBasicBtn.disabled = false;
        startLongBtn.disabled = false;
        startQuickBtn.disabled = false;
        customizeBtn.disabled = false;
        stopBtn.disabled = true;
        resetTimer();
    }
    
    function startExercise(holdTime, relaxTime, repetitions) {
        console.log('Starting exercise with holdTime:', holdTime, 'relaxTime:', relaxTime, 'repetitions:', repetitions);
        stopTimer();
        
        // Initialize audio on first user interaction
        if (!audioContext) {
            initAudio();
        }
        
        // Reset progress ring and counter
        const progressRing = document.getElementById('rep-progress-ring');
        const repCount = document.getElementById('rep-count');
        if (progressRing && repCount) {
            progressRing.style.background = 'conic-gradient(var(--secondary-color) 0%, transparent 0%)';
            repCount.textContent = `0/${repetitions}`;
        }
        
        // Add preparation countdown
        let prepTime = 3;
        instruction.textContent = "Get ready...";
        phaseLabel.textContent = "PREP";
        phaseLabel.classList.add('preparation');
        countdown.textContent = prepTime;
        
        const prepTimer = setInterval(() => {
            prepTime--;
            if (prepTime > 0) {
                countdown.textContent = prepTime;
                playSound(true);
                vibrate(100);
            } else {
                clearInterval(prepTimer);
                phaseLabel.classList.remove('preparation');
                startMainExercise();
            }
        }, 1000);
        
        function startMainExercise() {
            seconds = 0;
            phaseSeconds = 0;
            phaseDuration = holdTime;
            isHolding = true;
            count = 0; // Make sure count starts at 0
            totalReps = repetitions;
            
            console.log('Starting main exercise loop with count:', count, 'totalReps:', totalReps);
            
            startBasicBtn.disabled = true;
            startLongBtn.disabled = true;
            startQuickBtn.disabled = true;
            customizeBtn.disabled = true;
            stopBtn.disabled = false;
            
            instruction.textContent = "Contract your pelvic floor muscles";
            updateTimerVisuals();
            
            timer = setInterval(function() {
                // Immediately check if we've already completed all reps
                if (count >= totalReps) {
                    console.log("COMPLETED ALL REPS - STOPPING TIMER");
                    
                    // Ensure the timer is completely cleared
                    clearInterval(timer);
                    timer = null;
                    
                    // Update UI to completion state
                    instruction.textContent = "Well done! Session complete.";
                    countdown.textContent = "✓";
                    phaseLabel.textContent = "DONE";
                    phaseLabel.classList.remove('preparation');
                    
                    // Provide feedback
                    playSound(true);
                    vibrate(300);
                    
                    // Set progress ring to 100%
                    const progressRing = document.getElementById('rep-progress-ring');
                    const repCount = document.getElementById('rep-count');
                    if (progressRing && repCount) {
                        progressRing.style.background = `conic-gradient(var(--secondary-color) 0% 100%, transparent 100% 100%)`;
                        repCount.textContent = `${totalReps}/${totalReps}`;
                    }
                    
                    // Log session after a brief delay
                    setTimeout(() => {
                        stopTimer();
                        promptLogSession();
                    }, 1500);
                    
                    // Immediate return to prevent any further processing
                    return;
                }
                
                // Normal timer logic if we haven't completed all reps
                phaseSeconds++;
                seconds++;
                updateTimerVisuals();
                
                // Calculate display elements
                let currentRep = count + 1;
                let progressRatio;
                
                if (isHolding) {
                    progressRatio = (count + 0.25) / totalReps;
                } else {
                    progressRatio = (count + 0.75) / totalReps;
                }
                
                // Update progress display
                const progressPercentage = progressRatio * 100;
                const progressRing = document.getElementById('rep-progress-ring');
                const repCount = document.getElementById('rep-count');
                if (progressRing && repCount) {
                    progressRing.style.background = `conic-gradient(var(--secondary-color) 0% ${progressPercentage}%, transparent ${progressPercentage}% 100%)`;
                    repCount.textContent = `${currentRep}/${totalReps}`;
                }
                
                // Debug when phase starts
                if (phaseSeconds === 1) {
                    console.log(`Phase: ${isHolding ? 'HOLD' : 'RELAX'}, Rep: ${currentRep}/${totalReps}, Count: ${count}`);
                }
                
                // Handle phase transitions
                if (phaseSeconds >= phaseDuration) {
                    console.log(`Completed ${isHolding ? 'HOLD' : 'RELAX'} phase.`);
                    phaseSeconds = 0;
                    
                    // Increment count when completing a RELAX phase
                    if (!isHolding) {
                        count++;
                        console.log(`*** INCREMENTING COUNT to ${count} ***`);
                        
                        // IMPORTANT: Immediately check if we've hit the total and exit the phase
                        if (count >= totalReps) {
                            console.log(`*** REACHED TOTAL REPS (${count}/${totalReps}) - WILL STOP NEXT ITERATION ***`);
                        }
                    }
                    
                    // Toggle phase
                    isHolding = !isHolding;
                    
                    // Play sound and vibrate
                    playSound(isHolding);
                    vibrate(isHolding ? 200 : 100);
                    
                    // Set up the next phase
                    if (isHolding) {
                        phaseDuration = holdTime;
                        instruction.textContent = "Contract your pelvic floor muscles";
                    } else {
                        phaseDuration = relaxTime;
                        instruction.textContent = "Relax your muscles";
                    }
                }
            }, 1000);
        }
    }
    
    function promptLogSession() {
        progressPanel.style.display = 'block';
        window.scrollTo({ top: progressPanel.offsetTop, behavior: 'smooth' });
    }
    
    // Event Listeners
    // Exercise Buttons
    startBasicBtn.addEventListener('click', () => startExercise(5, 5, 10));
    startLongBtn.addEventListener('click', () => startExercise(10, 10, 10));
    startQuickBtn.addEventListener('click', () => startExercise(1, 1, 20));
    stopBtn.addEventListener('click', stopTimer);
    
    // Custom Exercise
    customizeBtn.addEventListener('click', () => {
        hideAllPanels();
        customizePanel.style.display = 'block';
    });
    
    startCustomBtn.addEventListener('click', () => {
        const holdTime = parseInt(customHoldInput.value) || 5;
        const relaxTime = parseInt(customRelaxInput.value) || 5;
        const reps = parseInt(customRepsInput.value) || 10;
        
        startExercise(holdTime, relaxTime, reps);
        customizePanel.style.display = 'none';
    });
    
    closeCustomizeBtn.addEventListener('click', () => {
        customizePanel.style.display = 'none';
    });
    
    // Section Buttons
    exercisesBtn.addEventListener('click', () => {
        hideAllPanels();
        exercisesPanel.style.display = 'block';
    });
    
    progressBtn.addEventListener('click', () => {
        hideAllPanels();
        progressPanel.style.display = 'block';
    });
    
    aboutBtn.addEventListener('click', () => {
        hideAllPanels();
        aboutPanel.style.display = 'block';
    });
    
    benefitsBtn.addEventListener('click', () => {
        hideAllPanels();
        benefitsPanel.style.display = 'block';
    });
    
    faqBtn.addEventListener('click', () => {
        hideAllPanels();
        faqPanel.style.display = 'block';
    });
    
    // Close Buttons
    closeExercisesBtn.addEventListener('click', () => {
        exercisesPanel.style.display = 'none';
    });
    
    closeProgressBtn.addEventListener('click', () => {
        progressPanel.style.display = 'none';
    });
    
    closeAboutBtn.addEventListener('click', () => {
        aboutPanel.style.display = 'none';
    });
    
    closeBenefitsBtn.addEventListener('click', () => {
        benefitsPanel.style.display = 'none';
    });
    
    closeFaqBtn.addEventListener('click', () => {
        faqPanel.style.display = 'none';
    });
    
    // Exercise buttons in exercises panel
    const exercisePanelButtons = exercisesPanel.querySelectorAll('[data-exercise]');
    exercisePanelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const exercise = button.getAttribute('data-exercise');
            exercisesPanel.style.display = 'none';
            
            if (exercise === 'basic') {
                startExercise(5, 5, 10);
            } else if (exercise === 'long') {
                startExercise(10, 10, 10);
            } else if (exercise === 'quick') {
                startExercise(1, 1, 20);
            }
        });
    });
    
    // Progress Tracking
    logSessionBtn.addEventListener('click', () => {
        todayCount++;
        todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
        localStorage.setItem('todayCount', todayCount);
        
        // Update streak
        const lastDate = localStorage.getItem('lastDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            streak++;
            streakDisplay.textContent = `Current streak: ${streak} days`;
            localStorage.setItem('streak', streak);
            localStorage.setItem('lastDate', today);
        }
        
        logSessionBtn.textContent = "Session Logged!";
        setTimeout(() => {
            logSessionBtn.textContent = "Log Completed Session";
        }, 2000);
    });
});