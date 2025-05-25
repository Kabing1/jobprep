// dashboard.js - User Dashboard functionality for JobPrep

/**
 * Dashboard Module
 * This module provides the functionality for the user dashboard,
 * including personalized content, activity tracking, and feature access.
 */

// Dashboard state
let dashboardInitialized = false;
let userStats = null;
let recentActivity = [];
let savedDocuments = [];

/**
 * Initialize the dashboard
 * @param {Object} userData - User data from authentication
 */
function initDashboard(userData) {
  if (!userData) {
    console.error('Cannot initialize dashboard: No user data provided');
    return;
  }
  
  console.log('Initializing dashboard for user:', userData.username);
  
  // Set up dashboard elements
  setupDashboardUI();
  
  // Load user data and statistics
  loadUserData(userData);
  
  // Set up event listeners
  setupDashboardEvents();
  
  // Mark as initialized
  dashboardInitialized = true;
  
  // Show welcome message
  showWelcomeMessage(userData.username);
}

/**
 * Set up dashboard UI elements
 */
function setupDashboardUI() {
  // Create dashboard container if it doesn't exist
  if (!document.getElementById('dashboard')) {
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
}

/**
 * Load user data and statistics
 * @param {Object} userData - User data from authentication
 */
function loadUserData(userData) {
  // In a real implementation, this would fetch data from the backend
  // For now, we'll use mock data
  
  // Mock user statistics
  userStats = {
    resumeCount: Math.floor(Math.random() * 5),
    letterCount: Math.floor(Math.random() * 3),
    interviewCount: Math.floor(Math.random() * 10)
  };
  
  // Update UI with statistics
  document.getElementById('resumeCount').textContent = userStats.resumeCount;
  document.getElementById('letterCount').textContent = userStats.letterCount;
  document.getElementById('interviewCount').textContent = userStats.interviewCount;
  
  // Mock recent activity
  recentActivity = [
    { type: 'resume', action: 'created', name: 'Software Developer Resume', date: new Date(Date.now() - 86400000) },
    { type: 'letter', action: 'updated', name: 'Google Application', date: new Date(Date.now() - 172800000) },
    { type: 'interview', action: 'completed', name: 'Mock Technical Interview', date: new Date(Date.now() - 259200000) }
  ];
  
  // Update activity list
  updateActivityList();
  
  // Mock saved documents
  savedDocuments = [
    { type: 'resume', name: 'Software Developer Resume', lastModified: new Date(Date.now() - 86400000) },
    { type: 'resume', name: 'Project Manager Resume', lastModified: new Date(Date.now() - 1728000000) },
    { type: 'letter', name: 'Google Application', lastModified: new Date(Date.now() - 172800000) },
    { type: 'letter', name: 'Microsoft Cover Letter', lastModified: new Date(Date.now() - 2592000000) }
  ];
  
  // Update documents list
  updateDocumentsList();
}

/**
 * Update the activity list in the UI
 */
function updateActivityList() {
  const activityList = document.getElementById('activityList');
  
  if (!activityList) {
    console.error('Activity list element not found');
    return;
  }
  
  // Clear existing items
  activityList.innerHTML = '';
  
  if (recentActivity.length === 0) {
    activityList.innerHTML = '<li class="activity-empty">No recent activity</li>';
    return;
  }
  
  // Add activity items
  recentActivity.forEach(activity => {
    const li = document.createElement('li');
    li.className = `activity-item activity-${activity.type}`;
    
    // Format date
    const formattedDate = formatDate(activity.date);
    
    li.innerHTML = `
      <span class="activity-icon"></span>
      <div class="activity-details">
        <span class="activity-title">${activity.action} ${activity.name}</span>
        <span class="activity-date">${formattedDate}</span>
      </div>
    `;
    
    activityList.appendChild(li);
  });
}

/**
 * Update the documents list in the UI
 */
function updateDocumentsList() {
  const documentsList = document.getElementById('documentsList');
  
  if (!documentsList) {
    console.error('Documents list element not found');
    return;
  }
  
  // Clear existing items
  documentsList.innerHTML = '';
  
  if (savedDocuments.length === 0) {
    documentsList.innerHTML = '<li class="documents-empty">No saved documents</li>';
    return;
  }
  
  // Add document items
  savedDocuments.forEach(doc => {
    const li = document.createElement('li');
    li.className = `document-item document-${doc.type}`;
    
    // Format date
    const formattedDate = formatDate(doc.lastModified);
    
    li.innerHTML = `
      <span class="document-icon"></span>
      <div class="document-details">
        <span class="document-title">${doc.name}</span>
        <span class="document-date">Last modified: ${formattedDate}</span>
      </div>
      <div class="document-actions">
        <button class="btn-icon btn-edit" title="Edit" data-document="${doc.name}">
          <span class="icon-edit"></span>
        </button>
        <button class="btn-icon btn-delete" title="Delete" data-document="${doc.name}">
          <span class="icon-delete"></span>
        </button>
      </div>
    `;
    
    documentsList.appendChild(li);
  });
  
  // Add event listeners to document action buttons
  setupDocumentActionListeners();
}

/**
 * Set up event listeners for document actions
 */
function setupDocumentActionListeners() {
  // Edit buttons
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', function() {
      const documentName = this.getAttribute('data-document');
      editDocument(documentName);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function() {
      const documentName = this.getAttribute('data-document');
      deleteDocument(documentName);
    });
  });
}

/**
 * Edit a document
 * @param {string} documentName - Name of the document to edit
 */
function editDocument(documentName) {
  console.log('Editing document:', documentName);
  showMessage(`Opening ${documentName} for editing...`, 'info');
  
  // In a real implementation, this would open the document editor
  // For now, we'll just show a message
  
  // Add to recent activity
  addActivity('document', 'edited', documentName);
}

/**
 * Delete a document
 * @param {string} documentName - Name of the document to delete
 */
function deleteDocument(documentName) {
  console.log('Deleting document:', documentName);
  
  // Confirm deletion
  if (confirm(`Are you sure you want to delete "${documentName}"?`)) {
    // Remove from saved documents
    savedDocuments = savedDocuments.filter(doc => doc.name !== documentName);
    
    // Update UI
    updateDocumentsList();
    
    // Show success message
    showMessage(`Deleted "${documentName}"`, 'success');
    
    // Add to recent activity
    addActivity('document', 'deleted', documentName);
  }
}

/**
 * Add a new activity to the recent activity list
 * @param {string} type - Activity type
 * @param {string} action - Activity action
 * @param {string} name - Activity name
 */
function addActivity(type, action, name) {
  // Add to beginning of array
  recentActivity.unshift({
    type,
    action,
    name,
    date: new Date()
  });
  
  // Limit to 10 most recent activities
  if (recentActivity.length > 10) {
    recentActivity.pop();
  }
  
  // Update UI
  updateActivityList();
}

/**
 * Format a date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Set up dashboard event listeners
 */
function setupDashboardEvents() {
  // Quick action buttons
  document.getElementById('newResumeBtn').addEventListener('click', () => {
    console.log('New resume button clicked');
    showMessage('Creating new resume...', 'info');
    // In a real implementation, this would open the resume builder
    addActivity('resume', 'started', 'New Resume');
  });
  
  document.getElementById('newLetterBtn').addEventListener('click', () => {
    console.log('New cover letter button clicked');
    showMessage('Creating new cover letter...', 'info');
    // In a real implementation, this would open the cover letter generator
    addActivity('letter', 'started', 'New Cover Letter');
  });
  
  document.getElementById('practiceBtn').addEventListener('click', () => {
    console.log('Practice interview button clicked');
    showMessage('Starting interview practice...', 'info');
    // In a real implementation, this would open the interview practice tool
    addActivity('interview', 'started', 'Interview Practice');
  });
  
  // Profile settings button
  document.getElementById('profileSettingsBtn').addEventListener('click', () => {
    console.log('Profile settings button clicked');
    showMessage('Opening profile settings...', 'info');
    // In a real implementation, this would open the profile settings
  });
  
  // Logout button
  document.getElementById('logoutDashboardBtn').addEventListener('click', () => {
    console.log('Logout button clicked');
    // Use the AuthService to log out
    if (typeof AuthService !== 'undefined') {
      AuthService.logout();
    } else {
      console.error('AuthService not available');
      showMessage('Error logging out', 'error');
    }
  });
}

/**
 * Show welcome message
 * @param {string} username - Username to display
 */
function showWelcomeMessage(username) {
  const userWelcome = document.getElementById('userWelcome');
  
  if (!userWelcome) {
    console.error('User welcome element not found');
    return;
  }
  
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
  
  userWelcome.textContent = `${greeting}, ${username}!`;
}

/**
 * Show the dashboard
 */
function showDashboard() {
  // Get user data from session
  let userData = null;
  
  if (typeof SessionManager !== 'undefined') {
    const sessionData = SessionManager.getData();
    userData = sessionData?.user;
  }
  
  if (!userData) {
    console.error('Cannot show dashboard: No user data available');
    return;
  }
  
  // Initialize dashboard if needed
  if (!dashboardInitialized) {
    initDashboard(userData);
  }
  
  // Hide other content
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show dashboard
  const dashboard = document.getElementById('dashboard');
  if (dashboard) {
    dashboard.style.display = 'block';
  }
}

/**
 * Hide the dashboard
 */
function hideDashboard() {
  // Show other content
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'block';
  });
  
  // Hide dashboard
  const dashboard = document.getElementById('dashboard');
  if (dashboard) {
    dashboard.style.display = 'none';
  }
}

/**
 * Check if dashboard is visible
 * @returns {boolean} Whether dashboard is visible
 */
function isDashboardVisible() {
  const dashboard = document.getElementById('dashboard');
  return dashboard && dashboard.style.display === 'block';
}

/**
 * Update dashboard with new user data
 * @param {Object} userData - Updated user data
 */
function updateDashboard(userData) {
  if (!userData) {
    console.error('Cannot update dashboard: No user data provided');
    return;
  }
  
  // Update welcome message
  showWelcomeMessage(userData.username);
  
  // In a real implementation, this would refresh data from the backend
  console.log('Dashboard updated for user:', userData.username);
}

// Export the dashboard module
const Dashboard = {
  init: initDashboard,
  show: showDashboard,
  hide: hideDashboard,
  update: updateDashboard,
  isVisible: isDashboardVisible
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
} else if (typeof window !== 'undefined') {
  window.Dashboard = Dashboard;
}
