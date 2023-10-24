import { Application } from 'pixi.js';
import {bidirectional} from 'graphology-shortest-path';

import Entity from './entity';
import antTexture from '../../assets/ant.png';
import { UndirectedGraph } from 'graphology';

const appetite = .05;

export default class QueenAnt extends Entity {
  constructor(app : Application, graph : UndirectedGraph) {
    super(antTexture, app, graph);
    this.tint = 0xff0000;
    this.scale.set(.1);
    this.speed = .5;
    this.zIndex = 1;
  }

  updatePath() {
    // if this is the end of the path, choose a new destination
    if (this.path?.length == 0) {
      // if we are at the food source, go to a random storage node
      const nodeType = this.graph.getNodeAttributes(this.currentNode).nodeType;
      if ( nodeType === 'foodSource') {
        const target = this.getRandomNode('foodStorage');
        this.path = bidirectional(this.graph, this.currentNode, target);
      }
    } else {
      // otherwise, set destination to next node in path
      this.currentNode = this.path?.shift();
    }
  }

  update(dt : number) {
    super.update(dt);
    let foodCount = this.graph.getNodeAttributes(this.currentNode).foodCount;
    if (foodCount && foodCount > 0) {
      this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => Math.max(0, n - appetite * dt));
    }
  }
}
