import { createCanvas, randomInt } from "./js/utils";

const { CANVAS, context } = createCanvas(innerWidth, innerHeight)

/* CONSTANT */
const GLOBALALPHA = 0.6
let SCORE = 0
let GAVEOVER = false
const seenObstacles = new Set()
let player;
let obstacles = []

context.globalAlpha = GLOBALALPHA

class Player {
  /**
      *
      * @param {{position : {x:number,y:number},radius:Number,fillStyle:String}} param
      */
  constructor({ position, radius, fillStyle = "red", context }) {
    this.position = position;
    this.radius = radius;
    this.fillStyle = fillStyle;
    this.context = context;
  }

  draw() {
    const { x: PX, y: Py } = this.position;
    this.context.beginPath();
    this.context.arc(PX, Py, this.radius, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.fillStyle = this.fillStyle;
    this.context.strokeStyle = "black";
    this.context.fill();
    return this
  }

  update() {
    this.position.y += 2
    if (this.position.y > innerHeight) {
      GAVEOVER = true
    }
    this.draw()
  }

  mouseUpdate({ mx, my }) {
    this.position.x = mx
    this.position.y = my
    this.draw()
  }

}

class Obstacles {
  /**
    *
    * @param {{position : {x:number,y:number},heightUp:Number,heightDown:Number,id :Number,fillStyle:String}} param
    */
  constructor({ position, heightUp, heightDown, fillStyle = "red", id, context, CANVAS }) {
    this.position = position;
    this.heightUp = heightUp;
    this.heightDown = heightDown;
    this.fillStyle = fillStyle;
    this.context = context;
    this.CANVAS = CANVAS;
    this.rectWidth = 30
    this.id = id
  }

  draw() {
    const { x: Px } = this.position;
    if (this.heightUp + this.heightDown > (innerHeight * .6)) {
      this.heightUp -= (this.heightUp * .1)
      this.heightDown -= (this.heightDown * .1)
    }
    context.fillRect(Px, 0, this.rectWidth, this.heightUp)
    context.fillRect(Px, innerHeight - this.heightDown, this.rectWidth, this.heightDown)
    return this
  }

  update(dx) {
    this.position.x += -dx
    this.draw()
    return this
  }

  isCollideUp(player) {
    const { x: pX, y: pY } = player.position
    const ouBX = this.position.x
    const ouBY = 0
    const ouBW = this.rectWidth
    const ouBH = this.heightUp
    // temporary variables to set edges for testing
    let testX = pX
    let testY = pY
    /* edge is closest */

    if (pX < ouBX) testX = ouBX // test left 
    else if (pX > (ouBX + ouBW)) testX = ouBX + ouBW // right edge

    if (pY < ouBY) testY = ouBY // top edge 
    else if (pY > (ouBY + ouBH)) testY = ouBY + ouBH // bottom edge


    /* get distance from closest edges */
    const distanceX = pX - testX
    const distanceY = pY - testY
    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))
    if (distance <= player.radius) {
      return true
    }
    return false
  }

  isCollideDown(player) {
    const { x: pX, y: pY } = player.position
    const ouBX = this.position.x
    const ouBY = innerHeight - this.heightDown
    const ouBW = this.rectWidth
    const ouBH = this.heightDown
    // temporary variables to set edges for testing
    let testX = pX
    let testY = pY
    /* edge is closest */

    if (pX < ouBX) testX = ouBX // test left 
    else if (pX > (ouBX + ouBW)) testX = ouBX + ouBW // right edge

    if (pY < ouBY) testY = ouBY // top edge 
    else if (pY > (ouBY + ouBH)) testY = ouBY + ouBH // bottom edge


    /* get distance from closest edges */
    const distanceX = pX - testX
    const distanceY = pY - testY
    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))
    if (distance <= player.radius) {
      return true
    }
    return false
  }

  isCollide(player) {
    if (this.isCollideUp(player) || this.isCollideDown(player)) {
      GAVEOVER = true
    }
    return this

  }

  /**
   * 
   * @param {Player} player 
   */
  isCrossed(player) {
    const { x: pX, y: pY } = player.position
    const radius = player.radius
    var dist;
    const A = { x: this.position.x + this.rectWidth, y: 0 }
    const B = { x: this.position.x + this.rectWidth, y: innerHeight - this.heightDown }
    const v1x = B.x - A.x;
    const v1y = B.y - A.y;
    const v2x = pX - A.x;
    const v2y = pY - A.y;
    // get the unit distance along the line of the closest point to
    // circle center
    const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);


    // if the point is on the line segment get the distance squared
    // from that point to the circle center
    if (u >= 0 && u <= 1) {
      dist = (A.x + v1x * u - pX) ** 2 + (A.y + v1y * u - pY) ** 2;
    } else {
      // if closest point not on the line segment
      // use the unit distance to determine which end is closest
      // and get dist square to circle
      dist = u < 0 ?
        (A.x - pX) ** 2 + (A.y - pY) ** 2 :
        (B.x - pX) ** 2 + (B.y - pY) ** 2;
    }
    if (dist < radius * radius) {
      if (!seenObstacles.has(this.id)) {
        seenObstacles.add(this.id)
        SCORE += 1
      }
    }
  }
}

function createObstacle(x, id) {
  return new Obstacles({
    position: { x: x, y: randomInt(50, 300) },
    heightDown: randomInt(40, innerHeight),
    heightUp: randomInt(40, innerHeight),
    fillStyle: "green",
    id: id,
    context
  })
}

function createObstacles() {
  for (let index = 0; index < 100; index++) {
    let x = (300 * index)
    if (index == 0) {
      x += 1000
    }
    obstacles.push(createObstacle(x, index))
  }
}


/* GAME CONTROL */
window.addEventListener("keypress", (event) => {
  switch (event.code) {
    case "Space":
      player.position.y += -30
      break;
    case "KeyD":
      player.position.x += 10
      break;
    case "KeyA":
      player.position.x += -10
      break;

    default:
      break;
  }
})


function reset() {
  GAVEOVER = false
  SCORE = 0
  player.position.x = 0
  player.position.y = 0
  obstacles = []
  createObstacles()
  seenObstacles.clear()
}


function setup(){

  player = new Player({
    position: { x: 100, y: 100 },
    velocity: { x: 10, y: 5 },
    radius: 30,
    context,
    CANVAS
  })
  createObstacles()

}

setup()

function gameLoop() {
  
  if (GAVEOVER) {
    const result = confirm(`GAVE OVER END YOUR FINAL SCORE : ${SCORE}`)
    if (result) {
      reset()
    }

  }
  /* PLAYER */
  player.update()
  /* MOVE obstacles */
  obstacles.forEach(obstacle => {
    obstacle.update(1).isCollide(player).isCrossed(player)
  })

  context.font = "30px Arial";
  context.fillStyle = "black"
  context.fillText(`SCORE : ${SCORE}`, innerWidth - 200, 100);

}

function start() {
  requestAnimationFrame(start)
  /* CLEAR RECT */
  context.clearRect(0, 0, innerWidth, innerHeight)
  gameLoop()
}

start()
