import { Application } from 'pixi.js';

import Map from './map.js'
import Entity from './entity.js'

export default class GameController {
  constructor() {
    this.app = new Application({
      background: '#1099bb',
      resizeTo: window,
    });

    globalThis.__PIXI_APP__ = this.app; // enable devtools

    document.body.appendChild(this.app.view);

    this.startGame();

    const btn = document.getElementById('generateMap');
    btn.addEventListener('click', () => this.startGame());
  }

  startGame() {
    const map = new Map(this.app);
    console.log("Map:",  map.getGraph());
    const ant = new Entity(this.app, map.getGraph());
  }
}