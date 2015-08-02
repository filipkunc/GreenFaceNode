///<reference path="CommonTypes.ts"/>
///<reference path="Platform.ts"/>
///<reference path="Elevator.ts"/>
var LevelLoader = (function () {
    function LevelLoader() {
        this.xhr = null;
        this.game = null;
        this.client = null;
    }
    LevelLoader.prototype.loadLevelClient = function (levelName, game, client) {
        var _this = this;
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = function (e) { return _this.levelDataArrived(e); };
        this.game = game;
        this.client = client;
        this.xhr.open("GET", levelName, false);
        this.xhr.send();
    };
    LevelLoader.prototype.loadLevelJSON = function (data, game) {
        this.game = game;
        var gameObjects = data.gameObjects;
        var playerSpawn = data.playerSpawn;
        for (var i = 0; i < gameObjects.length; i++) {
            var state = gameObjects[i];
            if (state.type == 'Platform') {
                this.game.addGameObject(new Platform(state.x, state.y, state.widthSegments, state.heightSegments));
            }
            else if (state.type == 'Elevator') {
                this.game.addGameObject(new Elevator(state.x, state.y, state.endX, state.endY, state.widthSegments));
            }
        }
        return new Point(this.game.width / 2.0 - 32.0 - playerSpawn.x, this.game.height / 2.0 - 32.0 - playerSpawn.y);
    };
    LevelLoader.prototype.parseXML = function (xmlDoc) {
        var posX, posY, widthSegments, heightSegments;
        var playerOffsetX, playerOffsetY;
        var endX, endY;
        var x = xmlDoc.documentElement.childNodes;
        for (var i = 0; i < x.length; i++) {
            if (x[i].nodeType == 1) {
                var y = x[i].childNodes;
                for (var j = 0; j < y.length; j++) {
                    if (y[j].nodeType == 1) {
                        if (y[j].nodeName == 'x') {
                            posX = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'y') {
                            posY = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'widthSegments') {
                            widthSegments = parseInt(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'heightSegments') {
                            heightSegments = parseInt(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'endX') {
                            endX = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'endY') {
                            endY = parseFloat(y[j].textContent);
                        }
                    }
                }
                if (x[i].nodeName == 'FPPlayer') {
                    playerOffsetX = posX;
                    playerOffsetY = posY;
                }
                else if (x[i].nodeName == 'FPPlatform') {
                    this.game.addGameObject(new Platform(posX, posY, widthSegments, heightSegments));
                }
                else if (x[i].nodeName == 'FPElevator') {
                    this.game.addGameObject(new Elevator(posX, posY, endX, endY, widthSegments));
                }
            }
        }
        //this.game.moveWorld(this.game.width / 2.0 - 32.0 - playerOffsetX, this.game.height / 2.0 - 32.0 - playerOffsetY);
    };
    LevelLoader.prototype.levelDataArrived = function (e) {
        if (this.xhr.readyState == 4 && this.xhr.status == 200) {
            var xmlDoc = this.xhr.responseXML;
            this.parseXML(xmlDoc);
            this.client.startGame();
        }
    };
    return LevelLoader;
})();
