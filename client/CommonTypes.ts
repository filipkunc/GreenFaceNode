const tolerance = 3.0;
const rectTolerance = 0.1;
const maxSpeed = 5.8;
const speedPowerUp = 1.5;
const upSpeed = 7.0;
const maxFallSpeed = -15.0;
const acceleration = 1.1;
const deceleration = 1.1 * 0.2;
const changeDirectionSpeed = 3.0;
const maxSpeedUpCount = 60 * 6; // 60 FPS * 6 sec
const mathPi = 3.1415926535;
const playerSize = 64.0;
const maxDamageCounter = 7;
const elevatorSpeed = 2.0;

function contains<T>(arr: T[], obj: T): boolean
{
    if (arr.indexOf(obj) != -1)
        return true;
    return false;
}

function removeItem<T>(array: T[], item: T)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] == item)
        {
            array.splice(i, 1);
            return;
        }
    }
}

function absmax(n: number, max: number): number
{
	return n > 0.0 ? Math.max(n, max) : Math.min(n, -max);
}

function absmin(n: number, min: number): number
{
	return n > 0.0 ? Math.min(n, min) : Math.max(n, -min);
}

function lerp(a: number, b: number, w: number): number
{
	return a * (1.0 - w) + b * w;
}

class Point
{
    x: number;
    y: number;

    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }
}

class Size
{
    width: number;
    height: number;

    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
    }

    get isEmpty(): boolean
    {
        if (this.width <= 0.0 || this.height <= 0.0)
            return true;
        return false;
    }

    get isEmptyWithTolerance(): boolean
    {
        if (this.width <= rectTolerance || this.height <= rectTolerance)
            return true;
        return false;
    }
}

class Rect
{
    origin: Point;
    size: Size;

    constructor(x: number, y: number, width: number, height: number)
    {
        this.origin = new Point(x, y);
        this.size = new Size(width, height);
    }

    get left(): number
    {
        return this.origin.x;
    }

    get top(): number
    {
        return this.origin.y;
    }

    get right(): number
    {
        return this.origin.x + this.size.width;
    }

    get bottom(): number
    {
        return this.origin.y + this.size.height;
    }

    get isEmpty(): boolean
    {
        return this.size.isEmpty;
    }

    get isEmptyWithTolerance(): boolean
    {
        return this.size.isEmptyWithTolerance;
    }

    containsPoint(x: number, y: number): boolean
    {
        if (x >= this.origin.x && x <= this.origin.x + this.size.width &&
            y >= this.origin.y && y <= this.origin.y + this.size.height)
            return true;
        return false;
    }

    get center(): Point
    {
        return new Point(this.origin.x + this.size.width / 2.0, this.origin.y + this.size.height / 2.0);
    }
}

function RectIntersection(a: Rect, b: Rect): Rect
{
    var x = Math.max(a.left, b.left);
    var y = Math.max(a.top, b.top);

    var width = Math.min(a.right, b.right) - x;
    var height = Math.min(a.bottom, b.bottom) - y;

    var intersection = new Rect(x, y, width, height);

    if (intersection.isEmpty)
        return new Rect(0.0, 0.0, 0.0, 0.0);
    return intersection;
}

function RectWithMove(rc: Rect, moveX: number, moveY: number): Rect
{
    var rect = new Rect(0.0, 0.0, 0.0, 0.0);
    rect.origin = rc.origin;
    rect.size = rc.size;

    if (moveX < 0.0)
    {
        rect.origin.x += moveX;
        rect.size.width -= moveX;
    }
    else
    {
        rect.size.width += moveX;
    }

    if (moveY < 0.0)
	{
		rect.origin.y += moveY;
		rect.size.height -= moveY;
	}
	else
	{
		rect.size.height += moveY;
	}

	return rect;
}

function RectIntersectsRect(a: Rect, b: Rect): boolean
{
    var intersection = RectIntersection(a, b);
    if (intersection.isEmpty)
        return false;
    return true;
}

function RectIntersectsRectWithTolerance(a: Rect, b: Rect): boolean
{
    var intersection = RectIntersection(a, b);
    if (intersection.isEmptyWithTolerance)
        return false;
    return true;
}

function RectFromPoints(a: Point, b: Point): Rect
{
    var x1 = Math.min(a.x, b.x);
    var x2 = Math.max(a.x, b.x);
    var y1 = Math.min(a.y, b.y);
    var y2 = Math.max(a.y, b.y);

    return new Rect(x1, y1, x2 - x1, y2 - y1);
}

interface IGameObject
{
    isVisible: boolean;
    isPlatform: boolean;
    isMovable: boolean;
    hasNetworkState: boolean;
    rect: Rect;
    update(game: IGame): void;
    draw(context: CanvasRenderingContext2D): void;
    move(offsetX: number, offsetY: number): void;
    collisionLeftRight(game: IGame): boolean;
    serialize(): any;
    deserialize(data: any): void;
}

interface IPlayer
{
    inputAcceleration: Point;
    rect: Rect;
    update(game: IGame): void;
    draw(context: CanvasRenderingContext2D): void;
    move(offsetX: number, offsetY: number): void;
    collisionLeftRight(game: IGame): boolean;
    collisionUpDown(game: IGame): boolean;
    serialize(): any;
    deserialize(data: any): void;
}

interface IGame
{
    gameObjects: IGameObject[];
    players: IPlayer[];
    width: number;
    height: number;
    addGameObject(gameObject: IGameObject): void;
    serialize(): any;
    deserialize(data: any): void;
}

interface IClient
{
    startGame(): void;
}