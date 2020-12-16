import React from "react";
import Shape from "./Shape.js";

const SidebarLeft = () => {
  return (
    <div className={"sidebar"}>
      <h1>{"shapes"}</h1>
      <div>
        <Shape name="block" />
        <Shape name="boat" />
        <Shape name="tub" />
        <Shape name="glider" />
        <Shape name="toad" />
      </div>
    </div>
  );
};

export default SidebarLeft;
