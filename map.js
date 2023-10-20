import { UndirectedGraph } from 'graphology';
import noverlap from 'graphology-layout-noverlap';
import { Graphics, Text } from 'pixi.js';

export function drawMap(app) {
  const minVariance = 60;
  const maxVariance = 120;
  const padding = 24;
  const branchProbability = 0.5;
  const maxMainNodes = 5;
  const maxNodes = 20;
  const nodeWidth = 40;
  const nodeHeight = 20;
  const graph = new UndirectedGraph();


  function clearStage() {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {
      app.stage.removeChild(app.stage.children[i]);
    }
  }

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomDirection() {
    let rnd = Math.random();
    if (rnd < 0.5) return -1;
    return 1;
  }

  function drawNode(node, x, y, w, h, color) {
    let obj = new Graphics();
    obj.beginFill(color);
    obj.drawRect( -w/2, -h/2, w, h);
    obj.setTransform(x, y);
    app.stage.addChild(obj);

    const text = new Text(`${node} ${Math.round(x)}, ${Math.round(y)}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x000,
      align: 'center',
    });
    text.setTransform(x, y);
    app.stage.addChild(text);
  }

  function drawEdge(vx, vy, wx, wy) {
    let edge = new Graphics();
    edge.lineStyle(1, 0xff0000)
      .moveTo(vx, vy)
      .lineTo(wx, wy);
    app.stage.addChild(edge);
  }

  function addNode(lastNode=null) {
    let x = app.renderer.width / 2;
    let y = 0;
    if (lastNode) {
      const attr = graph.getNodeAttributes(lastNode);
      x = attr.x + randomNumber(minVariance, maxVariance) * randomDirection();
      y = attr.y + randomNumber(minVariance, maxVariance);
    }
    const node = graph.addNode('N' + graph.order, {
      x: Math.min(Math.max(padding, x), app.renderer.width - padding),
      y: Math.min(Math.max(0, y), app.renderer.height),
      w: nodeWidth,
      h: nodeHeight,
      color: 0xff0000,
    });

    if (lastNode) graph.addEdge(lastNode, node);

    let shouldBranch = Math.random() < branchProbability;
    if (shouldBranch && graph.order < maxNodes)
      addNode(node);

    return node;
  }

  function buildGraph() {
    graph.clear();

    // build node tree
    let node = null;
    for (let i=0; i<maxMainNodes; i++) {
      node = addNode(node);
    }
    // color and size leaf nodes
    graph.forEachNode((node) => {
      if (graph.degree(node) === 1 && node !== 'N0') {
        graph.setNodeAttribute(node, 'color', 0x0000ff);
      } else if (graph.degree(node) > 1) {
        // leaves
        graph.setNodeAttribute(node, 'color', 0xff0000);
        graph.setNodeAttribute(node, 'h', 10);
        graph.setNodeAttribute(node, 'w', 10);
      }
    });
  }

  function layoutGraph() {
    const positions = noverlap(graph, {
      maxIterations: 400,
      settings: {
        margin: 30
      }
    });

    // update node positions to layout positions
    Object.keys(positions).forEach(key => {
      graph.updateNodeAttribute(key, 'x', x => positions[key].x);
      graph.updateNodeAttribute(key, 'y', y => positions[key].y);
    });
  }

  function drawGraph() {
    clearStage();

    graph.forEachNode((node, attributes) => {
      drawNode(node, attributes.x, attributes.y, attributes.w, attributes.h, attributes.color);
    });
    graph.forEachEdge((edge, attributes, source, target, sourceAttributes, targetAttributes) => {
      drawEdge(sourceAttributes.x, sourceAttributes.y, targetAttributes.x, targetAttributes.y);
    })
  }

  function init() {
    buildGraph();
    layoutGraph();
    drawGraph();

    // // Listen for frame updates
    // app.ticker.add(() => {
    //     // each frame we spin the bunny around a bit
    //     obj.rotation += 0.01;
    // });
  }

  /*
  @TODO
  Validate graph against heuristics for quality, and redo
  if crossed edges, not enough leaves, outside bounds, too complex, etc.
  */

  init();
}