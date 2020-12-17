import React, { useMemo, useCallback, useState } from "react";
import Sketch from "react-p5";

const Grid = ({ data, hidden, selectedCells, onSelection, onClearCell, simulationOffset }) => {
  const width = 660;
  const height = 660;
  const rows = 20;
  const cols = 20;
  const space = 6;
  const death = 0;
  const futurePurchase = "futurePurchase";

  const [colorMap, setColorMap] = useState({
    [death]: "#eaffd0",
    futurePurchase: "#7b5ab9",
  });

  const getNewCellState = useCallback((data, cell) => {
    const team = data[cell];
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
      [x + 1, y + 1],
    ];

    const aliveNeighbors = [];
    const aliveByTeam = {};
    for (let i = 0; i < rawNeighbors.length; i++) {
      const [x, y] = rawNeighbors[i];
      const ind = y * cols + x;
      if (x >= 0 && x < cols && y >= 0 && y < rows && data[ind] !== death) {
        aliveNeighbors.push(ind);
        aliveByTeam[data[ind]] = (aliveByTeam[data[ind]] || 0) + 1;
      }
    }
    if (aliveNeighbors.length === 3 && team === death) {
      for (let key in aliveByTeam) {
        if (aliveByTeam[key] >= 2) return key;
      }
    } //it was dead, bring to live
    if (aliveNeighbors.length >= 4) return death; //too crowded, we kill you
    if (aliveNeighbors.length >= 2) return team; //stay alive
    return death; //too lonely, suicide
  }, []);

  const compoundData = useMemo(() => {
    let compound = [...data];
    for (let i = 0; i < selectedCells.length; i++) {
      compound[selectedCells[i]] = futurePurchase;
    }
    for (let i = 0; i < simulationOffset; i++) {
      console.log("simulating offset");
      const cellsCopy = [];
      for (let cell = 0; cell < compound.length; cell++) {
        cellsCopy.push(getNewCellState(compound, cell));
      }
      compound = cellsCopy;
    }
    return compound;
  }, [data, getNewCellState, selectedCells, simulationOffset]);

  const getColor = useCallback(
    (team) => {
      if (team in colorMap) return colorMap[team];
      const nextColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      setColorMap({ ...colorMap, [team]: nextColor });
      return nextColor;
    },
    [colorMap],
  );

  let setup = (p5, canvasParentRef) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.fill("#00000000");
    p5.noStroke();
  };

  let draw = (p5) => {
    const w = (width - cols * space) / cols;
    const _h = height / rows;
    const _w = width / cols;
    // Draw grid
    // for (let y = 1; y < rows; y++) {
    //   p5.line(0, y * h, width, y * h);
    // }
    // for (let x = 1; x < cols; x++) {
    //   p5.line(x * w, 0, x * w, height);
    // }
    // p5.stroke(0);
    //Draw active boxes
    let activeCell = null;
    if (p5.mouseY > height || p5.mouseX > width || p5.mouseY < 0 || p5.mouseX < 0) {
    } else {
      activeCell = Math.floor(p5.mouseY / _h) * cols + Math.floor(p5.mouseX / _w);
    }
    for (let cell = 0; cell < compoundData.length; cell++) {
      const team = compoundData[cell];
      const x = cell % cols;
      const y = Math.floor(cell / cols);
      const color = activeCell === cell ? "#7b5ab9" : getColor(team);

      p5.fill("#654062");
      p5.strokeWeight(0);
      p5.circle(2 + _w * x + w / 2, 2 + _h * y + w / 2 + _h / 15, w);

      p5.fill(color);
      p5.strokeWeight(2);
      p5.stroke("#654062");
      p5.circle(2 + _w * x + w / 2, 2 + _h * y + w / 2, w);
    }
  };

  let mouseClicked = (e) => {
    const h = height / rows;
    const w = width / cols;
    if (e.mouseY > height || e.mouseX > width || e.mouseY < 0 || e.mouseX < 0) return;
    const cell = Math.floor(e.mouseY / h) * cols + Math.floor(e.mouseX / w);
    if (compoundData[cell] !== death) {
      if (compoundData[cell] === futurePurchase) {
        onClearCell(cell);
      }
      return;
    }
    if (simulationOffset) {
      alert("Go back to zero kid");
      return;
    }
    onSelection(cell);
  };

  return hidden ? null : (
    <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} className="App" />
  );
};

export default Grid;
