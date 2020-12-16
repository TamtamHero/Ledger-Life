import React from "react";

const Simulation = ({ onSimulateBack, onSimulateForward, simulationOffset }) => {
  return (
    <>
      <h1 style={{ marginTop: 20 }}>Simulation</h1>
      <div className={"simulator"}>
        <div className={"button"} onClick={onSimulateBack}>
          {"<<"}
        </div>
        <div className={"offset"}>{simulationOffset}</div>
        <div className={"button"} onClick={onSimulateForward}>
          {">>"}
        </div>
      </div>
    </>
  );
};

export default Simulation;
