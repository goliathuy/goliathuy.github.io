/**
 * Example test with debug breakpoints focused on localStorage state
 * Use this file to debug the localStorage test that was failing
 */

// Creating a test with a debugger breakpoint that will pause execution in VS Code
addDebugUnitTest('Debug localStorage initial values', function() {
    console.group('INITIAL localStorage STATE');
    console.log('localStorage items count:', localStorage.length);
    
    // Show all existing items
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: '${value}' (${typeof value})`);
    }
    console.groupEnd();
    
    // Setup test DOM
    const progressHTML = `
        <div id="today-count">Sessions completed today: 0</div>
        <div id="streak">Current streak: 0 days</div>
        <button id="log-session">Log Completed Session</button>
    `;
    
    const container = setupTestDOM(progressHTML);
    console.log("Test container created");
    
    // Store original localStorage values
    const originalTodayCount = localStorage.getItem('todayCount');
    const originalStreak = localStorage.getItem('streak');
    const originalLastDate = localStorage.getItem('lastDate');
    
    console.log("Original values:");
    console.log(`- todayCount: '${originalTodayCount}' (${typeof originalTodayCount})`);
    console.log(`- streak: '${originalStreak}' (${typeof originalStreak})`);
    console.log(`- lastDate: '${originalLastDate}' (${typeof originalLastDate})`);
    
    // Create a fresh mockLocalStorage for testing that won't impact real values
    const mockLocalStorage = createMockLocalStorage();
    
    // If there were pre-existing values, include them in our mock version
    if (originalTodayCount !== null) {
        mockLocalStorage.setItem('todayCount', originalTodayCount);
    }
    if (originalStreak !== null) {
        mockLocalStorage.setItem('streak', originalStreak);
    }
    if (originalLastDate !== null) {
        mockLocalStorage.setItem('lastDate', originalLastDate);
    }
    
    // Replace real localStorage with mock for this test
    const originalLocalStorage = window.localStorage;
    window.localStorage = mockLocalStorage;
    
    // Function we're testing
    function mockLogSession() {
        const todayCountDisplay = document.getElementById('today-count');
        const streakDisplay = document.getElementById('streak');
        
        // This debugger statement will pause execution here when debugging
        debugger;
        
        // Get values from localStorage and parse them
        let todayCount = parseInt(localStorage.getItem('todayCount') || '0');
        let streak = parseInt(localStorage.getItem('streak') || '0');
        
        console.log("Values after parsing:");
        console.log(`- todayCount: ${todayCount} (${typeof todayCount})`);
        console.log(`- streak: ${streak} (${typeof streak})`);
        
        // Update and display values
        todayCount++;
        todayCountDisplay.textContent = `Sessions completed today: ${todayCount}`;
        localStorage.setItem('todayCount', todayCount);
        
        console.log("After increment:");
        console.log(`- todayCount: ${todayCount} (${typeof todayCount})`);
        console.log("localStorage content now:", mockLocalStorage.storage);
        
        // Update streak
        const lastDate = localStorage.getItem('lastDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            streak++;
            streakDisplay.textContent = `Current streak: ${streak} days`;
            localStorage.setItem('streak', streak);
            localStorage.setItem('lastDate', today);
        }
        
        // Final debug output
        console.log("Final localStorage content:", mockLocalStorage.storage);
    }
    
    // Execute the function we're testing
    mockLogSession();
    
    // Assertions with helpful debug messages
    const storedTodayCount = localStorage.getItem('todayCount');
    console.log(`Testing localStorage.getItem('todayCount'): '${storedTodayCount}'`);
    console.log(`Original value was: '${originalTodayCount}'`);
    
    // Get the expected value based on the original
    const expectedTodayCount = String(parseInt(originalTodayCount || '0') + 1);
    console.log(`Expected value is: '${expectedTodayCount}'`);
    
    assertEquals(storedTodayCount, expectedTodayCount, 'Should increment todayCount in localStorage from its previous value');
    
    const expectedText = `Sessions completed today: ${parseInt(originalTodayCount || '0') + 1}`;
    assertEquals(document.getElementById('today-count').textContent, expectedText, 
        'Should update today count display correctly');
    
    // Restore original
    window.localStorage = originalLocalStorage;
    cleanupTestDOM();
});