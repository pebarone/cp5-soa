// Main Application - SPA Router and Orchestration
import { renderGuestsPage } from './guests.js';
import { renderRoomsPage } from './rooms.js';
import { renderReservationsPage } from './reservations.js';

// Application State
const app = {
    currentPage: 'guests',
    loadingCount: 0,
    theme: localStorage.getItem('theme') || 'light',
};

// Page Routes
const routes = {
    guests: renderGuestsPage,
    rooms: renderRoomsPage,
    reservations: renderReservationsPage,
};

// Initialize Application
function init() {
    setupTheme();
    setupNavigation();
    setupThemeToggle();
    
    // Handle initial route
    const hash = window.location.hash.slice(1) || 'guests';
    navigateTo(hash);
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'guests';
        navigateTo(page);
    });
}

// Setup Theme
function setupTheme() {
    document.documentElement.setAttribute('data-theme', app.theme);
}

// Setup Theme Toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Update icon based on current theme
    updateThemeIcon();
    
    themeToggle.addEventListener('click', () => {
        app.theme = app.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', app.theme);
        document.documentElement.setAttribute('data-theme', app.theme);
        updateThemeIcon();
        
        // Add animation feedback
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 100);
    });
}

// Update Theme Icon
function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const isDark = app.theme === 'dark';
    
    themeToggle.innerHTML = isDark ? `
        <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ` : `
        <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    `;
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            window.location.hash = page;
        });
    });
}

// Navigate to Page
export function navigateTo(page) {
    if (!routes[page]) {
        page = 'guests';
    }
    
    app.currentPage = page;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Add page transition animation
    const pageContent = document.getElementById('page-content');
    pageContent.style.opacity = '0';
    pageContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Render page
        routes[page]();
        
        // Animate in
        pageContent.style.opacity = '1';
        pageContent.style.transform = 'translateY(0)';
    }, 150);
}

// Toast Notifications with enhanced animations
export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // Remove existing classes
    toast.className = 'toast';
    
    // Add type class
    if (type !== 'info') {
        toast.classList.add(type);
    }
    
    // Handle multi-line messages (for validation errors)
    if (message.includes('\n')) {
        // Convert newlines to <br> for HTML rendering
        toast.innerHTML = message.replace(/\n/g, '<br>');
    } else {
        toast.textContent = message;
    }
    
    toast.classList.add('show');
    
    // Auto hide after 4 seconds (increased for longer messages)
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Modal Management
export function showModal(title, content) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    modal.classList.add('active');
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

export function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
}

// Loading State Management
export function showLoading() {
    app.loadingCount++;
    
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.classList.add('active');
}

export function hideLoading() {
    app.loadingCount--;
    
    if (app.loadingCount <= 0) {
        app.loadingCount = 0;
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
}

// Setup modal close button
document.getElementById('modal-close').addEventListener('click', closeModal);

// Make closeModal available globally
window.closeModal = closeModal;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
