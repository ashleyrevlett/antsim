import { Application } from 'pixi.js';

import Map from './map.ts';
import WorkerAnt from './workerAnt.js';
import QueenAnt from './queenAnt.js';

const maxAnts = 10;

export default class GameController {
  app: Application;
  timer: number | undefined;
  ants: WorkerAnt[] = [];
  queen!: QueenAnt | null;
  map!: Map | null;

  constructor() {
    this.app = new Application({
      background: 0x6F4E37,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    // globalThis.__PIXI_APP__ = this.app; // enable devtools

    document.getElementById('generateMap')?.addEventListener(
      'click', () => this.startGame()
    );

    document.getElementById('addAnt')?.addEventListener(
      'click', () => this.addAnt()
    );

    document.addEventListener('keyup', event => {
      if (event.code === 'Space') {
        this.addAnt();
      }
    })

    this.startGame();

  }

  addAnt() {
    this.ants.push(new WorkerAnt(this.app, this.map!.getGraph()));
  }

  startGame() {
    // clear everything
    // if (this.map) this.map.destroy();
    if (this.timer) clearInterval(this.timer);
    this.ants = [];
    // this.queen = null;
    while(this.app.stage.children[0]) {
      this.app.stage.removeChild(this.app.stage.children[0])
    }

    // generate new map and ants
    this.map = new Map(this.app);
    this.timer = setInterval(() => {
      this.addAnt();
      if (this.ants.length >= maxAnts) {
        clearInterval(this.timer);
      }
      // console.log("add ant");
    }, 1200);
    this.queen = new QueenAnt(this.app, this.map.getGraph());
  }
}