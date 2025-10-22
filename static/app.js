// Main Application - SPA Router and Orchestration
import { renderGuestsPage } from './guests.js';
import { renderRoomsPage } from './rooms.js';
import { renderReservationsPage } from './reservations.js';

// Application State
const app = {
    currentPage: 'guests',
    loadingCount: 0,
};

// Page Routes
const routes = {
    guests: renderGuestsPage,
    rooms: renderRoomsPage,
    reservations: renderReservationsPage,
};

// Initialize Application
function init() {
    setupNavigation();
    
    // Handle initial route
    const hash = window.location.hash.slice(1) || 'guests';
    navigateTo(hash);
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'guests';
        navigateTo(page);
    });
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
    
    // Render page
    routes[page]();
}

// Toast Notifications
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
