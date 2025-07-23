/**
 * Simple browser-based testing framework for Kegel Timer application
 */

// Test collection
const tests = {
    unit: [],
    integration: []
};

// Test suite counter
let passedTests = 0;
let totalTests = 0;

/**
 * Add a unit test to the test collection
 * @param {string} name - Name of the test
 * @param {function} testFn - Test function to execute
 */
function addUnitTest(name, testFn) {
    tests.unit.push({ name, testFn });
}

/**
 * Add an integration test to the test collection
 * @param {string} name - Name of the test
 * @param {function} testFn - Test function to execute
 */
function addIntegrationTest(name, testFn) {
    tests.integration.push({ name, testFn });
}

/**
 * Add debugger breakpoints to tests
 * @param {string} name - Name of the test
 * @param {function} testFn - Test function to execute
 */
function addDebugUnitTest(name, testFn) {
    tests.unit.push({ 
        name, 
        testFn: function() {
            debugger; // This will pause execution when debugging in VS Code
            testFn.apply(this, arguments);
        }
    });
}

/**
 * Assert that a condition is true
 * @param {boolean} condition - The condition to test
 * @param {string} message - Error message to display if condition is false
 */
function assert(condition, message) {
    if (window.testDebug && window.testDebug.isDebugMode) {
        window.testDebug.log(`Assert: ${message || 'Condition check'} - ${condition ? 'PASSED' : 'FAILED'}`);
    }
    
    if (!condition) {
        const error = new Error(message || "Assertion failed");
        
        if (window.testDebug && window.testDebug.breakOnFail) {
            // Add a breakpoint for debugging
            debugger;
        }
        
        throw error;
    }
}

/**
 * Assert that two values are equal
 * @param {*} actual - The actual value
 * @param {*} expected - The expected value
 * @param {string} message - Error message to display if values are not equal
 */
function assertEquals(actual, expected, message) {
    if (window.testDebug && window.testDebug.isDebugMode) {
        window.testDebug.log(`AssertEquals: ${message || 'Equality check'}`);
        window.testDebug.log(`- Expected: ${JSON.stringify(expected)} (${typeof expected})`);
        window.testDebug.log(`- Actual: ${JSON.stringify(actual)} (${typeof actual})`);
    }
    
    if (actual !== expected) {
        const error = new Error(message || `Expected ${expected} (${typeof expected}) but got ${actual} (${typeof actual})`);
        
        if (window.testDebug && window.testDebug.breakOnFail) {
            // Add a breakpoint for debugging
            debugger;
        }
        
        throw error;
    }
}

/**
 * Assert that a function throws an error
 * @param {function} fn - The function to test
 * @param {string} message - Error message to display if function doesn't throw
 */
function assertThrows(fn, message) {
    try {
        fn();
        throw new Error(message || "Expected function to throw an error");
    } catch (e) {
        // Expected error
        return;
    }
}

/**
 * Create a mock DOM element
 * @param {string} tagName - HTML tag name
 * @param {object} attributes - Attributes for the element
 * @returns {Element} The created element
 */
function createMockElement(tagName, attributes = {}) {
    const el = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });
    return el;
}

/**
 * Setup a mock DOM environment for testing
 * @param {string} html - HTML content to use for testing
 * @returns {Element} Container element with the test HTML
 */
function setupTestDOM(html) {
    const container = document.createElement('div');
    container.id = 'test-container';
    container.style.display = 'none';
    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
}

/**
 * Cleanup test DOM environment
 */
function cleanupTestDOM() {
    const container = document.getElementById('test-container');
    if (container) {
        document.body.removeChild(container);
    }
}

/**
 * Mock localStorage implementation for tests
 * @returns {Object} A mock localStorage object
 */
function createMockLocalStorage() {
    const storage = {};
    return {
        storage,
        getItem: function(key) {
            return storage[key] !== undefined ? storage[key] : null;
        },
        setItem: function(key, value) {
            storage[key] = String(value);
        },
        removeItem: function(key) {
            delete storage[key];
        },
        clear: function() {
            Object.keys(storage).forEach(key => delete storage[key]);
        },
        toString: function() {
            return '[object Storage]';
        },
        // Helper method for testing
        _debug: function() {
            console.log('MockLocalStorage contents:', JSON.stringify(storage));
        }
    };
}

/**
 * Run specified tests and display results
 * @param {Array} testList - List of tests to run
 * @param {string} suiteName - Name of the test suite
 */
function runTests(testList, suiteName) {
    const resultsDiv = document.getElementById('test-results');
    
    // Create suite container
    const suiteDiv = document.createElement('div');
    suiteDiv.className = 'test-suite';
    suiteDiv.innerHTML = `<h2>${suiteName}</h2>`;
    resultsDiv.appendChild(suiteDiv);
    
    let suitePassedTests = 0;
    const suiteTotal = testList.length;
    
    console.group(`Running ${suiteName} (${testList.length} tests)`);
    
    // Run each test in the list
    testList.forEach(test => {
        totalTests++;
        const resultDiv = document.createElement('div');
        resultDiv.className = 'test-result';
        
        console.log(`Running test: ${test.name}`);
        try {
            test.testFn();
            // Test passed
            resultDiv.innerHTML = `<span class="test-name">${test.name}</span>: <span class="pass">PASS</span>`;
            passedTests++;
            suitePassedTests++;
            console.log(`✅ PASS: ${test.name}`);
        } catch (e) {
            // Test failed
            resultDiv.innerHTML = `<span class="test-name">${test.name}</span>: <span class="fail">FAIL</span> - ${e.message}`;
            console.error(`❌ FAIL: ${test.name}`, e);
            
            // Add details button for failed tests
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Show Error Details';
            detailsBtn.style.marginLeft = '10px';
            detailsBtn.style.fontSize = '12px';
            detailsBtn.onclick = function() {
                alert(`Error in test "${test.name}":\n\n${e.message}\n\nStack trace:\n${e.stack}`);
            };
            resultDiv.appendChild(detailsBtn);
        }
        
        suiteDiv.appendChild(resultDiv);
    });
    
    console.groupEnd();
    
    // Add suite summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary';
    summaryDiv.textContent = `${suitePassedTests}/${suiteTotal} tests passed`;
    suiteDiv.appendChild(summaryDiv);
}

/**
 * Run all unit tests
 */
function runUnitTests() {
    document.getElementById('test-results').innerHTML = '';
    passedTests = 0;
    totalTests = 0;
    runTests(tests.unit, 'Unit Tests');
    displayTotalSummary();
}

/**
 * Run all integration tests
 */
function runIntegrationTests() {
    document.getElementById('test-results').innerHTML = '';
    passedTests = 0;
    totalTests = 0;
    runTests(tests.integration, 'Integration Tests');
    displayTotalSummary();
}

/**
 * Run all tests (unit and integration)
 */
function runAllTests() {
    document.getElementById('test-results').innerHTML = '';
    passedTests = 0;
    totalTests = 0;
    runTests(tests.unit, 'Unit Tests');
    runTests(tests.integration, 'Integration Tests');
    displayTotalSummary();
}

/**
 * Display total summary of test results
 */
function displayTotalSummary() {
    const resultsDiv = document.getElementById('test-results');
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary';
    summaryDiv.style.fontSize = '1.2em';
    summaryDiv.style.marginTop = '20px';
    
    if (passedTests === totalTests) {
        summaryDiv.innerHTML = `<span class="pass">All tests passed! ${passedTests}/${totalTests}</span>`;
    } else {
        summaryDiv.innerHTML = `<span>${passedTests}/${totalTests} tests passed overall</span>`;
    }
    
    resultsDiv.appendChild(summaryDiv);
}