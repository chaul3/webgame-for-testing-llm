# Web Game Collection - Mario & Dragon Maze

A collection of two HTML5 canvas-based games: a Mario-style platformer and a Dragon Maze puzzle game with riddle-solving mechanics.

## 🎮 Games Overview

### 1. Mario-Style Platformer Game
A classic 2D side-scrolling platformer inspired by Super Mario Bros.

**Features:**
- Mario-like character with jumping and movement mechanics
- Multiple platform levels with varying heights
- Enemy AI (Goombas that patrol platforms)
- Collectible coins with spinning animations
- Lives and scoring system
- Authentic physics with gravity and collision detection

**Controls:**
- Arrow Keys: Move left/right
- Spacebar or Up Arrow: Jump

### 2. Dragon Maze Puzzle Game
A maze navigation game with integrated riddle-solving mechanics.

**Features:**
- Procedurally generated mazes with increasing difficulty
- Multiple choice riddle system (A, B, C, D options)
- API integration with fallback riddles
- Persistent riddle database using localStorage
- Magic doors for level progression (pay points to skip)
- Mario-themed visual design with clouds and brick walls
- Statistics tracking and history

**Controls:**
- Arrow Keys: Navigate through maze
- A/1, B/2, C/3, D/4: Select riddle answers
- Enter: Submit answer

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. Use the tabs to switch between games
4. No additional setup required!

## 📁 Project Structure

```
webgame/
├── index.html          # Main HTML file with both games
├── game.js            # Mario platformer game logic
├── dragon-game.js     # Dragon maze game logic
└── README.md          # This file
```

## 🎯 Game Mechanics

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

## 🛠️ Technical Features

### Frontend Technologies
- HTML5 Canvas for game rendering
- Vanilla JavaScript (ES6+)
- CSS3 with gradients and animations
- LocalStorage for data persistence

### Game Development Patterns
- Object-oriented programming with ES6 classes
- Game loop with requestAnimationFrame
- Collision detection algorithms
- State management for multiple games
- Event-driven input handling

### Data Management
- LocalStorage for persistent game data
- JSON serialization for complex data structures
- Riddle database with history tracking
- Score persistence across sessions

## 🎨 Visual Design

Both games feature a cohesive Mario-inspired visual theme:
- Sky-to-grass gradient backgrounds
- Animated white clouds
- Mario-style brick blocks with 3D shading
- Consistent color palette and typography
- Smooth animations and visual effects

## 🔧 API Integration

The Dragon Maze game integrates with external APIs:
- **Riddles API:** https://api.api-ninjas.com/v1/riddles
- **Fallback System:** Built-in riddles ensure functionality without API
- **Error Handling:** Graceful degradation if API is unavailable

## 📊 Features Highlights

### Mario Game
- ✅ Smooth character movement and jumping
- ✅ Enemy AI with patrol patterns
- ✅ Collectible coins with animations
- ✅ Multiple platform layouts
- ✅ Score and lives system
- ✅ Game over and respawn mechanics

### Dragon Maze Game
- ✅ Procedural maze generation
- ✅ Multiple choice riddle system
- ✅ Persistent database with statistics
- ✅ Magic door progression system
- ✅ Previous answer hints
- ✅ Keyboard shortcuts for quick play
- ✅ Mario-themed visual design
- ✅ Level-based difficulty scaling

## 🎮 Gameplay Tips

### Mario Game
- Jump on enemies from above to defeat them safely
- Collect all coins for maximum points
- Use platforms strategically to avoid enemies
- Time your jumps carefully on moving enemies

### Dragon Maze Game
- Explore the maze to find all riddle points (golden chests)
- Use previous answer hints to learn from mistakes
- Consider using doors when you have excess points
- Check your statistics to track improvement
- Use keyboard shortcuts (A/B/C/D) for faster riddle solving

## 🔮 Future Enhancements

Potential features for future development:
- Sound effects and background music
- Additional game modes
- Multiplayer functionality
- Mobile touch controls
- More enemy types and power-ups
- Level editor for custom mazes
- Online leaderboards
- Achievement system

## 🤝 Contributing

This project was created as a demonstration of web game development using vanilla JavaScript and HTML5 Canvas. Feel free to fork, modify, and enhance the games!

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

---

**Created as a showcase of HTML5 game development and JavaScript programming skills.**
