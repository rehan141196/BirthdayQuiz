// End screen rendering

import { state } from '../state.js';
import { getWinner } from '../gameLogic.js';
import { qs, el, empty } from '../utils/dom.js';

export function renderEnd() {
  const container = qs('#end-container');
  empty(container);

  const winner = getWinner();

  const endContent = el('div', { className: 'end-content' }, [
    createWinnerAnnouncement(winner),
    createFinalScores(),
    createTeamMembers()
  ]);

  container.appendChild(endContent);
}

function createWinnerAnnouncement(winner) {
  const text = winner ? `🏆 ${winner.name} Wins!` : "It's a tie!";

  return el('div', {
    className: 'winner-announcement',
    textContent: text
  });
}

function createFinalScores() {
  return el('div', { className: 'final-scores' }, [
    createFinalTeamScore(state.teams[0]),
    createFinalTeamScore(state.teams[1])
  ]);
}

function createFinalTeamScore(team) {
  return el('div', { className: 'final-team-score' }, [
    el('div', {
      className: 'final-team-name',
      textContent: team.name
    }),
    el('div', {
      className: 'final-score-value',
      textContent: team.score.toString()
    })
  ]);
}

function createTeamMembers() {
  return el('div', { className: 'team-members-final' }, [
    createTeamMemberList(state.teams[0]),
    createTeamMemberList(state.teams[1])
  ]);
}

function createTeamMemberList(team) {
  const memberText = team.members.length > 0 ?
    team.members.join(', ') :
    'No members listed';

  return el('div', { className: 'final-team-members' }, [
    el('h3', { textContent: team.name }),
    el('div', { textContent: memberText })
  ]);
}
