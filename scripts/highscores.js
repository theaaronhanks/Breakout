MyGame.screens['high-scores'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-high-scores-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
        document.getElementById('id-high-scores-reset').addEventListener(
            'click',
            function() { 
                localStorage.removeItem('MyGame.highScores');
                run();
            });
    }
    
    function run() {
        game.playMusic('menu-music')
        let highScores = [0, 0, 0, 0, 0]
        let previousScores = localStorage.getItem('MyGame.highScores');
        if (previousScores !== null) {
            highScores = JSON.parse(previousScores);
        }
        let scores = document.getElementById('scores')
        scores.replaceChildren();
        for(let i = 0; i < highScores.length; i++) {
            let score = document.createElement('li');
            if (highScores[i] === 0) {
                score.innerHTML = "-";
            } else {
                score.innerHTML = highScores[i];
            }
            scores.appendChild(score);
        }
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
