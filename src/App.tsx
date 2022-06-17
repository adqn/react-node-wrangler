import React, { useState } from "react";
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
import { NodeViewContext } from "./nodes/nodeView-context";
import "./App.css";

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

const App = () => {
  const [nodeDefinitions, setNodes] = useState<NodeDefinition[]>([
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
  ]);

  const [nodeGroups, setNodeGroups] = useState<NodeDefinition[][]>();

  const nodes = nodeDefinitions.map(createNode);

  const [renderIndex, setRenderIndex] = useState<number>(nodes.length - 1);
  const [nodeViewHeight, setNodeViewHeight] = useState<number>(300);
  const [nodeViewHeightDelta, setNodeViewHeightDelta] = useState<number>(0);

  return (
    <div
      className="App"
      style={{
        // display: "block",
        overflow: "hidden",
      }}
    >
      <NodeViewContext.Provider
        value={{
          height: nodeViewHeight,
          heightDelta: nodeViewHeightDelta,
        }}
      >
        {nodes[renderIndex].render(renderIndex, nodes, setNodes)}
        <Resizable
          style={{
            position: "absolute",
            bottom: "0px",
          }}
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
            setNodeViewHeight(ref.clientHeight);
            setNodeViewHeightDelta(d.height);
          }}
        >
          <NodeView
            nodes={nodes}
            setNodes={setNodes}
            setRenderIndex={setRenderIndex}
          />
        </Resizable>
      </NodeViewContext.Provider>
    </div>
  );
};

export default App;
