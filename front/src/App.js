import React, { useCallback, useState, useEffect } from "react";
import "./App.css";
import Grid from "./Grid.js";
import LedgerLife from "./controller/LedgerLife.js";

const ledgerLife = new LedgerLife();

function App() {
  const [isConnected, setConnected] = useState(false);
  const [ownerGrid, setOwnerGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);

  const updateData = useCallback(() => {
    return new Promise(async (resolve) => {
      let data = await ledgerLife.getGrid();
      console.log(data);
      setOwnerGrid(data);
      resolve();
    });
  }, []);

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
      <header className="App-header">
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
          onSelection={(cellIndex) => setSelectedCells([...selectedCells, cellIndex])}
        ></Grid>
        <div>{JSON.stringify(selectedCells)}</div>
      </header>
    </div>
  );
}

export default App;

// ledgerLife.buyCells([index]).then((result) => {
