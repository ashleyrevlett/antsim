import { Application } from 'pixi.js';

import Map from './map.js'
import Entity from './entity.js'

const maxAnts = 2;

export default class GameController {
  constructor() {
    this.app = new Application({
      background: '#fff',
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    document.body.appendChild(this.app.view);

    globalThis.__PIXI_APP__ = this.app; // enable devtools

    const btn = document.getElementById('generateMap');
    btn.addEventListener('click', () => this.startGame());

    const btn2 = document.getElementById('addAnt');
    btn2.addEventListener('click', () => this.addAnt());

    this.startGame();

    document.addEventListener('keyup', event => {
      if (event.code === 'Space') {
        this.addAnt();
      }
    })
  }

  addAnt() {
    console.log("addAnt")
    this.ants.push(new Entity(this.app, this.map.getGraph()));
  }

  startGame() {
    this.ants = [];
    this.map = new Map(this.app);
    let timer = setInterval(() => {
      this.ants.push(new Entity(this.app, this.map.getGraph()));
      if (this.ants.length >= maxAnts) {
        clearInterval(timer);
      }
    }, 1200);
  }
}