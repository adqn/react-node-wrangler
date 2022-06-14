import React, { useState, useEffect, useCallback } from "react";
import { BaseNode, NodeDefinition } from "../../nodes/baseNode";
import produce from "immer";

export interface boundingBoxes {
  [indexIoKey: string]: DOMRect;
}

export const WireOverlay = (props: {
  origin: any;
  nodeTo: BaseNode;
  inputKey: string;
  outputKey: string;
  boundingBoxes: boundingBoxes;
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  const [position, setPosition] = useState({
    x1: props.x1,
    y1: props.y1,
    x2: props.x2,
    y2: props.y2,
    coords: {},
  });
  const [dragging, setDragging] = useState<boolean>();
  const [isInput, setIsInput] = useState<boolean>();

  const getIndexAsJson = (indexIoKey: string) => {
    const arr = indexIoKey.split("-");
    const index = parseInt(arr[0]);
    return {
      index,
      node: props.nodes[index],
      io: arr[1],
      key: arr[2],
    };
  };

  const handleMouseMove = useCallback(
    (ev: any) => {
      setDragging(true);
      setPosition((position) => {
        //@ts-ignore
        const xDiff = position.coords.x - ev.pageX;
        //@ts-ignore
        const yDiff = position.coords.y - ev.pageY;
        if (isInput) {
          return {
            x1: position.x1 - xDiff,
            y1: position.y1 - yDiff,
            x2: props.x2,
            y2: props.y2,
            coords: {
              x: ev.pageX,
              y: ev.pageY,
            },
          };
        } else {
          return {
            x1: props.x1,
            y1: props.y1,
            x2: position.x2 - xDiff,
            y2: position.y2 - yDiff,
            coords: {
              x: ev.pageX,
              y: ev.pageY,
            },
          };
        }
      });
    },
    [props.x1, props.x2, props.y1, props.y2]
  );

  const handleMouseUp = () => {
    setDragging(false);
    setIsInput(false);
    document.removeEventListener("mousemove", handleMouseMove);
    setPosition({
      x1: props.x1,
      y1: props.y1,
      x2: props.x2,
      y2: props.y2,
      coords: position.coords,
    });
  };

  const handleMouseDown = (ev: any) => {
    const pageX = ev.pageX;
    const pageY = ev.pageY;
    setPosition((position) =>
      Object.assign({}, position, {
        coords: {
          x: pageX,
          y: pageY,
        },
      })
    );
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  useEffect(() => {
    if (dragging) {
      Object.entries(props.boundingBoxes)
        .filter(([key, value]) => {
          const xRange = [
            props.boundingBoxes[key].x - 10,
            props.boundingBoxes[key].x + 10,
          ];
          const yRange = [
            -props.origin.y + props.boundingBoxes[key].y - 10,
            -props.origin.y + props.boundingBoxes[key].y + 10,
          ];
          return (
            position.y2 >= yRange[0] &&
            position.y2 <= yRange[1] &&
            position.x2 >= xRange[0] &&
            position.x2 <= xRange[1]
          );
        })
        .forEach((boundingBox) => {
          const foundInput = getIndexAsJson(boundingBox[0]);
          const currentOutput = getIndexAsJson(props.outputKey);
          const currentInput = getIndexAsJson(props.inputKey);
          if (foundInput.node !== currentInput.node) {
            if (isInput) {
              props.setNodes(
                produce((nodeDefinitions) => {
                  nodeDefinitions[currentInput.index] = produce(
                    currentInput.node.getDefinition(),
                    (def) => {
                      def.inputs[currentInput.key] = "";
                    }
                  );
                  nodeDefinitions[foundInput.index] = produce(
                    foundInput.node.getDefinition(),
                    (def) => {
                      def.inputs[foundInput.key] = {
                        className: "wire",
                        index: currentOutput.index,
                        attr: currentOutput.key,
                      };
                    }
                  );
                })
              );
            }
          }
        });
    }
  }, [position, props.setNodes]);

  useEffect(() => {
    const updatedPosition = (["x1", "x2", "y1", "y2"] as const).some(
      (key) => position[key] !== props[key]
    );

    if (updatedPosition) {
      setPosition({
        x1: props.x1,
        y1: props.y1,
        x2: props.x2,
        y2: props.y2,
        coords: position.coords,
      });
    }
  }, [props.x1, props.x2, props.y1, props.y2]);

  return (
    <>
      <line
        id="visibleWire"
        x1={position.x1}
        y1={position.y1}
        x2={position.x2}
        y2={position.y2}
        stroke="green"
        strokeWidth="2"
      />
      <line
        id="wireSelection"
        x1={position.x1}
        y1={position.y1}
        x2={position.x2}
        y2={position.y2}
        stroke="green"
        strokeWidth="10"
        strokeOpacity={0}
        onMouseDown={(ev: any) => {
          setDragging(true);
          setIsInput(true);
          handleMouseDown(ev);
        }}
        pointerEvents="painted"
      />
      {/* <circle
        id="visibleSource"
        cx={position.x1}
        cy={position.y1}
        r="4"
        fill={dragging ? "darkviolet" : "green"}
      />
      <circle
        id="source"
        cx={position.x1}
        cy={position.y1}
        r="12"
        opacity={0}
        onMouseDown={(ev: any) => {
          setDragging(true);
          setIsInput(false);
          handleMouseDown(ev);
        }}
        pointerEvents="bounding-box"
      /> */}
      <circle
        id="visibleSink"
        cx={position.x2}
        cy={position.y2}
        r="4"
        fill={dragging ? "darkviolet" : "green"}
      />
      <circle
        id="sink"
        cx={position.x2}
        cy={position.y2}
        r="12"
        opacity={0}
        fill={dragging ? "darkviolet" : "green"}
        onMouseDown={(ev: any) => {
          setDragging(true);
          setIsInput(true);
          handleMouseDown(ev);
        }}
        pointerEvents="painted"
      />
    </>
  );
};

export const InputOverlay = (props: {
  origin: any;
  inputKey: string;
  boundingBoxes: boundingBoxes;
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  x1: number;
  y1: number;
}) => {
  const [position, setPosition] = useState({
    x1: props.x1,
    y1: props.y1,
    x2: props.x1,
    y2: props.y1,
    coords: {},
  });
  const [dragging, setDragging] = useState<boolean>();
  const [isOutput, setIsOutput] = useState<boolean>();

  const getIndexAsJson = (indexIoKey: string) => {
    const arr = indexIoKey.split("-");
    const index = parseInt(arr[0]);
    return {
      index,
      node: props.nodes[index],
      io: arr[1],
      key: arr[2],
    };
  };

  const handleMouseMove = useCallback(
    (ev: any) => {
      setDragging(true);
      setPosition((position) => {
        //@ts-ignore
        const xDiff = position.coords.x - ev.pageX;
        //@ts-ignore
        const yDiff = position.coords.y - ev.pageY;
        if (isOutput) {
          return {
            x1: position.x1 - xDiff,
            y1: position.y1 - yDiff,
            x2: props.x1,
            y2: props.y1,
            coords: {
              x: ev.pageX,
              y: ev.pageY,
            },
          };
        } else {
          return {
            x1: props.x1,
            y1: props.y1,
            x2: position.x2 - xDiff,
            y2: position.y2 - yDiff,
            coords: {
              x: ev.pageX,
              y: ev.pageY,
            },
          };
        }
      });
    },
    [props.x1, props.y1]
  );

  const handleMouseUp = () => {
    setDragging(false);
    setIsOutput(false);
    document.removeEventListener("mousemove", handleMouseMove);
    setPosition({
      x1: props.x1,
      y1: props.y1,
      x2: props.x1,
      y2: props.y1,
      coords: position.coords,
    });
  };

  const handleMouseDown = (ev: any) => {
    const pageX = ev.pageX;
    const pageY = ev.pageY;
    setPosition((position) =>
      Object.assign({}, position, {
        coords: {
          x: pageX,
          y: pageY,
        },
      })
    );
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  useEffect(() => {
    if (dragging) {
      Object.entries(props.boundingBoxes)
        .filter(([key, value]) => {
          const xRange = [
            props.boundingBoxes[key].x - 10,
            props.boundingBoxes[key].x + 10,
          ];
          const yRange = [
            -props.origin.y + props.boundingBoxes[key].y - 10,
            -props.origin.y + props.boundingBoxes[key].y + 10,
          ];
          return (
            position.y2 >= yRange[0] &&
            position.y2 <= yRange[1] &&
            position.x2 >= xRange[0] &&
            position.x2 <= xRange[1]
          );
        })
        .forEach((boundingBox) => {
          const foundOutput = getIndexAsJson(boundingBox[0]);
          const currentInput = getIndexAsJson(props.inputKey);
          if (foundOutput.node !== currentInput.node) {
            if (isOutput) {
              props.setNodes(
                produce((nodeDefinitions) => {
                  nodeDefinitions[currentInput.index] = produce(
                    currentInput.node.getDefinition(),
                    (def) => {
                      def.inputs[currentInput.key] = {
                        className: "wire",
                        index: foundOutput.index,
                        attr: foundOutput.key,
                      };
                    }
                  );
                })
              );
            }
          }
        });
    }
  }, [position, props.setNodes]);

  useEffect(() => {
    const updatedPosition = (["x1", "y1"] as const).some(
      (key) => position[key] !== props[key]
    );

    if (updatedPosition) {
      setPosition({
        x1: props.x1,
        y1: props.y1,
        x2: props.x1,
        y2: props.y1,
        coords: position.coords,
      });
    }
  }, [props.x1, props.y1]);

  return (
    <>
      <line
        x1={position.x1}
        y1={position.y1}
        x2={position.x2}
        y2={position.y2}
        stroke="green"
        strokeWidth="3"
      />
      {/* <circle
        id="source"
        cx={position.x1}
        cy={position.y1}
        r="10"
        onMouseDown={(ev: any) => {
          setIsOutput(false);
          handleMouseDown(ev)
        }}
        pointerEvents="bounding-box"
      /> */}
      <circle
        id="sink"
        cx={position.x2}
        cy={position.y2}
        r="5"
        fill="green"
        onMouseDown={(ev: any) => {
          setIsOutput(true);
          handleMouseDown(ev);
        }}
        pointerEvents="painted"
      />
    </>
  );
};
