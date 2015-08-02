///<reference path="CommonTypes.ts"/>

class Platform implements IGameObject
{
    x: number;
    y: number;
    widthSegments: number;
    heightSegments: number;
    isVisible: boolean = true;

    constructor(x: number, y: number, widthSegments: number, heightSegments: number)
    {
        this.x = x;
        this.y = y;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }

    get hasNetworkState(): boolean
    {
        return false;
    }

    serialize(): any
    {
        return null;
    }

    deserialize(data: any): void
    {

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
        return new Rect(this.x, this.y, this.widthSegments * 32.0, this.heightSegments * 32.0);
    }

    move(offsetX: number, offsetY: number): void
    {
        this.x += offsetX;
        this.y += offsetY;
    }

    update(game: IGame): void
    {

    }

    draw(context: CanvasRenderingContext2D): void
    {
        for (var iy = 0; iy < this.heightSegments; iy++)
        {
            for (var ix = 0; ix < this.widthSegments; ix++)
            {
                context.drawImage(platformImage, this.x + ix * 32.0, this.y + iy * 32.0);
            }
        }
    }

    collisionLeftRight(game: IGame): boolean
    {
        return false;
    }
}
