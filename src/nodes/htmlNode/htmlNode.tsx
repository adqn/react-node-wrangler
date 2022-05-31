import { BaseNode, NodeInputs, SinkDefinition } from "../abstractNode";

export class HtmlNode extends BaseNode {
  inputs: {
    html: string | SinkDefinition;
  };

  constructor({ title, inputs }: { title: string; inputs: NodeInputs }) {
    super({ title, inputs });

    if (typeof inputs.html === "object") {
      this.inputs = {
        html: inputs.html,
      };
    } else {
      this.inputs = {
        html: `${inputs.html || ""}`,
      };
    }
  }

  outputs() {
    return {};
  }
}
