// Scoreboard rendering

import { state, getChoosingTeam } from '../state.js';
import { startScoreEdit, cancelScoreEdit, saveScoreEdit, updateTempScore } from '../gameLogic.js';
import { qs, el, empty } from '../utils/dom.js';

export function renderScoreboard(container) {
  empty(container);

  const scoreboard = el('div', { className: 'scoreboard' }, [
    el('div', { className: 'scoreboard-content' }, [
      createCurrentTeamLabel(),
      createTeamsContainer(),
      createEditScoresButton()
    ])
  ]);

  container.appendChild(scoreboard);
}

function createCurrentTeamLabel() {
  const choosingTeam = getChoosingTeam();
  return el('div', {
    className: 'current-team-label',
    textContent: `Current Team: ${choosingTeam.name}`
  });
}

function createTeamsContainer() {
  return el('div', { className: 'teams-container' }, [
    createTeamScore(state.teams[0]),
    createTeamScore(state.teams[1])
  ]);
}

function createTeamScore(team) {
  const isChoosing = team.id === state.choosingTeamId;
  const isAnswering = team.id === state.answeringTeamId;

  const className = isAnswering ? 'team-score answering' :
                   isChoosing ? 'team-score choosing' :
                   'team-score';

  const scoreContent = state.editingScores ?
    createScoreEditInput(team) :
    el('div', {
      className: 'team-score-value',
      textContent: team.score.toString()
    });

  return el('div', { className }, [
    el('div', {
      className: 'team-name',
      textContent: team.name
    }),
    scoreContent,
    el('div', {
      className: 'team-members',
      textContent: team.members.join(', ')
    })
  ]);
}

function createScoreEditInput(team) {
  const input = el('input', {
    type: 'number',
    className: 'score-edit-input',
    value: state.tempScores[team.id].toString(),
    onInput: (e) => {
      updateTempScore(team.id, e.target.value);
    }
  });

  const controls = el('div', { className: 'score-edit-controls' }, [
    el('button', {
      className: 'save-scores-btn',
      textContent: 'Save',
      onClick: () => {
        saveScoreEdit();
        refreshScoreboard();
      }
    }),
    el('button', {
      className: 'cancel-scores-btn',
      textContent: 'Cancel',
      onClick: () => {
        cancelScoreEdit();
        refreshScoreboard();
      }
    })
  ]);

  return el('div', {}, [input, controls]);
}

function createEditScoresButton() {
  if (state.editingScores) {
    return el('div'); // Empty div when editing
  }

  return el('button', {
    className: 'edit-scores-btn',
    textContent: 'Edit Scores',
    onClick: () => {
      startScoreEdit();
      refreshScoreboard();
    }
  });
}

function refreshScoreboard() {
  // Re-render scoreboards on both grid and question screens
  const gridScoreboard = qs('#scoreboard-container');
  const questionScoreboard = qs('#scoreboard-container-question');

  if (gridScoreboard) {
    renderScoreboard(gridScoreboard);
  }

  if (questionScoreboard) {
    renderScoreboard(questionScoreboard);
  }
}
