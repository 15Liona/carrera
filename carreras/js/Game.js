class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.playerMoving = false;
    this.leftKeyActive = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    powercoins = new Group();
    obstacles = new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2img },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1img },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1img },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2img },
      { x: width / 2, y: height - 2800, image: obstacle2img },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1img },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2img },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2img },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1img },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2img },
      { x: width / 2, y: height - 5300, image: obstacle1img },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2img }
    ];

    this.addSprites(fuels, 4, fuelimg, 0.02);
    this.addSprites(powercoins, 18, powercoinimg, 0.09);
    this.addSprites(obstacles, obstaclesPositions.length, obstacle1img, 0.04, obstaclesPositions);
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reiniciar juego");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Puntuación");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
   

    Player.getPlayersInfo();

    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showLife();
      this.showFeulBar();
      this.showLeaderboard();

      //índice de la matriz
      var index = 0;
      for (var plr in allPlayers) {
        //agrega 1 al índice para cada bucle
        index = index + 1;

        //utiliza los datos de la base de datos para mostrar los autos en las direcciones x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handlefuel(index);
          this.handlepowercoins(index);
          this.handleObstacleColition(index);

          // cambiar la posición de la cámara en la dirección y
          camera.position.y = cars[index - 1].position.y;

        }
      }

      // manejando eventos de teclado
      this.handlePlayerControls();
      const finishLine = height*6 - 100;

      if (player.positionY > finishLine){
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        CarsAtEnd: 0
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    esta etiqueta se utiliza para mostrar cuatro espacios.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if (keyIsDown(UP_ARROW)) {
      this.playerMoving = true;
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }

  addSprites(spriteGroup, numberofsprites, spriteImage, scale, positions=[]){
    for(var i = 0; i < numberofsprites; i++){
      var x, y;
      

      if (positions.length > 0){
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      }

      else {
        x = random(width/2 + 150, width/2 - 150);
        y = random(-height * 4.5, height - 400);
      }

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

    handlefuel(index){
      cars[index - 1].overlap(fuels, function(collector, collected){
        player.fuel = 185;
        collected.remove();
      });

      if (player.fuel > 0 && this.playerMoving){
       player.fuel -=  0.5;
      }
      if (player.fuel <= 0){
        gameState = 2;
        this.gameOver();
      }
    }
    
    handlepowercoins(index){
      cars[index - 1].overlap(powercoins, function(collector, collected){
        player.score += 2;
        collected.remove();
        player.update();
      });
    }

    handleObstacleColition(index){
      if (cars[index - 1].collide(obstacles)){
        if (this.leftKeyActive){
          player.positionX += 100;
        }

        else {
          player.positionX -= 100;
        }

        if (player.life > 0){
          player.life -= 185/4;
        }
        player.update();
      }
    }

    showLife(){
      push();
      image(lifeImage, width/2 - 130, height - player.positionY - 300, 20, 20);
      fill("white");
      rect(width/2 -100, height - player.positionY - 300, 185, 20);
      fill("#f50057");
      rect(width/2 - 100, height - player.positionY - 300, player.life, 20);
      noStroke();
      pop();
    }

    showFeulBar(){
      push();
      image(fuelimg, width/2 - 130, height - player.positionY - 100, 20, 20);
      fill("white");
      rect(width/2 -100, height - player.positionY - 100, 185, 20);
      fill("#ffc400");
      rect(width/2 - 100, height - player.positionY - 100, player.fuel, 20);
      noStroke();
      pop();
    }

    showRank(){
      swal({
        title: `Impresionante!${"\n"}Posición${"\n"}${player.rank}`,
        text: "Llegaste a la meta con éxito",
        imageUrl:
          "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize: "100x100",
        confirmButtonText: "Ok"
      });
    }

    gameOver(){
      swal({
        title: `game over`,
        text: "has perdido",
        imageUrl:
          "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
        imageSize: "100x100",
        confirmButtonText: "¿otra vez?"
      });
    }
  }
