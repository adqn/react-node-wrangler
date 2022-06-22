import { createContext } from "react";
import { NodeDefinition } from "./baseNode";

const NodeViewContext = createContext<{
  nodeGroups: Array<NodeDefinition[]>;
  setNodeGroups: React.Dispatch<React.SetStateAction<NodeDefinition[][]>>;
}>({
  nodeGroups: [],
  setNodeGroups: () => null,
});

export { NodeViewContext };
