// Main application entry point

import { state } from './state.js';
import { loadGameData } from './dataLoader.js';
import { startGame } from './gameLogic.js';
import { initScreens, showScreen } from './ui/screens.js';
import { renderSetup } from './ui/renderSetup.js';
import { renderCategories } from './ui/renderCategories.js';
import { renderQuestion } from './ui/renderQuestion.js';
import { renderEnd } from './ui/renderEnd.js';
import { qs, show, hide } from './utils/dom.js';
import { validateAccessCode, isAuthenticated, setAuthenticated, clearAuthentication } from './utils/auth.js';

class QuizApp {
  constructor() {
    this.init();
  }

  async init() {
    // Initialize screens
    initScreens();

    // Set up event listeners
    this.setupEventListeners();

    // Load game data
    const dataLoaded = await loadGameData();

    if (!dataLoaded) {
      this.showError();
      return;
    }

    // Show intro screen
    this.updateUI();
    this.initializeAuth();
  }

  initializeAuth() {
    const accessCodeInput = qs('#access-code-input');
    const beginSetupBtn = qs('#begin-setup-btn');

    // Clear authentication state and input field when returning to intro screen
    // This ensures security when page is refreshed at end of game
    if (state.screen === 'intro') {
      // Clear previous session authentication
      clearAuthentication();

      // Clear and reset the input field
      if (accessCodeInput) {
        accessCodeInput.value = '';
        accessCodeInput.disabled = false;
        accessCodeInput.placeholder = 'Enter access code';
      }

      // Reset button state
      if (beginSetupBtn) {
        beginSetupBtn.disabled = true;
        beginSetupBtn.textContent = 'Enter Access Code';
      }
    }
  }

  setupEventListeners() {
    // Access code input
    const accessCodeInput = qs('#access-code-input');
    const accessCodeError = qs('#access-code-error');
    const beginSetupBtn = qs('#begin-setup-btn');

    // Check authentication on input change
    accessCodeInput?.addEventListener('input', async (e) => {
      const code = e.target.value;
      hide(accessCodeError);

      if (await validateAccessCode(code)) {
        setAuthenticated();
        beginSetupBtn.disabled = false;
        beginSetupBtn.textContent = 'Begin Setup';
      } else {
        beginSetupBtn.disabled = true;
        beginSetupBtn.textContent = 'Enter Access Code';
      }
    });

    // Show error on invalid attempt when pressing Enter
    accessCodeInput?.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const code = e.target.value;
        if (!(await validateAccessCode(code)) && code.length > 0) {
          show(accessCodeError);
        }
      }
    });

    // Begin Setup button
    beginSetupBtn?.addEventListener('click', () => {
      if (isAuthenticated()) {
        state.screen = 'setup';
        this.updateUI();
      }
    });

    // Start Game button
    const startGameBtn = qs('#start-game-btn');
    startGameBtn?.addEventListener('click', () => {
      if (startGame()) {
        this.updateUI();
      } else {
        alert('Please ensure both teams have names before starting the game.');
      }
    });

    // Listen for state changes from game logic
    window.addEventListener('stateChanged', () => {
      this.updateUI();
    });

    // Handle page refresh
    window.addEventListener('beforeunload', () => {
      // State will be lost on refresh - this is intentional per specs
    });
  }

  updateUI() {
    // Show appropriate screen
    showScreen(state.screen);

    // Render screen content based on current state
    switch (state.screen) {
      case 'intro':
        // Intro screen is static, no rendering needed
        break;

      case 'setup':
        renderSetup();
        break;

      case 'grid':
        renderCategories();
        break;

      case 'question':
        renderQuestion();
        break;

      case 'end':
        renderEnd();
        break;

      case 'error':
        // Error screen is static
        break;

      default:
        console.warn('Unknown screen:', state.screen);
    }
  }

  showError() {
    state.screen = 'error';
    showScreen('error');
  }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
  });
} else {
  new QuizApp();
}
