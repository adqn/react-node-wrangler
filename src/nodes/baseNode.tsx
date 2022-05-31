import React, { useEffect } from "react";
import Draggable, { DraggableCore } from "react-draggable";

export interface SinkDefinition {
  index: number;
  attr: string;
}

export interface NodeInputs {
  [key: string]: undefined | number | string | SinkDefinition;
}

export interface NodeDefinition {
  className: string;
  title: string;
  inputs: NodeInputs;
}

type OutputValue = any;
export type IO = 'input' | 'output';

export interface NodeOutputs {
  [key: string]: OutputValue;
}

const SinkSourceIndicator = () => 
  <div
    style={{
      display: "inline-block",
      position: "relative",
      bottom: "2px",
      height: "5px",
      width: "5px",
      marginLeft: "5px",
      backgroundColor: "green",
      borderRadius: "50%"
    }}
  />

export const VisualNode = (props: {
  index: number;
  title: string;
  nodes: Array<BaseNode>;
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setRenderIndex?: (index: number) => void;
  setBoundingBox?: (index: number, io: IO, key: string, rect: DOMRect) => void;
}) => {
  const node = props.nodes[props.index];
  const setBoundingBox = props.setBoundingBox ? props.setBoundingBox : () => null;

  // FIXME: In future, highlight bad type of input or missing inputs
  node.validateInputs(props.nodes);
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

  const handleClick = () => {
    if (props.setRenderIndex) {
      props.setRenderIndex(props.index);
    }
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
        onClick={() => handleClick()}
      >
        <span
          className="handle"
          id="VisualNode header"
          style={{
            display: "block",
            textAlign: "center",
            borderBottom: "1px solid black",
          }}
        >
          {props.title}
        </span>
        <div>
          {Object.keys(node.inputs).map((key) => {
            const [defaultValue, isFromSink] = node.getInputValue(key, props.nodes);
            return (
              <span
                style={{
                  display: "block",
                }}
              >
                <span ref={(el) => {
                  if (!el) return;
                  setBoundingBox(props.index, 'input', key, el.getBoundingClientRect());
                }}><SinkSourceIndicator /></span> {key}:
                {isFromSink ? (
                  defaultValue
                ) : (
                  <input
                    style={{
                      width: "60%",
                      marginLeft: "5px"
                    }}
                    type={"text"}
                    defaultValue={defaultValue}
                    //@ts-ignore
                    onKeyUp={(ev) => handleChange(key, ev.target.value)}
                    onClick={(e) => e.stopPropagation()}
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
                <div
                  style={{
                    position: "absolute",
                    display: "inline-block",
                    right: "3px"
                  }}
                  ref={(el) => {
                    if (!el) return;
                    setBoundingBox(props.index, 'output', key, el.getBoundingClientRect());
                  }}
                >
                  <SinkSourceIndicator />
                </div>
              </span>
            );
          })}
        </div>
      </div>
    </Draggable>
  );
};

export abstract class BaseNode {
  title: string;
  inputs: NodeInputs;
  abstract validateInputs(nodes: BaseNode[]): void;
  abstract outputs(nodes: BaseNode[]): NodeOutputs;

  constructor({ title, inputs }: { title: string; inputs: NodeInputs }) {
    this.title = title;
    this.inputs = inputs;
  }

  getDefinition(): NodeDefinition {
    return {
      className: this.constructor.name,
      title: this.title,
      inputs: this.inputs,
    };
  }

  getInputValue(key: string, nodes: BaseNode[]): [OutputValue, boolean] {
    let defaultValue = this.inputs[key];
    let isFromSink = false;

    if (typeof defaultValue === "object") {
      isFromSink = true;
      const node = nodes[defaultValue.index];
      defaultValue = node.getOutputValue(defaultValue.attr, nodes);
    }

    return [defaultValue, isFromSink];
  }

  computedInputs(nodes: BaseNode[]) {
    return Object.keys(this.inputs).map((key) => [key, this.getInputValue(key, nodes)[0]]).reduce((acc: NodeOutputs, [key, value]): NodeOutputs => {
      acc[key] = value;
      return acc;
    }, {});
  }

  getOutputValue(key: string, nodes: BaseNode[]) {
    const outputs = this.outputs(nodes);

    return outputs[key as keyof typeof outputs];
  }

  render(
    index: number,
    nodes: BaseNode[],
    setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>
  ) {
    return (
      <VisualNode
        index={index}
        title={this.title}
        nodes={nodes}
        setNodes={setNodes}
      />
    );
  }
}
