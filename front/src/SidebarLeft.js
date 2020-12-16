import React from "react";
import Shape from "./Shape.js";

const SidebarLeft = () => {
  return (
    <div className={"sidebar"}>
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
