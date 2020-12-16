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
  const [nonce, setNonce] = useState(0);
  const onDone = useCallback(() => setNonce(nonce + 1), [nonce]);
  const [ownerGrid, setOwnerGrid] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const onClearCell = useCallback(
    (cell) => setSelectedCells(selectedCells.filter((c) => cell !== c)),
    [selectedCells],
  );
  const updateData = useCallback(() => {
    return new Promise(async (resolve) => {
      let data = await ledgerLife.getGrid();
      let players = await ledgerLife.getPlayers();
      setOwnerGrid(data);
      setPlayers(players);
      resolve();
    });
  }, []);
  const onSimulateBack = useCallback(
    () => (simulationOffset > 0 ? setSimulationOffset(simulationOffset - 1) : null),
    [simulationOffset],
  );
  const onLife = useCallback(() => ledgerLife.life().then(() => updateData()), [updateData]);
  const onReset = useCallback(() => setSelectedCells([]), []);
  const onSimulateForward = useCallback(() => {
    setSimulationOffset(simulationOffset + 1);
  }, [simulationOffset]);
  const onBuy = useCallback(
    () =>
      ledgerLife
        .buyCells(selectedCells)
        .then(() => updateData())
        .then(() => setSelectedCells([])),
    [selectedCells, updateData],
  );
  useEffect(
    () =>
      ledgerLife
        .connect()
        .then(setConnected(true))
        .then(() => updateData()),
    [updateData],
  );

  return (
    <>
      <h1 className="header">{"much wow"}</h1>
      <div className="App">
        <SidebarLeft />
        <div className="Content">
          <ProgressBars onDone={onDone} nonce={nonce} />

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
        <SidebarRight
          players={players}
          selectedCells={selectedCells}
          onLife={onLife}
          onReset={onReset}
          onBuy={onBuy}
        />
      </div>
    </>
  );
}

export default App;

// ledgerLife.buyCells([index]).then((result) => {
