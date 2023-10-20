import './style.css'
import { Application } from 'pixi.js';

import { drawMap } from './map.js'

// drawMap(document.querySelector('#map'))

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application({
  background: '#1099bb',
  resizeTo: window,
});

// enable devtools
globalThis.__PIXI_APP__ = app;

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

drawMap(app);

const btn = document.getElementById('generateMap');
btn.addEventListener('click', () => { drawMap(app) });
