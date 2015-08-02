///<reference path="CommonTypes.ts"/>

class Elevator implements IGameObject
{
    x: number;
    y: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    widthSegments: number;
    textureIndex: number = 0;
    animationCounter: number = 0;
    movingToEnd: boolean = true;
    isVisible: boolean = true;

    constructor(x: number, y: number, endX: number, endY: number, widthSegments: number)
    {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.widthSegments = widthSegments;
    }

    get hasNetworkState(): boolean
    {
        return true;
    }

    serialize(): any
    {
        return [
            this.x,
            this.y,
            this.movingToEnd
        ];
    }

    deserialize(data: any): void
    {
        this.x = data[0];
        this.y = data[1];
        this.movingToEnd = data[2];
    }

    get isPlatform(): boolean
    {
        return true;
    }

    get isMovable(): boolean
    {
        return false;
    }

    get rect(): Rect
    {
        return new Rect(this.x, this.y, this.widthSegments * 32.0, 32.0);
    }

    move(offsetX: number, offsetY: number): void
    {
        this.x += offsetX;
        this.y += offsetY;
        this.startX += offsetX;
        this.startY += offsetY;
        this.endX += offsetX;
        this.endY += offsetY;
    }

    elevatorCollision(game: IGame, diffX: number, diffY: number): void
    {
        var moveRect = RectWithMove(this.rect, diffX, diffY);

        for (var i = 0; i < game.players.length; i++)
        {
            var player = game.players[i];

            var playerRect = player.rect;
            playerRect.size.height += tolerance;

            if (RectIntersectsRectWithTolerance(playerRect, moveRect))
            {
                player.move(diffX, 0.0);
                player.collisionLeftRight(game);
                player.move(0.0, diffY);
            }
        }
    }

    update(game: IGame): void
    {
        var diffX = 0.0, diffY = 0.0;

    	if (this.movingToEnd)
    	{
    		diffX = this.endX - this.x;
    		diffY = this.endY - this.y;
    	}
    	else
    	{
    		diffX = this.startX - this.x;
    		diffY = this.startY - this.y;
    	}

    	diffX = absmin(diffX, elevatorSpeed);
    	diffY = absmin(diffY, elevatorSpeed);

    	if (Math.abs(diffX) < 0.1 && Math.abs(diffY) < 0.1)
    	{
    		this.movingToEnd = !this.movingToEnd;
    	}

        this.elevatorCollision(game, diffX, diffY);

        this.x += diffX;
        this.y += diffY;

    	if (this.textureIndex > 2)
    		this.textureIndex = 2;

    	if (this.textureIndex < 0)
    		this.textureIndex = 0;

    	if (diffY < 0.0)
    	{
    		if (++this.animationCounter > 2)
    		{
    			this.animationCounter = 0;
    			if (++this.textureIndex >= 2)
    				this.textureIndex = 2;
    		}
    	}
    	else if (diffY > 0.0)
    	{
    		if (++this.animationCounter > 2)
    		{
    			this.animationCounter = 0;
    			if (--this.textureIndex < 0)
    				this.textureIndex = 0;
    		}
    	}
    	else
    	{
    		this.textureIndex = 1;
    	}
    }

    draw(context: CanvasRenderingContext2D): void
    {
        for (var ix = 0; ix < this.widthSegments; ix++)
        {
            context.drawImage(elevatorImage[this.textureIndex], this.x + ix * 32.0, this.y);
        }
    }

    collisionLeftRight(game: IGame): boolean
    {
        return false;
    }
}