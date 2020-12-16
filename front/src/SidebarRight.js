import React from "react";

const SidebarRight = ({ players, selectedCells, onBuy, onLife, onReset }) => {
  let _players = players.reduce((acc, { addr, cellCount }) => {
    acc[addr] = (acc[addr] || 0) + parseInt(cellCount);
    return acc;
  }, {});
  return (
    <div className="sidebar" onClick={() => (selectedCells.length ? onBuy : undefined)}>
      <div className={`${selectedCells.length ? "" : "disabled"} button`}>
        <span>{selectedCells.length ? "BUY" : "SELECT CELLS"}</span>
      </div>
      <div className={"button mtop"} onClick={onLife}>
        <span>{"UPDATE"}</span>
      </div>
      <div className={"button mtop"} onClick={onReset}>
        <span>{"RESET"}</span>
      </div>
      <br />
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
  );
};

export default SidebarRight;
