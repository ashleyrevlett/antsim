import { Application, Graphics } from 'pixi.js';
import { UndirectedGraph } from 'graphology';
import dijkstra from 'graphology-shortest-path/dijkstra';

import Entity from './entity';
import { MAX_FOOD } from '../constants.ts';
import antTexture from '../../assets/ant.png';

export default class WorkerAnt extends Entity {
  hasFood: boolean = false;
  foodSprite: Graphics = new Graphics();

  constructor(app : Application, graph : UndirectedGraph) {
    super(antTexture, app, graph);

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
        // go to food storage node that's not full
        const nodes = this.graph.filterNodes((_node: string, attr) => attr.nodeType === 'foodStorage' && attr.foodCount < MAX_FOOD);
        if (nodes.length > 0) {
          const target = nodes[Math.floor(Math.random() * nodes.length)];
          this.path = dijkstra.bidirectional(this.graph, this.currentNode, target); // go back to food source
        } else {
          // if none exists, just pick a random node
          const target = this.graph.nodes()[Math.floor(Math.random() * this.graph.order)];
          this.path = dijkstra.bidirectional(this.graph, this.currentNode, target);
        }
      } else if (nodeType === 'foodStorage') {
        this.foodSprite.visible = false;
        this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => n + 1);
        this.path = dijkstra.bidirectional(this.graph, this.currentNode, 'N0'); // go back to food source
      }
    } else {
      // otherwise, set destination to next node in path
      let node = this.path?.shift();
      if (node) this.currentNode = node;
    }
  }

}
