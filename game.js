// Mario-style 2D Game
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        
        // Game state
        this.gameRunning = true;
        this.camera = { x: 0, y: 0 };
        
        // Initialize game objects
        this.player = new Player(100, 300);
        this.platforms = this.createPlatforms();
        this.enemies = this.createEnemies();
        this.coins = this.createCoins();
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    createPlatforms() {
        return [
            // Ground platforms
            new Platform(0, 350, 300, 50),
            new Platform(400, 350, 300, 50),
            new Platform(800, 350, 300, 50),
            new Platform(1200, 350, 300, 50),
            
            // Floating platforms
            new Platform(350, 280, 100, 20),
            new Platform(550, 220, 100, 20),
            new Platform(750, 160, 100, 20),
            new Platform(950, 200, 100, 20),
            new Platform(1100, 140, 100, 20),
            
            // Higher platforms
            new Platform(200, 180, 80, 20),
            new Platform(600, 100, 120, 20),
            new Platform(1000, 80, 100, 20),
        ];
    }
    
    createEnemies() {
        return [
            new Enemy(450, 330, 1),
            new Enemy(600, 200, -1),
            new Enemy(850, 330, 1),
            new Enemy(1150, 320, -1),
        ];
    }
    
    createCoins() {
        return [
            new Coin(380, 250),
            new Coin(580, 190),
            new Coin(780, 130),
            new Coin(980, 170),
            new Coin(1130, 110),
            new Coin(230, 150),
            new Coin(630, 70),
            new Coin(1030, 50),
        ];
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update player
        this.player.update(this.keys, this.platforms);
        
        // Update camera to follow player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.x = Math.max(0, this.camera.x);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.platforms);
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        
        // Check game over
        if (this.lives <= 0) {
            this.gameRunning = false;
            alert('Game Over! Final Score: ' + this.score);
        }
        
        // Check if player fell off the world
        if (this.player.y > 500) {
            this.playerDied();
        }
    }
    
    checkCollisions() {
        // Player vs Enemies
        this.enemies.forEach((enemy, index) => {
            if (enemy.alive && this.player.collidesWith(enemy)) {
                if (this.player.vy > 0 && this.player.y < enemy.y - 10) {
                    // Player jumped on enemy
                    enemy.alive = false;
                    this.player.vy = -10; // Bounce
                    this.score += 100;
                } else {
                    // Player hit enemy
                    this.playerDied();
                }
            }
        });
        
        // Player vs Coins
        this.coins.forEach((coin, index) => {
            if (coin.collected === false && this.player.collidesWith(coin)) {
                coin.collected = true;
                this.score += 50;
            }
        });
    }
    
    playerDied() {
        this.lives--;
        if (this.lives > 0) {
            // Reset player position
            this.player.x = 100;
            this.player.y = 300;
            this.player.vx = 0;
            this.player.vy = 0;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #90EE90 60%, #228B22 100%)';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transformation
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw platforms
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Draw coins
        this.coins.forEach(coin => coin.render(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Draw player
        this.player.render(this.ctx);
        
        // Restore context
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.onGround = false;
        this.gravity = 0.8;
    }
    
    update(keys, platforms) {
        // Horizontal movement
        if (keys['ArrowLeft']) {
            this.vx = -this.speed;
        } else if (keys['ArrowRight']) {
            this.vx = this.speed;
        } else {
            this.vx *= 0.8; // Friction
        }
        
        // Jumping
        if ((keys['Space'] || keys['ArrowUp']) && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }
        
        // Apply gravity
        this.vy += this.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // Top collision (landing on platform)
                if (this.vy > 0 && this.y - this.height < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Bottom collision (hitting platform from below)
                else if (this.vy < 0 && this.y > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0 && this.x - this.width < platform.x) {
                    this.x = platform.x - this.width;
                } else if (this.vx < 0 && this.x > platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                }
            }
        });
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    render(ctx) {
        // Draw Mario-like character
        ctx.fillStyle = '#ff0000'; // Red shirt
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Hat
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(this.x + 2, this.y - 5, this.width - 4, 8);
        
        // Face
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 15);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 8, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 8, 3, 3);
        
        // Mustache
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 10, this.y + 15, 10, 3);
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    render(ctx) {
        // Platform body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Platform top (grass-like)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, 5);
        
        // Platform edges
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.vx = direction * 1;
        this.vy = 0;
        this.gravity = 0.8;
        this.alive = true;
    }
    
    update(platforms) {
        if (!this.alive) return;
        
        // Apply gravity
        this.vy += this.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // Top collision
                if (this.vy > 0 && this.y - this.height < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                }
                // Side collisions - reverse direction
                else if ((this.vx > 0 && this.x - this.width < platform.x) ||
                         (this.vx < 0 && this.x > platform.x + platform.width)) {
                    this.vx *= -1;
                }
            }
        });
        
        // Reverse direction at edges (simple AI)
        if (Math.random() < 0.005) {
            this.vx *= -1;
        }
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        // Draw Goomba-like enemy
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 4, 4);
        ctx.fillRect(this.x + 16, this.y + 5, 4, 4);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 6, this.y + 6, 2, 2);
        ctx.fillRect(this.x + 17, this.y + 6, 2, 2);
        
        // Angry eyebrows
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 4, this.y + 3, 6, 2);
        ctx.fillRect(this.x + 15, this.y + 3, 6, 2);
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.collected = false;
        this.animationTime = 0;
    }
    
    render(ctx) {
        if (this.collected) return;
        
        this.animationTime += 0.1;
        
        // Animated spinning coin
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.scale(Math.cos(this.animationTime), 1);
        
        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin shine
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(-2, -2, this.width/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
