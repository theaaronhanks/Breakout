MyGame.screens['main-menu'] = (function(game) {
    'use strict';

    function initialize() {
        //
        // Setup each of menu events for the screens
        document.getElementById('id-new-game').addEventListener(
            'click',
            function() {
                game.showScreen('game-play'); 
                game.stopMusic('menu-music');
            });
        
        document.getElementById('id-high-scores').addEventListener(
            'click',
            function() { 
                game.showScreen('high-scores'); });
        
        document.getElementById('id-about').addEventListener(
            'click',
            function() { game.showScreen('about'); });
    }
    
    function run() {
        game.playMusic('menu-music');
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
