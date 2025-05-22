// scripts.js - Core functionality for JobPrep minimal site

// API Configuration
const API_BASE_URL = 'https://5001-ii7r88g40au86r7uk08vf-5f80de18.manusvm.computer/api';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
const viewPlansBtn = document.getElementById('viewPlansBtn');
const ctaButton = document.getElementById('ctaButton');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');
const featureButtons = document.querySelectorAll('.btn-feature');
const planButtons = document.querySelectorAll('.btn-plan, .btn-plan-primary');
const closeModalButtons = document.querySelectorAll('.close-modal, .close-btn');

// State Management
let isLoggedIn = false;
let currentUser = null;

// Check if user is already logged in (from localStorage)
function checkLoginStatus() {
    const token = localStorage.getItem('jobprep_token');
    const user = localStorage.getItem('jobprep_user');
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            isLoggedIn = true;
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error parsing user data:', error);
            logout(); // Clear invalid data
        }
    }
}

// Update UI based on login status
function updateUIForLoggedInUser() {
    if (isLoggedIn && currentUser) {
        // Change login button to user menu
        loginBtn.textContent = currentUser.username;
        loginBtn.classList.add('logged-in');
        
        // Change get started buttons to dashboard buttons
        getStartedBtn.textContent = 'Dashboard';
        heroGetStartedBtn.textContent = 'Go to Dashboard';
        
        // Update other buttons as needed
        document.querySelectorAll('.btn-plan, .btn-plan-primary').forEach(btn => {
            btn.textContent = 'Select Plan';
        });
    } else {
        // Reset to default state
        loginBtn.textContent = 'Log In';
        loginBtn.classList.remove('logged-in');
        getStartedBtn.textContent = 'Get Started';
        heroGetStartedBtn.textContent = 'Get Started Free';
    }
}

// API Calls
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('jobprep_token', data.token);
        localStorage.setItem('jobprep_user', JSON.stringify(data.user));
        
        // Update state
        currentUser = data.user;
        isLoggedIn = true;
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal
        closeModal(loginModal);
        
        // Show success message
        showMessage('Login successful! Welcome back.', 'success');
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Login failed. Please try again.', 'error');
        return false;
    }
}

async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('jobprep_token', data.token);
        localStorage.setItem('jobprep_user', JSON.stringify(data.user));
        
        // Update state
        currentUser = data.user;
        isLoggedIn = true;
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal
        closeModal(registerModal);
        
        // Show success message
        showMessage('Registration successful! Welcome to JobPrep.', 'success');
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
        return false;
    }
}

function logout() {
    // Clear local storage
    localStorage.removeItem('jobprep_token');
    localStorage.removeItem('jobprep_user');
    
    // Update state
    currentUser = null;
    isLoggedIn = false;
    
    // Update UI
    updateUIForLoggedInUser();
    
    // Show message
    showMessage('You have been logged out.', 'success');
}

// UI Helpers
function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear form fields
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Clear any error messages
    const messages = modal.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

function showMessage(text, type = 'error') {
    // Create message element
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    
    // Add to body
    document.body.appendChild(message);
    
    // Position at top of viewport
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.zIndex = '2000';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '4px';
    message.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function toggleMobileMenu() {
    document.body.classList.toggle('mobile-menu-active');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Event Listeners
function setupEventListeners() {
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                logout();
            } else {
                showModal(loginModal);
            }
        });
    }
    
    // Get Started buttons
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Redirect to dashboard (placeholder)
                showMessage('Dashboard functionality coming soon!', 'success');
            } else {
                showModal(registerModal);
            }
        });
    }
    
    if (heroGetStartedBtn) {
        heroGetStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Redirect to dashboard (placeholder)
                showMessage('Dashboard functionality coming soon!', 'success');
            } else {
                showModal(registerModal);
            }
        });
    }
    
    // View Plans button
    if (viewPlansBtn) {
        viewPlansBtn.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('pricing');
        });
    }
    
    // CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Redirect to dashboard (placeholder)
                showMessage('Dashboard functionality coming soon!', 'success');
            } else {
                showModal(registerModal);
            }
        });
    }
    
    // Mobile menu button
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Switch between login and register
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            showModal(registerModal);
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            showModal(loginModal);
        });
    }
    
    // Feature buttons
    featureButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Redirect to feature (placeholder)
                showMessage('Feature access coming soon!', 'success');
            } else {
                showModal(registerModal);
            }
        });
    });
    
    // Plan buttons
    planButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Redirect to plan selection (placeholder)
                showMessage('Plan selection coming soon!', 'success');
            } else {
                showModal(registerModal);
            }
        });
    });
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showMessage('Please enter both username and password.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                await loginUser(username, password);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;
            
            try {
                await registerUser(username, email, password);
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
            
            // Close mobile menu if open
            if (document.body.classList.contains('mobile-menu-active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Keyboard accessibility
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    checkLoginStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Log initialization
    console.log('JobPrep minimal site initialized');
});
