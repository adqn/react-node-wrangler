export interface ConstNodeAttrs {
  input: {
    c: string;
  };
  output: {
    string: string;
    number: number;
  };
}

export const logic = {
  input: {
    c: "string",
  },
  output: {
    string: "string",
    number: "number",
  },
  method: ({ c }: ConstNodeAttrs["input"]): ConstNodeAttrs["output"] => {
    return {
      string: c,
      number: Number(c),
    };
  },
};
