import { Application } from 'pixi.js';
import {bidirectional} from 'graphology-shortest-path';

import Entity from './entity';
import antTexture from '../../assets/ant.png';
import { UndirectedGraph } from 'graphology';

const maxHunger = 100;

export default class QueenAnt extends Entity {
  hunger: number = 0;
  health: number = 100;
  appetite: number = 0.035;

  constructor(app : Application, graph : UndirectedGraph) {
    super(antTexture, app, graph);
    this.tint = 0xff0000;
    this.scale.set(.1);
    this.speed = .8;
  }

  updatePath() {
    // if this is the end of the path, choose a new destination
    if (this.path?.length == 0) {
      // if we are at the food source, go to a random storage node
      const nodeType = this.graph.getNodeAttributes(this.currentNode).nodeType;
      if (nodeType === 'foodSource') {
        const target = this.getRandomNode('foodStorage');
        this.path = bidirectional(this.graph, this.currentNode, target);
      } else if (nodeType === 'foodStorage') {
        // if there's not any food here and we're hungry, go to the closest leaf with the most food
        // @TODO use weights for graph edges, and go to closest leaf with most food
        if (this.graph.getNodeAttributes(this.currentNode).foodCount == 0 && this.hunger >= maxHunger / 2) {
          let nodeWithMostFood = this.currentNode;
          this.graph.mapNodes((node, attr) => {
            if (attr.foodCount > this.graph.getNodeAttributes(nodeWithMostFood).foodCount) {
              nodeWithMostFood = node;
            }
          });
          this.path = bidirectional(this.graph, this.currentNode, nodeWithMostFood);
        }
      }
    } else {
      // otherwise, set destination to next node in path
      if (this.path)
        this.currentNode = this.path.shift()!;
    }
  }

  update(dt : number) {
    super.update(dt);

    document.getElementById('hungerLabel')!.innerHTML = `Hunger: ${this.hunger.toFixed(2)}`;
    document.getElementById('healthLabel')!.innerHTML = `Health: ${this.health.toFixed(2)}`;

    if (this.distanceFromTarget() <= 1) {
      let foodCount = this.graph.getNodeAttributes(this.currentNode).foodCount;
      if (foodCount > 0) {
        this.graph.updateNodeAttribute(this.currentNode, 'foodCount', n => Math.max(0, n - this.appetite * dt));
        this.hunger = Math.max(0, this.hunger - this.appetite * dt);
      } else {
        this.hunger = Math.min(maxHunger, this.hunger + this.appetite * dt);
      }
      if (this.hunger >= maxHunger) {
        this.health -= 1 * dt;
      }
    }

  }
}
