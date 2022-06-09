import { createContext } from "react";

const NodeViewContext = createContext<{ height: number; heightDelta: number }>({
  height: 0,
  heightDelta: 0,
});

export { NodeViewContext };
