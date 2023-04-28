MyGame.screens['about'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('id-about-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
    }
    
    function run() {
        game.playMusic('menu-music')
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
