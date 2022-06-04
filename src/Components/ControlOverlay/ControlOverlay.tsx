import React, { useState } from 'react';

const AddNode = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: -9,
        left: 2,
        fontSize: "3em",
        color: "grey",
        opacity: 1,
        cursor: "pointer",
      }}
    >
      +
    </div>
  )
}

export const ControlOverlay = (props: {
  nodeViewHeight: number | string
}) => {
  const [height, setHeight] = useState<number | string>(props.nodeViewHeight);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        // marginBottom: -27,
        height: 30,
        width: 70,
        background: "black",
        opacity: .5,
        zIndex: 1,
      }}
    >
      <AddNode />
    </div>
  )
};
