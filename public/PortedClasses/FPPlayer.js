// Copyright 2010 Filip Kunc. All rights reserved.

var playerImage = new Array();
playerImage[0] = new Image();
playerImage[0].src = "Images/W_01.png";
playerImage[1] = new Image();
playerImage[1].src = "Images/W_02.png";
playerImage[2] = new Image();
playerImage[2].src = "Images/W_03.png";
playerImage[3] = new Image();
playerImage[3].src = "Images/W_04.png";

var jumpImage = new Array();
jumpImage[0] = new Image();
jumpImage[0].src = "Images/WJ_01.png";
jumpImage[1] = new Image();
jumpImage[1].src = "Images/WJ_02.png";

var playerDeathImage = new Array();
playerDeathImage[0] = new Image();
playerDeathImage[0].src = "Images/WD_01.png";
playerDeathImage[1] = new Image();
playerDeathImage[1].src = "Images/WD_02.png";
playerDeathImage[2] = new Image();
playerDeathImage[2].src = "Images/WD_03.png";

var speedImage = new Image();
speedImage.src = "Images/speed.png";

const tolerance = 3.0;
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

function FPPlayerFactory()
{
    this.image = playerImage[3];
    
    this.create = function(levelObjects, x, y)
    {
        var player = new FPPlayer();
        player.x = x;
        player.y = y;
        levelObjects.push(player);
    }    
}

function FPPlayer(w, h)
{
    this.worldOffsetX = 0.0;
    this.worldOffsetY = 0.0;
    this.x = w / 2.0 - playerSize / 2.0;
    this.y = h / 2.0 - playerSize / 2.0;
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
    this.selected = false;
    this.lives = 5;
    this.damageCounter = 0;
    this.deathCounter = 0;
    
    this.getPlayerState = function(game)
    {
        return {
            x: this.x - this.worldOffsetX,
            y: this.y - this.worldOffsetY,
            moveX: this.moveX,
            moveY: this.moveY,
            jumping: this.jumping,
            speedUpCounter: this.speedUpCounter,
            alpha: this.alpha,
            moveCounter: this.moveCounter,
            jumpCounter: this.jumpCounter,
            animationCounter: this.animationCounter,
            leftOriented: this.leftOriented,
            lives: this.lives,
            damageCounter: this.damageCounter,
            deathCounter: this.deathCounter,
            jumpCounter: this.jumpCounter,
            inputAcceleration: game.inputAcceleration
        };
    }
    
    this.rect = function()
    {
        return new FPRect(this.x, this.y, playerSize, playerSize);
    }
    
    this.move = function(offsetX, offsetY)
    {
        this.x += offsetX;
        this.y += offsetY;
    }
    
    this.falling = function()
    {
        return this.moveY < 0.0 && this.jumping;
    }
    
    this.updateState = function(playerState)
    {
        if (playerState.lives <= 0)
        {
            playerState.animationCounter++;

            if (playerState.animationCounter > 10)
            {
                if (++playerState.deathCounter >= 3)
                    playerState.deathCounter = 1;
                playerState.animationCounter = 0;
            }

            return;
        }
        
        var inputAcceleration = playerState.inputAcceleration;
    	var moveLeftOrRight = false;
    	
    	if (playerState.speedUpCounter > 0)
    	{
    	    if (++playerState.speedUpCounter > maxSpeedUpCount)
    	    {
    	        playerState.speedUpCounter = 0;
	        }
	    }
	    
	    var currentMaxSpeed = playerState.speedUpCounter > 0 ? maxSpeed * speedPowerUp : maxSpeed;
	    
    	if (inputAcceleration.x < 0.0)
    	{
    		if (playerState.moveX < 0.0)
    			playerState.moveX += Math.abs(inputAcceleration.x) * acceleration * changeDirectionSpeed;
    		if (playerState.moveX < currentMaxSpeed)
    			playerState.moveX += Math.abs(inputAcceleration.x) * acceleration;
    		moveLeftOrRight = true;
    		playerState.leftOriented = true;
    	}
    	else if (inputAcceleration.x > 0.0)
    	{
    		if (playerState.moveX > 0.0)
    			playerState.moveX -= Math.abs(inputAcceleration.x) * acceleration * changeDirectionSpeed;
    		if (playerState.moveX > -currentMaxSpeed)
    			playerState.moveX -= Math.abs(inputAcceleration.x) * acceleration;
    		moveLeftOrRight = true;
    		playerState.leftOriented = false;
    	}
    	if (!playerState.jumping && inputAcceleration.y > 0.0)
    	{
    		if (playerState.moveY < upSpeed)
    			playerState.moveY = upSpeed;
    		playerState.jumping = true;
    	}

    	if (!moveLeftOrRight)
    	{
    		if (Math.abs(playerState.moveX) < deceleration)
    			playerState.moveX = 0.0;
    		else if (playerState.moveX > 0.0)
    			playerState.moveX -= deceleration;
    		else if (playerState.moveX < 0.0)
    			playerState.moveX += deceleration;
    	}	

        playerState.moveY -= deceleration;
        if (playerState.moveY < maxFallSpeed)
        	playerState.moveY = maxFallSpeed;
    	playerState.jumping = true;
    	
        playerState.x -= playerState.moveX;
        if (this.collisionLeftRightState(game, playerState))
            playerState.moveX = 0.0;
        playerState.y -= playerState.moveY;
        this.collisionUpDownState(game, playerState);
    	
    	playerState.alpha += 0.07;
    	if (playerState.alpha > mathPi)
    	    playerState.alpha -= mathPi;
    	    
    	var moveSpeed = Math.abs(playerState.moveX);

        if (playerState.jumping)
        {
            playerState.moveCounter = 3;
            playerState.animationCounter++;

            if (playerState.animationCounter > 10)
            {
                if (++playerState.jumpCounter >= 2)
                {
                    playerState.jumpCounter = 1;
                    playerState.animationCounter = 10;
                }
            }
        }
        else
        {
            playerState.jumpCounter = 0;
            playerState.animationCounter += Math.max(moveSpeed / maxSpeed, 0.6);

            if (playerState.animationCounter > 5)
            {
                if (!moveLeftOrRight && moveSpeed < 3.5)
                {
                    if (++playerState.moveCounter >= 4)
                    {
                        playerState.moveCounter = 3;
                        playerState.animationCounter = 6;
                    }
                    else
                    {
                        playerState.animationCounter = 0;
                    }            
                }
                else
                {
                    if (++playerState.moveCounter >= 4)
                        playerState.moveCounter = 0;
                    playerState.animationCounter = 0;
                }
            }
        }
    }        
    
    this.update = function(game)
    {
        if (this.lives <= 0)
        {
            this.animationCounter++;

            if (this.animationCounter > 10)
            {
                if (++this.deathCounter >= 3)
                    this.deathCounter = 1;
                this.animationCounter = 0;
            }

            return;
        }
        
        var inputAcceleration = game.inputAcceleration;
    	var moveLeftOrRight = false;
    	
    	if (this.speedUpCounter > 0)
    	{
    	    if (++this.speedUpCounter > maxSpeedUpCount)
    	    {
    	        this.speedUpCounter = 0;
	        }
	    }
	    
	    var currentMaxSpeed = this.speedUpCounter > 0 ? maxSpeed * speedPowerUp : maxSpeed;
	    
    	if (inputAcceleration.x < 0.0)
    	{
    		if (this.moveX < 0.0)
    			this.moveX += Math.abs(inputAcceleration.x) * acceleration * changeDirectionSpeed;
    		if (this.moveX < currentMaxSpeed)
    			this.moveX += Math.abs(inputAcceleration.x) * acceleration;
    		moveLeftOrRight = true;
    		this.leftOriented = true;
    	}
    	else if (inputAcceleration.x > 0.0)
    	{
    		if (this.moveX > 0.0)
    			this.moveX -= Math.abs(inputAcceleration.x) * acceleration * changeDirectionSpeed;
    		if (this.moveX > -currentMaxSpeed)
    			this.moveX -= Math.abs(inputAcceleration.x) * acceleration;
    		moveLeftOrRight = true;
    		this.leftOriented = false;
    	}
    	if (!this.jumping && inputAcceleration.y > 0.0)
    	{
    		if (this.moveY < upSpeed)
    			this.moveY = upSpeed;
    		this.jumping = true;
    	}

    	if (!moveLeftOrRight)
    	{
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
    	
    	game.moveWorld(this.moveX, 0.0);
    	if (this.collisionLeftRight(game))
    		this.moveX = 0.0;
    	game.moveWorld(0.0, this.moveY);
    	this.collisionUpDown(game);
    	
    	this.alpha += 0.07;
    	if (this.alpha > mathPi)
    	    this.alpha -= mathPi;
    	    
    	var moveSpeed = Math.abs(this.moveX);

        if (this.jumping)
        {
            this.moveCounter = 3;
            this.animationCounter++;

            if (this.animationCounter > 10)
            {
                if (++this.jumpCounter >= 2)
                {
                    this.jumpCounter = 1;
                    this.animationCounter = 10;
                }
            }
        }
        else
        {
            this.jumpCounter = 0;
            this.animationCounter += Math.max(moveSpeed / maxSpeed, 0.6);

            if (this.animationCounter > 5)
            {
                if (!moveLeftOrRight && moveSpeed < 3.5)
                {
                    if (++this.moveCounter >= 4)
                    {
                        this.moveCounter = 3;
                        this.animationCounter = 6;
                    }
                    else
                    {
                        this.animationCounter = 0;
                    }            
                }
                else
                {
                    if (++this.moveCounter >= 4)
                        this.moveCounter = 0;
                    this.animationCounter = 0;
                }
            }
        }
        
        this.worldOffsetX = game.worldOffsetX;
        this.worldOffsetY = game.worldOffsetY;
    }
    
    this.collisionLeftRightState = function(game, playerState)
    {
    	var isColliding = false;

    	for (i in game.gameObjects)
    	{
            var playerStateRect = new FPRect(playerState.x + this.worldOffsetX, playerState.y + this.worldOffsetY, playerSize, playerSize);   
    	    var platform = game.gameObjects[i];
    	    if (platform.isPlatform())
    		{
    			var intersection = FPRectIntersection(platform.rect(), playerStateRect);
    			if (intersection.isEmptyWithTolerance())
    			    continue;

    			if (platform.rect().left() > playerStateRect.left())
    			{
    			    if (platform.isMovable())
    			    {
    			        platform.move(intersection.size.width, 0.0);
    			        if (platform.collisionLeftRight(game))
    			        {
    			            platform.move(-intersection.size.width, 0.0);
                            playerState.x -= intersection.size.width;
    			            isColliding = true;
			            }
			        }
			        else
			        {
                        playerState.x -= intersection.size.width;
			            isColliding = true;
		            }
    			}
    			else if (platform.rect().right() < playerStateRect.right())
    			{
    				if (platform.isMovable())
    			    {
    			        platform.move(-intersection.size.width, 0.0);
    			        if (platform.collisionLeftRight(game))
    			        {
    			            platform.move(intersection.size.width, 0.0);
                            playerState.x += intersection.size.width;
    			            isColliding = true;
			            }
			        }
			        else
			        {
                        playerState.x += intersection.size.width;
			            isColliding = true;
		            }
    			}
    		}
    	}

    	return isColliding;
    }
    
    this.collisionLeftRight = function(game)
    {
    	var isColliding = false;

    	for (i in game.gameObjects)
    	{
    	    var platform = game.gameObjects[i];
    	    if (platform.isPlatform())
    		{
    			var intersection = FPRectIntersection(platform.rect(), this.rect());
    			if (intersection.isEmptyWithTolerance())
    			    continue;

    			if (platform.rect().left() > this.rect().left())
    			{
    			    if (platform.isMovable())
    			    {
    			        platform.move(intersection.size.width, 0.0);
    			        if (platform.collisionLeftRight(game))
    			        {
    			            platform.move(-intersection.size.width, 0.0);
    			            game.moveWorld(intersection.size.width, 0.0);
    			            isColliding = true;
			            }
			        }
			        else
			        {
			            game.moveWorld(intersection.size.width, 0.0);
			            isColliding = true;
		            }
    			}
    			else if (platform.rect().right() < this.rect().right())
    			{
    				if (platform.isMovable())
    			    {
    			        platform.move(-intersection.size.width, 0.0);
    			        if (platform.collisionLeftRight(game))
    			        {
    			            platform.move(intersection.size.width, 0.0);
    			            game.moveWorld(-intersection.size.width, 0.0);
    			            isColliding = true;
			            }
			        }
			        else
			        {
			            game.moveWorld(-intersection.size.width, 0.0);
			            isColliding = true;
		            }
    			}
    		}
    	}

    	return isColliding;
    }
    
    this.collisionUpDownState = function(game, playerState)
    {
    	var isColliding = false;

    	for (i in game.gameObjects)
    	{
            var playerStateRect = new FPRect(playerState.x + this.worldOffsetX, playerState.y + this.worldOffsetY, playerSize, playerSize);
    	    var platform = game.gameObjects[i];
    		if (platform.isPlatform())
    		{
    			var intersection = FPRectIntersection(platform.rect(), playerStateRect);
    			if (intersection.isEmptyWithTolerance())
    				continue;

    			if (platform.rect().bottom() < playerStateRect.bottom())
    			{
    				if (playerState.moveY > 0.0)
    					playerState.moveY = 0.0;
    			
                    playerState.y += intersection.size.height;
    				isColliding = true;
    			}
    			else if (playerState.moveY < 0.0)
    			{
    				if (platform.rect().top() > playerStateRect.bottom() - tolerance + playerState.moveY)
    				{
    					playerState.moveY = 0.0;
    					playerState.jumping = false;
                        playerState.y -= intersection.size.height;
    					isColliding = true;
    				}
    			}
    			else if (platform.rect().top() > playerStateRect.bottom() - tolerance)
    			{
    				playerState.jumping = false;
                    playerState.y -= intersection.size.height;
    				isColliding = true;
    			}
    		}
    	}

    	return isColliding;
    }

    this.collisionUpDown = function(game)
    {
    	var isColliding = false;

    	for (i in game.gameObjects)
    	{
    	    var platform = game.gameObjects[i];
    		if (platform.isPlatform())
    		{
    			var intersection = FPRectIntersection(platform.rect(), this.rect());
    			if (intersection.isEmptyWithTolerance())
    				continue;

    			if (platform.rect().bottom() < this.rect().bottom())
    			{
    				if (this.moveY > 0.0)
    					this.moveY = 0.0;
    			
    				game.moveWorld(0.0, -intersection.size.height);
    				isColliding = true;
    			}
    			else if (this.moveY < 0.0)
    			{
    				if (platform.rect().top() > this.rect().bottom() - tolerance + this.moveY)
    				{
    					this.moveY = 0.0;
    					this.jumping = false;
    					game.moveWorld(0.0, intersection.size.height);
    					isColliding = true;
    				}
    			}
    			else if (platform.rect().top() > this.rect().bottom() - tolerance)
    			{
    				this.jumping = false;
    				game.moveWorld(0.0, intersection.size.height);
    				isColliding = true;
    			}
    		}
    	}

    	return isColliding;
    }    
    
    this.hit = function()
    {
        if (this.lives <= 0)
            return;

        if (this.damageCounter == 0)
        {
            this.damageCounter = maxDamageCounter;
            if (--this.lives <= 0)
            {
                this.animationCounter = 0;
                this.deathCounter = 0;
            }
        }
    }
        
    this.drawState = function(context, state, id)
    {
        context.save();
        
        if (state.leftOriented)
        {
            context.translate(state.x + this.worldOffsetX + playerSize, state.y + this.worldOffsetY);
            context.scale(-1, 1);
        }
        else
        {
            context.translate(state.x + this.worldOffsetX, state.y + this.worldOffsetY);
        }
        
        if (state.lives <= 0)
            context.drawImage(playerDeathImage[state.deathCounter], 0, 0);
        else if (state.jumping)
            context.drawImage(jumpImage[state.jumpCounter], 0, 0);
        else
            context.drawImage(playerImage[state.moveCounter], 0, 0);
        
        context.restore();
        
        context.fillStyle = "white";
        context.font = "16px Helvetica Neue";
        context.fillText("id: " + id, state.x + this.worldOffsetX, state.y + this.worldOffsetY - 10.0);
        context.fillStyle = "black";
    }
    
    this.draw = function(context)
    {
        context.save();
        
        if (this.leftOriented)
        {
            context.translate(this.x + playerSize, this.y);
            context.scale(-1, 1);
        }
        else
        {
            context.translate(this.x, this.y);
        }        

        if (this.lives <= 0)
            context.drawImage(playerDeathImage[this.deathCounter], 0, 0);
        else if (this.jumping)
            context.drawImage(jumpImage[this.jumpCounter], 0, 0);
        else
            context.drawImage(playerImage[this.moveCounter], 0, 0);
        
        context.restore();
        
        if (this.damageCounter > 0)
        {
            var c = this.damageCounter / maxDamageCounter;
            c = Math.max(1.0 - c, 0.2); 
            context.fillStyle = "rgba(255, 0, 0, " + c.toString() + ")";
            //context.fillStyle = "rgba(255, 0, 0, " + c.toString() + ")";
            context.fillRect(0, 0, game.width, game.height);
            this.damageCounter--;
        }        
        
        if (this.speedUpCounter > 0)
            this.drawSpeedUp(context);
    }
    
    this.drawSpeedUp = function(context)
    {
        context.globalAlpha = Math.abs(Math.sin(this.alpha)) * 0.3 + 0.1;
        context.drawImage(speedImage, this.x - playerSize / 2.0, this.y - playerSize / 2.0);
        context.globalAlpha = 1.0;
    }
    
    this.toLevelString = function()
    {
        var levelString = new String('<FPPlayer>\n');
        levelString += '<x>' + this.x.toString() + '</x>\n';
        levelString += '<y>' + this.y.toString() + '</y>\n';
        levelString += '</FPPlayer>\n';
        return levelString;
    }
}