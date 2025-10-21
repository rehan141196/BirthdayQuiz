// Access control utility
// SHA-256 based access code validation

/**
 * Generate SHA-256 hash of a string
 * @param {string} str - String to hash
 * @returns {Promise<string>} - SHA-256 hash as hex string
 */
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  /**
   * Validate the provided access code
   * @param {string} code - The access code to validate
   * @returns {Promise<boolean>} - True if valid, false otherwise
   */
  export async function validateAccessCode(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
  
    try {
      // SHA-256 hash-based validation for security
      const inputHash = await sha256(code.toLowerCase().trim());
      const expectedHash = '0182fc69169ad3febc5b995313df1c2e3b7ff44fd3e64ed811ceeec610cccd46'; // SHA-256 hash of the correct access code
  
      return inputHash === expectedHash;
    } catch (error) {
      console.error('Error validating access code:', error);
      return false;
    }
  }
  
  /**
   * Check if user has already authenticated in this session
   * @returns {boolean} - True if authenticated
   */
  export function isAuthenticated() {
    return sessionStorage.getItem('quiz_authenticated') === 'true';
  }
  
  /**
   * Mark user as authenticated for this session
   */
  export function setAuthenticated() {
    sessionStorage.setItem('quiz_authenticated', 'true');
  }
  
  /**
   * Clear authentication
   */
  export function clearAuthentication() {
    sessionStorage.removeItem('quiz_authenticated');
  }
  