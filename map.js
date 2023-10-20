import { UndirectedGraph } from 'graphology';
// import { forEachConnectedComponent } from 'graphology-components';
// import forceLayout from 'graphology-layout-force';
import noverlap from 'graphology-layout-noverlap';
// import forceAtlas2 from 'graphology-layout-forceatlas2';

import { Graphics, Text } from 'pixi.js';
// import { segmentIntersection } from '@pixi/math-extras';

export function drawMap(app) {
  const minVariance = 60;
  const maxVariance = 120;
  const padding = 24;
  const branchProbability = 0.5;
  const maxMainNodes = 5;
  const maxNodes = 20;
  // const maxIterations = 10;
  const nodeWidth = 40;
  const nodeHeight = 20;
  const graph = new UndirectedGraph();

  // const intersections = []

  function clearStage() {
    console.log("clearing stage");
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

  // function aabbCollision(node1, node2) {
  //   const attr1 = graph.getNodeAttributes(node1);
  //   const attr2 = graph.getNodeAttributes(node2);
  //   if (attr1.x < attr2.x + attr2.w &&
  //     attr1.x + attr1.w > attr2.x &&
  //     attr1.y < attr2.y + attr2.h &&
  //     attr1.y + attr1.h > attr2.y) {
  //       return true;
  //   }
  //   return false;
  // }

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


  // function resolveBoxCollisions() {
  //   let iteration = 0;
  //   let foundCollision = true;
  //   while (foundCollision) {
  //     foundCollision = false;
  //     iteration++;

  //     graph.forEachNode((node) => {
  //       graph.forEachNode((n, attributes) => {

  //         if (n == node) return;

  //         if (aabbCollision(node, n)) {
  //           console.log("found collision", node, n);
  //           console.log("iteration", iteration);
  //           foundCollision = true;
  //           graph.setNodeAttribute(n, 'x', attributes.x + randomNumber(nodeWidth, nodeWidth * 3) * randomDirection());
  //           graph.setNodeAttribute(n, 'y', attributes.y + randomNumber(nodeWidth, nodeHeight * 3) * randomDirection());
  //         }

  //         if (iteration > maxIterations && foundCollision)  {
  //           console.log("max iterations reached for ", node);
  //           graph.dropNode(node);
  //           foundCollision = false;
  //         }

  //       });
  //     });

  //   }
  // }

  // function distance(p1, p2) {
  //   // calculate distance between two points, p1 and p2
  //   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  // }

  // function pointOnLineSegment(p1, p2, q) {
  //   if (distance(p1, q) + distance(p2, q) == distance(p1, p2))
  //       return true;
  //   return false;
  // }

  // function resolveLineCollisions() {
  //   const edgesToDrop = [];
  //   graph.forEachEdge((e1, attr1, source1, target1, sourceAttributes1, targetAttributes1) => {
  //     graph.forEachEdge((e2, attr2, source2, target2, sourceAttributes2, targetAttributes2) => {
  //       if (e1 == e2) return;
  //       if (source1 == source2 || source1 == target2 || target1 == source2 || target1 == target2) return;

  //       const p1 = {'x': sourceAttributes1.x, 'y': sourceAttributes1.y};
  //       const p2 = {'x': targetAttributes1.x, 'y': targetAttributes1.y};
  //       const q1 = {'x': sourceAttributes2.x, 'y': sourceAttributes2.y};
  //       const q2 = {'x': targetAttributes2.x, 'y': targetAttributes2.y};
  //       const intersection = segmentIntersection(p1, p2, q1, q2);
  //       if (intersection && !isNaN(intersection.x) && !isNaN(intersection.y)) {
  //         console.log("intersection from ", source1, target1, source2, target2);
  //         // console.log("intersection at ", intersection.x, intersection.y);
  //         intersections.push(intersection);
  //         // edgesToDrop.push(e2);
  //         graph.dropEdge(e2);
  //       }
  //     });
  //   });
  //   // let uniqueEdges = [...new Set(edgesToDrop)];
  //   // console.log("will drop:", uniqueEdges);
  //   // uniqueEdges.forEach((edge) => {
  //   //   console.log("dropping edge", edge);
  //   //   graph.dropEdge(edge);
  //   // });
  // }


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
    // const positions = forceLayout(graph, {
    //   maxIterations: 500,
    //   isNodeFixed: (node) => node == 'N0',
    //   settings: {
    //     attraction: 0.0005,
    //     repulsion: 0.1,
    //     gravity: 0.0001,
    //     inertia: 0.6,
    //     maxMove: 100,
    //   }
    // });
    const positions = noverlap(graph, {
      maxIterations: 400,
      settings: {
        margin: 30
      }
    });
    // const positions = forceAtlas2(graph, {
    //   iterations: 50,
    //   settings: {
    //     gravity: 2
    //   }
    // });

    // update node positions to layout positions
    Object.keys(positions).forEach(key => {
      graph.updateNodeAttribute(key, 'x', x => positions[key].x);
      graph.updateNodeAttribute(key, 'y', y => positions[key].y);
    });
  }

  function drawGraph() {
    console.log("drawing graph");
    clearStage();

    graph.forEachNode((node, attributes) => {
      drawNode(node, attributes.x, attributes.y, attributes.w, attributes.h, attributes.color);
    });
    graph.forEachEdge((edge, attributes, source, target, sourceAttributes, targetAttributes) => {
      drawEdge(sourceAttributes.x, sourceAttributes.y, targetAttributes.x, targetAttributes.y);
    })
    // let uniqueIntersections = [...new Set(intersections)];
    // uniqueIntersections.forEach((intersection) => {
    //   drawNode('', intersection.x, intersection.y, 10, 10, 0x00ff00);
    // });
  }

  /*
  @TODO
  Validate graph against heuristics for quality, and redo
  if crossed edges, not enough leaves, outside bounds, too complex, etc.
  */

  function init() {
    buildGraph();
    // resolveBoxCollisions();
    // resolveLineCollisions();
    layoutGraph();
    drawGraph();
    // setTimeout(() => {
    //   layoutGraph();
    //   drawGraph();
    // }, 1500);
    // console.log(JSON.stringify(graph));

    // // Listen for frame updates
    // app.ticker.add(() => {
    //     // each frame we spin the bunny around a bit
    //     obj.rotation += 0.01;
    // });
  }

  init();
}