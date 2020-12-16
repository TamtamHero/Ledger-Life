import "./App.css";
import React, { useState, useEffect } from "react";
import LedgerLife from "./controller/LedgerLife.js";

const ledgerLife = new LedgerLife();

function OwnerCell({ playerID, index, onSelection }) {
  const [isOwned, setOwned] = useState();
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    setOwned(playerID.toString() === "0" ? false : true);
    isOwned && setSelected(false);
  }, [isOwned, playerID]);
  return (
    <td>
      <div
        className="Cell"
        disabled={isOwned}
        style={{ background: isOwned ? "#000" : isSelected ? "#F00" : "#FFF" }}
        onClick={() => {
          if (!isOwned) {
            setSelected(true);
            onSelection(index);
          }
        }}
      ></div>
    </td>
  );
}

function OwnerGrid({ hidden, data, onSelection }) {
  let chunkLen = 32;
  let grid = [];
  for (let i = 0; i < data.length; i += chunkLen) {
    grid.push(data.slice(i, i + chunkLen));
  }
  return (
    <div className="OwnerGrid">
      <table>
        <tbody>
          {!hidden &&
            grid.map((cellRow, index_row) => (
              <tr key={index_row}>
                {cellRow.map((playerID, index_col) => (
                  <OwnerCell
                    key={index_col}
                    playerID={playerID}
                    index={index_row * cellRow.length + index_col}
                    onSelection={onSelection}
                  ></OwnerCell>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  function updateData() {
    return new Promise(async (resolve) => {
      console.log("hello");
      let data = await ledgerLife.getGrid();
      let players = await ledgerLife.getPlayers();
      console.log(data);
      console.log(data[0].toString());
      console.log(players);
      setOwnerGrid(data);
      resolve();
    });
  }

  useEffect(
    () =>
      ledgerLife
        .connect()
        .then(setConnected(true))
        .then(() => updateData()),
    [],
  );

  const [isConnected, setConnected] = useState(false);
  const [ownerGrid, setOwnerGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);

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
        <OwnerGrid
          hidden={!isConnected}
          data={ownerGrid}
          onSelection={(cellIndex) => setSelectedCells([...selectedCells, cellIndex])}
        ></OwnerGrid>
      </header>
    </div>
  );
}

export default App;

// ledgerLife.buyCells([index]).then((result) => {
