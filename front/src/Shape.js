import React, { useCallback } from "react";
import Sketch from "react-p5";

const definitions = {
  block: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  boat: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  tub: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  glider: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  toad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
};

const Shape = ({ name }) => {
  const height = 100;
  const width = 100;
  const cols = 5;
  const rows = 5;
  const setup = useCallback((p5, canvasParentRef) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
  }, []);

  const draw = useCallback(
    (p5) => {
      p5.background([255, 255, 255]);
      const h = height / rows;
      const w = width / cols;
      // Draw grid
      for (let y = 1; y < rows; y++) {
        p5.line(0, y * h, width, y * h);
      }
      for (let x = 1; x < cols; x++) {
        p5.line(x * w, 0, x * w, height);
      }
      p5.stroke(0);

      //Draw active boxes
      for (let cell = 0; cell < definitions[name].length; cell++) {
        const team = definitions[name][cell];
        const x = cell % cols;
        const y = Math.floor(cell / cols);
        const color = team ? [22, 22, 22] : [255, 255, 255];
        p5.fill(color);
        p5.rect(w * x, h * y, w, h);
      }
    },
    [name],
  );
  return <Sketch setup={setup} draw={draw} className="shape" />;
};

export default Shape;
