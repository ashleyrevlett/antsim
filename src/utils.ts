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

export { randomNumber, randomDirection, distance, midpoint }