///<reference path="Images.ts"/>
///<reference path="Game.ts"/>
///<reference path="LevelLoader.ts"/>
var FPS = 60.0;
var PlayerInput = (function () {
    function PlayerInput(id, input) {
        this.id = id;
        this.input = input;
    }
    return PlayerInput;
})();
var Client = (function () {
    function Client() {
        this.opened = false;
        this.inputAcceleration = new Point(0.0, 0.0);
        this.playerIndex = 0;
        this.lastInputs = [];
        this.lastMessage = null;
        this.inputId = 0;
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
    Client.prototype.processMessage = function (message) {
        this.playerIndex = message.i[0];
        this.game.deserialize(message);
        var player = this.game.players[this.playerIndex];
        var lastInputIdProcessedOnServer = message.i[1];
        for (var i = 0; i < this.lastInputs.length; i++) {
            if (this.lastInputs[i].id >= lastInputIdProcessedOnServer) {
                player.inputAcceleration.x = this.lastInputs[i].input.x;
                player.inputAcceleration.y = this.lastInputs[i].input.y;
                this.game.update();
            }
            else {
                this.lastInputs.splice(0, 1);
                i--;
            }
        }
    };
    Client.prototype.draw = function () {
        var serverMessage = this.lastMessage;
        this.lastMessage = null;
        if (serverMessage != null)
            this.processMessage(serverMessage);
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
        this.inputId++;
        this.lastInputs.push(new PlayerInput(this.inputId, new Point(player.inputAcceleration.x, player.inputAcceleration.y)));
        if (serverMessage == null)
            this.game.update();
        if (this.opened && inputChanged) {
            var message = {
                i: [player.inputAcceleration.x,
                    player.inputAcceleration.y,
                    this.inputId]
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
        this.context.fillText(this.lastInputs.length.toString(), 5.0, 20.0);
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
            _this.lastMessage = JSON.parse(e.data);
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
