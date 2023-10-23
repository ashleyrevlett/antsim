import { UndirectedGraph } from 'graphology';
import noverlap from 'graphology-layout-noverlap';
import { Graphics, Text } from 'pixi.js';
import { randomDirection, randomNumber } from './utils';

const minVariance = 60;
const maxVariance = 120;
const padding = 24;
const branchProbability = 0.5;
const maxMainNodes = 5;
const maxNodes = 20;
const nodeWidth = 40;
const nodeHeight = 20;

export default class Map {
  constructor(app) {
    this.app = app;
    this.graph = new UndirectedGraph();
    this.buildGraph();
    this.drawGraph();
  }

  getGraph() {
    // expose graph var
    return this.graph;
  }

  addNode(lastNode=null) {
    // recursively add nodes and edges to graph
    let x = this.app.renderer.screen.width / 2;
    let y = 0;
    if (lastNode) {
      const attr = this.graph.getNodeAttributes(lastNode);
      x = attr.x + randomNumber(minVariance, maxVariance) * randomDirection();
      y = attr.y + randomNumber(minVariance, maxVariance);
    }
    const node = this.graph.addNode('N' + this.graph.order, {
      x: Math.min(Math.max(padding, x), this.app.renderer.screen.width - padding),
      y: Math.min(Math.max(0, y), this.app.renderer.screen.height),
      w: nodeWidth,
      h: nodeHeight,
      color: 0xff0000,
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
      if (this.graph.degree(node) === 1 && node !== 'N0') {
        this.graph.setNodeAttribute(node, 'color', 0x0000ff);
      } else if (this.graph.degree(node) > 1) {
        // leaves
        this.graph.setNodeAttribute(node, 'color', 0xff0000);
        this.graph.setNodeAttribute(node, 'h', 10);
        this.graph.setNodeAttribute(node, 'w', 10);
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
      this.graph.updateNodeAttribute(key, 'x', x => positions[key].x);
      this.graph.updateNodeAttribute(key, 'y', y => positions[key].y);
    });
  }

  drawNode(node, x, y, w, h, color) {
    // draw node on screen
    let obj = new Graphics();
    obj.beginFill(color);
    obj.drawRect( -w/2, -h/2, w, h);
    obj.setTransform(x, y);
    this.app.stage.addChild(obj);

    // const label = `${node} ${Math.round(x)}, ${Math.round(y)}`;
    const label = `${node}`;
    const text = new Text(label, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x000,
      align: 'center',
    });
    text.setTransform(x, y);
    this.app.stage.addChild(text);
  }

  drawEdge(vx, vy, wx, wy) {
    // draw edge on screen
    let edge = new Graphics();
    edge.lineStyle(1, 0xff0000)
      .moveTo(vx, vy)
      .lineTo(wx, wy);
    this.app.stage.addChild(edge);
  }

  drawGraph() {
    // clear stage
    for (var i = this.app.stage.children.length - 1; i >= 0; i--) {
      this.app.stage.removeChild(this.app.stage.children[i]);
    }
    // draw nodes
    this.graph.forEachNode((node, attributes) => {
      this.drawNode(node, attributes.x, attributes.y, attributes.w, attributes.h, attributes.color);
    });
    // draw edges
    this.graph.forEachEdge((edge, attributes, source, target, sourceAttributes, targetAttributes) => {
      this.drawEdge(sourceAttributes.x, sourceAttributes.y, targetAttributes.x, targetAttributes.y);
    })
  }
}
