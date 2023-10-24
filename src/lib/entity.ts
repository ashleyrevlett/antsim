import { UndirectedGraph } from 'graphology';
import { ShortestPath } from 'graphology-shortest-path/unweighted';
import { Application, Sprite, Texture, Ticker, TextureSource } from 'pixi.js';


export default class Entity extends Sprite {
  graph: UndirectedGraph;
  speed: number = 1.5;
  currentNode: string = 'N0';
  path: ShortestPath | null = [];

  constructor(texture : TextureSource, app : Application, graph : UndirectedGraph) {
    super(Texture.from(texture));
    this.graph = graph;

    // add sprite to stage
    this.anchor.set(.5)
    this.scale.set(.08)
    this.zIndex = 1;
    app.stage.addChild(this);

    // start at root node
    const attr = this.graph.getNodeAttributes(this.currentNode);
    this.x = attr.x;
    this.y = attr.y;

    // calculate path to next node
    this.updatePath();

    // run update() on tick
    Ticker.shared.add(this.update, this);
  }

  distanceFromTarget() {
    let attr = this.graph.getNodeAttributes(this.currentNode);
    return Math.sqrt(Math.pow(attr.x - this.x, 2) + Math.pow(attr.y - this.y, 2));
  }

  getRandomNode(nodeType : string) {
    const nodes = this.graph.filterNodes((_node: string, attr) => attr.nodeType === nodeType);
    return nodes[Math.floor(Math.random() * nodes.length)];
  }

  updatePath() {
    return;
  }

  update(dt : number) {
      // if we've (almost) reached the target
      let attr = this.graph.getNodeAttributes(this.currentNode);
      if (Math.abs(this.x - attr.x) <= this.speed * dt &&
          Math.abs(this.y - attr.y) <= this.speed * dt
        ) {
        this.x = attr.x;
        this.y = attr.y;

        // figure out where to go next
        this.updatePath()
        return;
      }

      // otherwise, find direction to target
      let toX = attr.x - this.x;
      let toY = attr.y - this.y;

      // normalize
      let toLength = Math.sqrt(toX * toX + toY * toY);
      toX = toX / toLength;
      toY = toY / toLength;

      // move towards the target at speed
      this.x += toX * this.speed * dt;
      this.y += toY * this.speed * dt;
  }

}
