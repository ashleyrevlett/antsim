import { Sprite, Texture, Ticker } from 'pixi.js';
import ant from '../assets/ant.png';
import {bfsFromNode} from 'graphology-traversal/bfs';

export default class Entity extends Sprite {
  constructor(app, graph) {
    super(Texture.from(ant));

    // add sprite to stage
    this.anchor.set(.5)
    this.scale.set(.15)
    this.x = app.renderer.width / 2;
    this.y = app.renderer.height / 2;
    app.stage.addChild(this);

    // set graph and init pathfinding
    this.graph = graph;
    this.findPath();

    // run update() on tick
    this.speed = 1;
    Ticker.shared.add(this.update, this);
  }

  findPath() {
    let currentNode = 'N0';
    this.setTarget(currentNode);
    this.on("hitTarget", () => {
      console.log("hit target");
      bfsFromNode(this.graph, currentNode, (node, attr, depth) => {
        currentNode = node;
        this.setTarget(currentNode);
        return depth >= 1;
      });
    });
  }

  setTarget(node) {
    let attr = this.graph.getNodeAttributes(node);
    this.targetPosition = {x: attr.x, y: attr.y};
  }

  update(dt) {
    if (this.targetPosition) {
      if (Math.abs(this.x - this.targetPosition.x) < 1) {
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;
        this.emit("hitTarget");
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
