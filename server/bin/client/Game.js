///<reference path="CommonTypes.ts"/>
///<reference path="Player.ts"/>
var Game = (function () {
    function Game(w, h) {
        this.gameObjects = [];
        this.players = [];
        this.lastMessage = null;
        this.width = w;
        this.height = h;
    }
    Game.prototype.serialize = function () {
        var gameObjectStates = [];
        for (var i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].hasNetworkState)
                gameObjectStates.push(this.gameObjects[i].serialize());
        }
        var playerStates = [];
        for (var i = 0; i < this.players.length; i++)
            playerStates.push(this.players[i].serialize());
        return {
            gameObjectStates: gameObjectStates,
            playerStates: playerStates
        };
    };
    Game.prototype.deserialize = function (data) {
        var gameObjectStates = data.gameObjectStates;
        var playerStates = data.playerStates;
        for (var i = 0, j = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].hasNetworkState)
                this.gameObjects[i].deserialize(gameObjectStates[j++]);
        }
        if (this.players.length != playerStates.length) {
            this.players = [];
            while (playerStates.length > this.players.length)
                this.players.push(new Player(this.width, this.height));
        }
        for (var i = 0; i < playerStates.length; i++)
            this.players[i].deserialize(playerStates[i]);
    };
    Game.prototype.addGameObject = function (gameObject) {
        this.gameObjects.push(gameObject);
    };
    Game.prototype.update = function () {
        for (var i = 0; i < this.gameObjects.length; i++)
            this.gameObjects[i].update(this);
        for (var i = 0; i < this.players.length; i++)
            this.players[i].update(this);
    };
    Game.prototype.draw = function (context) {
        for (var i in this.gameObjects) {
            if (this.gameObjects[i].isVisible)
                this.gameObjects[i].draw(context);
        }
        for (var i in this.players) {
            if (this.players[i].isVisible)
                this.players[i].draw(context);
        }
        // context.fillStyle = "white";
        // context.font = "22px Helvetica Neue";
        // context.fillText("Lives: " + this.player.lives.toString(), 5.0, 20.0);
        // context.fillStyle = "black";
        // if (this.player.speedUpCounter > 0)
        // {
        //     var speedTime = (maxSpeedUpCount - this.player.speedUpCounter) / 60.0;
        //     context.fillStyle = "rgba(128, 255, 255, 0.8)";
        //     context.fillText(speedTime.toFixed(1), this.width - 40.0, this.height - 10.0);
        //     context.fillStyle = "black";
        // }
    };
    return Game;
})();
