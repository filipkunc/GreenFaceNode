///<reference path="CommonTypes.ts"/>
///<reference path="Platform.ts"/>
///<reference path="Elevator.ts"/>

class LevelLoader
{
    xhr: XMLHttpRequest = null;
    game: IGame = null;
    client: IClient = null;

    constructor()
    {

    }

    loadLevelClient(levelName: string, game: IGame, client: IClient): void
    {
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = (e) => this.levelDataArrived(e);
        this.game = game;
        this.client = client;
        this.xhr.open("GET", levelName, false);
        this.xhr.send();
    }

    loadLevelJSON(data: any, game: IGame): Point
    {
        this.game = game;
        var gameObjects = <Array<any>>data.gameObjects;
        var playerSpawn = <Point>data.playerSpawn;

        for (var i = 0; i < gameObjects.length; i++)
        {
            var state = gameObjects[i];
            if (state.type == 'Platform')
            {
                this.game.addGameObject(new Platform(state.x, state.y, state.widthSegments, state.heightSegments));
            }
            else if (state.type == 'Elevator')
            {
                this.game.addGameObject(new Elevator(state.x, state.y, state.endX, state.endY, state.widthSegments));
            }
        }

        return new Point(
            this.game.width / 2.0 - 32.0 - playerSpawn.x,
            this.game.height / 2.0 - 32.0 - playerSpawn.y);
    }

    parseXML(xmlDoc: XMLDocument): void
    {
        var posX: number, posY: number, widthSegments: number, heightSegments: number;
        var playerOffsetX: number, playerOffsetY: number;
        var endX: number, endY: number;

        var x = xmlDoc.documentElement.childNodes;
        for (var i = 0; i < x.length; i++)
        {
            if (x[i].nodeType == 1)
            {
                var y = x[i].childNodes;
                for (var j = 0; j < y.length; j++)
                {
                    if (y[j].nodeType == 1)
                    {
                        if (y[j].nodeName == 'x')
                        {
                            posX = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'y')
                        {
                            posY = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'widthSegments')
                        {
                            widthSegments = parseInt(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'heightSegments')
                        {
                            heightSegments = parseInt(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'endX')
                        {
                            endX = parseFloat(y[j].textContent);
                        }
                        else if (y[j].nodeName == 'endY')
                        {
                            endY = parseFloat(y[j].textContent);
                        }
                    }
                }

                if (x[i].nodeName == 'FPPlayer')
                {
                    playerOffsetX = posX;
                    playerOffsetY = posY;
                }
                // else if (x[i].nodeName == 'FPExit')
                // {
                //     this.game.addGameObject(new Exit(posX, posY));
                // }
                else if (x[i].nodeName == 'FPPlatform')
                {
                    this.game.addGameObject(new Platform(posX, posY, widthSegments, heightSegments));
                }
                // else if (x[i].nodeName == 'FPMovablePlatform')
                // {
                //     this.game.addGameObject(new MovablePlatform(posX, posY, widthSegments, heightSegments));
                // }
                // else if (x[i].nodeName == 'FPDiamond')
                // {
                //     this.game.addGameObject(new Diamond(posX, posY));
                // }
                else if (x[i].nodeName == 'FPElevator')
                {
                    this.game.addGameObject(new Elevator(posX, posY, endX, endY, widthSegments));
                }
                // else if (x[i].nodeName == 'FPTrampoline')
                // {
                //     this.game.addGameObject(new Trampoline(posX, posY, widthSegments));
                // }
                // else if (x[i].nodeName == 'FPMagnet')
                // {
                //     this.game.addGameObject(new Magnet(posX, posY, widthSegments));
                // }
                // else if (x[i].nodeName == 'GFSoldier')
                // {
                //     this.game.addGameObject(new Soldier(posX, posY));
                // }
                // else if (x[i].nodeName == 'FPSpeedPowerUp')
                // {
                //     this.game.addGameObject(new SpeedPowerUp(posX, posY));
                // }
            }
        }

        //this.game.moveWorld(this.game.width / 2.0 - 32.0 - playerOffsetX, this.game.height / 2.0 - 32.0 - playerOffsetY);
    }

    levelDataArrived(e: ProgressEvent)
    {
        if (this.xhr.readyState == 4 && this.xhr.status == 200)
        {
            var xmlDoc = <XMLDocument>this.xhr.responseXML;
            this.parseXML(xmlDoc);
            this.client.startGame();
        }
    }
}
