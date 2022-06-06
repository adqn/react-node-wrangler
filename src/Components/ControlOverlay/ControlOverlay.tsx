import React, { useState } from "react";
import { setSyntheticLeadingComments } from "typescript";
import { BaseNode, NodeDefinition } from "../../nodes/baseNode";
import { ConstantNode } from "../../nodes/constantNode";

const AddNode = (props: {
  nodes: NodeDefinition[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
}) => {
  const NewNode = {
    className: ConstantNode.name,
    title: "Untitled",
    inputs: {
      c: "",
    },
  };

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
      onClick={() => {
        const nodes = [...props.nodes, NewNode];
        props.setNodes(nodes);
      }}
    >
      +
    </div>
  );
};

export const ControlOverlay = (props: {
  nodes: NodeDefinition[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  nodeViewHeight: number | string;
}) => {
  const [height, setHeight] = useState<number | string>(props.nodeViewHeight);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        height: 30,
        width: 70,
        background: "black",
        opacity: 0.5,
        zIndex: 1,
      }}
    >
      <AddNode nodes={props.nodes} setNodes={props.setNodes} />
    </div>
  );
};
