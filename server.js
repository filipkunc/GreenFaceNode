var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 1337;
var server = http.createServer(app);

var clientId = 0;

var wss = new WebSocketServer({server: server});

wss.broadcast = function broadcast() {
    var playerStates = {};
    wss.clients.forEach(function each(client) {
        playerStates[client.clientId] = client.playerState;
    });    
    wss.clients.forEach(function each(client) {
        var message = JSON.stringify({
            type: "playerStates", 
            id: client.clientId, 
            playerStates: playerStates
        });
        client.send(message);
    });
};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        ws.playerState = data.state;
    });
    clientId++;
    ws.clientId = clientId;
    ws.playerState = null;
});

server.listen(port);

setInterval(function() {
    wss.broadcast();
}, 100);