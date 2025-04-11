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
        aboutPanel.style.display = 'none';
        experiencePanel.style.display = 'none';
        skillsPanel.style.display = 'none';
        kegelRedirectPanel.style.display = 'none';
    }
    
    // Navigation button event listeners
    aboutBtn.addEventListener('click', function() {
        hideAllPanels();
        aboutPanel.style.display = 'block';
    });
    
    experienceBtn.addEventListener('click', function() {
        hideAllPanels();
        experiencePanel.style.display = 'block';
    });
    
    skillsBtn.addEventListener('click', function() {
        hideAllPanels();
        skillsPanel.style.display = 'block';
    });
    
    kegelAppBtn.addEventListener('click', function() {
        hideAllPanels();
        kegelRedirectPanel.style.display = 'block';
    });
    
    // Close button event listeners
    closeAboutBtn.addEventListener('click', function() {
        aboutPanel.style.display = 'none';
    });
    
    closeExperienceBtn.addEventListener('click', function() {
        experiencePanel.style.display = 'none';
    });
    
    closeSkillsBtn.addEventListener('click', function() {
        skillsPanel.style.display = 'none';
    });
    
    closeKegelRedirectBtn.addEventListener('click', function() {
        kegelRedirectPanel.style.display = 'none';
    });
    
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
    
    // Google Photos Integration
    loadPhotosFromConfig();
});

/**
 * Load photos from configuration file and apply them to the page
 */
async function loadPhotosFromConfig() {
    try {
        // Fetch the photos configuration
        const response = await fetch('photos-config.json');
        if (!response.ok) {
            console.error('Failed to load photos configuration');
            return;
        }
        
        const config = await response.json();
        
        // Set background photo if available
        if (config.backgroundPhotos && config.backgroundPhotos.length > 0) {
            setRandomBackgroundPhoto(config.backgroundPhotos);
        }
        
        // Add gallery photos if available
        if (config.galleryPhotos && config.galleryPhotos.length > 0) {
            addPhotoGallery(config.galleryPhotos);
        }
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

/**
 * Set a random background photo from the provided IDs
 * @param {string[]} photoIds - Array of Google Photos IDs
 */
function setRandomBackgroundPhoto(photoIds) {
    if (!photoIds || photoIds.length === 0) return;
    
    // Select a random photo ID
    const randomIndex = Math.floor(Math.random() * photoIds.length);
    const photoId = photoIds[randomIndex];
    
    // Create the image URL
    const photoUrl = `https://lh3.googleusercontent.com/p/${photoId}=w1920-h1080`;
    
    // Apply as background to header
    const header = document.querySelector('header');
    if (header) {
        header.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${photoUrl})`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
        header.style.color = 'white';
        header.style.padding = '50px 20px';
    }
}

/**
 * Create and append a photo gallery using the provided photo IDs
 * @param {string[]} photoIds - Array of Google Photos IDs
 */
function addPhotoGallery(photoIds) {
    if (!photoIds || photoIds.length === 0) return;
    
    // Create gallery container
    const gallerySection = document.createElement('div');
    gallerySection.className = 'photo-gallery-section';
    gallerySection.innerHTML = `<h2>Photo Gallery</h2>`;
    
    // Create gallery grid
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'photo-gallery-grid';
    
    // Add photos to gallery
    photoIds.forEach(photoId => {
        const photoUrl = `https://lh3.googleusercontent.com/p/${photoId}=w400-h300`;
        const photoElement = document.createElement('div');
        photoElement.className = 'gallery-photo';
        photoElement.innerHTML = `
            <img src="${photoUrl}" alt="Gallery Photo" loading="lazy" />
        `;
        
        // Add click event to open the photo in full size
        photoElement.addEventListener('click', function() {
            const fullSizeUrl = `https://lh3.googleusercontent.com/p/${photoId}`;
            window.open(fullSizeUrl, '_blank');
        });
        
        galleryGrid.appendChild(photoElement);
    });
    
    // Append gallery to section and to container
    gallerySection.appendChild(galleryGrid);
    
    // Insert the gallery before the footer
    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(gallerySection, footer);
    }
}