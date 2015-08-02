///<reference path="CommonTypes.ts"/>
///<reference path="Player.ts"/>

class Game implements IGame
{
    gameObjects: IGameObject[] = [];
    players: Player[] = [];
    width: number;
    height: number;
    lastMessage: Object = null;

    constructor(w: number, h: number)
    {
        this.width = w;
        this.height = h;
    }

    serialize(): any
    {
        var gameObjectStates = [];
        for (var i = 0; i < this.gameObjects.length; i++)
            gameObjectStates.push(this.gameObjects[i].serialize());

        var playerStates = [];
        for (var i = 0; i < this.players.length; i++)
            playerStates.push(this.players[i].serialize());

        return {
            gameObjectStates: gameObjectStates,
            playerStates: playerStates
        };
    }

    deserialize(data: any): void
    {
        var gameObjectStates = <Array<any>>data.gameObjectStates;
        var playerStates = <Array<any>>data.playerStates;
        for (var i = 0; i < gameObjectStates.length; i++)
            this.gameObjects[i].deserialize(gameObjectStates[i]);

        this.players = [];
        while (playerStates.length > this.players.length )
            this.players.push(new Player(this.width, this.height));

        for (var i = 0; i < playerStates.length; i++)
            this.players[i].deserialize(playerStates[i]);
    }

    addGameObject(gameObject: IGameObject): void
    {
        this.gameObjects.push(gameObject);
    }

    update(): void
    {
        for (var i = 0; i < this.gameObjects.length; i++)
            this.gameObjects[i].update(this);

        for (var i = 0; i < this.players.length; i++)
            this.players[i].update(this);
    }

    draw(context: CanvasRenderingContext2D): void
    {
        for (var i in this.gameObjects)
        {
            if (this.gameObjects[i].isVisible)
                this.gameObjects[i].draw(context);
        }

        for (var i in this.players)
        {
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
    }

    /*moveWorld(offsetX: number, offsetY: number): void
    {
        this.player.x -= offsetX;
        this.player.y -= offsetY;

        // for (var i in this.gameObjects)
        // {
        //     this.gameObjects[i].move(offsetX, offsetY);
        // }

        // this.worldOffsetX += offsetX;
        // this.worldOffsetY += offsetY;
        // this.backgroundOffsetX += offsetX * 0.25;
        // this.backgroundOffsetY += offsetY * 0.25;
    }*/
}
