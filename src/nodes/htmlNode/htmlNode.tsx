import {
  BaseNode,
  NodeDefinition,
  NodeInputs,
  SinkDefinition,
} from "../abstractNode";

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

  render(_: number, nodes: BaseNode[]) {
    return (
      <span
        style={{
          display: "block",
          position: "relative",
          marginLeft: "5px",
          left: "0px",
          background: "none",
        }}
        dangerouslySetInnerHTML={{
          __html: this.getInputValue("html", nodes)[0],
        }}
      ></span>
    );
  }
}
