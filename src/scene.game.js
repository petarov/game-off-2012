/*
 * The MIT License
 * 
 * Copyright (c) 2012 Petar Petrov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
Crafty.scene("main", function() {
    
    var tilemap = new Tilemap();
    var player = new Player({'tileMap': tilemap});
    
    $("#left-frame").show();
    $("#stats").show();
    
    // display active FPS (only in DEBUG mode)
    if (_Globals.conf.get('debug')) {
        Crafty.e("2D, Canvas, FPS").attr({maxValues:10}).bind("MessureFPS", function(fps) {
            $('#fps').text('FPS: ' + fps.value);
        })
        $("#fps").show();
    }        
    
    if (_Globals.conf.get('music')) {
        Crafty.audio.play("music", -1, _Globals.conf.get('music_vol'));
    }    
    
    /**
     * Triggers to update various game states
     */
     
    // UpdateStats Event - score, carrots
    Crafty.bind("UpdateStats",function() {
        $('#carrots').text('Carrots: ' + player.get('carrotsCount'));
    });
    
    // Show in-game message
    Crafty.bind("ShowMsg", function(msg) {
        if (msg == 'carrots') {
            $('#msgs').css('color','#aa0000');
            $('#msgs').text('You have no carrots to eat!');
        } else if (msg == 'clear') {
            $('#msgs').text('');
        }
    });
    
    
    /**
     * Game Loop
     */
    
    var currentEnemies = 0;
    var maxEnemies = _Globals.conf.get('startEnemiesCount');
    tilemap.set('maxCarrots', _Globals.conf.get('startCarrotsCount'));
    
    var gameTick = 0;
    var gameTimeLeft = Date.now() + _Globals.conf.get('gameTimeLimit'); 
    var gameTurnTimeLeft = Date.now() + _Globals.conf.get('gameTurnPeriod'); 
    
    Crafty.bind("EnterFrame",function(frame){
        
        var currentTime = Date.now();
        
        if (gameTimeLeft < currentTime) {
            Crafty.stop();
            var hiscore = new Hiscore();
            hiscore.addScore('You', player.get('carrotsCount'), function() {
                Crafty.trigger("ShowHiscore");    
            });       
        } else {
            // --- time left
            var leftTime = (gameTimeLeft - currentTime) / 1000;
            var leftMin = Math.floor(leftTime / 60);
            var leftSec = leftTime % 60;
            $('#timer').text('Time Left: ' + leftMin.toFixed(0) + ':' + leftSec.toFixed(2));            
        }
        
        // --- game logic
        var currentTime = Date.now();
        
        // game turn passed ?
        if (currentTime > gameTurnTimeLeft) {
            gameTurnTimeLeft = Date.now() + _Globals.conf.get('gameTurnPeriod'); 
            
            if (tilemap.get('maxCarrots') < _Globals.conf.get('maxCarrotsToSpawn')) {
                tilemap.set('maxCarrots', 
                    tilemap.get('maxCarrots') + _Globals.conf.get('carrotsPerTurn'));
            }
            
            maxEnemies += _Globals.conf.get('enemiesPerTurn');
            maxEnemies = maxEnemies > _Globals.conf.get('maxEnemiesToSpawn') 
                ? _Globals.conf.get('maxEnemiesToSpawn') : maxEnemies;
            
            // DEBUG
            if (_Globals.conf.get('debug')) {
                console.log('Turn passed! New limites carrots: %d, enemies: %d', 
                    tilemap.get('maxCarrots'),
                    maxEnemies);
            }
        }
        
        if (currentTime > gameTick) {
            tilemap.spawnCarrot();
            
            if (currentEnemies < maxEnemies) {
                new Enemy({'tileMap': tilemap});
                currentEnemies++;
            }
            
            gameTick = Date.now() + _Globals.conf.get('gameTickPeriod');
        }
    });
    
    Crafty.trigger("UpdateStats");
     
});    

