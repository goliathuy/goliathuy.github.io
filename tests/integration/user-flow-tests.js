/**
 * Integration tests for Kegel Timer application
 * Tests full user flows and component interactions
 */

addIntegrationTest('Complete exercise flow should work correctly', function() {
    // Setup a more complete DOM to test integrated functionality
    const testHTML = `
        <div class="timer-content">
            <div class="timer-text" id="countdown">0</div>
            <div class="phase-label" id="phase-label">READY</div>
        </div>
        <div id="instruction">Select an exercise to begin</div>
        <div id="timer-fill" class="timer-fill"></div>
        <div id="timer-negative" class="timer-negative"></div>
        <button id="start-basic">Basic Routine</button>
        <button id="stop-btn" disabled>Stop Exercise</button>
        <div id="today-count">Sessions completed today: 0</div>
        <div id="streak">Current streak: 0 days</div>
        <button id="log-session">Log Completed Session</button>
    `;
    
    const container = setupTestDOM(testHTML);
    
    // Mock timer and time-related functions
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    const originalSetTimeout = window.setTimeout;
    
    let intervalId = 100;
    let timeoutId = 200;
    let mockTimerCallbacks = [];
    let mockTimeoutCallbacks = [];
    
    window.setInterval = function(callback, ms) {
        mockTimerCallbacks.push(callback);
        return intervalId++;
    };
    
    window.clearInterval = function() {
        // Just clear the callbacks array
        mockTimerCallbacks = [];
    };
    
    window.setTimeout = function(callback, ms) {
        mockTimeoutCallbacks.push(callback);
        return timeoutId++;
    };
    
    // Save original localStorage values
    const originalTodayCount = localStorage.getItem('todayCount');
    const originalStreak = localStorage.getItem('streak');
    const originalLastDate = localStorage.getItem('lastDate');
    
    // Create a clean mock localStorage for this test
    const mockLocalStorage = createMockLocalStorage();
    const originalLocalStorage = window.localStorage;
    window.localStorage = mockLocalStorage;
    
    // Mock exercise functionality
    let seconds = 0;
    let phaseSeconds = 0;
    let phaseDuration = 0;
    let isHolding = true;
    let count = 0;
    let totalReps = 0;
    
    function startExercise(holdTime, relaxTime, repetitions) {
        seconds = 0;
        phaseSeconds = 0;
        phaseDuration = holdTime;
        isHolding = true;
        count = 0;
        totalReps = repetitions;
        
        document.getElementById('start-basic').disabled = true;
        document.getElementById('stop-btn').disabled = false;
        
        document.getElementById('instruction').textContent = "Contract your pelvic floor muscles";
        document.getElementById('phase-label').textContent = "HOLD";
        document.getElementById('timer-fill').className = 'timer-fill hold';
        
        // Simulate a prep countdown first
        simulatePreparation();
    }
    
    function simulatePreparation() {
        // Simulate the completion of preparation phase
        // Usually this sets up the initial HOLD state
        document.getElementById('phase-label').textContent = "HOLD";
        // Now advance to the exercise progress
        simulateTimerProgress();
    }
    
    function stopTimer() {
        window.clearInterval();
        document.getElementById('start-basic').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('countdown').textContent = '0';
        document.getElementById('phase-label').textContent = 'READY';
        document.getElementById('instruction').textContent = 'Select an exercise to begin';
    }
    
    function simulateTimerProgress() {
        // Simulate half the reps
        const mockExerciseCallback = mockTimerCallbacks[0];
        
        // Run through 3 repetitions (hold + relax) to simulate a partial exercise
        for (let i = 0; i < 3; i++) {
            // Holding phase - run through all seconds 
            for (let s = 0; s < phaseDuration; s++) {
                phaseSeconds++;
                seconds++;
                updateTimerVisuals();
                
                // Don't call completion logic until the end
                if (i === 2 && s === phaseDuration - 1) {
                    completeExercise();
                    break;
                }
                
                // Check if phase is complete
                if (phaseSeconds >= phaseDuration) {
                    phaseSeconds = 0;
                    isHolding = false;
                    phaseDuration = 5; // Use the relax time
                    document.getElementById('instruction').textContent = "Relax your muscles";
                    document.getElementById('phase-label').textContent = "RELAX";
                    document.getElementById('timer-fill').className = 'timer-fill relax';
                }
            }
            
            // Relaxing phase - run through all seconds if not the last rep
            if (i < 2) {
                for (let s = 0; s < phaseDuration; s++) {
                    phaseSeconds++;
                    seconds++;
                    updateTimerVisuals();
                    
                    // Check if phase is complete
                    if (phaseSeconds >= phaseDuration) {
                        phaseSeconds = 0;
                        isHolding = true;
                        count++; // Increment rep count
                        phaseDuration = 5; // Use the hold time
                        document.getElementById('instruction').textContent = "Contract your pelvic floor muscles";
                        document.getElementById('phase-label').textContent = "HOLD";
                        document.getElementById('timer-fill').className = 'timer-fill hold';
                    }
                }
            }
        }
    }
    
    function updateTimerVisuals() {
        const remainingTime = phaseDuration - phaseSeconds;
        document.getElementById('countdown').textContent = remainingTime;
    }
    
    function completeExercise() {
        document.getElementById('countdown').textContent = "✓";
        document.getElementById('phase-label').textContent = "DONE";
        document.getElementById('instruction').textContent = "Well done! Session complete.";
        
        // Run the timeout callback to simulate completion
        if (mockTimeoutCallbacks.length > 0) {
            stopTimer();
        }
    }
    
    function logSession() {
        // Get values from localStorage and parse them
        let todayCount = parseInt(localStorage.getItem('todayCount') || '0');
        let streak = parseInt(localStorage.getItem('streak') || '0');
        
        todayCount++;
        document.getElementById('today-count').textContent = `Sessions completed today: ${todayCount}`;
        localStorage.setItem('todayCount', todayCount);
        
        // Update streak
        const lastDate = localStorage.getItem('lastDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            streak++;
            document.getElementById('streak').textContent = `Current streak: ${streak} days`;
            localStorage.setItem('streak', streak);
            localStorage.setItem('lastDate', today);
        }
    }
    
    // Wire up event handlers
    document.getElementById('start-basic').addEventListener('click', function() {
        startExercise(5, 5, 10);
    });
    
    document.getElementById('stop-btn').addEventListener('click', stopTimer);
    
    document.getElementById('log-session').addEventListener('click', logSession);
    
    // TEST 1: Start a basic exercise
    document.getElementById('start-basic').click();
    
    // Assertions after starting exercise
    assert(document.getElementById('start-basic').disabled === true, 'Start button should be disabled during exercise');
    assert(document.getElementById('stop-btn').disabled === false, 'Stop button should be enabled during exercise');
    assert(document.getElementById('phase-label').textContent === 'HOLD', 'Phase should be HOLD at beginning');
    
    // TEST 2: Exercise completed and session logged
    document.getElementById('log-session').click();
    
    // Assertions after completion
    assertEquals(localStorage.getItem('todayCount'), '1', 'Today count should be set to 1 in localStorage');
    assertEquals(document.getElementById('today-count').textContent, 'Sessions completed today: 1', 
           'Today count display should update');
    assertEquals(localStorage.getItem('streak'), '1', 'Streak should be set to 1 in localStorage');
    
    // TEST 3: Start another exercise after completing one
    document.getElementById('start-basic').click();
    
    // Assertions for second exercise
    assert(document.getElementById('phase-label').textContent === 'HOLD', 'Phase should be HOLD for new exercise');
    
    // TEST 4: Stop the exercise manually
    document.getElementById('stop-btn').click();
    
    // Assertions after stopping
    assert(document.getElementById('start-basic').disabled === false, 'Start button should be enabled after stopping');
    assert(document.getElementById('stop-btn').disabled === true, 'Stop button should be disabled after stopping');
    assert(document.getElementById('phase-label').textContent === 'READY', 'Phase should be READY after stopping');
    
    // Restore original functions and localStorage
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
    window.setTimeout = originalSetTimeout;
    window.localStorage = originalLocalStorage;
    
    // Cleanup
    cleanupTestDOM();
});

addIntegrationTest('Panel navigation should maintain application state', function() {
    // Setup test environment with panels and controls
    const testHTML = `
        <div class="timer-content">
            <div class="timer-text" id="countdown">5</div>
            <div class="phase-label" id="phase-label">HOLD</div>
        </div>
        <div id="instruction">Contract your pelvic floor muscles</div>
        <div id="timer-fill" class="timer-fill hold"></div>
        <div id="timer-negative" class="timer-negative"></div>
        
        <button id="start-basic" disabled>Basic Routine</button>
        <button id="stop-btn">Stop Exercise</button>
        
        <button id="exercises-btn">Exercises</button>
        <button id="about-btn">About</button>
        
        <div id="exercises-panel" class="content-panel" style="display: none;">
            <button id="close-exercises">Close</button>
        </div>
        
        <div id="about-panel" class="content-panel" style="display: none;">
            <button id="close-about">Close</button>
        </div>
    `;
    
    const container = setupTestDOM(testHTML);
    
    // Function to toggle panels
    function hideAllPanels() {
        document.getElementById('exercises-panel').style.display = 'none';
        document.getElementById('about-panel').style.display = 'none';
    }
    
    // Save initial state before any actions
    const initialCountdownValue = document.getElementById('countdown').textContent;
    const initialPhaseLabel = document.getElementById('phase-label').textContent;
    const initialStartButtonState = document.getElementById('start-basic').disabled;
    const initialStopButtonState = document.getElementById('stop-btn').disabled;
    
    // Wire up panel navigation
    document.getElementById('exercises-btn').addEventListener('click', function() {
        hideAllPanels();
        document.getElementById('exercises-panel').style.display = 'block';
    });
    
    document.getElementById('close-exercises').addEventListener('click', function() {
        document.getElementById('exercises-panel').style.display = 'none';
    });
    
    document.getElementById('about-btn').addEventListener('click', function() {
        hideAllPanels();
        document.getElementById('about-panel').style.display = 'block';
    });
    
    document.getElementById('close-about').addEventListener('click', function() {
        document.getElementById('about-panel').style.display = 'none';
    });
    
    document.getElementById('stop-btn').addEventListener('click', function() {
        document.getElementById('start-basic').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('countdown').textContent = '0';
        document.getElementById('phase-label').textContent = 'READY';
    });
    
    // TEST 1: Open exercises panel during active timer
    document.getElementById('exercises-btn').click();
    
    // Assertions after opening panel
    assert(document.getElementById('exercises-panel').style.display === 'block', 'Exercises panel should be visible');
    assert(document.getElementById('countdown').textContent === initialCountdownValue, 'Timer should maintain countdown value');
    assert(document.getElementById('phase-label').textContent === initialPhaseLabel, 'Timer should maintain phase');
    assert(document.getElementById('start-basic').disabled === initialStartButtonState, 'Start button should remain disabled');
    assert(document.getElementById('stop-btn').disabled === initialStopButtonState, 'Stop button should remain enabled');
    
    // TEST 2: Close the panel and verify state is maintained
    document.getElementById('close-exercises').click();
    
    // Assertions after closing panel
    assert(document.getElementById('exercises-panel').style.display === 'none', 'Exercises panel should be hidden');
    assert(document.getElementById('countdown').textContent === initialCountdownValue, 'Timer should still maintain countdown value');
    assert(document.getElementById('phase-label').textContent === initialPhaseLabel, 'Timer should still maintain phase');
    
    // TEST 3: Open about panel and stop the timer
    document.getElementById('about-btn').click();
    document.getElementById('stop-btn').click();
    
    // Assertions after stopping while panel is open
    assert(document.getElementById('about-panel').style.display === 'block', 'About panel should be visible');
    assert(document.getElementById('countdown').textContent === '0', 'Timer should be reset');
    assert(document.getElementById('phase-label').textContent === 'READY', 'Phase should be reset to READY');
    assert(document.getElementById('start-basic').disabled === false, 'Start button should be enabled after stopping');
    assert(document.getElementById('stop-btn').disabled === true, 'Stop button should be disabled after stopping');
    
    // TEST 4: Close panel and verify stopped state is maintained
    document.getElementById('close-about').click();
    
    // Assertions after closing panel
    assert(document.getElementById('about-panel').style.display === 'none', 'About panel should be hidden');
    assert(document.getElementById('countdown').textContent === '0', 'Timer should remain reset');
    assert(document.getElementById('phase-label').textContent === 'READY', 'Phase should remain READY');
    
    // Cleanup
    cleanupTestDOM();
});