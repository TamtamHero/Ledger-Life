import React, { useMemo, useCallback, useState } from "react";
import Cell from "./Cell.js";

const Grid = ({ data, hidden, selectedCells, onSelection, onClearCell, simulationOffset }) => {
  const rows = 15;
  const cols = 15;
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

  let cellClicked = (cell) => {
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
  return <div className={"grid"}>
    {compoundData.map((cell, index)=><Cell key={index} color={getColor(cell)} onClick={()=>cellClicked(index)}/>)}
  </div>
};

export default Grid;
