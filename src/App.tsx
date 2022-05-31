import React, { useState } from "react";
import { BaseNode, NodeDefinition } from "./nodes/abstractNode";
import { ConstantNode } from "./nodes/constantNode";
// import './App.css';
import { NodeView } from "./nodes/VisualNode";

const createNode = ({className, ...definition}: NodeDefinition) => {
  const nodeNameMap = {
    [ConstantNode.name]: ConstantNode,
  }

  const NodeClass = nodeNameMap[className];
  return new NodeClass(definition as any);
}

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
    // {
    //   title: "a <span>",
    //   hilighted: false,
    //   children: [],
    //   inputs: {
    //     innerHTML: {
    //       index: 0,
    //       attr: "c",
    //     },
    //     position: "absolute",
    //     left: "20px",
    //   },
    // },
  ])
  
  const nodes = nodeDefinitions.map(createNode);

  return (
    <div
      className="App"
      style={{
        height: "100%",
      }}
    >
      {/* {nodes?.map((node) => {
        return (
          node.inputs.innerHTML && (
            <span
              style={{
                display: "block",
                position: "relative",
                marginLeft: "5px",
                left:
                  getValue({
                    props: { inputs: { ...node.inputs }, nodes },
                    key: "left",
                  })[0] || 0,
                background: "none", // node.hilighted ? "lightgreen" : "none",
              }}
              dangerouslySetInnerHTML={{
                __html: `${
                  getValue({
                    props: { inputs: { ...node.inputs }, nodes },
                    key: "innerHTML",
                  })[0]
                }`,
              }}
            ></span>
          )
        );
      })} */}
      <NodeView
        nodes={nodes}
        setNodes={setNodes}
      />
    </div>
  );
};

export default App;
