import { Application } from 'pixi.js';
import Map from './map.ts';
import WorkerAnt from './workerAnt.js';
import QueenAnt from './queenAnt.js';
import Food from './food.ts';

const maxAnts = 10;

export default class GameController {
  app: Application;
  timer: number | undefined;
  ants: WorkerAnt[] = [];
  queen!: QueenAnt | null;
  map!: Map;
  foodObjects: Food[] = [];

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

    const graph = this.map.getGraph();
    this.queen = new QueenAnt(this.app, graph);

    // add food sprites to each storage node
    graph.forEachNode((node, attributes) => {
      if (attributes.nodeType === 'foodStorage') {
        let f = new Food(node, graph);
        this.foodObjects.push(f);
        this.app.stage.addChild(f);
      }
    });


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
    this.foodObjects.forEach(food => food.destroy());
    this.foodObjects = [];
    this.app!.destroy(true, { children: true, texture: true, baseTexture: true });

    document.getElementById('addAnt')!.removeEventListener('click', this.addAnt);
  }
}