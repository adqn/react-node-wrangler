import { BaseNode } from "../baseNode";

export class PassThruNode extends BaseNode {
  validateInputs(): void {}

  outputs(nodes: BaseNode[]) {
    return this.computedInputs(nodes);
  }
}
