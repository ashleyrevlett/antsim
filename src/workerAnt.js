import { Graphics } from 'pixi.js';
import {bidirectional} from 'graphology-shortest-path';

import Entity from './entity';
import antTexture from '../assets/ant.png';

// const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0xff00ff]

export default class WorkerAnt extends Entity {
  constructor(app, graph) {
    super(antTexture, app, graph);

    // const randomColor = colors[Math.floor(Math.random() * colors.length)]
    this.tint = 0x000000;

    // add food sprite to stage
    let foodSize = 50;
    this.foodSprite = new Graphics();
    this.foodSprite.beginFill(0x32CD32);
    this.foodSprite.drawRect( -foodSize/2, -foodSize*2, foodSize, foodSize);
    this.foodSprite.setTransform(0, 0);
    this.foodSprite.zIndex = 2;
    this.addChild(this.foodSprite);
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

  updateTargetPath() {
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
  }

}
