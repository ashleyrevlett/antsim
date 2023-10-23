import { Sprite, Texture, Ticker } from 'pixi.js';


export default class Entity extends Sprite {
  constructor(texture, app, graph) {
    super(Texture.from(texture));
    this.graph = graph;
    this.speed = 1.5;
    this.hasFood = false;
    this.currentNode = null;

    // add sprite to stage
    this.anchor.set(.5)
    this.scale.set(.08)
    this.x = app.view.width / 2;
    this.y = app.view.height / 2;
    app.stage.addChild(this);

    // set position and path
    this.setStartingPosition()
    this.setPath();

    // run update() on tick
    Ticker.shared.add(this.update, this);
  }

  setStartingPosition() {
    this.currentNode = 'N0';
    let attr = this.graph.getNodeAttributes(this.currentNode);
    this.targetPosition = {x: attr.x, y: attr.y};
    this.x = attr.x;
    this.y = attr.y;
    this.setTargetPosition();
  }

  setTargetPosition() {
    let attr = this.graph.getNodeAttributes(this.currentNode);
    this.targetPosition = {x: attr.x, y: attr.y};
  }

  setPath(target=null) {
    return;
  }

  updateTargetPath() {
    return;
  }

  update(dt) {
    if (this.targetPosition) {
      // when we (almost) reach the target...
      if (Math.abs(this.x - this.targetPosition.x) <= this.speed * dt &&
          Math.abs(this.y - this.targetPosition.y) <= this.speed * dt
        ) {
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;

        this.updateTargetPath()

        return;
      }

      // move toward target position
      let toX = this.targetPosition.x - this.x;
      let toY = this.targetPosition.y - this.y;

      // normalize
      let toLength = Math.sqrt(toX * toX + toY * toY);
      toX = toX / toLength;
      toY = toY / toLength;

      // Move towards the target
      this.x += toX * this.speed * dt;
      this.y += toY * this.speed * dt;
    }
  }

}
