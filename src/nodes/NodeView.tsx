import produce, { enablePatches, applyPatches, Patch } from "immer";
import React, { useEffect, useState, useCallback } from "react";
import { BaseNode, NodeDefinition, VisualNode, IO } from "./baseNode";

const SVGCanvas = (props: {
  children: any
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="2"
      className="WireOverlay"
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        bottom: 0,
        left: "0px",
      }}
      pointerEvents={"none"}
      >
      {props.children}
    </svg>
  )
}

const WireOverlay = (props: {
  origin: any,
  nodeTo: BaseNode,
  inputKey: string,
  outputKey: string,
  boundingBoxes: boundingBoxes,
  nodes: BaseNode[],
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>,
  x1: number,
  y1: number,
  x2: number,
  y2: number
}) => {
  const [position, setPosition] = useState({
    x1: props.x1,
    y1: props.y1,
    x2: props.x2,
    y2: props.y2,
    coords: {}
  })
  const [dragging, setDragging] = useState<boolean>();
  const [isInput, setIsInput] = useState<boolean>();

  const getIndexAsJson = (indexIoKey: string) => {
    const arr = indexIoKey.split("-");
    const index = parseInt(arr[0])
    return {
      index,
      node: props.nodes[index],
      io: arr[1],
      key: arr[2]
    };
  }

  const handleMouseMove = useCallback((ev: any) => {
    setPosition(position => {
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
            y: ev.pageY
          }
        }
      } else {
        return {
          x1: props.x1,
          y1: props.y1,
          x2: position.x2 - xDiff,
          y2: position.y2 - yDiff,
          coords: {
            x: ev.pageX,
            y: ev.pageY
          }
        }
      }
    })
  }, [props.x1, props.x2, props.y1, props.y2])

  const handleMouseUp = () => {
    setDragging(false);
    setIsInput(false);
    document.removeEventListener('mousemove', handleMouseMove);
    setPosition({
      x1: props.x1,
      y1: props.y1,
      x2: props.x2,
      y2: props.y2,
      coords: position.coords,
    });
  };

  const handleMouseDown = (ev: any) => {
    const pageX = ev.pageX
    const pageY = ev.pageY
    setPosition(position => 
      Object.assign({}, position, {
        coords: {
          x: pageX,
          y: pageY
        }
      })
    );
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, {once: true});
  }

  useEffect(() => {
    if (dragging) {
      Object.entries(props.boundingBoxes).filter(([key, value]) => {
        const xRange = [props.boundingBoxes[key].x - 10, props.boundingBoxes[key].x + 10];
        const yRange = [-props.origin.y + props.boundingBoxes[key].y - 10, -props.origin.y + props.boundingBoxes[key].y + 10];
        return position.y2 >= yRange[0] && position.y2 <= yRange[1]
          && position.x2 >= xRange[0] && position.x2 <= xRange[1];
      }).forEach((boundingBox) => {
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
                      index: currentOutput.index,
                      attr: currentOutput.key,
                    };
                  }
                );
              })
            );
          }
        }
      })
    }
  }, [position, props.setNodes])

  useEffect(() => {
    const updatedPosition = (['x1', 'x2', 'y1', 'y2'] as const).some((key) => position[key] !== props[key]);

    if (updatedPosition) {
      setPosition({
        x1: props.x1,
        y1: props.y1,
        x2: props.x2,
        y2: props.y2,
        coords: position.coords,
      })
    }
  }, [props.x1, props.x2, props.y1, props.y2])

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
          handleMouseDown(ev)
        }}
        pointerEvents="painted"
      />
      {/* <circle
        id="source"
        cx={position.x1}
        cy={position.y1}
        r="10"
        onMouseDown={(ev: any) => {
          setIsInput(false);
          handleMouseDown(ev)
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
  )
}

interface boundingBoxes {
  [indexIoKey: string]: DOMRect;
}

enablePatches();

export const NodeView = (props: {
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setRenderIndex: (index: number) => void;
}) => {
  const [boundingBoxes, setBoundingBoxes] = useState<boundingBoxes>({});
  const [nodeViewBoundingBox, setNodeViewBoundingBox] = useState<DOMRect | null>(null);
  const getIndexIoKey = ({ index, io, key }: { index: number, io: IO, key: string }) => `${index}-${io}-${key}`;

  const updates: Patch[] = [];
  const setBoundingBox = (index: number, io: IO, key: string, rect: DOMRect) => {
    const indexIoKey = getIndexIoKey({ index, io, key })
    const oldRect = boundingBoxes[indexIoKey];

    if (oldRect && oldRect.x === rect.x && oldRect.y === rect.y) {
      return;
    }

    const newBoundingBoxes = produce(
      applyPatches(boundingBoxes, updates),
      (boundingBoxes) => {
        boundingBoxes[indexIoKey] = rect;
      },
      (patches) => updates.push(...patches)
    )

    setBoundingBoxes(newBoundingBoxes);
  };

  return (
    <div
      className="NodeView"
      style={{
        // position: "absolute",
        // width: "100%",
        height: "100%",
        // bottom: "0px",
        borderTop: "2px solid grey",
        background: "lightgrey",
        overflow: "scroll",
      }}
      ref={(el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (nodeViewBoundingBox && nodeViewBoundingBox.x === rect.x && nodeViewBoundingBox.y === rect.y) {
          return;
        }
        setNodeViewBoundingBox(rect);
      }}
    >
      {props.nodes.map((node, index) => {
        return (
          <VisualNode
            key={`${index}`}
            index={index}
            title={node.title}
            nodes={props.nodes}
            setNodes={props.setNodes}
            setRenderIndex={props.setRenderIndex}
            setBoundingBox={setBoundingBox}
          />
        );
      })}
      <SVGCanvas>
        {props.nodes.map((node, index) => {
          return Object.entries(node.inputs).map(([key, value]) => {
            if (typeof value === 'object') {
              const outputKey = getIndexIoKey({ index: value.index, io: 'output', key: value.attr });
              const outRect = boundingBoxes[outputKey];
              const inputKey = getIndexIoKey({ index, io: 'input', key });
              const inRect = boundingBoxes[inputKey];

              if (outRect && inRect && nodeViewBoundingBox) {
                const x1 = -nodeViewBoundingBox.x + outRect.x + 3 + outRect.width / 2;
                const x2 = -nodeViewBoundingBox.x + inRect.x - 3 + inRect.width / 2;
                const y1 = -nodeViewBoundingBox.y + outRect.y - 1 + outRect.height / 2;
                const y2 = -nodeViewBoundingBox.y + inRect.y - 1 + inRect.height / 2;
                return <WireOverlay
                  key={`${inputKey}`}
                  origin={nodeViewBoundingBox}
                  nodeTo={node}
                  inputKey={inputKey}
                  outputKey={outputKey}
                  boundingBoxes={boundingBoxes}
                  nodes={props.nodes}
                  setNodes={props.setNodes}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                />;
              }
            }
            return null;
          })
        }).reduce((acc, curr) => {
          return acc.concat(curr).filter((el) => el !== null);
        }, [])}
      </SVGCanvas>
    </div>
  );
};
