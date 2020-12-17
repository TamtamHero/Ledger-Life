import React, { useMemo, useCallback, useState, useEffect } from "react";
import "./App.css";
import Grid from "./Grid.js";
import SidebarLeft from "./SidebarLeft.js";
import SidebarRight from "./SidebarRight.js";
import DebugBar from "./DebugBar.js";
import ProgressBars from "./ProgressBars.js";
import AnimatedWave from "./AnimatedWave.js";
import Simulation from "./Simulation.js";
import LedgerLife from "./controller/LedgerLife.js";

const ledgerLife = new LedgerLife();

function App() {
  const [isConnected, setConnected] = useState(false);
  const [simulationOffset, setSimulationOffset] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [canUpdate, setCanUpdate] = useState(false);
  const onDone = useCallback(() => {
    setNonce(nonce + 1);
    setCanUpdate(true);
  }, [nonce]);
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
  const onLife = useCallback(() => {
    setCanUpdate(false);
    setNonce(nonce + 1);
    ledgerLife.life().then(() => updateData());
  }, [nonce, updateData]);
  const onReset = useCallback(() => {
    setSimulationOffset(0);
    setSelectedCells([]);
  }, []);
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

  let _players = useMemo(
    () =>
      players.reduce((acc, { addr, cellCount }) => {
        acc[addr] = (acc[addr] || 0) + parseInt(cellCount);
        return acc;
      }, {}),
    [players],
  );
  return (
    <div className="wrapper">
      <div className="wave">
        <AnimatedWave height={1000} color="#a9cec5" />
      </div>
      <div className="AppWrapper">
        <h1 className="header">{"Ledger Life"}</h1>
        <div className="App">
          <ProgressBars nonce={nonce} onDone={onDone} />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <SidebarLeft />
            <div className="Content">
              <Grid
                hidden={!isConnected}
                data={ownerGrid}
                selectedCells={selectedCells}
                simulationOffset={simulationOffset}
                onSelection={(cellIndex) => setSelectedCells([...selectedCells, cellIndex])}
                onClearCell={onClearCell}
              ></Grid>

              <DebugBar>{JSON.stringify({ selectedCells })}</DebugBar>
            </div>
            <SidebarRight
              players={players}
              canUpdate={canUpdate}
              selectedCells={selectedCells}
              onLife={onLife}
              onReset={onReset}
              onBuy={onBuy}
            />
          </div>
          <div className="Content">
            <Simulation
              onSimulateBack={onSimulateBack}
              onSimulateForward={onSimulateForward}
              simulationOffset={simulationOffset}
            />
          </div>
        </div>
        <div className="leaderboard">
          <h1>{"leaderboard"}</h1>
          <div>
            {Object.keys(_players).map((id) =>
              id === "0x0000000000000000000000000000000000000000" ? null : (
                <div key={id} className="addressWrapper">
                  <span className="cappedAddress">{id}</span>
                  <span className="score">{_players[id]}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// ledgerLife.buyCells([index]).then((result) => {
