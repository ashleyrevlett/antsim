import { UndirectedGraph } from 'graphology';
import noverlap from 'graphology-layout-noverlap';
import { Point, Graphics, Container, DisplayObject, Text, LINE_CAP, LINE_JOIN, Application } from 'pixi.js';
import { segmentIntersection } from '@pixi/math-extras';
import { randomDirection, randomNumber, distance, midpoint, segmentIntersectRectangle } from '../utils';
import { DEBUG } from '../constants.ts';

const minVariance = 60;
const maxVariance = 120;
const padding = 24;
const branchProbability = 0.5;
const maxMainNodes = 5;
const maxNodes = 20;
const nodeWidth = 40;
const nodeHeight = 20;
const edgeWidth = 1;
const nodeColor = 0xffc0cb;
const leafColor = 0x87CEFA;
const roadColor = 0xF2D2BD;

interface Collision {
  intersection: Point;
  e1: string;
  e2: string;
}

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

    if (lastNode) {
      this.graph.addEdge(lastNode, node);
    };

    let shouldBranch = Math.random() < branchProbability;
    if (shouldBranch && this.graph.order < maxNodes)
      this.addNode(node);
    return node;
  }

  layoutGraph() {
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

  styleGraph() {
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
        this.graph.setNodeAttribute(node, 'color', nodeColor);
        this.graph.setNodeAttribute(node, 'h', nodeWidth / 3);
        this.graph.setNodeAttribute(node, 'w', nodeWidth/ 3);
        this.graph.setNodeAttribute(node, 'nodeType', 'road');
      }
    });
  }

  buildGraph() {
    this.graph.clear();

    // build node tree
    let node = null;
    for (let i=0; i<maxMainNodes; i++) {
      node = this.addNode(node);
    }

    this.layoutGraph();

    // replace overlapping lines with actual node intersection point
    let collided = this.resolveCollisions();
    const MAX_ITERATIONS = 5;
    let iterations = 1;
    while (collided && iterations < MAX_ITERATIONS) {
      console.log(`running ${iterations}`);
      this.layoutGraph();
      collided = this.resolveCollisions();
      iterations++;
    }

    if (iterations >= MAX_ITERATIONS) {
      console.log("too many iterations, starting over");
      this.buildGraph();
      return;
    }

    // set weight for each edge
    this.graph.forEachEdge((edge, _attributes, source, target) => {
      const attr1 = this.graph.getNodeAttributes(source);
      const attr2 = this.graph.getNodeAttributes(target);
      const d = distance(attr1.x, attr1.y, attr2.x, attr2.y);
      this.graph.setEdgeAttribute(edge, 'weight', d);
    });

    this.styleGraph();
    this.resolveNodeCollisions();
    this.styleGraph();

    this.draw();
  }

  resolveCollisions() : boolean {
    // resolving a collision can create another collision, so we return whether we found a collision so we can loop this
    let foundCollision = false;

    let collisions : Collision[] = [];
    this.graph.forEachEdge((e1, _attr1, source1, target1, sourceAttributes1, targetAttributes1) => {
      this.graph.forEachEdge((e2, _attr2, source2, target2, sourceAttributes2, targetAttributes2) => {
        if (e1 == e2) return;
        if (source1 == source2 || source1 == target2 || target1 == source2 || target1 == target2) return;

        const p1 = {'x': sourceAttributes1.x, 'y': sourceAttributes1.y};
        const p2 = {'x': targetAttributes1.x, 'y': targetAttributes1.y};
        const q1 = {'x': sourceAttributes2.x, 'y': sourceAttributes2.y};
        const q2 = {'x': targetAttributes2.x, 'y': targetAttributes2.y};
        const intersection = segmentIntersection(p1, p2, q1, q2);
        if (intersection && !isNaN(intersection.x) && !isNaN(intersection.y)) {
          console.log(`intersection: ${source1}-${target1}, ${source2}-${target2}`);
          const collision = {
            intersection: intersection,
            e1: e1,
            e2: e2,
          }
          collisions.push(collision);
        }
      });
    });

    let unique: Collision[] = [];
    collisions.forEach((collision) => {
      let matchingIntersection = unique.find(
        (i) => (i.e1 == collision.e2 && i.e2 == collision.e1) || (i.e1 == collision.e1 && i.e2 == collision.e2)
      );
      if (!matchingIntersection)
        unique.push(collision);
    });
    console.log("collisions: ", unique);

    if (unique.length > 0) foundCollision = true;

    unique.forEach((collision) => {
      const affectedNodes: string[] = [];
      try {
        affectedNodes.push(this.graph.source(collision.e1));
        affectedNodes.push(this.graph.target(collision.e1));
        affectedNodes.push(this.graph.source(collision.e2));
        affectedNodes.push(this.graph.target(collision.e2));
      } catch {
        console.log("error: ", collision);
        return;
      }

      // add node at intersection point
      const newNode = this.graph.addNode('N' + this.graph.order, {
        x: collision.intersection.x,
        y: collision.intersection.y,
        w: edgeWidth * 10,
        h: edgeWidth * 10,
        color: 0x00ff00,
        nodeType: 'road',
      });

      // remove existing edges
      this.graph.dropEdge(collision.e1);
      this.graph.dropEdge(collision.e2);

      // connect new node to existing nodes
      affectedNodes.forEach((node) => {
        this.graph.addEdge(newNode, node);
      });
    });

    return foundCollision;
  }


  resolveNodeCollisions() {
    console.log("resolving node collisions");
    // loop through leaf nodes, if any overlap with a line segment, remove the node
    this.graph.forEachNode((node, nodeAttributes) => {
      if (this.graph.degree(node) > 1 || node == 'N0') return;

      // detect collision between node and all edges not connected to this node
      const x = nodeAttributes.x;
      const y = nodeAttributes.y;
      const w = nodeAttributes.w;
      const h = nodeAttributes.h;

      this.graph.forEachEdge((_edge, _attr, source, target) => {
        if (source == node || target == node) return;

        const p1 = {'x': this.graph.getNodeAttributes(source).x, 'y': this.graph.getNodeAttributes(source).y};
        const p2 = {'x': this.graph.getNodeAttributes(target).x, 'y': this.graph.getNodeAttributes(target).y};
        const intersection = segmentIntersectRectangle(p1, p2, x, y, w, h);
        console.log(intersection);
        if (intersection) {
          console.log(`node intersection: ${node}, ${source}-${target}`);
          try {
            this.graph.dropNode(node);
            console.log("dropped node:", node);
          } catch {
            console.log("node no longer exists:", node);
          }
        }
      });
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

    if (DEBUG) {
      // const label = `${node} ${Math.round(x)}, ${Math.round(y)}`;
      const label = `${node}`;
      const text = new Text(label, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x000,
        align: 'center',
      });
      text.zIndex = 4;
      text.setTransform(x, y);
      this.container.addChild(text);
    }
  }

  drawEdge(_e:string, _attributes : any, vx : number, vy : number, wx : number, wy : number) {
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

    if (DEBUG) {
      const weight = _attributes.weight;
      const label = `${weight}`;
      const text = new Text(label, {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x000,
        align: 'center',
      });
      text.zIndex = 3;
      let p = midpoint(vx, vy, wx, wy);
      text.setTransform(p.x, p.y);
      this.container.addChild(text);
    }
  }

  draw() {
    // clear stage
    for (var i = this.container.children.length - 1; i >= 0; i--) {
      this.container.removeChild(this.container.children[i]);
    };

    // draw nodes
    this.graph.forEachNode((node, attributes) => {
      this.drawNode(node, attributes.x, attributes.y, attributes.w, attributes.h, attributes.color);
    });
    // draw edges
    this.graph.forEachEdge((edge, attributes, _source, _target, sourceAttributes, targetAttributes) => {
      this.drawEdge(edge, attributes, sourceAttributes.x, sourceAttributes.y, targetAttributes.x, targetAttributes.y);
    })
  }

  destroy() {
    this.container.destroy({children: true});
    this.graph.clear();
  }
}
