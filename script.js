console.log('[script.js] included');

document.addEventListener('DOMContentLoaded', function () {
console.log('[script.js] loaded');
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

    // Ensure default localStorage keys exist (set-if-missing) so tests and app have deterministic keys
    try {
        const __initialState = { todayCount: '0', streak: '0' };
        Object.keys(__initialState).forEach(k => {
            if (!localStorage.getItem(k)) localStorage.setItem(k, __initialState[k]);
        });
    } catch (e) {
        console.error('Error initializing localStorage defaults:', e);
    }

    // Load saved data
    try {
        const savedTodayCount = localStorage.getItem('todayCount');
        if (savedTodayCount && !isNaN(parseInt(savedTodayCount))) {
            todayCount = parseInt(savedTodayCount);
            if (todayCountDisplay) {
                todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
            }
        }
    } catch (error) {
        console.error('Error loading todayCount from localStorage:', error);
    }

    try {
        const savedStreak = localStorage.getItem('streak');
        if (savedStreak && !isNaN(parseInt(savedStreak))) {
            streak = parseInt(savedStreak);
            if (streakDisplay) {
                streakDisplay.textContent = `Current streak: ${streak} days`;
            }
        }
    } catch (error) {
        console.error('Error loading streak from localStorage:', error);
    }

    // Timer Variables
    let timer;
    let seconds = 0;
    let phaseSeconds = 0;
    let phaseDuration = 0;
    let isHolding = true;
    let count = 0;
    let totalReps = 0;

    // Audio Context
    let audioContext;

    function initializeAudioContext() {
        console.log('[script.js] initializeAudioContext called');
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create and play a short oscillator per phase. OscillatorNodes may only be started once,
    // so create one each time instead of reusing a persistent node.
    function playPhaseSound(isHold) {
        try {
            if (!soundToggle || !soundToggle.checked || !audioContext) return;
            // Resume context if suspended (Chrome/Edge/Firefox user gesture requirement)
            if (audioContext.state === 'suspended') audioContext.resume();
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const freq = isHold ? 880 : 440;
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);
            osc.start();
            setTimeout(() => {
                try { osc.stop(); osc.disconnect(); gainNode.disconnect(); } catch (e) { /* noop */ }
            }, 200);
        } catch (err) {
            console.error('playPhaseSound error:', err);
        }
    }

    function triggerVibration(duration) {
        console.log('[script.js] triggerVibration called', { duration });
        if (vibrationToggle.checked && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    // Helper Functions
    function hideAllAppPanels() {
        console.log('Hiding all panels');
        console.log('[script.js] hideAllAppPanels called');
        customizePanel.style.display = 'none';
        exercisesPanel.style.display = 'none';
        progressPanel.style.display = 'none';
        aboutPanel.style.display = 'none';
        benefitsPanel.style.display = 'none';
        faqPanel.style.display = 'none';
    }

    // Cache timer DOM elements for performance
    const timerElements = {
        countdown,
        phaseLabel,
        timerFill,
        timerNegative
    };

    function updateTimerDisplay() {
        console.log('[script.js] updateTimerDisplay called');
        // Use cached DOM references
        const remainingTime = phaseDuration - phaseSeconds;
        const percentage = (phaseSeconds / phaseDuration) * 100;
        if (timerElements.countdown) timerElements.countdown.textContent = remainingTime;
        if (timerElements.phaseLabel) timerElements.phaseLabel.textContent = isHolding ? "HOLD" : "RELAX";
        if (timerElements.timerFill) {
            timerElements.timerFill.className = isHolding ? 'timer-fill hold' : 'timer-fill relax';
            timerElements.timerFill.style.transform = `scaleY(${1 - (percentage / 100)})`;
        }
        if (timerElements.timerNegative) {
            timerElements.timerNegative.style.transform = `scaleY(${percentage / 100})`;
        }
        // Add blinking effect for last 3 seconds
        if (remainingTime <= 3) {
            timerElements.timerFill && timerElements.timerFill.classList.add('blinking');
            timerElements.timerNegative && timerElements.timerNegative.classList.add('blinking');
        } else {
            timerElements.timerFill && timerElements.timerFill.classList.remove('blinking');
            timerElements.timerNegative && timerElements.timerNegative.classList.remove('blinking');
        }
    }

    function resetTimerUI() {
        console.log('[script.js] resetTimerUI called');
        timerFill.style.transform = 'scaleY(1)';
        timerNegative.style.transform = 'scaleY(0)';
        timerFill.className = 'timer-fill';
        timerNegative.className = 'timer-negative';
        countdown.textContent = '0';
        phaseLabel.textContent = 'READY';
        instruction.textContent = 'Select an exercise to begin';
    }

    function stopExerciseTimer() {
        console.log('[script.js] stopExerciseTimer called');
        if (timer) {
            clearInterval(timer);
            startBasicBtn.disabled = false;
            startLongBtn.disabled = false;
            startQuickBtn.disabled = false;
            customizeBtn.disabled = false;
            stopBtn.disabled = true;
            resetTimerUI();
            timer = null; // Prevent double-clearing
        }
    }

    function startKegelExercise(holdTime, relaxTime, repetitions) {
        console.log('Starting exercise');
        console.log('[script.js] startKegelExercise called', { holdTime, relaxTime, repetitions });        
        stopExerciseTimer();

        // Initialize audio on first user interaction
        if (!audioContext) {
            initializeAudioContext();
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
                playPhaseSound(true);
                triggerVibration(100);
            } else {
                clearInterval(prepTimer);
                phaseLabel.classList.remove('preparation');
                runExerciseRoutine();
            }
        }, 1000);

        function runExerciseRoutine() {
            seconds = 0;
            phaseSeconds = 0;
            phaseDuration = holdTime;
            isHolding = true;
            count = 0;
            totalReps = repetitions;

            startBasicBtn.disabled = true;
            startLongBtn.disabled = true;
            startQuickBtn.disabled = true;
            customizeBtn.disabled = true;
            stopBtn.disabled = false;

            instruction.textContent = "Contract your pelvic floor muscles";
            updateTimerDisplay();

            // Add progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'progress-indicator';
            instruction.parentNode.insertBefore(progressIndicator, instruction.nextSibling);

            timer = setInterval(() => {
                phaseSeconds++;
                seconds++;
                updateTimerDisplay();

                // Update progress indicator
                progressIndicator.textContent = `Rep ${count + 1}/${totalReps}`;

                if (phaseSeconds >= phaseDuration) {
                    phaseSeconds = 0;
                    isHolding = !isHolding;

                    // Play sound and vibrate on phase change
                    playPhaseSound(isHolding);
                    triggerVibration(isHolding ? 200 : 100);

                    if (isHolding) {
                        count++;
                        phaseDuration = holdTime;
                        instruction.textContent = "Contract your pelvic floor muscles";

                        if (count >= totalReps) {
                            clearInterval(timer);
                            instruction.textContent = "Well done! Session complete.";
                            countdown.textContent = "✓";
                            phaseLabel.textContent = "DONE";
                            progressIndicator.remove();
                            playPhaseSound(true);
                            triggerVibration(300);
                            setTimeout(() => {
                                stopExerciseTimer();
                                showLogSessionPrompt();
                            }, 1500);
                        }
                    } else {
                        phaseDuration = relaxTime;
                        instruction.textContent = "Relax your muscles";
                    }
                }
            }, 1000);
        }
    }

    function showLogSessionPrompt() {
        console.log('[script.js] showLogSessionPrompt called');
        progressPanel.style.display = 'block';
        window.scrollTo({ top: progressPanel.offsetTop, behavior: 'smooth' });
    }

    // Event Listeners
    // Exercise Buttons - use event delegation for performance
    document.addEventListener('click', (e) => {
        if (e.target.matches('.exercise-button')) {
            if (e.target.id === 'start-basic') startKegelExercise(5, 5, 10);
            else if (e.target.id === 'start-long') startKegelExercise(10, 10, 10);
            else if (e.target.id === 'start-quick') startKegelExercise(1, 1, 20);
            else if (e.target.id === 'customize-btn') {
                hideAllAppPanels();
                customizePanel.style.display = 'block';
            }
        }
        if (e.target.matches('#stop-btn')) stopExerciseTimer();
    });

    // Custom Exercise
    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            hideAllAppPanels();
            customizePanel.style.display = 'block';
        });
    }

    if (startCustomBtn) {
        startCustomBtn.addEventListener('click', () => {
            const holdTime = parseInt(customHoldInput.value) || 5;
            const relaxTime = parseInt(customRelaxInput.value) || 5;
            const reps = parseInt(customRepsInput.value) || 10;

            startKegelExercise(holdTime, relaxTime, reps);
            customizePanel.style.display = 'none';
        });
    }

    if (closeCustomizeBtn) {
        closeCustomizeBtn.addEventListener('click', () => {
            customizePanel.style.display = 'none';
        });
    }

    // Section Buttons
    if (exercisesBtn) {
        exercisesBtn.addEventListener('click', () => {
            hideAllAppPanels();
            exercisesPanel.style.display = 'block';
        });
    }

    if (progressBtn) {
        progressBtn.addEventListener('click', () => {
            hideAllAppPanels();
            progressPanel.style.display = 'block';
        });
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            hideAllAppPanels();
            aboutPanel.style.display = 'block';
        });
    }

    if (benefitsBtn) {
        benefitsBtn.addEventListener('click', () => {
            hideAllAppPanels();
            benefitsPanel.style.display = 'block';
        });
    }

    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            hideAllAppPanels();
            faqPanel.style.display = 'block';
        });
    }

    // Close Buttons
    if (closeExercisesBtn) {
        closeExercisesBtn.addEventListener('click', () => {
            exercisesPanel.style.display = 'none';
        });
    }

    if (closeProgressBtn) {
        closeProgressBtn.addEventListener('click', () => {
            progressPanel.style.display = 'none';
        });
    }

    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            aboutPanel.style.display = 'none';
        });
    }

    if (closeBenefitsBtn) {
        closeBenefitsBtn.addEventListener('click', () => {
            benefitsPanel.style.display = 'none';
        });
    }

    if (closeFaqBtn) {
        closeFaqBtn.addEventListener('click', () => {
            faqPanel.style.display = 'none';
        });
    }

    // Exercise buttons in exercises panel
    if (exercisesPanel) {
        const exercisePanelButtons = exercisesPanel.querySelectorAll('[data-exercise]');

        // --- Online/Offline Detection ---
        // Add a status element if not present
        let statusBar = document.getElementById('status-bar');
        if (!statusBar) {
            //TODO: consider the definition of the status bar -at least
            //      the style- that should be variable and defined by a template
            statusBar = document.createElement('div');
            statusBar.id = 'status-bar';
            statusBar.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:999;background:#ffeaa7;color:#856404;text-align:center;padding:4px;font-size:14px;display:none;';
            document.body.appendChild(statusBar);
        }
        function displayStatusMessage(msg, duration = 3000) {
            statusBar.textContent = msg;
            statusBar.style.display = 'block';
            if (duration > 0) {
                setTimeout(() => { statusBar.style.display = 'none'; }, duration);
            }
        }
        window.addEventListener('online', () => {
            displayStatusMessage('Back online');
        });
        window.addEventListener('offline', () => {
            displayStatusMessage('Offline mode - limited functionality', 0);
        });
        // Show offline status on load if needed
        if (!navigator.onLine) {
            displayStatusMessage('Offline mode - limited functionality', 0);
        }
        exercisePanelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const exercise = button.getAttribute('data-exercise');
                exercisesPanel.style.display = 'none';

                if (exercise === 'basic') {
                    startKegelExercise(5, 5, 10);
                } else if (exercise === 'long') {
                    startKegelExercise(10, 10, 10);
                } else if (exercise === 'quick') {
                    startKegelExercise(1, 1, 20);
                }
            });
        });
    }

    // Progress Tracking
    if (logSessionBtn) {
        logSessionBtn.addEventListener('click', () => {
            // Update progress
            try {
                todayCount++;
                if (todayCountDisplay) {
                    todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
                }
                localStorage.setItem('todayCount', todayCount);

                const lastDate = localStorage.getItem('lastDate');
                const today = new Date().toDateString();

                if (lastDate !== today) {
                    streak++;
                    if (streakDisplay) {
                        streakDisplay.textContent = `Current streak: ${streak} days`;
                    }
                    localStorage.setItem('streak', streak);
                    localStorage.setItem('lastDate', today);
                }
            } catch (error) {
                console.error('Error updating progress in localStorage:', error);
            }

            logSessionBtn.textContent = "Session Logged!";
            setTimeout(() => {
                logSessionBtn.textContent = "Log Completed Session";
            }, 2000);
        });
    }

    // LocalStorage Debug Utility (moved from kegel-timer.html)
    (function () {
        console.log('[script.js] LocalStorage Debug Utility IIFE called');
        // Check if debug mode is enabled via URL parameter (?debug=true)
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';
        const debugPanel = document.getElementById('ls-debug-panel');
        const debugContent = document.getElementById('ls-debug-content');
        const toggleBtn = document.getElementById('ls-debug-toggle');
        const refreshBtn = document.getElementById('ls-debug-refresh');
        const clearBtn = document.getElementById('ls-debug-clear');
        // Show debug panel if debug mode is enabled
        if (debugMode && debugPanel) {
            debugPanel.style.display = 'block';
        }
        // Display current localStorage content
        function refreshLocalStorageDisplay() {
            if (!debugContent) return;
            debugContent.innerHTML = '';
            if (localStorage.length === 0) {
                debugContent.innerHTML = '<i>localStorage is empty</i>';
                return;
            }
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            // Add table header
            const header = document.createElement('tr');
            header.innerHTML = `
                <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">Key</th>
                <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">Value</th>
                <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">Type</th>
            `;
            table.appendChild(header);
            // Add rows for each localStorage item
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="border-bottom: 1px solid #eee; padding: 4px;">${key}</td>
                    <td style="border-bottom: 1px solid #eee; padding: 4px;">${value}</td>
                    <td style="border-bottom: 1px solid #eee; padding: 4px;">${typeof value}</td>
                `;
                table.appendChild(row);
            }
            debugContent.appendChild(table);
        }
        // Toggle debug panel visibility
        if (toggleBtn && debugPanel) {
            toggleBtn.addEventListener('click', function () {
                const isHidden = debugPanel.style.display === 'none';
                debugPanel.style.display = isHidden ? 'block' : 'none';
            });
        }
        // Refresh localStorage display
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshLocalStorageDisplay);
        }
        // Clear all localStorage items
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to clear all localStorage items?')) {
                    localStorage.clear();
                    refreshLocalStorageDisplay();
                    console.log('localStorage cleared');
                }
            });
        }
        // Automatically display localStorage content on page load
        document.addEventListener('DOMContentLoaded', function () {
            // Log to console
            console.group('Initial localStorage State');
            console.log('localStorage items:', localStorage.length);
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`${key}: '${localStorage.getItem(key)}' (${typeof localStorage.getItem(key)})`);
            }
            console.groupEnd();
            // Update panel
            if (debugMode) {
                refreshLocalStorageDisplay();
            }
        });
        // Expose debug functions globally
        window.lsDebug = {
            show: function () {
                if (debugPanel) debugPanel.style.display = 'block';
                refreshLocalStorageDisplay();
            },
            refresh: refreshLocalStorageDisplay,
            clear: function () {
                localStorage.clear();
                refreshLocalStorageDisplay();
                console.log('localStorage cleared');
            },
            getItem: function (key) {
                const value = localStorage.getItem(key);
                console.log(`localStorage.getItem('${key}') = '${value}' (${typeof value})`);
                return value;
            },
            setItem: function (key, value) {
                localStorage.setItem(key, value);
                console.log(`localStorage.setItem('${key}', '${value}')`);
                refreshLocalStorageDisplay();
            }
        };
    })();

});
// End of script.js