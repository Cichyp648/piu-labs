const KEY = "kanban-lab4";

const LANES = ["todo", "doing", "done"];

let state = {
    items: [], // {id, lane, text, color}
    last: 0
};

const laneElems = document.querySelectorAll(".lane");

const laneContainers = {};
const laneCounts = {};

laneElems.forEach(l => {
    const key = l.dataset.lane;
    laneContainers[key] = l.querySelector(".js-lane-cards");
    laneCounts[key] = l.querySelector(`[data-count="${key}"]`);
});

// Losowy kolor
function pastel() {
    return `hsl(${Math.random()*360}, 65%, 80%)`;
}

function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        state.items = data.items || [];
        state.last = data.last || 0;
    } catch {}
}

function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
}

function addCard(lane) {
    const id = ++state.last;
    state.items.push({
        id,
        lane,
        text: "Nowa karta",
        color: pastel()
    });
    save();
    render();
}

function removeCard(id) {
    state.items = state.items.filter(i => i.id !== id);
    save();
    render();
}

function shiftCard(id, dir) {
    const card = state.items.find(i => i.id === id);
    if (!card) return;

    const pos = LANES.indexOf(card.lane);

    if (dir === "left" && pos > 0) card.lane = LANES[pos - 1];
    if (dir === "right" && pos < LANES.length - 1) card.lane = LANES[pos + 1];

    save();
    render();
}

// Zmiana tekstu
function updateText(id, t) {
    const c = state.items.find(i => i.id === id);
    if (!c) return;
    c.text = t.trim() || "Pusta karta";
    save();
}

// Kolor karty
function recolorOne(id) {
    const c = state.items.find(i => i.id === id);
    if (!c) return;
    c.color = pastel();
    save();
    render();
}

// Kolor kolumny
function recolorLane(lane) {
    let changed = false;
    state.items.forEach(c => {
        if (c.lane === lane) {
            c.color = pastel();
            changed = true;
        }
    });

    if (changed) {
        save();
        render();
    }
}

function sortLane(lane) {
    const inLane = state.items
        .filter(c => c.lane === lane)
        .sort((a, b) => a.text.localeCompare(b.text, "pl", { sensitivity: "base" }));

    const other = state.items.filter(c => c.lane !== lane);

    state.items = other.concat(inLane);
    save();
    render();
}

function render() {
    LANES.forEach(k => laneContainers[k].innerHTML = "");
    const counts = { todo: 0, doing: 0, done: 0 };

    state.items.forEach(card => {
        counts[card.lane]++;

        const box = document.createElement("div");
        box.className = "card";
        box.dataset.id = card.id;
        box.style.backgroundColor = card.color;

        box.innerHTML = `
            <div class="card__tools">
                <button class="tool-btn tool--left">←</button>
                <button class="tool-btn tool--right">→</button>
                <button class="tool-btn tool--recolor">🎨</button>
                <button class="tool-btn tool--del">×</button>
            </div>
            <div class="card__text" contenteditable="true">${card.text}</div>
        `;

        const idx = LANES.indexOf(card.lane);
        if (idx === 0) box.querySelector(".tool--left").classList.add("tool--disabled");
        if (idx === LANES.length - 1) box.querySelector(".tool--right").classList.add("tool--disabled");

        laneContainers[card.lane].appendChild(box);
    });

    LANES.forEach(k => laneCounts[k].textContent = counts[k]);
}

// kolumny
laneElems.forEach(l => {
    const lane = l.dataset.lane;

    l.querySelector(".js-add").addEventListener("click", () => addCard(lane));
    l.querySelector(".js-recolor").addEventListener("click", () => recolorLane(lane));
    l.querySelector(".js-sort").addEventListener("click", () => sortLane(lane));

    l.addEventListener("click", e => {
        const btn = e.target.closest(".tool-btn");
        if (!btn) return;

        const box = btn.closest(".card");
        if (!box) return;
        const id = Number(box.dataset.id);

        if (btn.classList.contains("tool--del")) removeCard(id);
        else if (btn.classList.contains("tool--left")) shiftCard(id, "left");
        else if (btn.classList.contains("tool--right")) shiftCard(id, "right");
        else if (btn.classList.contains("tool--recolor")) recolorOne(id);
    });

    // edycja
    l.addEventListener("input", e => {
        if (!e.target.classList.contains("card__text")) return;
        const box = e.target.closest(".card");
        const id = Number(box.dataset.id);
        updateText(id, e.target.textContent);
    });
});

load();
render();
