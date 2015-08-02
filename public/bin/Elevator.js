///<reference path="CommonTypes.ts"/>
var Elevator = (function () {
    function Elevator(x, y, endX, endY, widthSegments) {
        this.textureIndex = 0;
        this.animationCounter = 0;
        this.movingToEnd = true;
        this.isVisible = true;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.widthSegments = widthSegments;
    }
    Elevator.prototype.serialize = function () {
        return {
            type: "Elevator",
            x: this.x,
            y: this.y,
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
            widthSegments: this.widthSegments,
            textureIndex: this.textureIndex,
            animationCounter: this.animationCounter,
            movingToEnd: this.movingToEnd
        };
    };
    Elevator.prototype.deserialize = function (data) {
        this.x = data.x;
        this.y = data.y;
        this.startX = data.startX;
        this.startY = data.startY;
        this.endX = data.endX;
        this.endY = data.endY;
        this.widthSegments = data.widthSegments;
        this.textureIndex = data.textureIndex;
        this.animationCounter = data.animationCounter;
        this.movingToEnd = data.movingToEnd;
    };
    Object.defineProperty(Elevator.prototype, "isPlatform", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Elevator.prototype, "isMovable", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Elevator.prototype, "rect", {
        get: function () {
            return new Rect(this.x, this.y, this.widthSegments * 32.0, 32.0);
        },
        enumerable: true,
        configurable: true
    });
    Elevator.prototype.move = function (offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
        this.startX += offsetX;
        this.startY += offsetY;
        this.endX += offsetX;
        this.endY += offsetY;
    };
    Elevator.prototype.elevatorCollision = function (game, diffX, diffY) {
        var moveRect = RectWithMove(this.rect, diffX, diffY);
        for (var i = 0; i < game.players.length; i++) {
            var player = game.players[i];
            var playerRect = player.rect;
            playerRect.size.height += tolerance;
            if (RectIntersectsRectWithTolerance(playerRect, moveRect)) {
                player.move(diffX, 0.0);
                player.collisionLeftRight(game);
                player.move(0.0, diffY);
            }
        }
    };
    Elevator.prototype.update = function (game) {
        var diffX = 0.0, diffY = 0.0;
        if (this.movingToEnd) {
            diffX = this.endX - this.x;
            diffY = this.endY - this.y;
        }
        else {
            diffX = this.startX - this.x;
            diffY = this.startY - this.y;
        }
        diffX = absmin(diffX, elevatorSpeed);
        diffY = absmin(diffY, elevatorSpeed);
        if (Math.abs(diffX) < 0.1 && Math.abs(diffY) < 0.1) {
            this.movingToEnd = !this.movingToEnd;
        }
        this.elevatorCollision(game, diffX, diffY);
        this.x += diffX;
        this.y += diffY;
        if (this.textureIndex > 2)
            this.textureIndex = 2;
        if (this.textureIndex < 0)
            this.textureIndex = 0;
        if (diffY < 0.0) {
            if (++this.animationCounter > 2) {
                this.animationCounter = 0;
                if (++this.textureIndex >= 2)
                    this.textureIndex = 2;
            }
        }
        else if (diffY > 0.0) {
            if (++this.animationCounter > 2) {
                this.animationCounter = 0;
                if (--this.textureIndex < 0)
                    this.textureIndex = 0;
            }
        }
        else {
            this.textureIndex = 1;
        }
    };
    Elevator.prototype.draw = function (context) {
        for (var ix = 0; ix < this.widthSegments; ix++) {
            context.drawImage(elevatorImage[this.textureIndex], this.x + ix * 32.0, this.y);
        }
    };
    Elevator.prototype.collisionLeftRight = function (game) {
        return false;
    };
    return Elevator;
})();
