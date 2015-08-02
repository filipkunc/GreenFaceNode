///<reference path="Images.ts"/>
///<reference path="Game.ts"/>
///<reference path="LevelLoader.ts"/>

const FPS: number = 60.0;

class Client
{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    game: Game;
    ws: WebSocket;
    opened: boolean = false;
    inputAcceleration: Point = new Point(0.0, 0.0);
    playerIndex: number = 0;

    constructor()
    {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.game = new Game(this.canvas.width, this.canvas.height);
    }

    loadLevel(): void
    {
        var loader = new LevelLoader();
        loader.loadLevelClient("Levels/Platforms.xml", this.game, this);

        this.connect();
    }

    startGame(): void
    {
        setInterval(() => this.draw(), 1000 / FPS);
    }

    draw(): void
    {
        var player = this.game.players[this.playerIndex];
        player.inputAcceleration = this.inputAcceleration;
        this.game.update();
        var message = {
            type: "input",
            inputAcceleration: this.inputAcceleration
        };
        if (this.opened)
            this.ws.send(JSON.stringify(message));
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
    }

    connect(): void
    {
        var url = location.origin.replace(/^http/, 'ws');
        this.ws = new WebSocket(url);
        this.ws.onopen = e => {
            this.opened = true;
        };
        this.ws.onerror = e => {
            console.log(e);
        };
        this.ws.onclose = e => {
            this.opened = false;
        };
        this.ws.onmessage = e => {
            var message = JSON.parse(e.data);
            if (message.type == "gameState")
            {
                this.playerIndex = message.playerIndex;
                this.game.deserialize(message);
            }
        };
    }

    disconnect(): void
    {
        this.opened = false;
        this.ws.close();
    }

    keyDown(event: KeyboardEvent): void
    {
        // left
        if (event.keyCode == 37)
            this.inputAcceleration.x = -1.0;
        // right
        else if (event.keyCode == 39)
            this.inputAcceleration.x = 1.0;

        // up
        if (event.keyCode == 38)
            this.inputAcceleration.y = 1.0;
    }

    keyUp(event: KeyboardEvent): void
    {
        if (event.keyCode == 37 || event.keyCode == 39)
            this.inputAcceleration.x = 0.0;
        if (event.keyCode == 38)
            this.inputAcceleration.y = 0.0;
    }
}

window.onload = init;
var client: Client;

function init()
{
    client = new Client();
    window.onkeydown = ev => client.keyDown(ev);
    window.onkeyup = ev => client.keyUp(ev);
    client.loadLevel();
}