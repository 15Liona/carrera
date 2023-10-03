var canvas;
var backgroundImage, bgImg, car1_img, car2_img, track;
var database, gameState;
var form, player, playerCount;
var allPlayers, car1, car2;
var cars = [];
var fuelimg;
var powercoinimg;
var obstacle1img;
var obstacle2img;
var fuels;
var powercoins;
var obstacles;
var lifeImage;
var choque;

function preload() {
  backgroundImage = loadImage("./assets/background.png");
  car1_img = loadImage("../assets/car1.png");
  car2_img = loadImage("../assets/car2.png");
  track = loadImage("../assets/track.jpg");
  fuelimg = loadImage("./assets/fuel.png");
  powercoinimg = loadImage("./assets/goldCoin.png");
  obstacle1img = loadImage("./assets/obstacle1.png");
  obstacle2img = loadImage("./assets/obstacle2.png");
  lifeImage = loadImage("./assets/life.jpeg");
  choque = loadImage("./assets/boom.jpeg");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
}

function draw() {
  background(backgroundImage);
  if (playerCount === 2) {
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
