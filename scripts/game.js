// ------------------------------------------------------------------
// 
// This is the game object.  Everything about the game is located in 
// this object.
//
// ------------------------------------------------------------------

MyGame.game = (function(screens) {
    'use strict';
    
    let sounds = {};

    //------------------------------------------------------------------
    //
    // This function is used to change to a new active screen.
    //
    //------------------------------------------------------------------
    function showScreen(id) {
        //
        // Remove the active state from all screens.  There should only be one...
        let active = document.getElementsByClassName('active');
        for (let screen = 0; screen < active.length; screen++) {
            active[screen].classList.remove('active');
        }
        //
        // Tell the screen to start actively running
        screens[id].run();
        //
        // Then, set the new screen to be active
        document.getElementById(id).classList.add('active');
    }


    function loadSound(source) {
        let sound = new Audio();
        sound.src = source;
        sound.cu
        
        sound.volume = 0.50;
        return sound;
    }

    function loadAudio() {
        // Reference: https://mixkit.co/free-stock-music/
        sounds['menu-music'] = loadSound('assets/audio/mixkit-hip-hop-02-738.mp3');
        // Reference: https://mixkit.co/free-stock-music/
        sounds['gameplay-music'] = loadSound('assets/audio/mixkit-raising-me-higher-34.mp3');
    }

    function pauseMusic(whichSound) {
        sounds[whichSound].pause();
    }

    function playMusic(whichSound) {
        sounds[whichSound].addEventListener('ended', function() {
            sounds[whichSound].currentTime = 2; // skip intro of song
            playMusic(whichSound);
        });
    
        sounds[whichSound].play();
    }

    function restartMusic(whichSound) {
        stopMusic(whichSound);
        playMusic(whichSound);
    }
    
    function stopMusic(whichSound) {
        sounds[whichSound].pause();
        sounds[whichSound].currentTime = 0;
    }

    //------------------------------------------------------------------
    //
    // This function performs the one-time game initialization.
    //
    //------------------------------------------------------------------
    function initialize() {

        loadAudio();

        let screen = null;
        //
        // Go through each of the screens and tell them to initialize
        for (screen in screens) {
            if (screens.hasOwnProperty(screen)) {
                screens[screen].initialize();
            }
        }
        
        //
        // Make the main-menu screen the active one
        showScreen('main-menu');
    }
    
    return {
        initialize : initialize,
        showScreen : showScreen,
        restartMusic : restartMusic,
        stopMusic : stopMusic,
        pauseMusic : pauseMusic,
        playMusic : playMusic
    };
}(MyGame.screens));
