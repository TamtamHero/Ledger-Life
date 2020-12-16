const width = 400;
const height = 400;
const rows = 32;
const cols = 32;
let cells = [];
let activeTeam = 0;

const colors = [
  [200, 200, 200],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255]
];

function getNewCellState(cell) {
  const team = cells[cell];
  const x = cell % cols;
  const y = Math.floor(cell / cols);

  const rawNeighbors = [
    [x - 1, y - 1],
    [x - 1, y],
    [x - 1, y + 1],
    [x, y - 1],
    [x, y + 1],
    [x + 1, y - 1],
    [x + 1, y],
    [x + 1, y + 1]
  ];

  const aliveNeighbors = [];
  const aliveByTeam = {};
  for (let i = 0; i < rawNeighbors.length; i++) {
    const [x, y] = rawNeighbors[i];
    const ind = y * cols + x;
    if (x >= 0 && x < cols && y >= 0 && y < rows && cells[ind]) {
      aliveNeighbors.push(ind);
      aliveByTeam[cells[ind]] = (aliveByTeam[cells[ind]] || 0) + 1;
    }
  }
  if (aliveNeighbors.length === 3 && team === 0){
    for(let key in aliveByTeam){
      if(aliveByTeam[key] >= 2) return key;
    }
  } //it was dead, bring to live
  if (aliveNeighbors.length >= 3) return 0; //too crowded
  if (aliveNeighbors.length >= 2) return team; //stay alive
  return 0; //too lonely
}

function golTick() {
  const cellsCopy = [];
  for (let cell = 0; cell < cells.length; cell++) {
    cellsCopy.push(getNewCellState(cell));
  }
  cells = cellsCopy;
}

// Functions below are used for the drawing, not the GOL
function setup() {
  frameRate(10);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      cells.push(activeTeam);
    }
  }
  createCanvas(width, height);
}

function draw() {
  background(1000);
  const h = height / rows;
  const w = width / cols;
  // Draw grid
  for (let y = 1; y < rows; y++) {
    line(0, y * h, width, y * h);
  }
  for (let x = 1; x < cols; x++) {
    line(x * w, 0, x * w, height);
  }
  stroke(126);

  //Draw active boxes
  for (let cell = 0; cell < cells.length; cell++) {
    const team = cells[cell];
    const x = cell % cols;
    const y = Math.floor(cell / cols);
    fill(colors[team]);
    rect(w * x, h * y, w, h);
  }
}



function mouseClicked() {
  if (mouseX < 0 || mouseY < 0) return;
  const h = height / rows;
  const w = width / cols;
  const cell = Math.floor(mouseY / h) * cols + Math.floor(mouseX / w)
  cells[cell] = activeTeam;
  connection.send(JSON.stringify({action: "SET_CELL", cell, team: activeTeam}))
}

function tick(){
  connection.send(JSON.stringify({action: "TICK"}))
}

function changeTeam(e) {
  activeTeam = +e.value;
}

//Move this out to a separate file
let connection = new WebSocket("ws://localhost:3002");
function connect() {
  if (connection) {
    connection.close()
    connection = null;
  } else {
    connection = new WebSocket(document.querySelector("[name='ws']").value)
    connection.onopen = () => {
      document.querySelector("#status").textContent = "Disconnect"
        connection.onerror = (error) => {
        console.log(`WebSocket error: ${error}`)
      }
      
      connection.onmessage = (e) => {
        try{
          console.log("onmessage",e)
          const parsedAction = JSON.parse(e.data);
          const { action, cell, team } = parsedAction;
          if (action === "TICK") golTick();
          else if (action === "SET_CELL") {
            console.log("handling this from ws")
            cells[cell] = team;
          }
        }catch(e){}
      }
      
      connection.onclose = () => document.querySelector("#status").textContent = "Connect"
    }
  }
}