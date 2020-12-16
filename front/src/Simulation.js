import React from "react";

const Simulation = ({ onSimulateBack, onSimulateForward, simulationOffset }) => {
  return (
    <>
    <h1>Simulation</h1>
    <div className={"simulator"}>
      <button onClick={onSimulateBack}>{"<<"}</button>
      <div>{simulationOffset}</div>
      <button onClick={onSimulateForward}>{">>"}</button>
    </div>
    </>
  );
};

export default Simulation;
