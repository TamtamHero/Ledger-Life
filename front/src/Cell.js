import React from "react";

export default ({ empty, color, style, onClick }) => {
  return (
    <div
      className={`${empty ? "empty" : ""} cell`}
      onClick={onClick}
      style={{ ...(style || {}), backgroundColor: color }}
    />
  );
};
