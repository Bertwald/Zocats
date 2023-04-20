/**
 * @fileOverview Logic for running Zocats adventure game
 * @author Bertwald
 * @version 0.0.1
 */
"use strict";
/* #region Helpers */
/**
 * getElementById shortcut
 * @param {string} id id of element to get
 * @returns {HTMLElement | null}
*/
const $ = (id) => String(id).charAt(0) === '#' ? document.getElementById(String(id).slice(1)) : null;
/**
 * ShortCut to set InnerHtml
 * @param {string} id id of element to get
 * @param {string} value the InnerHTML value
 * @returns {void}
*/
const __ = (id, value) => $(id).innerHTML = value;
/**
 * Used to determine if a given object can execute a function with given name
 * @param {string} methodName The method for which we want to check if it is a member of this object
 * @returns {bool} whether the object can execute given method name
 */
Object.prototype.can = (methodName) => ((typeof this[methodName]) == "function");
/**
 * Get a random integer coordinate pair within bound
 * @function getRandomCoords
 * @param {[int,int]} bounds Maximum values for first and second coordinate
 * @returns {[int,int]} a pair [0 <= x < bounds[0] ,  0 <= y < bounds[1]]
 */
const getRandomCoords = (bounds) => [Math.floor(Math.random() * bounds[0]), Math.floor(Math.random() * bounds[1])];
/**
 * Checks if two coordinates border each other
 * @param {[int,int]} coords1 the first coordinate
 * @param {[int,int]} coords2 the second coordinate
 * @returns {bool} if coordinates border each other
 */
const neighboring = (coords1, coords2) => Math.abs(coords1[0] - coords2[0]) + Math.abs(coords1[1] - coords2[1]) === 1;
/* #endregion */
/* #region Classes */
class MapLocation {
  /** @type {string} */
  #imageUrl;
  /** @type {string} */
  #description;
  /**
   * @param {string} val
   */
  set imageUrl(val) {
    this.#imageUrl = val;
  }
  get imageUrl() {
    return this.#imageUrl;
  }
  /**
   * @param {string} val
   */
  set description(val) {
    this.#description = val;
  }
  get description() {
    return this.#description;
  }
}

class Cat {
  /** @type {[int,int]} */
  #mapboundary;
  #x;
  #y;
  #imageUrl = "resources/kittens/1.png"
  static sfxUrl = "resources/sfx/ambient2.ogg";
  /**
   * Gets the position as a tuple
   * @example let [a,b] = cat.position
   * (Implies a == x && b == y)
   * @returns {[int,int]}
   */
  get position() {
    return [this.#x, this.#y]
  }
  /**
   * @type {[int,int]}
   */
  set position(value) {
    [this.#x, this.#y] = value;
  }
  get imageUrl() {
    return this.#imageUrl;
  }
  /**
   * @param {string} val
   */
  set imageUrl(val) {
    this.#imageUrl = val;
  }
  /**
   * Constructs a cat inside bounds but not on occupied coordinate
   * @param {[int,int]} bound the bounds for spawning
   * @param {[int int]} blocked the coordinates blocked by the player
   */
  constructor(bound, blocked) {
    this.#mapboundary = bound;
    let newCoords = blocked;
    while (newCoords.toString() === blocked.toString()) {
      newCoords = getRandomCoords(this.#mapboundary)
    }
    this.#x = newCoords[0];
    this.#y = newCoords[1];
  }
}
class Zombie {
  #mapBoundary;
  /** @type {int} */
  #x;
  /** @type {int} */
  #y;
  #imageUrl = "resources/dogs/dog3.png";
  #sfxUrl;
  #sfxUrl2;
  //static sfxUrl = "resources/sfx/dog.ogg";
  /**
   * Gets the position as a tuple
   * @example let [a,b] = zombie.position
   * (Implies a == x && b == y)
   * @returns {[int,int]}
   */
  get position() {
    return [this.#x, this.#y]
  }
  get imageUrl() {
    return this.#imageUrl;
  }
  set imageUrl(url) {
    this.#imageUrl = url;
  }
  get sfxUrl() {
    return this.#sfxUrl
  }
  set sfxUrl(url) {
    this.#sfxUrl = url;
  }
  get sfxUrl2() {
    return this.#sfxUrl2;
  }
  set sfxUrl2(url) {
    this.#sfxUrl2 = url;
  }
  /**
* Constructs the zombie data object
* @param {int} x the starting x coordinate
* @param {int} y the starting y coordinate
*/
  constructor(x, y, [boundX, boundY]) {
    this.#x = x;
    this.#y = y;
    this.#mapBoundary = [boundX, boundY];
    this.#sfxUrl = "resources/sfx/dog.ogg";
    this.#sfxUrl2 = "resources/sfx/zombie.ogg";
  }
  /**
   * Moves one step towards target
   * @param {[int,int]} target 
   */
  move(target) {
    let dx = Math.abs(target[0] - this.#x);
    let dy = Math.abs(target[1] - this.#y);
    dx >= dy ? target[0] - this.#x < 0 ? this.#x-- : this.#x++ : target[1] - this.#y < 0 ? this.#y-- : this.#y++;
  }
}
/**
 * Represents a player object which can be moved around
 */
class Player {
  /** @type {[int,int]} */
  #mapBoundary;
  #x;
  #y;
  /** @type {int} */
  #lives = 9;
  /** @type {int} */
  #catsFound = 0;
  #imageUrl = "resources/ninjacats/cat3.png"
  /**
   * Constructs the player data object
   * @param {int} x the starting x coordinate
   * @param {int} y the starting y coordinate
   */
  constructor(x, y, [boundX, boundY]) {
    this.#x = x;
    this.#y = y;
    this.#mapBoundary = [boundX, boundY];
    $("#playerimage").src = this.#imageUrl;
    __("#health", `Lives Remaining: ${this.#lives}`);
    __("#savedcats", `Saved Cats: ${this.#catsFound}`);
  }
  /**
   * Gets the position as a tuple
   * @example let [a,b] = player.position
   * (Implies a == x && b == y)
   * @returns {[int,int]}
   */
  get position() {
    return [this.#x, this.#y];
  }
  /**
   * Gets the imageurl of the player
   */
  get image() {
    return this.#imageUrl;
  }
  get catsFound() {
    return this.#catsFound;
  }
  get lives() {
    return this.#lives;
  }

  /**
   * @param {int} value
   */
  set catsFound(value) {
    this.#catsFound = value;
  }
  /**
   * Checks if a move can be executed
   * @param {[int,int]} movement
   * @returns {bool} if move can be done
   */
  isValidMove(movement) {
    let [x, y] = movement;
    return (this.#x + x < this.#mapBoundary[0] && this.#x + x >= 0) && (this.#y + y < this.#mapBoundary[1] && this.#y + y >= 0);
  }
  /** Updates the player Position */
  move(x, y) {
    this.#x += x;
    this.#y += y;
  }
  /**
   * @returns true if player is dead, else false
   */
  reduceHealth() {
    if (--this.#lives == 0) {
      return true;
    } else {
      return false;
    }
  }
}
/**
 * Represents the gameboard, complete with timer, player, enemies etc
 * @property {Player}
 */
class GameBoard {
  /** @type {[int]} */
  #size = [5, 5];

  /** @type {UUID} */
  #sessionUUID;

  /** @type {Player} */
  #player;
  /** @type {[Zombie]} */
  #zombies = [];
  /** @type {Cat} */
  #cat;
  /** @type {Array<Array<MapLocation>>} */
  #map = [];


  constructor() {
    //Crypto API
    this.#sessionUUID = self.crypto.randomUUID();
    console.log(this.#sessionUUID);
    this.#player = new Player(2, 1, [5, 5]);
    this.#zombies.push(new Zombie(0, 4, [5, 5]));
    this.#cat = new Cat(this.#size, [2, 1]);
    for (var x = 0; x < this.#size[0]; x++) {
      let newArr = [];
      for (var y = 0; y < this.#size[1]; y++) {
        let newItem = new MapLocation();
        newItem.imageUrl = `resources/locations/${x}-${y}.png`
        // Fetch API
        fetch(`resources/locations/${x}-${y}.txt`)
          .then(response => response.text())
          .then(text => newItem.description = text);
        newArr.push(newItem);
      }
      this.#map.push(newArr);
    }
    __("#coordinates", `Location: [${this.#player.position}]`);
    this.setDistances();
  }
  /**
   * Moves the player by changing coordinates a given amount
   * @param {int} x part of movement
   * @param {int} y part of movement
   */
  movePlayer([x, y]) {
    if (!this.#player.isValidMove([x, y])) {
      return;
    }
    let isDead = false;
    let hasFoundAllKittens = false;
    this.#player.move(x, y);
    this.#zombies.forEach(x => Math.random() >= 0.25 ? x.move(this.#player.position) : null);
    this.listen(this.#player.position);
    this.updateObjects();
    this.collisionEvents(this.#player.position);
    if (this.checkCatCollision()) {
      hasFoundAllKittens = 7 === ++this.#player.catsFound;
      this.#cat.position = getRandomCoords(this.#size, this.#player.position);
      this.#cat.imageUrl = `resources/kittens/${(this.#player.catsFound % 7) + 1}.png`
      __("#savedcats", `Kittens to save : ${ 7 - this.#player.catsFound}`);
    }
    if (this.checkZombieCollision()) {
      isDead = this.#player.reduceHealth();
      __("#health", `Lives Remaining: ${this.#player.lives}`);
      if (this.#player.lives === 1) {
        this.#zombies.forEach(zombie => { zombie.imageUrl = "resources/dogs/final2.png", zombie.sfxUrl = "resources/sfx/final.ogg", zombie.sfxUrl2 = "resources/sfx/finalcatch.ogg" });
      }
    }
    let [a, b] = this.#player.position;
    let map = this.#map[a][b];
    let image = map.imageUrl;
    __("#gamearea", `<img id="areaimage" src="${this.#map[a][b].imageUrl}" alt="area background">
      <p id="coordinates">Location: [${this.#player.position}]</p>
      <p id="sixthsense"></p>
      <p id = "areadescription"> ${this.#map[a][b].description} </p>`);
    this.setDistances();

    if (isDead) {
      startScreen();
    } else if (hasFoundAllKittens) {
      endScreen();
    }
  }
  checkCatCollision() {
    return this.#cat.position.toString() === this.#player.position.toString();
  }
  checkZombieCollision() {
    return this.#zombies.some(x => x.position.toString() === this.#player.position.toString());
  }
  async collisionEvents(cords) {
    let zombies = this.#zombies.filter(a => a.position.toString() === cords.toString());
    let cats = this.#cat.position.toString() === cords.toString();
    let zombiesnd;
    let catsnd;
    if (zombies.length > 0) {
      zombiesnd = new Audio(zombies[0].sfxUrl2);
      zombiesnd.volume = 1.0;
    }
    if (cats) {
      catsnd = new Audio(Cat.sfxUrl);
      catsnd.volume = 1.0;
    }
    if (zombiesnd != undefined) {

      try { await zombiesnd.play() } catch (err) { console.error(err); }
    }
    if (catsnd != undefined) {

      try { await catsnd.play() } catch (err) { console.error(err); }
    }
  }
  /**
   * Listen to the sounds present at the coordinate
   * @param {[int,int]} cords coordinate to listen at
   */
  async listen(cords) {
    let zombies = this.#zombies.filter(a => neighboring(a.position, cords));
    let zombiesnd;
    if (zombies.length > 0) {
      zombiesnd = new Audio(zombies[0].sfxUrl);
      zombiesnd.volume = 1.0;
    }
    if (zombiesnd != undefined) {
      try { await zombiesnd.play() } catch (err) { console.error(err); }
    }
  }
  /**
   * Updates the gui elements for sixth sense
   */
  setDistances() {
    let [playerX, playerY] = this.#player.position;
    let playerTocat = Math.abs(playerX - this.#cat.position[0]) + Math.abs(playerY - this.#cat.position[1]);
    let zombieDistances = this.#zombies.map(x => Math.abs(playerX - x.position[0]) + Math.abs(playerY - x.position[1]));
    let playerToZombie = zombieDistances.sort((a, b) => a - b)[0];
    __("#sixthsense", `Closest Zombie: ${playerToZombie} UM and Kitten: ${playerTocat} UM`);
  }
  updateObjects() {
    let zombies = this.#zombies.filter(a => a.position.toString() === this.#player.position.toString());
    let cats = this.#cat.position.toString() === this.#player.position.toString() ? this.#cat : null;
    let images = "";
    zombies.forEach(z => images += `<div><img src="${z.imageUrl}" alt="an enemy"><p>You are attacked by an enemy!</p></div>`);
    if (cats != null) {
      images += `<div><img src="${this.#cat.imageUrl}" alt="rescue target"><p>You have found a kitten!</p></div>`;
    }
    if (images !== "") {
      __("#objects", images);
    } else {
      __("#objects", "")
    }
  }
}

/* #endregion */
/* #region Constants */
const pages = (input) => ({
  "start": `   <h1>Zocats</h1>
  <p>Ninja Cats vs Zombie Dogs and their foul allies</p>
  <h2>Story</h2>
  <p>The mystical seven kittens of the elemental cat god have been catnapped by the dark forces of the canine necromancer Sseth.</p>
  <p>If you do not save them he will use their powers to bring back the extinct "Monkeykind", the world enders, who were once his masters and "best friend". </p>
  <p>Our best operatives claim that Sseth works in collusion with the "Ruinous Rats"; the rats living in the forbidden "Monkeykind" ruins from before the great Apecalypse</p>
  <h2>Controls</h2>
  <p>Move by using the ARROW keys or ASWD</p>
  <h2>Goals</h2>
  <ul>
  <li> Collect the seven kittens by navigating to their position </li>
  <li> Avoid the zombie chasing you by not navigating to its position </li>
  <li> You have nine lives </li>
  <li> You have a sixth sense </li>
  <li> You have no internal vision [ie. 'minimap']</li>
  <li> Your efforts will be in vain</li>
  </ul>
  <button onclick="startGame()">Start the Game</button>
  <h3>Things you could do instead of playing this "game"</h3>
  <ul id="alternatives">
  </ul>`,
  
  "game": `   <div id = "statusbar">
  <p>Super-Hero Ninja Cat!</p>
  <img id="playerimage" alt="the player image">
  <p id="health"></p>
  <p id="savedcats"></p>
  </div> 
  <!---- <div id = "minimap"></div> Not implemented yet -->
  <div id = "gamearea">
  <img id="areaimage" src="resources/locations/2-1.png" alt="area background">
  <p id="coordinates"></p>
  <p id="sixthsense"></p>
  <p id = "areadescription"> Monkeykind graveyard, we should let them rest in peace </p>
  </div>
  <div id="events">
  <div id="objects"></div>
  </div>
  <div id = "navigation">
  <p>Controls: Navigate using ASWD or arrow keys</p>
  </div>`,
  
  "end" : `<h1>
  Congratulations! <br> You saved all the kittens and won the game
  </h1>
  <button onclick="location.reload()">Back To Title</button>`
})[input]


/**
 * The mapping between direction input and associated movement
 * @param {string} input the input which might represent a valid direction
 * @returns {[int, int]} the direction associated with input
*/
const directions = (input) => ({
  "a": [-1, 0],
  "s": [0, -1],
  "w": [0, 1],
  "d": [1, 0],
  "ArrowLeft": [-1, 0],
  "ArrowUp": [0, -1],
  "ArrowRight": [1, 0],
  "ArrowDown": [0, 1]
})[input]
/* #endregion */
/* #region Functions */
async function startScreen() {
  document.removeEventListener("keydown", moveFunction);
   await new Promise(r => setTimeout(r, 2000));
   setInnerHtml("start");
}
function startGame() {
  setInnerHtml("game");
  setButtons();
  game = new GameBoard;
}
async function endScreen(){
  document.removeEventListener("keydown", moveFunction);
  await new Promise(r => setTimeout(r, 2000));
  setInnerHtml("end");
}
function setButtons() {
  // Set event listener for keyboard events
  document.addEventListener(
    "keydown",
    moveFunction,
    false
    );
  }
  const moveFunction = (event) => {
    game.movePlayer(directions(event.key));
    return;
  }
  function setInnerHtml(page){
    var html = pages(page);
    if(html !== null){
      __("#body", html)
    }
  }
  /* #endregion */
  /* #region Init */
  setInnerHtml("start");
  let game;
  /* #endregion */