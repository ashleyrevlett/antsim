import { segmentIntersection } from '@pixi/math-extras';

class Point {
  x: number;
  y: number;
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }
}

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomDirection() {
  let rnd = Math.random();
  if (rnd < 0.5) return -1;
  return 1;
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)).toFixed(2);
}

function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  }
}

function segmentIntersectRectangle(p1: Point, p2: Point, x:number, y:number, w:number, h:number) : boolean {
  // create line segment for each side of the rectangle
  let found = false;
  let top = [new Point(x, y), new Point(x + w, y)];
  let right = [new Point(x + w, y), new Point(x + w, y + h)];
  let bottom = [new Point(x + w, y + h), new Point(x, y + h)];
  let left = [new Point(x, y + h), new Point(x, y)];
  let lines = [top, right, bottom, left];
  lines.forEach(line => {
    let intersection:Point = segmentIntersection(p1, p2, line[0], line[1]);
    if (intersection && !isNaN(intersection.x) && !isNaN(intersection.y)) {
      found = true;
      return;
    }
  });
  return found;
}


export { randomNumber, randomDirection, distance, midpoint, segmentIntersectRectangle }