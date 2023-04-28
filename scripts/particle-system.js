//------------------------------------------------------------------
//
// This is the particle system use by the game code
//
//------------------------------------------------------------------
MyGame.game.ParticleSystem = function(spec, color) {
    'use strict';
    let nextName = 1;       // Unique identifier for the next particle
    let particles = {};
    let running = false;
    // helpers to gaussian random number generation
    let usePrevious = false;
    let y2;

    for (let i = 0; i < 30; i++) {
        let pspec = {
            center: { x: 0, y: 0 },
            size: { x: 5, y: 5 },
            speed: { mean: 50, stdev: 25 },
            lifetime: { mean: 1, stdev: 0.25 },
            color: color
        }

        let minx = spec.position.x * spec.width;
        let miny = spec.position.y * spec.height;
        pspec.center.x = nextRange(minx, minx + spec.width);
        pspec.center.y = nextRange(miny, miny + spec.height);

        let p = create(pspec);
        particles[nextName++] = p;
    }  

    //------------------------------------------------------------------
    //
    // This creates one new particle
    //
    //------------------------------------------------------------------
    function create(spec) {
        let p = {
                center: {x: spec.center.x, y: spec.center.y},
                size: { x: spec.size.x, y: spec.size.y },
                direction: {x: 0, y: 1},
                speed: nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
                rotation: 0,
                lifetime: nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),    // How long the particle should live, in seconds
                alive: 0,   // How long the particle has been alive, in seconds
                color: spec.color
            };

        return p;
    }

    function activateSystem() {
        running = true;
    }


    //------------------------------------------------------------------
    //
    // Some random helper functions
    //
    //------------------------------------------------------------------
    function nextRange(min, max) {
        let range = max - min;
        return Math.floor((Math.random() * range) + min);
    }

    
    function nextGaussian(mean, stdDev) {
        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let z = 0;

        if (usePrevious) {
            usePrevious = false;
            return mean + y2 * stdDev;
        }

        usePrevious = true;

        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            z = (x1 * x1) + (x2 * x2);
        } while (z >= 1);
        
        z = Math.sqrt((-2 * Math.log(z)) / z);
        y1 = x1 * z;
        y2 = x2 * z;
        
        return mean + y1 * stdDev;
    }

    //------------------------------------------------------------------
    //
    // Update the state of all particles.  This includes removing any that have exceeded their lifetime.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        let removeMe = [];

        //
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsedTime = elapsedTime / 1000;
        
        Object.getOwnPropertyNames(particles).forEach(function(value, index, array) {
            let particle = particles[value];
            //
            // Update how long it has been alive
            particle.alive += elapsedTime;

            //
            // Update its center
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            //
            // Rotate proportional to its speed
            particle.rotation += particle.speed / 500;

            //
            // If the lifetime has expired, identify it for removal
            if (particle.alive > particle.lifetime) {
                removeMe.push(value);
            }
        });

        //
        // Remove all of the expired particles
        for (let particle = 0; particle < removeMe.length; particle++) {
            delete particles[removeMe[particle]];
        }
        removeMe.length = 0;
    }

    let api = {
        update: update,
        activateSystem: activateSystem,
        get running() { return running; },
        get particles() { return particles; }
    };

    return api;
}
