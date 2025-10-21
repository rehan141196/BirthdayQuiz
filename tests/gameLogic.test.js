// Game logic tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState } from '../src/state.js';
import {
  startGame,
  selectCategory,
  selectWager,
  updateTeamName,
  addTeamMember,
  removeTeamMember
} from '../src/gameLogic.js';

describe('Game Logic', () => {
  beforeEach(() => {
    resetState();

    // Set up test questions
    state.questionsByCategory.set('TestCategory', [
      { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
      { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false }
    ]);

    // Set up test teams
    state.teams[0].name = 'Team A';
    state.teams[1].name = 'Team B';
  });

  describe('startGame', () => {
    it('should start game when teams have names', () => {
      expect(startGame()).toBe(true);
      expect(state.gameStarted).toBe(true);
      expect(state.screen).toBe('grid');
      expect(state.choosingTeamId).toBe('team-a');
    });

    it('should not start game when teams lack names', () => {
      state.teams[0].name = '';
      expect(startGame()).toBe(false);
      expect(state.gameStarted).toBe(false);
    });

    it('should not start game twice', () => {
      startGame();
      expect(startGame()).toBe(false);
    });
  });

  describe('selectCategory', () => {
    beforeEach(() => {
      startGame();
    });

    it('should select category with available questions', () => {
      expect(selectCategory('TestCategory')).toBe(true);
      expect(state.currentCategory).toBe('TestCategory');
      expect(state.currentQuestionId).toBe('q1'); // First question
      expect(state.screen).toBe('question');
    });

    it('should not select empty category', () => {
      expect(selectCategory('EmptyCategory')).toBe(false);
      expect(state.currentCategory).toBe(null);
    });

    it('should not select category when already in question', () => {
      selectCategory('TestCategory');
      expect(selectCategory('TestCategory')).toBe(false);
    });
  });

  describe('selectWager', () => {
    beforeEach(() => {
      startGame();
      selectCategory('TestCategory');
    });

    it('should select valid wager', () => {
      expect(selectWager(10)).toBe(true);
      expect(state.currentWager).toBe(10);
    });

    it('should not select invalid wager', () => {
      expect(selectWager(25)).toBe(false);
      expect(state.currentWager).toBe(null);
    });

    it('should not change wager once locked', () => {
      selectWager(10);
      expect(selectWager(15)).toBe(false);
      expect(state.currentWager).toBe(10);
    });
  });

  describe('team management', () => {
    it('should update team name before game starts', () => {
      expect(updateTeamName('team-a', 'New Name')).toBe(true);
      expect(state.teams[0].name).toBe('New Name');
    });

    it('should not update team name after game starts', () => {
      startGame();
      expect(updateTeamName('team-a', 'New Name')).toBe(false);
      expect(state.teams[0].name).toBe('Team A');
    });

    it('should add team member', () => {
      expect(addTeamMember('team-a', 'Alice')).toBe(true);
      expect(state.teams[0].members).toContain('Alice');
    });

    it('should remove team member', () => {
      addTeamMember('team-a', 'Alice');
      addTeamMember('team-a', 'Bob');
      expect(removeTeamMember('team-a', 0)).toBe(true);
      expect(state.teams[0].members).toEqual(['Bob']);
    });
  });
});
