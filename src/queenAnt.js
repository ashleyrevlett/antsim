import { Graphics, Ticker } from 'pixi.js';
import {bidirectional} from 'graphology-shortest-path';

import Entity from './entity';
import antTexture from '../assets/ant.png';

const appetite = .05;

export default class QueenAnt extends Entity {
  constructor(app, graph) {
    super(antTexture, app, graph);
    this.tint = 0xff0000;
    this.scale.set(.1);
    this.speed = .5;
    this.zIndex = 1;

    Ticker.shared.add(this.update, this);
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
        this.setPath(); // go to random food leaf
      }
    } else {
      // otherwise, set destination to next node in path
      this.currentNode = this.path.shift();
      this.setTargetPosition();
    }
  }

  update(dt) {
    super.update(dt);

    let foodCount = this.graph.getNodeAttributes(this.currentNode).foodCount;
    if (foodCount && foodCount > 0) {
      this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => Math.max(0, n - appetite * dt));
      console.log("ate");
    }

  }

}
