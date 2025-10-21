// Team setup screen rendering

import { state } from '../state.js';
import { updateTeamName, addTeamMember, removeTeamMember, updateTeamMember } from '../gameLogic.js';
import { qs, el, empty } from '../utils/dom.js';

export function renderSetup() {
  const container = qs('#team-setup-container');
  empty(container);

  const setupGrid = el('div', { className: 'team-setup-grid' }, [
    createTeamPanel(state.teams[0], 0),
    createTeamPanel(state.teams[1], 1)
  ]);

  container.appendChild(setupGrid);
}

function createTeamPanel(team, teamIndex) {
  const panel = el('div', { className: 'team-setup-panel' }, [
    el('h3', { textContent: `Team ${teamIndex + 1}` }),
    createTeamNameInput(team),
    createMembersList(team),
    createAddMemberButton(team)
  ]);

  return panel;
}

function createTeamNameInput(team) {
  return el('input', {
    type: 'text',
    className: 'team-name-input',
    placeholder: 'Enter team name...',
    value: team.name,
    onInput: (e) => {
      updateTeamName(team.id, e.target.value);
    }
  });
}

function createMembersList(team) {
  const list = el('div', { className: 'members-list' });

  team.members.forEach((member, index) => {
    const memberItem = el('div', { className: 'member-item' }, [
      el('input', {
        type: 'text',
        className: 'member-input',
        placeholder: 'Member name...',
        value: member,
        onInput: (e) => {
          updateTeamMember(team.id, index, e.target.value);
        }
      }),
      el('button', {
        className: 'remove-member-btn',
        textContent: 'Remove',
        onClick: () => {
          removeTeamMember(team.id, index);
          renderSetup(); // Re-render to update indices
        }
      })
    ]);

    list.appendChild(memberItem);
  });

  return list;
}

function createAddMemberButton(team) {
  return el('button', {
    className: 'add-member-btn',
    textContent: 'Add Member',
    onClick: () => {
      addTeamMember(team.id, '');
      renderSetup(); // Re-render to show new input
    }
  });
}
