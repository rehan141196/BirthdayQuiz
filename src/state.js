// Single in-memory app state store

export const state = {
    screen: 'intro', // 'intro' | 'setup' | 'grid' | 'question' | 'end' | 'error'
    teams: [
      { id: 'team-a', name: 'Team A', members: [], score: 0 },
      { id: 'team-b', name: 'Team B', members: [], score: 0 }
    ],
    choosingTeamId: 'team-a',          // alternates after each completed question
    answeringTeamId: null,             // set to other team during a pass
    currentCategory: null,             // string
    currentQuestionId: null,           // string
    currentWager: null,                // 5 | 10 | 15
    hasPassed: false,                  // whether this question has been passed already
    showAnswer: false,                 // whether the answer is revealed
    questionsByCategory: new Map(),    // category -> array of { id, prompt, answer, notes, used }
    gameStarted: false,                // whether teams are locked
    editingScores: false,              // whether score editing mode is active
    tempScores: { 'team-a': 0, 'team-b': 0 } // temporary scores during editing
  };
  
  // Helper functions for state management
  export function getTeam(teamId) {
    return state.teams.find(team => team.id === teamId);
  }
  
  export function getChoosingTeam() {
    return getTeam(state.choosingTeamId);
  }
  
  export function getAnsweringTeam() {
    return state.answeringTeamId ? getTeam(state.answeringTeamId) : getChoosingTeam();
  }
  
  export function getOtherTeam(teamId) {
    return state.teams.find(team => team.id !== teamId);
  }
  
  export function getCurrentQuestion() {
    if (!state.currentQuestionId || !state.currentCategory) {
      return null;
    }
  
    const categoryQuestions = state.questionsByCategory.get(state.currentCategory);
    return categoryQuestions?.find(q => q.id === state.currentQuestionId) || null;
  }
  
  export function getCategoriesWithCounts() {
    const categories = [];
  
    for (const [categoryName, questions] of state.questionsByCategory) {
      const remainingCount = questions.filter(q => !q.used).length;
      categories.push({
        name: categoryName,
        remainingCount,
        disabled: remainingCount === 0
      });
    }
  
    return categories;
  }
  
  export function isGameComplete() {
    for (const [, questions] of state.questionsByCategory) {
      if (questions.some(q => !q.used)) {
        return false;
      }
    }
    return true;
  }
  
  export function resetQuestion() {
    state.currentCategory = null;
    state.currentQuestionId = null;
    state.currentWager = null;
    state.hasPassed = false;
    state.showAnswer = false;
    state.answeringTeamId = null;
  }
  
  export function resetState() {
    state.screen = 'intro';
    state.teams = [
      { id: 'team-a', name: 'Team A', members: [], score: 0 },
      { id: 'team-b', name: 'Team B', members: [], score: 0 }
    ];
    state.choosingTeamId = 'team-a';
    state.answeringTeamId = null;
    state.gameStarted = false;
    state.editingScores = false;
    state.tempScores = { 'team-a': 0, 'team-b': 0 };
    state.questionsByCategory.clear();
    resetQuestion();
  }
  