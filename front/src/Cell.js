import React from "react"

export default ({color, onClick}) => {
  return <div className={"cell"} onClick={onClick} style={{backgroundColor:color}}/>
}
