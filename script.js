const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");

const timeStep = 1.0 / 60.0;
const asteroidSprite = document.getElementById("asteroid");

canvas.width = window.innerWidth - 50.0;
canvas.height = window.innerHeight - 50.0;


let asteroidTimer = 0;
const numOfBalls = 2; // Change this value to change the # of balls
const ballSize = 50;
const speed = 200;
const objects = []; // array for balls
const asteroidSpawnTime = 2; // in seconds


function createObject(collisionFlag, sprite, size, posx, posy, velx, vely){
    this.collisionFlag = collisionFlag;
    this.sprite = sprite;
    this.size = size;
    this.pos = {x: posx, y: posy};
    this.vel = {x:velx, y:vely};
}

//Creates balls and populates array
function createAsteroids(){
    for(let i = 0; i < numOfBalls; i++){
        //creates the object
        const object = new createObject(1, asteroidSprite, ballSize, getRandomInt(0, canvas.width), -ballSize, getRandomInt(-speed, speed), 50);
        objects.push(object);
    }
}

let arrLength = numOfBalls;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function draw(){
    c.clearRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < arrLength; i++){
        obj = objects[i];

        /*
        c.fillStyle = "red";
        c.beginPath();
        c.rect(obj.pos.x, obj.pos.y, obj.size, obj.size);
        c.closePath();
        c.fill();
        */
        c.drawImage(obj.sprite, obj.pos.x, obj.pos.y, obj.size, obj.size);

    }
}

function update(){

    if(asteroidTimer > 60 * asteroidSpawnTime){
        createAsteroids();
        asteroidTimer = 0;
    }

    calculate();
    collision();
    draw();
    requestAnimationFrame(update);

    arrLength = objects.length;
    asteroidTimer++;

}

//updates the position of the ball
function calculate(){
    for(let i = 0; i < arrLength; i++){
        let ball = objects[i];

        ball.pos.x += ball.vel.x * timeStep;
        ball.pos.y += ball.vel.y * timeStep;
        let UBX = canvas.width - ball.size;
        let LBX = 0;

        let UBY = canvas.height - ball.size;
        let LBY = -ballSize;

        if(ball.pos.x > UBX){
            ball.pos.x = UBX;
            ball.vel.x *= -1.0;
        }

        if(ball.pos.x < LBX){
            ball.pos.x = LBX;
            ball.vel.x *= -1.0;
        }

        if(ball.pos.y > canvas.height){
            objects.splice(i,1);
            arrLength--;
        }

        if(ball.pos.y < LBY){
            ball.pos.y = LBY;
            ball.vel.y *= -1.0;
        }
    }


}

function collision(){
    for(let i = 0; i < arrLength -1; i++){
        for(let j = i+1; j < arrLength; j++){
            let ball1 = objects[i];
            let ball2 = objects[j];

            let distx1 = ball1.pos.x - ball2.pos.x;
            let disty1 = ball1.pos.y - ball2.pos.y;

            if(ball1.collisionFlag == 1 && ball2.collisionFlag==1){
                if(Math.abs(distx1) < ballSize && Math.abs(disty1) < ballSize){
                    if(Math.abs(distx1) < ballSize && Math.abs(distx1) > Math.abs(disty1)){
                        //console.log("x");
                        ball1.vel.x *= -1;
                        ball2.vel.x *= -1;

                        if(distx1 < 0){
                            let cent = ball1.pos.x + Math.abs(distx1/2.0);
                            //console.log(distx1, cent );
                            ball1.pos.x = cent - ballSize/2.0;
                            ball2.pos.x = cent + ballSize/2.0;
                        }else if(distx1 > 0){
                            let cent = ball2.pos.x + Math.abs(distx1/2.0);
                            //console.log(distx1, cent );
                            ball1.pos.x = cent + ballSize/2.0;
                            ball2.pos.x = cent - ballSize/2.0;
                        }
                    }
                    else if(Math.abs(disty1) < ballSize && Math.abs(distx1) < Math.abs(disty1)){
                        //console.log("y");
                        ball1.vel.y *= -1;
                        ball2.vel.y *= -1;

                        if(disty1 < 0){
                            let cent = ball1.pos.y + Math.abs(disty1/2.0);
                            //console.log(disty1, cent );
                            ball1.pos.y = cent - ballSize/2.0;
                            ball2.pos.y = cent + ballSize/2.0;
                        }else if(disty1 > 0){
                            let cent = ball2.pos.y + Math.abs(disty1/2.0);
                            //console.log(disty1, cent );
                            ball1.pos.y = cent + ballSize/2.0;
                            ball2.pos.y = cent - ballSize/2.0;
                        }
                    }
                }

            }
        }
    }
}

createAsteroids();
update();
