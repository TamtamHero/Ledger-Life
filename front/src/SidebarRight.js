import React from "react";

const SidebarRight = ({ players }) => {
  return (
    <div className="sidebar">
      <h1>{"leaderboard"}</h1>
      <div>
        {Object.keys(players).map((id) =>
          id === "0x0000000000000000000000000000000000000000" ? null : (
            <div key={id} className="addressWrapper">
              <span className="cappedAddress">{id}</span>
              <span className="score">{players[id]}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default SidebarRight;
