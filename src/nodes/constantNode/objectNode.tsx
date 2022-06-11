import produce from "immer";
import React from "react";
import { BaseNode, NodeDefinition } from "../baseNode";

const ObjectNodeRender = (props: {
  index: number;
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
}) => {
  const node = props.nodes[props.index];
  const inputs = node.computedInputs(props.nodes);
  return (
    <div>
      {Object.entries(inputs).map(([key, value]) => {
        return (
          <div key={key}>
            {key}: {JSON.stringify(value)}{" "}
            <span
              onClick={() => {
                props.setNodes(
                  produce((nodeDefinitions) => {
                    nodeDefinitions[props.index] = produce(
                      props.nodes[props.index].getDefinition(),
                      (nodeDefinition) => {
                        delete nodeDefinition.inputs[key];
                      }
                    );
                  })
                );
              }}
            >
              Delete
            </span>
          </div>
        );
      })}
      <div>
        <input
          type="text"
          onKeyDown={(ev) => {
            if (ev.code === "Enter") {
              const target = ev.target as HTMLInputElement;
              const newKey = target.value;
              target.value = "";
              props.setNodes(
                produce((nodeDefinitions) => {
                  nodeDefinitions[props.index] = produce(
                    props.nodes[props.index].getDefinition(),
                    (nodeDefinition) => {
                      nodeDefinition.inputs[newKey] = "";
                    }
                  );
                })
              );
            }
          }}
        />{" "}
      </div>
    </div>
  );
};

export class ObjectNode extends BaseNode {
  validateInputs(): void {}

  outputs(nodes: BaseNode[]) {
    const obj = this.computedInputs(nodes);
    return {
      obj,
    };
  }

  render(
    index: number,
    nodes: BaseNode[],
    setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>
  ) {
    return <ObjectNodeRender index={index} nodes={nodes} setNodes={setNodes} />;
  }
}
