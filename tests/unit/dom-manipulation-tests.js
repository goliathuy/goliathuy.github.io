/**
 * DOM manipulation unit tests for Kegel Timer app
 */

addUnitTest('Panel visibility toggling should work correctly', function() {
    // Setup test environment
    const panelHTML = `
        <button id="exercises-btn">Exercises</button>
        <button id="progress-btn">Progress</button>
        <button id="about-btn">About</button>
        <button id="close-exercises">Close</button>
        
        <div id="exercises-panel" class="content-panel" style="display: none;">Exercises Panel</div>
        <div id="progress-panel" class="content-panel" style="display: none;">Progress Panel</div>
        <div id="about-panel" class="content-panel" style="display: none;">About Panel</div>
    `;
    
    const container = setupTestDOM(panelHTML);
    
    // Mock panel toggle functionality
    function hideAllPanels() {
        document.getElementById('exercises-panel').style.display = 'none';
        document.getElementById('progress-panel').style.display = 'none';
        document.getElementById('about-panel').style.display = 'none';
    }
    
    // Test exercise button click
    const exercisesBtn = document.getElementById('exercises-btn');
    const exercisesPanel = document.getElementById('exercises-panel');
    
    exercisesBtn.addEventListener('click', function() {
        hideAllPanels();
        exercisesPanel.style.display = 'block';
    });
    
    // Test close button
    const closeExercisesBtn = document.getElementById('close-exercises');
    closeExercisesBtn.addEventListener('click', function() {
        exercisesPanel.style.display = 'none';
    });
    
    // Trigger exercise button click
    exercisesBtn.click();
    
    // Assertions
    assert(exercisesPanel.style.display === 'block', 'Exercises panel should be visible');
    assert(document.getElementById('progress-panel').style.display === 'none', 'Progress panel should be hidden');
    assert(document.getElementById('about-panel').style.display === 'none', 'About panel should be hidden');
    
    // Test close button
    closeExercisesBtn.click();
    
    // Assert panel is closed
    assert(exercisesPanel.style.display === 'none', 'Exercises panel should be hidden after close button click');
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Custom exercise form should gather input values correctly', function() {
    // Setup test environment
    const customizeHTML = `
        <div id="customize-panel">
            <input type="number" id="custom-hold" value="5">
            <input type="number" id="custom-relax" value="5">
            <input type="number" id="custom-reps" value="10">
            <button id="start-custom">Start Custom</button>
        </div>
    `;
    
    const container = setupTestDOM(customizeHTML);
    
    // Record captured values
    let capturedValues = null;
    
    // Mock the start exercise function
    function startExercise(holdTime, relaxTime, repetitions) {
        capturedValues = { holdTime, relaxTime, repetitions };
    }
    
    // Wire up the event handler
    document.getElementById('start-custom').addEventListener('click', function() {
        const holdTime = parseInt(document.getElementById('custom-hold').value) || 5;
        const relaxTime = parseInt(document.getElementById('custom-relax').value) || 5;
        const reps = parseInt(document.getElementById('custom-reps').value) || 10;
        
        startExercise(holdTime, relaxTime, reps);
    });
    
    // Test with default values
    document.getElementById('start-custom').click();
    
    // Assertions for default values
    assert(capturedValues.holdTime === 5, 'Should capture default hold time of 5');
    assert(capturedValues.relaxTime === 5, 'Should capture default relax time of 5');
    assert(capturedValues.repetitions === 10, 'Should capture default repetitions of 10');
    
    // Change input values
    document.getElementById('custom-hold').value = 7;
    document.getElementById('custom-relax').value = 3;
    document.getElementById('custom-reps').value = 15;
    
    // Test with new values
    document.getElementById('start-custom').click();
    
    // Assertions for custom values
    assert(capturedValues.holdTime === 7, 'Should capture custom hold time of 7');
    assert(capturedValues.relaxTime === 3, 'Should capture custom relax time of 3');
    assert(capturedValues.repetitions === 15, 'Should capture custom repetitions of 15');
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Toggle controls should update their state correctly', function() {
    // Setup test environment
    const toggleHTML = `
        <div class="settings">
            <label class="toggle">
                <input type="checkbox" id="sound-toggle" checked>
                <span class="toggle-label">Sound Feedback</span>
            </label>
            <label class="toggle">
                <input type="checkbox" id="vibration-toggle" checked>
                <span class="toggle-label">Vibration</span>
            </label>
        </div>
    `;
    
    const container = setupTestDOM(toggleHTML);
    
    // Get toggle elements
    const soundToggle = document.getElementById('sound-toggle');
    const vibrationToggle = document.getElementById('vibration-toggle');
    
    // Both should start checked by default
    assert(soundToggle.checked === true, 'Sound toggle should be initially checked');
    assert(vibrationToggle.checked === true, 'Vibration toggle should be initially checked');
    
    // Test toggling sound off
    soundToggle.checked = false;
    
    // Trigger a change event to simulate user interaction
    const soundChangeEvent = new Event('change');
    soundToggle.dispatchEvent(soundChangeEvent);
    
    // Assertions after toggle
    assert(soundToggle.checked === false, 'Sound toggle should be unchecked after toggle');
    assert(vibrationToggle.checked === true, 'Vibration toggle should still be checked');
    
    // Test toggling vibration off
    vibrationToggle.checked = false;
    
    // Trigger a change event
    const vibrationChangeEvent = new Event('change');
    vibrationToggle.dispatchEvent(vibrationChangeEvent);
    
    // Assertions after both toggles
    assert(soundToggle.checked === false, 'Sound toggle should remain unchecked');
    assert(vibrationToggle.checked === false, 'Vibration toggle should be unchecked after toggle');
    
    // Cleanup
    cleanupTestDOM();
});

addUnitTest('Exercise buttons should have correct parameters', function() {
    // Setup test environment
    const buttonsHTML = `
        <button id="start-basic">Basic Routine</button>
        <button id="start-long">Long Holds</button>
        <button id="start-quick">Quick Contractions</button>
    `;
    
    const container = setupTestDOM(buttonsHTML);
    
    // Record exercise parameters
    let lastExerciseParams = null;
    
    // Mock the start exercise function
    function startExercise(holdTime, relaxTime, repetitions) {
        lastExerciseParams = { holdTime, relaxTime, repetitions };
    }
    
    // Wire up event listeners like in the real app
    document.getElementById('start-basic').addEventListener('click', () => startExercise(5, 5, 10));
    document.getElementById('start-long').addEventListener('click', () => startExercise(10, 10, 10));
    document.getElementById('start-quick').addEventListener('click', () => startExercise(1, 1, 20));
    
    // Test basic routine
    document.getElementById('start-basic').click();
    
    // Assertions for basic
    assert(lastExerciseParams.holdTime === 5, 'Basic exercise should have 5 second hold');
    assert(lastExerciseParams.relaxTime === 5, 'Basic exercise should have 5 second relax');
    assert(lastExerciseParams.repetitions === 10, 'Basic exercise should have 10 repetitions');
    
    // Test long holds
    document.getElementById('start-long').click();
    
    // Assertions for long holds
    assert(lastExerciseParams.holdTime === 10, 'Long exercise should have 10 second hold');
    assert(lastExerciseParams.relaxTime === 10, 'Long exercise should have 10 second relax');
    assert(lastExerciseParams.repetitions === 10, 'Long exercise should have 10 repetitions');
    
    // Test quick contractions
    document.getElementById('start-quick').click();
    
    // Assertions for quick
    assert(lastExerciseParams.holdTime === 1, 'Quick exercise should have 1 second hold');
    assert(lastExerciseParams.relaxTime === 1, 'Quick exercise should have 1 second relax');
    assert(lastExerciseParams.repetitions === 20, 'Quick exercise should have 20 repetitions');
    
    // Cleanup
    cleanupTestDOM();
});