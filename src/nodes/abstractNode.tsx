export interface SinkDefinition {
  index: number;
  attr: string;
}

export interface NodeInputs {
  [key: string]:
    | undefined
    | number
    | string
    | SinkDefinition;
}

export interface NodeDefinition {
  className: string;
  title: string;
  inputs: NodeInputs;
}

type OutputValue = any;

export interface NodeOutputs {
    [key: string]: OutputValue;
  }
  
export abstract class BaseNode {
  title: string;
  inputs: NodeInputs;

  constructor({title, inputs}: {title: string, inputs: NodeInputs}) {
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

  abstract outputs(nodes: BaseNode[]): NodeOutputs;
  abstract getOutputValue(key: string, nodes: BaseNode[]): OutputValue;
}
