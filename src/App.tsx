import React, { useState, useContext } from "react";
import { Resizable } from "re-resizable";
import { NodeDefinition } from "./nodes/baseNode";
import { AddNode, MultiplyNode } from "./nodes/calculationNode";
import { ConstantNode } from "./nodes/constantNode";
import { HtmlNode } from "./nodes/htmlNode";
import { NodeView } from "./nodes/NodeView";
import { ObjectNode } from "./nodes/constantNode/objectNode";
import { SpreadNode } from "./nodes/constantNode/spreadNode";
import { NestedNode } from "./nodes/constantNode/nestedNode";
import { PassThruNode } from "./nodes/constantNode/passThruNode";
import "./App.css";
import { NodeViewContext } from "./nodes/nodeView-context";

const createNode = ({ className, ...definition }: NodeDefinition) => {
  const nodeNameMap = {
    [ConstantNode.name]: ConstantNode,
    [AddNode.name]: AddNode,
    [MultiplyNode.name]: MultiplyNode,
    [HtmlNode.name]: HtmlNode,
    [ObjectNode.name]: ObjectNode,
    [SpreadNode.name]: SpreadNode,
    [NestedNode.name]: NestedNode,
    [PassThruNode.name]: PassThruNode,
  };

  const NodeClass = nodeNameMap[className];
  return new NodeClass(definition as any);
};

const nodeGroup1: NodeDefinition[] = [
  {
    className: ConstantNode.name,
    title: "two",
    inputs: {
      c: 2,
    },
  },
  {
    className: NestedNode.name,
    title: "Nested POC",
    inputs: {},
  },
  {
    className: ObjectNode.name,
    title: "Object",
    inputs: {
      obj: {},
    },
  },
  {
    className: SpreadNode.name,
    title: "Spread",
    inputs: {
      obj: {},
    },
  },
];

const App = () => {
  const [nodeDefinitions, setNodes] = useState<NodeDefinition[]>(nodeGroup1);
  const [nodeGroups, setNodeGroups] = useState<NodeDefinition[][]>([
    nodeGroup1,
  ]);
  const [groupIndex, setGroupIndex] = useState<number>(nodeGroups.length - 1);
  const [renderIndex, setRenderIndex] = useState<number>(0);
  const [nodeViewHeights, setNodeViewHeights] = useState<number[]>([300]);
  const nodes = nodeGroups[groupIndex].map(createNode);

  return (
    <div
      className="App"
      style={{
        overflow: "hidden",
      }}
    >
      {nodes[renderIndex].render(renderIndex, nodes, setNodes, true)}
      <div
        className="NodeViewArea"
        style={{
          display: "block",
          position: "absolute",
          bottom: "0px",
          width: "100%",
        }}
      >
        <NodeViewContext.Provider
          value={{
            nodeGroups,
            setNodeGroups,
          }}
        >
          {nodeGroups.map((nodeGroup, index) => {
            const nodes = nodeGroup.map(createNode);
            return (
              <Resizable
                defaultSize={{
                  height: 300,
                  width: "100%",
                }}
                minWidth={"100%"}
                enable={{
                  top: true,
                  bottom: false,
                  right: false,
                  left: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topRight: false,
                  topLeft: false,
                }}
                onResize={(e, direction, ref, d) => {
                  const heights = [...nodeViewHeights];
                  heights[index] = ref.clientHeight;
                  setNodeViewHeights(heights);
                }}
              >
                <NodeView
                  nodeGroupIndex={index}
                  nodes={nodes}
                  setNodes={setNodes}
                  setNodeGroups={setNodeGroups}
                  setRenderIndex={setRenderIndex}
                  containerHeight={nodeViewHeights}
                />
              </Resizable>
            );
          })}
        </NodeViewContext.Provider>
      </div>
    </div>
  );
};

export default App;
