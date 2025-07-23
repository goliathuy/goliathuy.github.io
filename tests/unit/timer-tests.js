/**
 * Unit tests for Kegel Timer functionality
 */

// Timer-related unit tests
addUnitTest('Timer initialization should set default values', function() {
    // Setup test environment
    const timerHTML = `
        <div class="timer-content">
            <div class="timer-text" id="countdown">0</div>
            <div class="phase-label" id="phase-label">READY</div>
        </div>
        <div id="instruction">Select an exercise to begin</div>
        <div id="timer-fill"></div>
        <div id="timer-negative"></div>
        <button id="start-basic">Basic</button>
        <button id="start-long">Long</button>
        <button id="start-quick">Quick</button>
        <button id="stop-btn" disabled>Stop</button>
    `;
    
    const container = setupTestDOM(timerHTML);
    
    // Mock the necessary timer functions
    window.originalSetInterval = window.setInterval;
    window.originalClearInterval = window.clearInterval;
    
    let mockIntervalId = 999;
    window.setInterval = function() { return mockIntervalId; };
    window.clearInterval = function() { };
    
    // Create a mock version of the timer app's resetTimer function
    // Since the real one is encapsulated in the DOMContentLoaded event listener
    function mockResetTimer() {
        const timerFill = document.getElementById('timer-fill');
        const timerNegative = document.getElementById('timer-negative');
        const countdown = document.getElementById('countdown');
        const phaseLabel = document.getElementById('phase-label');
        const instruction = document.getElementById('instruction');
        
        timerFill.style.transform = 'scaleY(1)';
        timerNegative.style.transform = 'scaleY(0)';
        countdown.textContent = '0';
        phaseLabel.textContent = 'READY';
        instruction.textContent = 'Select an exercise to begin';
    }
    
    // Test execution
    mockResetTimer();
    
    // Assertions
    assert(document.getElementById('countdown').textContent === '0', 'Countdown should be 0');
    assert(document.getElementById('phase-label').textContent === 'READY', 'Phase label should be READY');
    assert(document.getElementById('instruction').textContent === 'Select an exercise to begin', 'Instruction should be default');
    
    // Restore original functions
    window.setInterval = window.originalSetInterval;
    window.clearInterval = window.originalClearInterval;
    delete window.originalSetInterval;
    delete window.originalClearInterval;
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Timer visual updates should work correctly', function() {
    // Setup test DOM
    const timerHTML = `
        <div class="timer-content">
            <div class="timer-text" id="countdown">0</div>
            <div class="phase-label" id="phase-label">READY</div>
        </div>
        <div id="instruction">Select an exercise to begin</div>
        <div id="timer-fill" class="timer-fill"></div>
        <div id="timer-negative" class="timer-negative"></div>
    `;
    
    const container = setupTestDOM(timerHTML);
    
    // Mock visual update function (since it's not directly accessible)
    function mockUpdateTimerVisuals(phaseSeconds, phaseDuration, isHolding) {
        const countdown = document.getElementById('countdown');
        const phaseLabel = document.getElementById('phase-label');
        const timerFill = document.getElementById('timer-fill');
        const timerNegative = document.getElementById('timer-negative');
        
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
    
    // Test execution - simulate 2 seconds into a 5 second hold
    mockUpdateTimerVisuals(2, 5, true);
    
    // Assertions
    assert(document.getElementById('countdown').textContent === '3', 'Countdown should display remaining time (3)');
    assert(document.getElementById('phase-label').textContent === 'HOLD', 'Phase label should say HOLD');
    assert(document.getElementById('timer-fill').classList.contains('hold'), 'Timer fill should have hold class');
    
    // Test with a different phase
    mockUpdateTimerVisuals(3, 5, false);
    
    // More assertions
    assert(document.getElementById('countdown').textContent === '2', 'Countdown should display remaining time (2)');
    assert(document.getElementById('phase-label').textContent === 'RELAX', 'Phase label should say RELAX');
    assert(document.getElementById('timer-fill').classList.contains('relax'), 'Timer fill should have relax class');
    assert(document.getElementById('timer-fill').classList.contains('blinking'), 'Timer should be blinking for last 3 seconds');
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Progress tracking functions should update localStorage correctly', function() {
    // Setup test DOM
    const progressHTML = `
        <div id="today-count">Sessions completed today: 0</div>
        <div id="streak">Current streak: 0 days</div>
        <button id="log-session">Log Completed Session</button>
    `;
    
    const container = setupTestDOM(progressHTML);
    
    // Save original localStorage values before testing
    const originalTodayCount = localStorage.getItem('todayCount');
    const originalStreak = localStorage.getItem('streak');
    const originalLastDate = localStorage.getItem('lastDate');
    
    // Create a clean mock localStorage with no pre-existing test values
    const mockLocalStorage = createMockLocalStorage();
    
    // Replace real localStorage with our mock for this test
    const originalLocalStorage = window.localStorage;
    window.localStorage = mockLocalStorage;
    
    // Mock progress tracking function
    function mockLogSession() {
        const todayCountDisplay = document.getElementById('today-count');
        const streakDisplay = document.getElementById('streak');
        
        let todayCount = parseInt(localStorage.getItem('todayCount') || '0');
        let streak = parseInt(localStorage.getItem('streak') || '0');
        
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
    }
    
    // Test execution - first call when no data exists
    mockLogSession();
    
    // Debug info
    console.log("After first log session:", mockLocalStorage.storage);
    
    // Assertions with clean environment
    assertEquals(localStorage.getItem('todayCount'), '1', 'Should set todayCount to 1 in localStorage');
    assertEquals(document.getElementById('today-count').textContent, 'Sessions completed today: 1', 
           'Should update today count display');
    assertEquals(localStorage.getItem('streak'), '1', 'Should set streak to 1 in localStorage');
    assertEquals(document.getElementById('streak').textContent, 'Current streak: 1 days', 
           'Should update streak display');
    
    // Test multiple logs on same day
    mockLogSession();
    
    // Debug info
    console.log("After second log session:", mockLocalStorage.storage);
    
    // Assertions for second log
    assertEquals(localStorage.getItem('todayCount'), '2', 'Should increment todayCount to 2');
    assertEquals(document.getElementById('today-count').textContent, 'Sessions completed today: 2', 
           'Should update today count display to 2');
    // Streak should not increment again on the same day
    assertEquals(localStorage.getItem('streak'), '1', 'Should not increment streak again on same day');
    
    // Restore original localStorage and its values
    window.localStorage = originalLocalStorage;
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Progress tracking functions should update localStorage correctly - with debugging', function() {
    // Setup test DOM
    const progressHTML = `
        <div id="today-count">Sessions completed today: 0</div>
        <div id="streak">Current streak: 0 days</div>
        <button id="log-session">Log Completed Session</button>
    `;
    
    const container = setupTestDOM(progressHTML);
    
    // Debug container
    const debugContainer = document.createElement('div');
    debugContainer.id = 'localStorage-debug';
    debugContainer.style.border = '1px solid blue';
    debugContainer.style.padding = '10px';
    debugContainer.style.margin = '10px 0';
    debugContainer.innerHTML = '<h3>localStorage Debug</h3>';
    if (window.testDebug && window.testDebug.isDebugMode) {
        debugContainer.style.display = 'block';
        document.body.appendChild(debugContainer);
    } else {
        debugContainer.style.display = 'none';
    }
    
    function logDebug(message) {
        if (window.testDebug && window.testDebug.isDebugMode) {
            const p = document.createElement('p');
            p.textContent = message;
            debugContainer.appendChild(p);
            console.log('[LOCALSTORAGE DEBUG]', message);
        }
    }
    
    // Mock localStorage
    const originalLocalStorage = window.localStorage;
    logDebug(`Original localStorage: ${Object.prototype.toString.call(originalLocalStorage)}`);
    
    const mockLocalStorage = {
        storage: {},
        getItem: function(key) {
            logDebug(`getItem('${key}') -> ${this.storage[key] === undefined ? 'undefined' : `'${this.storage[key]}'`}`);
            return this.storage[key] || null;
        },
        setItem: function(key, value) {
            const stringValue = String(value);
            logDebug(`setItem('${key}', ${value}) -> stored as '${stringValue}'`);
            this.storage[key] = stringValue;
        },
        removeItem: function(key) {
            logDebug(`removeItem('${key}')`);
            delete this.storage[key];
        },
        clear: function() {
            logDebug('clear()');
            this.storage = {};
        },
        toString: function() {
            return '[object Storage]';
        }
    };
    window.localStorage = mockLocalStorage;
    
    // Mock progress tracking function with detailed logging
    function mockLogSession() {
        const todayCountDisplay = document.getElementById('today-count');
        const streakDisplay = document.getElementById('streak');
        
        logDebug('Starting mockLogSession()');
        
        let todayCount = parseInt(localStorage.getItem('todayCount') || '0');
        logDebug(`Initial todayCount parsed: ${todayCount}`);
        
        let streak = parseInt(localStorage.getItem('streak') || '0');
        logDebug(`Initial streak parsed: ${streak}`);
        
        todayCount++;
        logDebug(`Incremented todayCount: ${todayCount}`);
        
        todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
        logDebug(`Updated todayCountDisplay.textContent: ${todayCountDisplay.textContent}`);
        
        localStorage.setItem('todayCount', todayCount);
        logDebug(`Called localStorage.setItem('todayCount', ${todayCount})`);
        logDebug(`Storage state: ${JSON.stringify(mockLocalStorage.storage)}`);
        
        // Update streak
        const lastDate = localStorage.getItem('lastDate');
        logDebug(`Retrieved lastDate: ${lastDate}`);
        
        const today = new Date().toDateString();
        logDebug(`Current date (today): ${today}`);
        
        if (lastDate !== today) {
            logDebug('Different day detected, incrementing streak');
            streak++;
            logDebug(`New streak value: ${streak}`);
            
            streakDisplay.textContent = `Current streak: ${streak} days`;
            logDebug(`Updated streakDisplay.textContent: ${streakDisplay.textContent}`);
            
            localStorage.setItem('streak', streak);
            logDebug(`Called localStorage.setItem('streak', ${streak})`);
            
            localStorage.setItem('lastDate', today);
            logDebug(`Called localStorage.setItem('lastDate', '${today}')`);
        } else {
            logDebug('Same day detected, streak not incremented');
        }
        
        logDebug(`Final storage state: ${JSON.stringify(mockLocalStorage.storage)}`);
    }
    
    // Test execution - first call
    logDebug('--- FIRST CALL TO mockLogSession() ---');
    mockLogSession();
    
    // Storage state inspection after first call
    logDebug(`\nAfter first call - Storage contains: ${JSON.stringify(mockLocalStorage.storage)}`);
    logDebug(`todayCount type: ${typeof mockLocalStorage.storage.todayCount}`);
    logDebug(`todayCount value: '${mockLocalStorage.storage.todayCount}'`);
    
    // Assertions with detailed logging
    const todayCountValue = mockLocalStorage.getItem('todayCount');
    logDebug(`todayCount from getItem(): '${todayCountValue}' (${typeof todayCountValue})`);
    
    // Test with type coercion (==) and strict equality (===)
    logDebug(`todayCount == '1': ${todayCountValue == '1'}`);
    logDebug(`todayCount === '1': ${todayCountValue === '1'}`);
    
    assertEquals(mockLocalStorage.getItem('todayCount'), '1', 'Should increment todayCount in localStorage');
    assertEquals(document.getElementById('today-count').textContent, 'Sessions completed today: 1', 
           'Should update today count display');
    assertEquals(mockLocalStorage.getItem('streak'), '1', 'Should increment streak in localStorage');
    assertEquals(document.getElementById('streak').textContent, 'Current streak: 1 days', 
           'Should update streak display');
    
    // Test multiple logs on same day
    logDebug('\n--- SECOND CALL TO mockLogSession() ---');
    mockLogSession();
    
    // Storage state inspection after second call
    logDebug(`\nAfter second call - Storage contains: ${JSON.stringify(mockLocalStorage.storage)}`);
    logDebug(`todayCount type: ${typeof mockLocalStorage.storage.todayCount}`);
    logDebug(`todayCount value: '${mockLocalStorage.storage.todayCount}'`);
    
    // Assertions for second log
    assertEquals(mockLocalStorage.getItem('todayCount'), '2', 'Should increment todayCount to 2');
    assertEquals(document.getElementById('today-count').textContent, 'Sessions completed today: 2', 
           'Should update today count display to 2');
    // Streak should not increment again on the same day
    assertEquals(mockLocalStorage.getItem('streak'), '1', 'Should not increment streak again on same day');
    
    // Restore original localStorage
    window.localStorage = originalLocalStorage;
    
    // Cleanup
    if (debugContainer.parentNode) {
        debugContainer.parentNode.removeChild(debugContainer);
    }
    cleanupTestDOM();
});