import { UndirectedGraph } from 'graphology';
import noverlap from 'graphology-layout-noverlap';
import { Graphics, Container, Ticker, DisplayObject, LINE_CAP, LINE_JOIN, Application } from 'pixi.js';
import { randomDirection, randomNumber } from '../utils';
import { MAX_FOOD } from '../constants.ts';

const minVariance = 60;
const maxVariance = 120;
const padding = 24;
const branchProbability = 0.5;
const maxMainNodes = 5;
const maxNodes = 20;
const nodeWidth = 40;
const nodeHeight = 20;
const edgeWidth = 25;
const leafColor = 0x87CEFA;
const roadColor = 0xF2D2BD;
const foodColor = 0x32CD32;

export default class Map {
  width: number;
  height: number;
  graph: UndirectedGraph;
  container: Container<DisplayObject>;

  constructor(app : Application) {
    this.width = app.renderer.screen.width;
    this.height = app.renderer.screen.height;
    this.graph = new UndirectedGraph();
    this.container = new Container();
    this.container.sortableChildren = true;
    app.stage.addChild(this.container);

    this.buildGraph();

    Ticker.shared.add(this.draw, this);
  }

  getGraph() {
    // expose graph var
    return this.graph;
  }

  addNode(lastNode : string | null = null) {
    // recursively add nodes and edges to graph
    let x = this.width / 2;
    let y = 0;
    if (lastNode) {
      const attr = this.graph.getNodeAttributes(lastNode);
      x = attr.x + randomNumber(minVariance, maxVariance) * randomDirection();
      y = attr.y + randomNumber(minVariance, maxVariance);
    }
    const node = this.graph.addNode('N' + this.graph.order, {
      x: Math.min(Math.max(padding, x), this.width - padding),
      y: Math.min(Math.max(0, y), this.height),
      w: nodeWidth,
      h: nodeHeight,
      color: leafColor,
    });

    if (lastNode) this.graph.addEdge(lastNode, node);

    let shouldBranch = Math.random() < branchProbability;
    if (shouldBranch && this.graph.order < maxNodes)
      this.addNode(node);
    return node;
  }

  buildGraph() {
    this.graph.clear();

    // build node tree
    let node = null;
    for (let i=0; i<maxMainNodes; i++) {
      node = this.addNode(node);
    }
    // color and size leaf nodes
    this.graph.forEachNode((node) => {
      if (node === 'N0') {
        // root node
        this.graph.setNodeAttribute(node, 'nodeType', 'foodSource');
      } else if (this.graph.degree(node) === 1 && node !== 'N0') {
        // leaves
        this.graph.setNodeAttribute(node, 'color', leafColor);
        this.graph.setNodeAttribute(node, 'nodeType', 'foodStorage');
        this.graph.setNodeAttribute(node, 'foodCount', 0);
      } else if (this.graph.degree(node) > 1) {
        // roads
        this.graph.setNodeAttribute(node, 'color', roadColor);
        this.graph.setNodeAttribute(node, 'h', edgeWidth/2);
        this.graph.setNodeAttribute(node, 'w', edgeWidth/2);
        this.graph.setNodeAttribute(node, 'nodeType', 'road');
      }
    });

    // layout node positions
    const positions = noverlap(this.graph, {
      maxIterations: 400,
      settings: {
        margin: 30
      }
    });

    // update node positions to layout positions
    Object.keys(positions).forEach(key => {
      this.graph.updateNodeAttribute(key, 'x', _x => positions[key].x);
      this.graph.updateNodeAttribute(key, 'y', _y => positions[key].y);
    });
  }

  drawNode(node : string, x : number, y : number, w :number, h: number, color : number) {
    // draw node on screen
    let obj = new Graphics();
    obj.beginFill(color);
    obj.drawRect( -w/2, -h/2, w, h);
    obj.setTransform(x, y);
    obj.zIndex = 2;
    this.container.addChild(obj);

    let foodCount = Math.min(MAX_FOOD, this.graph.getNodeAttribute(node, 'foodCount'));
    let foodSize = 3 * foodCount;
    let foodSprite = new Graphics();
    foodSprite.beginFill(foodColor);
    foodSprite.zIndex = 3;
    foodSprite.drawRect( -foodSize/2, -foodSize/2, foodSize, foodSize);
    foodSprite.setTransform(0, 0);
    foodSprite.zIndex = 2;
    obj.addChild(foodSprite);

    // const label = `${node} ${Math.round(x)}, ${Math.round(y)}`;
    // const label = `${node}`;
    // const label = `${node}: ${foodCount ? foodCount : ''}`;
    // const text = new Text(label, {
    //   fontFamily: 'Arial',
    //   fontSize: 12,
    //   fill: 0x000,
    //   align: 'center',
    // });
    // text.setTransform(x, y);
    // this.container.addChild(text);
  }

  drawEdge(vx : number, vy : number, wx : number, wy : number) {
    // draw edge on screen
    let edge = new Graphics();
    edge.lineStyle({
      cap:LINE_CAP.ROUND,
      join:LINE_JOIN.ROUND,
      width: edgeWidth,
      color:roadColor
    }).moveTo(vx, vy)
      .lineTo(wx, wy);
    edge.zIndex = -1;
    this.container.addChild(edge);
  }

  draw() {
    // clear stage
    for (var i = this.container.children.length - 1; i >= 0; i--) {
      this.container.removeChild(this.container.children[i]);
    }
    // draw nodes
    this.graph.forEachNode((node, attributes) => {
      this.drawNode(node, attributes.x, attributes.y, attributes.w, attributes.h, attributes.color);
    });
    // draw edges
    this.graph.forEachEdge((_edge, _attributes, _source, _target, sourceAttributes, targetAttributes) => {
      this.drawEdge(sourceAttributes.x, sourceAttributes.y, targetAttributes.x, targetAttributes.y);
    })
  }
}
