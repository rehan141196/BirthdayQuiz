// State management tests

import { describe, it, expect, beforeEach } from 'vitest';
import {
  state,
  resetState,
  getTeam,
  getChoosingTeam,
  getAnsweringTeam,
  getOtherTeam,
  getCurrentQuestion,
  getCategoriesWithCounts,
  isGameComplete,
  resetQuestion
} from '../src/state.js';

describe('State Management', () => {
  beforeEach(() => {
    resetState();
  });

  describe('team helpers', () => {
    it('should get team by id', () => {
      const team = getTeam('team-a');
      expect(team).toBe(state.teams[0]);
      expect(team.id).toBe('team-a');
    });

    it('should get choosing team', () => {
      state.choosingTeamId = 'team-b';
      const choosingTeam = getChoosingTeam();
      expect(choosingTeam).toBe(state.teams[1]);
    });

    it('should get answering team (same as choosing when not passed)', () => {
      state.choosingTeamId = 'team-a';
      const answeringTeam = getAnsweringTeam();
      expect(answeringTeam).toBe(state.teams[0]);
    });

    it('should get answering team (different when passed)', () => {
      state.choosingTeamId = 'team-a';
      state.answeringTeamId = 'team-b';
      const answeringTeam = getAnsweringTeam();
      expect(answeringTeam).toBe(state.teams[1]);
    });

    it('should get other team', () => {
      const otherTeam = getOtherTeam('team-a');
      expect(otherTeam).toBe(state.teams[1]);
    });
  });

  describe('question helpers', () => {
    beforeEach(() => {
      state.questionsByCategory.set('TestCategory', [
        { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
        { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false }
      ]);
    });

    it('should get current question', () => {
      state.currentCategory = 'TestCategory';
      state.currentQuestionId = 'q1';

      const question = getCurrentQuestion();
      expect(question.id).toBe('q1');
      expect(question.prompt).toBe('Question 1');
    });

    it('should return null for invalid current question', () => {
      expect(getCurrentQuestion()).toBe(null);

      state.currentCategory = 'TestCategory';
      expect(getCurrentQuestion()).toBe(null);

      state.currentQuestionId = 'invalid';
      expect(getCurrentQuestion()).toBe(null);
    });

    it('should get categories with counts', () => {
      const categories = getCategoriesWithCounts();
      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual({
        name: 'TestCategory',
        remainingCount: 2,
        disabled: false
      });
    });

    it('should mark empty categories as disabled', () => {
      const questions = state.questionsByCategory.get('TestCategory');
      questions.forEach(q => q.used = true);

      const categories = getCategoriesWithCounts();
      expect(categories[0]).toEqual({
        name: 'TestCategory',
        remainingCount: 0,
        disabled: true
      });
    });
  });

  describe('game state helpers', () => {
    beforeEach(() => {
      state.questionsByCategory.set('Cat1', [
        { id: 'q1', used: false },
        { id: 'q2', used: false }
      ]);
      state.questionsByCategory.set('Cat2', [
        { id: 'q3', used: false }
      ]);
    });

    it('should detect incomplete game', () => {
      expect(isGameComplete()).toBe(false);
    });

    it('should detect complete game', () => {
      // Mark all questions as used
      for (const [, questions] of state.questionsByCategory) {
        questions.forEach(q => q.used = true);
      }

      expect(isGameComplete()).toBe(true);
    });
  });

  describe('state reset', () => {
    it('should reset question state', () => {
      state.currentCategory = 'TestCategory';
      state.currentQuestionId = 'q1';
      state.currentWager = 10;
      state.hasPassed = true;
      state.showAnswer = true;
      state.answeringTeamId = 'team-b';

      resetQuestion();

      expect(state.currentCategory).toBe(null);
      expect(state.currentQuestionId).toBe(null);
      expect(state.currentWager).toBe(null);
      expect(state.hasPassed).toBe(false);
      expect(state.showAnswer).toBe(false);
      expect(state.answeringTeamId).toBe(null);
    });

    it('should reset full state', () => {
      // Modify state
      state.screen = 'question';
      state.teams[0].name = 'Modified Team';
      state.teams[0].score = 100;
      state.gameStarted = true;
      state.questionsByCategory.set('Test', []);

      resetState();

      expect(state.screen).toBe('intro');
      expect(state.teams[0].name).toBe('Team A');
      expect(state.teams[0].score).toBe(0);
      expect(state.gameStarted).toBe(false);
      expect(state.questionsByCategory.size).toBe(0);
    });
  });
});
