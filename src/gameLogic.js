// Pure game rules and transitions

import { state, getTeam, getOtherTeam, resetQuestion, isGameComplete, getCurrentQuestion } from './state.js';
import { getNextQuestion } from './dataLoader.js';

export function startGame() {
  if (state.gameStarted) {
    return false;
  }

  // Validate teams have names (members are optional)
  if (!state.teams[0].name.trim() || !state.teams[1].name.trim()) {
    return false;
  }

  state.gameStarted = true;
  state.screen = 'grid';
  state.choosingTeamId = state.teams[0].id; // First team starts

  return true;
}

export function selectCategory(categoryName) {
  if (state.screen !== 'grid' || state.currentCategory) {
    return false;
  }

  const nextQuestion = getNextQuestion(categoryName);
  if (!nextQuestion) {
    return false; // Category is empty
  }

  state.currentCategory = categoryName;
  state.currentQuestionId = nextQuestion.id;
  state.screen = 'question';

  // Reset question-specific state
  state.currentWager = null;
  state.hasPassed = false;
  state.showAnswer = false;
  state.answeringTeamId = null;

  return true;
}

export function selectWager(wagerValue) {
  if (state.screen !== 'question' || state.currentWager !== null) {
    return false; // Wager already locked
  }

  if (![5, 10, 15].includes(wagerValue)) {
    return false; // Invalid wager
  }

  state.currentWager = wagerValue;
  return true;
}

export function revealAnswer() {
  if (state.screen !== 'question' || state.currentWager === null || state.showAnswer) {
    return false;
  }

  state.showAnswer = true;
  return true;
}

export function passQuestion() {
  if (state.screen !== 'question' || state.currentWager === null || state.hasPassed) {
    return false;
  }

  // Mark as passed and set answering team to the other team
  state.hasPassed = true;
  state.answeringTeamId = getOtherTeam(state.choosingTeamId).id;

  return true;
}

export function markCorrect() {
  if (state.screen !== 'question' || state.currentWager === null) {
    return false;
  }

  // Award points to the answering team
  const answeringTeam = state.answeringTeamId ?
    getTeam(state.answeringTeamId) :
    getTeam(state.choosingTeamId);

  answeringTeam.score += state.currentWager;

  // Mark question as used
  const currentQuestion = getCurrentQuestion();
  if (currentQuestion) {
    currentQuestion.used = true;
  }

  return completeQuestion();
}

export function endNoPoints() {
  if (state.screen !== 'question' || state.currentWager === null || !state.hasPassed) {
    return false; // Can only end with no points after a pass
  }

  // Mark question as used without awarding points
  const currentQuestion = getCurrentQuestion();
  if (currentQuestion) {
    currentQuestion.used = true;
  }

  return completeQuestion();
}

function completeQuestion() {
  // Reset question state
  resetQuestion();

  // Switch choosing team for next question
  state.choosingTeamId = getOtherTeam(state.choosingTeamId).id;

  // Check if game is complete
  if (isGameComplete()) {
    state.screen = 'end';
  } else {
    state.screen = 'grid';
  }

  return true;
}

export function updateTeamName(teamId, newName) {
  if (state.gameStarted) {
    return false; // Cannot edit teams after game starts
  }

  const team = getTeam(teamId);
  if (!team) {
    return false;
  }

  team.name = newName;
  return true;
}

export function addTeamMember(teamId, memberName) {
  if (state.gameStarted) {
    return false;
  }

  const team = getTeam(teamId);
  if (!team) {
    return false;
  }

  team.members.push(memberName);
  return true;
}

export function removeTeamMember(teamId, memberIndex) {
  if (state.gameStarted) {
    return false;
  }

  const team = getTeam(teamId);
  if (!team || memberIndex < 0 || memberIndex >= team.members.length) {
    return false;
  }

  team.members.splice(memberIndex, 1);
  return true;
}

export function updateTeamMember(teamId, memberIndex, newName) {
  if (state.gameStarted) {
    return false;
  }

  const team = getTeam(teamId);
  if (!team || memberIndex < 0 || memberIndex >= team.members.length) {
    return false;
  }

  team.members[memberIndex] = newName;
  return true;
}

export function startScoreEdit() {
  if (state.editingScores) {
    return false;
  }

  state.editingScores = true;
  state.tempScores['team-a'] = state.teams[0].score;
  state.tempScores['team-b'] = state.teams[1].score;
  return true;
}

export function cancelScoreEdit() {
  if (!state.editingScores) {
    return false;
  }

  state.editingScores = false;
  // Temp scores are discarded
  return true;
}

export function saveScoreEdit() {
  if (!state.editingScores) {
    return false;
  }

  state.teams[0].score = state.tempScores['team-a'];
  state.teams[1].score = state.tempScores['team-b'];
  state.editingScores = false;
  return true;
}

export function updateTempScore(teamId, newScore) {
  if (!state.editingScores) {
    return false;
  }

  const score = parseInt(newScore, 10);
  if (isNaN(score)) {
    return false;
  }

  state.tempScores[teamId] = score;
  return true;
}

export function getWinner() {
  const [teamA, teamB] = state.teams;

  if (teamA.score > teamB.score) {
    return teamA;
  } else if (teamB.score > teamA.score) {
    return teamB;
  } else {
    return null; // Tie
  }
}
