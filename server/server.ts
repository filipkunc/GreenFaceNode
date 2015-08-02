///<reference path="typings/tsd.d.ts"/>
///<reference path="../client/Images.ts"/>
///<reference path="../client/Game.ts"/>
///<reference path="../client/LevelLoader.ts"/>

import http = require("http")
import ws = require("ws")
import express = require("express")
import fs = require("fs")
import vm = require("vm")

function include(path: string): void
{
    //console.log("including: " + path);
    var code = fs.readFileSync(path, 'utf-8');
    vm.runInThisContext(code, path);
    //console.log("successfully included");
}

function loadJSONLevel(fileName: string, game: Game): Point
{
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

class GameServer extends ws.Server
{
    game: Game = null;
    broadcastCounter: number = 0;
    playerSpawn: Point;

    constructor(options?: ws.IServerOptions, callback?: Function)
    {
        super(options, callback);
        this.game = new Game(800, 600);
        this.playerSpawn = loadJSONLevel("Platforms.json", this.game);

        this.on('connection', client => this.clientConnected(client));
    }

    clientConnected(client: ws)
    {
        var connectedIndex = this.clients.indexOf(client);
        //console.log("connected: " + connectedIndex);

        var spawnedPlayer = new Player(this.game.width, this.game.height);
        spawnedPlayer.move(-this.playerSpawn.x, -this.playerSpawn.y);
        this.game.players.push(spawnedPlayer);

        client.on('message', message => {
            var data = JSON.parse(message);
            if (data.type == "input")
            {
                var player = this.game.players[this.clients.indexOf(client)];
                player.inputAcceleration = data.inputAcceleration;
            }
        });

        client.on('close', message => {
            //console.log("disconnected: " + connectedIndex);
            this.game.players.splice(connectedIndex, 1);
        });
    }

    gameLoop(): void
    {
        if (this.game == null)
            return;

        this.game.update();
        if (++this.broadcastCounter > 20)
        {
            this.broadcastFull();
            this.broadcastCounter = 0;
        }
        else
        {
            this.broadcastLight();
        }
    }

    broadcastLight(): void
    {
        var lightPlayers = [];
        this.game.players.forEach((player) =>
        {
            lightPlayers.push([
                player.inputAcceleration.x, player.inputAcceleration.y,
                player.x, player.y] );
        });
        var lightState = {
            type: "light",
            players: lightPlayers
        };
        var message = JSON.stringify(lightState);
        this.clients.forEach((client, index) => {
            client.send(message);
        });
    }

    broadcastFull() : void
    {
        this.clients.forEach((client, index) => {
            var fullState = this.game.serialize();
            fullState.type = "full";
            fullState.playerIndex = index;
            var message = JSON.stringify(fullState);
            client.send(message);
        });
    }
}

var app = express();

app.use(express.static(__dirname + '/../../../public'));

var port = process.env.PORT || 1337;
var server = http.createServer(app);
var gameServer = new GameServer({server:server});

server.listen(port);

setInterval(() => {
    gameServer.gameLoop();
}, 1000 / 60.0);