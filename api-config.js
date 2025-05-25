// api-config.js - Configuration for JobPrep API connectivity

/**
 * API Configuration Module
 * This module handles API configuration and provides methods to switch between
 * mock API and real backend API endpoints.
 */

// Default configuration
const config = {
  // Set to true to use mock API, false to use real backend
  useMockApi: true,
  
  // Real backend API URL - replace with your production API URL when ready
  realApiBaseUrl: 'https://api.jobprep.example.com',
  
  // API endpoints
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    validate: '/auth/validate',
    logout: '/auth/logout',
    analytics: '/analytics'
  },
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // CORS settings
  cors: {
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

/**
 * Get the base URL for API requests
 * @returns {string} The API base URL
 */
function getApiBaseUrl() {
  return config.useMockApi ? '' : config.realApiBaseUrl;
}

/**
 * Get the full URL for a specific API endpoint
 * @param {string} endpoint - The endpoint name defined in config.endpoints
 * @returns {string} The full API URL
 */
function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  const path = config.endpoints[endpoint];
  
  if (!path) {
    console.error(`Unknown API endpoint: ${endpoint}`);
    return baseUrl;
  }
  
  return baseUrl + path;
}

/**
 * Switch between mock API and real backend
 * @param {boolean} useMock - Whether to use mock API (true) or real backend (false)
 */
function setApiMode(useMock) {
  config.useMockApi = useMock;
  console.log(`API mode set to: ${useMock ? 'Mock API' : 'Real Backend'}`);
  
  // Refresh token validation when switching modes
  if (typeof checkLoginStatus === 'function') {
    checkLoginStatus();
  }
}

/**
 * Update the real backend API URL
 * @param {string} url - The new API base URL
 */
function setRealApiUrl(url) {
  config.realApiBaseUrl = url;
  console.log(`Real API URL updated to: ${url}`);
}

/**
 * Get default headers for API requests
 * @param {boolean} includeAuth - Whether to include Authorization header
 * @returns {Object} Headers object
 */
function getDefaultHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('jobprep_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Create a request options object for fetch
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} data - Request body data
 * @param {boolean} includeAuth - Whether to include Authorization header
 * @returns {Object} Request options for fetch
 */
function createRequestOptions(method, data = null, includeAuth = false) {
  const options = {
    method: method,
    headers: getDefaultHeaders(includeAuth),
    credentials: config.cors.credentials ? 'include' : 'same-origin'
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  return options;
}

// Export the API configuration module
const ApiConfig = {
  getApiBaseUrl,
  getApiUrl,
  setApiMode,
  setRealApiUrl,
  getDefaultHeaders,
  createRequestOptions,
  config
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiConfig;
} else if (typeof window !== 'undefined') {
  window.ApiConfig = ApiConfig;
}
