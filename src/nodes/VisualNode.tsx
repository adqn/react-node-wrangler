import React, { useState, useEffect } from "react";
import Draggable, { DraggableCore } from "react-draggable";
import { BaseNode, NodeDefinition, NodeInputs, NodeOutputs } from "./abstractNode";
  
export const VisualNode = (props: {
  index: number;
  title?: string;
  inputs: NodeInputs;
  nodes: Array<BaseNode>;
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
}) => {
  const node = props.nodes[props.index];
  const getNodes = () => {
    const newNodes = [...props.nodes.map((node) => node.getDefinition())];
    return newNodes;
  };

  const handleChange = (key: string, value: string) => {
    const newNodes = getNodes();
    const node = newNodes[props.index];
    node.inputs[key] = value;
    props.setNodes(newNodes);
  };

  const handleMouseOver = () => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index];
    node.hilighted = true;
    props.setNodes(newNodes);
  };

  const handleMouseOut = () => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index];
    node.hilighted = false;
    props.setNodes(newNodes);
  };

  useEffect(() => {
    // const setInput = async (callback: (args: any) => any) => {
    //   const input = await nodeOutput(callback)
    //   console.log(input())
    // }
    // setInput(testFunc)
  }, []);

  return (
    <Draggable handle={`.handle`}>
      <div
        className="VisualNode"
        style={{
          // position: "absolute",
          display: "inline-block",
          // left: `${150 + (props.index * 5)}px`,
          minHeight: "150px",
          minWidth: "150px",
          border: "1px solid black",
          borderRadius: "5px",
          background: "white",
        }}
        onMouseOver={() => handleMouseOver()}
        onMouseOut={() => handleMouseOut()}
      >
        <span
          className="handle"
          id="VisualNode header"
          style={{
            display: "block",
            borderBottom: "1px solid black",
          }}
        >
          {props.title}
        </span>
        <div>
          {Object.keys(props.inputs).map((key) => {
            const [defaultValue, isFromSink] = node.getInputValue(key, props.nodes);
            return (
              <span
                style={{
                  display: "block",
                }}
              >
                {key}:
                {isFromSink ? (
                  defaultValue
                ) : (
                  <input
                    type={"text"}
                    defaultValue={defaultValue}
                    // onChange={(ev) => {
                    //   setValue(ev.target.value);
                    // }}
                    //@ts-ignore
                    onKeyUp={(ev) => handleChange(key, ev.target.value)}
                  />
                )}
              </span>
            );
          })}
        </div>
        <div>
          {Object.entries(node.outputs(props.nodes)).map(([key, value]) => {
            return (
              <span
                style={{
                  display: "block",
                }}
              >
                {key}: {value}
              </span>
            );
          })}
        </div>
      </div>
    </Draggable>
  );
};

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
