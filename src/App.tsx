import React, { useState, createContext, useContext } from "react";
import { Resizable } from "re-resizable";
import { NodeDefinition } from "./nodes/baseNode";
import { AddNode, MultiplyNode } from "./nodes/calculationNode";
import { ConstantNode } from "./nodes/constantNode";
import { HtmlNode } from "./nodes/htmlNode";
// import './App.css';
import { NodeView } from "./nodes/NodeView";
import { ObjectNode } from "./nodes/constantNode/objectNode";
import { SpreadNode } from "./nodes/constantNode/spreadNode";
import { NestedNode } from "./nodes/constantNode/nestedNode";
import { PassThruNode } from "./nodes/constantNode/passThruNode";
import { ControlOverlay } from "./Components/ControlOverlay";
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
    // {
    //   className: ConstantNode.name,
    //   title: "four",
    //   inputs: {
    //     c: 4,
    //   },
    // },
    // {
    //   className: AddNode.name,
    //   title: "Add",
    //   inputs: {
    //     a: {
    //       className: "wire",
    //       index: 0,
    //       attr: "number",
    //     },
    //     b: {
    //       className: "wire",
    //       index: 1,
    //       attr: "number",
    //     },
    //   },
    // },
    // {
    //   className: MultiplyNode.name,
    //   title: "Multiply",
    //   inputs: {
    //     x: {
    //       className: "wire",
    //       index: 0,
    //       attr: "number",
    //     },
    //     y: {
    //       className: "wire",
    //       index: 1,
    //       attr: "number",
    //     },
    //   },
    // },
    // {
    //   className: AddNode.name,
    //   title: "AddNested",
    //   inputs: {
    //     a: {
    //       className: "wire",
    //       index: 2,
    //       attr: "sum",
    //     },
    //     b: {
    //       className: "wire",
    //       index: 3,
    //       attr: "product",
    //     },
    //   },
    // },
    // {
    //   className: HtmlNode.name,
    //   title: "html sink",
    //   inputs: {
    //     html: "replace with wire",
    //   },
    // },
    // {
    //   className: HtmlNode.name,
    //   title: "html sink 2",
    //   inputs: {
    //     html: {
    //       className: "wire",
    //       index: 4,
    //       attr: "sum",
    //     },
    //   },
    // },
  ]);

  const nodes = nodeDefinitions.map(createNode);

  const [renderIndex, setRenderIndex] = useState<number>(nodes.length - 1);
  const [nodeViewHeight, setNodeViewHeight] = useState<number>(400);
  const [nodeViewHeightDelta, setNodeViewHeightDelta] = useState<number>(0);

  return (
    <div
      className="App"
      style={
        {
          // display: "block",
        }
      }
    >
      <NodeViewContext.Provider
        value={{
          height: nodeViewHeight,
          heightDelta: nodeViewHeightDelta,
        }}
      >
        {nodes[renderIndex].render(renderIndex, nodes, setNodes)}
        <ControlOverlay
          nodes={nodeDefinitions}
          setNodes={setNodes}
          nodeViewHeight={nodeViewHeight}
        />
        <Resizable
          style={{
            position: "absolute",
            bottom: "5px",
          }}
          defaultSize={{
            height: 400,
            width: 0,
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
