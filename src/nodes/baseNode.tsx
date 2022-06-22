import produce, { enablePatches } from "immer";
import React from "react";
import Draggable from "react-draggable";

export interface SinkDefinition {
  className: "wire";
  index: number;
  attr: string;
}

type NonNestedJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: string | number | boolean | null };

export type Json =
  | string
  | number
  | boolean
  | null
  | NonNestedJson[]
  | { [key: string]: NonNestedJson };

export interface NodeInputs {
  [key: string]: Json | SinkDefinition;
}

export interface NodeDefinition {
  className: string;
  title: string;
  inputs: NodeInputs;
  attrs?: any;
}

type OutputValue = any;
export type IO = "input" | "output";

export interface NodeOutputs {
  [key: string]: OutputValue;
}

const SinkSourceIndicator = (props: { isFromSink: boolean }) => (
  <div
    style={{
      display: "inline-block",
      position: "relative",
      bottom: "2px",
      height: "8px",
      width: "8px",
      marginLeft: props.isFromSink ? "-5px" : "0px",
      marginRight: props.isFromSink ? "0px" : "-7px",
      backgroundColor: "green",
      borderRadius: "50%",
    }}
  />
);

enablePatches();

export const VisualNode = (props: {
  index: number;
  title: string;
  nodes: Array<BaseNode>;
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setRenderIndex?: (index: number) => void;
  setIoRef?: (index: number, io: IO, key: string, el: any) => void;
  updateBoundingBox?: (index: number, io: IO, key: string) => void;
}) => {
  const node = props.nodes[props.index];
  const setIoRef = props.setIoRef ? props.setIoRef : () => null;
  const updateBoundingBox = props.updateBoundingBox
    ? props.updateBoundingBox
    : () => null;

  // FIXME: In future, highlight bad type of input or missing inputs
  node.validateInputs(props.nodes);
  const handleChange = (key: string, value: string) => {
    props.setNodes(
      produce((nodeDefinitions) => {
        nodeDefinitions[props.index].inputs[key] = value;
      })
    );
  };

  const handleClick = () => {
    if (props.setRenderIndex) {
      props.setRenderIndex(props.index);
    }
  };

  const getIndexIoKey = ({
    index,
    io,
    key,
  }: {
    index: number;
    io: IO;
    key: string;
  }) => `${index}-${io}-${key}`;

  return (
    <Draggable
      handle={`.handle`}
      onDrag={() => {
        Object.keys(node.inputs).forEach((key) => {
          const io = "input";
          updateBoundingBox(props.index, io, key);
        });

        Object.keys(node.outputs(props.nodes)).forEach((key) => {
          const io = "output";
          updateBoundingBox(props.index, io, key);
        });
      }}
    >
      <div
        className="VisualNode"
        style={{
          position: "relative",
          display: "inline-block",
          left: `${props.index * 20}px`,
          minHeight: "150px",
          minWidth: "150px",
          border: "1px solid black",
          borderRadius: "5px",
          background: "white",
          zIndex: 0,
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
            const [defaultValue, isFromSink] = node.getInputValue(
              key,
              props.nodes
            );
            return (
              <span
                key={getIndexIoKey({ index: props.index, io: "input", key })}
                style={{
                  display: "block",
                  height: 20,
                }}
              >
                <span
                  ref={(el) => {
                    if (!el) return;
                    setIoRef(props.index, "input", key, el);
                  }}
                >
                  <SinkSourceIndicator isFromSink={true} />
                </span>{" "}
                {key}:
                {isFromSink || typeof defaultValue === "object" ? (
                  JSON.stringify(defaultValue)
                ) : (
                  <input
                    style={{
                      width: "60%",
                      marginLeft: "5px",
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
                key={getIndexIoKey({ index: props.index, io: "output", key })}
                style={{
                  display: "block",
                }}
              >
                {key}: {JSON.stringify(value)}
                <div
                  style={{
                    position: "absolute",
                    display: "inline-block",
                    right: "3px",
                  }}
                  ref={(el) => {
                    if (!el) return;
                    setIoRef(props.index, "output", key, el);
                  }}
                >
                  <SinkSourceIndicator isFromSink={false} />
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
  attrs?: any;
  abstract validateInputs(nodes: BaseNode[]): void;
  abstract outputs(nodes: BaseNode[]): NodeOutputs;

  constructor({
    title,
    inputs,
    attrs,
  }: {
    title: string;
    inputs: NodeInputs;
    attrs?: any;
  }) {
    this.title = title;
    this.inputs = inputs;
    this.attrs = attrs;
  }

  getDefinition(): NodeDefinition {
    const attrs: { attrs?: any } = {};
    if (this.attrs) {
      attrs.attrs = this.attrs;
    }
    return {
      className: this.constructor.name,
      title: this.title,
      inputs: this.inputs,
      ...attrs,
    };
  }

  isWire(value: Json | SinkDefinition): value is SinkDefinition {
    return (
      typeof value === "object" &&
      (value as SinkDefinition).className === "wire"
    );
  }

  getInputValue(key: string, nodes: BaseNode[]): [OutputValue, boolean] {
    let defaultValue = this.inputs[key];
    let isFromSink = false;

    if (this.isWire(defaultValue)) {
      isFromSink = true;
      const node = nodes[defaultValue.index];
      defaultValue = node.getOutputValue(defaultValue.attr, nodes);
    }

    return [defaultValue, isFromSink];
  }

  computedInputs(nodes: BaseNode[]) {
    return Object.keys(this.inputs)
      .map((key) => [key, this.getInputValue(key, nodes)[0]])
      .reduce((acc: NodeOutputs, [key, value]): NodeOutputs => {
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
  ): JSX.Element {
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
