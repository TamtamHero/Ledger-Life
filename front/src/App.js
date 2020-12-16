import React, { useCallback, useState, useEffect } from "react";
import "./App.css";
import Grid from "./Grid.js";
import SidebarLeft from "./SidebarLeft.js";
import SidebarRight from "./SidebarRight.js";
import DebugBar from "./DebugBar.js";
import ProgressBars from "./ProgressBars.js";
import Simulation from "./Simulation.js";
import LedgerLife from "./controller/LedgerLife.js";

const ledgerLife = new LedgerLife();

function App() {
  const [isConnected, setConnected] = useState(false);
  const [simulationOffset, setSimulationOffset] = useState(0);
  const [ownerGrid, setOwnerGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const onClearCell = useCallback(
    (cell) => setSelectedCells(selectedCells.filter((c) => cell !== c)),
    [selectedCells],
  );
  const updateData = useCallback(() => {
    return new Promise(async (resolve) => {
      let data = await ledgerLife.getGrid();
      console.log(data);
      setOwnerGrid(data);
      resolve();
    });
  }, []);
  const onSimulateBack = useCallback(
    () => (simulationOffset > 0 ? setSimulationOffset(simulationOffset - 1) : null),
    [simulationOffset],
  );
  const onSimulateForward = useCallback(() => {
    setSimulationOffset(simulationOffset + 1);
  }, [simulationOffset]);

  useEffect(
    () =>
      ledgerLife
        .connect()
        .then(setConnected(true))
        .then(() => updateData()),
    [updateData],
  );

  return (
    <div className="App">
      <SidebarLeft />
      <div className="Content">
        <ProgressBars />
        <button
          onClick={() => {
            console.log(selectedCells);
            ledgerLife
              .buyCells(selectedCells)
              .then(() => updateData())
              .then(() => setSelectedCells([]));
          }}
        >
          {selectedCells.length ? "Buy selected cells" : "Select cells to buy"}
        </button>
        <button
          onClick={() => {
            ledgerLife.life().then(() => updateData());
          }}
        >
          life
        </button>
        <Grid
          hidden={!isConnected}
          data={ownerGrid}
          selectedCells={selectedCells}
          simulationOffset={simulationOffset}
          onSelection={(cellIndex) => setSelectedCells([...selectedCells, cellIndex])}
          onClearCell={onClearCell}
        ></Grid>
        <Simulation
          onSimulateBack={onSimulateBack}
          onSimulateForward={onSimulateForward}
          simulationOffset={simulationOffset}
        />
        <DebugBar>{JSON.stringify({ selectedCells })}</DebugBar>
      </div>
      <SidebarRight ownerGrid={ownerGrid} />
    </div>
  );
}

export default App;

// ledgerLife.buyCells([index]).then((result) => {
