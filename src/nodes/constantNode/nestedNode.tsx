import produce from "immer";
import { Resizable } from "re-resizable";
import { useState, useContext } from "react";
import { BaseNode, NodeDefinition, NodeInputs } from "../baseNode";
import { AddNode, MultiplyNode } from "../calculationNode";
import { HtmlNode } from "../htmlNode";
import { NodeView } from "../NodeView";
import { ConstantNode } from "./constantNode";
import { ObjectNode } from "./objectNode";
import { PassThruNode } from "./passThruNode";
import { SpreadNode } from "./spreadNode";
import { NodeViewContext } from "../nodeView-context";

const createNode = ({ className, ...definition }: NodeDefinition) => {
  const nodeNameMap = {
    [ConstantNode.name]: ConstantNode,
    [AddNode.name]: AddNode,
    [MultiplyNode.name]: MultiplyNode,
    [HtmlNode.name]: HtmlNode,
    [ObjectNode.name]: ObjectNode,
    [SpreadNode.name]: SpreadNode,
    [PassThruNode.name]: PassThruNode,
  };

  const NodeClass = nodeNameMap[className];
  return new NodeClass(definition as any);
};

const NestedNodeRender = (props: {
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
}) => {
  const [renderIndex, setRenderIndex] = useState<number>(
    props.nodes.length - 1
  );
  const nodeViewHeight = useContext(NodeViewContext);

  return (
    <div
      className="NestedNode"
      // style={{
      //   display: "block",
      // }}
    >
      {props.nodes[renderIndex].render(
        renderIndex,
        props.nodes,
        props.setNodes
      )}
      <Resizable
        style={{
          position: "absolute",
          bottom: nodeViewHeight.height + 2,
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
      >
        <NodeView
          nodes={props.nodes}
          setNodes={props.setNodes}
          setRenderIndex={setRenderIndex}
        />
      </Resizable>
    </div>
  );
};

export class NestedNode extends BaseNode {
  validateInputs(): void {}

  attrs: NodeDefinition[];

  constructor({
    attrs,
    inputs,
    ...args
  }: {
    title: string;
    inputs: NodeInputs;
    attrs?: NodeDefinition[];
  }) {
    if (!attrs) {
      attrs = [
        {
          className: PassThruNode.name,
          title: "Input",
          inputs: {
            a: "",
          },
        },
        {
          className: PassThruNode.name,
          title: "Output",
          inputs: {
            d: {
              className: "wire",
              index: 0,
              attr: "a",
            },
          },
        },
        {
          className: ConstantNode.name,
          title: "Constant",
          inputs: {
            c: "1",
          },
        },
        {
          className: MultiplyNode.name,
          title: "Multiply",
          inputs: {
            a: 1,
            b: 2,
          },
        },
      ];
    }
    if (!Object.keys(inputs).length) {
      inputs = {
        ...attrs[0].inputs,
      };
    }
    super({ attrs, inputs, ...args });
    this.attrs = attrs;
  }

  getInternalNodes(nodes: BaseNode[]) {
    const attrs = produce(this.attrs, (attrs) => {
      attrs[0].inputs = { ...this.computedInputs(nodes) };
    });
    return attrs.map(createNode);
  }

  outputs(nodes: BaseNode[]) {
    const internalNodes = this.getInternalNodes(nodes);
    return internalNodes[1].outputs(internalNodes);
  }

  render(
    index: number,
    nodes: BaseNode[],
    setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>
  ): JSX.Element {
    const setNestedNodes: React.Dispatch<
      React.SetStateAction<NodeDefinition[]>
    > = (newAttrs) => {
      newAttrs =
        typeof newAttrs === "function" ? newAttrs(this.attrs) : newAttrs;
      const newDefinition = produce(this.getDefinition(), (nodeDefinition) => {
        nodeDefinition.attrs = newAttrs;
      });
      setNodes(
        produce((nodeDefinitions) => {
          nodeDefinitions[index] = newDefinition;
        })
      );
    };
    return (
      <NestedNodeRender
        nodes={this.getInternalNodes(nodes)}
        setNodes={setNestedNodes}
      />
    );
  }
}
