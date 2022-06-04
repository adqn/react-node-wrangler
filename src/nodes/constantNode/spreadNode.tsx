import { BaseNode } from "../baseNode";

export class SpreadNode extends BaseNode {
  validateInputs(): void {}

  outputs(nodes: BaseNode[]) {
    const { obj } = this.computedInputs(nodes);
    return {
      ...obj,
    };
  }
}
