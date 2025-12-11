class Store {
  constructor() {
    this.subscribers = [];

    const saved = localStorage.getItem('shapes-state');
    this.state = saved ? JSON.parse(saved) : { shapes: [] };

    setTimeout(() => this.notify(), 0);
  }

  subscribe(fn) {
    this.subscribers.push(fn);
  }

  notify() {
    localStorage.setItem('shapes-state', JSON.stringify(this.state));
    this.subscribers.forEach((fn) => fn(this.state));
  }

  addShape(type, color) {
    const shape = {
      id: crypto.randomUUID(),
      type,
      color,
    };
    this.state.shapes.push(shape);
    this.notify();
  }

  removeShape(id) {
    this.state.shapes = this.state.shapes.filter((s) => s.id !== id);
    this.notify();
  }

  recolor(type, newColorsFn) {
    this.state.shapes = this.state.shapes.map((s) =>
      s.type === type ? { ...s, color: newColorsFn() } : s
    );
    this.notify();
  }

  getCounts() {
    const squares = this.state.shapes.filter((s) => s.type === 'square').length;
    const circles = this.state.shapes.filter((s) => s.type === 'circle').length;
    return { squares, circles };
  }
}

export const store = new Store();
