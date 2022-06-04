import produce, { applyPatches, enablePatches, Patch } from "immer";
import React, { useState } from "react";
import Draggable from "react-draggable";

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

const SinkSourceIndicator = (props: {
  isFromSink: boolean
}) =>
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
      borderRadius: "50%"
    }}
  />

enablePatches();

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

  const [ioRefs, setIoRefs] = useState<{[key: string]: any}>({});
  const getIndexIoKey = ({ index, io, key }: { index: number, io: IO, key: string }) => `${index}-${io}-${key}`;
  const updates: Patch[] = [];
  const setIoRef = (index: number, io: IO, key: string, el: any) => {
    const indexIoKey = getIndexIoKey({ index, io, key })
    const oldRef = !!ioRefs[indexIoKey];

    if (oldRef) {
      return;
    }

    const newIoRefs = produce(applyPatches(ioRefs, updates), (ioRefs) => {ioRefs[indexIoKey] = el}, (patches) => updates.push(...patches));
    setIoRefs(newIoRefs);
    setBoundingBox(props.index, io, key, el.getBoundingClientRect());
  };

  return (
    <Draggable handle={`.handle`} onDrag={() => {
      Object.keys((node.inputs)).forEach((key) => {
        const io = "input"
        const indexIoKey = getIndexIoKey({index: props.index, io, key});
        const el = ioRefs[indexIoKey];
        setBoundingBox(props.index, io, key, el.getBoundingClientRect());
      })
      
      Object.keys(node.outputs(props.nodes)).forEach((key) => {
        const io = "output"
        const indexIoKey = getIndexIoKey({index: props.index, io, key});
        const el = ioRefs[indexIoKey];
        setBoundingBox(props.index, io, key, el.getBoundingClientRect());
      });
    }}>
      <div
        className="VisualNode"
        style={{
          position: "relative",
          display: "inline-block",
          // left: `${150 + (props.index * 5)}px`,
          minHeight: "150px",
          minWidth: "150px",
          border: "1px solid black",
          borderRadius: "5px",
          background: "white",
          zIndex: 0 
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
                key={getIndexIoKey({index: props.index, io: "input", key})}
                style={{
                  display: "block",
                }}
              >
                <span ref={(el) => {
                  if (!el) return;
                  setIoRef(props.index, 'input', key, el);
                }}><SinkSourceIndicator isFromSink={true} /></span> {key}:
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
                key={getIndexIoKey({index: props.index, io: "output", key})}
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
                    setIoRef(props.index, 'output', key, el);
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