MyGame.screens['pause-menu'] = (function (game, input) {
    'use strict';
    let myKeyboard = input.Keyboard();

    function resume() {
        game.showScreen('game-play');
        game.stopMusic('menu-music');
    }

    function initialize() {
        document.getElementById('id-resume-game').addEventListener(
            'click',
            resume);

        document.getElementById('id-quit-game').addEventListener(
            'click',
            function () {
                MyGame.screens["game-play"].quitGame();
            });

        myKeyboard.register('Escape', resume);
    }

    function run() {
        game.restartMusic('menu-music');
        // game.pauseMusic('gameplay-music');
    }

    return {
        initialize: initialize,
        run: run
    };
}(MyGame.game, MyGame.input));
