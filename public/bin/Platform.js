///<reference path="CommonTypes.ts"/>
var Platform = (function () {
    function Platform(x, y, widthSegments, heightSegments) {
        this.isVisible = true;
        this.x = x;
        this.y = y;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
    Object.defineProperty(Platform.prototype, "hasNetworkState", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Platform.prototype.serialize = function () {
        return null;
    };
    Platform.prototype.deserialize = function (data) {
    };
    Object.defineProperty(Platform.prototype, "isPlatform", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "isMovable", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "rect", {
        get: function () {
            return new Rect(this.x, this.y, this.widthSegments * 32.0, this.heightSegments * 32.0);
        },
        enumerable: true,
        configurable: true
    });
    Platform.prototype.move = function (offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
    };
    Platform.prototype.update = function (game) {
    };
    Platform.prototype.draw = function (context) {
        for (var iy = 0; iy < this.heightSegments; iy++) {
            for (var ix = 0; ix < this.widthSegments; ix++) {
                context.drawImage(platformImage, this.x + ix * 32.0, this.y + iy * 32.0);
            }
        }
    };
    Platform.prototype.collisionLeftRight = function (game) {
        return false;
    };
    return Platform;
})();
