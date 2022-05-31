import React, { useState } from "react";
import { BaseNode, NodeDefinition } from "./nodes/abstractNode";
import { ConstantNode } from "./nodes/constantNode";
import { HtmlNode } from "./nodes/htmlNode";
// import './App.css';
import { NodeView } from "./nodes/VisualNode";

const createNode = ({ className, ...definition }: NodeDefinition) => {
  const nodeNameMap = {
    [ConstantNode.name]: ConstantNode,
    [HtmlNode.name]: HtmlNode,
  };

  const NodeClass = nodeNameMap[className];
  return new NodeClass(definition as any);
};

const App = () => {
  const [nodeDefinitions, setNodes] = useState<NodeDefinition[]>([
    {
      className: ConstantNode.name,
      title: "constant",
      inputs: {
        c: "foo bar",
      },
    },
    {
      className: ConstantNode.name,
      title: "constant sink",
      inputs: {
        c: {
          index: 0,
          attr: "string",
        },
      },
    },
    {
      className: HtmlNode.name,
      title: "html sink",
      inputs: {
        html: {
          index: 1,
          attr: "string",
        },
      },
    },
  ]);

  const nodes = nodeDefinitions.map(createNode);

  const [renderIndex, setRenderIndex] = useState<number>(nodes.length - 1);

  return (
    <div
      className="App"
      style={{
        height: "100%",
      }}
    >
      {nodes[renderIndex].render(renderIndex, nodes, setNodes)}
      <NodeView nodes={nodes} setNodes={setNodes} setRenderIndex={setRenderIndex} />
    </div>
  );
};

export default App;
