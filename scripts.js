// Mock API Configuration
const API_BASE_URL = '';

// Mock user database
const mockUsers = [
  { username: 'testuser', password: 'password123', email: 'test@example.com' }
];

// Override fetch for auth endpoints to use mock data
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/auth/login')) {
    return mockLoginResponse(url, options);
  } else if (url.includes('/auth/register')) {
    return mockRegisterResponse(url, options);
  } else if (url.includes('/auth/validate')) {
    return mockValidateResponse(url, options);
  } else if (url.includes('/auth/logout')) {
    return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
  } else if (url.includes('/analytics/')) {
    return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
  }
  return originalFetch(url, options);
};

// scripts.js - Core functionality for JobPrep minimal site

// API Configuration
// Mock API for testing without backend
const API_BASE_URL = '';

// Mock user database
const mockUsers = [
  { username: 'testuser', password: 'password123', email: 'test@example.com' }
];

// Override fetch for auth endpoints to use mock data
const originalFetch = window.fetch;
window.fetch = function(url, options ) {
  if (url.includes('/auth/login')) {
    return mockLoginResponse(url, options);
  } else if (url.includes('/auth/register')) {
    return mockRegisterResponse(url, options);
  } else if (url.includes('/auth/validate')) {
    return mockValidateResponse(url, options);
  } else if (url.includes('/auth/logout')) {
    return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
  }
  return originalFetch(url, options);
};

function mockLoginResponse(url, options) {
  const body = JSON.parse(options.body);
  const user = mockUsers.find(u => u.username === body.username && u.password === body.password);
  
  if (user) {
    return Promise.resolve(new Response(
      JSON.stringify({
        token: 'mock-token-' + Date.now(),
        user: { username: user.username, email: user.email }
      }),
      { status: 200 }
    ));
  } else {
    return Promise.resolve(new Response(
      JSON.stringify({ message: 'Invalid username or password' }),
      { status: 401 }
    ));
  }
}

function mockRegisterResponse(url, options) {
  const body = JSON.parse(options.body);
  const userExists = mockUsers.some(u => u.username === body.username || u.email === body.email);
  
  if (userExists) {
    return Promise.resolve(new Response(
      JSON.stringify({ message: 'Username or email already taken' }),
      { status: 400 }
    ));
  } else {
    // Add to mock database
    mockUsers.push({
      username: body.username,
      password: body.password,
      email: body.email
    });
    
    return Promise.resolve(new Response(
      JSON.stringify({
        token: 'mock-token-' + Date.now(),
        user: { username: body.username, email: body.email }
      }),
      { status: 200 }
    ));
  }
}

function mockValidateResponse(url, options) {
  const authHeader = options.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-token-')) {
    return Promise.resolve(new Response(
      JSON.stringify({ valid: true }),
      { status: 200 }
    ));
  } else {
    return Promise.resolve(new Response(
      JSON.stringify({ valid: false }),
      { status: 401 }
    ));
  }
}


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

// Constants
const TOKEN_KEY = 'jobprep_token';
const USER_KEY = 'jobprep_user';
const TOKEN_EXPIRY_KEY = 'jobprep_token_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Check if user is already logged in and validate token
async function checkLoginStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !user) {
        return false;
    }
    
    // Check if token has expired
    if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
        console.log('Token expired, logging out');
        logout();
        showMessage('Your session has expired. Please log in again.', 'info');
        return false;
    }
    
    try {
        // Validate token with backend
        const isValid = await validateToken(token);
        
        if (isValid) {
            currentUser = JSON.parse(user);
            isLoggedIn = true;
            updateUIForLoggedInUser();
            return true;
        } else {
            // Token is invalid
            logout();
            return false;
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        // Don't automatically logout on network errors to allow offline usage
        if (error.name !== 'NetworkError' && error.name !== 'TypeError') {
            logout();
            return false;
        }
        
        // For network errors, assume token is valid for now
        try {
            currentUser = JSON.parse(user);
            isLoggedIn = true;
            updateUIForLoggedInUser();
            return true;
        } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            logout();
            return false;
        }
    }
}

// Validate token with backend
async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Refresh token expiry
            setTokenExpiry();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token validation error:', error);
        // Throw the error to be handled by the caller
        throw error;
    }
}

// Set token expiry time
function setTokenExpiry() {
    const expiryTime = new Date().getTime() + SESSION_DURATION;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

// Update UI based on login status
function updateUIForLoggedInUser() {
    if (isLoggedIn && currentUser) {
        // Change login button to user menu
        if (loginBtn) {
            loginBtn.textContent = currentUser.username;
            loginBtn.classList.add('logged-in');
        }
        
        // Change get started buttons to dashboard buttons
        if (getStartedBtn) getStartedBtn.textContent = 'Dashboard';
        if (heroGetStartedBtn) heroGetStartedBtn.textContent = 'Go to Dashboard';
        
        // Update other buttons as needed
        document.querySelectorAll('.btn-plan, .btn-plan-primary').forEach(btn => {
            btn.textContent = 'Select Plan';
        });
    } else {
        // Reset to default state
        if (loginBtn) {
            loginBtn.textContent = 'Log In';
            loginBtn.classList.remove('logged-in');
        }
        if (getStartedBtn) getStartedBtn.textContent = 'Get Started';
        if (heroGetStartedBtn) heroGetStartedBtn.textContent = 'Get Started Free';
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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
        
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        // Set token expiry
        setTokenExpiry();
        
        // Update state
        currentUser = data.user;
        isLoggedIn = true;
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal
        closeModal(loginModal);
        
        // Show success message
        showMessage('Login successful! Welcome back.', 'success');
        
        // Track login event
        trackEvent('login_success', { username });
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('credentials')) {
            showMessage('Invalid username or password. Please try again.', 'error');
        } else if (error.name === 'TypeError' || error.name === 'NetworkError') {
            showMessage('Network error. Please check your connection and try again.', 'error');
        } else {
            showMessage(error.message || 'Login failed. Please try again.', 'error');
        }
        
        // Track login failure
        trackEvent('login_failure', { error: error.message });
        
        return false;
    }
}

async function registerUser(username, email, password) {
    try {
        // Validate input
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (!validatePassword(password)) {
            showMessage('Password must be at least 8 characters and include a number.', 'error');
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed. Please try again.');
        }
        
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        // Set token expiry
        setTokenExpiry();
        
        // Update state
        currentUser = data.user;
        isLoggedIn = true;
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal
        closeModal(registerModal);
        
        // Show success message
        showMessage('Registration successful! Welcome to JobPrep.', 'success');
        
        // Track registration event
        trackEvent('registration_success', { username });
        
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.message.includes('username') && error.message.includes('taken')) {
            showMessage('Username already taken. Please choose another.', 'error');
        } else if (error.message.includes('email') && error.message.includes('taken')) {
            showMessage('Email already registered. Please use another or log in.', 'error');
        } else if (error.name === 'TypeError' || error.name === 'NetworkError') {
            showMessage('Network error. Please check your connection and try again.', 'error');
        } else {
            showMessage(error.message || 'Registration failed. Please try again.', 'error');
        }
        
        // Track registration failure
        trackEvent('registration_failure', { error: error.message });
        
        return false;
    }
}

function logout() {
    // Attempt to notify backend about logout
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        // Fire and forget - don't wait for response
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.error('Logout notification error:', error);
            // Non-blocking error - continue with local logout
        });
    }
    
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // Update state
    currentUser = null;
    isLoggedIn = false;
    
    // Update UI
    updateUIForLoggedInUser();
    
    // Show message
    showMessage('You have been logged out.', 'success');
    
    // Track logout event
    trackEvent('logout');
}

// Validation Helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 8 characters and contains a number
    return password.length >= 8 && /\d/.test(password);
}

// Analytics
function trackEvent(eventName, eventData = {}) {
    try {
        // Don't block on analytics
        setTimeout(() => {
            sendAnalyticsData(eventName, {
                ...eventData,
                timestamp: new Date().toISOString()
            });
        }, 0);
    } catch (error) {
        console.error('Analytics error:', error);
        // Don't show user-facing errors for analytics
    }
}

async function sendAnalyticsData(type, data) {
    try {
        await fetch(`${API_BASE_URL}/analytics/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Analytics error:', error);
        // Don't show user-facing errors for analytics
    }
}

// UI Helpers
function showModal(modal) {
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal(modal) {
    if (!modal) return;
    
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
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    
    // Add to body
    document.body.appendChild(message);
    
    // Style the message
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.zIndex = '2000';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '4px';
    message.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Set colors based on type
    if (type === 'error') {
        message.style.backgroundColor = '#f44336';
        message.style.color = 'white';
    } else if (type === 'success') {
        message.style.backgroundColor = '#4CAF50';
        message.style.color = 'white';
    } else if (type === 'info') {
        message.style.backgroundColor = '#2196F3';
        message.style.color = 'white';
    } else if (type === 'warning') {
        message.style.backgroundColor = '#ff9800';
        message.style.color = 'white';
    }
    
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

// Periodic token validation
function setupTokenRefresh() {
    // Check token validity every 15 minutes
    const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
    
    setInterval(async () => {
        if (isLoggedIn) {
            try {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) {
                    const isValid = await validateToken(token);
                    if (!isValid) {
                        logout();
                        showMessage('Your session has expired. Please log in again.', 'info');
                    }
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                // Don't logout on network errors
            }
        }
    }, REFRESH_INTERVAL);
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
    
    // Handle offline/online events
    window.addEventListener('online', function() {
        showMessage('You are back online.', 'success');
        // Validate token when coming back online
        checkLoginStatus();
    });
    
    window.addEventListener('offline', function() {
        showMessage('You are offline. Some features may be unavailable.', 'warning');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    // Check login status
    await checkLoginStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up token refresh
    setupTokenRefresh();
    
    // Log initialization
    console.log('JobPrep minimal site initialized');
});
