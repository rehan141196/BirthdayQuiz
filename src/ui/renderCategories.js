// Category grid rendering

import { getCategoriesWithCounts } from '../state.js';
import { selectCategory } from '../gameLogic.js';
import { qs, el, empty } from '../utils/dom.js';
import { renderScoreboard } from './renderScoreboard.js';

export function renderCategories() {
  // Render scoreboard
  const scoreboardContainer = qs('#scoreboard-container');
  renderScoreboard(scoreboardContainer);

  // Render categories
  const container = qs('#categories-container');
  empty(container);

  const categories = getCategoriesWithCounts();

  const grid = el('div', { className: 'categories-grid' });

  categories.forEach(category => {
    const tile = createCategoryTile(category);
    grid.appendChild(tile);
  });

  container.appendChild(grid);
}

function createCategoryTile(category) {
  const className = category.disabled ? 'category-tile disabled' : 'category-tile';

  const tile = el('div', { className }, [
    el('div', {
      className: 'category-name',
      textContent: category.name
    }),
    el('div', {
      className: 'category-count',
      textContent: `${category.remainingCount} left`
    })
  ]);

  if (!category.disabled) {
    tile.addEventListener('click', () => {
      if (selectCategory(category.name)) {
        // Category selected successfully, screen will change via main app logic
        window.dispatchEvent(new CustomEvent('stateChanged'));
      }
    });
  }

  return tile;
}
