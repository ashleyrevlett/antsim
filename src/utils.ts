function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomDirection() {
  let rnd = Math.random();
  if (rnd < 0.5) return -1;
  return 1;
}

export { randomNumber, randomDirection }