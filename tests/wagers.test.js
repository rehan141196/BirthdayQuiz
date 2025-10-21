// Wager system tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState } from '../src/state.js';
import { startGame, selectCategory, selectWager, passQuestion, markCorrect } from '../src/gameLogic.js';

describe('Wager System', () => {
  beforeEach(() => {
    resetState();

    // Set up test questions
    state.questionsByCategory.set('TestCategory', [
      { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false }
    ]);

    state.teams[0].name = 'Team A';
    state.teams[1].name = 'Team B';
    startGame();
    selectCategory('TestCategory');
  });

  describe('wager preconditions', () => {
    it('should block actions until wager is selected', () => {
      expect(passQuestion()).toBe(false);
      expect(markCorrect()).toBe(false);
    });

    it('should allow actions after wager is selected', () => {
      selectWager(10);
      expect(passQuestion()).toBe(true);
    });
  });

  describe('wager locking', () => {
    it('should lock wager after selection', () => {
      selectWager(10);
      expect(selectWager(15)).toBe(false);
      expect(state.currentWager).toBe(10);
    });

    it('should preserve wager after pass', () => {
      selectWager(15);
      passQuestion();
      expect(state.currentWager).toBe(15);
    });
  });

  describe('scoring with wagers', () => {
    it('should award wager to choosing team when correct', () => {
      selectWager(15);
      const initialScore = state.teams[0].score;
      markCorrect();
      expect(state.teams[0].score).toBe(initialScore + 15);
    });

    it('should award wager to answering team after pass', () => {
      selectWager(10);
      passQuestion();

      // Reset to test markCorrect after pass
      resetState();
      state.questionsByCategory.set('TestCategory', [
        { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false }
      ]);
      state.teams[0].name = 'Team A';
      state.teams[1].name = 'Team B';
      startGame();
      selectCategory('TestCategory');
      selectWager(10);
      passQuestion();

      markCorrect();
      expect(state.teams[1].score).toBe(10); // Other team gets the wager
    });
  });
});
