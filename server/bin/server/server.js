///<reference path="typings/tsd.d.ts"/>
///<reference path="../client/Images.ts"/>
///<reference path="../client/Game.ts"/>
///<reference path="../client/LevelLoader.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var http = require("http");
var ws = require("ws");
var express = require("express");
var fs = require("fs");
var vm = require("vm");
function include(path) {
    //console.log("including: " + path);
    var code = fs.readFileSync(path, 'utf-8');
    vm.runInThisContext(code, path);
    //console.log("successfully included");
}
function loadJSONLevel(fileName, game) {
    var path = __dirname + '/../../../public/Levels/' + fileName;
    var content = fs.readFileSync(path, 'utf-8');
    var levelLoader = new LevelLoader();
    return levelLoader.loadLevelJSON(JSON.parse(content), game);
}
//console.log("loading includes");
include(__dirname + "/../client/CommonTypes.js");
include(__dirname + "/../client/Platform.js");
include(__dirname + "/../client/Elevator.js");
include(__dirname + "/../client/Player.js");
include(__dirname + "/../client/Game.js");
include(__dirname + "/../client/LevelLoader.js");
var GameServer = (function (_super) {
    __extends(GameServer, _super);
    function GameServer(options, callback) {
        var _this = this;
        _super.call(this, options, callback);
        this.game = null;
        this.broadcastCounter = 0;
        this.lastInputTime = 0;
        this.game = new Game(800, 600);
        this.playerSpawn = loadJSONLevel("Platforms.json", this.game);
        this.on('connection', function (client) { return _this.clientConnected(client); });
    }
    GameServer.prototype.clientConnected = function (client) {
        var _this = this;
        var connectedIndex = this.clients.indexOf(client);
        //console.log("connected: " + connectedIndex);
        var spawnedPlayer = new Player(this.game.width, this.game.height);
        spawnedPlayer.move(-this.playerSpawn.x, -this.playerSpawn.y);
        this.game.players.push(spawnedPlayer);
        client.on('message', function (message) {
            var data = JSON.parse(message);
            var player = _this.game.players[_this.clients.indexOf(client)];
            player.inputAcceleration.x = data.i[0];
            player.inputAcceleration.y = data.i[1];
            player.lastInputId = data.i[2];
        });
        client.on('close', function (message) {
            //console.log("disconnected: " + connectedIndex);
            _this.game.players.splice(connectedIndex, 1);
        });
    };
    GameServer.prototype.gameLoop = function () {
        this.game.update();
        if (++this.broadcastCounter > 10) {
            this.broadcast();
            this.broadcastCounter = 0;
        }
        this.game.players.forEach(function (player, index) {
            player.lastInputId++;
        });
    };
    GameServer.prototype.broadcast = function () {
        var _this = this;
        this.clients.forEach(function (client, index) {
            var gameState = _this.game.serialize();
            gameState.i = [index, _this.game.players[index].lastInputId];
            var message = JSON.stringify(gameState);
            client.send(message);
        });
    };
    return GameServer;
})(ws.Server);
var app = express();
app.use(express.static(__dirname + '/../../../public'));
var port = process.env.PORT || 8888;
var server = http.createServer(app);
var gameServer = new GameServer({ server: server });
server.listen(port);
setInterval(function () {
    gameServer.gameLoop();
}, 1000 / 60.0);
