import { UndirectedGraph } from 'graphology';
import { Sprite, Graphics, Ticker } from 'pixi.js';
import { MAX_FOOD } from '../constants.ts';

const foodColor = 0x32CD32;

export default class Food extends Sprite {
  private graph: UndirectedGraph;
  private sprite: Graphics;
  private node: string;

  constructor(node: string, graph: UndirectedGraph) {
    super();

    this.graph = graph;
    this.node = node;
    this.sprite = new Graphics();
    this.sprite.zIndex = 2;

    const x = this.graph.getNodeAttribute(this.node, 'x');
    const y = this.graph.getNodeAttribute(this.node, 'y');
    this.sprite.setTransform(x, y);

    this.addChild(this.sprite);

    Ticker.shared.add(this.update, this);
  }

  private update() {
    let amount = this.graph.getNodeAttribute(this.node, 'foodCount');
    let foodCount = Math.min(MAX_FOOD, parseFloat(amount));
    let foodSize = 3 * foodCount;
    this.sprite.clear();
    this.sprite.beginFill(foodColor);
    this.sprite.drawRect( -foodSize/2, -foodSize/2, foodSize, foodSize);
    this.sprite.endFill();
  }

  destroy() {
    Ticker.shared.remove(this.update, this);
    super.destroy({children: true});
  }
}
