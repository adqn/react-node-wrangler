import React, { useState } from "react";
import { Resizable } from 're-resizable';
import { NodeDefinition } from "./nodes/baseNode";
import { AddNode, MultiplyNode } from "./nodes/calculationNode";
import { ConstantNode } from "./nodes/constantNode";
import { HtmlNode } from "./nodes/htmlNode";
// import './App.css';
import { NodeView } from "./nodes/NodeView";

const createNode = ({ className, ...definition }: NodeDefinition) => {
  const nodeNameMap = {
    [ConstantNode.name]: ConstantNode,
    [AddNode.name]: AddNode,
    [MultiplyNode.name]: MultiplyNode,
    [HtmlNode.name]: HtmlNode,
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
      className: ConstantNode.name,
      title: "four",
      inputs: {
        c: 4,
      },
    },
    {
      className: AddNode.name,
      title: "Add",
      inputs: {
        a: {
          index: 0,
          attr: "number",
        },
        b: {
          index: 1,
          attr: "number",
        },
      },
    },
    {
      className: MultiplyNode.name,
      title: "Multiply",
      inputs: {
        x: {
          index: 0,
          attr: "number",
        },
        y: {
          index: 1,
          attr: "number",
        },
      },
    },
    {
      className: AddNode.name,
      title: "AddNested",
      inputs: {
        a: {
          index: 2,
          attr: "sum",
        },
        b: {
          index: 3,
          attr: "product",
        },
      },
    },
    {
      className: HtmlNode.name,
      title: "html sink",
      inputs: {
        html: {
          index: 4,
          attr: "sum",
        },
      },
    },
  ]);

  const nodes = nodeDefinitions.map(createNode);

  const [renderIndex, setRenderIndex] = useState<number>(nodes.length - 1);

  return (
    <div
      className="App"
    >
      {nodes[renderIndex].render(renderIndex, nodes, setNodes)}
    <Resizable
      style={{
        position: "absolute",
        bottom: "5px",
      }}
      defaultSize={{
        height: "400px",
        width: "0"
      }}
      minWidth={"100%"}
      bounds={"parent"}
    >
      <NodeView nodes={nodes} setNodes={setNodes} setRenderIndex={setRenderIndex} />
    </Resizable>
    </div>
  );
};

export default App;
