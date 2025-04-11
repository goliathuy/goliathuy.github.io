/**
 * Layout Manager for Exercise Timer
 * Handles switching between different layouts
 */
class LayoutManager {
    constructor() {
        // Available layouts
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
        
        // Initialize with saved layout or default
        this.currentLayout = localStorage.getItem('preferred-layout') || 'default-layout';
        
        // Create DOM elements for layout CSS
        this.setupLayoutStylesheets();
        
        // Initialize layout
        this.applyLayout(this.currentLayout);
    }
    
    setupLayoutStylesheets() {
        // Add stylesheets for each layout
        Object.keys(this.layouts).forEach(layoutId => {
            const layout = this.layouts[layoutId];
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = layout.cssFile;
            link.id = `style-${layoutId}`;
            document.head.appendChild(link);
        });
    }
    
    applyLayout(layoutId) {
        if (!this.layouts[layoutId]) {
            console.error(`Layout '${layoutId}' not found`);
            return;
        }
        
        // Save preference
        localStorage.setItem('preferred-layout', layoutId);
        this.currentLayout = layoutId;
        
        // Remove all layout classes from body
        Object.keys(this.layouts).forEach(id => {
            document.body.classList.remove(id);
        });
        
        // Add new layout class
        document.body.classList.add(layoutId);
        
        // Update UI elements specific to layouts
        this.updateLayoutSpecificElements(layoutId);
        
        // Update toggle state in settings
        const layoutToggle = document.getElementById('layout-toggle');
        if (layoutToggle) {
            layoutToggle.checked = layoutId === 'layout2a';
        }
        
        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('layoutChanged', { detail: { layout: layoutId } }));
    }
    
    updateLayoutSpecificElements(layoutId) {
        // Elements specific to layout2a
        const layout2aElements = [
            { id: 'bottom-nav', create: this.createBottomNav.bind(this) },
            { id: 'fab-button', create: this.createFabButton.bind(this) },
            { id: 'settings-drawer', create: this.createSettingsDrawer.bind(this) }
        ];
        
        // Create or remove layout-specific elements based on current layout
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
    
    createBottomNav() {
        const bottomNav = document.createElement('nav');
        bottomNav.id = 'bottom-nav';
        bottomNav.className = 'bottom-nav';
        
        // Navigation items
        const navItems = [
            { icon: '⏱️', text: 'Timer', active: true },
            { icon: '💪', text: 'Exercises' },
            { icon: '📊', text: 'Progress' },
            { icon: '❓', text: 'Help' },
            { icon: '⚙️', text: 'Settings', onClick: this.toggleSettingsDrawer }
        ];
        
        navItems.forEach(item => {
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
            
            bottomNav.appendChild(navItem);
        });
        
        document.body.appendChild(bottomNav);
        return bottomNav;
    }
    
    createFabButton() {
        const fab = document.createElement('button');
        fab.id = 'fab-button';
        fab.className = 'fab';
        fab.textContent = '+';
        document.body.appendChild(fab);
        return fab;
    }
    
    createSettingsDrawer() {
        const drawer = document.createElement('div');
        drawer.id = 'settings-drawer';
        drawer.className = 'settings-drawer';
        
        // Drawer handle
        const handle = document.createElement('div');
        handle.className = 'drawer-handle';
        drawer.appendChild(handle);
        
        // Settings title
        const title = document.createElement('h3');
        title.style.marginBottom = '16px';
        title.textContent = 'Settings';
        drawer.appendChild(title);
        
        // Sound toggle
        const soundToggle = this.createToggleSwitch('Sound Feedback', true);
        drawer.appendChild(soundToggle);
        
        // Vibration toggle
        const vibrationToggle = this.createToggleSwitch('Vibration', true);
        drawer.appendChild(vibrationToggle);
        
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
    window.layoutManager = new LayoutManager();
    
    // Add layout toggle to settings in default layout
    const settingsSection = document.querySelector('.settings');
    if (settingsSection) {
        const layoutToggleLabel = document.createElement('label');
        layoutToggleLabel.className = 'toggle';
        
        const layoutToggleInput = document.createElement('input');
        layoutToggleInput.type = 'checkbox';
        layoutToggleInput.id = 'default-layout-toggle';
        layoutToggleInput.checked = window.layoutManager.currentLayout === 'layout2a';
        layoutToggleInput.addEventListener('change', (e) => {
            window.layoutManager.applyLayout(e.target.checked ? 'layout2a' : 'default-layout');
        });
        
        const layoutToggleSpan = document.createElement('span');
        layoutToggleSpan.className = 'toggle-label';
        layoutToggleSpan.textContent = 'Card Layout';
        
        layoutToggleLabel.appendChild(layoutToggleInput);
        layoutToggleLabel.appendChild(layoutToggleSpan);
        
        settingsSection.appendChild(layoutToggleLabel);
    }
});