MyGame.graphics = (function () {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --------------------------------------------------------------
    //
    // Draws a texture to the canvas with the following specification:
    //    image: Image
    //    center: {x: , y: }
    //    size: { width: , height: }
    //
    // --------------------------------------------------------------
    function drawTexture(image, center, rotation, size) {
        context.save();

        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        context.drawImage(
            image,
            center.x - size.width / 2,
            center.y - size.height / 2,
            size.width, size.height);

        context.restore();
    }

    function drawBall(ball) {
        context.save();
        context.beginPath();
        context.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = 'rgba(200, 0, 20, 1)';
        context.strokeStyle = 'black';
        context.fill();
        context.stroke();
        context.restore();
    }

    function drawBlock(block) {
        context.save();
        if (block.breaking) {
            // draw particles
        }

        let margin = 4;
        let startY = Math.floor(canvas.height / 6);
        context.fillStyle = block.color;
        context.strokeStyle = 'black';
        context.fillRect(block.position.x * block.width + margin, startY + block.position.y * block.height + margin, block.width - margin, block.height - margin);
        context.strokeRect(block.position.x * block.width + margin, startY + block.position.y * block.height + margin, block.width - margin, block.height - margin);
        context.restore();
    }

    function drawBlocks(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            for (let j = 0; j < blocks[i].length; j++) {
                if (!blocks[i][j].broken) drawBlock(blocks[i][j]);
            }
        }
    }

    function drawPaddle(paddle) {
        let width = paddle.width;
        let height = paddle.height;

        context.save();
        context.beginPath();
        context.arc(paddle.position.x - width / 2, paddle.position.y, height / 2, 0, 2 * Math.PI);
        context.moveTo(paddle.position.x + width / 2, paddle.position.y);
        context.arc(paddle.position.x + width / 2, paddle.position.y, height / 2, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
        context.fillStyle = 'rgba(200, 60, 200, 1)';
        context.fill();
        if (paddle.width > 0) {
            context.fillStyle = 'pink';
            context.fillRect(paddle.position.x - width / 2, paddle.position.y - height / 2, width, height);
            context.strokeRect(paddle.position.x - width / 2, paddle.position.y - height / 2, width, height);
        }
        context.restore();
    }

    function drawLives(lives) {
        for (let i = 0; i < lives; i++) {
            drawPaddle({ position: { x: 50 + i * 50, y: canvas.height - 50 }, width: 0, height: 20 })
        }
    }


    function drawText(spec) {

        context.save();

        context.font = spec.font;
        let width = context.measureText(spec.text).width;
        let height = context.measureText('m').width;
        context.fillStyle = spec.fillStyle;
        context.strokeStyle = spec.strokeStyle;
        context.textBaseline = 'top';

        context.translate(spec.position.x + width / 2, spec.position.y + height / 2);
        context.rotate(spec.rotation);
        context.translate(-(spec.position.x + width / 2), -(spec.position.y + height / 2));

        context.fillText(spec.text, spec.position.x - width / 2, spec.position.y - height / 2);
        context.strokeText(spec.text, spec.position.x - width / 2, spec.position.y - height / 2);

        context.restore();
    }

    function drawAllParticles(particleSystems) {
        for (let i = 0; i < particleSystems.length; i++) {
            for (let j = 0; j < particleSystems[i].length; j++) {
                if (particleSystems[i][j].running) drawParticleSystem(particleSystems[i][j]);
            }
        }
    }

    function drawParticleSystem(system) {
        Object.getOwnPropertyNames(system.particles).forEach(function (value) {
            let particle = system.particles[value];
            let startY = Math.floor(canvas.height / 6);

            context.save();
            context.translate(particle.center.x, startY + particle.center.y );
            context.rotate(particle.rotation);
            context.translate(-particle.center.x, -(startY + particle.center.y));


            context.fillStyle = particle.color;
            context.strokeStyle = "black";
            context.fillRect(particle.center.x - particle.size.x / 2, startY + particle.center.y - particle.size.y / 2, particle.size.x, particle.size.y);
            context.strokeRect(particle.center.x - particle.size.x / 2, startY + particle.center.y - particle.size.y / 2, particle.size.x, particle.size.y);

            context.restore();
        });
    }

    let api = {
        get canvas() { return canvas; },
        clear: clear,
        drawBlocks: drawBlocks,
        drawBall: drawBall,
        drawPaddle: drawPaddle,
        drawLives: drawLives,
        drawAllParticles: drawAllParticles,
        drawTexture: drawTexture,
        drawText: drawText
    };

    return api;
}());
