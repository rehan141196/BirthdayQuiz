// Data loading and parsing tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGameData, getNextQuestion } from '../src/dataLoader.js';
import { state, resetState } from '../src/state.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import process from 'process';

// Mock fetch for testing
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Data Loader', () => {
  beforeEach(() => {
    resetState();
    vi.clearAllMocks();
  });

  describe('loadGameData', () => {
    it('should load valid teams and questions data', async () => {
      const teamsData = {
        teams: [
          { id: 'team-a', name: 'Test Team A', members: ['Alice', 'Bob'] },
          { id: 'team-b', name: 'Test Team B', members: ['Carol', 'Dave'] }
        ]
      };

      const questionsData = {
        questions: [
          { id: 'q1', category: 'Cat1', prompt: 'Question 1?', answer: 'Answer 1' },
          { id: 'q2', category: 'Cat1', prompt: 'Question 2?', answer: 'Answer 2' },
          { id: 'q3', category: 'Cat2', prompt: 'Question 3?', answer: 'Answer 3' }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(teamsData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(questionsData)
        });

      const result = await loadGameData();

      expect(result).toBe(true);
      expect(state.teams[0].name).toBe('Test Team A');
      expect(state.teams[0].members).toEqual(['Alice', 'Bob']);
      expect(state.teams[1].name).toBe('Test Team B');
      expect(state.questionsByCategory.size).toBe(2);
      expect(state.questionsByCategory.get('Cat1')).toHaveLength(2);
      expect(state.questionsByCategory.get('Cat2')).toHaveLength(1);
    });

    it('should handle empty teams array', async () => {
      const teamsData = { teams: [] };
      const questionsData = {
        questions: [
          { id: 'q1', category: 'Cat1', prompt: 'Question 1?', answer: 'Answer 1' }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(teamsData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(questionsData)
        });

      const result = await loadGameData();

      expect(result).toBe(true);
      expect(state.teams[0].name).toBe('Team A'); // Default values
      expect(state.teams[0].members).toEqual([]);
    });

    it('should handle malformed teams data', async () => {
      const teamsData = {
        teams: [
          { name: 'Valid Team', members: ['Alice'] }, // Missing id - should still work
          { id: 'team-b', members: null } // Missing name, null members
        ]
      };
      const questionsData = {
        questions: [
          { id: 'q1', category: 'Cat1', prompt: 'Question 1?', answer: 'Answer 1' }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(teamsData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(questionsData)
        });

      const result = await loadGameData();

      expect(result).toBe(true);
      expect(state.teams[0].name).toBe('Valid Team');
      expect(state.teams[0].members).toEqual(['Alice']);
      expect(state.teams[1].name).toBe('Team B'); // Default fallback
      expect(state.teams[1].members).toEqual([]); // Handles null members
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadGameData();

      expect(result).toBe(false);
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await loadGameData();

      expect(result).toBe(false);
    });

    it('should handle invalid JSON', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        });

      const result = await loadGameData();

      expect(result).toBe(false);
    });

    it('should skip invalid questions', async () => {
      const teamsData = { teams: [] };
      const questionsData = {
        questions: [
          { id: 'q1', category: 'Cat1', prompt: 'Valid question?', answer: 'Valid answer' },
          { category: 'Cat1', prompt: 'Missing ID', answer: 'Answer' }, // Missing id
          { id: 'q3', prompt: 'Missing category', answer: 'Answer' }, // Missing category
          { id: 'q4', category: 'Cat1', answer: 'Missing prompt' }, // Missing prompt
          { id: 'q5', category: 'Cat1', prompt: 'Missing answer?' }, // Missing answer
          { id: 'q6', category: 'Cat2', prompt: 'Another valid?', answer: 'Another answer' }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(teamsData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(questionsData)
        });

      const result = await loadGameData();

      expect(result).toBe(true);
      expect(state.questionsByCategory.get('Cat1')).toHaveLength(1); // Only valid question
      expect(state.questionsByCategory.get('Cat2')).toHaveLength(1); // Only valid question
    });
  });

  describe('getNextQuestion', () => {
    beforeEach(() => {
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
        { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false },
        { id: 'q3', prompt: 'Question 3', answer: 'Answer 3', used: true }
      ]);
    });

    it('should return first unused question in file order', () => {
      const question = getNextQuestion('TestCat');
      expect(question.id).toBe('q1');
    });

    it('should skip used questions', () => {
      // Mark first question as used
      state.questionsByCategory.get('TestCat')[0].used = true;

      const question = getNextQuestion('TestCat');
      expect(question.id).toBe('q2');
    });

    it('should return null for nonexistent category', () => {
      const question = getNextQuestion('NonexistentCat');
      expect(question).toBe(null);
    });

    it('should return null when all questions are used', () => {
      // Mark all questions as used
      const questions = state.questionsByCategory.get('TestCat');
      questions.forEach(q => q.used = true);

      const question = getNextQuestion('TestCat');
      expect(question).toBe(null);
    });
  });

  describe('questions.json validation', () => {
    it('should have unique question IDs in the actual questions.json file', async () => {
      // Load the actual questions.json file using Node.js fs
      const questionsPath = resolve(process.cwd(), 'public/questions.json');
      const fileContent = readFileSync(questionsPath, 'utf-8');
      const data = JSON.parse(fileContent);

      expect(data.questions).toBeDefined();
      expect(Array.isArray(data.questions)).toBe(true);

      // Extract all question IDs
      const questionIds = data.questions.map(q => q.id);

      // Find duplicates for better error reporting
      const seenIds = new Set();
      const duplicates = [];
      questionIds.forEach(id => {
        if (seenIds.has(id)) {
          duplicates.push(id);
        }
        seenIds.add(id);
      });

      // Create a set of unique IDs
      const uniqueIds = new Set(questionIds);

      // Check that all IDs are unique - provide helpful error message
      if (uniqueIds.size !== questionIds.length) {
        throw new Error(`Found duplicate question IDs: ${duplicates.join(', ')}. Total questions: ${questionIds.length}, Unique IDs: ${uniqueIds.size}`);
      }

      expect(uniqueIds.size).toBe(questionIds.length);
    });
  });
});
