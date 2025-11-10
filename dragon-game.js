// Dragon Maze Puzzle Game
class DragonGame {
    constructor() {
        this.canvas = document.getElementById('dragonCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.score = parseInt(localStorage.getItem('dragonScore')) || 0;
        this.lives = 3;
        this.puzzlesSolved = 0;
        this.puzzlesPerLevel = 3;
        
        // Game state
        this.gameRunning = true;
        this.currentPuzzle = null;
        this.puzzleActive = false;
        this.selectedChoice = -1;
        
        // Database for answered riddles
        this.riddleDatabase = this.initializeRiddleDatabase();
        
        // Player
        this.player = {
            x: 1,
            y: 1,
            size: 20,
            color: '#4CAF50'
        };
        
        // Maze and game elements
        this.cellSize = 25;
        this.maze = this.generateMaze();
        this.puzzlePoints = this.generatePuzzlePoints();
        
        // Doors for level progression (must be after maze is generated)
        this.doors = this.generateDoors();
        
        // Debug: Check if arrays are populated
        console.log('Dragon Game initialized:', {
            mazeSize: this.maze ? this.maze.length : 'undefined',
            puzzlePoints: this.puzzlePoints ? this.puzzlePoints.length : 'undefined',
            doors: this.doors ? this.doors.length : 'undefined'
        });
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Update UI
        this.updateUI();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!this.puzzleActive) {
                this.handleMovement(e.code);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    generateMaze() {
        const width = Math.floor(this.canvas.width / this.cellSize);
        const height = Math.floor(this.canvas.height / this.cellSize);
        
        // Advanced maze generation with increasing difficulty
        const maze = [];
        const wallDensity = Math.min(0.4, 0.2 + (this.level - 1) * 0.05); // Increases with level
        
        // Initialize with all walls
        for (let y = 0; y < height; y++) {
            maze[y] = [];
            for (let x = 0; x < width; x++) {
                maze[y][x] = 1; // Start with walls
            }
        }
        
        // Recursive backtracking maze generation
        const stack = [];
        const visited = new Set();
        
        // Start position
        const startX = 1;
        const startY = 1;
        maze[startY][startX] = 0;
        visited.add(`${startX},${startY}`);
        stack.push({x: startX, y: startY});
        
        const directions = [
            {dx: 0, dy: -2}, // Up
            {dx: 2, dy: 0},  // Right
            {dx: 0, dy: 2},  // Down
            {dx: -2, dy: 0}  // Left
        ];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            
            // Find unvisited neighbors
            for (let dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
                    if (!visited.has(`${nx},${ny}`)) {
                        neighbors.push({x: nx, y: ny, dx: dir.dx, dy: dir.dy});
                    }
                }
            }
            
            if (neighbors.length > 0) {
                // Choose random neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove wall between current and next
                const wallX = current.x + next.dx / 2;
                const wallY = current.y + next.dy / 2;
                maze[wallY][wallX] = 0;
                maze[next.y][next.x] = 0;
                
                visited.add(`${next.x},${next.y}`);
                stack.push(next);
            } else {
                stack.pop();
            }
        }
        
        // Add some extra complexity for higher levels
        if (this.level > 2) {
            // Add some dead ends and loops
            for (let attempt = 0; attempt < this.level * 5; attempt++) {
                const x = Math.floor(Math.random() * (width - 2)) + 1;
                const y = Math.floor(Math.random() * (height - 2)) + 1;
                
                if (maze[y][x] === 1) {
                    // Check if creating a path here would be valid
                    let pathCount = 0;
                    if (maze[y-1][x] === 0) pathCount++;
                    if (maze[y+1][x] === 0) pathCount++;
                    if (maze[y][x-1] === 0) pathCount++;
                    if (maze[y][x+1] === 0) pathCount++;
                    
                    // Create path if it connects to existing paths but doesn't create too many connections
                    if (pathCount >= 1 && pathCount <= 2) {
                        maze[y][x] = 0;
                    }
                }
            }
        }
        
        // Ensure borders are walls
        for (let x = 0; x < width; x++) {
            maze[0][x] = 1;
            maze[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            maze[y][0] = 1;
            maze[y][width - 1] = 1;
        }
        
        return maze;
    }
    
    initializeRiddleDatabase() {
        const savedRiddles = localStorage.getItem('dragonGameRiddles');
        if (savedRiddles) {
            return JSON.parse(savedRiddles);
        } else {
            const initialDb = {
                answeredRiddles: [],
                totalRiddlesAnswered: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                riddleHistory: []
            };
            this.saveRiddleDatabase(initialDb);
            return initialDb;
        }
    }
    
    saveRiddleDatabase(database) {
        localStorage.setItem('dragonGameRiddles', JSON.stringify(database));
    }
    
    addRiddleToDatabase(riddle, userAnswer, isCorrect) {
        const riddleEntry = {
            question: riddle.question,
            correctAnswer: riddle.answer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString(),
            level: this.level
        };
        
        this.riddleDatabase.riddleHistory.push(riddleEntry);
        this.riddleDatabase.totalRiddlesAnswered++;
        
        if (isCorrect) {
            this.riddleDatabase.correctAnswers++;
        } else {
            this.riddleDatabase.wrongAnswers++;
        }
        
        // Keep only last 100 riddles to prevent storage overflow
        if (this.riddleDatabase.riddleHistory.length > 100) {
            this.riddleDatabase.riddleHistory = this.riddleDatabase.riddleHistory.slice(-100);
        }
        
        this.saveRiddleDatabase(this.riddleDatabase);
    }
    
    generateDoors() {
        const doors = [];
        const width = Math.floor(this.canvas.width / this.cellSize);
        const height = Math.floor(this.canvas.height / this.cellSize);
        
        // Generate 1-2 doors per level in strategic locations
        const doorCount = Math.min(2, Math.floor(this.level / 2) + 1);
        
        for (let i = 0; i < doorCount; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * (width - 4)) + 2;
                y = Math.floor(Math.random() * (height - 4)) + 2;
                attempts++;
            } while ((this.maze[y][x] === 1 || (x === 1 && y === 1) || this.isNearPuzzle(x, y)) && attempts < 50);
            
            const doorCost = 150 + (this.level * 50); // Increases with level
            doors.push({
                x: x,
                y: y,
                cost: doorCost,
                used: false,
                id: i
            });
        }
        
        return doors;
    }
    
    isNearPuzzle(x, y) {
        return this.puzzlePoints.some(puzzle => 
            Math.abs(puzzle.x - x) <= 2 && Math.abs(puzzle.y - y) <= 2
        );
    }
    
    generatePuzzlePoints() {
        const points = [];
        const width = Math.floor(this.canvas.width / this.cellSize);
        const height = Math.floor(this.canvas.height / this.cellSize);
        
        // Generate puzzle locations in open areas
        for (let i = 0; i < this.puzzlesPerLevel; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (width - 4)) + 2;
                y = Math.floor(Math.random() * (height - 4)) + 2;
            } while (this.maze[y][x] === 1 || (x === 1 && y === 1));
            
            points.push({
                x: x,
                y: y,
                solved: false,
                id: i
            });
        }
        
        return points;
    }
    
    handleMovement(keyCode) {
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch(keyCode) {
            case 'ArrowLeft':
                newX--;
                break;
            case 'ArrowRight':
                newX++;
                break;
            case 'ArrowUp':
                newY--;
                break;
            case 'ArrowDown':
                newY++;
                break;
        }
        
        // Check bounds and walls
        const width = Math.floor(this.canvas.width / this.cellSize);
        const height = Math.floor(this.canvas.height / this.cellSize);
        
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            if (this.maze[newY][newX] === 0) {
                this.player.x = newX;
                this.player.y = newY;
                
                // Check if player reached a puzzle point
                this.checkPuzzleCollision();
                
                // Check if player reached a door
                this.checkDoorCollision();
            }
        }
    }
    
    checkPuzzleCollision() {
        this.puzzlePoints.forEach(point => {
            if (!point.solved && point.x === this.player.x && point.y === this.player.y) {
                this.startPuzzle(point);
            }
        });
    }
    
    checkDoorCollision() {
        this.doors.forEach(door => {
            if (!door.used && door.x === this.player.x && door.y === this.player.y) {
                this.showDoorPrompt(door);
            }
        });
    }
    
    showDoorPrompt(door) {
        const canAfford = this.score >= door.cost;
        const message = `🚪 Magic Door to Level ${this.level + 1}\n\nCost: ${door.cost} points\nYour Score: ${this.score}\n\n${canAfford ? 'Do you want to pay and advance?' : 'You need more points!'}`;
        
        if (canAfford) {
            const proceed = confirm(message);
            if (proceed) {
                this.score -= door.cost;
                door.used = true;
                this.advanceToNextLevel();
            }
        } else {
            alert(message);
        }
    }
    
    advanceToNextLevel() {
        this.level++;
        this.puzzlesSolved = 0;
        this.score += 50; // Small bonus for using door
        
        // Save score
        localStorage.setItem('dragonScore', this.score.toString());
        
        // Generate new maze, puzzles, and doors
        this.maze = this.generateMaze();
        this.puzzlePoints = this.generatePuzzlePoints();
        this.doors = this.generateDoors();
        
        // Reset player position
        this.player.x = 1;
        this.player.y = 1;
        
        // Show level advance message
        alert(`Advanced to Level ${this.level}! Door bonus: +50 points`);
        
        this.updateUI();
    }
    
    async startPuzzle(puzzlePoint) {
        this.puzzleActive = true;
        document.getElementById('puzzle-level').textContent = this.level;
        
        try {
            // Fetch riddle from API
            const response = await fetch('https://api.api-ninjas.com/v1/riddles', {
                headers: {
                    'X-Api-Key': 'YOUR_API_KEY' // Users should replace with their key
                }
            });
            
            let riddle;
            if (response.ok) {
                const data = await response.json();
                riddle = data[0];
            } else {
                // Fallback riddles with multiple choice options
                const fallbackRiddles = [
                    {
                        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
                        answer: "echo",
                        choices: ["echo", "wind", "sound", "voice"]
                    },
                    {
                        question: "The more you take, the more you leave behind. What am I?",
                        answer: "footsteps",
                        choices: ["footsteps", "memories", "tracks", "time"]
                    },
                    {
                        question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
                        answer: "map",
                        choices: ["map", "painting", "book", "dream"]
                    },
                    {
                        question: "What has keys but no locks, space but no room, you can enter but not go inside?",
                        answer: "keyboard",
                        choices: ["keyboard", "piano", "computer", "typewriter"]
                    },
                    {
                        question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
                        answer: "fire",
                        choices: ["fire", "plant", "balloon", "crystal"]
                    },
                    {
                        question: "What gets wetter the more it dries?",
                        answer: "towel",
                        choices: ["towel", "sponge", "cloth", "mop"]
                    },
                    {
                        question: "I have a heart that doesn't beat, a mouth that doesn't speak. What am I?",
                        answer: "artichoke",
                        choices: ["artichoke", "statue", "doll", "robot"]
                    },
                    {
                        question: "What can travel around the world while staying in a corner?",
                        answer: "stamp",
                        choices: ["stamp", "letter", "coin", "map"]
                    }
                ];
                riddle = fallbackRiddles[Math.floor(Math.random() * fallbackRiddles.length)];
            }
            
            // Create multiple choice options
            let choices;
            if (riddle.choices) {
                choices = [...riddle.choices];
            } else {
                // Generate choices from answer if not provided by API
                choices = this.generateChoices(riddle.answer);
            }
            
            // Shuffle choices
            for (let i = choices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [choices[i], choices[j]] = [choices[j], choices[i]];
            }
            
            this.currentPuzzle = {
                ...riddle,
                choices: choices,
                correctIndex: choices.indexOf(riddle.answer),
                point: puzzlePoint
            };
            
            // Check if this riddle was answered before
            this.checkPreviousAnswer(riddle);
            
            document.getElementById('puzzle-question').textContent = riddle.question;
            this.displayChoices();
            document.getElementById('puzzle-feedback').textContent = '';
            document.getElementById('puzzle-modal').style.display = 'flex';
            
            this.selectedChoice = -1;
            
        } catch (error) {
            console.error('Failed to fetch riddle:', error);
            // Use fallback riddle
            const fallbackRiddle = {
                question: "I have keys but no locks, space but no room, you can enter but not go inside. What am I?",
                answer: "keyboard",
                choices: ["keyboard", "piano", "computer", "typewriter"]
            };
            
            let choices = [...fallbackRiddle.choices];
            for (let i = choices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [choices[i], choices[j]] = [choices[j], choices[i]];
            }
            
            this.currentPuzzle = {
                ...fallbackRiddle,
                choices: choices,
                correctIndex: choices.indexOf(fallbackRiddle.answer),
                point: puzzlePoint
            };
            
            // Check if this riddle was answered before
            this.checkPreviousAnswer(fallbackRiddle);
            
            document.getElementById('puzzle-question').textContent = this.currentPuzzle.question;
            this.displayChoices();
            document.getElementById('puzzle-feedback').textContent = '';
            document.getElementById('puzzle-modal').style.display = 'flex';
            
            this.selectedChoice = -1;
        }
    }
    
    generateChoices(correctAnswer) {
        // Generate plausible wrong answers based on the correct answer
        const commonWrongAnswers = [
            'water', 'air', 'fire', 'earth', 'time', 'light', 'shadow', 'mirror',
            'book', 'key', 'door', 'window', 'clock', 'coin', 'ring', 'box'
        ];
        
        const choices = [correctAnswer];
        const usedChoices = new Set([correctAnswer.toLowerCase()]);
        
        // Add some related words or common answers
        while (choices.length < 4) {
            const randomChoice = commonWrongAnswers[Math.floor(Math.random() * commonWrongAnswers.length)];
            if (!usedChoices.has(randomChoice.toLowerCase())) {
                choices.push(randomChoice);
                usedChoices.add(randomChoice.toLowerCase());
            }
        }
        
        return choices;
    }
    
    checkPreviousAnswer(riddle) {
        const previousAnswer = this.riddleDatabase.riddleHistory.find(entry => 
            entry.question === riddle.question
        );
        
        if (previousAnswer) {
            const timesAnswered = this.riddleDatabase.riddleHistory.filter(entry => 
                entry.question === riddle.question
            ).length;
            
            // Show hint if answered before
            const hintText = document.createElement('div');
            hintText.id = 'riddle-hint';
            hintText.style.cssText = 'background: #fff3cd; padding: 8px; margin: 10px 0; border-radius: 5px; font-size: 12px; color: #856404;';
            hintText.innerHTML = `💡 You've seen this riddle ${timesAnswered} time(s) before. Last answer: ${previousAnswer.userAnswer} (${previousAnswer.isCorrect ? '✓ Correct' : '✗ Wrong'})`;
            
            const questionDiv = document.getElementById('puzzle-question');
            questionDiv.parentNode.insertBefore(hintText, questionDiv.nextSibling);
        }
    }
    
    displayChoices() {
        const choices = this.currentPuzzle.choices;
        const labels = ['A', 'B', 'C', 'D'];
        
        for (let i = 0; i < 4; i++) {
            const button = document.getElementById(`choice-${i}`);
            button.textContent = `${labels[i]}) ${choices[i]}`;
            button.className = 'choice-button';
        }
        
        this.selectedChoice = -1;
    }
    
    selectAnswer(choiceIndex) {
        // Clear previous selections
        for (let i = 0; i < 4; i++) {
            document.getElementById(`choice-${i}`).classList.remove('selected');
        }
        
        // Select new choice
        document.getElementById(`choice-${choiceIndex}`).classList.add('selected');
        this.selectedChoice = choiceIndex;
    }
    
    submitSelectedAnswer() {
        if (this.selectedChoice === -1) {
            document.getElementById('puzzle-feedback').textContent = 'Please select an answer first!';
            document.getElementById('puzzle-feedback').className = 'feedback-wrong';
            return;
        }
        
        const isCorrect = this.selectedChoice === this.currentPuzzle.correctIndex;
        
        // Show correct/wrong colors on buttons
        for (let i = 0; i < 4; i++) {
            const button = document.getElementById(`choice-${i}`);
            if (i === this.currentPuzzle.correctIndex) {
                button.classList.add('correct');
            } else if (i === this.selectedChoice && !isCorrect) {
                button.classList.add('wrong');
            }
        }
        
        // Add to database
        const userAnswer = this.currentPuzzle.choices[this.selectedChoice];
        this.addRiddleToDatabase(this.currentPuzzle, userAnswer, isCorrect);
        
        if (isCorrect) {
            // Correct answer
            this.currentPuzzle.point.solved = true;
            this.puzzlesSolved++;
            this.score += 100;
            
            // Bonus for first-time correct answer
            const previousCorrect = this.riddleDatabase.riddleHistory.filter(entry => 
                entry.question === this.currentPuzzle.question && entry.isCorrect
            ).length;
            
            if (previousCorrect === 1) { // First time getting it right
                this.score += 25;
                document.getElementById('puzzle-feedback').textContent = 'Correct! Well done! (+25 first-time bonus)';
            } else {
                document.getElementById('puzzle-feedback').textContent = 'Correct! Well done!';
            }
            document.getElementById('puzzle-feedback').className = 'feedback-correct';
            
            setTimeout(() => {
                this.closePuzzleModal();
                this.checkLevelComplete();
            }, 2000);
            
        } else {
            // Wrong answer
            this.lives--;
            document.getElementById('puzzle-feedback').textContent = `Wrong! The correct answer was: ${this.currentPuzzle.answer}`;
            document.getElementById('puzzle-feedback').className = 'feedback-wrong';
            
            if (this.lives <= 0) {
                setTimeout(() => {
                    this.gameOver();
                }, 2000);
            } else {
                setTimeout(() => {
                    this.closePuzzleModal();
                }, 2000);
            }
        }
        
        this.updateUI();
    }
    
    skipPuzzle() {
        // Add to database as skipped
        this.addRiddleToDatabase(this.currentPuzzle, "SKIPPED", false);
        
        this.currentPuzzle.point.solved = true;
        this.puzzlesSolved++;
        this.score = Math.max(0, this.score - 50);
        
        document.getElementById('puzzle-feedback').textContent = 'Puzzle skipped! -50 points';
        document.getElementById('puzzle-feedback').className = 'feedback-wrong';
        
        setTimeout(() => {
            this.closePuzzleModal();
            this.checkLevelComplete();
        }, 1500);
        
        this.updateUI();
    }
    
    closePuzzleModal() {
        document.getElementById('puzzle-modal').style.display = 'none';
        this.puzzleActive = false;
        this.currentPuzzle = null;
        this.selectedChoice = -1;
        
        // Reset button styles
        for (let i = 0; i < 4; i++) {
            const button = document.getElementById(`choice-${i}`);
            button.className = 'choice-button';
        }
        
        // Remove riddle hint if exists
        const hint = document.getElementById('riddle-hint');
        if (hint) {
            hint.remove();
        }
    }
    
    checkLevelComplete() {
        if (this.puzzlesSolved >= this.puzzlesPerLevel) {
            this.level++;
            this.puzzlesSolved = 0;
            this.score += 200; // Level completion bonus
            
            // Save score
            localStorage.setItem('dragonScore', this.score.toString());
            
        // Generate new maze, puzzles, and doors
        this.maze = this.generateMaze();
        this.puzzlePoints = this.generatePuzzlePoints();
        this.doors = this.generateDoors();            // Reset player position
            this.player.x = 1;
            this.player.y = 1;
            
            // Show level complete message
            alert(`Level ${this.level - 1} Complete! Bonus: 200 points`);
            
            this.updateUI();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.closePuzzleModal();
        alert(`Game Over! Final Score: ${this.score}\nLevel Reached: ${this.level}`);
        
        // Reset game
        this.level = 1;
        this.lives = 3;
        this.puzzlesSolved = 0;
        this.player.x = 1;
        this.player.y = 1;
        this.maze = this.generateMaze();
        this.puzzlePoints = this.generatePuzzlePoints();
        this.doors = this.generateDoors();
        this.gameRunning = true;
        
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('dragon-level').textContent = this.level;
        document.getElementById('dragon-score').textContent = this.score;
        document.getElementById('dragon-lives').textContent = this.lives;
    }
    
    drawClouds() {
        // Draw simple white clouds for Mario atmosphere
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud positions based on level for variety
        const cloudOffset = (this.level * 50) % this.canvas.width;
        
        // Cloud 1
        this.drawCloud(100 + cloudOffset, 50);
        // Cloud 2
        this.drawCloud(300 + cloudOffset, 80);
        // Cloud 3
        this.drawCloud(500 + cloudOffset, 40);
        // Cloud 4 (wraps around)
        this.drawCloud((700 + cloudOffset) % this.canvas.width, 70);
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        // Main cloud body
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y - 15, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMarioBlock(x, y) {
        // Draw Mario-style brick block
        const blockSize = this.cellSize;
        
        // Main block color (brownish like Mario bricks)
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y, blockSize, blockSize);
        
        // Block highlight (top and left edges)
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(x, y, blockSize, 3);  // Top highlight
        this.ctx.fillRect(x, y, 3, blockSize);  // Left highlight
        
        // Block shadow (bottom and right edges)
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x, y + blockSize - 3, blockSize, 3);  // Bottom shadow
        this.ctx.fillRect(x + blockSize - 3, y, 3, blockSize);  // Right shadow
        
        // Brick pattern lines
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        // Horizontal line in middle
        this.ctx.moveTo(x + 3, y + blockSize/2);
        this.ctx.lineTo(x + blockSize - 3, y + blockSize/2);
        // Vertical lines for brick pattern
        this.ctx.moveTo(x + blockSize/3, y + 3);
        this.ctx.lineTo(x + blockSize/3, y + blockSize/2);
        this.ctx.moveTo(x + 2*blockSize/3, y + blockSize/2);
        this.ctx.lineTo(x + 2*blockSize/3, y + blockSize - 3);
        this.ctx.stroke();
    }
    
    render() {
        // Clear canvas with Mario-style background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky and ground background similar to Mario
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');    // Sky blue at top
        gradient.addColorStop(0.6, '#87CEEB');  // Sky blue until 60%
        gradient.addColorStop(0.6, '#90EE90');  // Light green ground start
        gradient.addColorStop(1, '#228B22');    // Darker green at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some clouds for Mario atmosphere
        this.drawClouds();
        
        // Draw maze walls with Mario-style blocks
        if (this.maze && this.maze.length > 0) {
            for (let y = 0; y < this.maze.length; y++) {
                if (this.maze[y] && this.maze[y].length > 0) {
                    for (let x = 0; x < this.maze[y].length; x++) {
                        if (this.maze[y][x] === 1) {
                            this.drawMarioBlock(x * this.cellSize, y * this.cellSize);
                        }
                    }
                }
            }
        } else {
            // Debug: Draw a test block if maze is not ready
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(50, 50, 25, 25);
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Maze not loaded', 10, 20);
        }
        
        // Draw puzzle points
        if (this.puzzlePoints && this.puzzlePoints.length > 0) {
            this.puzzlePoints.forEach(point => {
                if (!point.solved) {
                    // Animated treasure chest
                    const time = Date.now() * 0.003;
                    const glow = Math.sin(time) * 0.3 + 0.7;
                    
                    this.ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
                    this.ctx.fillRect(
                        point.x * this.cellSize + 2,
                        point.y * this.cellSize + 2,
                        this.cellSize - 4,
                        this.cellSize - 4
                    );
                    
                    // Draw question mark
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = '16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        '?',
                        point.x * this.cellSize + this.cellSize / 2,
                        point.y * this.cellSize + this.cellSize / 2 + 6
                    );
                }
            });
        }
        
        // Draw doors
        if (this.doors && this.doors.length > 0) {
            this.doors.forEach(door => {
                if (!door.used) {
                    // Animated magical door
                    const time = Date.now() * 0.005;
                    const pulse = Math.sin(time) * 0.2 + 0.8;
                    
                    // Door frame
                    this.ctx.fillStyle = `rgba(139, 69, 19, ${pulse})`;
                    this.ctx.fillRect(
                        door.x * this.cellSize + 1,
                        door.y * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                    
                    // Door portal effect
                    this.ctx.fillStyle = `rgba(138, 43, 226, ${0.6 + pulse * 0.4})`;
                    this.ctx.fillRect(
                        door.x * this.cellSize + 4,
                        door.y * this.cellSize + 4,
                        this.cellSize - 8,
                        this.cellSize - 8
                    );
                    
                    // Door symbol
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        '🚪',
                        door.x * this.cellSize + this.cellSize / 2,
                        door.y * this.cellSize + this.cellSize / 2 + 3
                    );
                    
                    // Cost display
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = '8px Arial';
                    this.ctx.fillText(
                        door.cost,
                        door.x * this.cellSize + this.cellSize / 2,
                        door.y * this.cellSize + this.cellSize - 2
                    );
                }
            });
        }
        
        // Draw player (dragon)
        const playerPixelX = this.player.x * this.cellSize + (this.cellSize - this.player.size) / 2;
        const playerPixelY = this.player.y * this.cellSize + (this.cellSize - this.player.size) / 2;
        
        // Dragon body
        this.ctx.fillStyle = '#d32f2f';
        this.ctx.fillRect(playerPixelX, playerPixelY, this.player.size, this.player.size);
        
        // Dragon eyes
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.fillRect(playerPixelX + 4, playerPixelY + 4, 3, 3);
        this.ctx.fillRect(playerPixelX + 13, playerPixelY + 4, 3, 3);
        
        // Dragon flames (simple animation)
        if (Math.random() < 0.3) {
            this.ctx.fillStyle = '#ff5722';
            this.ctx.fillRect(playerPixelX - 5, playerPixelY + 8, 8, 4);
        }
        
        // Draw subtle grid lines only in sky area for Mario feel
        this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Only draw grid lines in the upper portion (sky area)
        const skyHeight = this.canvas.height * 0.6;
        
        for (let x = 0; x <= this.canvas.width; x += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, skyHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y <= skyHeight; y += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global functions for the puzzle modal
function selectAnswer(choiceIndex) {
    if (dragonGame && dragonGame.currentPuzzle) {
        dragonGame.selectAnswer(choiceIndex);
    }
}

function submitSelectedAnswer() {
    if (dragonGame && dragonGame.currentPuzzle) {
        dragonGame.submitSelectedAnswer();
    }
}

function skipPuzzle() {
    if (dragonGame && dragonGame.currentPuzzle) {
        dragonGame.skipPuzzle();
    }
}

function showRiddleStats() {
    if (dragonGame) {
        const db = dragonGame.riddleDatabase;
        const accuracy = db.totalRiddlesAnswered > 0 ? 
            Math.round((db.correctAnswers / db.totalRiddlesAnswered) * 100) : 0;
        
        const recentRiddles = db.riddleHistory.slice(-5).reverse();
        let recentHistory = recentRiddles.map(entry => 
            `📝 ${entry.question.substring(0, 40)}...\n   ${entry.isCorrect ? '✅' : '❌'} Your answer: ${entry.userAnswer}\n   Level ${entry.level} - ${new Date(entry.timestamp).toLocaleDateString()}`
        ).join('\n\n');
        
        if (recentHistory === '') {
            recentHistory = 'No riddles answered yet!';
        }
        
        const stats = `🐉 Dragon Maze - Riddle Statistics\n\n` +
                     `📊 Total Riddles: ${db.totalRiddlesAnswered}\n` +
                     `✅ Correct: ${db.correctAnswers}\n` +
                     `❌ Wrong: ${db.wrongAnswers}\n` +
                     `🎯 Accuracy: ${accuracy}%\n\n` +
                     `📚 Recent History (Last 5):\n${recentHistory}`;
        
        alert(stats);
    }
}

function clearRiddleHistory() {
    if (dragonGame) {
        const confirm_clear = confirm('Are you sure you want to clear all riddle history? This cannot be undone!');
        if (confirm_clear) {
            const emptyDb = {
                answeredRiddles: [],
                totalRiddlesAnswered: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                riddleHistory: []
            };
            dragonGame.riddleDatabase = emptyDb;
            dragonGame.saveRiddleDatabase(emptyDb);
            alert('Riddle history cleared!');
        }
    }
}

// Allow keyboard shortcuts for answer selection
document.addEventListener('keydown', (e) => {
    if (dragonGame && dragonGame.puzzleActive) {
        switch(e.key) {
            case '1':
            case 'a':
            case 'A':
                selectAnswer(0);
                break;
            case '2':
            case 'b':
            case 'B':
                selectAnswer(1);
                break;
            case '3':
            case 'c':
            case 'C':
                selectAnswer(2);
                break;
            case '4':
            case 'd':
            case 'D':
                selectAnswer(3);
                break;
            case 'Enter':
                submitSelectedAnswer();
                break;
        }
    }
});
