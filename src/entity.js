import { Sprite, Texture, Ticker, Graphics} from 'pixi.js';

import ant from '../assets/ant.png';
import {bidirectional} from 'graphology-shortest-path';

const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0xff00ff]

export default class Entity extends Sprite {
  constructor(app, graph) {
    super(Texture.from(ant));
    this.graph = graph;
    this.speed = 1.75;
    this.hasFood = false;

    // add ant sprite to stage
    this.anchor.set(.5)
    this.scale.set(.1)
    this.x = app.view.width / 2;
    this.y = app.view.height / 2;
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    this.tint = randomColor;
    app.stage.addChild(this);

    // add food sprite to stage
    let foodSize = 100;
    this.foodSprite = new Graphics();
    this.foodSprite.beginFill(0x0000ff);
    this.foodSprite.drawRect( -foodSize/2, -foodSize*2, foodSize, foodSize);
    this.foodSprite.setTransform(0, 0);
    this.foodSprite.zIndex = 2;
    this.addChild(this.foodSprite);

    // set position and path
    this.setStartingPosition()
    this.setPath();

    // run update() on tick
    Ticker.shared.add(this.update, this);
  }

  setStartingPosition() {
    this.currentNode = 'N0';
    let attr = this.graph.getNodeAttributes(this.currentNode);
    this.targetPosition = {x: attr.x, y: attr.y};
    this.x = attr.x;
    this.y = attr.y;
    this.setTargetPosition();
  }

  setTargetPosition() {
    let attr = this.graph.getNodeAttributes(this.currentNode);
    this.targetPosition = {x: attr.x, y: attr.y};
  }

  setPath(target=null) {
    if (!target) {
      target = this.currentNode;
      while (target == this.currentNode) {
        let leaves = this.graph.filterNodes((n, a) => this.graph.degree(n) === 1);
        target = leaves[Math.floor(Math.random() * leaves.length)];
      }
    }
    this.path = bidirectional(this.graph, this.currentNode, target);
  }

  update(dt) {
    if (this.targetPosition) {
      // when we (almost) reach the target...
      if (Math.abs(this.x - this.targetPosition.x) <= this.speed * dt &&
          Math.abs(this.y - this.targetPosition.y) <= this.speed * dt
        ) {
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;

        // if this is the end of the path, choose a new destination
        if (this.path.length == 0) {
          const nodeType = this.graph.getNodeAttributes(this.currentNode).nodeType;
          if ( nodeType === 'foodSource') {
            this.foodSprite.visible = true;
            this.setPath(); // go to random food leaf
          } else if (nodeType === 'foodStorage') {
            this.foodSprite.visible = false;
            this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => n + 1);
            this.setPath('N0'); // back to food source
          }
        } else {
          // otherwise, set destination to next node in path
          this.currentNode = this.path.shift();
          this.setTargetPosition();
        }
        return;
      }

      // move toward position
      let toPlayerX = this.targetPosition.x - this.x;
      let toPlayerY = this.targetPosition.y - this.y;

      // Normalize
      let toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
      toPlayerX = toPlayerX / toPlayerLength;
      toPlayerY = toPlayerY / toPlayerLength;

      // Move towards the player
      this.x += toPlayerX * this.speed * dt;
      this.y += toPlayerY * this.speed * dt;
    }
  }

}
