// Authentication tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateAccessCode, isAuthenticated, setAuthenticated, clearAuthentication } from '../src/utils/auth.js';

// Mock sessionStorage for testing
const mockSessionStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value;
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Mock global sessionStorage
vi.stubGlobal('sessionStorage', mockSessionStorage);

describe('Authentication', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  describe('validateAccessCode', () => {
    it('should reject incorrect access codes', async () => {
      expect(await validateAccessCode('wrongcode')).toBe(false);
      expect(await validateAccessCode('invalid123')).toBe(false);
      expect(await validateAccessCode('test')).toBe(false);
      expect(await validateAccessCode('')).toBe(false);
    });

    it('should handle invalid inputs', async () => {
      expect(await validateAccessCode(null)).toBe(false);
      expect(await validateAccessCode(undefined)).toBe(false);
      expect(await validateAccessCode(123)).toBe(false);
    });

    it('should handle edge cases', async () => {
      expect(await validateAccessCode('   ')).toBe(false);
      expect(await validateAccessCode('WRONGCODE')).toBe(false);
    });
  });

  describe('session management', () => {
    it('should start unauthenticated', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should set authentication', () => {
      setAuthenticated();
      expect(isAuthenticated()).toBe(true);
    });

    it('should clear authentication', () => {
      setAuthenticated();
      expect(isAuthenticated()).toBe(true);

      clearAuthentication();
      expect(isAuthenticated()).toBe(false);
    });

    it('should persist authentication across checks', () => {
      setAuthenticated();
      expect(isAuthenticated()).toBe(true);
      expect(isAuthenticated()).toBe(true); // Second call should still return true
    });
  });
});
