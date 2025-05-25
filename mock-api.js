// mock-api.js - Mock API implementation for JobPrep

/**
 * Mock API Module
 * This module provides mock implementations of backend API endpoints
 * for testing the frontend without a real backend.
 */

// Mock user database
const mockUsers = [
  { username: 'testuser', password: 'password123', email: 'test@example.com' }
];

// Mock tokens database (token -> user mapping)
const mockTokens = {};

/**
 * Initialize mock API by overriding fetch
 */
function initMockApi() {
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = function(url, options) {
    // Check if this is an API call
    if (typeof url === 'string' && url.includes('/auth/')) {
      return handleMockApiRequest(url, options);
    }
    
    // For analytics endpoints, just return success
    if (typeof url === 'string' && url.includes('/analytics/')) {
      return Promise.resolve(new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    
    // Pass through to original fetch for non-API calls
    return originalFetch(url, options);
  };
  
  console.log('Mock API initialized');
}

/**
 * Handle mock API request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<Response>} Mock response
 */
function handleMockApiRequest(url, options) {
  // Add random delay to simulate network latency (100-500ms)
  const delay = Math.floor(Math.random() * 400) + 100;
  
  return new Promise(resolve => {
    setTimeout(() => {
      // Parse URL to determine endpoint
      if (url.includes('/auth/login')) {
        resolve(handleMockLogin(options));
      } else if (url.includes('/auth/register')) {
        resolve(handleMockRegister(options));
      } else if (url.includes('/auth/validate')) {
        resolve(handleMockValidate(options));
      } else if (url.includes('/auth/logout')) {
        resolve(handleMockLogout(options));
      } else {
        // Unknown endpoint
        resolve(new Response(
          JSON.stringify({ message: 'Endpoint not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        ));
      }
    }, delay);
  });
}

/**
 * Handle mock login request
 * @param {Object} options - Request options
 * @returns {Response} Mock response
 */
function handleMockLogin(options) {
  try {
    const body = JSON.parse(options.body);
    const user = mockUsers.find(u => u.username === body.username && u.password === body.password);
    
    if (user) {
      // Generate mock token
      const token = 'mock-token-' + Date.now();
      
      // Store token -> user mapping
      mockTokens[token] = user.username;
      
      // Return success response
      return new Response(
        JSON.stringify({
          token,
          user: { username: user.username, email: user.email }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Invalid credentials
      return new Response(
        JSON.stringify({ message: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Invalid request
    return new Response(
      JSON.stringify({ message: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle mock register request
 * @param {Object} options - Request options
 * @returns {Response} Mock response
 */
function handleMockRegister(options) {
  try {
    const body = JSON.parse(options.body);
    
    // Validate required fields
    if (!body.username || !body.email || !body.password) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if username or email already exists
    const userExists = mockUsers.some(u => 
      u.username === body.username || u.email === body.email
    );
    
    if (userExists) {
      return new Response(
        JSON.stringify({ message: 'Username or email already taken' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Add to mock database
    mockUsers.push({
      username: body.username,
      password: body.password,
      email: body.email
    });
    
    // Generate mock token
    const token = 'mock-token-' + Date.now();
    
    // Store token -> user mapping
    mockTokens[token] = body.username;
    
    // Return success response
    return new Response(
      JSON.stringify({
        token,
        user: { username: body.username, email: body.email }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Invalid request
    return new Response(
      JSON.stringify({ message: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle mock token validation request
 * @param {Object} options - Request options
 * @returns {Response} Mock response
 */
function handleMockValidate(options) {
  try {
    // Extract token from Authorization header
    const authHeader = options.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Missing or invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Check if token exists in mock tokens database
    if (mockTokens[token]) {
      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Invalid request
    return new Response(
      JSON.stringify({ message: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle mock logout request
 * @param {Object} options - Request options
 * @returns {Response} Mock response
 */
function handleMockLogout(options) {
  try {
    // Extract token from Authorization header
    const authHeader = options.headers.Authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Remove token from mock tokens database
      delete mockTokens[token];
    }
    
    // Always return success, even if token wasn't found
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Invalid request, but still return success
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Reset mock API state (for testing)
 */
function resetMockApi() {
  // Reset mock users to initial state
  mockUsers.length = 0;
  mockUsers.push({ username: 'testuser', password: 'password123', email: 'test@example.com' });
  
  // Clear mock tokens
  Object.keys(mockTokens).forEach(key => delete mockTokens[key]);
  
  console.log('Mock API reset to initial state');
}

/**
 * Get mock users (for testing)
 * @returns {Array} Mock users
 */
function getMockUsers() {
  return [...mockUsers];
}

// Export the mock API module
const MockApi = {
  init: initMockApi,
  reset: resetMockApi,
  getUsers: getMockUsers
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockApi;
} else if (typeof window !== 'undefined') {
  window.MockApi = MockApi;
}
