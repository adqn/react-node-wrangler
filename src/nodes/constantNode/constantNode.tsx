import { BaseNode } from "../baseNode";

export class ConstantNode extends BaseNode {
    validateInputs(): void {
        if (typeof this.inputs.c === 'undefined') {
            throw Error("c must be a defined input")
        }
    }
    outputs(nodes: BaseNode[]) {
        const constant = this.computedInputs(nodes).c;
        return {
            string: `${constant}`,
            number: Number(constant),
        };
    }
}