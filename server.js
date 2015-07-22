var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 1337;
var server = http.createServer(app);

var clientId = 0;
var players = {};

var wss = new WebSocketServer({server: server});

wss.broadcast = function broadcast(players) {
    var playerStates = {};
    for (var ws in players)
        playerStates[players[ws].id] = players[ws].state;
    console.log(playerStates);
    wss.clients.forEach(function each(client) {
        var message = JSON.stringify({
            type: "playerStates", 
            id: players[client].id, 
            playerStates: playerStates
        });
        client.send(message);
    });
};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        players[ws].state = data.state;
    });
    ws.on('close', function() {
        console.log("close - clientId: %s", players[ws].id);
        delete players[ws];
    });
    clientId++;
    players[ws] = {id:clientId, state:null};
    console.log("connection - clientId: %s", clientId);
});

server.listen(port);

setInterval(function() {
    wss.broadcast(players);
}, 100);