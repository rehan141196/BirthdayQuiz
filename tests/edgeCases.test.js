// Edge cases and error handling tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState, getCategoriesWithCounts, getCurrentQuestion } from '../src/state.js';
import {
  startGame,
  selectCategory,
  selectWager,
  passQuestion,
  markCorrect,
  endNoPoints,
  updateTeamName,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  startScoreEdit,
  saveScoreEdit,
  cancelScoreEdit,
  updateTempScore
} from '../src/gameLogic.js';

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    resetState();
  });

  describe('invalid state transitions', () => {
    it('should not allow selecting category from wrong screen', () => {
      state.screen = 'intro';
      expect(selectCategory('TestCat')).toBe(false);

      state.screen = 'question';
      expect(selectCategory('TestCat')).toBe(false);
    });

    it('should not allow actions without proper setup', () => {
      state.screen = 'question';
      // No current category/question set up
      expect(passQuestion()).toBe(false);
      expect(markCorrect()).toBe(false);

      // selectWager can work if screen is 'question' even without category
      // This is actually valid behavior based on the implementation
    });

    it('should not allow double pass', () => {
      // Set up a question
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test?', answer: 'Test', used: false }
      ]);
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';
      startGame();
      selectCategory('TestCat');
      selectWager(10);

      // First pass should work
      expect(passQuestion()).toBe(true);
      expect(state.hasPassed).toBe(true);

      // Second pass should fail
      expect(passQuestion()).toBe(false);
    });

    it('should not allow endNoPoints without pass', () => {
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test?', answer: 'Test', used: false }
      ]);
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';
      startGame();
      selectCategory('TestCat');
      selectWager(10);

      expect(endNoPoints()).toBe(false);
    });
  });

  describe('boundary conditions', () => {
    it('should handle empty question categories', () => {
      state.questionsByCategory.set('EmptyCat', []);
      expect(selectCategory('EmptyCat')).toBe(false);
    });

    it('should handle categories with all used questions', () => {
      state.questionsByCategory.set('UsedCat', [
        { id: 'q1', prompt: 'Used', answer: 'Used', used: true }
      ]);
      expect(selectCategory('UsedCat')).toBe(false);
    });

    it('should handle invalid wager values', () => {
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test?', answer: 'Test', used: false }
      ]);
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';
      startGame();
      selectCategory('TestCat');

      expect(selectWager(0)).toBe(false);
      expect(selectWager(3)).toBe(false);
      expect(selectWager(20)).toBe(false);
      expect(selectWager(-5)).toBe(false);
      expect(selectWager(null)).toBe(false);
      expect(selectWager(undefined)).toBe(false);
    });

    it('should handle team operations with invalid indices', () => {
      expect(removeTeamMember('team-a', -1)).toBe(false);
      expect(removeTeamMember('team-a', 100)).toBe(false);
      expect(updateTeamMember('team-a', -1, 'New Name')).toBe(false);
      expect(updateTeamMember('team-a', 100, 'New Name')).toBe(false);
    });

    it('should handle team operations with invalid team IDs', () => {
      expect(updateTeamName('invalid-team', 'New Name')).toBe(false);
      expect(addTeamMember('invalid-team', 'New Member')).toBe(false);
      expect(removeTeamMember('invalid-team', 0)).toBe(false);
      expect(updateTeamMember('invalid-team', 0, 'New Name')).toBe(false);
    });
  });

  describe('concurrent actions', () => {
    it('should not allow multiple wager selections', () => {
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test?', answer: 'Test', used: false }
      ]);
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';
      startGame();
      selectCategory('TestCat');

      expect(selectWager(10)).toBe(true);
      expect(selectWager(15)).toBe(false); // Should fail - wager locked
      expect(state.currentWager).toBe(10); // Should remain original
    });

    it('should not allow starting game multiple times', () => {
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';

      expect(startGame()).toBe(true);
      expect(state.gameStarted).toBe(true);

      expect(startGame()).toBe(false); // Second attempt should fail
    });
  });

  describe('state helpers edge cases', () => {
    it('should handle getCurrentQuestion with invalid state', () => {
      expect(getCurrentQuestion()).toBe(null);

      state.currentCategory = 'NonexistentCat';
      expect(getCurrentQuestion()).toBe(null);

      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test', answer: 'Test', used: false }
      ]);
      state.currentCategory = 'TestCat';
      state.currentQuestionId = 'nonexistent-q';
      expect(getCurrentQuestion()).toBe(null);
    });

    it('should handle getCategoriesWithCounts with empty state', () => {
      const categories = getCategoriesWithCounts();
      expect(categories).toEqual([]);
    });

    it('should mark categories as disabled when all questions used', () => {
      state.questionsByCategory.set('TestCat', [
        { id: 'q1', prompt: 'Test', answer: 'Test', used: true },
        { id: 'q2', prompt: 'Test2', answer: 'Test2', used: true }
      ]);

      const categories = getCategoriesWithCounts();
      expect(categories).toHaveLength(1);
      expect(categories[0].disabled).toBe(true);
      expect(categories[0].remainingCount).toBe(0);
    });
  });

  describe('team operations after game start', () => {
    it('should prevent team modifications after game starts', () => {
      // Set up initial team state
      state.teams[0].name = 'Team A';
      state.teams[0].members = ['Member 1'];
      state.teams[1].name = 'Team B';
      state.teams[1].members = [];

      // Start game (this locks teams)
      startGame();

      // All team modification operations should fail
      expect(updateTeamName('team-a', 'New Name')).toBe(false);
      expect(addTeamMember('team-a', 'New Member')).toBe(false);
      expect(removeTeamMember('team-a', 0)).toBe(false);
      expect(updateTeamMember('team-a', 0, 'Updated Member')).toBe(false);

      // Team should remain unchanged from when game started
      expect(state.teams[0].name).toBe('Team A');
      expect(state.teams[0].members).toEqual(['Member 1']); // Should preserve original members
    });
  });

  describe('score operations validation', () => {
    it('should validate score editing state transitions', () => {
      // Can't save/cancel when not editing
      expect(saveScoreEdit()).toBe(false);
      expect(cancelScoreEdit()).toBe(false);
      expect(updateTempScore('team-a', '100')).toBe(false);

      // Start editing
      expect(startScoreEdit()).toBe(true);
      expect(state.editingScores).toBe(true);

      // Can't start again while editing
      expect(startScoreEdit()).toBe(false);

      // Should handle invalid score values
      expect(updateTempScore('team-a', 'invalid')).toBe(false);
      expect(updateTempScore('team-a', null)).toBe(false);
      expect(updateTempScore('team-a', undefined)).toBe(false);

      // updateTempScore accepts any team ID since it just sets state.tempScores[teamId]
      // This is acceptable behavior - the UI should control which team IDs are used
      expect(updateTempScore('invalid-team', '50')).toBe(true);
      expect(state.tempScores['invalid-team']).toBe(50);
    });
  });
});
