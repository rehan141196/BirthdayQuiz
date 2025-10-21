// Scoring system tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState } from '../src/state.js';
import {
  startGame,
  selectCategory,
  selectWager,
  markCorrect,
  passQuestion,
  endNoPoints,
  startScoreEdit,
  updateTempScore,
  saveScoreEdit,
  cancelScoreEdit,
  getWinner
} from '../src/gameLogic.js';

describe('Scoring System', () => {
  beforeEach(() => {
    resetState();

    state.questionsByCategory.set('TestCategory', [
      { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
      { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false }
    ]);

    state.teams[0].name = 'Team A';
    state.teams[1].name = 'Team B';
    startGame();
  });

  describe('basic scoring', () => {
    it('should award points to choosing team when correct', () => {
      selectCategory('TestCategory');
      selectWager(15);

      const initialScore = state.teams[0].score;
      markCorrect();

      expect(state.teams[0].score).toBe(initialScore + 15);
      expect(state.teams[1].score).toBe(0);
    });

    it('should award points to other team after pass', () => {
      selectCategory('TestCategory');
      selectWager(10);
      passQuestion();
      markCorrect();

      expect(state.teams[0].score).toBe(0);
      expect(state.teams[1].score).toBe(10);
    });

    it('should award no points when both teams wrong', () => {
      selectCategory('TestCategory');
      selectWager(10);
      passQuestion();
      endNoPoints();

      expect(state.teams[0].score).toBe(0);
      expect(state.teams[1].score).toBe(0);
    });
  });

  describe('manual score editing', () => {
    it('should start score editing mode', () => {
      expect(startScoreEdit()).toBe(true);
      expect(state.editingScores).toBe(true);
      expect(state.tempScores['team-a']).toBe(state.teams[0].score);
      expect(state.tempScores['team-b']).toBe(state.teams[1].score);
    });

    it('should update temporary scores', () => {
      startScoreEdit();
      expect(updateTempScore('team-a', '25')).toBe(true);
      expect(state.tempScores['team-a']).toBe(25);
    });

    it('should save score changes', () => {
      startScoreEdit();
      updateTempScore('team-a', '30');
      updateTempScore('team-b', '20');

      expect(saveScoreEdit()).toBe(true);
      expect(state.editingScores).toBe(false);
      expect(state.teams[0].score).toBe(30);
      expect(state.teams[1].score).toBe(20);
    });

    it('should cancel score changes', () => {
      const originalScoreA = state.teams[0].score;
      const originalScoreB = state.teams[1].score;

      startScoreEdit();
      updateTempScore('team-a', '100');

      expect(cancelScoreEdit()).toBe(true);
      expect(state.editingScores).toBe(false);
      expect(state.teams[0].score).toBe(originalScoreA);
      expect(state.teams[1].score).toBe(originalScoreB);
    });
  });

  describe('winner determination', () => {
    it('should identify winner correctly', () => {
      state.teams[0].score = 25;
      state.teams[1].score = 15;

      const winner = getWinner();
      expect(winner).toBe(state.teams[0]);
    });

    it('should identify tie correctly', () => {
      state.teams[0].score = 20;
      state.teams[1].score = 20;

      const winner = getWinner();
      expect(winner).toBe(null);
    });
  });
});
