import { BaseNode, NodeInputs, SinkDefinition } from "../abstractNode";

export class ConstantNode extends BaseNode {
    inputs: {
        c: string | SinkDefinition;
    };

    constructor({title, inputs}: {title: string, inputs: NodeInputs}) {
        super({title, inputs});
        
        if (typeof inputs.c === 'object') {
            this.inputs = {
                c: inputs.c,
            }
        } else {
            this.inputs = {
                c: `${inputs.c || ""}`
            };
        }
    }

    outputs(nodes: BaseNode[]) {
        let constant = this.inputs.c;

        if (typeof constant === "object") {
            const node = nodes[constant.index];
            constant = node.getOutputValue(constant.attr, nodes);
        }

        return {
            string: constant,
            number: Number(constant),
        };
    }
}