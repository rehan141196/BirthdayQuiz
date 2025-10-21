
# Quiz Game — Developer Specification (Frontend-Only, Single-Page App)

**Status:** Finalized v1  
**Scope:** Frontend-only single-page application (SPA) built with vanilla HTML/CSS/JavaScript using ES Modules. No build step.  
**Primary Display Context:** Laptop screen, shared to a TV via screen sharing.  
**Teams:** Exactly two teams, 5–7 players typically (but not enforced).  
**Authoring Data:** `teams.json` and `questions.json` stored in the **project root**.

---

## 1) High-Level Goals

- Provide a lightweight, modern-looking quiz game the quizmaster can run from a laptop and share to a TV.
- All controls are visible to the audience (no presenter/hidden mode).
- Gameplay for two teams with category selection, wagers, pass rules, scoring, and an automatic end screen.
- v1 ships with placeholder teams/categories/questions (lorem ipsum), but the quizmaster can later edit the JSON files and/or use the setup screen to adjust teams before the game starts.

> **No persistence across refreshes**: state is in-memory only and resets to the intro screen on page reload.

---

## 2) Non-Functional Requirements

- **Frontend only**: static assets (HTML/CSS/JS/JSON). No backend.
- **ES Modules**: Modular JavaScript via `<script type="module">`.
- **No build step**: Run in a static server; no bundlers.
- **Linting**: ESLint (sensible defaults).
- **Testing**: Vitest unit tests (logic-only; no DOM interaction tests).
- **Design**: Ultra-modern **dark theme** at all times; “sensible” design. (No specialized accessibility or mobile support beyond basics.)
- **Target device**: **Laptop only** (optimize for typical laptop resolutions; e.g., 1366×768 to 1920×1080). No mobile/tablet requirements.
- **Performance**: Minimal JavaScript; simple DOM show/hide (no router framework).

---

## 3) Project Structure

```
/
├─ index.html
├─ main.css                 # global dark theme styles
├─ teams.json               # teams data (project root)
├─ questions.json           # questions data (project root)
├─ src/
│  ├─ state.js              # single in-memory app state store
│  ├─ dataLoader.js         # fetch & parse JSON, error handling
│  ├─ gameLogic.js          # pure game rules & transitions
│  ├─ ui/
│  │  ├─ screens.js         # mount/show/hide screens
│  │  ├─ renderScoreboard.js
│  │  ├─ renderCategories.js
│  │  ├─ renderQuestion.js
│  │  ├─ renderSetup.js
│  │  └─ renderEnd.js
│  └─ utils/
│     └─ dom.js             # qs/qsa, el(), class toggles, etc.
├─ tests/
│  ├─ gameLogic.spec.js
│  ├─ questions.spec.js
│  ├─ wagers.spec.js
│  ├─ turnOrder.spec.js
│  ├─ scoring.spec.js
│  └─ state.spec.js
├─ .eslintrc.json
├─ package.json
└─ README.md
```

> **Note:** Data files live in the **project root** (not `/data`). Ensure `fetch('./teams.json')` and `fetch('./questions.json')` paths reflect this.

---

## 4) Data Models

### 4.1 teams.json
```json
{
  "teams": [
    {
      "id": "team-a",
      "name": "Team A",
      "members": ["Alice", "Ben", "Cara"]
    },
    {
      "id": "team-b",
      "name": "Team B",
      "members": ["Diego", "Eve", "Farah"]
    }
  ]
}
```
- **Exactly two teams** are supported by the app. Any number of members is allowed (no enforcement).

### 4.2 questions.json
```json
{
  "questions": [
    {
      "id": "q-001",
      "category": "Category1",
      "prompt": "Question text…",
      "answer": "Answer text…",
      "notes": "Optional moderator note (not displayed to audience)"
    }
  ]
}
```
- **Categories** are free-form strings coming **only** from `questions[].category` values.
- **Order matters**: Within a given category, questions are served **in file order** (first unused question first).

### 4.3 v1 Placeholder Content
- Ship `teams.json` with two example teams and members, and `questions.json` with **5 categories** (`Category1`–`Category5`) containing lorem ipsum questions/answers.
- If a valid JSON file loads but is **empty**, the **Setup screen** will show blank teams to be filled in manually.

---

## 5) Screens & Navigation

**Routing:** simple DOM show/hide via CSS classes (no hash/router).  

1. **Intro Screen**
   - Heading: “Welcome to the Game”
   - Button: “Begin Setup”
   - Clicking the button shows the **Team Setup** screen immediately (minimal or no transition).

2. **Team Setup Screen** (editing allowed **only before** the game starts)
   - Two editable team panels (strictly two teams).
   - Editable **team name** and **member list** (add/remove members). No validation rules.
   - **Start Game** button **locks** the teams for this session and transitions to **Category Grid**.
   - No “revert to file” option; session-only.

3. **Category Grid Screen**
   - **Scoreboard at top** (always visible).
   - **Grid of category tiles** in main area:
     - Each tile shows **Category Name** and **(remaining questions count)**, e.g., “Category2 — 3 left”.
     - When a category is out of questions: tile is **greyed out** and **disabled/un-clickable**.
   - Selecting a category shows the **Question Screen** with the next unused question from that category.
   - **Choosing team alternates after every completed question** (see Turn Logic).

4. **Question Screen**
   - **Scoreboard at top** (always visible).
   - **Category Name** (above the question).
   - **Question text** large and centered in main area.
   - **Wager section** under question: **5 / 10 / 15**.  
     - **Required** before any other control is usable.
     - Once selected, **wager is locked** and wager buttons become **disabled**.
   - **Controls** under wager:
     - **Show Answer**: reveals answer text **below the question** with a **fade-in**, does **not** end question. Once clicked, **button disables**.
     - **Pass** (only available **until** first pass): passes question to other team (see **Pass Mechanics**), then **Pass** transforms into **End**.
     - **Correct**: awards points according to current rules and returns to **Category Grid**.
     - Buttons **Correct/Pass/Show Answer** are disabled until a **wager** is selected.
   - **Pass Banner** (if passed): display **“PASS TO TEAM X”** as a persistent banner (no animation) until the question is resolved.

5. **End Screen**
   - Automatically appears immediately when **all questions** in **all categories** are used.
   - Shows result:
     - If scores differ: large **“🏆 {Winner Name} Wins!”** + final scores + team members listed.
     - If scores tie: **“It’s a tie!”** + final scores + team members listed (quizmaster handles tie-break offline).
   - No restart button (session ends; reloading restarts from intro).  
   - Acceptable if underlying controls are still mounted but hidden; no interaction visible.

---

## 6) Layout & Visual Design

- **Dark theme** only; visually modern.
- **Overall layout** per screen:
  - **Scoreboard at top** (sticky within app container).
  - **Main area** switches between category grid or question view.
  - **Wager** (only visible on Question screen) under main content.
  - **Control buttons** under wager on Question screen.
- **Scoreboard details:**
  - Show **Team A — score | Team B — score** side by side.
  - Under each team name, show its **member list** in smaller text.
  - **Consistent highlight color** for whichever team is **currently choosing** (see Turn Logic).  
  - Display a text label: **“Current Team: {TeamName}”** (see Pass Mechanics note below).
- **Category grid:**
  - Grid of modern tiles (responsive **within laptop sizes**), hover affordance OK.
  - Completed categories: **greyed out** and **disabled**.
  - Optional lightweight fade or no animation on open (design choice).
- **Question view:**
  - Category name above.
  - Question text large and centered.
  - Answer appears **as normal text** below when revealed; **no special color**.
- **Buttons:**
  - Text-only labels (no icons).
  - Visible disabled states for: **Show Answer** (after clicked), **Wager options** (once one is selected), **Correct/Pass/End** (until wager selected), and category tiles (when empty).
- **Animations & Effects:**
  - Keep **minimal** (simple CSS fade for answer). No pass banner animation.
  - No sounds. No timers.
- **Typography & Accent:**
  - Use sensible defaults (e.g., system stack or a popular sans like Inter) and a single **accent color** used consistently for highlights.
- **Accessibility:**
  - No special accessibility beyond **sensible** defaults. Semantic markup and visible focus outlines are acceptable but not required to be exhaustive.

---

## 7) Game Rules & Logic

### 7.1 Turn Logic (Category Selection)
- The **starting team** is simply the **first team in the list** (Team A).
- **Choosing team alternates after every completed question**: A → B → A → B …
- **Passing does not affect choosing order.**  
  - **Explicit rule (must be in code and UI copy):** The choosing order alternates after each **completed** question, regardless of who answered or whether the question was passed.
  - Example: Team A chooses a category, then passes. If Team B answers correctly, **the next question is still chosen by Team B** (because choosing alternates after the question completes).

### 7.2 Wagers
- Wager must be selected **after** the question appears and **before** any control (Correct/Pass/Show Answer) can be used.
- Wager options: **5, 10, 15** points.
- Once selected, the wager is **locked** and cannot be changed for that question.
- If question is **passed**, the **original wager remains** (Team B plays for Team A’s wager).

### 7.3 Pass Mechanics (Exactly One Pass)
- A question may be passed **once** from the choosing team to the other team.
- On pass:
  - Show persistent **“PASS TO TEAM X”** banner until resolution.
  - **Scoreboard highlight** temporarily indicates the **answering team** (the other team).  
  - The **“Current Team” label remains the original choosing team** (does **not** change during pass).
  - The **Pass** button changes to **End** (to record that both teams were incorrect → **no points**).  
- Valid outcomes after a pass:
  - **Correct** (awards the **locked wager** to the answering team) → return to Category Grid.
  - **End** (no points to either team) → return to Category Grid.

### 7.4 Scoring
- **Correct** adds the **selected wager** to the team that answered correctly:
  - If not passed: points go to the **choosing** team.
  - If passed: points go to the **other** team (the answering team), **using the original wager**.
- **Incorrect**:
  - If not passed and “End” pressed (not applicable; “End” only appears after pass) → no points.
  - After pass, if “End” is pressed: no points to either team.
- Manual score editing is available at any time (see 8.2).

### 7.5 Question Pool
- Each question is **marked as used** once completed and will **not** appear again in the session.
- Category tiles display **remaining questions count**.
- Selecting a category automatically advances to the **next unused** question in **file order**.

### 7.6 End of Game
- When all questions in all categories are used:
  - Immediately show **End Screen**.
  - If one team leads: show **winner name**, final scores, and **list team members**.
  - If tie: show **“It’s a tie!”**; quizmaster handles tie-break offline.
  - No restart option; refresh restarts the whole app (intro screen).

---

## 8) Controls & Editing

### 8.1 Question Controls
- **Show Answer**: reveals the answer with a fade-in; **disables** after first click; does not affect scoring or end the question.
- **Pass**: available until used. On use, triggers pass banner/temporary highlight and transforms to **End**.
- **End** (only after a pass): ends the question with **no points**, returns to Category Grid.
- **Correct**: applies scoring per rules and returns to Category Grid.
- **Preconditions**: **Correct/Pass/Show Answer** are **disabled** until a **wager** is selected.

### 8.2 Manual Score Editing
- Entry: Small **“Edit Scores”** button near the scoreboard.
- Edit mode: **Inline number inputs** for both teams’ scores.
- **Require Save** to apply changes; (optional **Cancel** may discard edits).  
- No min/max constraints; allow any integer; **no undo**.

### 8.3 Team Editing (Setup Only)
- Allowed **only** on the Setup screen (before starting the game).
- Editable: **Team names** and **member names**; **add/remove** members.
- **No validation** (duplicates, empty strings allowed).
- **No revert to file**; **Start Game** locks teams for the session.
- **Order fixed**: No reordering/swap of team positions; left-right order remains constant.

---

## 9) State Management (In-Memory Only)

Single in-memory store exported from `src/state.js`. Suggested shape:

```js
export const state = {
  screen: 'intro', // 'intro' | 'setup' | 'grid' | 'question' | 'end'
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
  questionsByCategory: new Map(),    // category -> array of { id, prompt, answer, used }
  // or a plain object if Map not desired
};
```

**Notes:**
- `choosingTeamId` switches **after the question completes** (regardless of pass).
- On pass: set `answeringTeamId` to the **other team**; keep `choosingTeamId` unchanged until completion.
- On question completion: clear `answeringTeamId`, `currentWager`, `hasPassed`, `showAnswer`, `currentCategory`, `currentQuestionId`.

---

## 10) Data Loading & Error Handling

### 10.1 Loading
- On app start:
  1. Load `questions.json` and `teams.json` via `fetch('./questions.json')` and `fetch('./teams.json')`.
  2. If both load and parse successfully:
     - Map questions by category, preserving file order.
     - If teams array exists but is empty → Setup screen shows **blank** team fields.
     - If teams file contains teams → prefill Setup with those values.
  3. If **either** file fails to load or parse (network/404/invalid JSON):
     - Show a **simple error message screen**:  
       “Could not load game data. Please check `teams.json` and `questions.json` and try again.”

### 10.2 No Persistence
- No `localStorage` / cookies. Full refresh resets to intro and reloads JSON files.

---

## 11) UI Behavior Details

### 11.1 Scoreboard
- Always visible (grid & question screens).
- Shows `Team A — <score> | Team B — <score>`.
- Members listed under each team in smaller text.
- **Highlight**: the **choosing** team gets a consistent highlight color.
- **Label**: “**Current Team: {ChoosingTeamName}**” always reflects **choosing order**, not who is currently answering a passed question.

### 11.2 Pass Banner & Highlights
- When passed, show persistent **“PASS TO TEAM X”** banner (instantly appears; no animation).
- Temporarily **highlight** the answering team section in the scoreboard during the passed state.
- **Do not** change the “Current Team” label during pass; it should continue to show the original choosing team.

### 11.3 Category Tiles
- Show remaining question **count**.
- When empty: **greyed out** + **disabled** (unclickable). No message shown.

### 11.4 Controls
- **Show Answer**: after click → answer fades in; button **disabled**.
- **Wager**: buttons as pills or radios; once selected → all wager options **disabled**.
- **Correct/Pass**: disabled until wager is selected.
- After first **Pass**: the **Pass** button label changes to **End**.

### 11.5 Misc
- No icons, no timers, no sounds, no confirmations, no undo, no version text.

---

## 12) Implementation Notes

- **index.html**: Mount root containers for each screen. Include script modules via `<script type="module" src="./src/...">`.
- **CSS (main.css)**:
  - Dark palette (background near `#0B0F14`, surface `#121821`–`#1B2430`), neutral text, single accent (e.g., electric blue).
  - Large type for questions, clear layout, generous spacing for TV readability while optimized for laptop.
  - Button states: default, hover, disabled. Consistent highlight style for choosing team.
  - Minimal transitions (answer fade-in via `opacity`/`transition`).
- **DOM Utilities** in `src/utils/dom.js`: `qs`, `qsa`, `el`, `show`, `hide`, `setText`, `setClass` helpers.
- **Screens** in `src/ui/*.js`:
  - Imperative render functions that read from `state` and update DOM.
  - Screen switching via adding/removing `.hidden` on root containers.
- **Game Logic** in `src/gameLogic.js`:
  - `startGame()`, `selectCategory(cat)`, `selectWager(v)`, `passQuestion()`, `endNoPoints()`, `markCorrect()`, `revealAnswer()`, `completeQuestion()` and turn transitions.
  - Pure functions where possible for testability.

---

## 13) Edge Cases

- Selecting a category with **0 remaining**: tile is disabled, cannot be clicked.
- Attempting to click **Correct/Pass/Show Answer** without a wager: controls are disabled; nothing happens.
- Clicking **Show Answer** multiple times: first reveals and disables; subsequent clicks have no effect.
- After pass, **Pass→End** is the only way to mark “both wrong / no points”.
- **Manual score edit**: allow negative or very large numbers.
- **Refresh** during play: app restarts from **Intro** and reloads data (session lost).

---

## 14) Testing Plan (Vitest, Logic-Only)

> DOM interaction tests are **not required**; focus on pure modules and state transitions.

**Coverage Areas (unit tests):**
1. **Data loading/parsing**  
   - Valid JSON populates structures; categories are discovered from `questions[].category`.
   - File order preserved within categories.
2. **Turn order**  
   - Starting team is first in list.  
   - Choosing team alternates after each completed question (A→B→A…), **independent of pass**.
3. **Wager rules**  
   - Actions blocked until wager selected.  
   - Wager locks after selection; cannot change post-selection or after pass.
4. **Pass mechanics**  
   - Exactly **one** pass allowed; subsequent pass attempts are invalid.  
   - On pass, answering team becomes the other team; choosing team label remains original.
   - After pass, **End** ends with no points.
5. **Scoring**  
   - Correct (no pass): adds wager to choosing team.  
   - Correct (after pass): adds **same wager** to the other team.  
   - End (after pass): no points.
6. **Question pool**  
   - Questions marked as used after completion; not served again.  
   - Category count decrements; category disables at zero.
7. **End-of-game detection**  
   - When all questions used, transition to end screen state.
   - Tie detection: end screen reflects tie text.
8. **Manual score editing**  
   - Inline values update after **Save** only; no undo expected.

**Test Organization:**
- `gameLogic.spec.js` — overall transitions & outcomes.
- `wagers.spec.js` — wager preconditions and locking.
- `turnOrder.spec.js` — strict alternation independent of pass.
- `scoring.spec.js` — scoring correctness in all cases.
- `questions.spec.js` — file-order serving & used flags.
- `state.spec.js` — reducers/pure helpers manipulate state predictably.

Run with:
```bash
npm run test      # watch
npm run test:ci   # with coverage
```

---

## 15) Linting

- Use ESLint with recommended rules and ES Modules environment. Example `.eslintrc.json`:

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-constant-condition": ["error", { "checkLoops": false }]
  }
}
```

> You may adjust or add small stylistic rules if helpful; keep it **sensible**, not overly strict.

---

## 16) NPM Scripts & Local Dev

Use a simple static server so `fetch('./*.json')` works.

**package.json (excerpt):**
```json
{
  "name": "quiz-game",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "http-server -a localhost -p 8080 -c-1",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "http-server": "^14.1.1",
    "vitest": "^2.0.0"
  }
}
```
- `http-server` is a dev dependency for quick local hosting.
- Visit `http://localhost:8080/` to run.

---

## 17) Developer Tasks (Implementation Checklist)

1. **Scaffold** files & folders (see structure).  
2. **Build UI containers** in `index.html` for all screens; hide with `.hidden` as needed.  
3. **Style** base dark theme & layout in `main.css`.  
4. **Implement `dataLoader.js`** to fetch/parse JSON and initialize `state.questionsByCategory` & `state.teams`.  
5. **Implement `state.js`** with initial defaults and reset helpers.  
6. **Implement `gameLogic.js`** with pure functions for:
   - starting game / locking teams,
   - selecting category,
   - serving next unused question in file order,
   - selecting & locking wager,
   - pass → end/no points,
   - mark correct → apply score,
   - completing question → rotate choosing team,
   - end-of-game detection.  
7. **Implement UI renderers** for Setup, Scoreboard, Categories, Question, End screens.  
8. **Wire events** (buttons: begin setup, start game, category tiles, wager, show answer, pass/end, correct, edit scores save).  
9. **Add tests** per plan; ensure logic passes without DOM.  
10. **Add ESLint** config and ensure code passes lint.  
11. **Populate placeholder JSON** (lorem ipsum questions across 5 categories; two teams with random names).  

---

## 18) README Content (Detailed)

Include the following sections in `README.md`:

- **Overview**: Purpose of the app; laptop-only dark theme; two-team quiz.  
- **Requirements**: Node.js, npm.  
- **Getting Started**:
  ```bash
  npm install
  npm run start   # opens http://localhost:8080
  ```
- **Editing Data**:
  - Files: `./teams.json`, `./questions.json` in project root.
  - Schema (repeat from §4).
  - Notes: categories inferred from questions; file order determines question order per category.
- **Running Tests**:
  ```bash
  npm run test
  npm run test:ci
  ```
- **Linting**:
  ```bash
  npm run lint
  npm run lint:fix
  ```
- **Gameplay Rules** (summarize):
  - Wagers (5/10/15) required before actions; lock after selection.
  - Exactly one pass; **PASS TO TEAM X** banner persists; **Current Team** label remains original choosing team; pass doesn’t affect choosing order.
  - Correct awards wager to the answering team (using original wager if passed).
  - Category choosing alternates after each **completed** question.
  - Questions are not repeated; categories grey out & disable when empty.
  - End screen appears automatically; tie displayed as “It’s a tie!”.  
- **Troubleshooting**:
  - If data fails to load, the app shows an error screen. Check JSON validity and paths.

---

## 19) Security & Privacy

- No network calls beyond local JSON fetches.
- No analytics, cookies, or persistent storage.
- Intended for local, one-off birthday event use.

---

## 20) Future Enhancements (Out of Scope for v1)

- Presenter/host-only controls, keyboard shortcuts.
- Persistent state across refreshes (localStorage).
- Media questions (images/audio/video) and richer layouts.
- Mobile/tablet responsiveness and advanced accessibility.
- Restart flow / new game loop without refresh.

---

## 21) Acceptance Criteria (Summary)

- App runs via `npm run start`, loads JSON from project root, and shows **Intro** → **Setup** → **Grid** → **Question** → **End** flow.
- Scoreboard always visible on **Grid** and **Question** screens, with correct highlight and “Current Team” label behavior.
- Wagers required and locked; exactly one pass per question with persistent pass banner and Pass→End behavior.
- Correct/End outcomes update scores/state accordingly; categories show remaining counts and disable when empty.
- End screen appears automatically with winner or tie and lists team members; no restart button.
- Manual score edit works inline with Save; no undo.
- Unit tests cover rules/logic as specified; ESLint passes.
