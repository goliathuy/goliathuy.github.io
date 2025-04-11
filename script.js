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
    const timerClickable = document.getElementById('timer-clickable');
    const controlExerciseBtn = document.getElementById('control-exercise-btn');
    
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
    
    // Global variables
    let timer = null;
    let seconds = 0;
    let phaseSeconds = 0;
    let isHolding = true;
    let count = 0;
    let totalReps = 0;
    let phaseDuration = 0;
    let audioContext = null;
    const SOUND_POOL_SIZE = 4; // Number of oscillators to keep in the pool
    const soundPool = {
        hold: [],
        relax: []
    };
    let isPaused = false;
    let currentExerciseParams = null; // Store current exercise parameters for pause/restart
    
    // Store the timer function globally so we can access it for pause/resume
    let exerciseTimerFunction = null;
    
    // Button text states
    const BUTTON_TEXT = {
        START: 'Start Exercise',
        STOP: 'Stop Exercise',
        RESTART: 'Start New Exercise'
    };
    
    // Timer Variables
    function initAudio() {
        if (audioContext) return;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Pre-create oscillators for the pool
        for (let i = 0; i < SOUND_POOL_SIZE; i++) {
            soundPool.hold.push(createOscillator(880)); // A5 note
            soundPool.relax.push(createOscillator(440)); // A4 note
        }
    }
    
    function createOscillator(frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        return { oscillator, gainNode };
    }
    
    function playSound(isHold) {
        if (!soundToggle.checked || !audioContext) return;
        
        const pool = isHold ? soundPool.hold : soundPool.relax;
        const sound = pool.shift(); // Get the first available sound
        
        if (sound) {
            // Play the sound
            sound.gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            sound.gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
            
            // Put the sound back in the pool after use
            setTimeout(() => {
                pool.push(sound);
            }, 200);
        }
    }
    
    // Clean up audio resources when the page is hidden or unloaded
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && audioContext) {
            audioContext.suspend();
        } else if (audioContext) {
            audioContext.resume();
        }
    });
    
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
        stopTimer();
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
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // Also clear prep timer if it exists
        if (prepTimer) {
            clearInterval(prepTimer);
            prepTimer = null;
        }
        
        // Reset running flag
        isExerciseRunning = false;
        
        startBasicBtn.disabled = false;
        startLongBtn.disabled = false;
        startQuickBtn.disabled = false;
        customizeBtn.disabled = false;
        updateControlButton('start');
        
        // Reset pause state
        isPaused = false;
        if (timerClickable) {
            timerClickable.classList.remove('paused');
        }
    }
    
    function togglePause() {
        if (!isExerciseRunning) return; // No exercise running
        
        isPaused = !isPaused;
        
        if (isPaused) {
            // Pause the timer
            instruction.textContent = "Paused - Click timer to resume";
            timerClickable.classList.add('paused');
        } else {
            // Resume the timer
            timerClickable.classList.remove('paused');
            if (prepTimer) {
                instruction.textContent = "Get ready... Click timer to pause";
            } else {
                instruction.textContent = isHolding ? "Contract your pelvic floor muscles" : "Relax your muscles";
            }
        }
    }
    
    // Add isExerciseRunning flag
    let isExerciseRunning = false;
    
    // Add prepTimer to global scope so we can clear it
    let prepTimer = null;
    
    function startExercise(holdTime, relaxTime, repetitions) {
        // Prevent starting if an exercise is already running
        if (isExerciseRunning) {
            console.log('Exercise already running, ignoring start request');
            return;
        }
        
        console.log('Starting exercise with holdTime:', holdTime, 'relaxTime:', relaxTime, 'repetitions:', repetitions);
        stopTimer();
        
        // Set running flag
        isExerciseRunning = true;
        
        // Store current parameters for restart
        currentExerciseParams = {
            holdTime: holdTime,
            relaxTime: relaxTime, 
            repetitions: repetitions
        };
        
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
        
        // Enable control button during countdown
        controlExerciseBtn.textContent = BUTTON_TEXT.STOP;
        
        // Add preparation countdown
        let prepTime = 3;
        instruction.textContent = "Get ready... Click timer to pause";
        phaseLabel.textContent = "PREP";
        phaseLabel.classList.add('preparation');
        countdown.textContent = prepTime;
        
        // Enable pause functionality during countdown
        timerClickable.classList.add('pause-on-click');
        
        prepTimer = setInterval(() => {
            if (!isPaused) {
                prepTime--;
                if (prepTime > 0) {
                    countdown.textContent = prepTime;
                    playSound(true);
                    vibrate(100);
                } else {
                    clearInterval(prepTimer);
                    prepTimer = null;
                    phaseLabel.classList.remove('preparation');
                    startMainExercise();
                }
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
            controlExerciseBtn.textContent = BUTTON_TEXT.STOP;
            
            instruction.textContent = "Contract your pelvic floor muscles";
            updateTimerVisuals();
            
            // Define the timer function and store it globally
            exerciseTimerFunction = function() {
                // Don't update if paused
                if (isPaused) return;
                
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
                    
                    // Convert Stop button to Restart
                    controlExerciseBtn.textContent = BUTTON_TEXT.RESTART;
                    controlExerciseBtn.classList.add('restart-button');
                    
                    // Provide feedback
                    playSound(true);
                    vibrate(300);
                    
                    // ALWAYS ensure progress ring is 100% filled when complete
                    const progressRing = document.getElementById('rep-progress-ring');
                    const repCount = document.getElementById('rep-count');
                    if (progressRing && repCount) {
                        progressRing.style.background = `conic-gradient(var(--secondary-color) 0% 100%, transparent 100% 100%)`;
                        repCount.textContent = `${totalReps}/${totalReps}`;
                        console.log("Set progress ring to 100%");
                    }
                    
                    // Log session after a brief delay
                    setTimeout(() => {
                        // Keep the stop button enabled but change its function to restart
                        controlExerciseBtn.disabled = false;
                        
                        // Re-enable other buttons
                        startBasicBtn.disabled = false;
                        startLongBtn.disabled = false;
                        startQuickBtn.disabled = false;
                        customizeBtn.disabled = false;
                        
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
                            
                            // Immediately fill the ring to 100% when we complete the last rep
                            const progressRing = document.getElementById('rep-progress-ring');
                            const repCount = document.getElementById('rep-count');
                            if (progressRing && repCount) {
                                progressRing.style.background = `conic-gradient(var(--secondary-color) 0% 100%, transparent 100% 100%)`;
                                repCount.textContent = `${totalReps}/${totalReps}`;
                            }
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
            };
            
            // Use the timer function
            timer = setInterval(exerciseTimerFunction, 1000);
        }
        
        // Update control button
        updateControlButton('stop');
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
    
    // Make control button work as both stop and start
    controlExerciseBtn.addEventListener('click', () => {
        const currentState = controlExerciseBtn.dataset.state || 'start';
        
        if (currentState === 'start') {
            startExercise(5, 5, 10);
        } else if (currentState === 'restart') {
            resetTimer();
            
            if (currentExerciseParams) {
                startExercise(
                    currentExerciseParams.holdTime,
                    currentExerciseParams.relaxTime,
                    currentExerciseParams.repetitions
                );
            } else {
                startExercise(5, 5, 10);
            }
        } else {
            stopTimer();
            resetTimer();
        }
    });

    // Add click event for timer to pause/resume
    if (timerClickable) {
        timerClickable.addEventListener('click', function() {
            togglePause();
        });
    }

    function updateControlButton(state) {
        controlExerciseBtn.dataset.state = state;
        controlExerciseBtn.textContent = BUTTON_TEXT[state.toUpperCase()];
    }

    // Set initial button state
    updateControlButton('start');

    // Layout change event listener
    window.addEventListener('layoutChanged', function(e) {
        // Handle layout-specific adjustments when layout changes
        const layout = e.detail.layout;
        console.log(`Layout changed to: ${layout}`);
        
        if (layout === 'layout2a') {
            // Adjust for Card Layout (layout2a)
            handleCardLayoutSpecifics();
        } else {
            // Adjust for Default Layout
            handleDefaultLayoutSpecifics();
        }
    });
    
    // Handle different layout specifics
    function handleCardLayoutSpecifics() {
        // Find elements that may have been created by the layout manager
        const settingsDrawer = document.getElementById('settings-drawer');
        const bottomNav = document.getElementById('bottom-nav');
        
        // Add event listeners for bottom nav
        if (bottomNav) {
            const navItems = bottomNav.querySelectorAll('.nav-item');
            navItems.forEach((item, index) => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all items
                    navItems.forEach(navItem => navItem.classList.remove('active'));
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Handle navigation
                    const text = this.querySelector('span:last-child').textContent.toLowerCase();
                    
                    if (text === 'exercises') {
                        hideAllPanels();
                        exercisesPanel.style.display = 'block';
                    } else if (text === 'progress') {
                        hideAllPanels();
                        progressPanel.style.display = 'block';
                    } else if (text === 'help') {
                        hideAllPanels();
                        aboutPanel.style.display = 'block';
                    } else if (text === 'settings') {
                        // Toggle settings drawer
                        if (settingsDrawer) {
                            settingsDrawer.classList.toggle('visible');
                        }
                    }
                });
            });
        }
        
        // Handle settings drawer toggle
        if (settingsDrawer) {
            // Set up sound and vibration toggle sync
            const soundToggleDrawer = settingsDrawer.querySelector('input[type="checkbox"]');
            const vibToggleDrawer = settingsDrawer.querySelectorAll('input[type="checkbox"]')[1];
            
            if (soundToggleDrawer && soundToggle) {
                // Sync with main toggle
                soundToggleDrawer.checked = soundToggle.checked;
                
                // Add event listener
                soundToggleDrawer.addEventListener('change', function() {
                    soundToggle.checked = this.checked;
                });
            }
            
            if (vibToggleDrawer && vibrationToggle) {
                // Sync with main toggle
                vibToggleDrawer.checked = vibrationToggle.checked;
                
                // Add event listener
                vibToggleDrawer.addEventListener('change', function() {
                    vibrationToggle.checked = this.checked;
                });
            }
            
            // Add click outside to close
            document.addEventListener('click', function(e) {
                if (settingsDrawer.classList.contains('visible')) {
                    // Check if click is outside the drawer
                    if (!settingsDrawer.contains(e.target) && 
                        !e.target.closest('.nav-item')) {
                        settingsDrawer.classList.remove('visible');
                    }
                }
            });
        }
    }
    
    function handleDefaultLayoutSpecifics() {
        // Any specific adjustments for the default layout can go here
    }
});