///<reference path="CommonTypes.ts"/>
var Player = (function () {
    function Player(w, h) {
        this.moveX = 0.0;
        this.moveY = 0.0;
        this.jumping = false;
        this.speedUpCounter = 0;
        this.alpha = 1.0;
        this.isVisible = true;
        this.moveCounter = 3;
        this.jumpCounter = 0;
        this.animationCounter = 0;
        this.leftOriented = false;
        this.lives = 5;
        this.damageCounter = 0;
        this.deathCounter = 0;
        this.inputAcceleration = new Point(0.0, 0.0);
        this.lastInputId = 0;
        this.screenWidth = w;
        this.screenHeight = h;
        this.x = w / 2.0 - playerSize / 2.0;
        this.y = h / 2.0 - playerSize / 2.0;
    }
    Player.prototype.serialize = function () {
        return [
            this.x,
            this.y,
            this.moveX,
            this.moveY,
            this.jumping,
            this.leftOriented,
            this.lives
        ];
    };
    Player.prototype.deserialize = function (data) {
        this.x = data[0];
        this.y = data[1];
        this.moveX = data[2];
        this.moveY = data[3];
        this.jumping = data[4];
        this.leftOriented = data[5];
        this.lives = data[6];
    };
    Object.defineProperty(Player.prototype, "rect", {
        get: function () {
            return new Rect(this.x, this.y, playerSize, playerSize);
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.move = function (offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
    };
    Object.defineProperty(Player.prototype, "falling", {
        get: function () {
            return this.moveY < 0.0 && this.jumping;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.update = function (game) {
        if (this.lives <= 0) {
            this.animationCounter++;
            if (this.animationCounter > 10) {
                if (++this.deathCounter >= 3)
                    this.deathCounter = 1;
                this.animationCounter = 0;
            }
            return;
        }
        var moveLeftOrRight = false;
        if (this.speedUpCounter > 0) {
            if (++this.speedUpCounter > maxSpeedUpCount) {
                this.speedUpCounter = 0;
            }
        }
        var currentMaxSpeed = this.speedUpCounter > 0 ? maxSpeed * speedPowerUp : maxSpeed;
        if (this.inputAcceleration.x < 0.0) {
            if (this.moveX < 0.0)
                this.moveX += Math.abs(this.inputAcceleration.x) * acceleration * changeDirectionSpeed;
            if (this.moveX < currentMaxSpeed)
                this.moveX += Math.abs(this.inputAcceleration.x) * acceleration;
            moveLeftOrRight = true;
            this.leftOriented = true;
        }
        else if (this.inputAcceleration.x > 0.0) {
            if (this.moveX > 0.0)
                this.moveX -= Math.abs(this.inputAcceleration.x) * acceleration * changeDirectionSpeed;
            if (this.moveX > -currentMaxSpeed)
                this.moveX -= Math.abs(this.inputAcceleration.x) * acceleration;
            moveLeftOrRight = true;
            this.leftOriented = false;
        }
        if (!this.jumping && this.inputAcceleration.y > 0.0) {
            if (this.moveY < upSpeed)
                this.moveY = upSpeed;
            this.jumping = true;
        }
        if (!moveLeftOrRight) {
            if (Math.abs(this.moveX) < deceleration)
                this.moveX = 0.0;
            else if (this.moveX > 0.0)
                this.moveX -= deceleration;
            else if (this.moveX < 0.0)
                this.moveX += deceleration;
        }
        this.moveY -= deceleration;
        if (this.moveY < maxFallSpeed)
            this.moveY = maxFallSpeed;
        this.jumping = true;
        this.move(-this.moveX, 0.0);
        if (this.collisionLeftRight(game))
            this.moveX = 0.0;
        this.move(0.0, -this.moveY);
        this.collisionUpDown(game);
        this.alpha += 0.07;
        if (this.alpha > mathPi)
            this.alpha -= mathPi;
        var moveSpeed = Math.abs(this.moveX);
        if (this.jumping) {
            this.moveCounter = 3;
            this.animationCounter++;
            if (this.animationCounter > 10) {
                if (++this.jumpCounter >= 2) {
                    this.jumpCounter = 1;
                    this.animationCounter = 10;
                }
            }
        }
        else {
            this.jumpCounter = 0;
            this.animationCounter += Math.max(moveSpeed / maxSpeed, 0.6);
            if (this.animationCounter > 5) {
                if (!moveLeftOrRight && moveSpeed < 3.5) {
                    if (++this.moveCounter >= 4) {
                        this.moveCounter = 3;
                        this.animationCounter = 6;
                    }
                    else {
                        this.animationCounter = 0;
                    }
                }
                else {
                    if (++this.moveCounter >= 4)
                        this.moveCounter = 0;
                    this.animationCounter = 0;
                }
            }
        }
    };
    Player.prototype.collisionLeftRight = function (game) {
        var isColliding = false;
        for (var i in game.gameObjects) {
            var platform = game.gameObjects[i];
            if (platform.isPlatform) {
                var intersection = RectIntersection(platform.rect, this.rect);
                if (intersection.isEmptyWithTolerance)
                    continue;
                if (platform.rect.left > this.rect.left) {
                    if (platform.isMovable) {
                        platform.move(intersection.size.width, 0.0);
                        if (platform.collisionLeftRight(game)) {
                            platform.move(-intersection.size.width, 0.0);
                            this.move(-intersection.size.width, 0.0);
                            isColliding = true;
                        }
                    }
                    else {
                        this.move(-intersection.size.width, 0.0);
                        isColliding = true;
                    }
                }
                else if (platform.rect.right < this.rect.right) {
                    if (platform.isMovable) {
                        platform.move(-intersection.size.width, 0.0);
                        if (platform.collisionLeftRight(game)) {
                            platform.move(intersection.size.width, 0.0);
                            this.move(intersection.size.width, 0.0);
                            isColliding = true;
                        }
                    }
                    else {
                        this.move(intersection.size.width, 0.0);
                        isColliding = true;
                    }
                }
            }
        }
        return isColliding;
    };
    Player.prototype.collisionUpDown = function (game) {
        var isColliding = false;
        for (var i in game.gameObjects) {
            var platform = game.gameObjects[i];
            if (platform.isPlatform) {
                var intersection = RectIntersection(platform.rect, this.rect);
                if (intersection.isEmptyWithTolerance)
                    continue;
                if (platform.rect.bottom < this.rect.bottom) {
                    if (this.moveY > 0.0)
                        this.moveY = 0.0;
                    this.move(0.0, intersection.size.height);
                    isColliding = true;
                }
                else if (this.moveY < 0.0) {
                    if (platform.rect.top > this.rect.bottom - tolerance + this.moveY) {
                        this.moveY = 0.0;
                        this.jumping = false;
                        this.move(0.0, -intersection.size.height);
                        isColliding = true;
                    }
                }
                else if (platform.rect.top > this.rect.bottom - tolerance) {
                    this.jumping = false;
                    this.move(0.0, -intersection.size.height);
                    isColliding = true;
                }
            }
        }
        return isColliding;
    };
    Player.prototype.hit = function () {
        if (this.lives <= 0)
            return;
        if (this.damageCounter == 0) {
            this.damageCounter = maxDamageCounter;
            if (--this.lives <= 0) {
                this.animationCounter = 0;
                this.deathCounter = 0;
            }
        }
    };
    Player.prototype.draw = function (context) {
        context.save();
        if (this.leftOriented) {
            context.translate(this.x + playerSize, this.y);
            context.scale(-1, 1);
        }
        else {
            context.translate(this.x, this.y);
        }
        if (this.lives <= 0)
            context.drawImage(playerDeathImage[this.deathCounter], 0, 0);
        else if (this.jumping)
            context.drawImage(jumpImage[this.jumpCounter], 0, 0);
        else
            context.drawImage(playerImage[this.moveCounter], 0, 0);
        context.restore();
        if (this.damageCounter > 0) {
            var c = this.damageCounter / maxDamageCounter;
            c = Math.max(1.0 - c, 0.2);
            context.fillStyle = "rgba(255, 0, 0, " + c.toString() + ")";
            //context.fillStyle = "rgba(255, 0, 0, " + c.toString() + ")";
            context.fillRect(0, 0, this.screenWidth, this.screenHeight);
            this.damageCounter--;
        }
        if (this.speedUpCounter > 0)
            this.drawSpeedUp(context);
    };
    Player.prototype.drawSpeedUp = function (context) {
        context.globalAlpha = Math.abs(Math.sin(this.alpha)) * 0.3 + 0.1;
        context.drawImage(speedImage, this.x - playerSize / 2.0, this.y - playerSize / 2.0);
        context.globalAlpha = 1.0;
    };
    return Player;
})();
