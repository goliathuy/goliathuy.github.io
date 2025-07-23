document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Navigation buttons
    const aboutBtn = document.getElementById('about-btn');
    const experienceBtn = document.getElementById('experience-btn');
    const skillsBtn = document.getElementById('skills-btn');
    const kegelAppBtn = document.getElementById('kegel-app-btn');
    
    // Close buttons
    const closeAboutBtn = document.getElementById('close-about');
    const closeExperienceBtn = document.getElementById('close-experience');
    const closeSkillsBtn = document.getElementById('close-skills');
    const closeKegelRedirectBtn = document.getElementById('close-kegel-redirect');
    
    // Panels
    const aboutPanel = document.getElementById('about-panel');
    const experiencePanel = document.getElementById('experience-panel');
    const skillsPanel = document.getElementById('skills-panel');
    const kegelRedirectPanel = document.getElementById('kegel-redirect-panel');
    
    // Experience show more button
    const showMoreExperienceBtn = document.getElementById('show-more-experience');
    const moreExperienceContent = document.getElementById('more-experience');
    
    // Kegel app launch button
    const launchKegelAppBtn = document.getElementById('launch-kegel-app');
    
    // Helper function to hide all panels
    function hideAllPanels() {
        if (aboutPanel) aboutPanel.style.display = 'none';
        if (experiencePanel) experiencePanel.style.display = 'none';
        if (skillsPanel) skillsPanel.style.display = 'none';
        if (kegelRedirectPanel) kegelRedirectPanel.style.display = 'none';
    }
    
    // Navigation button event listeners
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
            hideAllPanels();
            if (aboutPanel) aboutPanel.style.display = 'block';
        });
    }
    
    if (experienceBtn) {
        experienceBtn.addEventListener('click', function() {
            hideAllPanels();
            if (experiencePanel) experiencePanel.style.display = 'block';
        });
    }
    
    if (skillsBtn) {
        skillsBtn.addEventListener('click', function() {
            hideAllPanels();
            if (skillsPanel) skillsPanel.style.display = 'block';
        });
    }
    
    if (kegelAppBtn) {
        kegelAppBtn.addEventListener('click', function() {
            hideAllPanels();
            if (kegelRedirectPanel) kegelRedirectPanel.style.display = 'block';
        });
    }
    
    // Close button event listeners
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', function() {
            if (aboutPanel) aboutPanel.style.display = 'none';
        });
    }
    
    if (closeExperienceBtn) {
        closeExperienceBtn.addEventListener('click', function() {
            if (experiencePanel) experiencePanel.style.display = 'none';
        });
    }
    
    if (closeSkillsBtn) {
        closeSkillsBtn.addEventListener('click', function() {
            if (skillsPanel) skillsPanel.style.display = 'none';
        });
    }
    
    if (closeKegelRedirectBtn) {
        closeKegelRedirectBtn.addEventListener('click', function() {
            if (kegelRedirectPanel) kegelRedirectPanel.style.display = 'none';
        });
    }
    
    // Experience show more functionality
    if (showMoreExperienceBtn && moreExperienceContent) {
        showMoreExperienceBtn.addEventListener('click', function() {
            if (moreExperienceContent.style.display === 'block') {
                moreExperienceContent.style.display = 'none';
                showMoreExperienceBtn.textContent = 'Show More Experience';
            } else {
                moreExperienceContent.style.display = 'block';
                showMoreExperienceBtn.textContent = 'Show Less';
            }
        });
    }
    
    // Launch Kegel app functionality
    if (launchKegelAppBtn) {
        launchKegelAppBtn.addEventListener('click', function() {
            window.location.href = 'kegel-timer.html';
        });
    }
});