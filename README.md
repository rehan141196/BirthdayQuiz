# Rehan's Birthday Quiz

A lightweight, modern-looking quiz game built for two teams with category selection, wagers, pass rules, and automatic scoring. Designed to be run from a laptop and shared to a TV via screen sharing.

## Overview

- **Frontend-only**: Single-page application built with vanilla HTML/CSS/JavaScript using ES Modules
- **No build step**: Run directly in a static server
- **Dark theme**: Ultra-modern dark design optimized for laptop screens
- **Two teams**: Exactly two teams with 5-7 players typically (but not enforced)
- **Categories**: Questions organized by categories with file-order serving
- **Wagers**: 5, 10, or 15 point wagers required before answering
- **Pass mechanics**: Each question can be passed exactly once to the other team

## Requirements

- Node.js (for development dependencies)
- npm

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:<port>
   ```

## Editing Data

The game loads team and question data from JSON files in the project root:

### teams.json
```json
{
  "teams": [
    {
      "id": "team-a",
      "name": "Team Lightning",
      "members": ["Alice Johnson", "Ben Rodriguez", "Cara Smith"]
    },
    {
      "id": "team-b",
      "name": "Team Thunder",
      "members": ["Diego Martinez", "Eve Chen", "Farah Ahmed"]
    }
  ]
}
```

### questions.json
```json
{
  "questions": [
    {
      "id": "q-001",
      "category": "History",
      "prompt": "What year did World War II end?",
      "answer": "1945",
      "notes": "Optional moderator note"
    }
  ]
}
```

**Notes:**
- Categories are automatically inferred from `questions[].category` values
- Questions within each category are served in file order
- Team data can be edited in the setup screen before starting the game

## Running Tests

Run the test suite:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:ci
```

## Linting

Check code quality:
```bash
npm run lint
```

## Gameplay Rules

### Game Flow
1. **Intro Screen**: Enter access code to unlock the "Begin Setup" button
2. **Team Setup**: Edit team names and members (only before game starts)
3. **Category Grid**: Select categories to answer questions
4. **Question Screen**: Answer questions with wagers and pass options
5. **End Screen**: Automatic winner announcement when all questions used

### Wager System
- **Required**: Must select wager (5, 10, or 15 points) before any other action
- **Locked**: Wager cannot be changed once selected
- **Preserved**: Original wager applies even after passing to other team

### Pass Mechanics
- **One pass per question**: Each question can be passed exactly once
- **Pass banner**: Shows "PASS TO TEAM X" until question resolved
- **Current team label**: Always shows original choosing team (doesn't change during pass)
- **Pass to End**: After passing, "Pass" button becomes "End" (for no points)

### Scoring
- **Correct (no pass)**: Wager points awarded to choosing team
- **Correct (after pass)**: Wager points awarded to answering team (other team)
- **End (after pass)**: No points awarded to either team
- **Manual editing**: Scores can be edited manually at any time

### Turn Order
- **Starting team**: First team in the list always starts
- **Alternation**: Choosing team alternates after each **completed** question
- **Independent of pass**: Turn order is not affected by who answers or passes

### Question Management
- **File order**: Questions served in the order they appear in `questions.json`
- **One-time use**: Questions are marked as used and never repeated
- **Category counts**: Grid shows remaining question count per category
- **Auto-disable**: Empty categories become greyed out and unclickable

### Game End
- **Automatic**: End screen appears when all questions in all categories are used
- **Winner display**: Shows winning team name, final scores, and team members
- **Tie handling**: Displays "It's a tie!" - quizmaster handles tiebreaker offline
- **No restart**: Refresh page to start over (session state is not persisted)

## Troubleshooting

### Data Loading Issues
If you see "Could not load game data" error:
1. Check that `teams.json` and `questions.json` exist in the `public` directory
2. Validate JSON syntax using a JSON validator
3. Ensure files are accessible via the static server

## Development Notes

- **No persistence**: State is in-memory only and resets on page refresh
- **Static files**: All assets are static - no backend required
- **ES Modules**: Uses native ES module imports/exports
- **Testing**: Unit tests focus on game logic, not DOM interaction
- **Styling**: CSS custom properties for consistent theming
