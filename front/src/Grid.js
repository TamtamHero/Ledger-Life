import React, { useCallback, useState } from "react";
import Sketch from "react-p5";

const futurePurchaseColor = [0, 255, 0, 190];
const colors = [
  [200, 200, 200],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];

const Grid = ({ data, hidden, selectedCells, onSelection }) => {
  const width = 400;
  const height = 400;
  const rows = 32;
  const cols = 32;
  const death = "0x0000000000000000000000000000000000000000";
  const [colorMap, setColorMap] = useState({ [death]: [200, 200, 200] });

  const getColor = useCallback(
    (team) => {
      if (team in colorMap) return colorMap[team];
      const nextColor = colors.pop();
      setColorMap({ ...colorMap, [team]: nextColor });
      return nextColor;
    },
    [colorMap],
  );

  let setup = (p5, canvasParentRef) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
  };

  let draw = (p5) => {
    p5.background(0);
    const h = height / rows;
    const w = width / cols;
    // Draw grid
    for (let y = 1; y < rows; y++) {
      p5.line(0, y * h, width, y * h);
    }
    for (let x = 1; x < cols; x++) {
      p5.line(x * w, 0, x * w, height);
    }
    p5.stroke(126);

    //Draw active boxes
    for (let cell = 0; cell < data.length; cell++) {
      const team = data[cell];
      const x = cell % cols;
      const y = Math.floor(cell / cols);
      const color = selectedCells.includes(cell) ? futurePurchaseColor : getColor(team);
      p5.fill(color);
      p5.rect(w * x, h * y, w, h);
    }
  };

  let mouseClicked = (e) => {
    const h = height / rows;
    const w = width / cols;
    const cell = Math.floor(e.mouseY / h) * cols + Math.floor(e.mouseX / w);
    if (data[cell] !== death) {
      return;
    }
    onSelection(cell);
  };

  return hidden ? null : (
    <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} className="App" />
  );
};

export default Grid;
