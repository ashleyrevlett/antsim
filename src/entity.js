import { Sprite, Texture, Ticker } from 'pixi.js';
import ant from '../assets/ant.png';

export default class Entity extends Sprite {
  constructor(app) {
    super(Texture.from(ant));
    this.anchor.set(.5)
    this.scale.set(.15)
    this.x = app.renderer.width / 2;
    this.y = app.renderer.height / 2;
    app.stage.addChild(this);
    Ticker.shared.add(this.update, this);

    this.speed = 1;
  }

  setTarget(position) {
    this.targetPosition = position;
  }

  update(dt) {
    // if (this.targetPosition && this.x != this.targetPosition.x && this.y != this.targetPosition.y) {
    //   this.x = this.targetPosition.x;
    //   this.y = this.targetPosition.y;
    // } else
    if (this.targetPosition) {
      if (Math.abs(this.x - this.targetPosition.x) < 1) {
        console.log("close enough");
        this.x = this.targetPosition.x;
        this.y = this.targetPosition.y;
        this.emit("hitTarget");
        return;
      }
      // move toward position
      // Calculate direction towards player
      let toPlayerX = this.targetPosition.x - this.x;
      let toPlayerY = this.targetPosition.y - this.y;

      // Normalize
      let toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
      toPlayerX = toPlayerX / toPlayerLength;
      toPlayerY = toPlayerY / toPlayerLength;

      // Move towards the player
      this.x += toPlayerX * this.speed * dt;
      this.y += toPlayerY * this.speed * dt;
    }
  }

}
