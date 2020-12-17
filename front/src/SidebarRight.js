import React from "react";

const SidebarRight = ({ canUpdate, players, selectedCells, onBuy, onLife, onReset }) => {
  return (
    <div className="sidebar right">
      <div
        onClick={() => (selectedCells.length ? onBuy() : undefined)}
        className={`${selectedCells.length ? "" : "disabled"} button`}
      >
        <span>{selectedCells.length ? "BUY" : "SELECT"}</span>
      </div>
      <div
        className={`${!canUpdate ? "disabled" : ""} button mtop`}
        onClick={() => (canUpdate ? onLife() : undefined)}
      >
        <span>{`${canUpdate ? "UPDATE" : "..."}`}</span>
      </div>
      <div className={"button mtop"} onClick={onReset}>
        <span>{"RESET"}</span>
      </div>
      <br />
    </div>
  );
};

export default SidebarRight;
