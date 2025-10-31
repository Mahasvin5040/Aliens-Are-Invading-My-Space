const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");

let timeStep = 1.0 / 60.0;
const asteroidSprite = document.getElementById("asteroid");
const alienSprite = document.getElementById("alien");
const enemyLaser = document.getElementById("enemyLaser");
const friendlyLaser = document.getElementById("friendlyLaser");
const playerSprite = document.getElementById("player");
const hampterSprite = document.getElementById("hampter");
const donkSprite = document.getElementById("donk");
const bombSprite = document.getElementById("subspace");

const subspaceWav = "subspace.mp3";
const hpUpWav = "hpUp.wav";
const damageWav = "hit.wav";
const enemyShootWav = "enemyShoot.wav";
const explosionWav = "explosion.wav";
const playerShootWav = "playerShoot.wav";
const collisionWav = "collision.wav";

canvas.width = 820;
canvas.height = window.innerHeight - 100.0;
console.log(canvas.height);
console.log(canvas.width);

let elapsedSeconds = 0;
let elapsedMinutes = 0;
let secondsCounter = 0;
const displayTime = document.getElementById('time')

function updateScore(){
    let scoretxt = String(player.score).padStart(4,'0');
    const scoreText = document.getElementById("score");
    scoreText.textContent = `Score: ${scoretxt}`;
}

function updateHp(){
    if(hpScore >= 200 ){
        hpScore = 0;
        if(player.health < maxHp){
            playSfx(hpUpWav);
            player.health++;
        }
    }
    let hptxt = String(player.health).padStart(2,'0');
    const hpText = document.getElementById("hp");
    hpText.textContent = `HP: ${hptxt}`;
    if(player.health <= 2){
        hpText.style.color = 'red';
    }else{
        hpText.style.color = 'white';
    }
}

function updateTimerDisplay() {
    let minutes = Math.floor(elapsedSeconds / 60);
    let seconds = elapsedSeconds % 60;

    // Format with leading zeros
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(seconds).padStart(2, '0');

    const timerDisplay = document.getElementById('time');
    timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

let alienTimer = 0;
let asteroidTimer = 0;
let playerBulletSpeed = -190;

const numOfAsteroids = 6;// Change this value to change the # of balls
const numOfAliens = 3;

const asteroidSize = 35;
const alienSizex = 80;
const alienSizey = 32;
const playerSizex = 60;
const playerSizey = 80;

const asteroidSpeed = 200;
const alienSpeed = 200;

const asteroidPts = 5;
const alienPts = 10;
const laserPts = 2;

const maxHp = 5;

const objects = []; // array for balls

const asteroidSpawnTime = 2; // in seconds
const alienSpawnTime = 4;

const playerLaserSize = {x:8, y:20};
const enemyLaserSize = {x:5, y:20};

const player = {
    sprite : playerSprite,
    size : {x : playerSizex, y : playerSizey},
    pos : {x : canvas.width/2, y : canvas.height - playerSizey},
    shootingTimer : 0,
    playerShootingTime : 1/4,
    health : maxHp,
    speed : 4,
    score : 0,
};

const bomb = {
    sprite : bombSprite,
    size : {x : 30, y : 30},
    pos : {x : 0, y : 0},
    flag : 0,
};

let movingLeft = false;
let movingRight = false;
let movingUp = false;
let movingDown = false;


document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowLeft" || e.key == "A" || e.key == "a") {
        movingLeft = true;
    }else if (e.key == "ArrowRight" || e.key == "D" || e.key == "d") {
        movingRight = true;
    }

    if (e.key == "ArrowUp" || e.key == "W" || e.key == "w") {
        movingUp = true;
        //playerBulletSpeed -= 2*player.speed;

    }else if (e.key == "ArrowDown" || e.key == "S" || e.key == "s") {
        movingDown = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key == "ArrowLeft" || e.key == "A" || e.key == "a" || player.pos.x <= 0) {
        movingLeft = false;
    }else if (e.key == "ArrowRight" || e.key == "D" || e.key == "d" || player.pos.x >= canvas.width - player.pos.x) {
        movingRight = false;
    }

    if (e.key == "ArrowUp" || e.key == "W" || e.key == "w" || player.pos.y <= 0) {
        movingUp = false;
        //playerBulletSpeed = -70;
    }else if (e.key == "ArrowDown" || e.key == "S" || e.key == "s" || player.pos.y >= canvas.height- player.pos.y) {
        movingDown = false;
    }
});

function createObject(collisionFlag, sprite, sizex, sizey, posx, posy, velx, vely){
    this.collisionFlag = collisionFlag;
    this.sprite = sprite;
    this.size = {x : sizex, y: sizey};
    this.pos = {x: posx, y: posy};
    this.vel = {x:velx, y:vely};
    this.shootingTimer = 0;
    this.alienShootTime = 1.5;
}

//Creates balls and populates array
function createAsteroids(){
    for(let i = 0; i < numOfAsteroids; i++){
        let rng = getRandomInt(0, 1000);
        const object = new createObject(1, asteroidSprite, asteroidSize, asteroidSize, getRandomInt(0, canvas.width), getRandomInt(-asteroidSize*2, -asteroidSize), getRandomInt(-asteroidSpeed, asteroidSpeed), 50);
        if(rng == 0){
            object.sprite = hampterSprite;
        }
        objects.push(object);
    }
}

function createAliens(){
    for(let i = 0; i < numOfAliens; i++){
        //creates the object
        const object = new createObject(0, alienSprite, alienSizex, alienSizey, getRandomInt(0, canvas.width), -alienSizey, getRandomInt(-alienSpeed, alienSpeed), 15);
        objects.push(object);
    }
}

function createEnemyLaser(enemy){
    const object = new createObject(0, enemyLaser, enemyLaserSize.x, enemyLaserSize.y, enemy.pos.x+enemy.size.x/2, enemy.pos.y+enemy.size.y/2, 0, 70);
    objects.push(object);
}

function createPlayerLaser(player){
    const object = new createObject(0, friendlyLaser, playerLaserSize.x, playerLaserSize.y, player.pos.x+player.size.x/2-playerLaserSize.x/2, player.pos.y-playerLaserSize.y/2, 0, playerBulletSpeed);
    objects.push(object);
}

let arrLength = numOfAsteroids;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function detectDmg(){
    let center = {x : player.pos.x + player.size.x/2, y : player.pos.y + player.size.y/2};
    let r = {x : player.size.x/3, y : player.size.y/3};

    for(let i = 0; i < arrLength; i++){
        if(objects[i].sprite != friendlyLaser && objects[i].sprite != donkSprite){
        let obj = objects[i];
        let objectCenter = {x : obj.pos.x + obj.size.x/2, y : obj.pos.y + obj.size.y/2};
        let distx = Math.abs(center.x - objectCenter.x);
        let disty = Math.abs(center.y - objectCenter.y);
        if(distx <= r.x && disty <= r.y){
            playSfx(damageWav);
            player.health--;
            objects.splice(i,1);
            arrLength--;
            //console.log(player.health);
        }
        }
    }
}

let hpScore = 0;

function playerHit(){
    let obj1Size = {x : 0, y : 0};
    let obj2Size = {x : 0, y : 0};

    let distx = 0;
    let disty = 0;
    let r = {x : 0, y : 0};

    let obj1Cent = {x : 0, y:0};
    let obj2Cent = {x : 0, y:0};

    for(let i = 0; i < arrLength -1; i++){
        for(let j = i+1; j < arrLength; j++){
            if(((objects[i].sprite != friendlyLaser && objects[j].sprite == friendlyLaser) || (objects[i].sprite == friendlyLaser && objects[j].sprite != friendlyLaser))){

                obj1Size.x = objects[i].size.x;
                obj1Size.y = objects[i].size.y;
                obj2Size.x = objects[j].size.x;
                obj2Size.y = objects[j].size.y;

                obj1Cent.x = obj1Size.x/2 + objects[i].pos.x;
                obj2Cent.x = obj2Size.x/2 + objects[j].pos.x;

                obj1Cent.y = obj1Size.y/2 + objects[i].pos.y;
                obj2Cent.y = obj2Size.y/2 + objects[j].pos.y;

                distx = Math.abs(obj1Cent.x - obj2Cent.x);
                disty = Math.abs(obj1Cent.y - obj2Cent.y);

                r.x = obj1Size.x/2;
                r.y = obj1Size.y/2;

                if(distx <= r.x && disty <= r.y){
                    if(objects[i].sprite == asteroidSprite || objects[j].sprite == asteroidSprite){
                        player.score += asteroidPts;
                        hpScore += asteroidPts;
                    }
                    if(objects[i].sprite == alienSprite || objects[j].sprite == alienSprite){
                        player.score += alienPts;
                        hpScore += alienPts;
                    }
                    if(objects[i].sprite == enemyLaser || objects[j].sprite == enemyLaser){
                        player.score += laserPts;
                        hpScore += laserPts;
                    }
                    //console.log(player.score);

                    //playSfx(damageWav);
                    objects.splice(j,1);
                    arrLength--;
                    objects.splice(i,1);
                    arrLength--;
                    //console.log("idk");
                }
            }
        }
    }
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
        if(bomb.flag == 1){
            c.drawImage(bomb.sprite, bomb.pos.x, bomb.pos.y, bomb.size.x, bomb.size.y);
        }
        c.drawImage(obj.sprite, obj.pos.x, obj.pos.y, obj.size.x, obj.size.y);
        c.drawImage(player.sprite, player.pos.x, player.pos.y, player.size.x, player.size.y);
    }
    //c.drawImage(player.sprite, player.pos.x, player.pos.y, player.size.x, player.size.y);
}
function enemyShot(){
    for(let i = 0; i < arrLength; i++){
        if(objects[i].sprite == alienSprite){
            objects[i].shootingTimer++;
        }
        if(objects[i].shootingTimer > objects[i].alienShootTime / timeStep){
            createEnemyLaser(objects[i]);
            arrLength++;
            objects[i].shootingTimer = 0;
            objects[i].alienShootTime *= .97;
            playSfx(enemyShootWav);
        }
    }
}

function playerShot(){
    player.shootingTimer++;
    if(player.shootingTimer > player.playerShootingTime / timeStep){
        createPlayerLaser(player);
        arrLength++;
        player.shootingTimer = 0;
        playSfx(playerShootWav);
    }
}

//updates the position of the ball
function calculate(){
    for(let i = 0; i < arrLength; i++){
        let ball = objects[i];

        ball.pos.x += ball.vel.x * timeStep;
        ball.pos.y += ball.vel.y * timeStep;
        let UBX = canvas.width - ball.size.x;
        let LBX = 0;

        let UBY = canvas.height - ball.size.y;
        let LBY = -ball.size.y;

        if(ball.pos.x > UBX){
            ball.pos.x = UBX;
            ball.vel.x *= -1.0;
            playSfx(collisionWav);
        }

        if(ball.pos.x < LBX){
            ball.pos.x = LBX;
            ball.vel.x *= -1.0;
            playSfx(collisionWav);
        }

        if(ball.pos.y > canvas.height && ball.sprite != donkSprite){
            objects.splice(i,1);
            arrLength--;
        }

        if(ball.pos.y < LBY){
            if(ball.sprite != friendlyLaser && ball.sprite != donkSprite){
                //ball.pos.y = LBY;
                //ball.vel.y *= -1.0;
            }else{
                //console.log(ball.pos.y);
                objects.splice(i,1);
                arrLength--;
            }
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
                if(Math.abs(distx1) < asteroidSize && Math.abs(disty1) < asteroidSize){
                    playSfx(collisionWav);
                    if(Math.abs(distx1) < asteroidSize && Math.abs(distx1) > Math.abs(disty1)){
                        //console.log("x");
                        ball1.vel.x *= -1;
                        ball2.vel.x *= -1;

                        if(distx1 < 0){
                            let cent = ball1.pos.x + Math.abs(distx1/2.0);
                            //console.log(distx1, cent );
                            ball1.pos.x = cent - asteroidSize/2.0;
                            ball2.pos.x = cent + asteroidSize/2.0;
                        }else if(distx1 > 0){
                            let cent = ball2.pos.x + Math.abs(distx1/2.0);
                            //console.log(distx1, cent );
                            ball1.pos.x = cent + asteroidSize/2.0;
                            ball2.pos.x = cent - asteroidSize/2.0;
                        }
                    }
                    else if(Math.abs(disty1) < asteroidSize && Math.abs(distx1) < Math.abs(disty1)){
                        //console.log("y");
                        ball1.vel.y *= -1;
                        ball2.vel.y *= -1;

                        if(disty1 < 0){
                            let cent = ball1.pos.y + Math.abs(disty1/2.0);
                            //console.log(disty1, cent );
                            ball1.pos.y = cent - asteroidSize/2.0;
                            ball2.pos.y = cent + asteroidSize/2.0;
                        }else if(disty1 > 0){
                            let cent = ball2.pos.y + Math.abs(disty1/2.0);
                            //console.log(disty1, cent );
                            ball1.pos.y = cent + asteroidSize/2.0;
                            ball2.pos.y = cent - asteroidSize/2.0;
                        }
                    }
                }

            }
        }
    }
}

function movement(){
    if(movingLeft && player.pos.x >= 0) {
        player.pos.x -= player.speed;
    }else if(movingRight && player.pos.x <= canvas.width - player.size.x) {
        player.pos.x += player.speed;
    }

    if(movingUp && player.pos.y >= 0) {
        player.pos.y -= player.speed;
    }else if(movingDown && player.pos.y <= canvas.height - player.size.y) {
        player.pos.y += player.speed/1.5;
    }
}

function playSfx(src){
    let sfx = new Audio(src);
    if(src != explosionWav || src != damageWav || src != hpUpWav || src != collisionWav || src!= subspaceWav){
        sfx.volume = 0.025;
    }
    //sfx.src = src;
    sfx.play();
}
function bombOverlap(){
    let playerCenter = {x : player.pos.x + player.size.x/2, y : player.pos.y + player.size.y/2};
    let bombCenter = {x : bomb.pos.x + bomb.size.x/2, y : bomb.pos.y + bomb.size.y/2}
    let r = {x : player.size.x/3, y : player.size.y/3};

    let distx = Math.abs(playerCenter.x-bombCenter.x);
    let disty = Math.abs(playerCenter.y-bombCenter.y);
    if(distx <= r.x && disty <= r.y){
        playSfx(subspaceWav);
        bomb.flag = 0;
        for(let i =0 ; i < arrLength; i++){
            if(objects[i].sprite != donkSprite){
                objects.splice(i,1);
                arrLength--;
                i--;
            }
        }
    }
}


function update(){
    if(elapsedSeconds%60 == 0 && secondsCounter == 60 && Math.floor(elapsedSeconds/60) > 0){
        timeStep *= 1.15;
        const object = new createObject(0, donkSprite, 20, 20, getRandomInt(0, canvas.width), canvas.height+40, getRandomInt(-50, 50), -40);
        objects.push(object);

        bomb.flag = 1;
        bomb.pos.x = getRandomInt(0, canvas.width-bomb.size.x);
        bomb.pos.y = getRandomInt(0, canvas.height-bomb.size.y);
    }
    if(bomb.flag == 1){
        bombOverlap();
    }
    if(player.health <= 0){
        playSfx(explosionWav);

        c.fillStyle = "black";
        c.globalAlpha = 0.75;
        c.beginPath();
        c.rect(0,0,canvas.width,canvas.height);
        c.closePath();
        c.fill();

        c.fillStyle = "white";
        c.globalAlpha = 1.0;
        c.font = "bold 40px Cominc Sans MS";
        c.textAlign = "center";
        c.fillText("Game Over", canvas.width/2, canvas.height/2-40);
        c.fillText("Score: " + player.score, canvas.width/2, canvas.height/2)

        let minutes = Math.floor(elapsedSeconds / 60);
        let seconds = elapsedSeconds % 60;
        let formattedMinutes = String(minutes).padStart(2, '0');
        let formattedSeconds = String(seconds).padStart(2, '0');

        c.fillText("Time: " + formattedMinutes + ":" + formattedSeconds, canvas.width/2, canvas.height/2+40);
        return;

    }

    // spawns asteroids in waves
    if(asteroidTimer > asteroidSpawnTime / timeStep){
        createAsteroids();
        arrLength = objects.length;
        asteroidTimer = 0;
    }

    //spawns aliens in waves
    if(alienTimer > alienSpawnTime / timeStep){
        createAliens();
        arrLength = objects.length;
        alienTimer = 0;
    }

    //timer
    if(secondsCounter == 60){
        elapsedSeconds++;
        secondsCounter = 0;
    }
    movement();
    playerShot();
    enemyShot();
    detectDmg();
    playerHit();

    calculate(); // calculates position & collision with walls
    collision(); // collision between asteroids
    draw();
    requestAnimationFrame(update);

    asteroidTimer++;
    alienTimer++;
    secondsCounter++;

    updateTimerDisplay();
    updateScore();
    updateHp();
}

updateTimerDisplay();
createAsteroids();
update();
