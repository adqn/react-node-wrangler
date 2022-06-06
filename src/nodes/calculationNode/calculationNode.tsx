import { BaseNode, NodeOutputs } from "../baseNode";

abstract class CalculationNode extends BaseNode {
  validateInputs(nodes: BaseNode[]): void {
    const inputs = this.computedInputs(nodes);
    Object.values(inputs).forEach((input) => {
      if (typeof input !== "number") {
        throw Error("All inputs to calculations must be numbers");
      }
    });
  }
}

export class MultiplyNode extends CalculationNode {
  outputs(nodes: BaseNode[]): NodeOutputs {
    const inputs = this.computedInputs(nodes);

    return {
      product: Object.values(inputs).reduce((prev, curr) => prev * curr),
    };
  }
}

export class AddNode extends CalculationNode {
  outputs(nodes: BaseNode[]): NodeOutputs {
    const inputs = this.computedInputs(nodes);

    return {
      sum: Object.values(inputs).reduce((prev, curr) => prev + curr),
    };
  }
}
