import { store } from './store.js';
import { randomHsl } from './helpers.js';

const board = document.getElementById('board');
const cntSquares = document.getElementById('cntSquares');
const cntCircles = document.getElementById('cntCircles');
const controls = document.querySelector('.controls');

function renderShape(shape) {
  const el = document.createElement('div');
  el.className = `shape ${shape.type}`;
  el.style.backgroundColor = shape.color;
  el.dataset.id = shape.id;
  return el;
}

// subskrypcja, aktualizacja ui
store.subscribe((state) => {
  const { squares, circles } = store.getCounts();
  cntSquares.textContent = squares;
  cntCircles.textContent = circles;

  const existingIds = new Set(state.shapes.map((s) => s.id));
  

  [...board.children].forEach((el) => {
    if (!existingIds.has(el.dataset.id)) {
      el.remove();
    }
  });

  state.shapes.forEach((shape) => {
    if (!board.querySelector(`[data-id="${shape.id}"]`)) {
      board.appendChild(renderShape(shape));
    } else {
      const el = board.querySelector(`[data-id="${shape.id}"]`);
      el.style.backgroundColor = shape.color;
    }
  });
});

board.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('shape')) {
    const id = target.dataset.id;
    store.removeShape(id);
  }
});

controls.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  switch (action) {
    case 'addSquare':
      store.addShape('square', randomHsl());
      break;
    case 'addCircle':
      store.addShape('circle', randomHsl());
      break;
    case 'recolorSquares':
      store.recolor('square', randomHsl);
      break;
    case 'recolorCircles':
      store.recolor('circle', randomHsl);
      break;
  }
});
