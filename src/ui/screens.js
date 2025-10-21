// Screen management - mount/show/hide screens

import { qs, show, hide } from '../utils/dom.js';

const screens = {
  intro: null,
  setup: null,
  grid: null,
  question: null,
  end: null,
  error: null
};

export function initScreens() {
  screens.intro = qs('#intro-screen');
  screens.setup = qs('#setup-screen');
  screens.grid = qs('#grid-screen');
  screens.question = qs('#question-screen');
  screens.end = qs('#end-screen');
  screens.error = qs('#error-screen');
}

export function showScreen(screenName) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    if (screen) {
      hide(screen);
    }
  });

  // Show requested screen
  const screen = screens[screenName];
  if (screen) {
    show(screen);
    return true;
  }

  return false;
}

export function getScreen(screenName) {
  return screens[screenName];
}
