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

wss.broadcast = function broadcast(data) {
    var message = JSON.stringify(data);
    wss.clients.forEach(function each(client) {
        client.send(message);
    });
};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        players[data.id] = data.state;
    });
    // ws.on('close', function() {
//
//     });
    clientId++;
    var initMessage = {type: "init", id: clientId};
    ws.send(JSON.stringify(initMessage));
});

server.listen(port);

setInterval(function() {
    wss.broadcast({type: "playerStates", playerStates: players});
}, 100);