# Web Game Collection - Mario & Dragon Maze

A collection of two HTML5 canvas-based games: a Mario-style platformer and a Dragon Maze puzzle game with riddle-solving mechanics.

## 🎮 Games Overview
 
### 1. Mario-Style Platformer Game
A classic 2D side-scrolling platformer inspired by Super Mario Bros.

**Controls:**
- Arrow Keys: Move left/right
- Spacebar or Up Arrow: Jump

### 2. Dragon Maze Puzzle Game
A maze navigation game with integrated riddle-solving mechanics.

**Controls:**
- Arrow Keys: Navigate through maze
- A/1, B/2, C/3, D/4: Select riddle answers
- Enter: Submit answer

### Mario Game
- **Scoring:** Collect coins (+50 points), defeat enemies (+100 points)
- **Lives:** Start with 3 lives, lose one when hit by enemies
- **Physics:** Realistic jumping, gravity, and collision detection
- **Enemies:** Jump on top to defeat, avoid side contact

### Dragon Maze Game
- **Maze Generation:** Advanced recursive backtracking algorithm
- **Riddle System:** 
  - Fetch riddles from API-Ninjas riddles endpoint
  - Fallback to built-in riddles if API unavailable
  - Multiple choice format with 4 options
  - Smart answer shuffling
- **Scoring:**
  - Correct answer: +100 points
  - First-time correct bonus: +25 points
  - Level completion: +200 points
  - Skip puzzle: -50 points
  - Door usage: +50 points
- **Progression:**
  - Solve 3 riddles per level OR pay points to use magic doors
  - Maze complexity increases with each level
  - Persistent score and statistics