import {
  BaseNode,
  NodeDefinition,
  NodeInputs,
  SinkDefinition,
} from "../baseNode";

export class HtmlNode extends BaseNode {
  validateInputs(): void {
    if (typeof this.inputs.html === "undefined") {
      throw Error("html must be a defined input");
    }
  }

  outputs() {
    return {};
  }

  render(_: number, nodes: BaseNode[]) {
    const { html } = this.computedInputs(nodes);
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
          __html: html,
        }}
      ></span>
    );
  }
}
