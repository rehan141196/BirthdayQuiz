// Turn order tests

import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState } from '../src/state.js';
import { startGame, selectCategory, selectWager, markCorrect, passQuestion, endNoPoints } from '../src/gameLogic.js';

describe('Turn Order', () => {
  beforeEach(() => {
    resetState();

    // Set up test questions
    state.questionsByCategory.set('TestCategory', [
      { id: 'q1', prompt: 'Question 1', answer: 'Answer 1', used: false },
      { id: 'q2', prompt: 'Question 2', answer: 'Answer 2', used: false },
      { id: 'q3', prompt: 'Question 3', answer: 'Answer 3', used: false }
    ]);

    state.teams[0].name = 'Team A';
    state.teams[1].name = 'Team B';
    startGame();
  });

  it('should start with first team', () => {
    expect(state.choosingTeamId).toBe('team-a');
  });

  it('should alternate after completed question', () => {
    // Team A chooses and answers correctly
    selectCategory('TestCategory');
    selectWager(10);
    markCorrect();

    // Should now be Team B's turn
    expect(state.choosingTeamId).toBe('team-b');

    // Team B chooses and answers correctly
    selectCategory('TestCategory');
    selectWager(10);
    markCorrect();

    // Should now be Team A's turn again
    expect(state.choosingTeamId).toBe('team-a');
  });

  it('should alternate regardless of pass', () => {
    // Team A chooses, passes, Team B answers correctly
    selectCategory('TestCategory');
    selectWager(10);
    passQuestion();
    markCorrect();

    // Should still be Team B's turn to choose next (alternates after completion)
    expect(state.choosingTeamId).toBe('team-b');
  });

  it('should alternate even when both teams get question wrong', () => {
    // Team A chooses, passes, both teams wrong
    selectCategory('TestCategory');
    selectWager(10);
    passQuestion();
    endNoPoints();

    // Should still be Team B's turn to choose next
    expect(state.choosingTeamId).toBe('team-b');
  });
});
