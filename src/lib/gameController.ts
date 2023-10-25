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
  map!: Map;

  constructor() {
    this.app = new Application({
      background: 0xffffff,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      hello: true,
      sharedTicker: true,
    });
    document.body.appendChild(this.app.view as HTMLCanvasElement);
    this.app.ticker.maxFPS = 120;

    // @ts-ignore
    globalThis.__PIXI_APP__ = this.app; // enable devtools

    // generate new map and ants
    this.map = new Map(this.app);
    this.timer = setInterval(() => {
      this.addAnt();
      if (this.ants.length >= maxAnts) {
        clearInterval(this.timer);
      }
    }, 1200);
    this.queen = new QueenAnt(this.app, this.map.getGraph());

    // setup btn
    document.getElementById('addAnt')!.addEventListener('click', this.addAnt);
  }

  addAnt = () => {
    this.ants.push(new WorkerAnt(this.app, this.map!.getGraph()));
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.queen?.destroy();
    this.queen = null;
    this.ants.forEach(ant => ant.destroy());
    this.ants = [];
    this.app!.destroy(true, { children: true, texture: true, baseTexture: true });

    document.getElementById('addAnt')!.removeEventListener('click', this.addAnt);
  }
}