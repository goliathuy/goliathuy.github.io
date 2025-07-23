# 📋 Testing Documentation: Custom Test Framework

> **Documentation for the custom browser-based test framework and test suites**

## Testing Architecture Overview

### Framework Design
- **Browser-based**: Runs directly in browser without Node.js dependencies
- **Custom assertions**: Simple `assert()` and `assertEquals()` functions
- **Mock support**: Built-in localStorage and DOM mocking utilities
- **Debug features**: Breakpoints, visual inspection, detailed logging

### Test Structure
```
tests/
├── test-framework.js      # Core testing utilities
├── test-runner.html       # Test execution interface
├── unit/                  # Individual component tests
│   ├── timer-tests.js
│   ├── dom-manipulation-tests.js
│   └── debug-tests.js
└── integration/           # Full user flow tests
    └── user-flow-tests.js
```

## Test Framework Features

### Core Functions
```javascript
// Test registration
addUnitTest(name, testFn)
addIntegrationTest(name, testFn)
addDebugUnitTest(name, testFn) // Includes debugger breakpoint

// Assertions
assert(condition, message)
assertEquals(actual, expected, message)
assertThrows(fn, message)

// DOM utilities
setupTestDOM(html) // Returns container element
cleanupTestDOM()   // Removes test container
createMockElement(tagName, attributes)

// Mocking
createMockLocalStorage() // Returns isolated localStorage mock
```

### Running Tests
1. **Via Browser**: Open `tests/test-runner.html`
2. **Via VS Code**: Use "Debug Tests" launch configuration
3. **Via Batch File**: Run `debug-tests.bat`

### Debug Features
- **Debug Mode**: Toggle to see detailed test execution logs
- **Visual Container**: Show/hide test DOM for inspection
- **Breakpoints**: Pause execution on test failures
- **Error Details**: Click to see full stack traces

## Test Categories

### Unit Tests

#### Timer Logic Tests
```javascript
addUnitTest('Timer initialization should set default values', function() {
    // Tests timer reset functionality
    // Verifies default UI state
    // Mocks setInterval/clearInterval
});

addUnitTest('Timer visual updates should work correctly', function() {
    // Tests countdown display
    // Verifies phase transitions
    // Checks visual feedback (blinking, colors)
});
```

#### DOM Manipulation Tests
```javascript
addUnitTest('Panel visibility toggling should work correctly', function() {
    // Tests hideAllPanels() function
    // Verifies panel show/hide logic
    // Checks event listener setup
});

addUnitTest('Custom exercise form should gather input values correctly', function() {
    // Tests form value extraction
    // Verifies input validation
    // Checks parameter passing
});
```

#### Progress Tracking Tests
```javascript
addUnitTest('Progress tracking functions should update localStorage correctly', function() {
    // Uses mock localStorage
    // Tests session counting
    // Verifies streak calculation
    // Handles date transitions
});
```

### Integration Tests

#### Complete Exercise Flow
```javascript
addIntegrationTest('Complete exercise flow should work correctly', function() {
    // Full exercise simulation
    // Tests start → progress → completion
    // Verifies UI state changes
    // Checks data persistence
    // Mocks timers and localStorage
});
```

#### Panel Navigation
```javascript
addIntegrationTest('Panel navigation should maintain application state', function() {
    // Tests panel switching during active timer
    // Verifies state preservation
    // Checks stop functionality while panel open
});
```

## Mock Utilities

### Mock localStorage
```javascript
const mockLocalStorage = createMockLocalStorage();
// Isolated storage that doesn't affect real localStorage
// Includes debug methods for inspection
```

### Mock Timers
```javascript
// Replace real timers for testing
const originalSetInterval = window.setInterval;
window.setInterval = function(callback, ms) {
    mockTimerCallbacks.push(callback);
    return intervalId++;
};
```

### Mock DOM
```javascript
const testHTML = `
    <div id="countdown">0</div>
    <button id="start-basic">Start</button>
`;
const container = setupTestDOM(testHTML);
// Creates isolated DOM for testing
// Automatically cleaned up after test
```

## Debugging Tests

### VS Code Integration
1. Set breakpoints in test files
2. Press F5 and select "Debug Tests"
3. Chrome DevTools opens with test page
4. Execution pauses at breakpoints

### Debug Console
```javascript
// Tests include detailed logging
console.group('Test: Timer functionality');
console.log('Initial state:', timerState);
console.log('After update:', newState);
console.groupEnd();
```

### Visual Inspection
- Toggle "Show Test Container" to see test DOM
- Use "Show Current Test DOM" button to inspect HTML
- Debug panel shows localStorage state changes

## Test Patterns

### Defensive Test Structure
```javascript
addUnitTest('Example test with full cleanup', function() {
    // 1. Setup
    const container = setupTestDOM(html);
    const originalLocalStorage = window.localStorage;
    
    // 2. Mock replacements
    window.localStorage = createMockLocalStorage();
    
    // 3. Test execution
    // ... test logic ...
    
    // 4. Assertions
    assertEquals(actual, expected, 'Clear description');
    
    // 5. Cleanup (critical!)
    window.localStorage = originalLocalStorage;
    cleanupTestDOM();
});
```

### Error Handling Tests
```javascript
addUnitTest('Should handle missing DOM elements gracefully', function() {
    // Test defensive null checks
    // Verify no errors thrown when elements missing
    // Confirm graceful degradation
});
```

## Running Test Suites

### All Tests
```
Run All Tests → Executes unit + integration tests
```

### Specific Suites
```
Run Unit Tests → Component-level testing only
Run Integration Tests → Full user flow testing only
```

### Test Results
- **Pass/Fail counts** per suite
- **Error details** with stack traces
- **Overall summary** across all suites
- **Console logging** for debugging

## Best Practices

### Test Isolation
- Always clean up DOM after tests
- Restore original functions (timers, localStorage)
- Use mock objects to avoid side effects

### Descriptive Assertions
```javascript
// Good
assertEquals(result, 'expected value', 'Should update display text correctly');

// Poor
assertEquals(result, 'expected value');
```

### Comprehensive Coverage
- Test both success and failure paths
- Include edge cases (empty inputs, null values)
- Verify UI state changes
- Check data persistence

This testing framework provides a solid foundation for maintaining code quality while supporting the project's vanilla JavaScript and browser-based approach.
