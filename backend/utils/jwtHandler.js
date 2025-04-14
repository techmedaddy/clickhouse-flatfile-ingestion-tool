const jwt = require('jsonwebtoken');

module.exports = {
  // ✅ Validates the format and decodes the JWT (without verifying signature)
  decodeToken: (token) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token is missing or not a string.');
      }

      // JWT must have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. A valid token must have 3 parts (header.payload.signature).');
      }

      // Decode payload (middle part)
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.payload) {
        throw new Error('Failed to decode JWT payload.');
      }

      return {
        valid: true,
        payload: decoded.payload,
      };
    } catch (err) {
      console.error('JWT decoding error:', err.message);
      return {
        valid: false,
        error: `❌ JWT error: ${err.message}`,
      };
    }
  },

  // ✅ Optional: Check if token is expired
  isTokenExpired: (token) => {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        throw new Error('Expiration claim (exp) not found in token.');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (err) {
      console.error('JWT expiration check error:', err.message);
      throw new Error('Unable to check token expiration.');
    }
  }
};
