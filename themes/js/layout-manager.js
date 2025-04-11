/**
 * Layout Manager for Exercise Timer
 * Handles switching between different layouts and their UI components
 */
class LayoutManager {
    /**
     * Initialize the layout manager with available layouts
     */
    constructor() {
        // Available layouts configuration
        this.layouts = {
            'default-layout': {
                name: 'Default Layout',
                cssFile: 'themes/css/classic-layout.css'
            },
            'layout2a': {
                name: 'Card Layout',
                cssFile: 'themes/css/card-layout.css'
            }
        };
        
        // Initialize with saved layout preference or default
        this.currentLayout = localStorage.getItem('preferred-layout') || 'default-layout';
        
        // Set up CSS stylesheets for each layout
        this._setupLayoutStylesheets();
        
        // Apply the initial layout
        this.applyLayout(this.currentLayout);
    }
    
    /**
     * Add stylesheet links to the document head for each layout
     * @private
     */
    _setupLayoutStylesheets() {
        Object.keys(this.layouts).forEach(layoutId => {
            const layout = this.layouts[layoutId];
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = layout.cssFile;
            link.id = `style-${layoutId}`;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Apply a specific layout to the application
     * @param {string} layoutId - The ID of the layout to apply
     */
    applyLayout(layoutId) {
        // Validate the layout exists
        if (!this.layouts[layoutId]) {
            console.error(`Layout '${layoutId}' not found`);
            return;
        }
        
        // Save user preference
        localStorage.setItem('preferred-layout', layoutId);
        this.currentLayout = layoutId;
        
        // Update CSS classes on body
        this._updateBodyClasses(layoutId);
        
        // Add or remove layout-specific elements
        this._updateLayoutSpecificElements(layoutId);
        
        // Update toggle state in settings
        this._updateLayoutToggleState(layoutId);
        
        // Notify other components about the layout change
        window.dispatchEvent(new CustomEvent('layoutChanged', { 
            detail: { layout: layoutId } 
        }));
    }
    
    /**
     * Update body classes for the active layout
     * @private
     * @param {string} layoutId - The active layout ID
     */
    _updateBodyClasses(layoutId) {
        // Remove all layout classes from body
        Object.keys(this.layouts).forEach(id => {
            document.body.classList.remove(id);
        });
        
        // Add the new layout class
        document.body.classList.add(layoutId);
    }
    
    /**
     * Update UI toggle state based on current layout
     * @private
     * @param {string} layoutId - The active layout ID
     */
    _updateLayoutToggleState(layoutId) {
        const layoutToggle = document.getElementById('layout-toggle');
        if (layoutToggle) {
            layoutToggle.checked = layoutId === 'layout2a';
        }
    }
    
    /**
     * Update layout-specific UI elements
     * @private
     * @param {string} layoutId - The active layout ID
     */
    _updateLayoutSpecificElements(layoutId) {
        // Elements specific to layout2a
        const layout2aElements = [
            { id: 'bottom-nav', create: this.createBottomNav.bind(this) },
            { id: 'fab-button', create: this.createFabButton.bind(this) },
            { id: 'settings-drawer', create: this.createSettingsDrawer.bind(this) }
        ];
        
        if (layoutId === 'layout2a') {
            // Add layout2a specific elements if they don't exist
            layout2aElements.forEach(element => {
                if (!document.getElementById(element.id)) {
                    element.create();
                }
            });
        } else {
            // Remove layout2a specific elements if they exist
            layout2aElements.forEach(element => {
                const el = document.getElementById(element.id);
                if (el) el.remove();
            });
        }
    }
    
    /**
     * Create the bottom navigation bar for card layout
     * @returns {HTMLElement} The bottom nav element
     */
    createBottomNav() {
        const bottomNav = document.createElement('nav');
        bottomNav.id = 'bottom-nav';
        bottomNav.className = 'bottom-nav';
        
        // Navigation items configuration
        const navItems = [
            { icon: '⏱️', text: 'Timer', active: true },
            { icon: '💪', text: 'Exercises' },
            { icon: '📊', text: 'Progress' },
            { icon: '❓', text: 'Help' },
            { icon: '⚙️', text: 'Settings', onClick: this.toggleSettingsDrawer }
        ];
        
        // Create navigation items
        navItems.forEach(item => {
            const navItem = this._createNavItem(item);
            bottomNav.appendChild(navItem);
        });
        
        document.body.appendChild(bottomNav);
        return bottomNav;
    }
    
    /**
     * Create a navigation item for the bottom nav
     * @private
     * @param {Object} item - Navigation item configuration
     * @returns {HTMLElement} The navigation item element
     */
    _createNavItem(item) {
        const navItem = document.createElement('a');
        navItem.href = '#';
        navItem.className = `nav-item${item.active ? ' active' : ''}`;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'nav-icon';
        iconSpan.textContent = item.icon;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = item.text;
        
        navItem.appendChild(iconSpan);
        navItem.appendChild(textSpan);
        
        if (item.onClick) {
            navItem.addEventListener('click', item.onClick);
        }
        
        return navItem;
    }
    
    /**
     * Create floating action button
     * @returns {HTMLElement} The FAB element
     */
    createFabButton() {
        const fab = document.createElement('button');
        fab.id = 'fab-button';
        fab.className = 'fab';
        fab.textContent = '+';
        document.body.appendChild(fab);
        return fab;
    }
    
    /**
     * Create settings drawer for card layout
     * @returns {HTMLElement} The settings drawer element
     */
    createSettingsDrawer() {
        const drawer = document.createElement('div');
        drawer.id = 'settings-drawer';
        drawer.className = 'settings-drawer';
        
        // Drawer handle for pull gesture
        const handle = document.createElement('div');
        handle.className = 'drawer-handle';
        drawer.appendChild(handle);
        
        // Settings title
        const title = document.createElement('h3');
        title.style.marginBottom = '16px';
        title.textContent = 'Settings';
        drawer.appendChild(title);
        
        // Add toggle controls
        drawer.appendChild(this.createToggleSwitch('Sound Feedback', true));
        drawer.appendChild(this.createToggleSwitch('Vibration', true));
        
        // Layout toggle
        const layoutToggle = this.createToggleSwitch('Card Layout', this.currentLayout === 'layout2a');
        layoutToggle.querySelector('input').id = 'layout-toggle';
        layoutToggle.querySelector('input').addEventListener('change', (e) => {
            this.applyLayout(e.target.checked ? 'layout2a' : 'default-layout');
        });
        drawer.appendChild(layoutToggle);
        
        document.body.appendChild(drawer);
        return drawer;
    }
    
    /**
     * Create a toggle switch component
     * @param {string} label - Label text for the toggle
     * @param {boolean} checked - Initial toggle state
     * @returns {HTMLElement} The toggle switch element
     */
    createToggleSwitch(label, checked) {
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'toggle-switch';
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'toggle';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        
        const slider = document.createElement('span');
        slider.className = 'toggle-slider';
        
        toggleLabel.appendChild(input);
        toggleLabel.appendChild(slider);
        
        toggleDiv.appendChild(labelSpan);
        toggleDiv.appendChild(toggleLabel);
        
        return toggleDiv;
    }
    
    /**
     * Toggle visibility of the settings drawer
     * @param {Event} event - Click event
     */
    toggleSettingsDrawer(event) {
        if (event) event.preventDefault();
        
        const drawer = document.getElementById('settings-drawer');
        if (drawer) {
            drawer.classList.toggle('visible');
        }
    }
}

// Initialize layout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.layoutManager = new LayoutManager();
    
    // Add layout toggle to settings in default layout
    const settingsSection = document.querySelector('.settings');
    if (settingsSection) {
        const layoutToggle = createDefaultLayoutToggle(window.layoutManager);
        settingsSection.appendChild(layoutToggle);
    }
});

/**
 * Create a layout toggle for the default layout settings
 * @param {LayoutManager} layoutManager - Reference to layout manager
 * @returns {HTMLElement} The toggle element
 */
function createDefaultLayoutToggle(layoutManager) {
    const layoutToggleLabel = document.createElement('label');
    layoutToggleLabel.className = 'toggle';
    
    const layoutToggleInput = document.createElement('input');
    layoutToggleInput.type = 'checkbox';
    layoutToggleInput.id = 'default-layout-toggle';
    layoutToggleInput.checked = layoutManager.currentLayout === 'layout2a';
    layoutToggleInput.addEventListener('change', (e) => {
        layoutManager.applyLayout(e.target.checked ? 'layout2a' : 'default-layout');
    });
    
    const layoutToggleSpan = document.createElement('span');
    layoutToggleSpan.className = 'toggle-label';
    layoutToggleSpan.textContent = 'Card Layout';
    
    layoutToggleLabel.appendChild(layoutToggleInput);
    layoutToggleLabel.appendChild(layoutToggleSpan);
    
    return layoutToggleLabel;
}