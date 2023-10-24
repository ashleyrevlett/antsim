import { Application, Graphics } from 'pixi.js';
import {bidirectional} from 'graphology-shortest-path';

import Entity from './entity';
import antTexture from '../../assets/ant.png';
import { UndirectedGraph } from 'graphology';

export default class WorkerAnt extends Entity {
  hasFood: boolean = false;
  foodSprite: Graphics = new Graphics();

  constructor(app : Application, graph : UndirectedGraph) {
    super(antTexture, app, graph);

    // const randomColor = colors[Math.floor(Math.random() * colors.length)]
    this.tint = 0x000000;

    // add food sprite to stage
    let foodSize = 50;
    this.foodSprite.beginFill(0x32CD32);
    this.foodSprite.drawRect( -foodSize/2, -foodSize*2, foodSize, foodSize);
    this.foodSprite.setTransform(0, 0);
    this.foodSprite.zIndex = 2;
    this.addChild(this.foodSprite);
  }

  updatePath() {
    // if this is the end of the path, choose a new destination
    if (this.path?.length == 0) {
      const nodeType = this.graph.getNodeAttributes(this.currentNode).nodeType;
      if ( nodeType === 'foodSource') {
        if (this.foodSprite)
          this.foodSprite.visible = true;
        const target = this.getRandomNode('foodStorage');
        this.path = bidirectional(this.graph, this.currentNode, target); // go back to food source
      } else if (nodeType === 'foodStorage') {
        this.foodSprite.visible = false;
        this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => n + 1);
        this.path = bidirectional(this.graph, this.currentNode, 'N0'); // go back to food source
      }
    } else {
      // otherwise, set destination to next node in path
      this.currentNode = this.path?.shift();
    }
  }

}
