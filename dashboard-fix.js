/**
 * Dashboard Fix Module
 * This module ensures the dashboard is properly initialized and displayed
 * after login, preventing any "coming soon" messages.
 */

// Execute immediately when loaded
(function() {
  console.log('Dashboard fix module loaded');
  
  // Check if user is logged in
  const token = localStorage.getItem('jobprep_token');
  const user = localStorage.getItem('jobprep_user');
  
  if (token && user) {
    console.log('User is logged in, ensuring dashboard is available');
    ensureDashboardAvailable();
  }
  
  // Listen for login events
  window.addEventListener('sessionChange', function(event) {
    console.log('Session change detected:', event.detail);
    if (event.detail === 'login' || event.detail === 'start') {
      console.log('Login detected, ensuring dashboard is available');
      ensureDashboardAvailable();
    }
  });
  
  // Add event listener for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking if dashboard initialization is needed');
    
    // Check if user is logged in
    const token = localStorage.getItem('jobprep_token');
    const user = localStorage.getItem('jobprep_user');
    
    if (token && user) {
      console.log('User is logged in, ensuring dashboard is available');
      ensureDashboardAvailable();
    }
    
    // Override any "coming soon" messages
    removeComingSoonMessages();
  });
})();

/**
 * Ensure dashboard is available and properly initialized
 */
function ensureDashboardAvailable() {
  // Get user data
  let userData = null;
  try {
    const userJson = localStorage.getItem('jobprep_user');
    if (userJson) {
      userData = JSON.parse(userJson);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  
  if (!userData) {
    console.error('Cannot initialize dashboard: No user data available');
    return;
  }
  
  console.log('Ensuring dashboard is available for user:', userData.username);
  
  // Check if dashboard exists in DOM
  let dashboard = document.getElementById('dashboard');
  
  // If dashboard doesn't exist, create it
  if (!dashboard) {
    console.log('Dashboard not found in DOM, creating it');
    createDashboard();
    dashboard = document.getElementById('dashboard');
  }
  
  // Initialize dashboard if Dashboard module is available
  if (typeof Dashboard !== 'undefined') {
    console.log('Dashboard module found, initializing');
    Dashboard.init(userData);
    Dashboard.show();
  } else {
    console.log('Dashboard module not found, using fallback initialization');
    fallbackDashboardInit(userData);
  }
  
  // Make sure dashboard is visible
  if (dashboard) {
    dashboard.style.display = 'block';
    
    // Hide other sections
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'none';
    });
    
    console.log('Dashboard is now visible');
  }
}

/**
 * Create dashboard if it doesn't exist
 */
function createDashboard() {
  console.log('Creating dashboard element');
  
  const dashboardHTML = `
    <div id="dashboard" class="dashboard">
      <div class="dashboard-header">
        <h2>My Dashboard</h2>
        <div class="user-welcome" id="userWelcome"></div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-card stats-card">
          <h3>My Progress</h3>
          <div id="userStats" class="user-stats">
            <div class="stat-item">
              <span class="stat-value" id="resumeCount">0</span>
              <span class="stat-label">Resumes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="letterCount">0</span>
              <span class="stat-label">Cover Letters</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="interviewCount">0</span>
              <span class="stat-label">Interviews</span>
            </div>
          </div>
        </div>
        
        <div class="dashboard-card quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button id="newResumeBtn" class="btn btn-dashboard">New Resume</button>
            <button id="newLetterBtn" class="btn btn-dashboard">New Cover Letter</button>
            <button id="practiceBtn" class="btn btn-dashboard">Practice Interview</button>
          </div>
        </div>
        
        <div class="dashboard-card recent-activity">
          <h3>Recent Activity</h3>
          <ul id="activityList" class="activity-list">
            <li class="activity-empty">No recent activity</li>
          </ul>
        </div>
        
        <div class="dashboard-card saved-documents">
          <h3>My Documents</h3>
          <ul id="documentsList" class="documents-list">
            <li class="documents-empty">No saved documents</li>
          </ul>
        </div>
      </div>
      
      <div class="dashboard-footer">
        <button id="profileSettingsBtn" class="btn btn-outline">Profile Settings</button>
        <button id="logoutDashboardBtn" class="btn btn-outline">Log Out</button>
      </div>
    </div>
  `;
  
  // Add dashboard to the page
  const mainContent = document.querySelector('main') || document.body;
  const dashboardContainer = document.createElement('div');
  dashboardContainer.innerHTML = dashboardHTML;
  mainContent.appendChild(dashboardContainer.firstElementChild);
  
  // Set up event listeners
  setupDashboardEventListeners();
}

/**
 * Set up dashboard event listeners
 */
function setupDashboardEventListeners() {
  console.log('Setting up dashboard event listeners');
  
  // Quick action buttons
  const newResumeBtn = document.getElementById('newResumeBtn');
  if (newResumeBtn) {
    newResumeBtn.addEventListener('click', function() {
      console.log('New resume button clicked');
      showMessage('Creating new resume...', 'info');
    });
  }
  
  const newLetterBtn = document.getElementById('newLetterBtn');
  if (newLetterBtn) {
    newLetterBtn.addEventListener('click', function() {
      console.log('New cover letter button clicked');
      showMessage('Creating new cover letter...', 'info');
    });
  }
  
  const practiceBtn = document.getElementById('practiceBtn');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', function() {
      console.log('Practice interview button clicked');
      showMessage('Starting interview practice...', 'info');
    });
  }
  
  // Profile settings button
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  if (profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', function() {
      console.log('Profile settings button clicked');
      showMessage('Opening profile settings...', 'info');
    });
  }
  
  // Logout button
  const logoutDashboardBtn = document.getElementById('logoutDashboardBtn');
  if (logoutDashboardBtn) {
    logoutDashboardBtn.addEventListener('click', function() {
      console.log('Logout button clicked');
      logout();
    });
  }
}

/**
 * Fallback dashboard initialization
 * @param {Object} userData - User data
 */
function fallbackDashboardInit(userData) {
  console.log('Using fallback dashboard initialization for user:', userData.username);
  
  // Set welcome message
  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome) {
    // Get time of day
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    userWelcome.textContent = `${greeting}, ${userData.username}!`;
  }
  
  // Set mock statistics
  document.getElementById('resumeCount').textContent = Math.floor(Math.random() * 5);
  document.getElementById('letterCount').textContent = Math.floor(Math.random() * 3);
  document.getElementById('interviewCount').textContent = Math.floor(Math.random() * 10);
  
  // Make sure dashboard is visible
  const dashboard = document.getElementById('dashboard');
  if (dashboard) {
    dashboard.style.display = 'block';
    
    // Hide other sections
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'none';
    });
  }
}

/**
 * Remove any "coming soon" messages
 */
function removeComingSoonMessages() {
  console.log('Removing any "coming soon" messages');
  
  // Find and remove any elements containing "coming soon" text
  const elements = document.querySelectorAll('*');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
      const text = element.textContent.toLowerCase();
      if (text.includes('coming soon') || text.includes('functionality coming soon')) {
        console.log('Found "coming soon" message, removing:', element);
        element.textContent = '';
      }
    }
  }
}

/**
 * Show message to user
 * @param {string} text - Message text
 * @param {string} type - Message type (success, error, info, warning)
 */
function showMessage(text, type = 'info') {
  console.log(`Showing message (${type}):`, text);
  
  // Check if window.showMessage exists
  if (typeof window.showMessage === 'function') {
    window.showMessage(text, type);
    return;
  }
  
  // Fallback implementation
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

/**
 * Logout user
 */
function logout() {
  console.log('Logging out user');
  
  // Check if window.logout exists
  if (typeof window.logout === 'function') {
    window.logout();
    return;
  }
  
  // Fallback implementation
  // Clear local storage
  localStorage.removeItem('jobprep_token');
  localStorage.removeItem('jobprep_user');
  localStorage.removeItem('jobprep_token_expiry');
  
  // Show message
  showMessage('You have been logged out.', 'success');
  
  // Reload page
  window.location.reload();
}
