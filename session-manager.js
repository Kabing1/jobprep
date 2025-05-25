// session-manager.js - Session persistence for JobPrep

/**
 * Session Manager Module
 * This module handles session persistence across page reloads and browser tabs,
 * including cross-tab synchronization and offline support.
 */

// Constants
const STORAGE_KEYS = {
  TOKEN: 'jobprep_token',
  USER: 'jobprep_user',
  TOKEN_EXPIRY: 'jobprep_token_expiry',
  LAST_ACTIVE: 'jobprep_last_active',
  SESSION_ID: 'jobprep_session_id'
};

// Default session configuration
const sessionConfig = {
  // Session duration in milliseconds (24 hours)
  sessionDuration: 24 * 60 * 60 * 1000,
  
  // Activity check interval in milliseconds (1 minute)
  activityCheckInterval: 60 * 1000,
  
  // Inactivity timeout in milliseconds (30 minutes)
  inactivityTimeout: 30 * 60 * 1000,
  
  // Whether to extend session on activity
  extendOnActivity: true,
  
  // Whether to synchronize across tabs
  syncAcrossTabs: true,
  
  // Whether to persist session in offline mode
  persistOffline: true
};

// Session state
let sessionActive = false;
let activityInterval = null;
let lastActivity = Date.now();
let sessionId = null;

/**
 * Initialize session manager
 * @param {Object} config - Optional configuration overrides
 */
function initSessionManager(config = {}) {
  // Merge configuration
  Object.assign(sessionConfig, config);
  
  // Generate or retrieve session ID
  sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID) || generateSessionId();
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  
  // Set up activity tracking
  setupActivityTracking();
  
  // Set up storage event listener for cross-tab synchronization
  if (sessionConfig.syncAcrossTabs) {
    setupStorageEventListener();
  }
  
  // Check initial session state
  checkSession();
  
  console.log('Session manager initialized with ID:', sessionId);
}

/**
 * Generate a unique session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Set up activity tracking
 */
function setupActivityTracking() {
  // Update last activity time on user interactions
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  activityEvents.forEach(eventType => {
    window.addEventListener(eventType, updateLastActivity, { passive: true });
  });
  
  // Start activity check interval
  startActivityCheck();
}

/**
 * Update last activity timestamp
 */
function updateLastActivity() {
  lastActivity = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, lastActivity.toString());
  
  // Extend session if configured
  if (sessionConfig.extendOnActivity && isSessionActive()) {
    extendSession();
  }
}

/**
 * Start activity check interval
 */
function startActivityCheck() {
  // Clear any existing interval
  if (activityInterval) {
    clearInterval(activityInterval);
  }
  
  // Set up new interval
  activityInterval = setInterval(() => {
    const inactiveTime = Date.now() - lastActivity;
    
    // Check for inactivity timeout
    if (inactiveTime > sessionConfig.inactivityTimeout && isSessionActive()) {
      console.log('Inactivity timeout reached, ending session');
      endSession('inactivity');
    }
  }, sessionConfig.activityCheckInterval);
}

/**
 * Set up storage event listener for cross-tab synchronization
 */
function setupStorageEventListener() {
  window.addEventListener('storage', event => {
    // Handle token changes from other tabs
    if (event.key === STORAGE_KEYS.TOKEN) {
      if (!event.newValue && sessionActive) {
        // Token was removed in another tab
        sessionActive = false;
        notifySessionChange('ended_in_other_tab');
      } else if (event.newValue && !sessionActive) {
        // Token was added in another tab
        checkSession();
      }
    }
    
    // Handle last activity updates from other tabs
    if (event.key === STORAGE_KEYS.LAST_ACTIVE && event.newValue) {
      lastActivity = parseInt(event.newValue);
    }
  });
}

/**
 * Check if session is active
 * @returns {boolean} Whether session is active
 */
function isSessionActive() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  
  if (!token) {
    return false;
  }
  
  // Check token expiry
  if (tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry);
    if (Date.now() > expiryTime) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check and update session state
 */
function checkSession() {
  const wasActive = sessionActive;
  sessionActive = isSessionActive();
  
  // Notify if session state changed
  if (wasActive !== sessionActive) {
    notifySessionChange(sessionActive ? 'started' : 'ended');
  }
}

/**
 * Start a new session
 * @param {Object} userData - User data to store
 * @param {string} token - Authentication token
 */
function startSession(userData, token) {
  // Store session data
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  
  // Set token expiry
  setTokenExpiry();
  
  // Update activity timestamp
  updateLastActivity();
  
  // Update session state
  sessionActive = true;
  
  // Notify session started
  notifySessionChange('started');
  
  console.log('Session started for user:', userData.username);
}

/**
 * End the current session
 * @param {string} reason - Reason for ending session
 */
function endSession(reason = 'logout') {
  // Clear session data
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  
  // Update session state
  sessionActive = false;
  
  // Notify session ended
  notifySessionChange('ended', { reason });
  
  console.log('Session ended, reason:', reason);
}

/**
 * Extend the current session
 */
function extendSession() {
  if (!isSessionActive()) {
    return;
  }
  
  // Update token expiry
  setTokenExpiry();
  
  console.log('Session extended');
}

/**
 * Set token expiry time
 */
function setTokenExpiry() {
  const expiryTime = Date.now() + sessionConfig.sessionDuration;
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
}

/**
 * Notify about session state changes
 * @param {string} event - Event type
 * @param {Object} data - Additional data
 */
function notifySessionChange(event, data = {}) {
  // Create custom event
  const customEvent = new CustomEvent('sessionChange', {
    detail: {
      event,
      sessionId,
      timestamp: Date.now(),
      ...data
    }
  });
  
  // Dispatch event
  window.dispatchEvent(customEvent);
  
  // Call appropriate handler in AuthService if available
  if (typeof AuthService !== 'undefined') {
    if (event === 'started') {
      AuthService.updateUIForLoggedInUser();
    } else if (event === 'ended') {
      // Only update UI, don't call logout again to avoid loops
      if (data.reason !== 'logout') {
        AuthService.updateUIForLoggedInUser();
      }
    }
  }
}

/**
 * Get current session data
 * @returns {Object} Session data
 */
function getSessionData() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    
    if (!token || !userJson) {
      return null;
    }
    
    const user = JSON.parse(userJson);
    
    return {
      token,
      user,
      tokenExpiry: tokenExpiry ? parseInt(tokenExpiry) : null,
      sessionId,
      lastActivity
    };
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

/**
 * Check if session is about to expire
 * @param {number} warningThreshold - Warning threshold in milliseconds
 * @returns {boolean} Whether session is about to expire
 */
function isSessionExpiringSoon(warningThreshold = 5 * 60 * 1000) {
  const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  
  if (!tokenExpiry) {
    return false;
  }
  
  const expiryTime = parseInt(tokenExpiry);
  const timeRemaining = expiryTime - Date.now();
  
  return timeRemaining > 0 && timeRemaining < warningThreshold;
}

// Export the session manager module
const SessionManager = {
  init: initSessionManager,
  isActive: isSessionActive,
  start: startSession,
  end: endSession,
  extend: extendSession,
  getData: getSessionData,
  isExpiringSoon: isSessionExpiringSoon,
  config: sessionConfig
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
} else if (typeof window !== 'undefined') {
  window.SessionManager = SessionManager;
}
