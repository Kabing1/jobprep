// auth-service.js - Updated to integrate with Dashboard

/**
 * Authentication Service Module
 * This module provides authentication functionality for JobPrep,
 * including login, registration, and session management.
 */

// Authentication state
let isAuthenticated = false;
let currentUser = null;

/**
 * Initialize the authentication service
 */
function initAuthService() {
  console.log('Initializing authentication service');
  
  // Check for existing session
  checkAuthState();
  
  // Set up event listeners
  setupAuthEventListeners();
}

/**
 * Check authentication state
 */
function checkAuthState() {
  // Get session data if available
  if (typeof SessionManager !== 'undefined') {
    const sessionData = SessionManager.getData();
    
    if (sessionData && sessionData.token && sessionData.user) {
      // User is authenticated
      isAuthenticated = true;
      currentUser = sessionData.user;
      console.log('User is authenticated:', currentUser.username);
      
      // Update UI for logged in user
      updateUIForLoggedInUser();
    } else {
      // User is not authenticated
      isAuthenticated = false;
      currentUser = null;
      console.log('User is not authenticated');
      
      // Update UI for logged out user
      updateUIForLoggedOutUser();
    }
  } else {
    console.error('SessionManager not available');
  }
}

/**
 * Set up authentication event listeners
 */
function setupAuthEventListeners() {
  // Login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      login(username, password);
    });
  }
  
  // Registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const username = document.getElementById('regUsername').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate passwords match
      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }
      
      register(username, email, password);
    });
  }
  
  // Login button click
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      showLoginModal();
    });
  }
  
  // Get started button click
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function() {
      if (isAuthenticated) {
        // If user is already logged in, show dashboard
        showDashboard();
      } else {
        // Otherwise show registration modal
        showRegisterModal();
      }
    });
  }
  
  // Hero get started button click
  const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
  if (heroGetStartedBtn) {
    heroGetStartedBtn.addEventListener('click', function() {
      if (isAuthenticated) {
        // If user is already logged in, show dashboard
        showDashboard();
      } else {
        // Otherwise show registration modal
        showRegisterModal();
      }
    });
  }
  
  // CTA button click
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      if (isAuthenticated) {
        // If user is already logged in, show dashboard
        showDashboard();
      } else {
        // Otherwise show registration modal
        showRegisterModal();
      }
    });
  }
  
  // Show register link click
  const showRegisterLink = document.getElementById('showRegisterLink');
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', function(event) {
      event.preventDefault();
      hideLoginModal();
      showRegisterModal();
    });
  }
  
  // Show login link click
  const showLoginLink = document.getElementById('showLoginLink');
  if (showLoginLink) {
    showLoginLink.addEventListener('click', function(event) {
      event.preventDefault();
      hideRegisterModal();
      showLoginModal();
    });
  }
  
  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(function(button) {
    button.addEventListener('click', function() {
      hideAllModals();
    });
  });
  
  // Listen for session changes
  window.addEventListener('sessionChange', function(event) {
    console.log('Session change event:', event.detail);
    checkAuthState();
  });
}

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 */
async function login(username, password) {
  console.log('Attempting login for user:', username);
  
  try {
    // Prepare request data
    const requestData = {
      username,
      password
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Parse response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Login successful
    console.log('Login successful:', data);
    
    // Store session data
    if (typeof SessionManager !== 'undefined') {
      SessionManager.start(data.user, data.token);
    } else {
      console.error('SessionManager not available');
    }
    
    // Update authentication state
    isAuthenticated = true;
    currentUser = data.user;
    
    // Show success message
    showMessage('Login successful', 'success');
    
    // Hide login modal
    hideLoginModal();
    
    // Update UI for logged in user
    updateUIForLoggedInUser();
    
    // Show dashboard
    showDashboard();
    
    // Track login event
    trackEvent('login_success', { username });
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    
    // Show error message
    showMessage(error.message || 'Login failed', 'error');
    
    // Track login error
    trackEvent('login_error', { error: error.message });
    
    return false;
  }
}

/**
 * Register user
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 */
async function register(username, email, password) {
  console.log('Attempting registration for user:', username);
  
  try {
    // Prepare request data
    const requestData = {
      username,
      email,
      password
    };
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Parse response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Registration successful
    console.log('Registration successful:', data);
    
    // Store session data
    if (typeof SessionManager !== 'undefined') {
      SessionManager.start(data.user, data.token);
    } else {
      console.error('SessionManager not available');
    }
    
    // Update authentication state
    isAuthenticated = true;
    currentUser = data.user;
    
    // Show success message
    showMessage('Registration successful', 'success');
    
    // Hide registration modal
    hideRegisterModal();
    
    // Update UI for logged in user
    updateUIForLoggedInUser();
    
    // Show dashboard
    showDashboard();
    
    // Track registration event
    trackEvent('registration_success', { username });
    
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Show error message
    showMessage(error.message || 'Registration failed', 'error');
    
    // Track registration error
    trackEvent('registration_error', { error: error.message });
    
    return false;
  }
}

/**
 * Logout user
 */
async function logout() {
  console.log('Logging out user');
  
  try {
    // Get token
    const sessionData = typeof SessionManager !== 'undefined' ? SessionManager.getData() : null;
    const token = sessionData ? sessionData.token : null;
    
    if (token) {
      // Make API request to logout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // End session
    if (typeof SessionManager !== 'undefined') {
      SessionManager.end('logout');
    } else {
      console.error('SessionManager not available');
    }
    
    // Update authentication state
    isAuthenticated = false;
    currentUser = null;
    
    // Show success message
    showMessage('Logged out successfully', 'success');
    
    // Update UI for logged out user
    updateUIForLoggedOutUser();
    
    // Hide dashboard if visible
    hideDashboard();
    
    // Track logout event
    trackEvent('logout');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Show error message
    showMessage('Error logging out', 'error');
    
    // Track logout error
    trackEvent('logout_error', { error: error.message });
    
    return false;
  }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
  if (!isAuthenticated || !currentUser) {
    return;
  }
  
  console.log('Updating UI for logged in user:', currentUser.username);
  
  // Update login button
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.textContent = 'My Account';
    loginBtn.removeEventListener('click', showLoginModal);
    loginBtn.addEventListener('click', showDashboard);
  }
  
  // Update get started button
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.textContent = 'Dashboard';
    getStartedBtn.removeEventListener('click', showRegisterModal);
    getStartedBtn.addEventListener('click', showDashboard);
  }
  
  // Update hero get started button
  const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
  if (heroGetStartedBtn) {
    heroGetStartedBtn.textContent = 'Go to Dashboard';
    heroGetStartedBtn.removeEventListener('click', showRegisterModal);
    heroGetStartedBtn.addEventListener('click', showDashboard);
  }
  
  // Update CTA button
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
    ctaButton.textContent = 'Go to Dashboard';
    ctaButton.removeEventListener('click', showRegisterModal);
    ctaButton.addEventListener('click', showDashboard);
  }
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
  console.log('Updating UI for logged out user');
  
  // Update login button
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.textContent = 'Log In';
    loginBtn.removeEventListener('click', showDashboard);
    loginBtn.addEventListener('click', showLoginModal);
  }
  
  // Update get started button
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.textContent = 'Get Started';
    getStartedBtn.removeEventListener('click', showDashboard);
    getStartedBtn.addEventListener('click', showRegisterModal);
  }
  
  // Update hero get started button
  const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
  if (heroGetStartedBtn) {
    heroGetStartedBtn.textContent = 'Get Started Free';
    heroGetStartedBtn.removeEventListener('click', showDashboard);
    heroGetStartedBtn.addEventListener('click', showRegisterModal);
  }
  
  // Update CTA button
  const ctaButton = document.getElementById('ctaButton');
  if (ctaButton) {
    ctaButton.textContent = 'Get Started Today';
    ctaButton.removeEventListener('click', showDashboard);
    ctaButton.addEventListener('click', showRegisterModal);
  }
}

/**
 * Show login modal
 */
function showLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'block';
    
    // Focus username field
    setTimeout(() => {
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 100);
  }
}

/**
 * Hide login modal
 */
function hideLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'none';
    
    // Reset form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.reset();
    }
  }
}

/**
 * Show registration modal
 */
function showRegisterModal() {
  const registerModal = document.getElementById('registerModal');
  if (registerModal) {
    registerModal.style.display = 'block';
    
    // Focus username field
    setTimeout(() => {
      const usernameInput = document.getElementById('regUsername');
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 100);
  }
}

/**
 * Hide registration modal
 */
function hideRegisterModal() {
  const registerModal = document.getElementById('registerModal');
  if (registerModal) {
    registerModal.style.display = 'none';
    
    // Reset form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.reset();
    }
  }
}

/**
 * Hide all modals
 */
function hideAllModals() {
  hideLoginModal();
  hideRegisterModal();
}

/**
 * Show dashboard
 */
function showDashboard() {
  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    console.error('Cannot show dashboard: User not authenticated');
    showMessage('Please log in to access your dashboard', 'error');
    showLoginModal();
    return;
  }
  
  // Check if Dashboard module is available
  if (typeof Dashboard !== 'undefined') {
    Dashboard.show();
  } else {
    console.error('Dashboard module not available');
    showMessage('Dashboard is not available', 'error');
  }
}

/**
 * Hide dashboard
 */
function hideDashboard() {
  // Check if Dashboard module is available
  if (typeof Dashboard !== 'undefined') {
    Dashboard.hide();
  }
}

/**
 * Track event
 * @param {string} eventName - Event name
 * @param {Object} eventData - Event data
 */
function trackEvent(eventName, eventData = {}) {
  // Add timestamp
  const data = {
    ...eventData,
    timestamp: new Date().toISOString()
  };
  
  // Log event
  console.log('Tracking event:', eventName, data);
  
  // Send to analytics endpoint
  try {
    fetch(`${API_BASE_URL}/analytics/${eventName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Export the authentication service module
const AuthService = {
  init: initAuthService,
  login,
  register,
  logout,
  isAuthenticated: () => isAuthenticated,
  getCurrentUser: () => currentUser,
  updateUIForLoggedInUser,
  updateUIForLoggedOutUser,
  showDashboard,
  hideDashboard
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
} else if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}
