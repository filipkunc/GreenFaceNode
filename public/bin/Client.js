///<reference path="Images.ts"/>
///<reference path="Game.ts"/>
///<reference path="LevelLoader.ts"/>
var FPS = 60.0;
var Client = (function () {
    function Client() {
        this.opened = false;
        this.inputAcceleration = new Point(0.0, 0.0);
        this.playerIndex = 0;
        this.lastTimeDiffs = [];
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.game = new Game(this.canvas.width, this.canvas.height);
    }
    Client.prototype.loadLevel = function () {
        var loader = new LevelLoader();
        loader.loadLevelClient("Levels/Platforms.xml", this.game, this);
        this.connect();
    };
    Client.prototype.startGame = function () {
        var _this = this;
        setInterval(function () { return _this.draw(); }, 1000 / FPS);
    };
    Client.prototype.draw = function () {
        if (this.playerIndex >= this.game.players.length)
            return;
        var inputChanged = false;
        var player = this.game.players[this.playerIndex];
        if (player.inputAcceleration.x != this.inputAcceleration.x ||
            player.inputAcceleration.y != this.inputAcceleration.y) {
            player.inputAcceleration.x = this.inputAcceleration.x;
            player.inputAcceleration.y = this.inputAcceleration.y;
            inputChanged = true;
        }
        this.game.update();
        if (this.opened && inputChanged) {
            var message = {
                t: "i",
                i: [this.inputAcceleration.x, this.inputAcceleration.y]
            };
            this.ws.send(JSON.stringify(message));
        }
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        var playerOffsetX = this.game.width / 2.0 - 32.0 - player.x;
        var playerOffsetY = this.game.height / 2.0 - 32.0 - player.y;
        this.context.save();
        var backgroundOffsetX = (playerOffsetX * 0.25 % 32.0) - 32.0;
        var backgroundOffsetY = (playerOffsetY * 0.25 % 32.0) - 32.0;
        this.context.drawImage(backgroundImage, backgroundOffsetX, backgroundOffsetY);
        this.context.translate(playerOffsetX, playerOffsetY);
        this.game.draw(this.context);
        this.context.restore();
        this.context.fillStyle = "white";
        this.context.font = "10px Source Code Pro";
        for (var i = 0; i < this.lastTimeDiffs.length; i++)
            this.context.fillText(this.lastTimeDiffs[i].toString() + " ms", 5.0, 20.0 + i * 10.0);
        if (this.lastTimeDiffs.length > 20) {
            this.lastTimeDiffs.splice(0, this.lastTimeDiffs.length - 20);
        }
        this.context.fillStyle = "black";
    };
    Client.prototype.connect = function () {
        var _this = this;
        var url = location.origin.replace(/^http/, 'ws');
        this.ws = new WebSocket(url);
        this.ws.onopen = function (e) {
            _this.opened = true;
        };
        this.ws.onerror = function (e) {
            console.log(e);
        };
        this.ws.onclose = function (e) {
            _this.opened = false;
        };
        this.ws.onmessage = function (e) {
            var message = JSON.parse(e.data);
            if (message.t == "f") {
                _this.playerIndex = message.i;
                _this.game.deserialize(message);
                var diff = message.d - new Date().getTime();
                _this.lastTimeDiffs.push(diff);
            }
            else if (message.t == "l") {
                var lightPlayers = message.p;
                if (_this.game.players.length == lightPlayers.length) {
                    for (var i = 0; i < lightPlayers.length; i++) {
                        if (i == _this.playerIndex)
                            continue;
                        _this.game.players[i].inputAcceleration.x = lightPlayers[i][0];
                        _this.game.players[i].inputAcceleration.y = lightPlayers[i][1];
                        _this.game.players[i].x = lightPlayers[i][2];
                        _this.game.players[i].y = lightPlayers[i][3];
                    }
                }
            }
        };
    };
    Client.prototype.disconnect = function () {
        this.opened = false;
        this.ws.close();
    };
    Client.prototype.keyDown = function (event) {
        // left
        if (event.keyCode == 37)
            this.inputAcceleration.x = -1.0;
        else if (event.keyCode == 39)
            this.inputAcceleration.x = 1.0;
        // up
        if (event.keyCode == 38)
            this.inputAcceleration.y = 1.0;
    };
    Client.prototype.keyUp = function (event) {
        if (event.keyCode == 37 || event.keyCode == 39)
            this.inputAcceleration.x = 0.0;
        if (event.keyCode == 38)
            this.inputAcceleration.y = 0.0;
    };
    return Client;
})();
window.onload = init;
var client;
function init() {
    client = new Client();
    window.onkeydown = function (ev) { return client.keyDown(ev); };
    window.onkeyup = function (ev) { return client.keyUp(ev); };
    client.loadLevel();
}
