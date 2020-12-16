import React, { useMemo } from "react";

const SidebarRight = ({ ownerGrid }) => {
  const board = useMemo(() => {
    let board = {};
    for (let i = 0; i < ownerGrid.length; i++) {
      board[ownerGrid[i]] = (board[ownerGrid[i]] || 0) + 1;
    }
    return board;
  }, [ownerGrid]);

  return (
    <div className="sidebar">
      <h1>{"leaderboard"}</h1>
      <div>
        {Object.keys(board).map((address) => (
          <div key={address} className="addressWrapper">
            <span className="cappedAddress">{address}</span>
            <span className="score">{board[address]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarRight;
