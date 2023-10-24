import { Sprite, Texture, Ticker } from 'pixi.js';


export default class Entity extends Sprite {
  constructor(texture, app, graph) {
    super(Texture.from(texture));
    this.graph = graph;
    this.speed = 1.5;

    // add sprite to stage
    this.anchor.set(.5)
    this.scale.set(.08)
    app.stage.addChild(this);

    // start at root node
    this.currentNode = 'N0';
    const attr = this.graph.getNodeAttributes(this.currentNode);
    this.x = attr.x;
    this.y = attr.y;

    // calculate path to next node
    this.path = [];
    this.updatePath();

    // run update() on tick
    Ticker.shared.add(this.update, this);
  }

  getRandomNode(nodeType) {
    const nodes = this.graph.filterNodes((node, attr) => attr.nodeType === nodeType);
    return nodes[Math.floor(Math.random() * nodes.length)];
  }

  updatePath() {
    return;
  }

  update(dt) {
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
