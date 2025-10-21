// Question pool and usage tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState, isGameComplete } from '../src/state.js';
import { startGame, selectCategory, selectWager, markCorrect } from '../src/gameLogic.js';
import { getNextQuestion } from '../src/dataLoader.js';

describe('Question Pool', () => {
  beforeEach(() => {
    resetState();

    // Set up test questions in file order
    state.questionsByCategory.set('Category1', [
      { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
      { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false }
    ]);

    state.questionsByCategory.set('Category2', [
      { id: 'q3', prompt: 'Question 3', answer: 'Answer 3', used: false }
    ]);

    state.teams[0].name = 'Team A';
    state.teams[1].name = 'Team B';
    startGame();
  });

  describe('question serving', () => {
    it('should serve questions in file order', () => {
      const firstQuestion = getNextQuestion('Category1');
      expect(firstQuestion.id).toBe('q1');

      // Mark first question as used
      firstQuestion.used = true;

      const secondQuestion = getNextQuestion('Category1');
      expect(secondQuestion.id).toBe('q2');
    });

    it('should return null for empty category', () => {
      expect(getNextQuestion('EmptyCategory')).toBe(null);
    });

    it('should return null when all questions used', () => {
      const questions = state.questionsByCategory.get('Category1');
      questions.forEach(q => q.used = true);

      expect(getNextQuestion('Category1')).toBe(null);
    });
  });

  describe('question usage tracking', () => {
    it('should mark questions as used after completion', () => {
      selectCategory('Category1');
      selectWager(10);
      markCorrect();

      const questions = state.questionsByCategory.get('Category1');
      expect(questions[0].used).toBe(true);
    });

    it('should not reuse questions', () => {
      // Use first question
      selectCategory('Category1');
      selectWager(10);
      markCorrect();

      // Select same category again, should get second question
      selectCategory('Category1');
      expect(state.currentQuestionId).toBe('q2');
    });
  });

  describe('game completion', () => {
    it('should detect game completion', () => {
      expect(isGameComplete()).toBe(false);

      // Mark all questions as used
      for (const [, questions] of state.questionsByCategory) {
        questions.forEach(q => q.used = true);
      }

      expect(isGameComplete()).toBe(true);
    });

    it('should transition to end screen when complete', () => {
      // Use all questions except one
      const cat1Questions = state.questionsByCategory.get('Category1');
      cat1Questions.forEach(q => q.used = true);

      // Use last question
      selectCategory('Category2');
      selectWager(10);
      markCorrect();

      expect(state.screen).toBe('end');
    });
  });
});
