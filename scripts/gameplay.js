MyGame.screens['game-play'] = (function (game, input, graphics) {
    'use strict';

    let lastTimeStamp = performance.now();
    let cancelNextRequest = true;
    let myKeyboard = input.Keyboard();
    let myGraphics = graphics;
    let background = new Image();
    background.src = 'assets/background.png';
    background.ready = false;
    background.onload = function () {
        this.ready = true;
    };

    let blocks = [];
    let particleSystems = [];
    let remainingBlocks = 0;
    let paddle = Paddle();
    let balls = [];
    let ballsToRemove = [];
    let ballSpeedIntervals = [0, 4, 12, 36, 62]

    let highScores = [0, 0, 0, 0, 0];
    let previousScores = "";

    let state = 'inactive';
    let timer = 0;
    let countdown = 3;
    let lives = 3;
    let points = 0;
    let trackedPoints = 0;

    //------------------------------------------------------------------
    //
    // Game loop functions
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    function update(elapsedTime) {
        if (state === 'paused') return;
        for (let i = 0; i < balls.length; i++) {
            updateBallPosition(balls[i], elapsedTime);
        }
        for (let i = 0; i < particleSystems.length; i++) {
            for (let j=0; j < particleSystems[i].length; j++) {
                if (particleSystems[i][j].running) {
                    particleSystems[i][j].update(elapsedTime);
                }
            }
        }
        if (state === 'countdown') {
            timer += elapsedTime;
            if (timer >= 1000) {
                countdown--;
                timer -= 1000;
            }
        if (countdown === 2) game.playMusic('gameplay-music');
        if (countdown === 0) state = 'playing';
        }
        if (state === 'death') {
            paddle.width -= .1 * elapsedTime
            if (paddle.width < 0) paddle.width = 0;
            if (paddle.width === 0) paddle.position.y += (.15 * elapsedTime);
            if (paddle.position.y - paddle.height / 2 > myGraphics.canvas.height) {
                lives--;
                if (lives <= 0) {
                    state = 'gameover'
                    addScore(points);
                }
                else {
                    game.stopMusic('gameplay-music');
                    startRound();
                } 
            }
        }
        if (state === 'playing') {
            if (paddle.shrink) {
                paddle.width -= .1 * elapsedTime;
                if (paddle.width < paddle.originalWidth / 2) {
                    paddle.width = paddle.originalWidth / 2;
                    paddle.shrink = false;
                }
            }
            ballsToRemove.length = 0;
            for (let i = 0; i < balls.length; i++) {
                if (balls[i].position.y > myGraphics.canvas.height || balls[i].position.y < 0) {
                    ballsToRemove.push(i);
                }
            }
            for (let i = 0; i < ballsToRemove.length; i++) {
                balls.splice(ballsToRemove[i], 1);
            }
            if (balls.length < 1) {
                state = 'death';
            } else {
                handleCollisions();
                if (remainingBlocks === 0) {
                    state = 'gameover';
                    points += 70
                    points += 50 * lives;
                    addScore(points);
                }
                for (let i = 0; i < balls.length; i++) {
                    if (balls[i].blocksBroken >= ballSpeedIntervals[balls[i].ballSpeedMultiplier]) {
                        balls[i].ballSpeedMultiplier++;
                        balls[i].speed += balls[i].originalSpeed * balls[i].ballSpeedMultiplier / 8;
                    }
                }
                if (trackedPoints >= 100) {
                    let ball = Ball();
                    balls.push(ball);
                    trackedPoints -= 100;
                }
            }

        }
    }

    function render() {

        myGraphics.clear();
        myGraphics.drawTexture(
            background,
            { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height / 2 },
            0,
            { width: myGraphics.canvas.width, height: myGraphics.canvas.width }
        );
        myGraphics.drawBlocks(blocks);
        myGraphics.drawLives(lives - 1);

        if (state !== 'gameover') {
            myGraphics.drawText({
                text: "Points: " + points,
                position: { x: myGraphics.canvas.width * 3 / 4, y: myGraphics.canvas.height - 50 },
                font: '48px arial',
                fillStyle: 'cornflowerblue',
                strokeStyle: 'black',
            });
        }            

        myGraphics.drawPaddle(paddle);

        for (let i = 0; i < balls.length; i++) {
            myGraphics.drawBall(balls[i]);
        }

        myGraphics.drawAllParticles(particleSystems);

        if (state === 'countdown') {
            myGraphics.drawText({
                text: countdown,
                position: { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height / 2 },
                font: '128px arial',
                fillStyle: 'cornflowerblue',
                strokeStyle: 'black',
            });
        }
        if (state === 'gameover') {
            myGraphics.drawText({
                text: 'GAME OVER',
                position: { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height / 2 },
                font: '128px arial',
                fillStyle: 'cornflowerblue',
                strokeStyle: 'black',
            });
            myGraphics.drawText({
                text: 'FINAL SCORE: ' + points,
                position: { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height / 2 + 100 },
                font: '48px arial',
                fillStyle: 'cornflowerblue',
                strokeStyle: 'black',
            });
            myGraphics.drawText({
                text: 'Press Esc to return to the main menu',
                position: { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height / 2 + 150 },
                font: '48px arial',
                fillStyle: 'cornflowerblue',
                strokeStyle: 'black',
            });

        }
    }

    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    //------------------------------------------------------------------
    //
    // Game persistence functions
    //
    //------------------------------------------------------------------
    function addScore(value) {
        highScores.push(value);
        highScores.sort(function (a, b) { return b - a });
        while (highScores.length > 5) {
            highScores.pop();
        }
        localStorage['MyGame.highScores'] = JSON.stringify(highScores);
    }


    //------------------------------------------------------------------
    //
    // Game update and collision functions
    //
    //------------------------------------------------------------------
    function updateBallPosition(ball, elapsedTime) {
        if (state === 'countdown') {
            ball.position.x = paddle.position.x;
            ball.position.y = paddle.position.y - paddle.height / 2 - ball.radius;
        }
        else {
            ball.previousPosition.x = ball.position.x;
            ball.previousPosition.y = ball.position.y;
            ball.position.x += ball.direction.x * elapsedTime * ball.speed;
            ball.position.y += ball.direction.y * elapsedTime * ball.speed
        }
    }

    function handleCollisions() {
        for (let i = 0; i < balls.length; i++) {
            let ball = balls[i];
            handleFrameCollisions(ball);
            handlePaddleCollision(ball);
            handleBlockCollision(ball);
        }
    }

    function handleFrameCollisions(ball) {
        if (ball.position.y - ball.radius < 0) {
            ball.position.y = ball.radius;
            ball.direction.y *= -1;
        }
        if (ball.position.x - ball.radius < 0) {
            ball.position.x = ball.radius;
            ball.direction.x *= -1;
        } else if (ball.position.x + ball.radius > myGraphics.canvas.width) {
            ball.position.x = myGraphics.canvas.width - ball.radius;
            ball.direction.x *= -1;
        }
    }

    function handlePaddleCollision(ball) {
        if (ball.direction.y > 0 && ball.position.y + ball.radius >= paddle.position.y - paddle.height / 2) {
            if (intersectPaddle(ball)) {
                ball.direction.y *= -1;
                ball.position.y = paddle.position.y - paddle.height / 2 - ball.radius;
                ball.direction.x = (ball.position.x - paddle.position.x) / (paddle.width / 2);
            }
        }
    }

    function intersectPaddle(ball) {
        return ball.position.y + ball.radius >= paddle.position.y - paddle.height / 2 &&
            ball.position.y + ball.radius <= paddle.position.y + paddle.height / 2 &&
            ball.position.x >= paddle.position.x - paddle.width / 2 - paddle.height / 2 &&
            ball.position.x <= paddle.position.x + paddle.width / 2 + paddle.height / 2;
    }

    function handleBlockCollision(ball) {
        if (ball.position.y + ball.radius < Math.floor(myGraphics.canvas.height / 6)) return;
        if (ball.position.y - ball.radius > Math.ceil(myGraphics.canvas.height / 6) + blocks.length * blocks[0][0].height) return;
        for (let i = 0; i < blocks.length; i++) {
            for (let j = 0; j < blocks[i].length; j++) {
                let block = blocks[i][j];
                if (block.broken || block.breaking) continue;
                if (intersectBlock(ball, block)) {
                    breakBlock(ball, block);
                    particleSystems[i][j].activateSystem();
                    if (ball.position.y >= Math.floor(myGraphics.canvas.height / 6) + block.position.y * block.height &&
                        ball.position.y <= Math.floor(myGraphics.canvas.height / 6) + block.position.y * block.height + block.height) {
                        ball.direction.x *= -1;
                    } else {
                        ball.direction.y *= -1;
                    }
                    break
                }
            }
        }
    }

    function intersectBlock(ball, block) {
        return ball.position.y + ball.radius >= Math.floor(myGraphics.canvas.height / 6) + block.position.y * block.height &&
            ball.position.y - ball.radius <= Math.floor(myGraphics.canvas.height / 6) + block.position.y * block.height + block.height &&
            ball.position.x + ball.radius >= block.position.x * block.width &&
            ball.position.x - ball.radius <= block.position.x * block.width + block.width;
    }

    function breakBlock(ball, block) {
        block.broken = true;
        block.breaking = true;
        points += block.points;
        trackedPoints += block.points;
        let rowBroken = true;
        for (let i = 0; i < blocks[block.position.y].length; i++) {
            if (!blocks[block.position.y][i].broken) {
                rowBroken = false;
                break;
            }
        }
        if (rowBroken) {
            points += 25;
            trackedPoints += 25;
        }
        if (block.position.y === 0) {
            paddle.shrink = true;
        }
        ball.blocksBroken++;
        remainingBlocks--;
    }

    //------------------------------------------------------------------
    //
    // Custom 'Object' creation functions
    //
    //------------------------------------------------------------------
    function Paddle() {
        return {
            position: { x: myGraphics.canvas.width / 2, y: myGraphics.canvas.height * 5 / 6 },
            width: 150,
            originalWidth: 150,
            height: 20,
            speed: 1,
            shrink: false,
        }
    }

    function Ball() {
        let radius = 10;
        return {
            position: { x: paddle.position.x, y: paddle.position.y - paddle.height / 2 - radius },
            previousPosition: { x: paddle.position.x, y: paddle.position.y - paddle.height / 2 - radius },
            radius,
            direction: { x: .2, y: -1 },
            speed: 0.15,
            originalSpeed: 0.15,
            blocksBroken: 0,
            ballSpeedMultiplier: 1
        }
    }

    function Block(spec) {
        spec.broken = false;
        spec.breaking = false;
        if (spec.position.y < 2) {
            spec.color = 'green';
            spec.points = 5;
        } else if (spec.position.y < 4) {
            spec.color = 'blue';
            spec.points = 3;
        } else if (spec.position.y < 6) {
            spec.color = 'orange';
            spec.points = 2;
        } else {
            spec.color = 'yellow';
            spec.points = 1;
        }
        return spec;
    }

    //------------------------------------------------------------------
    //
    // Game setup functions
    //
    //------------------------------------------------------------------
    function runSetup() {
        lives = 3;
        points = 0;
        trackedPoints = 0;
        setBlocks();
        highScores = [0, 0, 0, 0, 0];
        previousScores = localStorage.getItem('MyGame.highScores');
        if (previousScores !== null) {
            highScores = JSON.parse(previousScores);
        }
    }

    function startRound() {

        cancelNextRequest = false;
        countdown = 3;
        timer = 0;
        // blocksBroken = 0;
        // ballSpeedMultiplier = 1;
        paddle = Paddle();
        let ball = Ball();
        balls = [ball];
        state = 'countdown';
    }

    function resumeGame() {
        lastTimeStamp = performance.now();
        game.playMusic('gameplay-music')
        cancelNextRequest = false;
        if (lives > 0 && remainingBlocks > 0) {
            countdown = 3;
            timer = 0;
            state = 'playing';
        } else {
            state = 'gameover';
        }
        requestAnimationFrame(gameLoop);
    }

    function setBlocks() {
        blocks = [];
        particleSystems = [];
        for (let i = 0; i < 8; i++) {
            blocks.push([]);
            particleSystems.push([]);
            for (let j = 0; j < 15; j++) {
                let spec = {
                    position: { x: j, y: i },
                    height: graphics.canvas.height / 3 / 8, // 8 rows of blocks to fill 1/3 of the screen
                    width: (graphics.canvas.width - 6) / 15 // 14 columns of blocks to fill the screen
                }
                let block = Block(spec);
                blocks[i].push(block)
                particleSystems[i].push(game.ParticleSystem(spec, block.color));
                remainingBlocks++;
            }
        }
        // console.log(particles)
    }

    //------------------------------------------------------------------
    //
    // Player input functions
    //
    //------------------------------------------------------------------
    function movePaddleLeft(elapsedTime) {
        if (state === "countdown" || state === "playing") {
            paddle.position.x -= elapsedTime * paddle.speed;
            if (paddle.position.x - paddle.width / 2 - paddle.height / 2 < 0) {
                paddle.position.x = paddle.width / 2 + paddle.height / 2;
            }
        }
    }

    function movePaddleRight(elapsedTime) {
        if (state === "countdown" || state === "playing") {
            paddle.position.x += elapsedTime * paddle.speed;
            if (paddle.position.x + paddle.width / 2 + paddle.height / 2 > graphics.canvas.width) {
                paddle.position.x = graphics.canvas.width - paddle.width / 2 - paddle.height / 2;
            }
        }
    }

    function pauseGame() {
        if (state === "gameover") {
            quitGame();
        } else {
            cancelNextRequest = true;
            state = "paused"
            game.pauseMusic('gameplay-music')
            game.showScreen('pause-menu');
        }
    }

    function quitGame() {
        cancelNextRequest = true;
        game.stopMusic('gameplay-music');
        state = "gameover"
        game.showScreen('main-menu');
    }

    //------------------------------------------------------------------
    //
    // Screen 'interface' functions
    //
    //------------------------------------------------------------------
    function initialize() {
        myKeyboard.register('Escape', pauseGame);
        myKeyboard.register('ArrowLeft', movePaddleLeft);
        myKeyboard.register('ArrowRight', movePaddleRight);
    }

    function run() {
        if (state === "paused") {
            resumeGame();
        } else {
            lastTimeStamp = performance.now();
            runSetup();
            startRound();
            requestAnimationFrame(gameLoop);
        }
    }

    return {
        initialize: initialize,
        run: run,
        quitGame: quitGame,
    };

}(MyGame.game, MyGame.input, MyGame.graphics));
