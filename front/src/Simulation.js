import React from "react";

const Simulation = ({ onSimulateBack, onSimulateForward, simulationOffset }) => {
  return (
    <>
      <div style={{ marginTop: 20 }} className={"simulator"}>
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
