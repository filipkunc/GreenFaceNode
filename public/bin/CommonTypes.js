var tolerance = 3.0;
var rectTolerance = 0.1;
var maxSpeed = 5.8;
var speedPowerUp = 1.5;
var upSpeed = 7.0;
var maxFallSpeed = -15.0;
var acceleration = 1.1;
var deceleration = 1.1 * 0.2;
var changeDirectionSpeed = 3.0;
var maxSpeedUpCount = 60 * 6; // 60 FPS * 6 sec
var mathPi = 3.1415926535;
var playerSize = 64.0;
var maxDamageCounter = 7;
var elevatorSpeed = 2.0;
function contains(arr, obj) {
    if (arr.indexOf(obj) != -1)
        return true;
    return false;
}
function removeItem(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == item) {
            array.splice(i, 1);
            return;
        }
    }
}
function absmax(n, max) {
    return n > 0.0 ? Math.max(n, max) : Math.min(n, -max);
}
function absmin(n, min) {
    return n > 0.0 ? Math.min(n, min) : Math.max(n, -min);
}
function lerp(a, b, w) {
    return a * (1.0 - w) + b * w;
}
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Size = (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(Size.prototype, "isEmpty", {
        get: function () {
            if (this.width <= 0.0 || this.height <= 0.0)
                return true;
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Size.prototype, "isEmptyWithTolerance", {
        get: function () {
            if (this.width <= rectTolerance || this.height <= rectTolerance)
                return true;
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return Size;
})();
var Rect = (function () {
    function Rect(x, y, width, height) {
        this.origin = new Point(x, y);
        this.size = new Size(width, height);
    }
    Object.defineProperty(Rect.prototype, "left", {
        get: function () {
            return this.origin.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "top", {
        get: function () {
            return this.origin.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "right", {
        get: function () {
            return this.origin.x + this.size.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottom", {
        get: function () {
            return this.origin.y + this.size.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "isEmpty", {
        get: function () {
            return this.size.isEmpty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "isEmptyWithTolerance", {
        get: function () {
            return this.size.isEmptyWithTolerance;
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.containsPoint = function (x, y) {
        if (x >= this.origin.x && x <= this.origin.x + this.size.width &&
            y >= this.origin.y && y <= this.origin.y + this.size.height)
            return true;
        return false;
    };
    Object.defineProperty(Rect.prototype, "center", {
        get: function () {
            return new Point(this.origin.x + this.size.width / 2.0, this.origin.y + this.size.height / 2.0);
        },
        enumerable: true,
        configurable: true
    });
    return Rect;
})();
function RectIntersection(a, b) {
    var x = Math.max(a.left, b.left);
    var y = Math.max(a.top, b.top);
    var width = Math.min(a.right, b.right) - x;
    var height = Math.min(a.bottom, b.bottom) - y;
    var intersection = new Rect(x, y, width, height);
    if (intersection.isEmpty)
        return new Rect(0.0, 0.0, 0.0, 0.0);
    return intersection;
}
function RectWithMove(rc, moveX, moveY) {
    var rect = new Rect(0.0, 0.0, 0.0, 0.0);
    rect.origin = rc.origin;
    rect.size = rc.size;
    if (moveX < 0.0) {
        rect.origin.x += moveX;
        rect.size.width -= moveX;
    }
    else {
        rect.size.width += moveX;
    }
    if (moveY < 0.0) {
        rect.origin.y += moveY;
        rect.size.height -= moveY;
    }
    else {
        rect.size.height += moveY;
    }
    return rect;
}
function RectIntersectsRect(a, b) {
    var intersection = RectIntersection(a, b);
    if (intersection.isEmpty)
        return false;
    return true;
}
function RectIntersectsRectWithTolerance(a, b) {
    var intersection = RectIntersection(a, b);
    if (intersection.isEmptyWithTolerance)
        return false;
    return true;
}
function RectFromPoints(a, b) {
    var x1 = Math.min(a.x, b.x);
    var x2 = Math.max(a.x, b.x);
    var y1 = Math.min(a.y, b.y);
    var y2 = Math.max(a.y, b.y);
    return new Rect(x1, y1, x2 - x1, y2 - y1);
}
