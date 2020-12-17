import React from "react";

export default ({ empty, color, onClick }) => {
  return <div className={`${empty?"empty":""} cell`} onClick={onClick} style={{ backgroundColor: color }} />;
};
