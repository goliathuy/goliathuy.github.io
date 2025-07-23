# 📊 API Documentation: Core Functions and Events

> **API reference for the dual-app functionality, timer system, and PWA features**

## Core Timer API

### Exercise Control Functions

#### `startExercise(holdTime, relaxTime, repetitions)`
Initiates a new exercise session with specified parameters.

**Parameters:**
- `holdTime` (number): Duration in seconds for contraction phase
- `relaxTime` (number): Duration in seconds for relaxation phase  
- `repetitions` (number): Total number of hold-relax cycles

**Example:**
```javascript
// Start basic exercise: 5s hold, 5s relax, 10 reps
startExercise(5, 5, 10);

// Start custom exercise: 8s hold, 3s relax, 15 reps
startExercise(8, 3, 15);
```

**State Changes:**
- Disables start buttons
- Enables stop button
- Initializes timer variables
- Begins preparation countdown

#### `stopTimer()`
Immediately stops the current exercise session.

**State Changes:**
- Clears active interval
- Resets timer display to "0"
- Enables start buttons
- Disables stop button
- Resets instruction text

#### `resetTimer()`
Resets timer to initial state without starting exercise.

**State Changes:**
- Sets countdown to "0"
- Sets phase to "READY"
- Resets visual timer elements
- Clears any active timers

### Visual Update Functions

#### `updateTimerVisuals()`
Updates all timer-related DOM elements with current state.

**Updates:**
- Countdown display (remaining seconds)
- Phase label ("HOLD", "RELAX", "READY", "DONE")
- Timer fill animation (scaleY transform)
- Timer color classes ("hold", "relax")
- Blinking effect for last 3 seconds

#### `updateProgressDisplay()`
Refreshes progress tracking elements.

**Updates:**
- Today's session count
- Current streak display
- Last session date

## Audio System API

#### `initAudio()`
Initializes Web Audio API context for sound feedback.

**Returns:** Audio context or null if unavailable

#### `playSound(isHold)`
Plays audio cue for phase transitions.

**Parameters:**
- `isHold` (boolean): true for hold phase (higher pitch), false for relax (lower pitch)

**Audio Properties:**
- Hold sound: 880Hz (A5 note)
- Relax sound: 440Hz (A4 note)
- Duration: 200ms
- Volume: 0.1 (10%)

#### `vibrate(duration)`
Triggers device vibration if supported.

**Parameters:**
- `duration` (number): Vibration duration in milliseconds

## Progress Tracking API

#### `logSession()`
Records a completed exercise session.

**Actions:**
- Increments today's session count
- Updates streak if new day
- Saves to localStorage
- Updates display elements

**localStorage Keys:**
- `todayCount`: Current day session count
- `streak`: Consecutive days with sessions
- `lastDate`: Date string of last session

#### `getProgressData()`
Retrieves current progress statistics.

**Returns:**
```javascript
{
    todayCount: number,    // Sessions today
    streak: number,        // Current streak
    lastDate: string      // Last session date
}
```

## Panel Navigation API

#### `hideAllPanels()`
Hides all content panels in the application.

**Affected Panels:**
- Customize panel
- Exercises panel
- Progress panel
- About panel
- Benefits panel
- FAQ panel

#### `showPanel(panelId)`
Shows specific panel after hiding others.

**Parameters:**
- `panelId` (string): ID of target panel element

**Example:**
```javascript
showPanel('exercises-panel');
showPanel('progress-panel');
```

## PWA Service Worker API

#### `registerServiceWorker()`
Registers service worker for offline functionality.

**Registration Path:** `./sw.js`

**Events Handled:**
- `install`: Caches initial assets
- `activate`: Cleans old caches
- `fetch`: Serves cached content offline

#### Cache Management

**Cache Name:** `kegel-timer-v1`

**Cached Assets:**
- HTML files (index.html, kegel-timer.html)
- JavaScript files (script.js, hub.js)
- CSS files (styles.css)
- PWA files (manifest.json)
- Icons (icon-192.png, icon-512.png)

## Event System

### Timer Events

#### Exercise Lifecycle Events
```javascript
// Exercise started
document.addEventListener('exerciseStarted', (e) => {
    console.log('Exercise type:', e.detail.type);
});

// Phase changed
document.addEventListener('phaseChanged', (e) => {
    console.log('New phase:', e.detail.phase);
});

// Exercise completed
document.addEventListener('exerciseCompleted', (e) => {
    console.log('Total time:', e.detail.totalTime);
});
```

### UI Events

#### Panel Navigation Events
```javascript
// Panel opened
document.addEventListener('panelOpened', (e) => {
    console.log('Panel:', e.detail.panelId);
});

// Panel closed
document.addEventListener('panelClosed', (e) => {
    console.log('Panel:', e.detail.panelId);
});
```

#### Settings Events
```javascript
// Sound toggle changed
document.addEventListener('soundToggled', (e) => {
    console.log('Sound enabled:', e.detail.enabled);
});

// Vibration toggle changed
document.addEventListener('vibrationToggled', (e) => {
    console.log('Vibration enabled:', e.detail.enabled);
});
```

## Exercise Configuration

### Predefined Exercise Types
```javascript
const EXERCISES = {
    basic: { holdTime: 5, relaxTime: 5, repetitions: 10 },
    long: { holdTime: 10, relaxTime: 10, repetitions: 10 },
    quick: { holdTime: 1, relaxTime: 1, repetitions: 20 }
};
```

### Custom Exercise Validation
```javascript
function validateExerciseParams(hold, relax, reps) {
    return {
        holdTime: Math.max(1, Math.min(30, hold)),
        relaxTime: Math.max(1, Math.min(30, relax)),
        repetitions: Math.max(1, Math.min(50, reps))
    };
}
```

## Error Handling

### Common Error Patterns
```javascript
// DOM element safety
function safeElementUpdate(elementId, property, value) {
    const element = document.getElementById(elementId);
    if (element && property in element) {
        element[property] = value;
    }
}

// localStorage safety  
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {
        console.warn('localStorage unavailable:', e.message);
    }
}

// Audio context safety
function safeAudioPlay(frequency) {
    if (audioContext && audioContext.state !== 'suspended') {
        // Play audio
    }
}
```

## Integration Points

### Hub ↔ Timer Navigation
```javascript
// From hub to timer
window.location.href = 'kegel-timer.html';

// From timer to hub  
window.location.href = 'index.html';
```

### State Persistence
```javascript
// Save app state before navigation
sessionStorage.setItem('returnToPanel', 'progress');

// Restore state after navigation
const returnPanel = sessionStorage.getItem('returnToPanel');
if (returnPanel) showPanel(returnPanel);
```

This API provides comprehensive access to all application functionality while maintaining the defensive coding patterns essential to the project's robustness.
