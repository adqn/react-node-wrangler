import React from "react";
import { BaseNode, NodeDefinition, VisualNode } from "./baseNode";

export const NodeView = (props: {
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setRenderIndex: (index: number) => void;
}) => {
  return (
    <div
      className="NodeView"
      style={{
        position: "absolute",
        width: "100%",
        minHeight: "300px",
        bottom: "0px",
        borderTop: "1px solid black",
        background: "lightgrey",
        overflow: "scroll",
      }}
    >
      {props.nodes.map((node, index) => {
        return (
          <VisualNode
            index={index}
            title={node.title}
            nodes={props.nodes}
            setNodes={props.setNodes}
            setRenderIndex={props.setRenderIndex}
          />
        );
      })}
       <div
        className="WireOverlay"
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          pointerEvents: "none"
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        >
          <line x1="20" y1="20" x2="100" y2="100" stroke="green" stroke-width="2" />
        </svg>
      </div>
    </div>
  );
};
