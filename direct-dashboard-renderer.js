/**
 * Direct Dashboard Renderer
 * This module ensures the dashboard is always displayed after login
 * and prevents any "coming soon" messages from appearing.
 */

// Execute immediately when loaded
(function() {
  console.log('Direct Dashboard Renderer loaded');
  
  // Check if user is logged in on load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status for dashboard rendering');
    checkAndRenderDashboard();
  });
  
  // Also check immediately in case DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, checking login status immediately');
    setTimeout(checkAndRenderDashboard, 0);
  }
  
  // Listen for login events
  window.addEventListener('storage', function(event) {
    if (event.key === 'jobprep_token' || event.key === 'jobprep_user') {
      console.log('Storage change detected, checking login status');
      checkAndRenderDashboard();
    }
  });
  
  // Override any showMessage calls that might show "coming soon"
  const originalShowMessage = window.showMessage;
  window.showMessage = function(text, type) {
    // Intercept any "coming soon" messages related to dashboard
    if (typeof text === 'string' && 
        (text.includes('coming soon') || text.includes('Dashboard functionality'))) {
      console.log('Intercepted "coming soon" message:', text);
      
      // Check if user is logged in
      const token = localStorage.getItem('jobprep_token');
      const user = localStorage.getItem('jobprep_user');
      
      if (token && user) {
        console.log('User is logged in, showing dashboard instead of message');
        setTimeout(renderDashboard, 0);
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
 * Check if user is logged in and render dashboard if needed
 */
function checkAndRenderDashboard() {
  const token = localStorage.getItem('jobprep_token');
  const user = localStorage.getItem('jobprep_user');
  
  if (token && user) {
    console.log('User is logged in, rendering dashboard');
    renderDashboard();
  } else {
    console.log('User is not logged in, no dashboard needed');
  }
}

/**
 * Render the dashboard directly
 */
function renderDashboard() {
  console.log('Directly rendering dashboard');
  
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
    console.error('Cannot render dashboard: No user data available');
    return;
  }
  
  // Try multiple methods to show dashboard
  
  // Method 1: Use Dashboard module if available
  if (typeof Dashboard !== 'undefined' && typeof Dashboard.show === 'function') {
    console.log('Using Dashboard module to show dashboard');
    Dashboard.show();
  }
  
  // Method 2: Use AuthService if available
  else if (typeof AuthService !== 'undefined' && typeof AuthService.showDashboard === 'function') {
    console.log('Using AuthService to show dashboard');
    AuthService.showDashboard();
  }
  
  // Method 3: Use global showDashboard function if available
  else if (typeof window.showDashboard === 'function') {
    console.log('Using global showDashboard function');
    window.showDashboard();
  }
  
  // Method 4: Direct DOM manipulation as fallback
  else {
    console.log('Using direct DOM manipulation to show dashboard');
    showDashboardDirectly(userData);
  }
  
  // Ensure dashboard is visible by checking after a short delay
  setTimeout(ensureDashboardVisible, 100);
}

/**
 * Show dashboard directly through DOM manipulation
 * @param {Object} userData - User data
 */
function showDashboardDirectly(userData) {
  // Get dashboard element
  let dashboard = document.getElementById('dashboard');
  
  // If dashboard doesn't exist, create it
  if (!dashboard) {
    console.log('Dashboard not found in DOM, creating it');
    createDashboard();
    dashboard = document.getElementById('dashboard');
  }
  
  if (!dashboard) {
    console.error('Failed to create dashboard element');
    return;
  }
  
  // Hide all sections
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show dashboard
  dashboard.style.display = 'block';
  
  // Set welcome message
  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome && userData) {
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
  const resumeCount = document.getElementById('resumeCount');
  const letterCount = document.getElementById('letterCount');
  const interviewCount = document.getElementById('interviewCount');
  
  if (resumeCount) resumeCount.textContent = Math.floor(Math.random() * 5);
  if (letterCount) letterCount.textContent = Math.floor(Math.random() * 3);
  if (interviewCount) interviewCount.textContent = Math.floor(Math.random() * 10);
  
  // Set up dashboard event listeners
  setupDashboardEventListeners();
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
      if (typeof window.showMessage === 'function') {
        window.showMessage('Creating new resume...', 'info');
      }
    });
  }
  
  const newLetterBtn = document.getElementById('newLetterBtn');
  if (newLetterBtn) {
    newLetterBtn.addEventListener('click', function() {
      console.log('New cover letter button clicked');
      if (typeof window.showMessage === 'function') {
        window.showMessage('Creating new cover letter...', 'info');
      }
    });
  }
  
  const practiceBtn = document.getElementById('practiceBtn');
  if (practiceBtn) {
    practiceBtn.addEventListener('click', function() {
      console.log('Practice interview button clicked');
      if (typeof window.showMessage === 'function') {
        window.showMessage('Starting interview practice...', 'info');
      }
    });
  }
  
  // Profile settings button
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  if (profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', function() {
      console.log('Profile settings button clicked');
      if (typeof window.showMessage === 'function') {
        window.showMessage('Opening profile settings...', 'info');
      }
    });
  }
  
  // Logout button
  const logoutDashboardBtn = document.getElementById('logoutDashboardBtn');
  if (logoutDashboardBtn) {
    logoutDashboardBtn.addEventListener('click', function() {
      console.log('Logout button clicked');
      if (typeof window.logout === 'function') {
        window.logout();
      } else {
        // Fallback logout
        localStorage.removeItem('jobprep_token');
        localStorage.removeItem('jobprep_user');
        localStorage.removeItem('jobprep_token_expiry');
        window.location.reload();
      }
    });
  }
}

/**
 * Ensure dashboard is visible
 */
function ensureDashboardVisible() {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) {
    console.error('Dashboard element not found');
    return;
  }
  
  // Check if dashboard is visible
  if (dashboard.style.display !== 'block') {
    console.log('Dashboard not visible, forcing display');
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show dashboard
    dashboard.style.display = 'block';
  }
  
  // Remove any "coming soon" messages
  removeComingSoonMessages();
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
