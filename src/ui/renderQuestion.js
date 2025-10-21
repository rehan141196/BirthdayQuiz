// Question screen rendering

import { state, getCurrentQuestion } from '../state.js';
import { selectWager, revealAnswer, passQuestion, markCorrect, endNoPoints } from '../gameLogic.js';
import { qs, el, empty, setClass } from '../utils/dom.js';
import { renderScoreboard } from './renderScoreboard.js';

export function renderQuestion() {
  // Render scoreboard
  const scoreboardContainer = qs('#scoreboard-container-question');
  renderScoreboard(scoreboardContainer);

  // Render question content
  const container = qs('#question-container');
  empty(container);

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    container.appendChild(el('div', { textContent: 'No question found' }));
    return;
  }

  const questionContent = el('div', { className: 'question-content' }, [
    el('div', {
      className: 'question-category',
      textContent: state.currentCategory
    }),
    el('div', {
      className: 'question-text',
      textContent: currentQuestion.prompt
    }),
    createAnswerSection(currentQuestion),
    createPassBanner(),
    createWagerSection(),
    createQuestionControls()
  ]);

  container.appendChild(questionContent);
}

function createAnswerSection(question) {
  const answer = el('div', {
    className: 'question-answer',
    textContent: question.answer
  });

  setClass(answer, 'visible', state.showAnswer);

  return answer;
}

function createPassBanner() {
  if (!state.hasPassed) {
    return el('div'); // Empty div
  }

  const otherTeam = state.teams.find(team => team.id === state.answeringTeamId);
  return el('div', {
    className: 'pass-banner',
    textContent: `PASS TO ${otherTeam.name.toUpperCase()}`
  });
}

function createWagerSection() {
  const wagerOptions = el('div', { className: 'wager-options' });

  [5, 10, 15].forEach(value => {
    const isSelected = state.currentWager === value;
    const isDisabled = state.currentWager !== null && !isSelected;

    const className = isSelected ? 'wager-btn selected' : 'wager-btn';

    const btn = el('button', {
      className,
      textContent: value.toString(),
      disabled: isDisabled,
      onClick: () => {
        if (selectWager(value)) {
          renderQuestion(); // Re-render to update button states
        }
      }
    });

    wagerOptions.appendChild(btn);
  });

  return el('div', { className: 'wager-section' }, [
    el('div', {
      className: 'wager-title',
      textContent: 'Select Wager:'
    }),
    wagerOptions
  ]);
}

function createQuestionControls() {
  const controls = el('div', { className: 'question-controls' });

  // Show Answer button
  const showAnswerBtn = el('button', {
    className: 'secondary-btn',
    textContent: 'Show Answer',
    disabled: state.currentWager === null || state.showAnswer,
    onClick: () => {
      if (revealAnswer()) {
        renderQuestion(); // Re-render to show answer and disable button
      }
    }
  });

  // Pass/End button
  const passText = state.hasPassed ? 'End' : 'Pass';
  const passBtn = el('button', {
    className: 'secondary-btn',
    textContent: passText,
    disabled: state.currentWager === null,
    onClick: () => {
      if (state.hasPassed) {
        if (endNoPoints()) {
          window.dispatchEvent(new CustomEvent('stateChanged'));
        }
      } else {
        if (passQuestion()) {
          renderQuestion(); // Re-render to show pass banner and update button
        }
      }
    }
  });

  // Correct button
  const correctBtn = el('button', {
    className: 'primary-btn',
    textContent: 'Correct',
    disabled: state.currentWager === null,
    onClick: () => {
      if (markCorrect()) {
        window.dispatchEvent(new CustomEvent('stateChanged'));
      }
    }
  });

  controls.appendChild(showAnswerBtn);
  controls.appendChild(passBtn);
  controls.appendChild(correctBtn);

  return controls;
}
