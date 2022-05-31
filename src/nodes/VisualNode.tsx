import React from "react";
import { BaseNode, NodeDefinition, NodeInputs, VisualNode } from "./abstractNode";

export const NodeView = (props: {
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
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
            inputs={node.inputs}
            nodes={props.nodes}
            setNodes={props.setNodes}
          />
        );
      })}
    </div>
  );
};
