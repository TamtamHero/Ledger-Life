import React, { useState, useEffect } from "react";

const ProgressBars = ({ onDone, nonce }) => {
  const [className, setClassName] = useState();

  useEffect(() => setClassName("barProgress"), [nonce]);
  useEffect(() => {
    setTimeout(() => {
      setClassName("");
      onDone();
    }, 30000);
  }, [onDone]);

  return (
    <div key={nonce} className="progressBarWrapper">
      <div className="bar">
        <div className={className} />
      </div>
    </div>
  );
};

export default ProgressBars;
