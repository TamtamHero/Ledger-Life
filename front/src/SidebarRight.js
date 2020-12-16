import React from "react";

const SidebarRight = ({ players }) => {
  let _players = players.reduce((acc, {addr, cellCount})=>{acc[addr]=(acc[addr]||0)+parseInt(cellCount); return acc}, {});
  return (
    <div className="sidebar">
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
