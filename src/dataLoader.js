// Data loading and parsing with error handling

import { state } from './state.js';

export async function loadGameData() {
  try {
    // Load both JSON files
    const [teamsResponse, questionsResponse] = await Promise.all([
      fetch('./teams.json'),
      fetch('./questions.json')
    ]);

    if (!teamsResponse.ok || !questionsResponse.ok) {
      throw new Error('Failed to fetch data files');
    }

    const [teamsData, questionsData] = await Promise.all([
      teamsResponse.json(),
      questionsResponse.json()
    ]);

    // Validate and process teams data
    if (teamsData.teams && Array.isArray(teamsData.teams)) {
      if (teamsData.teams.length >= 2) {
        // Use first two teams from file
        state.teams[0] = {
          id: 'team-a',
          name: teamsData.teams[0].name || 'Team A',
          members: Array.isArray(teamsData.teams[0].members) ? [...teamsData.teams[0].members] : [],
          score: 0
        };

        state.teams[1] = {
          id: 'team-b',
          name: teamsData.teams[1].name || 'Team B',
          members: Array.isArray(teamsData.teams[1].members) ? [...teamsData.teams[1].members] : [],
          score: 0
        };
      }
      // If teams array is empty or has fewer than 2 teams, keep default empty teams for setup
    }

    // Validate and process questions data
    if (questionsData.questions && Array.isArray(questionsData.questions)) {
      processQuestions(questionsData.questions);
    } else {
      throw new Error('Invalid questions format');
    }

    return true;
  } catch (error) {
    console.error('Error loading game data:', error);
    return false;
  }
}

function processQuestions(questions) {
  // Clear existing questions
  state.questionsByCategory.clear();

  // Group questions by category, preserving file order
  questions.forEach(question => {
    if (!question.id || !question.category || !question.prompt || !question.answer) {
      console.warn('Skipping invalid question:', question);
      return;
    }

    const category = question.category;

    if (!state.questionsByCategory.has(category)) {
      state.questionsByCategory.set(category, []);
    }

    state.questionsByCategory.get(category).push({
      id: question.id,
      prompt: question.prompt,
      answer: question.answer,
      notes: question.notes || '',
      used: false
    });
  });

  // Log categories for debugging
  console.log('Loaded categories:', Array.from(state.questionsByCategory.keys()));
  console.log('Question counts:',
    Array.from(state.questionsByCategory.entries()).map(([cat, questions]) =>
      `${cat}: ${questions.length}`
    )
  );
}

export function getNextQuestion(category) {
  const categoryQuestions = state.questionsByCategory.get(category);

  if (!categoryQuestions) {
    return null;
  }

  // Find first unused question in file order
  return categoryQuestions.find(question => !question.used) || null;
}
