import './style.css'
import GameController from './lib/gameController.js'

let game = new GameController();



document.getElementById('generateMap')?.addEventListener(
  'click', () => {
    game.destroy();
    game = new GameController();
  }
);


const canvases = document.getElementsByTagName("canvas");
if (canvases.length === 1) {
  const canvas = canvases[0];
  canvas.addEventListener('webglcontextlost', (event) => {
    console.log("Caught it:", event);
    // debugger;
  });
}
