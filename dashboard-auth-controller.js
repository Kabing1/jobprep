/**
 * Dashboard Authentication Controller
 * This module ensures the dashboard is only displayed for properly authenticated users
 * and prevents unauthorized access while maintaining site responsiveness.
 */

// Execute immediately when loaded
(function() {
  console.log('Dashboard Authentication Controller loaded');
  
  // Only set up event listeners, but don't automatically check on load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up dashboard authentication');
    setupDashboardAuthentication();
  });
  
  // Override any showMessage calls that might show "coming soon"
  const originalShowMessage = window.showMessage;
  window.showMessage = function(text, type) {
    // Intercept any "coming soon" messages related to dashboard
    if (typeof text === 'string' && 
        (text.includes('coming soon') || text.includes('Dashboard functionality'))) {
      console.log('Intercepted "coming soon" message:', text);
      
      // Check if user is properly authenticated
      if (isUserAuthenticated()) {
        console.log('User is authenticated, showing dashboard instead of message');
        setTimeout(function() {
          if (typeof window.showDashboard === 'function') {
            window.showDashboard();
          }
        }, 0);
        return;
      }
    }
    
    // Call original function for other messages
    if (originalShowMessage) {
      originalShowMessage(text, type);
    }
  };
})();

/**
 * Set up dashboard authentication
 */
function setupDashboardAuthentication() {
  console.log('Setting up dashboard authentication');
  
  // Listen for login events
  window.addEventListener('storage', function(event) {
    if (event.key === 'jobprep_token' || event.key === 'jobprep_user') {
      console.log('Storage change detected, checking authentication');
      // Don't automatically show dashboard, let the login process handle it
    }
  });
}

/**
 * Check if user is properly authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
function isUserAuthenticated() {
  console.log('Checking user authentication');
  
  // Get token and user data
  const token = localStorage.getItem('jobprep_token');
  const user = localStorage.getItem('jobprep_user');
  const tokenExpiry = localStorage.getItem('jobprep_token_expiry');
  
  // Basic validation
  if (!token || !user) {
    console.log('No token or user data found');
    return false;
  }
  
  // Check token expiry
  if (tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry);
    const currentTime = new Date().getTime();
    
    if (currentTime > expiryTime) {
      console.log('Token has expired');
      return false;
    }
  }
  
  // Validate token format (basic check)
  if (!token.startsWith('mock-token-')) {
    console.log('Invalid token format');
    return false;
  }
  
  // Validate user data
  try {
    const userData = JSON.parse(user);
    if (!userData || !userData.username) {
      console.log('Invalid user data');
      return false;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
  
  console.log('User is authenticated');
  return true;
}

/**
 * Remove any "coming soon" messages
 */
function removeComingSoonMessages() {
  console.log('Removing any "coming soon" messages');
  
  // Find and remove any elements containing "coming soon" text
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => {
    if (message.textContent.toLowerCase().includes('coming soon')) {
      console.log('Found "coming soon" message, removing:', message);
      message.remove();
    }
  });
}
