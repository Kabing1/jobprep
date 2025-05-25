// error-handler.js - Error handling for JobPrep API requests

/**
 * Error Handler Module
 * This module provides centralized error handling for API requests
 * and user feedback mechanisms.
 */

// Error types
const ErrorTypes = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  AUTH: 'authentication',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

// Error messages
const ErrorMessages = {
  [ErrorTypes.NETWORK]: 'Network error. Please check your connection and try again.',
  [ErrorTypes.TIMEOUT]: 'Request timed out. The server is taking too long to respond.',
  [ErrorTypes.AUTH]: 'Authentication error. Please log in again.',
  [ErrorTypes.VALIDATION]: 'Validation error. Please check your input.',
  [ErrorTypes.SERVER]: 'Server error. Our team has been notified.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Determine error type from error object
 * @param {Error} error - The error object
 * @param {Response} response - Optional response object
 * @returns {string} Error type
 */
function getErrorType(error, response = null) {
  if (error.name === 'AbortError') {
    return ErrorTypes.TIMEOUT;
  }
  
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return ErrorTypes.NETWORK;
  }
  
  if (response) {
    if (response.status === 401 || response.status === 403) {
      return ErrorTypes.AUTH;
    }
    
    if (response.status === 400 || response.status === 422) {
      return ErrorTypes.VALIDATION;
    }
    
    if (response.status >= 500) {
      return ErrorTypes.SERVER;
    }
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @param {Response} response - Optional response object
 * @param {Object} responseData - Optional response data
 * @returns {string} User-friendly error message
 */
function getUserFriendlyMessage(error, response = null, responseData = null) {
  const errorType = getErrorType(error, response);
  
  // Use specific error message from response if available
  if (responseData && responseData.message) {
    return responseData.message;
  }
  
  // Use custom error message if available
  if (error.message && !error.message.includes('[object') && error.message !== 'Failed to fetch') {
    return error.message;
  }
  
  // Use default message for error type
  return ErrorMessages[errorType];
}

/**
 * Handle API error
 * @param {Error} error - The error object
 * @param {Response} response - Optional response object
 * @param {Object} responseData - Optional response data
 * @param {boolean} showToUser - Whether to show error to user
 * @returns {Object} Processed error object
 */
async function handleApiError(error, response = null, responseData = null, showToUser = true) {
  // Try to get response data if not provided
  if (response && !responseData) {
    try {
      responseData = await response.clone().json();
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }
  
  const errorType = getErrorType(error, response);
  const message = getUserFriendlyMessage(error, response, responseData);
  
  // Log error details
  console.error('API Error:', {
    type: errorType,
    message,
    originalError: error,
    response,
    responseData
  });
  
  // Show error to user if requested
  if (showToUser && typeof showMessage === 'function') {
    showMessage(message, 'error');
  }
  
  // Special handling for authentication errors
  if (errorType === ErrorTypes.AUTH && typeof AuthService !== 'undefined') {
    // Don't logout if we're already on the login page or trying to login
    const isAuthEndpoint = response && 
      (response.url.includes('/login') || response.url.includes('/register'));
    
    if (!isAuthEndpoint) {
      console.log('Authentication error detected, logging out');
      setTimeout(() => {
        AuthService.logout();
        showMessage('Your session has expired. Please log in again.', 'info');
      }, 1000);
    }
  }
  
  // Return processed error object
  return {
    type: errorType,
    message,
    originalError: error,
    status: response ? response.status : null,
    data: responseData
  };
}

/**
 * Safe API request wrapper
 * @param {Function} requestFn - The request function to execute
 * @param {Object} options - Options
 * @returns {Promise<Object>} Response data or error
 */
async function safeApiRequest(requestFn, options = {}) {
  const {
    showErrors = true,
    defaultValue = null,
    retries = 0,
    retryDelay = 1000
  } = options;
  
  let lastError = null;
  let attempts = 0;
  
  while (attempts <= retries) {
    try {
      if (attempts > 0) {
        console.log(`Retry attempt ${attempts} of ${retries}`);
      }
      
      return await requestFn();
    } catch (error) {
      lastError = error;
      attempts++;
      
      // Process error
      const errorObj = await handleApiError(
        error, 
        error.response, 
        error.responseData, 
        showErrors && attempts === retries + 1 // Only show error on final attempt
      );
      
      // Don't retry for certain error types
      if (errorObj.type === ErrorTypes.AUTH || errorObj.type === ErrorTypes.VALIDATION) {
        break;
      }
      
      // Wait before retry
      if (attempts <= retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // All retries failed
  return {
    error: lastError,
    data: defaultValue,
    success: false
  };
}

/**
 * Validate API response
 * @param {Response} response - The fetch response
 * @returns {Promise<Object>} Validated response data
 */
async function validateApiResponse(response) {
  if (!response.ok) {
    let responseData = null;
    
    try {
      responseData = await response.json();
    } catch (e) {
      // Ignore JSON parsing errors
    }
    
    const error = new Error(responseData?.message || `API error: ${response.status}`);
    error.response = response;
    error.responseData = responseData;
    throw error;
  }
  
  try {
    return await response.json();
  } catch (error) {
    // Handle empty or non-JSON responses
    if (response.status === 204) {
      return { success: true };
    }
    
    throw new Error('Invalid response format');
  }
}

// Export the error handler module
const ErrorHandler = {
  ErrorTypes,
  ErrorMessages,
  handleApiError,
  safeApiRequest,
  validateApiResponse
};

// For compatibility with both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}
